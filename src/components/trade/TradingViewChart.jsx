import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getTVSymbol } from '../shared/symbolMap';

const TIMEFRAMES = [
  { label: '1m',  value: '1'   },
  { label: '5m',  value: '5'   },
  { label: '15m', value: '15'  },
  { label: '1h',  value: '60'  },
  { label: '4h',  value: '240' },
  { label: '1D',  value: 'D'   },
];

export default function TradingViewChart({ symbol = 'SOL', height = 340 }) {
  const containerRef  = useRef(null);
  const widgetRef     = useRef(null);
  const [interval, setIntervalVal] = useState('60');
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState(false);

  // Stable unique container id per mount
  const containerId = useRef(`tv_${Math.random().toString(36).slice(2)}`).current;

  // Resolve the TradingView symbol — never fall back to market cap
  // For illiquid RWA with no public TV feed, we show a valuation note instead of wrong chart
  const tvSymbol = getTVSymbol(symbol);
  const noChartAvailable = tvSymbol === null;

  const buildWidget = useCallback(() => {
    if (noChartAvailable || !window.TradingView || !containerRef.current) return;
    // Always clear previous widget DOM before rebuilding
    if (widgetRef.current) {
      try { widgetRef.current.remove?.(); } catch { /* ignore */ }
      widgetRef.current = null;
    }
    containerRef.current.innerHTML = '';
    setError(false);

    try {
      widgetRef.current = new window.TradingView.widget({
        container_id:        containerId,
        symbol:              tvSymbol,
        interval,
        width:               '100%',
        height,
        theme:               'dark',
        style:               '1',           // Candlestick
        locale:              'en',
        toolbar_bg:          '#0a0e1a',
        hide_top_toolbar:    false,
        hide_side_toolbar:   true,
        allow_symbol_change: false,
        enable_publishing:   false,
        withdateranges:      false,
        save_image:          false,
        backgroundColor:     '#0a0e1a',
        gridColor:           'rgba(148,163,184,0.04)',
        autosize:            false,
        overrides: {
          'paneProperties.background':                          '#0a0e1a',
          'paneProperties.backgroundType':                      'solid',
          'paneProperties.vertGridProperties.color':            'rgba(148,163,184,0.04)',
          'paneProperties.horzGridProperties.color':            'rgba(148,163,184,0.04)',
          'scalesProperties.textColor':                         '#64748b',
          'scalesProperties.lineColor':                         'rgba(148,163,184,0.08)',
          'mainSeriesProperties.candleStyle.upColor':           '#22c55e',
          'mainSeriesProperties.candleStyle.downColor':         '#ef4444',
          'mainSeriesProperties.candleStyle.borderUpColor':     '#22c55e',
          'mainSeriesProperties.candleStyle.borderDownColor':   '#ef4444',
          'mainSeriesProperties.candleStyle.wickUpColor':       '#22c55e',
          'mainSeriesProperties.candleStyle.wickDownColor':     '#ef4444',
          'mainSeriesProperties.showPriceLine':                 true,
        },
        onChartReady: () => {
          setLoading(false);
        },
      });
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [tvSymbol, interval, height, containerId, noChartAvailable]);

  // When symbol or interval changes: clear DOM + reset loading flag immediately
  useEffect(() => {
    if (noChartAvailable) return;
    setLoading(true);
    setError(false);
    if (widgetRef.current) {
      try { widgetRef.current.remove?.(); } catch { /* ignore */ }
      widgetRef.current = null;
    }
    if (containerRef.current) containerRef.current.innerHTML = '';
  }, [tvSymbol, interval, noChartAvailable]);

  // Load TV script once, then rebuild whenever tvSymbol or interval change
  useEffect(() => {
    if (noChartAvailable) return;
    if (window.TradingView) {
      buildWidget();
      return;
    }
    // Check if script already in DOM (concurrent mounts)
    if (document.querySelector('script[src*="tv.js"]')) {
      const check = setInterval(() => {
        if (window.TradingView) { clearInterval(check); buildWidget(); }
      }, 100);
      return () => clearInterval(check);
    }
    const script   = document.createElement('script');
    script.src     = 'https://s3.tradingview.com/tv.js';
    script.async   = true;
    script.onload  = buildWidget;
    script.onerror = () => { setError(true); setLoading(false); };
    document.head.appendChild(script);
  }, [tvSymbol, interval, buildWidget]);

  // No public TradingView feed — SOF (DEX-only) or illiquid RWA
  if (noChartAvailable) {
    const isSOF = symbol === 'SOF';
    const RAYDIUM_URL = `https://raydium.io/swap/?inputMint=4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`;
    return (
      <div className="glass-card rounded-2xl overflow-hidden" style={{ height: height + 52 }}>
        <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)]">
          <span className="text-[11px] text-slate-500 font-semibold">Price Chart · {symbol}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-500">{isSOF ? 'DEX Feed' : 'Valuation Model'}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 text-center px-6" style={{ height }}>
          {isSOF ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#9945FF]/10 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">SOF Live Chart</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  SOF trades on Raydium DEX.<br />View real-time price chart on-chain.
                </p>
                <a
                  href={RAYDIUM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9945FF]/15 border border-[#9945FF]/30 text-[#9945FF] text-xs font-bold hover:bg-[#9945FF]/25 transition-all"
                >
                  View on Raydium →
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Illiquid RWA Asset</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {symbol} does not have a real-time public market price feed.<br />
                  Valuation is based on periodic appraisals and benchmark indices.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)]">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => setIntervalVal(tf.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              interval === tf.value
                ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tf.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[10px] text-slate-500">Live · {symbol}</span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a] z-10 gap-3">
            <Loader2 className="w-6 h-6 text-[#00d4aa] animate-spin" />
            <span className="text-[11px] text-slate-500">Loading {symbol} chart…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a] z-10 gap-3">
            <AlertTriangle className="w-6 h-6 text-slate-600" />
            <span className="text-xs text-slate-500">Chart unavailable for {symbol}</span>
            <button
              onClick={() => { setError(false); setLoading(true); buildWidget(); }}
              className="text-[11px] text-[#00d4aa] hover:underline"
            >
              Retry
            </button>
          </div>
        )}
        <div id={containerId} ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}