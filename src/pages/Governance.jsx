import React, { useState } from 'react';
import { Vote, Clock, CheckCircle2, XCircle, Users, Zap } from 'lucide-react';
import { GOVERNANCE_PROPOSALS } from '../components/shared/MarketData';

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: Clock },
  passed: { label: 'Passed', color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: XCircle },
};

function ProposalCard({ proposal }) {
  const config = statusConfig[proposal.status];
  const Icon = config.icon;

  return (
    <div className="glass-card rounded-2xl p-4 glow-border hover:bg-[#1a2340] transition-all">
      {/* Status + ID */}
      <div className="flex items-center justify-between mb-3">
        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
        <span className="text-[10px] text-slate-600 font-mono">SFD-{String(proposal.id).padStart(3, '0')}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-2 leading-snug">{proposal.title}</h3>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{proposal.description}</p>

      {/* Vote bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-emerald-400 font-semibold">Yes {proposal.yesPercent}%</span>
          <span className="text-[11px] text-red-400 font-semibold">No {proposal.noPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all"
            style={{ width: `${proposal.yesPercent}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full transition-all"
            style={{ width: `${proposal.noPercent}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{(proposal.totalVotes / 1000).toFixed(0)}K votes</span>
        </div>
        <span>{proposal.status === 'active' ? `Ends ${proposal.endDate}` : `Ended ${proposal.endDate}`}</span>
      </div>

      {/* Vote buttons for active */}
      {proposal.status === 'active' && (
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all">
            Vote Yes
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
            Vote No
          </button>
        </div>
      )}
    </div>
  );
}

export default function Governance() {
  const [filter, setFilter] = useState('all');
  
  const filtered = filter === 'all' 
    ? GOVERNANCE_PROPOSALS 
    : GOVERNANCE_PROPOSALS.filter(p => p.status === filter);

  const activeCount = GOVERNANCE_PROPOSALS.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Vote className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Governance</h1>
        </div>
        <p className="text-xs text-slate-500">SolFort DAO · Community Proposals</p>
      </div>

      {/* Stats */}
      <div className="px-4 my-4">
        <div className="glass-card rounded-2xl p-4 glow-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{GOVERNANCE_PROPOSALS.length}</p>
              <p className="text-[10px] text-slate-500">Total Proposals</p>
            </div>
            <div className="text-center border-x border-[rgba(148,163,184,0.06)]">
              <p className="text-lg font-bold text-[#00d4aa]">{activeCount}</p>
              <p className="text-[10px] text-slate-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">4.8M</p>
              <p className="text-[10px] text-slate-500">Total Votes</p>
            </div>
          </div>
        </div>
      </div>

      {/* SOFD token info */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4aa]/5 rounded-full blur-xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SOFD Token</p>
                <p className="text-[11px] text-slate-500">Governance & Staking</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">$2.84</p>
              <p className="text-[11px] text-emerald-400 font-medium">+4.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'passed', label: 'Passed' },
            { key: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-slate-500 border border-transparent'
              }`}
            >
              {tab.label}
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