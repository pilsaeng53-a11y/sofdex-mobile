import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Award, Copy, Search, Shield } from 'lucide-react';

const TRADERS = [
  { id: 4, name: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', roi: 52.7, win_rate: 79, followers: 4102, trades: 278, profit_share: 10, verified: true, rank: 1 },
  { id: 2, name: 'SolanaKing', avatar: 'SK', color: '#9945ff', roi: 61.2, win_rate: 68, followers: 2841, trades: 189, profit_share: 5, verified: true, rank: 2 },
  { id: 1, name: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', roi: 38.4, win_rate: 74, followers: 1284, trades: 312, profit_share: 10, verified: true, rank: 3 },
  { id: 3, name: 'BearHunter', avatar: 'BH', color: '#ef4444', roi: 22.1, win_rate: 71, followers: 674, trades: 421, profit_share: 20, verified: false, rank: 4 },
  { id: 5, name: 'RWAInvestor', avatar: 'RI', color: '#06b6d4', roi: 31.5, win_rate: 65, followers: 512, trades: 156, profit_share: 5, verified: false, rank: 5 },
];

const RANK_COLORS = { 1: 'text-yellow-400', 2: 'text-slate-300', 3: 'text-amber-600', 4: 'text-slate-500', 5: 'text-slate-500' };

export default function Traders() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('roi');
  const [followedIds, setFollowedIds] = useState(new Set());

  const sorted = [...TRADERS]
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'roi' ? b.roi - a.roi : sortBy === 'followers' ? b.followers - a.followers : b.win_rate - a.win_rate);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Top Traders</h1>
        <p className="text-xs text-slate-400">Follow and copy verified lead traders</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search traders..."
          className="w-full bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        {['roi', 'followers', 'win_rate'].map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-400 border border-[rgba(148,163,184,0.08)]'}`}
          >
            {s === 'roi' ? 'Top ROI' : s === 'followers' ? 'Most Followed' : 'Best Win Rate'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map(trader => (
          <div key={trader.id} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-white" style={{ background: trader.color }}>
                    {trader.avatar}
                  </div>
                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0a0e1a] flex items-center justify-center text-xs font-black ${RANK_COLORS[trader.rank]}`}>
                    #{trader.rank}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/TraderProfile?id=${trader.id}`} className="text-sm font-bold text-white hover:text-[#00d4aa]">{trader.name}</Link>
                    {trader.verified && <Award className="w-3.5 h-3.5 text-[#00d4aa]" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Users className="w-3 h-3" />{trader.followers.toLocaleString()} followers
                    <span>·</span>{trader.trades} trades
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                <p className="text-xs text-slate-500">30d ROI</p>
                <p className="text-sm font-black text-green-400">+{trader.roi}%</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                <p className="text-xs text-slate-500">Win Rate</p>
                <p className="text-sm font-black text-white">{trader.win_rate}%</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
                <p className="text-xs text-slate-500">Fee</p>
                <p className="text-sm font-black text-amber-400">{trader.profit_share}%</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFollowedIds(prev => { const n = new Set(prev); n.has(trader.id) ? n.delete(trader.id) : n.add(trader.id); return n; })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${followedIds.has(trader.id) ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.1)]'}`}
              >
                {followedIds.has(trader.id) ? 'Following' : 'Follow'}
              </button>
              <Link to={`/TraderProfile?id=${trader.id}`} className="flex-1">
                <button className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] flex items-center justify-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Copy Trade
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}