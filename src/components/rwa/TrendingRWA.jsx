import React from 'react';
import { TrendingUp, TrendingDown, Flame, Zap } from 'lucide-react';
import { TRENDING_RWA } from '../shared/RWAData';

const TYPE_COLOR = {
  'Commodity':   { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400' },
  'xStock':      { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400' },
  'Art':         { bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   text: 'text-pink-400' },
  'Alternative': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  'Yield':       { bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',text: 'text-emerald-400' },
  'Real Estate': { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  'Landmark':    { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
};

function TrendingCard({ asset }) {
  const isUp = asset.change >= 0;
  const typeKey = asset.subcategory === 'Landmark' ? 'Real Estate' : asset.type;
  const colors = TYPE_COLOR[typeKey] || TYPE_COLOR['Alternative'];

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <div className={`flex-shrink-0 w-52 rounded-2xl p-3.5 border ${colors.border} ${colors.bg} relative overflow-hidden`}>
      {/* Subtle glow */}
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 ${colors.bg.replace('/10','/40')}`} />

      <div className="relative z-10">
        {/* Trend tag */}
        <div className="mb-2">
          <span className="text-[9px] font-bold tracking-wide text-white bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
            {asset.trendTag}
          </span>
        </div>

        {/* Name & type */}
        <p className="text-xs font-bold text-white leading-tight mb-0.5 line-clamp-2">{asset.name}</p>
        <p className={`text-[9px] font-semibold ${colors.text} mb-2`}>{asset.type || typeKey}</p>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-white">{formatPrice(asset.price || asset.tokenPrice)}</p>
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${
            isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {isUp ? '+' : ''}{(asset.change || asset.change24h || 0).toFixed(2)}%
          </div>
        </div>

        {/* Reason */}
        <p className="text-[9px] text-slate-500 mt-1.5 leading-tight line-clamp-2">{asset.trendReason}</p>
      </div>
    </div>
  );
}

export default function TrendingRWA() {
  return (
    <div className="px-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <h3 className="text-sm font-bold text-white">Trending RWA Assets</h3>
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TRENDING_RWA.map((asset, i) => (
          <TrendingCard key={i} asset={asset} />
        ))}
      </div>
    </div>
  );
}