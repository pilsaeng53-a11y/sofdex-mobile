/**
 * ResultSummaryPanel.jsx
 * Displays the full breakdown of a sales calculation — customer, recommender, center fee.
 */
import React from 'react';
import { FileText } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

function Row({ label, value, color, bold, sub }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-[10px] ${sub ? 'text-slate-700 pl-3' : 'text-slate-500'}`}>{label}</span>
      <span className={`text-[11px] font-mono ${bold ? 'font-black' : 'font-bold'}`}
        style={{ color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t" style={{ borderColor: 'rgba(148,163,184,0.07)' }} />;
}

export default function ResultSummaryPanel({ calc, form, gradeInfo }) {
  if (!calc?.isValid) return null;
  const grade = gradeInfo ? GRADE_CONFIG[gradeInfo.grade] : null;
  const fmt = (n) => (n == null ? '—' : n.toFixed(4));
  const fmtInt = (n) => (n == null ? '—' : Math.floor(n).toLocaleString());

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,212,170,0.03)', border: '1px solid rgba(0,212,170,0.18)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(0,212,170,0.1)', background: 'rgba(0,212,170,0.05)' }}>
        <FileText className="w-4 h-4 text-[#00d4aa]" />
        <span className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">계산 결과 요약</span>
        {grade && (
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: grade.bg, color: grade.color, border: `1px solid ${grade.border}` }}>
            {grade.label}
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-0.5">
        {/* Investment */}
        <Row label="고객 투자액 (KRW)" value={`${Number(form.salesKRW || 0).toLocaleString()}원`} />
        <Row label="당일 테더 시세" value={`${Number(form.usdtRate || 0).toLocaleString()}원`} sub />
        <Row label="환산 테더 수량" value={`${fmt(calc.usdtAmount)} USDT`} color="#06b6d4" />
        <Row label="금일 SOF 단가" value={`$${form.sofPrice}`} sub />

        <Divider />

        <Row label="기본 SOF 수량" value={`${fmt(calc.baseQuantity)} SOF`} />
        <Row label="프로모션 배수" value={`${(parseFloat(form.promotionPercent || 0) / 100).toFixed(2)}x (${form.promotionPercent}%)`} color="#a78bfa" />
        <Row label="최종 고객 SOF 수량" value={`${fmt(calc.finalQuantity)} SOF`} color="#22c55e" bold />

        <Divider />

        {calc.hasRecommender && (
          <>
            <Row label="추천인 수량" value={`${fmt(calc.recommenderQuantity)} SOF`} color="#f97316" />
            <Row label={`추천인 (${form.recommenderName || '—'})`} value={`기본수량 × ${form.recommenderPercent}%`} sub />
            <Divider />
          </>
        )}

        <Row label={`내 센터피 기준 비율 (${gradeInfo?.centerFeePercent ?? '—'}%)`}
          value={`기본수량 × ${gradeInfo?.centerFeePercent ?? 0}%`} />
        <Row label="총 센터피 수량" value={`${fmt(calc.grossCenterFee)} SOF`} />
        {calc.hasRecommender && (
          <Row label="추천인 공제 후" value={`${fmt(calc.netCenterFee)} SOF`} sub color="#fbbf24" bold />
        )}
        {!calc.hasRecommender && (
          <Row label="내 센터피 수량" value={`${fmt(calc.netCenterFee)} SOF`} color="#fbbf24" bold />
        )}
      </div>
    </div>
  );
}