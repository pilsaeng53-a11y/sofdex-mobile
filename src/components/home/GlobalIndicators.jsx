import React, { useState, useEffect, useRef } from 'react';
import { Globe, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useMarketData } from '../shared/MarketDataProvider';
import { useNavigate } from 'react-router-dom';

/**
 * Maps each indicator to its MarketDataProvider symbol key.
 * 'btcd' uses a dedicated hook (no provider symbol).
 */
const INDICATORS = [
  {
    key:       'GOLD-T',
    label:     'Gold',
    unit:      'usd',
    color:     '#FFD700',
    icon:      '🥇',
    tvSymbol:  'GOLD-T',
    fmt:       v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    key:       'CRUDE-T',
    label:     'Crude Oil',
    unit:      'usd',
    color:     '#6366f1',
    icon:      '🛢',
    tvSymbol:  'CRUDE-T',
    fmt:       v => `$${v.toFixed(2)}`,
  },
  {
    key:       'TBILL',
    label:     'US 10Y',
    unit:      'yield',
    color:     '#06b6d4',
    icon:      '🏛',
    tvSymbol:  'TBILL',
    fmt:       v => `${v.toFixed(3)}%`,
  },
  {
    key:       'SP500-T',
    label:     'S&P 500',
    unit:      'usd',
    color:     '#00d4aa',
    icon:      '📈',
    tvSymbol:  'SP500-T',
    fmt:       v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  },
  {
    key:       'BTC',
    label:     'BTC',
    unit:      'usd',
    color:     '#F7931A',
    icon:      '₿',
    tvSymbol:  'BTC',
    fmt:       v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  },
  {
    key:       'btcd',
    label:     'BTC Dom.',
    unit:      'pct',
    color:     '#a855f7',
    icon:      '📊',
    tvSymbol:  null,
    fmt:       v => `${v.toFixed(1)}%`,
  },
];

/** Fetch BTC dominance from CoinGecko global endpoint */
function useBTCDominance() {
  const [data, setData] = useState({ price: null, change: null, available: false });
  const prevRef = useRef(null);
  const alive = useRef(true);

  async function fetch_() {
    if (!alive.current) return;
    const res = await fetch('https://api.coingecko.com/api/v3/global', {
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);
    if (!res?.ok || !alive.current) return;
    const json = await res.json().catch(() => null);
    const dom = json?.data?.market_cap_percentage?.btc;
    if (dom == null || isNaN(dom)) return;
    const prev = prevRef.current;
    const change = prev != null ? dom - prev : 0;
    prevRef.current = dom;
    if (alive.current) setData({ price: +dom.toFixed(2), change: +change.toFixed(3), available: true });
  }

  useEffect(() => {
    alive.current = true;
    fetch_();
    const t = setInterval(fetch_, 60_000);
    return () => { alive.current = false; clearInterval(t); };
  }, []);

  return data;
}

export default function GlobalIndicators() {
  const { getLiveAsset, liveData } = useMarketData();
  const btcDom = useBTCDominance();
  const navigate = useNavigate();

  // Track when data last updated to drive live badge
  const [lastUpdate, setLastUpdate] = useState(null);
  const prevLiveRef = useRef(null);

  useEffect(() => {
    const key = JSON.stringify(liveData);
    if (key !== prevLiveRef.current) {
      prevLiveRef.current = key;
      setLastUpdate(Date.now());
    }
  }, [liveData]);

  // Live = updated within last 90 seconds
  const isLive = lastUpdate && (Date.now() - lastUpdate < 90_000);

  function getIndicatorData(ind) {
    if (ind.key === 'btcd') return btcDom;
    return getLiveAsset(ind.key);
  }

  function handleCardClick(ind) {
    if (!ind.tvSymbol) return;
    navigate(`/MacroDetail?symbol=${ind.tvSymbol}&label=${encodeURIComponent(ind.label)}`);
  }

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-[#06b6d4]" />
        <h3 className="text-sm font-bold text-white">Global Indicators</h3>
        {isLive ? (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-lg">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] text-slate-500 bg-[#151c2e] px-1.5 py-0.5 rounded-lg">
            <RefreshCw className="w-2.5 h-2.5" />
            Loading
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {INDICATORS.map(ind => {
          const d = getIndicatorData(ind);
          const available = d?.available;
          const price = d?.price;
          const pct = d?.change;
          const positive = pct == null ? null : pct >= 0;
          const clickable = !!ind.tvSymbol;

          return (
            <div
              key={ind.key}
              onClick={() => clickable && handleCardClick(ind)}
              className={`glass-card rounded-xl p-3 border border-[rgba(148,163,184,0.04)] transition-all duration-200 ${
                clickable ? 'cursor-pointer hover:border-[rgba(148,163,184,0.12)] hover:bg-[#151c2e]/80 active:scale-95' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{ind.icon}</span>
                {!available ? (
                  <span className="w-10 h-3 rounded skeleton" />
                ) : positive === null ? null : (
                  <span className={`text-[9px] font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {positive ? '+' : ''}{pct.toFixed(2)}%
                  </span>
                )}
              </div>

              {!available ? (
                <span className="w-16 h-3.5 rounded skeleton block mb-1" />
              ) : (
                <p className="text-[11px] font-bold text-white leading-none num-highlight">
                  {ind.fmt(price)}
                </p>
              )}

              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[9px] text-slate-600">{ind.label}</p>
                {clickable && available && (
                  <span className="text-[8px] text-slate-600">›</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}