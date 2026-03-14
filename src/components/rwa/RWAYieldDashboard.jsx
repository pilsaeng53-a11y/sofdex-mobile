import React from 'react';
import { TrendingUp, ShieldCheck, Building2, Coins } from 'lucide-react';

const YIELD_ASSETS = [
  { symbol: 'RE-NYC',   name: 'NYC Real Estate Fund',     category: 'Real Estate',    yield: 7.8,  risk: 'Medium', color: '#8b5cf6', icon: Building2, valuation: 'Quarterly NAV' },
  { symbol: 'RE-DXB',   name: 'Dubai RE Portfolio',       category: 'Real Estate',    yield: 9.2,  risk: 'Medium', color: '#8b5cf6', icon: Building2, valuation: 'Monthly NAV' },
  { symbol: 'TBILL',    name: 'US Treasury Bill',         category: 'Treasury',       yield: 5.12, risk: 'Low',    color: '#3b82f6', icon: ShieldCheck, valuation: 'Daily (Fed rate)' },
  { symbol: 'EURO-B',   name: 'Euro Bond Token',          category: 'Treasury',       yield: 3.8,  risk: 'Low',    color: '#3b82f6', icon: ShieldCheck, valuation: 'Daily (ECB rate)' },
  { symbol: 'INFRA-1',  name: 'Infrastructure Bond',      category: 'Infrastructure', yield: 6.4,  risk: 'Low',    color: '#06b6d4', icon: Coins, valuation: 'Semi-annual' },
  { symbol: 'ENERGY-1', name: 'Renewable Energy Token',   category: 'Energy',         yield: 8.1,  risk: 'Medium', color: '#22c55e', icon: Coins, valuation: 'Quarterly yield' },
  { symbol: 'SP500-T',  name: 'S&P 500 Tokenized',        category: 'Equity',         yield: 1.2,  risk: 'Medium', color: '#00d4aa', icon: TrendingUp, valuation: 'Continuous (index)' },
  { symbol: 'GOLD-T',   name: 'Tokenized Gold',           category: 'Commodity',      yield: 0,    risk: 'Low',    color: '#FFD700', icon: Coins, valuation: 'Spot benchmark' },
];

const RISK_COLORS = {
  Low:    'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  High:   'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function RWAYieldDashboard() {
  const maxYield = Math.max(...YIELD_ASSETS.map(a => a.yield));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">RWA Yield Dashboard</h3>
        <span className="text-[9px] text-slate-600 bg-[#151c2e] px-1.5 py-0.5 rounded-lg">APY</span>
      </div>

      <div className="glass-card rounded-2xl border border-[rgba(148,163,184,0.04)] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[rgba(148,163,184,0.06)]">
          <div className="col-span-5"><p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Asset</p></div>
          <div className="col-span-3"><p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider text-center">Yield</p></div>
          <div className="col-span-4"><p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Pricing</p></div>
        </div>

        {YIELD_ASSETS.sort((a, b) => b.yield - a.yield).map((asset, i) => {
          const Icon = asset.icon;
          return (
            <div key={asset.symbol} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-[rgba(148,163,184,0.04)] last:border-0">
              {/* Asset */}
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${asset.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: asset.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{asset.symbol}</p>
                  <p className="text-[9px] text-slate-600 truncate">{asset.category}</p>
                </div>
              </div>

              {/* Yield bar */}
              <div className="col-span-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(asset.yield / maxYield) * 100}%`, background: asset.color }}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-center mt-1" style={{ color: asset.yield > 0 ? asset.color : '#64748b' }}>
                  {asset.yield > 0 ? `${asset.yield}%` : '—'}
                </p>
              </div>

              {/* Valuation model */}
              <div className="col-span-4">
                <p className="text-[9px] text-slate-500 leading-tight">{asset.valuation}</p>
                <span className={`text-[8px] font-semibold px-1 py-0.5 rounded border ${RISK_COLORS[asset.risk]}`}>
                  {asset.risk} risk
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing note */}
      <div className="mt-3 px-3 py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.06)]">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <span className="text-slate-400 font-semibold">Pricing note:</span> Real estate and illiquid RWA assets use benchmark-driven valuation (NAV, regional indices) rather than tick-by-tick pricing. Liquid assets (gold, bonds, tokenized equities) use continuous oracle feeds.
        </p>
      </div>
    </div>
  );
}