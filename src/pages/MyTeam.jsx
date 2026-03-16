import React, { useState } from 'react';
import { Users, TrendingUp, Zap, Crown } from 'lucide-react';

const DIRECT_AGENTS = [
  { name: 'User ...aX4f', tier: 'Green', subTeam: 3, vol: '$124K', commission: '$1,240', joined: '2 months ago', status: 'active' },
  { name: 'User ...mN2q', tier: 'Purple', subTeam: 7, vol: '$312K', commission: '$3,124', joined: '2 months ago', status: 'active' },
  { name: 'User ...Kp9r', tier: 'Gold', subTeam: 9, vol: '$421K', commission: '$4,210', joined: '3 months ago', status: 'active' },
  { name: 'User ...Tt7s', tier: 'Green', subTeam: 0, vol: '$44K', commission: '$440', joined: '1 month ago', status: 'inactive' },
  { name: 'User ...Rn8b', tier: 'Green', subTeam: 2, vol: '$98K', commission: '$980', joined: '6 weeks ago', status: 'active' },
];

const TIER_COLORS = {
  Green: { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  Purple: { text: 'text-purple-400', bg: 'bg-purple-400/10' },
  Gold: { text: 'text-amber-400', bg: 'bg-amber-400/10' },
  Platinum: { text: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10' },
};

export default function MyTeam() {
  const [tab, setTab] = useState('direct');

  const activeCount = DIRECT_AGENTS.filter(a => a.status === 'active').length;
  const totalSubTeam = DIRECT_AGENTS.reduce((s, a) => s + a.subTeam, 0);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">My Team</h1>
        <p className="text-xs text-slate-400">Direct agents and team structure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Direct', val: DIRECT_AGENTS.length, color: 'text-white' },
          { label: 'Active', val: activeCount, color: 'text-green-400' },
          { label: 'Sub-team', val: totalSubTeam, color: 'text-[#00d4aa]' },
          { label: 'Total', val: DIRECT_AGENTS.length + totalSubTeam, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-[#151c2e] rounded-xl p-2.5 border border-[rgba(148,163,184,0.08)] text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Growth */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Team Performance</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-[#00d4aa] mx-auto mb-1" />
            <p className="text-sm font-black text-white">$2.4M</p>
            <p className="text-xs text-slate-500">Team Vol.</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-sm font-black text-amber-400">+18%</p>
            <p className="text-xs text-slate-500">Monthly Growth</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <Crown className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-sm font-black text-white">$12.6K</p>
            <p className="text-xs text-slate-500">Team Comm.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#151c2e] rounded-xl p-1">
        <button onClick={() => setTab('direct')} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'direct' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'text-slate-400'}`}>
          Direct Agents ({DIRECT_AGENTS.length})
        </button>
        <button onClick={() => setTab('all')} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'all' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'text-slate-400'}`}>
          All Team ({DIRECT_AGENTS.length + totalSubTeam})
        </button>
      </div>

      {/* Agent List */}
      <div className="space-y-2">
        {DIRECT_AGENTS.map((agent, i) => {
          const tc = TIER_COLORS[agent.tier] || TIER_COLORS.Green;
          return (
            <div key={i} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-3.5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{agent.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>{agent.tier}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${agent.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>●</span>
                  </div>
                  <p className="text-xs text-slate-500">Joined {agent.joined} · {agent.subTeam} sub-agents</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0a0e1a] rounded-lg p-2">
                  <p className="text-[10px] text-slate-500">Volume</p>
                  <p className="text-xs font-bold text-white">{agent.vol}</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-lg p-2">
                  <p className="text-[10px] text-slate-500">Commission</p>
                  <p className="text-xs font-bold text-green-400">{agent.commission}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}