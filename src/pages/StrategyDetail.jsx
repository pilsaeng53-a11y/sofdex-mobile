import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronLeft, TrendingUp, Users, Star, Shield, Brain, BarChart3, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import StrategyChart from '../components/strategies/StrategyChart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const RISK_STYLE = {
  'very-low': { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  'low': { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  'medium': { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  'high': { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

const SAMPLE_REVIEWS = [
  { user: 'CryptoWhale99', rating: 5, text: 'Consistently delivers. 3 months as a subscriber and my ROI has been steady. Best strategy on the platform.', date: '2 days ago', verified: true },
  { user: 'SolanaKing', rating: 5, text: 'Low drawdown, high win rate. The AI signal integration makes this strategy uniquely predictive.', date: '5 days ago', verified: true },
  { user: 'DeFiQueen', rating: 4, text: 'Great performance overall. Would like more frequent updates but the signals are accurate.', date: '1 week ago', verified: true },
];

const AI_BREAKDOWN = [
  { label: 'Trend Strength', score: 87, color: '#00d4aa' },
  { label: 'Volume Confirmation', score: 74, color: '#3b82f6' },
  { label: 'Risk Management', score: 91, color: '#8b5cf6' },
  { label: 'Entry Precision', score: 82, color: '#f59e0b' },
];

export default function StrategyDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const strategyId = searchParams.get('id');
  const strategy = EXAMPLE_STRATEGIES.find(s => s.id === strategyId) || EXAMPLE_STRATEGIES[0];
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const rs = RISK_STYLE[strategy.risk] || RISK_STYLE.medium;

  const handleSubscribe = (plan) => {
    navigate('/Payment?plan=' + plan.duration + '&strategy=' + strategy.id);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden px-4 pt-4 pb-5 border-b border-[rgba(148,163,184,0.06)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/5 via-transparent to-[#8b5cf6]/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${rs.text} ${rs.bg} ${rs.border}`}>
                  {strategy.risk?.replace('-', ' ')?.toUpperCase()} RISK
                </span>
                {strategy.is_promoted && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">⚡ FEATURED</span>
                )}
              </div>
              <h1 className="text-xl font-black text-white mb-1 leading-tight">{strategy.name}</h1>
              <p className="text-sm text-slate-400">by <span className="text-[#00d4aa] font-semibold">{strategy.creator}</span></p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3 h-3 ${i <= Math.round(strategy.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">{strategy.reviews} reviews</span>
            </div>
          </div>

          {/* Key stats row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">30D ROI</p>
              <p className="text-base font-black text-emerald-400">+{strategy.roi30d?.toFixed(1)}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Win Rate</p>
              <p className="text-base font-black text-white">{strategy.winRate}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Drawdown</p>
              <p className="text-base font-black text-red-400">{strategy.maxDrawdown}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Subs</p>
              <p className="text-base font-black text-[#00d4aa]">{strategy.subscribers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none border-b border-[rgba(148,163,184,0.04)]">
        {['overview', 'performance', 'backtest', 'ai', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
              activeTab === tab
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
                : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
            }`}>
            {tab === 'ai' ? '🤖 AI Score' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-2">Strategy Overview</p>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{strategy.description}</p>
              <div className="border-t border-[rgba(148,163,184,0.06)] pt-3 grid grid-cols-1 gap-2.5">
                <div className="flex justify-between">
                  <p className="text-[10px] text-slate-500">Style</p>
                  <p className="text-[11px] text-white font-semibold">{strategy.style}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] text-slate-500">Target Market</p>
                  <p className="text-[11px] text-white font-semibold">{strategy.targetMarket}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] text-slate-500">Followers</p>
                  <p className="text-[11px] text-white font-semibold">{strategy.followers?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">How It Works</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{strategy.strategy}</p>
            </div>

            {/* Subscription plans */}
            <div>
              <p className="text-sm font-bold text-white mb-3">Subscription Plans</p>
              <div className="space-y-2">
                {strategy.pricing?.map((plan, i) => (
                  <button key={i} onClick={() => handleSubscribe(plan)}
                    className="w-full px-4 py-3.5 bg-gradient-to-r from-[#151c2e] to-[#1a2340] rounded-xl border border-[#00d4aa]/15 hover:border-[#00d4aa]/35 hover:from-[#00d4aa]/5 transition-all flex items-center justify-between group">
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">
                        {plan.duration === '1day' ? '1 Day Access' : plan.duration === '1week' ? '1 Week Access' : '1 Month Access'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Full strategy logic + copy signal access</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-[#00d4aa]">${plan.price}</p>
                      <ArrowRight className="w-4 h-4 text-[#00d4aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <>
            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-3">30-Day Performance Chart</p>
              <StrategyChart data={strategy.performanceData?.weekly} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Best Day', value: '+12.4%', color: 'text-emerald-400' },
                { label: 'Worst Day', value: '-3.1%', color: 'text-red-400' },
                { label: 'Avg Daily', value: '+1.8%', color: 'text-[#00d4aa]' },
                { label: 'Sharpe Ratio', value: '2.14', color: 'text-blue-400' },
              ].map((m, i) => (
                <div key={i} className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.06)] text-center">
                  <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                  <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BACKTEST TAB */}
        {activeTab === 'backtest' && (
          <div className="space-y-3">
            <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/15 rounded-xl p-3">
              <p className="text-[10px] text-[#00d4aa] font-bold mb-1">📊 Historical Backtest Data</p>
              <p className="text-[10px] text-slate-600">Backtested on 3 years of historical data. Past performance does not guarantee future results.</p>
            </div>
            {['1month', '3month', '6month', '1year'].map(period => {
              const bt = strategy.backtest?.[period];
              if (!bt) return null;
              const periodLabel = period === '1month' ? '1 Month' : period === '3month' ? '3 Months' : period === '6month' ? '6 Months' : '1 Year';
              return (
                <div key={period} className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-white">{periodLabel}</p>
                    <span className="text-base font-black text-emerald-400">+{bt.roi?.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0d1220] rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-slate-600">Trades</p>
                      <p className="text-sm font-black text-white">{bt.trades}</p>
                    </div>
                    <div className="bg-[#0d1220] rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-slate-600">Win Rate</p>
                      <p className="text-sm font-black text-white">{bt.winRate}%</p>
                    </div>
                    <div className="bg-[#0d1220] rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-slate-600">Max DD</p>
                      <p className="text-sm font-black text-red-400">{bt.maxDrawdown || strategy.maxDrawdown}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI SCORE TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-2xl p-4 border border-[#8b5cf6]/20">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-sm font-bold text-white">AI Intelligence Score</span>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <p className="text-5xl font-black text-white">84</p>
                  <p className="text-lg text-[#00d4aa] font-bold mb-1">/ 100</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This strategy scores above average on all AI metrics. Strong trend-following with disciplined risk management and high entry precision. Suitable for medium-high risk tolerance investors seeking alpha.
                </p>
              </div>
            </div>

            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-3">Score Breakdown</p>
              <div className="space-y-3">
                {AI_BREAKDOWN.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <p className="text-[11px] text-slate-400">{item.label}</p>
                      <p className="text-[11px] font-bold text-white">{item.score}/100</p>
                    </div>
                    <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-2">AI Reasoning</p>
              <div className="space-y-2">
                {[
                  'Strong momentum detected in target market with 3-day trend confirmation',
                  'Volume analysis shows institutional accumulation pattern',
                  'Risk-adjusted returns outperform benchmark by 2.3x over 90 days',
                  'Low correlation with broader market reduces portfolio risk',
                ].map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-2">Buy / Sell Pressure</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-emerald-400">Buy Pressure</span>
                    <span className="text-[11px] font-bold text-emerald-400">68%</span>
                  </div>
                  <div className="h-2.5 bg-[#0d1220] rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '68%' }} />
                    <div className="h-full bg-red-500" style={{ width: '32%' }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-slate-600">Buy 68%</span>
                    <span className="text-[9px] text-slate-600">Sell 32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <div className="text-center">
                <p className="text-4xl font-black text-white">{strategy.rating}</p>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(strategy.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{strategy.reviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(n => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 w-3">{n}</span>
                    <div className="flex-1 h-1.5 bg-[#0d1220] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: n === 5 ? '72%' : n === 4 ? '18%' : n === 3 ? '7%' : '2%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{r.user}</p>
                    {r.verified && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#00d4aa]" />
                        <span className="text-[9px] text-[#00d4aa]">Verified Subscriber</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.text}</p>
                <p className="text-[9px] text-slate-600 mt-2">{r.date}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button onClick={() => setIsFollowing(!isFollowing)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            isFollowing ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-300 hover:border-[#00d4aa]/20'
          }`}>
            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-emerald-400' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#00d4aa]/20"
            onClick={() => strategy.pricing?.[0] && handleSubscribe(strategy.pricing[0])}>
            <TrendingUp className="w-4 h-4" />
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}