/**
 * LiteModeAI.jsx
 * Simplified AI market insights for Lite (beginner) mode.
 */
import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ASSETS = [
  { symbol: 'BTC',  name: '비트코인' },
  { symbol: 'ETH',  name: '이더리움' },
  { symbol: 'SOL',  name: '솔라나' },
  { symbol: 'BNB',  name: '바이낸스' },
];

const DISCLAIMER = '본 정보는 투자 권유가 아닌 참고 자료입니다';

const STATUS_CONFIG = {
  '상승 흐름':  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: TrendingUp },
  '조정 구간':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Minus },
  '변동성':     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: TrendingDown },
};

function getStatus(change) {
  if (change > 2)   return '상승 흐름';
  if (change < -2)  return '변동성';
  return '조정 구간';
}

const MOCK_DATA = [
  { symbol: 'BTC', name: '비트코인', change: 3.2,  price: 87420 },
  { symbol: 'ETH', name: '이더리움', change: -1.4, price: 3182 },
  { symbol: 'SOL', name: '솔라나',   change: 1.1,  price: 142 },
  { symbol: 'BNB', name: '바이낸스', change: 0.3,  price: 598 },
];

function AssetCard({ asset }) {
  const status = getStatus(asset.change);
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
      <div>
        <p className="text-xs font-bold text-white">{asset.name}</p>
        <p className="text-[9px] text-slate-500">{asset.symbol}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1.5 justify-end mb-0.5">
          <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          <span className="text-sm font-black" style={{ color: cfg.color }}>{status}</span>
        </div>
        <p className="text-[9px] text-slate-500">{asset.change > 0 ? '+' : ''}{asset.change}%</p>
      </div>
    </div>
  );
}

const MARKET_SUMMARIES = [
  { label: '전반적 시장 심리', value: '보통 상승', color: '#22c55e' },
  { label: '변동성 수준',     value: '낮음',     color: '#3b82f6' },
  { label: '자금 유입',       value: '활성화',   color: '#00d4aa' },
];

export default function LiteModeAI() {
  return (
    <div className="space-y-4 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#00d4aa]" />
        <h2 className="text-lg font-bold text-white">AI 시장 인사이트</h2>
        <span className="text-[8px] bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 px-2 py-0.5 rounded-full font-bold ml-auto">LITE</span>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <span className="text-[9px] text-slate-500 italic">{DISCLAIMER}</span>
      </div>

      {/* Market summary */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-3">오늘의 시장 요약</p>
        <div className="space-y-2">
          {MARKET_SUMMARIES.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{s.label}</span>
              <span className="text-[10px] font-black" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI recommended assets */}
      <div>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">AI 추천 자산 현황</p>
        <div className="space-y-2">
          {MOCK_DATA.map(a => <AssetCard key={a.symbol} asset={a} />)}
        </div>
      </div>

      {/* Simple guidance */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">AI 가이드</p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          현재 시장은 <span className="text-green-400 font-bold">완만한 상승</span> 흐름에 있습니다.
          변동성이 낮고 자금 유입이 활발해 단기 참여에 유리한 환경입니다.
          다만 급격한 가격 변동에 대비하여 리스크 관리를 유지하세요.
        </p>
      </div>

      {/* Disclaimer footer */}
      <p className="text-[8px] text-slate-600 text-center italic">{DISCLAIMER}</p>
    </div>
  );
}