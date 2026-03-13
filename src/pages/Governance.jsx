import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Vote, Clock, CheckCircle2, XCircle, Users, Zap, Timer, ChevronRight, DollarSign } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { GOVERNANCE_PROPOSALS } from '../components/shared/MarketData';
import { useSOFPrice, formatSOFPrice } from '../components/shared/useSOFPrice';

const STATUS_CONFIG = {
  active:   { key: 'gov_status_active',   color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: Clock },
  passed:   { key: 'gov_status_passed',   color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: CheckCircle2 },
  rejected: { key: 'gov_status_rejected', color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: XCircle },
  upcoming: { key: 'gov_status_upcoming', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: Timer },
};

function ProposalCard({ proposal }) {
  const { t } = useLang();
  const config = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.active;
  const Icon = config.icon;

  return (
    <Link to={`${createPageUrl('GovernanceDetail')}?id=${proposal.id}`}>
      <div className="glass-card rounded-2xl p-4 glow-border hover:bg-[#1a2340] transition-all cursor-pointer">
        {/* Status + ID */}
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${config.color}`}>
            <Icon className="w-3 h-3" />
            {t(config.key)}
          </span>
          <div className="flex items-center gap-2">
            {proposal.treasury_impact && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[9px] font-semibold">
                <DollarSign className="w-2.5 h-2.5" /> Treasury
              </span>
            )}
            <span className="text-[10px] text-slate-600 font-mono">SFD-{String(proposal.id).padStart(3, '0')}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{proposal.title}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{proposal.description}</p>

        {/* Vote bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-emerald-400 font-semibold">{t('gov_voteYes')} {proposal.yesPercent}%</span>
            <span className="text-[11px] text-red-400 font-semibold">{t('gov_voteNo')} {proposal.noPercent}%</span>
          </div>
          {proposal.yesPercent === 0 && proposal.noPercent === 0 ? (
            <div className="h-2 rounded-full bg-[#1a2340] flex items-center justify-center">
              <span className="text-[9px] text-slate-600">Voting not started</span>
            </div>
          ) : (
            <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full" style={{ width: `${proposal.yesPercent}%` }} />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full" style={{ width: `${proposal.noPercent}%` }} />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{proposal.totalVotes > 0 ? `${(proposal.totalVotes / 1000).toFixed(0)}K ${t('gov_votes')}` : t('gov_awaitingVotes')}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>{proposal.status === 'active' ? `${t('gov_ends')} ${proposal.endDate}` : proposal.status === 'upcoming' ? `${t('gov_starts')} ${proposal.startDate}` : `${t('gov_ended')} ${proposal.endDate}`}</span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
          </div>
        </div>

        {/* Vote buttons for active */}
        {proposal.status === 'active' && (
          <div className="flex gap-2 mt-4" onClick={e => e.preventDefault()}>
            <button className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all">
              {t('gov_voteYes')}
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
              {t('gov_voteNo')}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Governance() {
  const { t } = useLang();
  const sofPrice = useSOFPrice();
  const [filter, setFilter] = useState('all');

  const FILTER_TABS = [
    { key: 'all',      labelKey: 'gov_all' },
    { key: 'active',   labelKey: 'gov_active' },
    { key: 'upcoming', labelKey: 'gov_status_upcoming' },
    { key: 'passed',   labelKey: 'gov_passed' },
    { key: 'rejected', labelKey: 'gov_rejected' },
  ];

  const filtered = filter === 'all'
    ? GOVERNANCE_PROPOSALS
    : GOVERNANCE_PROPOSALS.filter(p => p.status === filter);

  const activeCount = GOVERNANCE_PROPOSALS.filter(p => p.status === 'active').length;
  const upcomingCount = GOVERNANCE_PROPOSALS.filter(p => p.status === 'upcoming').length;
  const totalVotes = GOVERNANCE_PROPOSALS.reduce((s, p) => s + p.totalVotes, 0);

  const sofDisplay = sofPrice.loading ? '…' : sofPrice.error ? '—' : formatSOFPrice(sofPrice.price);
  const sofChange = sofPrice.change24h != null ? `${sofPrice.change24h >= 0 ? '+' : ''}${sofPrice.change24h.toFixed(2)}%` : null;

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Vote className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">{t('page_governance')}</h1>
        </div>
        <p className="text-xs text-slate-500">{t('gov_communityProposals')}</p>
      </div>

      {/* Stats */}
      <div className="px-4 my-4">
        <div className="glass-card rounded-2xl p-4 glow-border">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{GOVERNANCE_PROPOSALS.length}</p>
              <p className="text-[9px] text-slate-500">{t('gov_totalProposals')}</p>
            </div>
            <div className="text-center border-x border-[rgba(148,163,184,0.06)]">
              <p className="text-lg font-bold text-[#00d4aa]">{activeCount}</p>
              <p className="text-[9px] text-slate-500">{t('gov_active')}</p>
            </div>
            <div className="text-center border-r border-[rgba(148,163,184,0.06)]">
              <p className="text-lg font-bold text-amber-400">{upcomingCount}</p>
              <p className="text-[9px] text-slate-500">{t('gov_upcoming')}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{(totalVotes / 1e6).toFixed(1)}M</p>
              <p className="text-[9px] text-slate-500">{t('gov_totalVotes')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SOF token info — live price */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4aa]/5 rounded-full blur-xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SOF Token</p>
                <p className="text-[11px] text-slate-500">{t('gov_stakingToken')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{sofDisplay}</p>
              {sofChange && (
                <p className={`text-[11px] font-medium ${sofPrice.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{sofChange}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-slate-500 border border-transparent'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals */}
      <div className="px-4 space-y-3 pb-6">
        {filtered.map(proposal => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}