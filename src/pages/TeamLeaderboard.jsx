import React, { useState } from 'react';
import { Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';

const TEAM_DATA = [
  { rank: 1, name: 'User ...Kp9r', vol: '$421,000', commission: '$4,210', referrals: 18, tier: 'Gold', color: '#f59e0b', badge: '🥇' },
  { rank: 2, name: 'User ...mN2q', vol: '$312,400', commission: '$3,124', referrals: 14, tier: 'Purple', color: '#a855f7', badge: '🟣' },
  { rank: 3, name: 'User ...Rn8b', vol: '$198,200', commission: '$1,982', referrals: 9, tier: 'Purple', color: '#a855f7', badge: '🟣' },
  { rank: 4, name: 'User ...aX4f', vol: '$124,000', commission: '$1,240', referrals: 6, tier: 'Green', color: '#22c55e', badge: '🟢' },
  { rank: 5, name: 'User ...Tt7s', vol: '$98,700', commission: '$987', referrals: 4, tier: 'Green', color: '#22c55e', badge: '🟢' },
  { rank: 6, name: 'User ...Wm3x', vol: '$67,400', commission: '$674', referrals: 3, tier: 'Green', color: '#22c55e', badge: '🟢' },
  { rank: 7, name: 'User ...Fx2d', vol: '$44,100', commission: '$441', referrals: 2, tier: 'Green', color: '#22c55e', badge: '🟢' },
];

const SORT_OPTS = [
  { key: 'vol', label: 'Volume', icon: TrendingUp },
  { key: 'commission', label: 'Commission', icon: DollarSign },
  { key: 'referrals', label: 'Referrals', icon: Users },
];

export default function TeamLeaderboard() {
  const [sort, setSort] = useState('vol');

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Team Leaderboard</h1>
        <p className="text-xs text-slate-400">Top performers in your network</p>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-sm font-black text-white">$2.4M</p>
          <p className="text-xs text-slate-500">Team Vol.</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-sm font-black text-[#00d4aa]">$12.6K</p>
          <p className="text-xs text-slate-500">Commission</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-sm font-black text-white">34</p>
          <p className="text-xs text-slate-500">Members</p>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        {SORT_OPTS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setSort(s.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${sort === s.key ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-400 border border-[rgba(148,163,184,0.08)]'}`}>
              <Icon className="w-3 h-3" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2">
        {TEAM_DATA.map(member => (
          <div key={member.rank} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
              member.rank === 1 ? 'bg-amber-400/20 text-amber-400' :
              member.rank === 2 ? 'bg-slate-300/10 text-slate-300' :
              member.rank === 3 ? 'bg-orange-400/10 text-orange-400' :
              'bg-[#1a2340] text-slate-500'
            }`}>#{member.rank}</div>

            <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0">
              <span className="text-base">{member.badge}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{member.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px]" style={{ color: member.color }}>{member.tier}</span>
                <span className="text-[10px] text-slate-500">· {member.referrals} referred</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-white">{sort === 'commission' ? member.commission : sort === 'referrals' ? `${member.referrals} refs` : member.vol}</p>
              <p className="text-[10px] text-slate-500">{sort === 'vol' ? 'volume' : sort === 'commission' ? 'earned' : 'direct'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}