/**
 * PartnerGradePanel.jsx
 * Displays wallet-based partner grade, promotion rate, and center fee rate.
 * Data comes from usePartnerGrade hook (mock → DB-ready).
 */
import React, { useMemo } from 'react';
import { ShieldCheck, Loader2, AlertCircle, Target, CheckCircle, XCircle } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

// Grade maintenance requirements (monthly USDT minimums to keep grade)
const GRADE_REQUIREMENTS = {
  GREEN:    { monthlyUSDT: 500,   subMin: 0, label: '월 $500 이상 판매' },
  PURPLE:   { monthlyUSDT: 2000,  subMin: 1, label: '월 $2,000 + 하위 1명' },
  GOLD:     { monthlyUSDT: 5000,  subMin: 2, label: '월 $5,000 + 하위 2명' },
  PLATINUM: { monthlyUSDT: 10000, subMin: 3, label: '월 $10,000 + 하위 3명' },
};

export default function PartnerGradePanel({ gradeInfo, loading, fetched, wallet, submissions = [], subActive = [] }) {
  const grade  = gradeInfo ? GRADE_CONFIG[gradeInfo.grade] : null;
  const shortW = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : '—';

  const maintenance = useMemo(() => {
    if (!gradeInfo?.grade) return null;
    const req = GRADE_REQUIREMENTS[gradeInfo.grade];
    if (!req) return null;
    const monthStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const monthSubs = submissions.filter(r => (r.submitted_at||'').startsWith(monthStr));
    const monthUSDT = monthSubs.reduce((s, r) => s + (r.purchase_amount || 0), 0);
    const usdtPct = Math.min(100, (monthUSDT / req.monthlyUSDT) * 100);
    const subPct  = req.subMin > 0 ? Math.min(100, (subActive.length / req.subMin) * 100) : 100;
    const atRisk  = usdtPct < 50 || (req.subMin > 0 && subPct < 100);
    return { req, monthUSDT, usdtPct, subPct, atRisk };
  }, [gradeInfo, submissions, subActive]);

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

            {/* Grade maintenance check */}
            {maintenance && (
              <div className={`rounded-xl p-3 mt-2 space-y-2 ${maintenance.atRisk ? 'bg-red-400/5 border border-red-400/15' : 'bg-emerald-400/5 border border-emerald-400/10'}`}>
                <div className="flex items-center gap-1.5">
                  <Target className={`w-3 h-3 ${maintenance.atRisk ? 'text-red-400' : 'text-emerald-400'}`} />
                  <p className={`text-[9px] font-black uppercase tracking-wider ${maintenance.atRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                    {maintenance.atRisk ? '등급 유지 위험' : '등급 유지 정상'}
                  </p>
                </div>
                <p className="text-[8px] text-slate-400">{maintenance.req.label}</p>
                {/* USDT progress */}
                <div>
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                    <span>월 판매</span>
                    <span>${(maintenance.monthUSDT).toFixed(0)} / ${maintenance.req.monthlyUSDT}</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${maintenance.usdtPct}%`, background: maintenance.usdtPct >= 80 ? '#22c55e' : maintenance.usdtPct >= 50 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
                {/* Sub progress */}
                {maintenance.req.subMin > 0 && (
                  <div>
                    <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                      <span>활성 하위파트너</span>
                      <span>{subActive.length} / {maintenance.req.subMin}명</span>
                    </div>
                    <div className="h-1.5 bg-[#0a0e1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3b82f6] transition-all" style={{ width: `${maintenance.subPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

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