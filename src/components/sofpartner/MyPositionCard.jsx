import React, { useMemo } from 'react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';
import { formatNumber } from './SOFQuantityCalc';

const STAGE_LABELS = {
  GREEN:    '기초 참여 단계',
  PURPLE:   '구조 참여 단계',
  GOLD:     '확장 단계',
  PLATINUM: '핵심 참여 단계',
};

export default function MyPositionCard({ gradeInfo, submissions = [], subActive = [] }) {
  const grade = gradeInfo?.grade;
  const gc    = grade ? GRADE_CONFIG[grade] : null;

  const monthlyUSDT = useMemo(() => {
    const m = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return submissions
      .filter(r => (r.submitted_at || '').startsWith(m))
      .reduce((s, r) => s + (r.purchase_amount || 0), 0);
  }, [submissions]);

  if (!gc) return null;

  return (
    <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
      style={{ background: gc.bg, border: `1px solid ${gc.border}` }}>
      {/* Grade + Stage */}
      <div>
        <p className="text-[7px] text-slate-500 uppercase tracking-wider">현재 등급</p>
        <p className="text-base font-black leading-tight" style={{ color: gc.color }}>{grade}</p>
        <p className="text-[7px] mt-0.5" style={{ color: gc.color, opacity: 0.7 }}>{STAGE_LABELS[grade]}</p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-[rgba(148,163,184,0.1)]" />

      {/* Rates */}
      <div className="text-center">
        <p className="text-[7px] text-slate-500">프로모션</p>
        <p className="text-sm font-black" style={{ color: gc.color }}>{gradeInfo.promotionPercent}%</p>
      </div>
      <div className="text-center">
        <p className="text-[7px] text-slate-500">센터피</p>
        <p className="text-sm font-black" style={{ color: gc.color }}>{gradeInfo.centerFeePercent}%</p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-[rgba(148,163,184,0.1)]" />

      {/* Monthly + subs */}
      <div className="text-right">
        <p className="text-[7px] text-slate-500">이번달 매출</p>
        <p className="text-[10px] font-black text-white">${formatNumber(monthlyUSDT, 0)}</p>
        <p className="text-[7px] text-slate-600">하부 {subActive.length}명</p>
      </div>
    </div>
  );
}