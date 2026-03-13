import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Vote, Clock, CheckCircle2, XCircle, Users, Calendar,
  TrendingUp, Shield, AlertTriangle, Wallet, ChevronRight, DollarSign, Timer
} from 'lucide-react';
import { GOVERNANCE_PROPOSALS } from '../components/shared/MarketData';
import { useLang } from '../components/shared/LanguageContext';

const STATUS_CONFIG = {
  active:    { key: 'gov_status_active',   color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: Clock },
  passed:    { key: 'gov_status_passed',   color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: CheckCircle2 },
  rejected:  { key: 'gov_status_rejected', color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: XCircle },
  upcoming:  { key: 'gov_status_upcoming', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: Timer },
};

const TIMELINE_STAGES = ['draft', 'discussion', 'voting', 'passed', 'executed'];
const STAGE_KEYS = {
  draft: 'gov_timeline_draft', discussion: 'gov_timeline_discussion',
  voting: 'gov_timeline_voting', passed: 'gov_timeline_passed', executed: 'gov_timeline_executed',
};

function TimelineBar({ currentStage }) {
  const { t } = useLang();
  const idx = TIMELINE_STAGES.indexOf(currentStage);
  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-4">{t('gov_timeline')}</p>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 h-0.5 bg-[#1a2340] top-3" />
        <div
          className="absolute left-0 h-0.5 bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] top-3 transition-all"
          style={{ width: `${Math.max(0, (idx / (TIMELINE_STAGES.length - 1)) * 100)}%` }}
        />
        {TIMELINE_STAGES.map((stage, i) => {
          const done = i <= idx;
          return (
            <div key={stage} className="relative flex flex-col items-center z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'bg-[#00d4aa] border-[#00d4aa]' : 'bg-[#0d1220] border-[#1a2340]'
              }`}>
                {done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className={`text-[8px] mt-1.5 font-semibold capitalize ${done ? 'text-[#00d4aa]' : 'text-slate-600'}`}>
                {t(STAGE_KEYS[stage])}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DEMO_WALLETS = [
  { address: '7xKXt...3mPq', vote: 'yes', power: 124500, label: 'Validator A' },
  { address: 'BnHJ2...9wRs', vote: 'yes', power: 89200,  label: 'DAO Fund' },
  { address: 'Cr4mQ...kL8f', vote: 'no',  power: 45000,  label: 'Anon Whale' },
  { address: 'DpX5v...2nTs', vote: 'yes', power: 31800,  label: 'Staker Pool' },
  { address: 'Eq7Yw...hP0d', vote: 'no',  power: 22400,  label: 'Anon' },
  { address: 'FsK9Z...jM4c', vote: 'yes', power: 18900,  label: 'Foundation' },
];

export default function GovernanceDetail() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [voted, setVoted] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') || '1');
  const proposal = GOVERNANCE_PROPOSALS.find(p => p.id === id) || GOVERNANCE_PROPOSALS[0];

  const config = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.active;
  const Icon = config.icon;

  const handleVote = (dir) => {
    if (proposal.status !== 'active') return;
    setVoted(dir);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Back header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{t('gov_proposalDetail')}</p>
          <p className="text-[10px] text-slate-500 font-mono">SFD-{String(proposal.id).padStart(3, '0')}</p>
        </div>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${config.color}`}>
          <Icon className="w-3 h-3" />
          {t(config.key)}
        </span>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-lg font-black text-white leading-snug mb-2">{proposal.title}</h1>
          {proposal.treasury_impact && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[10px] font-semibold text-amber-400">
              <DollarSign className="w-3 h-3" />
              {t('gov_treasuryImpact')}: {proposal.treasury_impact}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            ['overview', 'gov_tab_overview'],
            ['votes', 'gov_tab_votes'],
            ['timeline', 'gov_tab_timeline'],
            ['wallets', 'gov_tab_wallets'],
          ].map(([val, key]) => (
            <button
              key={val}
              onClick={() => setActiveTab(val)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === val
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-slate-500 border border-transparent'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">{t('gov_description')}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{proposal.description}</p>
            </div>

            {/* Benefits */}
            {proposal.benefits && (
              <div className="glass-card rounded-2xl p-4 border border-[rgba(0,212,170,0.08)]">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('gov_benefits')}</p>
                </div>
                <ul className="space-y-2">
                  {proposal.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {proposal.risks && (
              <div className="glass-card rounded-2xl p-4 border border-[rgba(239,68,68,0.08)]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('gov_risks')}</p>
                </div>
                <ul className="space-y-2">
                  {proposal.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {proposal.notes && (
              <div className="glass-card rounded-2xl p-4 border border-[rgba(59,130,246,0.08)]">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('gov_notes')}</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{proposal.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <div className="grid grid-cols-2 gap-4">
                {proposal.startDate && (
                  <div>
                    <p className="text-[10px] text-slate-600 mb-1">{t('gov_startDate')}</p>
                    <p className="text-xs font-semibold text-slate-300">{proposal.startDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-slate-600 mb-1">{t('gov_endDate')}</p>
                  <p className="text-xs font-semibold text-slate-300">{proposal.endDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 mb-1">{t('gov_proposalId')}</p>
                  <p className="text-xs font-semibold text-slate-300 font-mono">SFD-{String(proposal.id).padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 mb-1">{t('gov_stage')}</p>
                  <p className="text-xs font-semibold text-slate-300 capitalize">{t(STAGE_KEYS[proposal.timeline_stage || 'voting'])}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOTES TAB */}
        {activeTab === 'votes' && (
          <div className="space-y-4">
            {/* Vote bar */}
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-emerald-400">{t('gov_voteYes')} {proposal.yesPercent}%</span>
                <span className="text-sm font-bold text-red-400">{t('gov_voteNo')} {proposal.noPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-[#0d1220] overflow-hidden flex mb-3">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full" style={{ width: `${proposal.yesPercent}%` }} />
                <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full" style={{ width: `${proposal.noPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{(proposal.totalVotes / 1000).toFixed(0)}K {t('gov_votes')}</span>
                </div>
                {proposal.yesPercent === 0 && proposal.noPercent === 0 && (
                  <span className="text-amber-400 text-[10px] font-semibold">{proposal.notes}</span>
                )}
              </div>
            </div>

            {/* Upcoming message */}
            {proposal.status === 'upcoming' && (
              <div className="glass-card rounded-2xl p-4 border border-amber-400/15 text-center">
                <Timer className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white mb-1">{t('gov_votingNotStarted')}</p>
                <p className="text-[11px] text-slate-500">{proposal.notes}</p>
              </div>
            )}

            {/* Vote buttons */}
            {proposal.status === 'active' && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('gov_castVote')}</p>
                {voted ? (
                  <div className="glass-card rounded-2xl p-4 text-center border border-[#00d4aa]/20">
                    <CheckCircle2 className="w-8 h-8 text-[#00d4aa] mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">{t('gov_voteCast')}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{t('gov_youVoted')} <span className={voted === 'yes' ? 'text-emerald-400' : 'text-red-400'}>{voted === 'yes' ? t('gov_voteYes') : t('gov_voteNo')}</span></p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVote('yes')}
                      className="flex-1 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all"
                    >
                      ✓ {t('gov_voteYes')}
                    </button>
                    <button
                      onClick={() => handleVote('no')}
                      className="flex-1 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all"
                    >
                      ✕ {t('gov_voteNo')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quorum info */}
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">{t('gov_quorum')}</p>
              <div className="space-y-2">
                {[
                  [t('gov_participationRate'), '47.3%'],
                  [t('gov_quorumRequired'), '30%'],
                  [t('gov_approvalThreshold'), '51%'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[11px] text-slate-500">{label}</span>
                    <span className="text-[11px] font-semibold text-slate-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <TimelineBar currentStage={proposal.timeline_stage || 'voting'} />
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)] space-y-3">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('gov_stageDetails')}</p>
              {[
                { stage: 'draft',      date: proposal.startDate || '—', desc: t('gov_stage_draft_desc') },
                { stage: 'discussion', date: proposal.startDate || '—', desc: t('gov_stage_discussion_desc') },
                { stage: 'voting',     date: proposal.startDate || proposal.endDate || '—', desc: t('gov_stage_voting_desc') },
                { stage: 'passed',     date: proposal.status === 'passed' ? proposal.endDate : '—', desc: t('gov_stage_passed_desc') },
                { stage: 'executed',   date: '—', desc: t('gov_stage_executed_desc') },
              ].map(({ stage, date, desc }, i) => {
                const idx = TIMELINE_STAGES.indexOf(proposal.timeline_stage || 'voting');
                const stageIdx = TIMELINE_STAGES.indexOf(stage);
                const done = stageIdx <= idx;
                return (
                  <div key={stage} className={`flex items-start gap-3 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0 ${done ? '' : 'opacity-40'}`}>
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${done ? 'bg-[#00d4aa]/20' : 'bg-[#151c2e]'}`}>
                      <span className={`text-[9px] font-bold ${done ? 'text-[#00d4aa]' : 'text-slate-600'}`}>{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-[11px] font-semibold text-slate-300 capitalize">{t(STAGE_KEYS[stage])}</p>
                        <p className="text-[10px] text-slate-600">{date}</p>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WALLETS TAB */}
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">{t('gov_walletParticipation')}</p>
              {DEMO_WALLETS.map((w, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#151c2e] flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300">{w.label}</p>
                      <p className="text-[9px] text-slate-600 font-mono">{w.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[11px] font-bold ${w.vote === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {w.vote === 'yes' ? '✓ YES' : '✕ NO'}
                    </p>
                    <p className="text-[9px] text-slate-600">{(w.power / 1000).toFixed(1)}K {t('gov_votingPower')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}