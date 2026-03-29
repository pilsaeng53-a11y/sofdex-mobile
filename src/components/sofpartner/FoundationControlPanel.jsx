/**
 * FoundationControlPanel.jsx
 * Admin-only panel: override submissions, manage visibility requests,
 * detect inactive parents, reassign subordinates.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Check, X, RefreshCw, UserX, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FOUNDATION_STATUSES = ['제출됨', '재단 수정', '재단 확정'];
const STATUS_COLOR = {
  '제출됨': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  '재단 수정': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  '재단 확정': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  'Approved': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

function SubmissionOverrideRow({ record, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState(record.status);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const sc = STATUS_COLOR[record.status] || STATUS_COLOR['제출됨'];

  const save = async () => {
    setSaving(true);
    try {
      const history = [...(record.status_history || []), { status: newStatus, changedAt: new Date().toISOString(), note, changedBy: 'foundation' }];
      await base44.entities.SOFSaleSubmission.update(record.id, { status: newStatus, revision_feedback: note, status_history: history });
      onUpdate?.();
      setExpanded(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="border-b border-[rgba(148,163,184,0.06)] last:border-0">
      <button onClick={() => setExpanded(e => !e)} className="w-full px-4 py-3 text-left flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] font-bold text-white truncate">{record.customer_name}</p>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: sc.color, background: sc.bg }}>{record.status}</span>
          </div>
          <p className="text-[8px] text-slate-500 font-mono truncate">{record.partner_wallet?.slice(0,10)}… · ${(record.purchase_amount || 0).toFixed(0)} USDT</p>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 bg-[#0a0e1a]/50">
          <div className="grid grid-cols-2 gap-2 text-[8px]">
            <div><p className="text-slate-500">SOF 수량</p><p className="text-white font-bold">{(record.sof_quantity || 0).toFixed(2)}</p></div>
            <div><p className="text-slate-500">센터피 수량</p><p className="text-[#00d4aa] font-bold">{(record.center_fee_quantity || 0).toFixed(2)}</p></div>
            <div><p className="text-slate-500">프로모션</p><p className="text-white font-bold">{record.promotion_percent}%</p></div>
            <div><p className="text-slate-500">등급</p><p className="text-white font-bold">{record.partner_grade || '—'}</p></div>
          </div>

          <div>
            <p className="text-[9px] text-slate-400 mb-1.5 font-bold">상태 변경</p>
            <div className="flex gap-1.5 flex-wrap">
              {FOUNDATION_STATUSES.map(s => (
                <button key={s} onClick={() => setNewStatus(s)}
                  className={`text-[8px] font-bold px-2.5 py-1 rounded-full transition-all ${newStatus === s ? 'ring-1 ring-offset-0' : 'opacity-60'}`}
                  style={{ color: STATUS_COLOR[s]?.color, background: STATUS_COLOR[s]?.bg, ...(newStatus === s ? { ringColor: STATUS_COLOR[s]?.color } : {}) }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="재단 메모 (수정 사유 등)"
            rows={2} className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none" />

          <button onClick={save} disabled={saving}
            className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            재단 확정 적용
          </button>
        </div>
      )}
    </div>
  );
}

function VisibilityRequestRow({ req, onUpdate }) {
  const [saving, setSaving] = useState(false);

  const decide = async (approved) => {
    setSaving(true);
    try {
      const newStatus = approved ? '승인됨' : '반려됨';
      await base44.entities.VisibilityRequest.update(req.id, { status: newStatus, reviewed_at: new Date().toISOString() });
      if (approved) {
        const acts = await base44.entities.PartnerActivity.filter({ partner_wallet: req.requester_wallet });
        if (acts.length > 0) {
          await base44.entities.PartnerActivity.update(acts[0].id, { visibility: req.requested_visibility });
        } else {
          await base44.entities.PartnerActivity.create({ partner_wallet: req.requester_wallet, visibility: req.requested_visibility });
        }
      }
      onUpdate?.();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.06)] last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-[10px] font-bold text-white">{req.requester_name || req.requester_wallet?.slice(0,12)}</p>
          <p className="text-[8px] text-slate-500 mt-0.5">{req.current_visibility} → {req.requested_visibility}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => decide(true)} disabled={saving || req.status !== '승인 대기'}
            className="w-7 h-7 rounded-xl bg-emerald-400/10 flex items-center justify-center disabled:opacity-40 hover:bg-emerald-400/20 transition-all">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button onClick={() => decide(false)} disabled={saving || req.status !== '승인 대기'}
            className="w-7 h-7 rounded-xl bg-red-400/10 flex items-center justify-center disabled:opacity-40 hover:bg-red-400/20 transition-all">
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-[8px] text-slate-500">
        <span>{req.reason || '—'}</span>
        <span className={`font-bold ${req.status === '승인됨' ? 'text-emerald-400' : req.status === '반려됨' ? 'text-red-400' : 'text-amber-400'}`}>{req.status}</span>
      </div>
    </div>
  );
}

export default function FoundationControlPanel() {
  const [tab, setTab] = useState('submissions');
  const [submissions, setSubmissions] = useState([]);
  const [visRequests, setVisRequests] = useState([]);
  const [inactivePartners, setInactivePartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, visReqs, activities] = await Promise.all([
        base44.entities.SOFSaleSubmission.list('-submitted_at', 50),
        base44.entities.VisibilityRequest.list('-created_date', 30),
        base44.entities.PartnerActivity.list('-created_date', 50),
      ]);
      setSubmissions(subs);
      setVisRequests(visReqs);

      const now = new Date();
      const inactive = activities.filter(a => {
        if (!a.last_submission_at) return true;
        const daysSince = (now - new Date(a.last_submission_at)) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      });
      setInactivePartners(inactive);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredSubs = statusFilter === 'All' ? submissions : submissions.filter(s => s.status === statusFilter);
  const pendingVis = visRequests.filter(r => r.status === '승인 대기');

  const TABS = [
    { id: 'submissions', label: '제출 관리', badge: submissions.filter(s => s.status === '제출됨').length },
    { id: 'visibility', label: '공개 요청', badge: pendingVis.length },
    { id: 'inactive', label: '비활성 경고', badge: inactivePartners.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'bg-[#151c2e] text-slate-500 border border-transparent'}`}>
            {t.label}
            {t.badge > 0 && <span className="w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center bg-red-500/20 text-red-400">{t.badge}</span>}
          </button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#00d4aa] transition-colors flex-shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Submissions tab */}
      {tab === 'submissions' && (
        <div className="bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(148,163,184,0.07)]">
            <Shield className="w-4 h-4 text-[#00d4aa]" />
            <p className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">제출 현황 · 재단 확정</p>
          </div>
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none">
            {['All', '제출됨', '재단 수정', '재단 확정'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 text-[8px] font-bold px-2.5 py-1 rounded-full transition-all ${statusFilter === s ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#0a0e1a] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
                {s === 'All' ? '전체' : s} {s !== 'All' && `(${submissions.filter(x => x.status === s).length})`}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-slate-500 animate-spin" /></div>
          ) : filteredSubs.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8">해당 제출 없음</p>
          ) : (
            filteredSubs.slice(0, 20).map(r => <SubmissionOverrideRow key={r.id} record={r} onUpdate={load} />)
          )}
        </div>
      )}

      {/* Visibility requests tab */}
      {tab === 'visibility' && (
        <div className="bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(148,163,184,0.07)]">
            <Eye className="w-4 h-4 text-purple-400" />
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">하부 공개 변경 요청</p>
            {pendingVis.length > 0 && <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{pendingVis.length} 대기 중</span>}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-slate-500 animate-spin" /></div>
          ) : visRequests.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8">요청 없음</p>
          ) : (
            visRequests.map(r => <VisibilityRequestRow key={r.id} req={r} onUpdate={load} />)
          )}
        </div>
      )}

      {/* Inactive partners tab */}
      {tab === 'inactive' && (
        <div className="bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(148,163,184,0.07)]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">비활성 파트너 감지</p>
          </div>
          {inactivePartners.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8">비활성 파트너 없음</p>
          ) : (
            inactivePartners.map(p => (
              <div key={p.id} className="px-4 py-3 border-b border-[rgba(148,163,184,0.06)] last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white font-mono">{p.partner_wallet?.slice(0,14)}…</p>
                    <p className="text-[8px] text-amber-400 mt-0.5">
                      {p.last_submission_at
                        ? `마지막 제출: ${new Date(p.last_submission_at).toLocaleDateString('ko-KR')}`
                        : '제출 기록 없음'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-[8px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                      활동 없음 상태 – 수익 구조 제한 가능
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}