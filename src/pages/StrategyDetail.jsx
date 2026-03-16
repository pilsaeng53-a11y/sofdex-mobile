import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Heart, Share2, Star, TrendingUp, Zap } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function StrategyDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const strategyId = searchParams.get('id');

  useEffect(() => {
    loadData();
  }, [strategyId]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const strat = await base44.entities.Strategy.filter({ id: strategyId });
      if (strat.length > 0) {
        setStrategy(strat[0]);
      }

      // Check if user is subscribed
      if (currentUser) {
        const subs = await base44.entities.Subscription.filter({
          user_id: currentUser.id,
          strategy_id: strategyId,
          status: 'active'
        });
        setIsSubscribed(subs.length > 0);

        // Check if user is following
        const followers = await base44.entities.StrategyFollower.filter({
          strategy_id: strategyId,
          user_id: currentUser.id
        });
        setIsFollowing(followers.length > 0);
      }
    } catch (error) {
      console.error('Error loading strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/Login');
      return;
    }

    try {
      // Create subscription
      const expiryDate = new Date();
      if (plan.duration === '1day') expiryDate.setDate(expiryDate.getDate() + 1);
      else if (plan.duration === '1week') expiryDate.setDate(expiryDate.getDate() + 7);
      else if (plan.duration === '1month') expiryDate.setMonth(expiryDate.getMonth() + 1);

      await base44.entities.Subscription.create({
        user_id: user.id,
        user_email: user.email,
        strategy_id: strategy.id,
        creator_id: strategy.creator_id,
        plan_type: plan.duration,
        price: plan.price,
        expires_at: expiryDate.toISOString(),
        status: 'active'
      });

      setIsSubscribed(true);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/Login');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow - would need delete operation
        setIsFollowing(false);
      } else {
        await base44.entities.StrategyFollower.create({
          strategy_id: strategy.id,
          user_id: user.id,
          user_email: user.email,
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!strategy) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Strategy not found</div>;
  }

  const riskColor = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{strategy.name}</h1>
        <p className="text-sm text-slate-400">by {strategy.creator_name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">ROI</p>
          <p className="text-2xl font-bold text-emerald-400">+{strategy.roi.toFixed(1)}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-white">{strategy.win_rate.toFixed(0)}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Max Drawdown</p>
          <p className="text-2xl font-bold text-red-400">{strategy.max_drawdown.toFixed(1)}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Reputation</p>
          <p className="text-2xl font-bold text-[#00d4aa]">{strategy.reputation_score.toFixed(1)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Followers</p>
            <p className="text-lg font-bold text-white">{(strategy.follower_count / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Subscribers</p>
            <p className="text-lg font-bold text-[#00d4aa]">{strategy.subscriber_count}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Total Revenue</p>
            <p className="text-lg font-bold text-emerald-400">${(strategy.total_revenue / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-white mb-2">Risk Level</p>
        <span className={`inline-block px-3 py-1.5 rounded-xl font-semibold text-[11px] border ${riskColor[strategy.risk_level]}`}>
          {strategy.risk_level.toUpperCase()}
        </span>
      </div>

      {/* Private Content (Only for subscribers) */}
      {isSubscribed ? (
        <div className="glass-card rounded-2xl p-4 border border-emerald-400/20 bg-emerald-400/5 mb-6">
          <div className="flex items-start gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Strategy Logic</p>
              <p className="text-[11px] text-slate-300 mt-1">{strategy.logic || 'Strategy logic details available to subscribers only.'}</p>
            </div>
          </div>
          <div className="border-t border-emerald-400/20 pt-4">
            <p className="text-[10px] text-slate-500 mb-2">Description</p>
            <p className="text-[11px] text-slate-300">{strategy.description}</p>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] bg-[rgba(0,212,170,0.02)] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-slate-500" />
            <p className="text-sm font-semibold text-white">Strategy Details Locked</p>
          </div>
          <p className="text-[11px] text-slate-400">Subscribe to this strategy to view full logic, description, and backtest details.</p>
        </div>
      )}

      {/* Backtest Data */}
      {isSubscribed && strategy.backtest_data && (
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
          <p className="text-sm font-bold text-white mb-3">Backtest Analytics</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500">Total Trades</p>
              <p className="text-lg font-bold text-white">{strategy.backtest_data.trade_count}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Winning Trades</p>
              <p className="text-lg font-bold text-emerald-400">{strategy.backtest_data.winning_trades || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Losing Trades</p>
              <p className="text-lg font-bold text-red-400">{strategy.backtest_data.losing_trades || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Avg Win</p>
              <p className="text-lg font-bold text-white">${strategy.backtest_data.avg_win || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans (if not subscribed) */}
      {!isSubscribed && (
        <div className="mb-6">
          <p className="text-sm font-bold text-white mb-3">Subscription Plans</p>
          <div className="space-y-2">
            {strategy.pricing_plans.map((plan, i) => (
              <button key={i} onClick={() => handleSubscribe(plan)}
                className="w-full px-4 py-3 glass-card rounded-xl border border-[#00d4aa]/20 text-left hover:bg-[#00d4aa]/10 transition-all flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-white">
                    {plan.duration === '1day' ? '1 Day Access' : plan.duration === '1week' ? '1 Week Access' : '1 Month Access'}
                  </p>
                </div>
                <p className="text-[11px] font-bold text-[#00d4aa]">${plan.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleFollow} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[11px] transition-all ${
          isFollowing ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-300'
        }`}>
          <Heart className={`w-4 h-4 ${isFollowing ? 'fill-emerald-400' : ''}`} />
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-300 rounded-xl font-semibold text-[11px] hover:border-[#00d4aa]/30 transition-all">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}