import React, { useEffect, useRef } from 'react';
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
    borderColor:    'rgba(148,163,184,0.08)',
    textColor:      '#64748b',
    timeVisible:    true,
    secondsVisible: false,
    fixLeftEdge:    true,
    fixRightEdge:   true,
  },
  handleScroll: true,
  handleScale:  true,
};

const CANDLE_STYLE = {
  upColor:         '#22c55e',
  downColor:       '#ef4444',
  borderUpColor:   '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor:     '#22c55e',
  wickDownColor:   '#ef4444',
};

/**
 * Normalize raw candle array → lightweight-charts format.
 * Handles ms timestamps, ISO strings, and unix seconds.
 * Deduplicates by time and sorts ascending.
 */
function toChartCandles(raw = []) {
  const seen = new Set();
  return raw
    .map(c => {
      const t = c.time ?? c.timestamp;
      let ts;
      if (typeof t === 'number') {
        ts = t > 1e10 ? Math.floor(t / 1000) : Math.floor(t); // ms → s
      } else if (typeof t === 'string') {
        const ms = new Date(t).getTime();
        ts = isNaN(ms) ? null : Math.floor(ms / 1000);
      } else {
        ts = null;
      }
      const open  = parseFloat(c.open);
      const high  = parseFloat(c.high);
      const low   = parseFloat(c.low);
      const close = parseFloat(c.close);
      return { time: ts, open, high, low, close };
    })
    .filter(c => {
      if (c.time == null || !isFinite(c.time)) return false;
      if (!isFinite(c.open) || !isFinite(c.close)) return false;
      if (seen.has(c.time)) return false;
      seen.add(c.time);
      return true;
    })
    .sort((a, b) => a.time - b.time);
}

/**
 * CandleChart
 * Props:
 *  candles    — raw array from useFuturesMarket
 *  liveCandle — single live candle updated via WS
 *  loading    — bool
 *  lastPrice  — number (for price line)
 *  symbol     — display string
 *  interval   — display string
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

    const w = containerRef.current.clientWidth  || 600;
    const h = containerRef.current.clientHeight || 300;
    console.log('[CandleChart] Init — container size:', w, 'x', h);

    let chart, series;
    try {
      chart  = createChart(containerRef.current, { ...CHART_OPTS, width: w, height: h });
      series = chart.addCandlestickSeries(CANDLE_STYLE);
      console.log('[CandleChart] Chart + series created OK');
    } catch (e) {
      console.error('[CandleChart] Init FAILED:', e);
      return;
    }

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

  // ── Update full candle dataset when candles prop changes ──────────
  useEffect(() => {
    console.log('[CandleChart] candles prop updated — symbol:', symbol, '| interval:', interval, '| raw count:', candles.length, '| loading:', loading);
    if (!seriesRef.current || loading) return;

    const data = toChartCandles(candles);
    console.log('[CandleChart] After toChartCandles — valid count:', data.length, '| first:', data[0], '| last:', data[data.length - 1]);

    if (!data.length) {
      console.warn('[CandleChart] No valid candles to render — setData skipped');
      return;
    }

    try {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
      console.log('[CandleChart] setData OK ✓');
    } catch (e) {
      console.error('[CandleChart] setData FAILED:', e);
    }
  }, [candles, loading]);

  // ── Stream live candle updates ─────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !liveCandle) return;
    try {
      seriesRef.current.update(liveCandle);
    } catch (e) {
      console.error('[CandleChart] live update FAILED:', e);
    }
  }, [liveCandle]);

  // ── Update live price line ─────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || lastPrice == null) return;
    try {
      if (lineRef.current) seriesRef.current.removePriceLine(lineRef.current);
      lineRef.current = seriesRef.current.createPriceLine({
        price:            lastPrice,
        color:            'rgba(0,212,170,0.7)',
        lineWidth:        1,
        lineStyle:        2,
        axisLabelVisible: true,
        title:            '',
      });
    } catch { /* ignore */ }
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

      {/* Canvas container — must fill parent */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Empty state (only show after load attempt) */}
      {!loading && candles.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span className="text-2xl">📊</span>
          <p className="text-[11px] text-slate-600">No candle data — check console for details</p>
        </div>
      )}
    </div>
  );
}