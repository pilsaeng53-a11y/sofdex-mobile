/**
 * ActivityPressure — inactivity alerts, below-target warnings, missing submission detection
 */
import React, { useMemo } from 'react';
import { AlertTriangle, Flame, Target, XCircle, TrendingDown, CheckCircle } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

function Alert({ icon: Icon, title, desc, color, bg }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-2xl"
      style={{ background: bg, border: `1px solid ${color}30` }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <div>
        <p className="text-[10px] font-black text-white">{title}</p>
        <p className="text-[9px] mt-0.5" style={{ color: `${color}cc` }}>{desc}</p>
      </div>
    </div>
  );
}

export default function ActivityPressure({ submissions = [], gradeInfo, subActive = [] }) {
  const alerts = useMemo(() => {
    const result = [];
    const now = Date.now();

    // Last submission date
    const sorted = [...submissions].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    const lastSub = sorted[0];
    const lastSubMs = lastSub?.submitted_at ? new Date(lastSub.submitted_at).getTime() : 0;
    const daysSinceLastSub = lastSubMs ? Math.floor((now - lastSubMs) / 86400000) : 999;

    if (daysSinceLastSub === 0) {
      result.push({ icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.06)', title: '오늘 활동 완료', desc: '오늘 제출 기록이 있습니다. 훌륭합니다!' });
    } else if (daysSinceLastSub <= 1) {
      // ok
    } else if (daysSinceLastSub <= 3) {
      result.push({ icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', title: `${daysSinceLastSub}일간 제출 없음`, desc: '최근 영업 활동이 감지되지 않았습니다. 오늘 제출을 목표로 하세요.' });
    } else if (daysSinceLastSub <= 7) {
      result.push({ icon: Flame, color: '#ef4444', bg: 'rgba(239,68,68,0.06)', title: `${daysSinceLastSub}일간 비활성`, desc: '연속 비활성 상태입니다. 즉시 영업 활동을 재개하세요!' });
    } else {
      result.push({ icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', title: '장기 비활성 경고', desc: `${daysSinceLastSub}일간 제출 기록 없음. 등급 유지 요건을 확인하세요.` });
    }

    // No submission this month
    const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const monthSubs = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
    if (monthSubs.length === 0 && daysSinceLastSub > 0) {
      result.push({ icon: TrendingDown, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', title: '이번 달 제출 없음', desc: '이번 달 아직 제출 기록이 없습니다. 월간 목표를 확인하세요.' });
    }

    // Inactive subordinates
    const inactiveSubs = subActive.filter(s => {
      if (!s.lastSubmitAt) return true;
      return (now - new Date(s.lastSubmitAt).getTime()) > 7 * 86400000;
    });
    if (inactiveSubs.length > 0) {
      result.push({
        icon: AlertTriangle, color: '#a78bfa', bg: 'rgba(139,92,246,0.06)',
        title: `하위 파트너 ${inactiveSubs.length}명 비활성`,
        desc: inactiveSubs.map(s => s.name || '파트너').join(', ') + ' — 7일 이상 활동 없음'
      });
    }

    // Below target (if monthly < 5 subs)
    const monthlyCount = monthSubs.length;
    const TARGET = 5;
    if (monthlyCount < TARGET && monthlyCount > 0) {
      result.push({
        icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.06)',
        title: '월간 목표 미달',
        desc: `이번 달 ${monthlyCount}건 / 목표 ${TARGET}건. ${TARGET - monthlyCount}건 추가 필요합니다.`
      });
    }

    return result;
  }, [submissions, subActive]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-1">활동 경보 & 압박 시스템</p>
      {alerts.map((a, i) => <Alert key={i} {...a} />)}
    </div>
  );
}