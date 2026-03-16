import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Award, TrendingUp, Users, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StrategyLeaderboard() {
  const [strategies, setStrategies] = useState([]);
  const [sortBy, setSortBy] = useState('reputation');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    try {
      const all = await base44.entities.Strategy.list('-updated_date', 100);
      const sorted = [...all].sort((a, b) => {
        if (sortBy === 'roi') return b.roi - a.roi;
        if (sortBy === 'followers') return b.follower_count - a.follower_count;
        if (sortBy === 'reputation') return b.reputation_score - a.reputation_score;
        return 0;
      });
      setStrategies(sorted.slice(0, 20));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-amber-400 bg-amber-400/10';
    if (rank === 2) return 'text-slate-400 bg-slate-400/10';
    if (rank === 3) return 'text-orange-600 bg-orange-600/10';
    return 'text-slate-500';
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-bold text-white">Strategy Leaderboard</h1>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['reputation', 'roi', 'followers'].map(sort => (
          <button key={sort} onClick={() => setSortBy(sort)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              sortBy === sort ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.08)] bg-[#151c2e]'
            }`}>
            {sort === 'reputation' ? 'Reputation' : sort === 'roi' ? 'ROI' : 'Followers'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading leaderboard...</div>
      ) : (
        <div className="space-y-2">
          {strategies.map((strategy, rank) => (
            <Link key={strategy.id} to={`/StrategyDetail?id=${strategy.id}`}>
              <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getMedalColor(rank + 1)} flex items-center justify-center font-bold text-sm`}>
                    {rank < 3 ? (
                      <Award className="w-5 h-5" />
                    ) : (
                      <span className="text-slate-400">#{rank + 1}</span>
                    )}
                  </div>

                  {/* Strategy Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white truncate">{strategy.name}</h3>
                      {rank < 3 && <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{strategy.creator_name}</p>
                  </div>

                  {/* Metrics */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-white">
                      {sortBy === 'roi' ? `+${strategy.roi.toFixed(1)}%` : 
                       sortBy === 'followers' ? `${(strategy.follower_count / 1000).toFixed(1)}K` :
                       strategy.reputation_score.toFixed(1)}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {sortBy === 'roi' ? 'ROI' : sortBy === 'followers' ? 'Followers' : 'Reputation'}
                    </p>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="w-24 text-right text-[10px]">
                    <p className="text-emerald-400 font-semibold">{strategy.win_rate.toFixed(0)}% Win</p>
                    <p className="text-slate-500">{strategy.subscriber_count} Subs</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}