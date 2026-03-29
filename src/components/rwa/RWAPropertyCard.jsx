/**
 * RWAPropertyCard.jsx — Public listing card for imported/published RWA properties
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, TrendingUp, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { PLATFORM_CONFIG, CATEGORY_CONFIG } from '@/services/rwaPropertyService';

export default function RWAPropertyCard({ property }) {
  const platform = PLATFORM_CONFIG[property.sourcePlatform] || PLATFORM_CONFIG.other;
  const category = CATEGORY_CONFIG[property.category] || CATEGORY_CONFIG.commercial;
  const detailUrl = `/RWAPropertyDetail?id=${property.id || property.sourcePropertyId}`;

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

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link to={detailUrl} className="flex-1">
            <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
              자세히 보기
            </button>
          </Link>
          {property.sourceUrl && (
            <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-[#151c2e] border border-[rgba(148,163,184,0.1)] hover:text-white hover:border-[rgba(148,163,184,0.2)] transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
              외부
            </a>
          )}
        </div>
      </div>
    </div>
  );
}