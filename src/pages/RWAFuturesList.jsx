/**
 * RWAFuturesList — SolFort-native RWA Futures listing page
 */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Search, BarChart2, Zap,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { RWA_FUTURES_PRODUCTS, CATEGORY_CONFIG, STATUS_CONFIG, getLiveProducts } from '@/services/rwaFuturesService';

const CATS = ['All', 'Hospitality', 'Residential', 'Commercial', 'Landmark'];

function FuturesCard({ product }) {
  const navigate = useNavigate();
  const cat = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.commercial;
  const st = STATUS_CONFIG[product.status] || STATUS_CONFIG.paused;
  const isUp = product.change24h >= 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.06)] hover-scale">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img src={product.featuredImage} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220]/90 to-transparent" />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ color: cat.color, background: 'rgba(0,0,0,0.75)', border: `1px solid ${cat.color}40` }}>
            {cat.label}
          </span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ color: st.color, background: 'rgba(0,0,0,0.75)', border: `1px solid ${st.color}40` }}>
            {st.label}
          </span>
        </div>
        {/* Symbol bottom-left */}
        <div className="absolute bottom-2 left-3">
          <p className="text-xs font-black text-white font-mono tracking-wider">{product.symbol}</p>
        </div>
        {/* Price top-right */}
        <div className="absolute top-2 right-3 text-right">
          <p className="text-sm font-black text-white">${product.referencePrice.toLocaleString()}</p>
          <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(product.change24h).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Title + location */}
        <div>
          <p className="text-sm font-bold text-white leading-snug truncate">{product.title}</p>
          <p className="text-[10px] text-slate-500 truncate">{product.location}</p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-[#0a0e1a] rounded-xl px-2 py-1.5 text-center">
            <p className="text-[8px] text-slate-600 mb-0.5">Volume 24h</p>
            <p className="text-[10px] font-bold text-slate-300">${(product.volume24h / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl px-2 py-1.5 text-center">
            <p className="text-[8px] text-slate-600 mb-0.5">Open Int.</p>
            <p className="text-[10px] font-bold text-slate-300">${(product.openInterest / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl px-2 py-1.5 text-center">
            <p className="text-[8px] text-slate-600 mb-0.5">Lev.</p>
            <p className="text-[10px] font-bold text-amber-400">{product.leverageMax}x</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <Link to={`/RWAFuturesDetail?symbol=${product.symbol}`} className="flex-1">
            <button className="w-full py-2 rounded-xl text-[10px] font-bold text-slate-300 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] hover:border-[#8b5cf6]/30 transition-all">
              상세 보기
            </button>
          </Link>
          <Link to={`/RWAFuturesTrade?symbol=${product.symbol}`} className="flex-1">
            <button
              className="w-full py-2 rounded-xl text-[10px] font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
              disabled={product.status !== 'live'}
            >
              거래하기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RWAFuturesList() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const products = useMemo(() => {
    return getLiveProducts().filter(p => {
      const matchCat = cat === 'All' || p.category === cat.toLowerCase();
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.symbol.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [cat, search]);

  const totalOI = RWA_FUTURES_PRODUCTS.reduce((s, p) => s + p.openInterest, 0);
  const totalVol = RWA_FUTURES_PRODUCTS.reduce((s, p) => s + p.volume24h, 0);

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Activity className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">RWA 선물거래</h1>
            <p className="text-[10px] text-slate-500">SolFort 내부 등록 자산 기반 파생상품</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '상장 상품', value: RWA_FUTURES_PRODUCTS.length + '개', color: '#8b5cf6' },
            { label: '총 거래량', value: '$' + (totalVol / 1e6).toFixed(1) + 'M', color: '#00d4aa' },
            { label: '총 OI', value: '$' + (totalOI / 1e6).toFixed(1) + 'M', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-3 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 mb-4">
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/15">
          <Zap className="w-3.5 h-3.5 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#8b5cf6]/80 leading-relaxed">
            본 상품은 SolFort 내부 등록 부동산 자산을 기초자산으로 하는 선물 참조 상품입니다. 실제 체결·정산 엔진은 순차 적용 예정입니다.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="자산명 / 심볼 검색..."
            className="w-full bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/30"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto scrollbar-none">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              cat === c
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25'
                : 'bg-[#151c2e] text-slate-500 border border-transparent'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center col-span-full">
            <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">해당 카테고리의 선물 상품이 없습니다</p>
          </div>
        ) : (
          products.map(p => <FuturesCard key={p.symbol} product={p} />)
        )}
      </div>
    </div>
  );
}