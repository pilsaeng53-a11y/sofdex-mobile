/**
 * RealtimeSalesBoard — Today / Weekly / Monthly sales + top partners + recent activity
 */
import React, { useMemo } from 'react';
import { TrendingUp, Users, Zap, Clock, Trophy, Activity } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

function periodFilter(submissions, days) {
  const cutoff = new Date(Date.now() - days * 86400000);
  return submissions.filter(r => r.submitted_at && new Date(r.submitted_at) >= cutoff);
}

function PeriodCard({ label, count, usdt, sof, color, icon: Icon }) {
  return (
    <div className="glass-card rounded-2xl p-3.5 border border-[rgba(148,163,184,0.05)]">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
      </div>
      <p className="text-xl font-black text-white">{count}<span className="text-[10px] text-slate-500 ml-1">건</span></p>
      <p className="text-[10px] text-[#00d4aa] font-bold">${formatNumber(usdt, 0)} USDT</p>
      <p className="text-[8px] text-slate-500 mt-0.5">{formatNumber(sof, 0)} SOF</p>
    </div>
  );
}

export default function RealtimeSalesBoard({ submissions = [], subActive = [] }) {
  const now = new Date();

  const stats = useMemo(() => {
    const today   = periodFilter(submissions, 1);
    const weekly  = periodFilter(submissions, 7);
    const monthly = periodFilter(submissions, 30);

    const sum = arr => ({
      count: arr.length,
      usdt: arr.reduce((s, r) => s + (r.purchase_amount || 0), 0),
      sof:  arr.reduce((s, r) => s + (r.sof_quantity || 0), 0),
    });

    // Top partners by submissions (group by customer name as proxy for "partner activity")
    const topPartners = [...subActive]
      .sort((a, b) => (b.accumulatedSalesKRW || 0) - (a.accumulatedSalesKRW || 0))
      .slice(0, 5);

    // Recent activity (last 8 submissions)
    const recent = [...submissions]
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .slice(0, 8);

    return { today: sum(today), weekly: sum(weekly), monthly: sum(monthly), topPartners, recent };
  }, [submissions, subActive]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">실시간 영업 현황</p>
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <PeriodCard label="오늘"   icon={Zap}      color="#00d4aa" {...stats.today} />
        <PeriodCard label="이번 주" icon={TrendingUp} color="#3b82f6" {...stats.weekly} />
        <PeriodCard label="이번 달" icon={Activity}  color="#8b5cf6" {...stats.monthly} />
      </div>

      {/* Top subordinates */}
      {stats.topPartners.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">하위 파트너 TOP</p>
          </div>
          <div className="space-y-2">
            {stats.topPartners.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#151c2e] flex items-center justify-center text-[8px] font-black text-slate-400">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">{p.name || p.walletAddress?.slice(0, 8)}</p>
                  <div className="h-1 bg-[#0a0e1a] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#3b82f6]"
                      style={{ width: `${Math.min(100, (p.accumulatedSalesKRW / (stats.topPartners[0]?.accumulatedSalesKRW || 1)) * 100)}%` }} />
                  </div>
                </div>
                <p className="text-[9px] font-bold text-[#00d4aa] flex-shrink-0">₩{formatNumber(p.accumulatedSalesKRW || 0, 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {stats.recent.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">최근 활동</p>
          </div>
          <div className="space-y-0">
            {stats.recent.map((r, i) => {
              const statusColor = r.status === 'Approved' ? '#22c55e' : r.status === 'Rejected' ? '#ef4444' : '#94a3b8';
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{r.customer_name || '고객'}</p>
                    <p className="text-[8px] text-slate-500">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ko-KR') : '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] font-bold text-white">${formatNumber(r.purchase_amount || 0, 0)}</p>
                    <span className="text-[7px] font-bold" style={{ color: statusColor }}>{r.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="py-12 text-center">
          <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">아직 영업 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}