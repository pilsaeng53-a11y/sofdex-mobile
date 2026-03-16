import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';

const INDICATORS = [
  { key: 'gold',   label: 'Gold',         symbol: 'XAU/USD', basePrice: 2341.80, basePct: 0.87,  color: '#FFD700', icon: '🥇' },
  { key: 'oil',    label: 'Crude Oil',    symbol: 'WTI',     basePrice: 78.92,   basePct: -1.23, color: '#6366f1', icon: '🛢' },
  { key: 'us10y',  label: 'US 10Y Yield', symbol: 'US10Y',   basePrice: 4.28,    basePct: 0.02,  color: '#06b6d4', icon: '🏛', isYield: true },
  { key: 'dxy',    label: 'Dollar Index', symbol: 'DXY',     basePrice: 104.12,  basePct: 0.14,  color: '#22c55e', icon: '💵' },
  { key: 'spx',    label: 'S&P 500',      symbol: 'SPX',     basePrice: 5842.30, basePct: 0.45,  color: '#00d4aa', icon: '📈' },
  { key: 'btcd',   label: 'BTC Dom.',     symbol: 'BTC.D',   basePrice: 58.4,    basePct: 0.23,  color: '#F7931A', icon: '₿', isPct: true },
];

function useLiveIndicatorPrices(indicators) {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(indicators.map(i => [i.key, { price: i.basePrice, pct: i.basePct }]))
  );

  useEffect(() => {
    // Continuous micro-updates simulating real-time market movement
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        indicators.forEach(ind => {
          // Smaller, more frequent random movements for live-like behavior
          const drift = (Math.random() - 0.5) * ind.basePrice * 0.00015;
          const newPrice = +(prev[ind.key].price + drift).toFixed(ind.basePrice < 10 ? 4 : ind.basePrice < 1000 ? 2 : 1);
          const pctChange = +((newPrice - ind.basePrice) / ind.basePrice * 100).toFixed(3);
          next[ind.key] = { price: newPrice, pct: pctChange };
        });
        return next;
      });
    }, 1000); // Update every 1 second instead of 4 for live feel
    return () => clearInterval(id);
  }, []);

  return prices;
}

export default function GlobalIndicators() {
  const prices = useSimulatedPrices(INDICATORS);

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-[#06b6d4]" />
        <h3 className="text-sm font-bold text-white">Global Indicators</h3>
        <span className="text-[9px] text-slate-600 bg-[#151c2e] px-1.5 py-0.5 rounded-lg">Live</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {INDICATORS.map(ind => {
          const p = prices[ind.key];
          const positive = p.pct >= 0;
          return (
            <div key={ind.key} className="glass-card rounded-xl p-3 border border-[rgba(148,163,184,0.04)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{ind.icon}</span>
                <span className={`text-[9px] font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {positive ? '+' : ''}{p.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] font-bold text-white leading-none">
                {ind.isYield ? `${p.price.toFixed(2)}%` : ind.isPct ? `${p.price.toFixed(1)}%` : ind.basePrice >= 1000 ? `$${p.price.toLocaleString('en', { maximumFractionDigits: 1 })}` : `$${p.price.toFixed(2)}`}
              </p>
              <p className="text-[9px] text-slate-600 mt-0.5">{ind.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}