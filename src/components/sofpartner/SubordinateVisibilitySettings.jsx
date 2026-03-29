/**
 * SubordinateVisibilitySettings.jsx
 * Allows partner to request visibility change (공개 ↔ 비공개)
 * Requests go to foundation for approval.
 */
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_STYLE = {
  '승인 대기': { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  '승인됨':   { icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  '반려됨':   { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function SubordinateVisibilitySettings({ walletAddress, partnerName }) {
  const [currentVisibility, setCurrentVisibility] = useState('공개');
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activityData, setActivityData] = useState(null);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const [activities, requests] = await Promise.all([
          base44.entities.PartnerActivity.filter({ partner_wallet: walletAddress }),
          base44.entities.VisibilityRequest.filter({ requester_wallet: walletAddress }, '-created_date', 5),
        ]);
        if (activities.length > 0) {
          setActivityData(activities[0]);
          setCurrentVisibility(activities[0].visibility || '공개');
        }
        const pending = requests.find(r => r.status === '승인 대기');
        const latest = requests[0];
        setPendingRequest(pending || latest || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [walletAddress]);

  const requestChange = async (newVisibility) => {
    if (!walletAddress) return;
    setSubmitting(true);
    try {
      await base44.entities.VisibilityRequest.create({
        requester_wallet: walletAddress,
        requester_name: partnerName || '—',
        requested_visibility: newVisibility,
        current_visibility: currentVisibility,
        status: '승인 대기',
        reason: reason || '사용자 요청',
      });
      setPendingRequest({ requested_visibility: newVisibility, status: '승인 대기', created_date: new Date().toISOString() });
      setShowForm(false);
      setReason('');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-3">
      <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
      <span className="text-xs text-slate-500">불러오는 중...</span>
    </div>
  );

  const hasPending = pendingRequest?.status === '승인 대기';

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        {currentVisibility === '공개' ? <Eye className="w-4 h-4 text-[#00d4aa]" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">하부 공개 설정</p>
      </div>

      {/* Current status */}
      <div className="bg-[#0a0e1a] rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">현재 상태</p>
          <p className={`text-sm font-bold ${currentVisibility === '공개' ? 'text-[#00d4aa]' : 'text-amber-400'}`}>{currentVisibility}</p>
        </div>
        {pendingRequest && (() => {
          const cfg = STATUS_STYLE[pendingRequest.status] || STATUS_STYLE['승인 대기'];
          const Icon = cfg.icon;
          return (
            <div className="text-right">
              <p className="text-[9px] text-slate-500 mb-0.5">요청 상태</p>
              <div className="flex items-center gap-1 justify-end">
                <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                <span className="text-xs font-bold" style={{ color: cfg.color }}>{pendingRequest.status}</span>
              </div>
              {pendingRequest.status === '승인 대기' && (
                <p className="text-[8px] text-slate-600 mt-0.5">→ {pendingRequest.requested_visibility} 요청 중</p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Request change */}
      {!hasPending && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 rounded-xl text-xs font-bold text-slate-300 bg-[#151c2e] border border-[rgba(148,163,184,0.1)] hover:border-[#00d4aa]/30 transition-all">
          공개 설정 변경 요청
        </button>
      )}

      {hasPending && (
        <div className="text-[9px] text-amber-400/80 bg-amber-400/5 border border-amber-400/15 rounded-xl px-3 py-2 text-center">
          재단 승인 대기 중 — 승인 후 자동 적용됩니다
        </div>
      )}

      {showForm && !hasPending && (
        <div className="space-y-3 bg-[#0a0e1a] rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase">변경 요청</p>
          <div className="grid grid-cols-2 gap-2">
            {['공개', '비공개'].map(opt => (
              <button key={opt} onClick={() => requestChange(opt)} disabled={submitting || opt === currentVisibility}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${opt === currentVisibility ? 'bg-[#151c2e] text-slate-600 cursor-not-allowed' : 'bg-[#151c2e] text-white hover:bg-[#00d4aa]/10 hover:text-[#00d4aa] border border-[rgba(148,163,184,0.1)] hover:border-[#00d4aa]/30'}`}>
                {opt === '공개' ? '🔓 공개' : '🔒 비공개'}
                {opt === currentVisibility && <span className="ml-1 text-[8px]">(현재)</span>}
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="변경 사유 (선택)"
            rows={2}
            className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-xs text-slate-500 bg-[#151c2e]">취소</button>
          </div>
        </div>
      )}

      <p className="text-[8px] text-slate-600 leading-relaxed">
        * 공개 시 상위 파트너가 매출/수량/제출 내역을 볼 수 있습니다.<br />
        * 비공개 시 이름/지갑/등급만 표시됩니다. 변경은 재단 승인 후 적용됩니다.
      </p>
    </div>
  );
}