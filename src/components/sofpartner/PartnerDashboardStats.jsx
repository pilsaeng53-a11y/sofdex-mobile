import React, { useMemo } from 'react';
import { TrendingUp, Users, Package, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

function StatBlock({ icon: Icon, label, value, sub, color = '#00d4aa', bg = 'rgba(0,212,170,0.08)' }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold leading-tight mt-0.5" style={{ color }}>{value}</p>
        {sub && <p className="text-[8px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ActivityItem({ item }) {
  const color =
    item.status === 'Approved' ? '#22c55e' :
    item.status === 'Rejected' ? '#ef4444' :
    item.status === 'Reviewing' ? '#3b82f6' :
    item.status === 'Revision Needed' ? '#f59e0b' :
    '#94a3b8';
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.06)] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-white truncate">{item.customer_name || '—'}</p>
        <p className="text-[8px] text-slate-500">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('ko-KR') : '—'} · {formatNumber(item.purchase_amount || 0, 0)} USDT</p>
      </div>
      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ color, background: `${color}18` }}>
        {item.status || 'Processing'}
      </span>
    </div>
  );
}

export default function PartnerDashboardStats({ submissions = [], gradeInfo, subActive = [], subPromoted = [] }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    const totalUSDT = submissions.reduce((s, r) => s + (r.purchase_amount || 0), 0);
    const totalSOF  = submissions.reduce((s, r) => s + (r.sof_quantity || 0), 0);
    const monthly   = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
    const monthlyUSDT = monthly.reduce((s, r) => s + (r.purchase_amount || 0), 0);
    const processing = submissions.filter(r => r.status === 'Processing').length;
    const approved   = submissions.filter(r => r.status === 'Approved').length;
    const rejected   = submissions.filter(r => r.status === 'Rejected').length;
    const subTotalSales = subActive.reduce((s, r) => s + (r.accumulatedSalesKRW || 0), 0);
    const recent = [...submissions].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)).slice(0, 5);
    return { totalUSDT, totalSOF, monthly: monthly.length, monthlyUSDT, processing, approved, rejected, subTotalSales, recent };
  }, [submissions, subActive, thisMonth]);

  const grade = gradeInfo?.grade;
  const gc = grade ? GRADE_CONFIG[grade] : null;

  return (
    <div className="space-y-4">
      {/* Grade badge */}
      {gc && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: gc.bg, border: `1px solid ${gc.border}` }}>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Current Grade</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: gc.color }}>{gc.label}</p>
            <p className="text-[8px] text-slate-500 mt-0.5">프로모션 {gradeInfo.promotionPercent}% · 센터피 {gradeInfo.centerFeePercent}%</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-500">관리 하위파트너</p>
            <p className="text-xl font-bold text-white">{subActive.length}</p>
            <p className="text-[8px] text-slate-600">승급 {subPromoted.length}명</p>
          </div>
        </div>
      )}

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBlock icon={TrendingUp}  label="누적 판매 (USDT)"  value={`$${formatNumber(stats.totalUSDT, 0)}`}  sub="전체 기간" color="#00d4aa" bg="rgba(0,212,170,0.08)" />
        <StatBlock icon={Package}     label="이번 달 건수"       value={stats.monthly}                          sub={`$${formatNumber(stats.monthlyUSDT, 0)} USDT`} color="#3b82f6" bg="rgba(59,130,246,0.08)" />
        <StatBlock icon={Users}       label="하위파트너 누적매출" value={`₩${formatNumber(stats.subTotalSales, 0)}`} sub={`${subActive.length}명 활성`} color="#a78bfa" bg="rgba(139,92,246,0.08)" />
        <StatBlock icon={Package}     label="총 SOF 발행"        value={formatNumber(stats.totalSOF, 0)}         sub="산출 수량 합계" color="#fbbf24" bg="rgba(251,191,36,0.08)" />
      </div>

      {/* Status summary */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-3">제출 현황</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1"><Clock className="w-3 h-3 text-amber-400" /><span className="text-[8px] text-slate-500">검토 중</span></div>
            <p className="text-lg font-bold text-amber-400">{stats.processing}</p>
          </div>
          <div className="text-center border-x border-[rgba(148,163,184,0.08)]">
            <div className="flex items-center justify-center gap-1 mb-1"><CheckCircle className="w-3 h-3 text-green-400" /><span className="text-[8px] text-slate-500">승인</span></div>
            <p className="text-lg font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1"><XCircle className="w-3 h-3 text-red-400" /><span className="text-[8px] text-slate-500">반려</span></div>
            <p className="text-lg font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {stats.recent.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">최근 제출 활동</p>
          {stats.recent.map((item, i) => <ActivityItem key={i} item={item} />)}
        </div>
      )}
    </div>
  );
}