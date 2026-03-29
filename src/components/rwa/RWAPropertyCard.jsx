/**
 * RWAPropertyCard.jsx — Public listing card for imported/published RWA properties
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Clock, DollarSign, AlertCircle, Star, GitCompare } from 'lucide-react';
import { PLATFORM_CONFIG, CATEGORY_CONFIG } from '@/services/rwaPropertyService';
import { useRWAWatchlist } from '@/hooks/useRWAWatchlist';

export default function RWAPropertyCard({ property, onCompare, isComparing }) {
  const platform = PLATFORM_CONFIG[property.sourcePlatform] || PLATFORM_CONFIG.other;
  const category = CATEGORY_CONFIG[property.category] || CATEGORY_CONFIG.commercial;
  const detailUrl = `/RWAPropertyDetail?id=${property.id || property.sourcePropertyId}`;
  const { isWatched, toggle } = useRWAWatchlist();
  const wid = property.id || property.sourcePropertyId;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.06)]">
      {/* Image */}
      {property.featuredImage && (
        <div className="relative">
          <img
            src={property.featuredImage}
            alt={property.title}
            className="w-full h-44 object-cover"
          />
          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="text-[9px] font-black px-2 py-1 rounded-full"
              style={{ color: platform.color, background: 'rgba(0,0,0,0.7)', border: `1px solid ${platform.color}40` }}>
              {platform.label}
            </span>
            <span className="text-[9px] font-black px-2 py-1 rounded-full"
              style={{ color: category.color, background: 'rgba(0,0,0,0.7)', border: `1px solid ${category.color}40` }}>
              {category.label}
            </span>
          </div>
          {/* Watchlist + Compare buttons */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {onCompare && (
              <button onClick={(e) => { e.preventDefault(); onCompare(property); }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: isComparing ? 'rgba(59,130,246,0.8)' : 'rgba(0,0,0,0.7)', border: `1px solid ${isComparing ? '#3b82f6' : 'rgba(148,163,184,0.3)'}` }}>
                <GitCompare className="w-3.5 h-3.5" style={{ color: isComparing ? '#fff' : '#94a3b8' }} />
              </button>
            )}
            <button onClick={(e) => { e.preventDefault(); toggle(wid); }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: isWatched(wid) ? 'rgba(251,191,36,0.25)' : 'rgba(0,0,0,0.7)', border: `1px solid ${isWatched(wid) ? '#fbbf24' : 'rgba(148,163,184,0.3)'}` }}>
              <Star className={`w-3.5 h-3.5 ${isWatched(wid) ? 'fill-current text-amber-400' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title + location */}
        <div>
          <h3 className="text-sm font-bold text-white leading-snug mb-1">{property.title}</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Short description */}
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{property.shortDescription}</p>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2">
          {property.targetIRR && (
            <div className="bg-[#0a0e1a] rounded-xl px-3 py-2">
              <p className="text-[8px] text-slate-600 mb-0.5 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Target IRR</p>
              <p className="text-xs font-bold text-emerald-400">{property.targetIRR}</p>
            </div>
          )}
          {property.targetCashYield && (
            <div className="bg-[#0a0e1a] rounded-xl px-3 py-2">
              <p className="text-[8px] text-slate-600 mb-0.5">Cash Yield</p>
              <p className="text-xs font-bold text-[#00d4aa]">{property.targetCashYield}</p>
            </div>
          )}
          {property.holdingPeriod && (
            <div className="bg-[#0a0e1a] rounded-xl px-3 py-2">
              <p className="text-[8px] text-slate-600 mb-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> 보유 기간</p>
              <p className="text-xs font-bold text-slate-300">{property.holdingPeriod}</p>
            </div>
          )}
          {property.minimumInvestment != null && (
            <div className="bg-[#0a0e1a] rounded-xl px-3 py-2">
              <p className="text-[8px] text-slate-600 mb-0.5 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" /> 최소 투자</p>
              <p className="text-xs font-bold text-amber-400">${property.minimumInvestment.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 bg-amber-400/5 border border-amber-400/15 rounded-xl px-3 py-2">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[8px] text-amber-400/80 leading-tight">
            본 자산은 외부 플랫폼 기반 정보이며, SolFort 내부 검수 후 등록된 참고 자료입니다.
          </p>
        </div>

        {/* Action */}
        <div className="pt-1">
          <Link to={detailUrl}>
            <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
              자세히 보기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}