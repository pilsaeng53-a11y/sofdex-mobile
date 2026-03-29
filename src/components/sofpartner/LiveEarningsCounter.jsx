/**
 * LiveEarningsCounter — animated real-time SOF earnings estimate
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

export default function LiveEarningsCounter({ submissions = [], gradeInfo }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const approved = submissions.filter(r => r.status === 'Approved');
    const totalCenterFee = approved.reduce((s, r) => s + (r.center_fee_quantity || 0), 0);
    const totalSOF = approved.reduce((s, r) => s + (r.sof_quantity || 0), 0);
    const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const monthly = approved.filter(r => (r.submitted_at || '').startsWith(thisMonth));
    const monthlyFee = monthly.reduce((s, r) => s + (r.center_fee_quantity || 0), 0);
    // Estimate live: small noise
    const noise = Math.sin(tick * 0.7) * 0.02 * totalCenterFee;
    return { totalCenterFee: totalCenterFee + noise, totalSOF, monthlyFee };
  }, [submissions, tick]);

  const grade = gradeInfo?.grade;
  const feeRate = gradeInfo?.centerFeePercent || 0;

  return (
    <div className="glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" style={{ boxShadow: '0 0 8px rgba(0,212,170,0.8)' }} />
        <p className="text-[9px] font-black text-[#00d4aa] uppercase tracking-wider">라이브 수익 카운터</p>
        <span className="ml-auto text-[8px] text-slate-600">실시간 추정</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-[8px] text-slate-500 mb-1">센터피 SOF</p>
          <p className="text-lg font-black text-[#00d4aa] transition-all duration-700">
            {formatNumber(stats.totalCenterFee, 1)}
          </p>
          <p className="text-[7px] text-slate-600">전체 누적</p>
        </div>
        <div className="text-center border-x border-[rgba(148,163,184,0.08)]">
          <p className="text-[8px] text-slate-500 mb-1">이번 달</p>
          <p className="text-lg font-black text-amber-400">{formatNumber(stats.monthlyFee, 1)}</p>
          <p className="text-[7px] text-slate-600">SOF</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-slate-500 mb-1">센터피율</p>
          <p className="text-lg font-black text-[#8b5cf6]">{feeRate}%</p>
          <p className="text-[7px] text-slate-600">{grade || '—'}</p>
        </div>
      </div>

      {stats.totalSOF > 0 && (
        <div className="bg-[#0a0e1a] rounded-xl px-3 py-2 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <p className="text-[9px] text-slate-300">승인된 총 SOF 발행량: <span className="font-black text-white">{formatNumber(stats.totalSOF, 0)}</span></p>
        </div>
      )}

      {submissions.filter(r => r.status === 'Approved').length === 0 && (
        <p className="text-[9px] text-slate-600 text-center py-2">승인된 제출이 있으면 여기에 수익이 집계됩니다</p>
      )}
    </div>
  );
}