import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TAG_COLORS = {
  'Safe Haven':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Energy':        'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Industrial':    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Critical Metals':'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Agriculture':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Precious Metal':'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Commodity':     'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function CommodityCard({ asset }) {
  const isUp = asset.change >= 0;
  const tagStyle = TAG_COLORS[asset.tag] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const fmt = (p) => {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-amber-500/10 hover:border-amber-500/20 hover:bg-[#1a2340] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-xl">
            {asset.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{asset.name}</p>
            <p className="text-[10px] text-slate-500 font-mono">{asset.symbol}</p>
          </div>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tagStyle}`}>{asset.tag}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-white">{fmt(asset.price)}</p>
          <p className="text-[10px] text-slate-500">Vol: {asset.volume}</p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${
          isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{asset.change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}