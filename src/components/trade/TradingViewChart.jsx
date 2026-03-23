import React, { useEffect, useRef, useState } from 'react';
import { toTradingViewSymbol, normalizeSymbol } from '../../lib/trading/symbolMapper';

export default function TradingViewChart({ symbol = 'BTC', height = 280, autoFill = false }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable
  // If symbol already has exchange prefix (e.g. FX:EURUSD), use as-is; otherwise map through shared utility
  const tvSymbol = symbol.includes(':') ? symbol : toTradingViewSymbol(normalizeSymbol(symbol));

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';
    widgetRef.current = null;
    setStatus('loading');

    if (!tvSymbol) {
      setStatus('unavailable');
      return;
    }

    const containerId = `tv_chart_${symbol}_${Date.now()}`;
    containerRef.current.id = containerId;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    let pollInterval = null;
    let timeout = null;

    script.onload = () => {
      if (!window.TradingView || !containerRef.current) return;

      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: '15',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0a0e1a',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: containerId,
        backgroundColor: '#0a0e1a',
        gridColor: 'rgba(148,163,184,0.05)',
        hide_side_toolbar: false,
        withdateranges: false,
        allow_symbol_change: false,
      });

      // Poll for iframe readiness
      pollInterval = setInterval(() => {
        const iframe = containerRef.current?.querySelector('iframe');
        if (iframe) {
          clearInterval(pollInterval);
          clearTimeout(timeout);
          setStatus('ready');
        }
      }, 200);

      // Timeout fallback
      timeout = setTimeout(() => {
        clearInterval(pollInterval);
        setStatus('unavailable');
      }, 12000);
    };

    script.onerror = () => setStatus('unavailable');
    document.head.appendChild(script);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, tvSymbol]);

  if (!tvSymbol) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(148,163,184,0.1)] bg-[#0d1220]"
        style={{ height }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#151c2e] flex items-center justify-center mb-3">
          <span className="text-lg">📊</span>
        </div>
        <p className="text-xs font-semibold text-slate-400">Valuation Model</p>
        <p className="text-[10px] text-slate-600 mt-1">No public exchange feed for {symbol}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={autoFill ? { width: '100%', height: '100%' } : { height, borderRadius: '1rem', border: '1px solid rgba(148,163,184,0.1)' }}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1220] z-10">
          <div className="w-6 h-6 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      )}
      {status === 'unavailable' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1220] z-10">
          <p className="text-xs text-slate-500 mb-2">Chart unavailable</p>
          <button
            onClick={() => setStatus('loading')}
            className="text-[10px] text-[#00d4aa] underline"
          >
            Retry
          </button>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}