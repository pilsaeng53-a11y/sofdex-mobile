import React, { useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_OPTS = {
  layout: {
    background:  { color: '#0a0e1a' },
    textColor:   '#94a3b8',
    fontSize:    11,
    fontFamily:  "'Inter', -apple-system, sans-serif",
  },
  grid: {
    vertLines: { color: 'rgba(148,163,184,0.05)' },
    horzLines: { color: 'rgba(148,163,184,0.05)' },
  },
  crosshair: {
    mode: 1,
    vertLine: { color: 'rgba(0,212,170,0.4)', labelBackgroundColor: '#0f1525' },
    horzLine: { color: 'rgba(0,212,170,0.4)', labelBackgroundColor: '#0f1525' },
  },
  rightPriceScale: {
    borderColor: 'rgba(148,163,184,0.08)',
    textColor:   '#64748b',
  },
  timeScale: {
    borderColor:      'rgba(148,163,184,0.08)',
    textColor:        '#64748b',
    timeVisible:      true,
    secondsVisible:   false,
    fixLeftEdge:      true,
    fixRightEdge:     true,
  },
  handleScroll:    true,
  handleScale:     true,
};

const CANDLE_STYLE = {
  upColor:          '#22c55e',
  downColor:        '#475569',
  borderUpColor:    '#22c55e',
  borderDownColor:  '#475569',
  wickUpColor:      '#22c55e',
  wickDownColor:    '#64748b',
};

function toChartCandles(raw = []) {
  const seen = new Set();
  return raw
    .map(c => {
      const t = c.time ?? c.timestamp;
      const ts = typeof t === 'number'
        ? (t > 1e10 ? Math.floor(t / 1000) : t)   // ms → s if needed
        : Math.floor(new Date(t).getTime() / 1000);
      return { time: ts, open: +c.open, high: +c.high, low: +c.low, close: +c.close };
    })
    .filter(c => {
      if (!isFinite(c.time) || !isFinite(c.open)) return false;
      if (seen.has(c.time)) return false;
      seen.add(c.time);
      return true;
    })
    .sort((a, b) => a.time - b.time);
}

/**
 * CandleChart
 * Props:
 *  candles       — array from useFuturesMarket
 *  liveCandle    — single live candle {time,open,high,low,close} (updated via WS)
 *  loading       — bool
 *  lastPrice     — number (for price line)
 *  symbol        — display string
 *  interval      — display string
 */
export default function CandleChart({ candles = [], liveCandle, loading = false, lastPrice, symbol, interval }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);
  const lineRef      = useRef(null);
  const roRef        = useRef(null);

  // ── Create chart once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width:  containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    const series = chart.addCandlestickSeries(CANDLE_STYLE);
    chartRef.current  = chart;
    seriesRef.current = series;

    // Responsive resize
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      chart.timeScale().fitContent();
    });
    ro.observe(containerRef.current);
    roRef.current = ro;

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
      lineRef.current   = null;
    };
  }, []);

  // ── Update full candle dataset ────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || loading) return;
    const data = toChartCandles(candles);
    if (!data.length) return;
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles, loading]);

  // ── Stream live candle updates (update last / append new) ──────────
  useEffect(() => {
    if (!seriesRef.current || !liveCandle) return;
    seriesRef.current.update(liveCandle);
  }, [liveCandle]);

  // ── Update live price line ─────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || lastPrice == null) return;
    if (lineRef.current) {
      seriesRef.current.removePriceLine(lineRef.current);
    }
    lineRef.current = seriesRef.current.createPriceLine({
      price:       lastPrice,
      color:       'rgba(0,212,170,0.7)',
      lineWidth:   1,
      lineStyle:   2, // dashed
      axisLabelVisible: true,
      title:       '',
    });
  }, [lastPrice]);

  return (
    <div className="relative w-full h-full bg-[#0a0e1a]">
      {/* Chart header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-3 py-2 pointer-events-none">
        <span className="text-[11px] font-black text-white tracking-wide">{symbol}</span>
        <span className="text-[10px] text-slate-500">{interval}</span>
        {lastPrice != null && (
          <span className="text-[11px] font-mono font-bold text-[#00d4aa]">
            {lastPrice.toFixed(lastPrice > 1000 ? 2 : lastPrice > 10 ? 3 : 5)}
          </span>
        )}
        {loading && (
          <span className="text-[9px] text-slate-600 animate-pulse ml-auto">Loading…</span>
        )}
      </div>

      {/* Canvas container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Empty state */}
      {!loading && candles.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <span className="text-base">📊</span>
          </div>
          <p className="text-[11px] text-slate-600">No candle data available</p>
        </div>
      )}
    </div>
  );
}