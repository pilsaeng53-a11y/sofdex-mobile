/**
 * PartnerApplication.jsx
 * Complete Partner Application & Upgrade lifecycle system.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, TrendingUp, Users, BookOpen, History,
  CheckCircle, XCircle, ChevronDown, ChevronRight,
  ExternalLink, ClipboardCheck, Shield, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/shared/WalletContext';
import { DEV_MODE, DEV_WALLET } from '@/components/shared/devConfig';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

const EXAM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeDew1vjOWsjK4z9ZMFbn1ybndUi8M7xD40TfLggP0qkFxsCw/viewform';

const STATUS_CONFIG = {
  'Submitted':    { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'Under Review': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Approved':     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'Rejected':     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const SECTION_IDS = ['new', 'upgrade', 'subordinate', 'exam', 'history'];
const SECTION_LABELS = ['신규 신청', '자체 승급', '하위 승급', '시험', '신청 내역'];
const SECTION_ICONS = [UserPlus, TrendingUp, Users, BookOpen, History];

function CheckItem({ label, checked }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      {checked
        ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
      }
      <span className={`text-[11px] font-medium ${checked ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, color, children }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.06)]">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[rgba(148,163,184,0.07)]"
        style={{ background: `${color}08` }}>
        <Icon className="w-4 h-4" style={{ color }} />
        <h2 className="text-sm font-black text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.Submitted;
  return (
    <span className="text-[9px] font-black px-2.5 py-1 rounded-full" style={{ color: sc.color, background: sc.bg }}>
      {status}
    </span>
  );
}

function AppRow({ app, onClick, isExpanded }) {
  const typeLabel = { new_partner: '신규', self_upgrade: '자체승급', subordinate_upgrade: '하위승급' };
  return (
    <div className="border border-[rgba(148,163,184,0.06)] rounded-xl overflow-hidden mb-2">
      <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#151c2e] transition-all text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-bold text-white">{app.applicant_name}</p>
            <span className="text-[7px] bg-[#151c2e] text-slate-400 px-1.5 py-0.5 rounded-full">{typeLabel[app.application_type]}</span>
            {app.target_grade && (
              <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: GRADE_CONFIG[app.target_grade]?.color, background: GRADE_CONFIG[app.target_grade]?.bg }}>
                → {app.target_grade}
              </span>
            )}
          </div>
          <p className="text-[8px] text-slate-600 font-mono mt-0.5">{app.wallet_address?.slice(0, 12)}...</p>
        </div>
        <StatusBadge status={app.status} />
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
      </button>
      {isExpanded && (
        <div className="px-4 py-3 bg-[#0a0e1a] space-y-2 border-t border-[rgba(148,163,184,0.06)]">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['현재 등급', app.current_grade || 'NONE'],
              ['목표 등급', app.target_grade || '—'],
              ['시험 상태', app.exam_status === 'completed' ? '완료' : '미완료'],
              ['제출일', app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('ko-KR') : '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#151c2e] rounded-xl p-2.5">
                <p className="text-[8px] text-slate-500 mb-0.5">{k}</p>
                <p className="text-[10px] font-bold text-white">{v}</p>
              </div>
            ))}
          </div>
          {app.checklist && (
            <div className="bg-[#151c2e] rounded-xl p-3">
              <p className="text-[8px] font-bold text-slate-500 uppercase mb-2">체크리스트</p>
              {Object.entries(app.checklist).map(([k, v]) => {
                const labels = {
                  academy_completed: '아카데미 수료',
                  social_followed: '소셜 채널 팔로우',
                  referrals_5: '추천인 5명 달성',
                  exam_passed: '시험 합격',
                  purple_subs_3: 'PURPLE 하위 3명',
                  office_established: '센터 설립',
                };
                return <CheckItem key={k} label={labels[k] || k} checked={v} />;
              })}
            </div>
          )}
          {app.notes && <p className="text-[9px] text-slate-400 bg-[#151c2e] rounded-xl p-3">{app.notes}</p>}
          {app.admin_notes && (
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
              <p className="text-[8px] text-amber-400 font-bold mb-1">관리자 메모</p>
              <p className="text-[9px] text-slate-300">{app.admin_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PartnerApplicationPage() {
  const { address, isConnected } = useWallet();
  const effectiveWallet = DEV_MODE ? DEV_WALLET : address;
  const [activeSection, setActiveSection] = useState('new');
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // New partner form
  const [newForm, setNewForm] = useState({ name: '', wallet: effectiveWallet || '', referrer: '', notes: '', academy: false, social: false });
  // Self upgrade
  const [selfGrade, setSelfGrade] = useState('GREEN');
  const [selfChecklist, setSelfChecklist] = useState({ academy: false, social: false, referrals5: false, exam: false, purple3: false, office: false });
  // Subordinate
  const [subWallet, setSubWallet] = useState('');
  const [subName, setSubName] = useState('');
  const [subGrade, setSubGrade] = useState('GREEN');
  const [subTarget, setSubTarget] = useState('PURPLE');
  // Exam
  const [examDone, setExamDone] = useState(false);

  const GRADE_ORDER = ['GREEN', 'PURPLE', 'GOLD', 'PLATINUM'];

  useEffect(() => {
    loadApplications();
  }, [effectiveWallet]);

  async function loadApplications() {
    if (!effectiveWallet) return;
    setLoading(true);
    try {
      const apps = await base44.entities.PartnerApplication.filter({ wallet_address: effectiveWallet }, '-submitted_at', 50);
      setApplications(apps);
    } catch {}
    setLoading(false);
  }

  async function submitNewPartner() {
    setSubmitting(true);
    try {
      await base44.entities.PartnerApplication.create({
        applicant_name: newForm.name,
        wallet_address: newForm.wallet,
        referrer_wallet: newForm.referrer,
        application_type: 'new_partner',
        current_grade: 'NONE',
        target_grade: 'GREEN',
        checklist: { academy_completed: newForm.academy, social_followed: newForm.social, referrals_5: false, exam_passed: false },
        notes: newForm.notes,
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
      });
      setSuccess('신규 파트너 신청이 제출되었습니다!');
      setNewForm({ name: '', wallet: effectiveWallet || '', referrer: '', notes: '', academy: false, social: false });
      loadApplications();
    } catch {}
    setSubmitting(false);
  }

  const selfTargetGrade = GRADE_ORDER[Math.min(GRADE_ORDER.indexOf(selfGrade) + 1, GRADE_ORDER.length - 1)];

  const selfRequirements = {
    'GREEN→PURPLE': [
      { key: 'academy', label: '아카데미 수료' },
      { key: 'social', label: '소셜 채널 팔로우 (X / Discord / Telegram)' },
      { key: 'referrals5', label: '추천인 5명 달성' },
      { key: 'exam', label: '업그레이드 시험 합격' },
    ],
    'PURPLE→GOLD': [
      { key: 'purple3', label: 'PURPLE 하위 파트너 3명' },
      { key: 'office', label: '또는 센터 설립' },
    ],
    'GOLD→PLATINUM': [],
  };
  const reqKey = `${selfGrade}→${selfTargetGrade}`;
  const currentReqs = selfRequirements[reqKey] || [];
  const allMet = currentReqs.length > 0 && currentReqs.every(r => selfChecklist[r.key]);

  async function submitSelfUpgrade() {
    setSubmitting(true);
    try {
      await base44.entities.PartnerApplication.create({
        applicant_name: newForm.name || effectiveWallet?.slice(0, 8),
        wallet_address: effectiveWallet,
        application_type: 'self_upgrade',
        current_grade: selfGrade,
        target_grade: selfTargetGrade,
        checklist: {
          academy_completed: selfChecklist.academy,
          social_followed: selfChecklist.social,
          referrals_5: selfChecklist.referrals5,
          exam_passed: selfChecklist.exam,
          purple_subs_3: selfChecklist.purple3,
          office_established: selfChecklist.office,
        },
        exam_status: examDone ? 'completed' : 'not_started',
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
      });
      setSuccess('승급 신청이 제출되었습니다!');
      loadApplications();
    } catch {}
    setSubmitting(false);
  }

  async function submitSubUpgrade() {
    setSubmitting(true);
    try {
      await base44.entities.PartnerApplication.create({
        applicant_name: newForm.name || effectiveWallet?.slice(0, 8),
        wallet_address: effectiveWallet,
        application_type: 'subordinate_upgrade',
        current_grade: subGrade,
        target_grade: subTarget,
        subordinate_wallet: subWallet,
        subordinate_name: subName,
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
      });
      setSuccess('하위 파트너 승급 요청이 제출되었습니다!');
      setSubWallet(''); setSubName('');
      loadApplications();
    } catch {}
    setSubmitting(false);
  }

  const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40";
  const selectCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40";

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(0,212,170,0.2),rgba(59,130,246,0.2))', border: '1px solid rgba(0,212,170,0.3)' }}>
            <UserPlus className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">파트너 신청 & 승급</h1>
            <p className="text-[10px] text-slate-500">Partner Application & Upgrade System</p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-xl px-3 py-2.5">
          <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-amber-400/80">모든 승급은 재단 승인이 필요합니다. All upgrades are subject to foundation approval.</p>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-emerald-400 font-bold">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-600 text-xs">✕</button>
        </div>
      )}

      {/* Section nav */}
      <div className="flex gap-1 px-4 mb-5 overflow-x-auto scrollbar-none">
        {SECTION_IDS.map((id, i) => {
          const Icon = SECTION_ICONS[i];
          return (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                activeSection === id
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                  : 'bg-[#151c2e] text-slate-500 border border-transparent'
              }`}>
              <Icon className="w-3 h-3" />{SECTION_LABELS[i]}
            </button>
          );
        })}
      </div>

      <div className="px-4 space-y-4">

        {/* ── NEW PARTNER ── */}
        {activeSection === 'new' && (
          <SectionCard title="Apply as a New Partner" icon={UserPlus} color="#00d4aa">
            <div className="space-y-3">
              <input value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                placeholder="이름" className={inputCls} />
              <input value={newForm.wallet} onChange={e => setNewForm(p => ({ ...p, wallet: e.target.value }))}
                placeholder="지갑 주소 (Wallet Address)" className={inputCls} />
              <input value={newForm.referrer} onChange={e => setNewForm(p => ({ ...p, referrer: e.target.value }))}
                placeholder="추천인 지갑 주소 (Referrer / Parent)" className={inputCls} />
              <textarea value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="특이사항 / 메모 (Notes)" rows={3} className={inputCls + ' resize-none'} />

              <div className="bg-[#0a0e1a] rounded-2xl p-4 space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">체크리스트</p>
                {[
                  { key: 'academy', label: '아카데미 수료 (Academy Completed)' },
                  { key: 'social',  label: '소셜 채널 팔로우 — X / Discord / Telegram' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 py-2 cursor-pointer">
                    <div onClick={() => setNewForm(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        newForm[item.key] ? 'bg-[#00d4aa]/20 border-[#00d4aa]/40' : 'border-[rgba(148,163,184,0.15)]'
                      }`}>
                      {newForm[item.key] && <CheckCircle className="w-3.5 h-3.5 text-[#00d4aa]" />}
                    </div>
                    <span className="text-[11px] text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>

              <button onClick={submitNewPartner} disabled={submitting || !newForm.name || !newForm.wallet}
                className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg,#00d4aa,#3b82f6)', opacity: (submitting || !newForm.name || !newForm.wallet) ? 0.6 : 1 }}>
                <UserPlus className="w-4 h-4" />
                {submitting ? '제출 중...' : 'Submit Partner Application'}
              </button>
              <p className="text-[9px] text-slate-600 text-center">Application Status: 제출 후 재단 검토 → 승인/반려</p>
            </div>
          </SectionCard>
        )}

        {/* ── SELF UPGRADE ── */}
        {activeSection === 'upgrade' && (
          <SectionCard title="Upgrade Your Partner Level" icon={TrendingUp} color="#8b5cf6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Current Grade</label>
                  <select value={selfGrade} onChange={e => setSelfGrade(e.target.value)} className={selectCls}>
                    {['GREEN', 'PURPLE', 'GOLD'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Target Grade</label>
                  <div className="px-4 py-3 rounded-xl text-sm font-black"
                    style={{ background: GRADE_CONFIG[selfTargetGrade]?.bg, color: GRADE_CONFIG[selfTargetGrade]?.color, border: `1px solid ${GRADE_CONFIG[selfTargetGrade]?.border}` }}>
                    {selfTargetGrade}
                  </div>
                </div>
              </div>

              {selfGrade === 'GOLD' ? (
                <div className="flex items-start gap-2.5 bg-amber-400/5 border border-amber-400/15 rounded-xl p-4">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-black text-amber-400">GOLD → PLATINUM</p>
                    <p className="text-[9px] text-slate-400 mt-1">PLATINUM 승급은 재단 단독 승인 사항입니다. Foundation Approval Required.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#0a0e1a] rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-3">요건 체크리스트</p>
                    {currentReqs.map(req => (
                      <label key={req.key} className="flex items-center gap-3 py-2 cursor-pointer border-b border-[rgba(148,163,184,0.05)] last:border-0">
                        <div onClick={() => setSelfChecklist(p => ({ ...p, [req.key]: !p[req.key] }))}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            selfChecklist[req.key] ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/40' : 'border-[rgba(148,163,184,0.15)]'
                          }`}>
                          {selfChecklist[req.key] && <CheckCircle className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                        </div>
                        <span className={`text-[11px] ${selfChecklist[req.key] ? 'text-slate-300 line-through' : 'text-slate-400'}`}>{req.label}</span>
                        {selfChecklist[req.key]
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-slate-600 ml-auto flex-shrink-0" />}
                      </label>
                    ))}

                    {/* Progress */}
                    <div className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.06)]">
                      <div className="flex justify-between text-[8px] text-slate-500 mb-1.5">
                        <span>완료율</span>
                        <span>{currentReqs.filter(r => selfChecklist[r.key]).length}/{currentReqs.length}</span>
                      </div>
                      <div className="h-2 bg-[#151c2e] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]"
                          style={{ width: `${currentReqs.length ? (currentReqs.filter(r => selfChecklist[r.key]).length / currentReqs.length * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <a href={EXAM_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <button className="w-full py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-1.5 bg-[#3b82f6]/15 border border-[#3b82f6]/25 text-[#3b82f6]">
                        <BookOpen className="w-4 h-4" />Take Upgrade Exam
                      </button>
                    </a>
                    <button onClick={submitSelfUpgrade} disabled={!allMet || submitting}
                      className="flex-1 py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: allMet ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)' : '#1e2a42', opacity: (!allMet || submitting) ? 0.5 : 1 }}>
                      <TrendingUp className="w-4 h-4" />Apply for Upgrade
                    </button>
                  </div>
                  {!allMet && <p className="text-[9px] text-slate-600 text-center">모든 요건을 충족해야 신청 버튼이 활성화됩니다</p>}
                </>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── SUBORDINATE UPGRADE ── */}
        {activeSection === 'subordinate' && (
          <SectionCard title="Request Upgrade for Subordinate" icon={Users} color="#f59e0b">
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 bg-[#0a0e1a] rounded-xl p-3">
                Upgrade requests require foundation approval — 하위 파트너 승급 요청은 재단 승인이 필요합니다.
              </p>
              <input value={subName} onChange={e => setSubName(e.target.value)}
                placeholder="하위 파트너 이름" className={inputCls} />
              <input value={subWallet} onChange={e => setSubWallet(e.target.value)}
                placeholder="하위 파트너 지갑 주소" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 mb-1.5 block">현재 등급</label>
                  <select value={subGrade} onChange={e => setSubGrade(e.target.value)} className={selectCls}>
                    {['GREEN', 'PURPLE', 'GOLD'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 mb-1.5 block">목표 등급</label>
                  <select value={subTarget} onChange={e => setSubTarget(e.target.value)} className={selectCls}>
                    {['PURPLE', 'GOLD', 'PLATINUM'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Requirement reference */}
              <div className="bg-[#0a0e1a] rounded-2xl p-4">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">요건 참조 ({subGrade} → {subTarget})</p>
                {selfRequirements[`${subGrade}→${subTarget}`]?.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 text-[10px] text-slate-400 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600" />
                    {r.label}
                  </div>
                )) || <p className="text-[9px] text-amber-400">재단 승인 필요</p>}
              </div>

              <button onClick={submitSubUpgrade} disabled={submitting || !subWallet || !subName}
                className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', opacity: (submitting || !subWallet || !subName) ? 0.6 : 1 }}>
                <Users className="w-4 h-4" />
                {submitting ? '제출 중...' : 'Submit Upgrade Request'}
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── EXAM ── */}
        {activeSection === 'exam' && (
          <SectionCard title="Upgrade Exam" icon={BookOpen} color="#3b82f6">
            <div className="space-y-4">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Complete the upgrade exam to qualify for promotion — 승급 자격을 얻으려면 업그레이드 시험을 완료하세요.
              </p>
              <a href={EXAM_URL} target="_blank" rel="noopener noreferrer">
                <button className="w-full py-4 rounded-2xl text-sm font-black text-[#3b82f6] flex items-center justify-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/25 hover:bg-[#3b82f6]/20 transition-all">
                  <ExternalLink className="w-4 h-4" />Take Upgrade Exam
                </button>
              </a>
              <label className="flex items-center gap-3 py-3 bg-[#0a0e1a] rounded-2xl px-4 cursor-pointer">
                <div onClick={() => setExamDone(v => !v)}
                  className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                    examDone ? 'bg-emerald-400/20 border-emerald-400/40' : 'border-[rgba(148,163,184,0.15)]'
                  }`}>
                  {examDone && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Mark as Exam Completed</span>
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: examDone ? 'rgba(34,197,94,0.08)' : 'rgba(148,163,184,0.05)', border: `1px solid ${examDone ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.1)'}` }}>
                {examDone
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                <span className="text-[11px] font-bold" style={{ color: examDone ? '#22c55e' : '#64748b' }}>
                  Exam Status: {examDone ? 'Completed' : 'Not Completed'}
                </span>
              </div>
              <div className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-xl p-3">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-400/80">시험 완료 표시는 파트너 본인의 선언입니다. 재단이 실제 기록을 확인 후 최종 승인합니다.</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── HISTORY ── */}
        {activeSection === 'history' && (
          <SectionCard title="Application History" icon={History} color="#94a3b8">
            {loading ? (
              <div className="py-8 flex justify-center"><div className="w-5 h-5 spin-glow" /></div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center">
                <ClipboardCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">신청 내역이 없습니다</p>
              </div>
            ) : (
              <div>
                <p className="text-[9px] text-slate-500 mb-3">{applications.length}건의 신청 내역</p>
                {applications.map(app => (
                  <AppRow key={app.id} app={app}
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    isExpanded={expandedId === app.id} />
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}