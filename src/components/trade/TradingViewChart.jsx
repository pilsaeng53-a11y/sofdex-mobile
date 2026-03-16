import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getTVSymbol } from '../shared/symbolMap';

const TIMEFRAMES = [
  { label: '1m',  value: '1'   },
  { label: '5m',  value: '5'   },
  { label: '15m', value: '15'  },
  { label: '1h',  value: '60'  },
  { label: '4h',  value: '240' },
  { label: '1D',  value: 'D'   },
];

// Max ms to wait for chart to become visible before showing retry
const LOAD_TIMEOUT_MS = 12000;

export default function TradingViewChart({ symbol = 'SOL', height = 340 }) {
  const containerRef = useRef(null);
  const widgetRef    = useRef(null);
  const timeoutRef   = useRef(null);
  const mountedRef   = useRef(true);

  const [interval, setIntervalVal] = useState('60');
  const [status, setStatus]        = useState('loading'); // 'loading' | 'ready' | 'error'
  const [retryKey, setRetryKey]    = useState(0);

  // Stable unique container id per component mount
  const containerId = useRef(`tv_${Math.random().toString(36).slice(2)}`).current;

  // Resolve TV symbol — null means no public feed (SOF / illiquid RWA)
  const tvSymbol        = getTVSymbol(symbol);
  const noChartAvailable = tvSymbol === null;

  // ── No public feed: SOF DEX link or illiquid RWA notice ─────────────────────
  if (noChartAvailable) {
    const isSOF = symbol === 'SOF';
    const RAYDIUM_URL = 'https://raydium.io/swap/?inputMint=4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
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
    <TradingViewWidgetInner
      key={`${tvSymbol}-${interval}-${retryKey}`}
      tvSymbol={tvSymbol}
      sofSymbol={symbol}
      interval={interval}
      height={height}
      containerId={containerId}
      onSetInterval={setIntervalVal}
      onRetry={() => setRetryKey(k => k + 1)}
    />
  );
}

// ── Inner widget component — remounts fully on key change ────────────────────
function TradingViewWidgetInner({ tvSymbol, sofSymbol, interval, height, containerId, onSetInterval, onRetry }) {
  const containerRef = useRef(null);
  const widgetRef    = useRef(null);
  const timeoutRef   = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;

    function destroyWidget() {
      clearTimeout(timeoutRef.current);
      if (widgetRef.current) {
        try { widgetRef.current.remove?.(); } catch { /* ignore */ }
        widgetRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    }

    function initWidget() {
      if (cancelled || !containerRef.current || !window.TradingView) return;
      destroyWidget();

      try {
        widgetRef.current = new window.TradingView.widget({
          container_id:        containerId,
          symbol:              tvSymbol,
          interval,
          width:               '100%',
          height,
          theme:               'dark',
          style:               '1',   // Candlestick — price only, never market cap
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
            'paneProperties.background':                        '#0a0e1a',
            'paneProperties.backgroundType':                    'solid',
            'paneProperties.vertGridProperties.color':          'rgba(148,163,184,0.04)',
            'paneProperties.horzGridProperties.color':          'rgba(148,163,184,0.04)',
            'scalesProperties.textColor':                       '#64748b',
            'scalesProperties.lineColor':                       'rgba(148,163,184,0.08)',
            'mainSeriesProperties.candleStyle.upColor':         '#22c55e',
            'mainSeriesProperties.candleStyle.downColor':       '#ef4444',
            'mainSeriesProperties.candleStyle.borderUpColor':   '#22c55e',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
            'mainSeriesProperties.candleStyle.wickUpColor':     '#22c55e',
            'mainSeriesProperties.candleStyle.wickDownColor':   '#ef4444',
            'mainSeriesProperties.showPriceLine':               true,
          },
        });

        // TradingView lightweight widget does NOT expose onChartReady.
        // Poll the iframe until it appears — this is the only reliable method.
        const pollStart = Date.now();
        const poll = setInterval(() => {
          if (cancelled) { clearInterval(poll); return; }
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            clearInterval(poll);
            clearTimeout(timeoutRef.current);
            if (!cancelled) setStatus('ready');
          } else if (Date.now() - pollStart > LOAD_TIMEOUT_MS) {
            clearInterval(poll);
            if (!cancelled) setStatus('error');
          }
        }, 200);

        // Hard timeout safety net — stops infinite loading no matter what
        timeoutRef.current = setTimeout(() => {
          clearInterval(poll);
          if (!cancelled) setStatus('error');
        }, LOAD_TIMEOUT_MS);

      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    function loadScript() {
      if (window.TradingView) {
        initWidget();
        return;
      }
      // Script already injected, wait for it
      if (document.querySelector('script[src*="tv.js"]')) {
        const check = setInterval(() => {
          if (window.TradingView) { clearInterval(check); initWidget(); }
        }, 100);
        timeoutRef.current = setTimeout(() => {
          clearInterval(check);
          if (!cancelled) setStatus('error');
        }, LOAD_TIMEOUT_MS);
        return;
      }
      // First time — inject the script
      const script   = document.createElement('script');
      script.src     = 'https://s3.tradingview.com/tv.js';
      script.async   = true;
      script.onload  = initWidget;
      script.onerror = () => { if (!cancelled) setStatus('error'); };
      document.head.appendChild(script);

      timeoutRef.current = setTimeout(() => {
        if (!cancelled) setStatus('error');
      }, LOAD_TIMEOUT_MS);
    }

    loadScript();

    return () => {
      cancelled = true;
      destroyWidget();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once per mount — key prop handles symbol/interval resets

  const LOAD_TIMEOUT_MS = 12000;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)]">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => onSetInterval(tf.value)}
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
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'ready' ? 'bg-emerald-400 pulse-dot' : status === 'error' ? 'bg-red-400' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-slate-500">
            {status === 'ready' ? `Live · ${sofSymbol}` : status === 'error' ? 'Unavailable' : `Loading · ${sofSymbol}`}
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative" style={{ height }}>
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a] z-10 gap-3">
            <Loader2 className="w-6 h-6 text-[#00d4aa] animate-spin" />
            <span className="text-[11px] text-slate-500">Loading {sofSymbol} chart…</span>
          </div>
        )}

        {/* Error / unavailable overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a] z-10 gap-3">
            <AlertTriangle className="w-6 h-6 text-slate-600" />
            <span className="text-xs text-slate-500">Price chart temporarily unavailable</span>
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-[11px] text-[#00d4aa] hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div id={containerId} ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}