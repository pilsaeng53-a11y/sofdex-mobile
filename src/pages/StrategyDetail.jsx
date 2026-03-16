import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, Lock, ChevronRight, TrendingUp } from 'lucide-react';
import { EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import StrategyChart from '../components/strategies/StrategyChart';

export default function StrategyDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const strategyId = searchParams.get('id');
  const strategy = EXAMPLE_STRATEGIES.find(s => s.id === strategyId) || EXAMPLE_STRATEGIES[0];
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const riskColor = {
    'very-low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'high': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const handleSubscribe = (plan) => {
    navigate('/Payment?plan=' + plan.duration + '&strategy=' + strategy.id);
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{strategy.name}</h1>
        <p className="text-sm text-slate-400">by {strategy.creator}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${riskColor[strategy.risk]}`}>
            {strategy.risk.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-500">{strategy.followers.toLocaleString()} followers</span>
          <span className="text-[11px] text-slate-500">{strategy.subscribers} subscribers</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">30D ROI</p>
          <p className="text-2xl font-bold text-emerald-400">+{strategy.roi30d.toFixed(1)}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-white">{strategy.winRate}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Max Drawdown</p>
          <p className="text-2xl font-bold text-red-400">{strategy.maxDrawdown}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Rating</p>
          <p className="text-2xl font-bold text-amber-400">{strategy.rating} ⭐</p>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-2">Strategy Overview</p>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{strategy.description}</p>
        <div className="border-t border-[rgba(148,163,184,0.08)] pt-3 space-y-2">
          <div>
            <p className="text-[10px] text-slate-500">Strategy Style</p>
            <p className="text-[11px] text-white">{strategy.style}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Target Market</p>
            <p className="text-[11px] text-white">{strategy.targetMarket}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">How It Works</p>
            <p className="text-[11px] text-white">{strategy.strategy}</p>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">30-Day Performance</p>
        <StrategyChart data={strategy.performanceData.weekly} />
      </div>

      {/* Backtest Data */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Backtest Summary</p>
        <div className="space-y-3">
          {['1month', '3month', '6month', '1year'].map(period => {
            const bt = strategy.backtest[period];
            const periodLabel = period === '1month' ? '1 Month' : period === '3month' ? '3 Months' : period === '6month' ? '6 Months' : '1 Year';
            return (
              <div key={period} className="bg-[#0d1220] rounded-xl p-3">
                <p className="text-[11px] font-semibold text-white mb-2">{periodLabel}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] text-slate-500">ROI</p>
                    <p className="text-[11px] font-bold text-emerald-400">+{bt.roi.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500">Trades</p>
                    <p className="text-[11px] font-bold text-white">{bt.trades}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500">Win Rate</p>
                    <p className="text-[11px] font-bold text-white">{bt.winRate}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Community Reviews ({strategy.reviews})</p>
        <div className="space-y-2">
          <div className="bg-[#0d1220] rounded-xl p-3 text-[10px]">
            <p className="text-white font-semibold">Excellent returns! Steady performer. ⭐⭐⭐⭐⭐</p>
            <p className="text-slate-500">— Verified Subscriber</p>
          </div>
          <div className="bg-[#0d1220] rounded-xl p-3 text-[10px]">
            <p className="text-white font-semibold">Very consistent, low drawdown. Love it. ⭐⭐⭐⭐⭐</p>
            <p className="text-slate-500">— Verified Subscriber</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="mb-6">
        <p className="text-sm font-bold text-white mb-3">Subscription Plans</p>
        <div className="space-y-2">
          {strategy.pricing.map((plan, i) => (
            <button key={i} onClick={() => handleSubscribe(plan)}
              className="w-full px-4 py-3 glass-card rounded-xl border border-[#00d4aa]/20 hover:bg-[#00d4aa]/10 transition-all flex items-center justify-between">
              <div className="text-left">
                <p className="text-[11px] font-semibold text-white">
                  {plan.duration === '1day' ? '1 Day Access' : plan.duration === '1week' ? '1 Week Access' : '1 Month Access'}
                </p>
                <p className="text-[9px] text-slate-500">Full strategy logic + copy access</p>
              </div>
              <p className="text-[12px] font-bold text-[#00d4aa]">${plan.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setIsFollowing(!isFollowing)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[11px] transition-all ${
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