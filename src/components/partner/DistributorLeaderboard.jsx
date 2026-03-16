import React, { useState } from 'react';
import { Trophy, TrendingUp, Users } from 'lucide-react';

const TIER_COLORS = {
  Platinum: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
  Gold:     'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Purple:   'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Green:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

const TOP_REGIONS = [
  { rank: 1, name: 'East Asia',      flag: '🌏', vol: '$14.2M', commission: '$142K', team: 842, tier: 'Platinum' },
  { rank: 2, name: 'SE Asia',        flag: '🌏', vol: '$9.8M',  commission: '$98K',  team: 614, tier: 'Platinum' },
  { rank: 3, name: 'Europe',         flag: '🌍', vol: '$7.1M',  commission: '$71K',  team: 421, tier: 'Gold' },
  { rank: 4, name: 'North America',  flag: '🌎', vol: '$6.4M',  commission: '$64K',  team: 389, tier: 'Gold' },
  { rank: 5, name: 'Middle East',    flag: '🌍', vol: '$2.8M',  commission: '$28K',  team: 187, tier: 'Purple' },
];

const TOP_DISTRIBUTORS = [
  { rank: 1, name: 'CryptoKing_Asia', region: 'Seoul',     vol: '$4.1M',  commission: '$41K',  team: 312, tier: 'Gold' },
  { rank: 2, name: 'EuroBlock_Max',   region: 'London',    vol: '$2.4M',  commission: '$24K',  team: 198, tier: 'Gold' },
  { rank: 3, name: 'SingaporeSOF',    region: 'Singapore', vol: '$3.2M',  commission: '$32K',  team: 241, tier: 'Gold' },
  { rank: 4, name: 'NYCDeFi',         region: 'New York',  vol: '$2.8M',  commission: '$28K',  team: 176, tier: 'Gold' },
  { rank: 5, name: 'DubaiCrypto',     region: 'Dubai',     vol: '$1.4M',  commission: '$14K',  team: 98,  tier: 'Purple' },
];

const RANK_BADGE = (rank) => {
  if (rank === 1) return 'bg-amber-400/20 text-amber-400';
  if (rank === 2) return 'bg-slate-300/10 text-slate-300';
  if (rank === 3) return 'bg-orange-400/10 text-orange-400';
  return 'bg-[#1a2340] text-slate-500';
};

export default function DistributorLeaderboard() {
  const [tab, setTab] = useState('regions');

  const data = tab === 'regions' ? TOP_REGIONS : TOP_DISTRIBUTORS;

  return (
    <div className="space-y-3">
      {/* Tab Toggle */}
      <div className="flex gap-1 bg-[#0a0e1a] rounded-xl p-1">
        {['regions', 'distributors'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              tab === t ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]' : 'text-slate-500'
            }`}
          >
            {t === 'regions' ? '🌍 Top Regions' : '👤 Top Distributors'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] p-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${RANK_BADGE(item.rank)}`}>
                #{item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-white truncate">
                    {tab === 'regions' ? item.flag + ' ' : ''}{item.name}
                  </p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[item.tier]} flex-shrink-0`}>{item.tier}</span>
                </div>
                {tab === 'distributors' && (
                  <p className="text-[10px] text-slate-500">{item.region}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-[#00d4aa]">{item.vol}</p>
                <p className="text-[10px] text-amber-400">{item.commission}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[rgba(148,163,184,0.05)]">
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Users className="w-3 h-3" /> {item.team} team
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <TrendingUp className="w-3 h-3" /> {item.commission} earned
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}