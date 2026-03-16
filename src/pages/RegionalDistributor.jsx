import React, { useState } from 'react';
import { Map, TrendingUp, Users, Award, ExternalLink, Globe } from 'lucide-react';
import SolFortLogo from '../components/shared/SolFortLogo';

const AFFILIATES_URL = 'https://www.solfort.foundation/affiliates';

const REGIONS = [
  { id: 1, region: 'East Asia', flag: '🌏', distributor: '0x...K9QR', tier: 'Platinum', partners: 842, vol: '$14.2M', commission: '$142K', bonus: '3%', rank: 1 },
  { id: 2, region: 'Southeast Asia', flag: '🌏', distributor: '0x...mN9s', tier: 'Platinum', partners: 614, vol: '$9.8M', commission: '$98K', bonus: '2.5%', rank: 2 },
  { id: 3, region: 'Europe', flag: '🌍', distributor: '0x...Lv5p', tier: 'Gold', partners: 421, vol: '$7.1M', commission: '$71K', bonus: '2%', rank: 3 },
  { id: 4, region: 'North America', flag: '🌎', distributor: '0x...Wz8c', tier: 'Gold', partners: 389, vol: '$6.4M', commission: '$64K', bonus: '2%', rank: 4 },
  { id: 5, region: 'Middle East', flag: '🌍', distributor: '0x...Rx3k', tier: 'Purple', partners: 187, vol: '$2.8M', commission: '$28K', bonus: '1.5%', rank: 5 },
  { id: 6, region: 'Latin America', flag: '🌎', distributor: '0x...Bt7n', tier: 'Purple', partners: 143, vol: '$2.1M', commission: '$21K', bonus: '1.5%', rank: 6 },
];

const TIER_COLORS = {
  Platinum: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
  Gold: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function RegionalDistributor() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SolFortLogo size={32} className="rounded-xl" />
        <div>
          <h1 className="text-lg font-bold text-white">Regional Distributors</h1>
          <p className="text-xs text-slate-400">Global SolFort partner leadership</p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">Global Network Overview</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-black text-white">6</p>
            <p className="text-xs text-slate-500">Regions</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-[#00d4aa]">2,596</p>
            <p className="text-xs text-slate-500">Partners</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-white">$42.4M</p>
            <p className="text-xs text-slate-500">Total Vol.</p>
          </div>
        </div>
      </div>

      {/* Regional Bonus Info */}
      <div className="bg-[#151c2e] rounded-2xl border border-amber-400/20 p-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">Regional Bonus: Up to 3%</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Top regional distributors earn additional bonuses based on regional performance</p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {REGIONS.map(region => (
          <div
            key={region.id}
            onClick={() => setSelected(selected === region.id ? null : region.id)}
            className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 cursor-pointer hover:border-[rgba(148,163,184,0.15)] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                region.rank === 1 ? 'bg-amber-400/20 text-amber-400' :
                region.rank === 2 ? 'bg-slate-300/10 text-slate-300' :
                region.rank === 3 ? 'bg-orange-400/10 text-orange-400' :
                'bg-[#1a2340] text-slate-500'
              }`}>#{region.rank}</div>

              <span className="text-2xl">{region.flag}</span>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{region.region}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TIER_COLORS[region.tier]}`}>{region.tier}</span>
                </div>
                <p className="text-xs text-slate-500">{region.distributor} · {region.partners} partners</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-[#00d4aa]">{region.vol}</p>
                <p className="text-xs text-amber-400">{region.bonus} bonus</p>
              </div>
            </div>

            {selected === region.id && (
              <div className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.06)] grid grid-cols-3 gap-2">
                <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-white">{region.partners}</p>
                  <p className="text-[10px] text-slate-500">Partners</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-white">{region.vol}</p>
                  <p className="text-[10px] text-slate-500">Volume</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-green-400">{region.commission}</p>
                  <p className="text-[10px] text-slate-500">Commission</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <a href={AFFILIATES_URL} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black font-bold text-sm">
        <ExternalLink className="w-4 h-4" />
        Apply for Regional Distributor
      </a>
    </div>
  );
}