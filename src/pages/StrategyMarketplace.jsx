import React, { useState } from 'react';
import { BookOpen, TrendingUp, Star, Lock, ChevronRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import { useWallet } from '../components/shared/WalletContext';

export default function StrategyMarketplace() {
  const [sortBy, setSortBy] = useState('reputation');
  const [filterRisk, setFilterRisk] = useState('all');
  const { isConnected, requireWallet } = useWallet();

  const riskColor = {
    'very-low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'high': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const filtered = EXAMPLE_STRATEGIES.filter(s => 
    filterRisk === 'all' || s.risk === filterRisk
  ).sort((a, b) => {
    if (sortBy === 'roi') return b.roi30d - a.roi30d;
    if (sortBy === 'followers') return b.followers - a.followers;
    return b.rating - a.rating;
  });

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
        <Link to="/StrategyCreator" className="px-3 py-1.5 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-[11px] font-semibold rounded-xl hover:bg-[#00d4aa]/20">
          Create
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Strategies', val: EXAMPLE_STRATEGIES.length },
          { label: 'ROI', val: '+' + Math.max(...EXAMPLE_STRATEGIES.map(s => s.roi30d)).toFixed(1) + '%' },
          { label: 'Subscribers', val: EXAMPLE_STRATEGIES.reduce((sum, s) => sum + s.subscribers, 0) },
          { label: 'Revenue', val: '$' + (EXAMPLE_STRATEGIES.reduce((sum, s) => sum + s.totalRevenue, 0) / 1000).toFixed(1) + 'K' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-2 text-center">
            <p className="text-[11px] font-bold text-white">{s.val}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['all', 'very-low', 'low', 'medium', 'high'].map(risk => (
          <button key={risk} onClick={() => setFilterRisk(risk)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              filterRisk === risk ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.08)] bg-[#151c2e]'
            }`}>
            {risk === 'all' ? 'All' : risk.replace('-', ' ').toUpperCase()}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 outline-none">
          <option value="reputation">By Rating</option>
          <option value="roi">By ROI</option>
          <option value="followers">By Followers</option>
        </select>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-3">
        {filtered.map(strategy => (
          <Link key={strategy.id} to={`/StrategyDetail?id=${strategy.id}`}>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">{strategy.name}</h3>
                  <p className="text-[10px] text-slate-500">by {strategy.creator}</p>
                </div>
                <div className="text-right flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold text-white">{strategy.rating}</span>
                  <span className="text-[9px] text-slate-500">({strategy.reviews})</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">30d ROI</p>
                  <p className="text-[11px] font-bold text-emerald-400">+{strategy.roi30d.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Win Rate</p>
                  <p className="text-[11px] font-bold text-white">{strategy.winRate}%</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Max DD</p>
                  <p className="text-[11px] font-bold text-red-400">{strategy.maxDrawdown}%</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Followers</p>
                  <p className="text-[11px] font-bold text-white">{(strategy.followers / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {/* Pricing & Risk */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${riskColor[strategy.risk]}`}>
                    {strategy.risk.replace('-', ' ').toUpperCase()}
                  </span>
                  <div className="flex gap-1">
                    {strategy.pricing.map((p, i) => (
                      <span key={i} className="text-[9px] text-slate-400">
                        ${p.price}/<span className="text-[8px]">{p.duration === '1day' ? '1D' : p.duration === '1week' ? '1W' : '1M'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); requireWallet(); }}
                  className={`flex-1 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    isConnected
                      ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/20'
                      : 'bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-slate-400 opacity-75'
                  }`}>
                  {isConnected ? <Lock className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                  {isConnected ? 'Subscribe' : 'Connect'}
                </button>
                <button className="flex-1 px-3 py-2 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 text-[11px] font-semibold rounded-lg hover:border-[#00d4aa]/30 transition-all flex items-center justify-center gap-1">
                  Performance
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}