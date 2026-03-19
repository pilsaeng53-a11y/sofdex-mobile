import React from 'react';
import { Percent, Shield, TrendingUp, TrendingDown } from 'lucide-react';

const RISK_COLOR = {
  'Very Low': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Low':      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Medium':   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'High':     'text-red-400 bg-red-500/10 border-red-500/20',
};

const TAG_COLOR = {
  'Safe Haven':  'text-blue-400',
  'Income':      'text-emerald-400',
  'High Yield':  'text-orange-400',
  'Real Estate': 'text-violet-400',
  'DeFi Yield':  'text-teal-400',
  'Tax-Exempt':  'text-sky-400',
};

export default function YieldCard({ asset }) {
  const riskStyle = RISK_COLOR[asset.risk] || RISK_COLOR['Medium'];
  const tagColor = TAG_COLOR[asset.tag] || 'text-slate-400';
  const isUp = asset.change >= 0;

  return (
    <div className="glass-card rounded-2xl p-4 border border-emerald-500/10 hover:border-emerald-500/20 hover:bg-[#1a2340] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-xl">
            {asset.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{asset.name}</p>
            <p className={`text-[9px] font-semibold ${tagColor}`}>{asset.tag}</p>
          </div>
        </div>
        {/* Yield badge */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Percent className="w-3 h-3 text-emerald-400" />
          <span className="text-sm font-black text-emerald-400">{asset.yield}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${riskStyle}`}>{asset.risk} Risk</span>
          {asset.rating && asset.rating !== '—' && (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded">{asset.rating}</span>
          )}
        </div>
        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{asset.change.toFixed(3)}%
        </div>
      </div>
    </div>
  );
}