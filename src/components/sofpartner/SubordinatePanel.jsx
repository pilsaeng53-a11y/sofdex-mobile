/**
 * SubordinatePanel.jsx
 * 하부 관리 — shows active and promoted-out subordinates.
 */
import React, { useState } from 'react';
import { Users, TrendingUp, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

function GradeBadge({ grade }) {
  const cfg = GRADE_CONFIG[grade];
  if (!cfg) return <span className="text-[8px] text-slate-600">—</span>;
  return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function SubRow({ sub, dimmed }) {
  const dateStr = sub.lastSubmitAt
    ? new Date(sub.lastSubmitAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
    : '—';
  const shortW = sub.walletAddress
    ? `${sub.walletAddress.slice(0, 6)}…${sub.walletAddress.slice(-4)}`
    : '—';

  return (
    <div className={`px-4 py-3 border-b last:border-0 transition-all ${dimmed ? 'opacity-40' : ''}`}
      style={{ borderColor: 'rgba(148,163,184,0.06)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white">{sub.name}</span>
          <GradeBadge grade={sub.grade} />
          {sub.status === 'promoted' && (
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
              ↑ 승급
            </span>
          )}
        </div>
        <span className="text-[8px] text-slate-600 font-mono">{shortW}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[7px] text-slate-600 mb-0.5">누적 매출</p>
          <p className="text-[9px] font-bold text-slate-300">
            {(sub.accumulatedSalesKRW / 10000).toFixed(0)}만원
          </p>
        </div>
        <div>
          <p className="text-[7px] text-slate-600 mb-0.5">최근 제출 수량</p>
          <p className="text-[9px] font-bold text-[#00d4aa]">{sub.lastSubmitQuantity?.toLocaleString()} SOF</p>
        </div>
        <div>
          <p className="text-[7px] text-slate-600 mb-0.5">최근 제출일</p>
          <p className="text-[9px] font-bold text-slate-400">{dateStr}</p>
        </div>
      </div>
      {/* Activity line */}
      <p className="text-[8px] text-slate-600 mt-1.5">
        {sub.name}가 {(sub.accumulatedSalesKRW / 10000).toFixed(0)}만원 매출 · {sub.lastSubmitQuantity?.toLocaleString()} SOF 제출
      </p>
    </div>
  );
}

export default function SubordinatePanel({ active, promoted, loading }) {
  const [showPromoted, setShowPromoted] = useState(false);
  const total = active.length + promoted.length;

  if (loading) return (
    <div className="glass-card rounded-2xl px-4 py-6 flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      <span className="text-[10px] text-slate-600">하부 조회 중...</span>
    </div>
  );

  if (total === 0) return (
    <div className="glass-card rounded-2xl px-4 py-5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-[#1a2340] flex items-center justify-center">
        <Users className="w-4 h-4 text-slate-600" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-500">등록된 하부 없음</p>
        <p className="text-[9px] text-slate-700">이 지갑에 연결된 하부 파트너가 없습니다</p>
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(148,163,184,0.07)]"
        style={{ background: 'rgba(0,212,170,0.04)' }}>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">하부 관리</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">활성 {active.length}명</span>
          {promoted.length > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
              승급 {promoted.length}명
            </span>
          )}
        </div>
      </div>

      {/* Active subordinates */}
      {active.length > 0 && (
        <div>
          {active.map((s, i) => <SubRow key={i} sub={s} />)}
        </div>
      )}

      {active.length === 0 && (
        <div className="px-4 py-3 text-[10px] text-slate-600">활성 하부 없음</div>
      )}

      {/* Promoted section (collapsible) */}
      {promoted.length > 0 && (
        <div className="border-t" style={{ borderColor: 'rgba(148,163,184,0.07)' }}>
          <button onClick={() => setShowPromoted(p => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] text-slate-500 hover:text-slate-300 transition-all">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              승급된 하부 (더 이상 하부로 분류 안됨)
            </span>
            {showPromoted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showPromoted && (
            <div className="border-t" style={{ borderColor: 'rgba(148,163,184,0.05)' }}>
              {promoted.map((s, i) => <SubRow key={i} sub={s} dimmed />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}