import React, { useState } from 'react';
import { Crown, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';

export default function StrategyLeaderboard() {
  const [sortBy, setSortBy] = useState('reputation');

  const sorted = [...EXAMPLE_STRATEGIES].sort((a, b) => {
    if (sortBy === 'roi') return b.roi30d - a.roi30d;
    if (sortBy === 'followers') return b.followers - a.followers;
    if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
    return b.rating - a.rating;
  });

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-amber-400 bg-amber-400/10';
    if (rank === 2) return 'text-slate-400 bg-slate-400/10';
    if (rank === 3) return 'text-orange-600 bg-orange-600/10';
    return 'text-slate-500';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank + 1}`;
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Strategy Leaderboard</h1>
          <p className="text-xs text-slate-500">Top performing strategies ranked by reputation</p>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['reputation', 'roi', 'followers', 'revenue'].map(sort => (
          <button key={sort} onClick={() => setSortBy(sort)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              sortBy === sort ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.08)] bg-[#151c2e]'
            }`}>
            {sort === 'reputation' ? 'Rating' : sort === 'roi' ? 'ROI' : sort === 'followers' ? 'Followers' : 'Revenue'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {sorted.map((strategy, rank) => (
          <Link key={strategy.id} to={`/StrategyDetail?id=${strategy.id}`}>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30 transition-all">
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getMedalColor(rank)} flex items-center justify-center font-bold text-sm`}>
                  {getMedalIcon(rank)}
                </div>

                {/* Strategy Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white truncate">{strategy.name}</h3>
                    {rank < 3 && <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-500">{strategy.creator} • {strategy.subscribers} subscribers</p>
                </div>

                {/* Primary Metric */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white">
                    {sortBy === 'roi' ? `+${strategy.roi30d.toFixed(1)}%` : 
                     sortBy === 'followers' ? `${(strategy.followers / 1000).toFixed(1)}K` :
                     sortBy === 'revenue' ? `$${(strategy.totalRevenue / 1000).toFixed(1)}K` :
                     strategy.rating.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {sortBy === 'roi' ? 'ROI' : sortBy === 'followers' ? 'Followers' : sortBy === 'revenue' ? 'Revenue' : 'Rating'}
                  </p>
                </div>

                {/* Secondary Metrics */}
                <div className="w-24 text-right text-[10px] space-y-0.5">
                  <p className="text-emerald-400 font-semibold">{strategy.winRate}% Win</p>
                  <p className="text-slate-500">{(strategy.roi30d).toFixed(1)}% ROI</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}