import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, TrendingUp, Shield, Zap, Star, Lock, Unlock, ChevronRight, Filter, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StrategyMarketplace() {
  const [strategies, setStrategies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('reputation');
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrategies();
    loadUserSubscriptions();
  }, []);

  const loadStrategies = async () => {
    try {
      const promoted = await base44.entities.StrategyPromotion.filter({
        is_active: true
      });
      const promotedIds = promoted.map(p => p.strategy_id);
      
      const all = await base44.entities.Strategy.list('-updated_date', 100);
      const sorted = all.sort((a, b) => {
        if (promotedIds.includes(a.id) && !promotedIds.includes(b.id)) return -1;
        if (!promotedIds.includes(a.id) && promotedIds.includes(b.id)) return 1;
        if (sortBy === 'roi') return b.roi - a.roi;
        if (sortBy === 'followers') return b.follower_count - a.follower_count;
        if (sortBy === 'reputation') return b.reputation_score - a.reputation_score;
        return 0;
      });
      setStrategies(sorted);
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const user = await base44.auth.me();
      if (user) {
        const subs = await base44.entities.Subscription.filter({
          user_id: user.id,
          status: 'active'
        });
        setUserSubscriptions(subs.map(s => s.strategy_id));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const filtered = strategies.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'low-risk') return s.risk_level === 'low';
    if (filter === 'subscribed') return userSubscriptions.includes(s.id);
    return true;
  });

  const riskColor = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#00d4aa]" />
          <div>
            <h1 className="text-xl font-bold text-white">Strategy Marketplace</h1>
            <p className="text-xs text-slate-500">Subscribe to proven strategies & earn creator revenue</p>
          </div>
        </div>
        <Link to="/StrategyCreator" className="px-3 py-1.5 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-[11px] font-semibold rounded-xl hover:bg-[#00d4aa]/20 transition-all">
          Create Strategy
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Strategies', val: strategies.length || '0' },
          { label: 'ROI', val: '+' + (strategies[0]?.roi || 0).toFixed(1) + '%' },
          { label: 'Subscribers', val: strategies.reduce((sum, s) => sum + s.subscriber_count, 0) },
          { label: 'Total Revenue', val: '$' + (strategies.reduce((sum, s) => sum + s.total_revenue, 0) / 1000).toFixed(1) + 'K' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-2 text-center">
            <p className="text-[11px] font-bold text-white">{s.val}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['all', 'low-risk', 'subscribed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              filter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.08)] bg-[#151c2e]'
            }`}>
            {f === 'all' ? 'All Strategies' : f === 'low-risk' ? 'Low Risk' : 'My Subscriptions'}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 outline-none">
          <option value="reputation">Sort by Reputation</option>
          <option value="roi">Sort by ROI</option>
          <option value="followers">Sort by Followers</option>
        </select>
      </div>

      {/* Strategies Grid */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading strategies...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(strategy => (
            <Link key={strategy.id} to={`/StrategyDetail?id=${strategy.id}`}>
              <StrategyCard strategy={strategy} isSubscribed={userSubscriptions.includes(strategy.id)} riskColor={riskColor} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StrategyCard({ strategy, isSubscribed, riskColor }) {
  const isPromoted = strategy.is_promoted;
  
  return (
    <div className={`glass-card rounded-2xl p-4 border transition-all ${isPromoted ? 'border-amber-400/40 bg-amber-400/5' : 'border-[rgba(148,163,184,0.08)]'} hover:border-[#00d4aa]/30`}>
      {isPromoted && (
        <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded-lg">
          <Award className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-semibold text-amber-400">PROMOTED</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">{strategy.name}</h3>
            {isSubscribed && (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <p className="text-[10px] text-slate-400">by {strategy.creator_name}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-white">{strategy.reputation_score.toFixed(1)}</span>
          </div>
          <p className="text-[9px] text-slate-500">Reputation</p>
        </div>
      </div>

      {/* Public Info (always visible) */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-500">ROI</p>
          <p className="text-[11px] font-bold text-emerald-400">+{strategy.roi.toFixed(1)}%</p>
        </div>
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-500">Win Rate</p>
          <p className="text-[11px] font-bold text-white">{strategy.win_rate.toFixed(0)}%</p>
        </div>
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-500">Max DD</p>
          <p className="text-[11px] font-bold text-red-400">{strategy.max_drawdown.toFixed(1)}%</p>
        </div>
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-500">Followers</p>
          <p className="text-[11px] font-bold text-white">{(strategy.follower_count / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Pricing & Risk */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${riskColor[strategy.risk_level]}`}>
            {strategy.risk_level.toUpperCase()}
          </span>
          <div className="flex items-center gap-1">
            {strategy.pricing_plans.map((plan, i) => (
              <span key={i} className="text-[10px] text-slate-400">
                ${plan.price}/<span className="text-[9px]">{plan.duration}</span>
              </span>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-all">
          {isSubscribed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isSubscribed ? 'View' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
}