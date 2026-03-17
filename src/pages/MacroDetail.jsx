import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TradingViewChart from '../components/trade/TradingViewChart';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { base44 } from '@/api/base44Client';

const MACRO_META = {
  'GOLD-T':  {
    label: 'Gold (XAU/USD)', icon: '🥇', color: '#FFD700',
    description: 'Gold is the world\'s primary safe-haven asset, priced in USD per troy ounce. It tends to rise during inflation, geopolitical uncertainty, and USD weakness.',
    unit: 'usd',
    fmt: v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  'CRUDE-T': {
    label: 'Crude Oil (WTI)', icon: '🛢', color: '#6366f1',
    description: 'WTI Crude Oil is the benchmark for US oil prices, measured in USD per barrel. Prices are driven by OPEC policy, global demand, and supply disruptions.',
    unit: 'usd',
    fmt: v => `$${v.toFixed(2)}`,
  },
  'TBILL':   {
    label: 'US 10Y Treasury Yield', icon: '🏛', color: '#06b6d4',
    description: 'The 10-year US Treasury yield is a key macro indicator. Rising yields signal tighter financial conditions and often pressure equities and crypto.',
    unit: 'yield',
    fmt: v => `${v.toFixed(3)}%`,
  },
  'SP500-T': {
    label: 'S&P 500 Index', icon: '📈', color: '#00d4aa',
    description: 'The S&P 500 tracks 500 large US companies and is the primary barometer of the US equity market. It reflects corporate earnings and macro sentiment.',
    unit: 'usd',
    fmt: v => `${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  },
  'BTC':     {
    label: 'Bitcoin (BTC/USD)', icon: '₿', color: '#F7931A',
    description: 'Bitcoin is the leading cryptocurrency by market cap, often used as a macro risk-on asset. It is increasingly correlated with global liquidity cycles.',
    unit: 'usd',
    fmt: v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  },
};

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];
const TV_INTERVAL_MAP = { '1m': '1', '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1D': 'D', '1W': 'W' };

function useLivePrice(symbol) {
  const { getLiveAsset } = useMarketData();
  return getLiveAsset(symbol);
}

export default function MacroDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const symbol = params.get('symbol') || 'GOLD-T';
  const labelParam = params.get('label') || '';

  const meta = MACRO_META[symbol] || {
    label: labelParam || symbol, icon: '📊', color: '#00d4aa',
    description: 'Real-time macro market data.', unit: 'usd',
    fmt: v => `$${v.toFixed(2)}`,
  };

  const [timeframe, setTimeframe] = useState('1h');
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const liveRef = useRef(false);

  const { price, change, available } = useLivePrice(symbol);
  const positive = change == null ? null : change >= 0;

  // Mark as live once price arrives
  useEffect(() => { if (available) liveRef.current = true; }, [available]);

  // Build chart symbol with timeframe
  const chartKey = `${symbol}_${timeframe}`;

  async function loadAI() {
    if (aiLoading || aiInsight) return;
    setAiLoading(true);
    const priceStr = available && price != null ? meta.fmt(price) : 'unknown';
    const changeStr = change != null ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '';
    const prompt = `Give a concise 2-sentence macro market insight for ${meta.label}, currently at ${priceStr} (${changeStr} today). Focus on what's driving the move and what traders should watch.`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt }).catch(() => null);
    setAiInsight(result || 'AI insight unavailable.');
    setAiLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(loadAI, 1500);
    return () => clearTimeout(t);
  }, [symbol]);

  return (
    <div className="min-h-screen" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3 border-b border-[rgba(148,163,184,0.06)]"
        style={{ background: 'rgba(5,7,13,0.95)', backdropFilter: 'blur(20px)' }}>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <span className="text-lg">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">{meta.label}</h1>
          <p className="text-[10px] text-slate-500">Macro Indicator</p>
        </div>
        {available ? (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-slate-600 animate-spin" />
        )}
      </div>

      <div className="px-4 pt-4 pb-24">
        {/* Price Hero */}
        <div className="mb-4">
          {!available ? (
            <div className="space-y-2">
              <div className="w-40 h-9 rounded-xl skeleton" />
              <div className="w-24 h-4 rounded skeleton" />
            </div>
          ) : (
            <>
              <p
                className="text-4xl font-black tracking-tight num-large"
                style={{ color: meta.color }}
              >
                {price != null ? meta.fmt(price) : '—'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {positive !== null && (
                  <span className={`flex items-center gap-1 text-sm font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {positive ? '+' : ''}{change.toFixed(2)}% today
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                timeframe === tf
                  ? 'text-white'
                  : 'bg-[#151c2e] text-slate-500 hover:text-slate-300'
              }`}
              style={timeframe === tf ? { background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` } : {}}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* TradingView Chart */}
        <div className="mb-4">
          <TradingViewChartWithInterval symbol={symbol} interval={TV_INTERVAL_MAP[timeframe]} />
        </div>

        {/* Market Description */}
        <div className="glass-card rounded-2xl p-4 mb-3 border border-[rgba(148,163,184,0.06)]">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5">About This Indicator</p>
          <p className="text-xs text-slate-300 leading-relaxed">{meta.description}</p>
        </div>

        {/* AI Insight */}
        <div className="glass-card rounded-2xl p-4 border border-[rgba(153,69,255,0.12)]"
          style={{ background: 'rgba(153,69,255,0.04)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <p className="text-[11px] font-semibold text-purple-400">AI Macro Insight</p>
          </div>
          {aiLoading ? (
            <div className="space-y-2">
              <div className="w-full h-3 rounded skeleton" />
              <div className="w-4/5 h-3 rounded skeleton" />
            </div>
          ) : aiInsight ? (
            <p className="text-xs text-slate-300 leading-relaxed">{aiInsight}</p>
          ) : (
            <button
              onClick={loadAI}
              className="text-[11px] text-purple-400 underline"
            >
              Load AI insight
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TradingViewChart wrapper that re-mounts on interval change.
 * We pass the interval via a query-string workaround since TradingViewChart
 * exposes no interval prop — extend the base component with interval support.
 */
function TradingViewChartWithInterval({ symbol, interval }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const { getTVSymbol } = useTVSymbol(symbol);

  useEffect(() => {
    if (!containerRef.current || !getTVSymbol) return;
    containerRef.current.innerHTML = '';
    setStatus('loading');

    const id = `tv_macro_${symbol}_${Date.now()}`;
    containerRef.current.id = id;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    let poll, timeout;
    script.onload = () => {
      if (!window.TradingView || !containerRef.current) return;
      new window.TradingView.widget({
        autosize: true,
        symbol: getTVSymbol,
        interval,
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0a0e1a',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: id,
        backgroundColor: '#0a0e1a',
        gridColor: 'rgba(148,163,184,0.05)',
        hide_side_toolbar: true,
        allow_symbol_change: false,
      });
      poll = setInterval(() => {
        if (containerRef.current?.querySelector('iframe')) {
          clearInterval(poll); clearTimeout(timeout);
          setStatus('ready');
        }
      }, 200);
      timeout = setTimeout(() => { clearInterval(poll); setStatus('unavailable'); }, 14000);
    };
    script.onerror = () => setStatus('unavailable');
    document.head.appendChild(script);

    return () => {
      clearInterval(poll); clearTimeout(timeout);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, interval, getTVSymbol]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.1)]" style={{ height: 300 }}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1220] z-10">
          <div className="w-6 h-6 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      )}
      {status === 'unavailable' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1220] z-10 gap-2">
          <p className="text-xs text-slate-500">Chart unavailable</p>
          <button onClick={() => setStatus('loading')} className="text-[10px] text-[#00d4aa] underline">Retry</button>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function useTVSymbol(symbol) {
  const map = {
    'GOLD-T':  'TVC:GOLD',
    'CRUDE-T': 'TVC:USOIL',
    'TBILL':   'TVC:US10Y',
    'SP500-T': 'SP:SPX',
    'BTC':     'BINANCE:BTCUSDT',
  };
  return { getTVSymbol: map[symbol] ?? null };
}