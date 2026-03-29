import React, { useState, useMemo } from 'react';
import { Bell, CheckCircle, TrendingUp, FileText, AlertTriangle, X } from 'lucide-react';

function buildNotifications(submissions, subActive, subPromoted) {
  const notes = [];
  const now = Date.now();

  // Inactivity alerts
  const sorted = [...submissions].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  const lastSub = sorted[0];
  const daysSince = lastSub?.submitted_at ? Math.floor((now - new Date(lastSub.submitted_at).getTime()) / 86400000) : 999;
  if (daysSince >= 3 && daysSince < 7) {
    notes.push({ id: 'inactivity-3', type: 'activity', icon: AlertTriangle, color: '#f59e0b', title: `${daysSince}일간 활동 없음`, desc: '최근 3일 이상 제출 기록이 없습니다.', time: new Date().toISOString(), read: false });
  } else if (daysSince >= 7) {
    notes.push({ id: 'inactivity-7', type: 'activity', icon: AlertTriangle, color: '#ef4444', title: `${daysSince}일간 비활성 경고`, desc: '즉시 영업 활동을 재개해 주세요!', time: new Date().toISOString(), read: false });
  }

  // Missing submission this month
  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
  const hasMonthly = submissions.some(r => (r.submitted_at||'').startsWith(thisMonth));
  if (!hasMonthly && submissions.length > 0) {
    notes.push({ id: 'no-monthly', type: 'activity', icon: AlertTriangle, color: '#f59e0b', title: '이번 달 제출 없음', desc: '이번 달 아직 제출 기록이 없습니다.', time: new Date().toISOString(), read: false });
  }

  // Inactive subordinates
  const inactiveSubs = subActive.filter(s => s.lastSubmitAt && (now - new Date(s.lastSubmitAt).getTime()) > 7 * 86400000);
  if (inactiveSubs.length > 0) {
    notes.push({ id: 'inactive-subs', type: 'activity', icon: AlertTriangle, color: '#a78bfa', title: `하위 파트너 ${inactiveSubs.length}명 비활성`, desc: inactiveSubs.map(s=>s.name||'파트너').slice(0,3).join(', ') + ' — 7일 이상 활동 없음', time: new Date().toISOString(), read: false });
  }

  // New submissions from subordinates (mock: just use promoted as "activity")
  subPromoted.forEach(sub => {
    notes.push({
      id: `promo-${sub.walletAddress}`,
      type: 'grade',
      icon: TrendingUp,
      color: '#fbbf24',
      title: `${sub.name || '하위 파트너'} 승급 완료`,
      desc: `${sub.grade} 등급으로 승급하여 조직에서 분리되었습니다`,
      time: sub.lastSubmitAt,
      read: false,
    });
  });

  // Submission status changes
  submissions.filter(r => r.status !== 'Processing').slice(0, 5).forEach(r => {
    const isApproved = r.status === 'Approved';
    const isRejected = r.status === 'Rejected';
    if (!isApproved && !isRejected) return;
    notes.push({
      id: `sub-${r.id}`,
      type: 'submission',
      icon: isApproved ? CheckCircle : AlertTriangle,
      color: isApproved ? '#22c55e' : '#ef4444',
      title: isApproved ? `제출 승인: ${r.customer_name || '고객'}` : `제출 반려: ${r.customer_name || '고객'}`,
      desc: isApproved
        ? `${r.sof_quantity?.toFixed(2) || 0} SOF 발행 승인`
        : `사유: ${r.notes || '관리자에게 문의하세요'}`,
      time: r.submitted_at,
      read: true,
    });
  });

  // Recent submissions (unread simulation)
  submissions.filter(r => r.status === 'Processing').slice(0, 3).forEach(r => {
    notes.push({
      id: `proc-${r.id}`,
      type: 'submission',
      icon: FileText,
      color: '#94a3b8',
      title: `제출 접수: ${r.customer_name || '고객'}`,
      desc: `${r.purchase_amount?.toFixed(0) || 0} USDT · 검토 대기 중`,
      time: r.submitted_at,
      read: false,
    });
  });

  return notes.sort((a, b) => new Date(b.time) - new Date(a.time));
}

export default function NotificationCenter({ submissions = [], subActive = [], subPromoted = [] }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [filter, setFilter] = useState('all');

  const notifications = useMemo(
    () => buildNotifications(submissions, subActive, subPromoted),
    [submissions, subActive, subPromoted]
  );

  const visible = notifications.filter(n =>
    !dismissed.has(n.id) &&
    (filter === 'all' || n.type === filter)
  );

  const unread = visible.filter(n => !n.read).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-bold text-white">알림 센터</span>
          {unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#00d4aa] text-[#05070d] text-[9px] font-black flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        {dismissed.size > 0 && (
          <button onClick={() => setDismissed(new Set())} className="text-[9px] text-slate-500 hover:text-slate-300">
            모두 복원
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all', '전체'], ['submission', '제출'], ['grade', '등급']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`text-[8px] font-bold px-3 py-1 rounded-full transition-all ${filter === v ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#0f1525] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {visible.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">새로운 알림이 없습니다</p>
        </div>
      ) : (
        visible.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id}
              className={`glass-card rounded-xl p-4 flex items-start gap-3 ${!n.read ? 'border-l-2' : ''}`}
              style={{ borderLeftColor: !n.read ? n.color : undefined }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}14` }}>
                <Icon className="w-4 h-4" style={{ color: n.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white">{n.title}</p>
                <p className="text-[8px] text-slate-500 mt-0.5">{n.desc}</p>
                {n.time && (
                  <p className="text-[7px] text-slate-600 mt-1">{new Date(n.time).toLocaleString('ko-KR')}</p>
                )}
              </div>
              <button onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
                className="text-slate-600 hover:text-slate-400 flex-shrink-0 p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}