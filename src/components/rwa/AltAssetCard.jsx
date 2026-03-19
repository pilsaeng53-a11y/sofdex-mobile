import React from 'react';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';

const SUBCAT_COLOR = {
  'Music Royalties':  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  'Sports Contracts': { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400' },
  'Film Revenue':     { bg: 'bg-red-500/10',     border: 'border-red-500/20',    text: 'text-red-400' },
  'Gaming Assets':    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',text: 'text-emerald-400' },
  'Domain Names':     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',    text: 'text-sky-400' },
  'Luxury Goods':     { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  text: 'text-amber-400' },
};

export default function AltAssetCard({ asset }) {
  const isUp = asset.change >= 0;
  const colors = SUBCAT_COLOR[asset.subcategory] || { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' };
  const hasYield = asset.yield && asset.yield !== '0.0%';

  const fmt = (p) => {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${p.toFixed(2)}`;
  };

  return (
    <div className={`glass-card rounded-2xl p-4 border ${colors.border} ${colors.bg.replace('/10', '/5')} hover:bg-[#1a2340] transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xl`}>
            {asset.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{asset.name}</p>
            <p className={`text-[9px] font-semibold ${colors.text}`}>{asset.subcategory}</p>
          </div>
        </div>
        {hasYield && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Percent className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{asset.yield}</span>
          </div>
        )}
      </div>

      {asset.description && (
        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed line-clamp-2">{asset.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-black text-white">{fmt(asset.price)}</p>
          <p className="text-[9px] text-slate-500">Vol: {asset.volume}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
          isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{asset.change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}