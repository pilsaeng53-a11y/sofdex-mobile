/**
 * PartnerGradePanel.jsx
 * Displays wallet-based partner grade, promotion rate, and center fee rate.
 * Data comes from usePartnerGrade hook (mock → DB-ready).
 */
import React from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

export default function PartnerGradePanel({ gradeInfo, loading, fetched, wallet }) {
  const grade  = gradeInfo ? GRADE_CONFIG[gradeInfo.grade] : null;
  const shortW = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : '—';

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(148,163,184,0.07)]"
        style={{ background: 'rgba(0,212,170,0.04)' }}>
        <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
        <span className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">파트너 등급 정보</span>
        {loading && <Loader2 className="w-3 h-3 text-slate-500 animate-spin ml-auto" />}
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Wallet address */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">기준 지갑 주소</span>
          <span className="text-[10px] font-mono text-slate-300">{shortW}</span>
        </div>

        {loading && (
          <div className="py-2 text-center text-[10px] text-slate-600">등급 조회 중...</div>
        )}

        {!loading && fetched && !gradeInfo && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
            <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400">등급 미등록</p>
              <p className="text-[8px] text-slate-600">프로모션 정보 없음 · 재단에 문의하세요</p>
            </div>
          </div>
        )}

        {!loading && gradeInfo && grade && (
          <>
            {/* Grade badge */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">현재 등급</span>
              <span className="text-[11px] font-black px-3 py-1 rounded-full"
                style={{ background: grade.bg, color: grade.color, border: `1px solid ${grade.border}` }}>
                ● {grade.label}
              </span>
            </div>

            {/* Promotion */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">현재 프로모션 요율</span>
              <span className="text-[13px] font-black font-mono" style={{ color: grade.color }}>
                {gradeInfo.promotionPercent}%
                <span className="text-[9px] text-slate-500 font-normal ml-1">
                  ({(gradeInfo.promotionPercent / 100).toFixed(2)}x)
                </span>
              </span>
            </div>

            {/* Center fee */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">현재 센터피 요율</span>
              <span className="text-[13px] font-black font-mono text-amber-400">
                {gradeInfo.centerFeePercent}%
              </span>
            </div>

            {/* Updated */}
            <div className="pt-1.5 border-t border-[rgba(148,163,184,0.06)]">
              <p className="text-[8px] text-slate-700 text-right">
                마지막 업데이트: {new Date(gradeInfo.updatedAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}