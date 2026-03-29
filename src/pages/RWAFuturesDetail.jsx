/**
 * RWAFuturesDetail — RWA Futures product detail page
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Shield, AlertCircle,
  TrendingUp, BarChart2, Activity, Clock, Layers, ArrowUpRight, ArrowDownRight,
  Zap, DollarSign
} from 'lucide-react';
import { getProductBySymbol, CATEGORY_CONFIG, STATUS_CONFIG } from '@/services/rwaFuturesService';
import { useRWAWatchlist } from '@/hooks/useRWAWatchlist';

function InfoRow({ label, value, color = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[11px] font-bold ${color}`}>{value || '—'}</span>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className={`text-[10px] font-black uppercase tracking-wider ${color}`}>{title}</p>
      </div>
      {children}
    </div>
  );
}

// Minimal sparkline mock
function PriceSparkline({ price, change }) {
  const isUp = change >= 0;
  const points = Array.from({ length: 24 }, (_, i) => {
    const noise = (Math.sin(i * 0.8 + price) * 0.02 + (isUp ? i * 0.001 : -i * 0.001));
    return price * (1 + noise);
  });
  const min = Math.min(...points);
  const max = Math.max(...points);
  const h = 60, w = 300;
  const toY = v => h - ((v - min) / (max - min + 0.0001)) * h;
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 23) * w} ${toY(v)}`).join(' ');

  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-4 h-4 text-[#8b5cf6]" />
        <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider">가격 차트 (참조)</p>
      </div>
      <div className="flex items-center gap-4 mb-3">
        <p className="text-2xl font-black text-white">${price.toLocaleString()}</p>
        <span className={`flex items-center gap-0.5 text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={path + ` L ${w} ${h} L 0 ${h} Z`} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
      </svg>
      <p className="text-[8px] text-slate-600 mt-2 text-center">24시간 기준가 추이 (참고용)</p>
    </div>
  );
}

export default function RWAFuturesDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const symbol = params.get('symbol');
  const product = getProductBySymbol(symbol);
  const { isWatched, toggle } = useRWAWatchlist();

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-slate-400">상품을 찾을 수 없습니다</p>
      <button onClick={() => navigate(-1)} className="text-xs text-[#8b5cf6]">← 돌아가기</button>
    </div>
  );

  const cat = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.commercial;
  const st = STATUS_CONFIG[product.status] || STATUS_CONFIG.paused;
  const wid = product.symbol;

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white font-mono">{product.symbol}</p>
          <p className="text-[10px] text-slate-500 truncate">{product.title}</p>
        </div>
        <span className="text-[9px] font-black px-2 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
        <button onClick={() => toggle(wid)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: isWatched(wid) ? 'rgba(251,191,36,0.15)' : '#151c2e' }}>
          <Star className={`w-4 h-4 ${isWatched(wid) ? 'fill-current text-amber-400' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* Hero image */}
      <div className="relative h-44">
        <img src={product.featuredImage} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span className="text-[9px] font-black px-2 py-1 rounded-full" style={{ color: cat.color, background: 'rgba(0,0,0,0.7)', border: `1px solid ${cat.color}40` }}>{cat.label}</span>
          <span className="text-xs font-black text-white font-mono bg-black/60 px-2 py-1 rounded-full">{product.symbol}</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-lg font-black text-white leading-snug">{product.title}</h1>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{product.location}</span>
          </div>
        </div>

        {/* Price chart */}
        <PriceSparkline price={product.referencePrice} change={product.change24h} />

        {/* Market metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: '24h 거래량', value: '$' + (product.volume24h / 1000).toFixed(0) + 'K', color: 'text-white' },
            { label: 'Open Interest', value: '$' + (product.openInterest / 1000).toFixed(0) + 'K', color: 'text-white' },
            { label: '최대 레버리지', value: `${product.leverageMax}x`, color: 'text-amber-400' },
            { label: '펀딩 수수료', value: product.fundingInfo, color: 'text-[#00d4aa]' },
          ].map(m => (
            <div key={m.label} className="bg-[#0a0e1a] rounded-xl px-3 py-2.5">
              <p className="text-[8px] text-slate-600 mb-0.5">{m.label}</p>
              <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Asset overview */}
        <Section title="자산 개요" icon={Activity} color="text-[#8b5cf6]">
          <p className="text-[11px] text-slate-300 leading-relaxed">{product.shortDescription}</p>
        </Section>

        {/* Contract spec */}
        <Section title="계약 정보" icon={Layers} color="text-[#00d4aa]">
          <InfoRow label="상품명" value={product.symbol} />
          <InfoRow label="계약 유형" value={product.contractType} />
          <InfoRow label="기초자산" value={product.title} />
          <InfoRow label="기준가" value={`$${product.referencePrice.toLocaleString()}`} color="text-emerald-400" />
          <InfoRow label="레버리지 범위" value={`${product.leverageMin}x – ${product.leverageMax}x`} color="text-amber-400" />
          <InfoRow label="틱 사이즈" value={`$${product.tickSize}`} />
          <InfoRow label="정산 단위" value={product.settlementUnit} />
          <InfoRow label="펀딩 수수료" value={product.fundingInfo} />
          <InfoRow label="최소 주문" value={`$${product.minOrderSize}`} />
        </Section>

        {/* Risk */}
        <Section title="리스크 안내" icon={AlertCircle} color="text-red-400">
          <p className="text-[11px] text-slate-300 leading-relaxed">{product.riskNotes}</p>
          <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">
            본 상품은 내부 참조 가격 기반의 선물 참조 상품입니다. 실제 온체인 정산이 아닌 SolFort 내부 시스템 기반으로 운영됩니다.
          </p>
        </Section>

        {/* CTA */}
        <Link to={`/RWAFuturesTrade?symbol=${product.symbol}`}>
          <button
            className="w-full py-4 rounded-2xl text-sm font-black text-white"
            style={{ background: product.status === 'live' ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)' : '#1e2a42' }}
            disabled={product.status !== 'live'}
          >
            {product.status === 'live' ? '거래하기' : product.status === 'upcoming' ? '곧 오픈 예정' : '일시 중단'}
          </button>
        </Link>
      </div>
    </div>
  );
}