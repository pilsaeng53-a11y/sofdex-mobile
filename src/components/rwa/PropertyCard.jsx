import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrendingUp, TrendingDown, ShieldCheck, Percent, BarChart2 } from 'lucide-react';
import { formatAssetValue } from '../shared/RWAData';

export default function PropertyCard({ property }) {
  const { symbol, name, city, country, flag, image, tokenPrice, change24h, yield: yld, totalValue, volume24h, verified, subcategory } = property;
  const isPositive = change24h >= 0;

  return (
    <Link to={`${createPageUrl('RealEstateDetail')}?symbol=${symbol}`}>
      <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all group">
        {/* Property Image */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220]/90 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {verified && (
              <div className="flex items-center gap-1 bg-[#00d4aa]/20 backdrop-blur-sm border border-[#00d4aa]/30 rounded-lg px-2 py-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-[#00d4aa]" />
                <span className="text-[9px] font-bold text-[#00d4aa]">VERIFIED</span>
              </div>
            )}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5">
              <span className="text-[9px] font-semibold text-slate-300">{subcategory}</span>
            </div>
          </div>

          {/* Location */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-xs font-medium text-white drop-shadow">{flag} {city}, {country}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-sm font-bold text-white mb-2.5 leading-tight">{name}</p>

          {/* Price row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Token Price</p>
              <p className="text-base font-bold text-white">${tokenPrice.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{change24h.toFixed(2)}%
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[rgba(148,163,184,0.06)]">
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Percent className="w-2.5 h-2.5 text-[#00d4aa]" />
                <span className="text-[10px] text-slate-500">Yield</span>
              </div>
              <p className="text-xs font-bold text-[#00d4aa]">{yld.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">Asset Value</p>
              <p className="text-xs font-bold text-white">{formatAssetValue(totalValue)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <BarChart2 className="w-2.5 h-2.5 text-slate-500" />
                <span className="text-[10px] text-slate-500">Vol 24h</span>
              </div>
              <p className="text-xs font-bold text-slate-300">{formatAssetValue(volume24h)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}