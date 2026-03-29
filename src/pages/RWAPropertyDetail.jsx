import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink, TrendingUp, Clock, DollarSign, AlertCircle, Shield, Building2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getPropertyDetail, PLATFORM_CONFIG, CATEGORY_CONFIG } from '@/services/rwaPropertyService';

function InfoRow({ label, value, color = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[11px] font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className={`text-[10px] font-black uppercase tracking-wider ${color}`}>{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function RWAPropertyDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getPropertyDetail(id).then(p => { setProperty(p); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <p className="text-slate-400 text-sm">자산을 찾을 수 없습니다</p>
      <button onClick={() => navigate(-1)} className="text-xs text-[#8b5cf6] font-semibold">← 돌아가기</button>
    </div>
  );

  const platform = PLATFORM_CONFIG[property.sourcePlatform] || PLATFORM_CONFIG.other;
  const category = CATEGORY_CONFIG[property.category] || CATEGORY_CONFIG.commercial;
  const allImages = [property.featuredImage, ...(property.galleryImages || [])].filter(Boolean);

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{property.title}</p>
          <p className="text-[10px] text-slate-500 truncate">{property.location}</p>
        </div>
        <span className="text-[9px] font-black px-2 py-1 rounded-full"
          style={{ color: platform.color, background: platform.bg }}>
          {platform.label}
        </span>
      </div>

      {/* Image gallery */}
      {allImages.length > 0 && (
        <div>
          <img src={allImages[activeImg]} alt={property.title} className="w-full h-52 object-cover" />
          {allImages.length > 1 && (
            <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-[#8b5cf6]' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Title + badges */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[9px] font-black px-2 py-1 rounded-full"
              style={{ color: category.color, background: category.bg }}>
              {category.label}
            </span>
            {property.subcategory && (
              <span className="text-[9px] text-slate-500 bg-[#151c2e] px-2 py-1 rounded-full">{property.subcategory}</span>
            )}
          </div>
          <h1 className="text-lg font-black text-white leading-snug mb-1">{property.title}</h1>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-2xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            본 자산은 외부 플랫폼 기반 정보이며, SolFort 내부 검수 후 등록된 참고 자료입니다.
          </p>
        </div>

        {/* 수익 지표 */}
        <div className="glass-card rounded-2xl p-4 border border-emerald-400/10">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-3">수익 지표</p>
          <div className="grid grid-cols-2 gap-3">
            {property.targetIRR && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">Target IRR</p>
                <p className="text-sm font-black text-emerald-400">{property.targetIRR}</p>
              </div>
            )}
            {property.targetCashYield && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">Cash Yield</p>
                <p className="text-sm font-black text-[#00d4aa]">{property.targetCashYield}</p>
              </div>
            )}
            {property.targetEquityMultiple && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">Equity Multiple</p>
                <p className="text-sm font-black text-purple-400">{property.targetEquityMultiple}</p>
              </div>
            )}
            {property.holdingPeriod && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">보유 기간</p>
                <p className="text-sm font-black text-amber-400">{property.holdingPeriod}</p>
              </div>
            )}
            {property.minimumInvestment != null && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">최소 투자</p>
                <p className="text-sm font-black text-white">${property.minimumInvestment.toLocaleString()}</p>
              </div>
            )}
            {property.tokenPrice != null && (
              <div>
                <p className="text-[8px] text-slate-500 mb-0.5">토큰 가격</p>
                <p className="text-sm font-black text-slate-300">${property.tokenPrice.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* 자산 개요 */}
        <Section title="자산 개요" icon={Building2} color="text-[#8b5cf6]">
          <p className="text-[11px] text-slate-300 leading-relaxed">{property.longDescription || property.shortDescription}</p>
        </Section>

        {/* 운영/관리 */}
        {property.occupancyNotes && (
          <Section title="운영 정보" icon={TrendingUp} color="text-[#00d4aa]">
            <p className="text-[11px] text-slate-300 leading-relaxed">{property.occupancyNotes}</p>
            {property.managementNotes && (
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">{property.managementNotes}</p>
            )}
          </Section>
        )}

        {/* 리스크 안내 */}
        {property.riskNotes && (
          <Section title="리스크 안내" icon={AlertCircle} color="text-red-400">
            <p className="text-[11px] text-slate-300 leading-relaxed">{property.riskNotes}</p>
          </Section>
        )}

        {/* 출처 정보 */}
        <Section title="출처 정보" icon={Shield} color="text-slate-400">
          <InfoRow label="플랫폼" value={platform.label} />
          {property.sourcePropertyId && <InfoRow label="자산 ID" value={property.sourcePropertyId} />}
          {property.publishedAt && <InfoRow label="게시일" value={new Date(property.publishedAt).toLocaleDateString('ko-KR')} />}
        </Section>

        {/* External button */}
        {property.sourceUrl && (
          <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${platform.color}, ${platform.color}99)` }}>
            <ExternalLink className="w-4 h-4" />
            {platform.label} 외부 플랫폼 이동
          </a>
        )}
      </div>
    </div>
  );
}