import React, { useState } from 'react';
import { BookOpen, TrendingUp, Shield, Zap, Star, Copy, ChevronRight, Info } from 'lucide-react';

const STRATEGIES = [
  {
    name: 'AI Momentum Alpha',
    type: 'AI-Generated',
    icon: Zap,
    color: 'text-[#00d4aa]',
    bg: 'bg-[#00d4aa]/10',
    border: 'border-[#00d4aa]/20',
    ret30d: '+42.8%',
    winRate: '74%',
    drawdown: '-8.2%',
    trades: 184,
    cost: 'Free',
    risk: 'Medium',
    desc: 'AI momentum strategy targeting breakout assets with volume confirmation. Focuses on DePIN, AI tokens, and high-velocity movers.',
    tags: ['BTC', 'SOL', 'RNDR', 'JUP'],
    positive: true,
  },
  {
    name: 'Market Neutral Quant',
    type: 'Community',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    ret30d: '+18.4%',
    winRate: '81%',
    drawdown: '-3.1%',
    trades: 62,
    cost: '0.5% AUM',
    risk: 'Low',
    desc: 'Delta-neutral pairs trading strategy using correlated asset spreads. Captures mean-reversion across BTC/ETH, SOL/ETH pairs.',
    tags: ['BTC', 'ETH', 'SOL'],
    positive: true,
  },
  {
    name: 'RWA Yield Harvester',
    type: 'AI-Generated',
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    ret30d: '+9.2%',
    winRate: '88%',
    drawdown: '-1.4%',
    trades: 28,
    cost: 'Free',
    risk: 'Low',
    desc: 'Long-only RWA yield strategy. Targets tokenized bonds, real estate, and gold for stable portfolio income with low drawdown.',
    tags: ['TBILL', 'GOLD-T', 'RE-NYC'],
    positive: true,
  },
  {
    name: 'Whale Copy Alpha',
    type: 'Community',
    icon: Star,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
    ret30d: '+67.2%',
    winRate: '68%',
    drawdown: '-18.4%',
    trades: 312,
    cost: '1% profit share',
    risk: 'High',
    desc: 'Mirrors tracked whale wallet activity with a 15-minute delay. High alpha but elevated drawdown risk.',
    tags: ['BTC', 'SOL', 'JUP', 'Any'],
    positive: true,
  },
  {
    name: 'Defensive Income',
    type: 'AI-Generated',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    ret30d: '+6.8%',
    winRate: '92%',
    drawdown: '-0.8%',
    trades: 14,
    cost: 'Free',
    risk: 'Very Low',
    desc: 'Capital preservation strategy. Allocates to US T-Bill tokens and gold. Ideal for bear markets or portfolio stabilization.',
    tags: ['TBILL', 'GOLD-T', 'USDC'],
    positive: true,
  },
];

const riskColor = {
  'Very Low': 'text-emerald-400 bg-emerald-400/10',
  'Low': 'text-blue-400 bg-blue-400/10',
  'Medium': 'text-amber-400 bg-amber-400/10',
  'High': 'text-red-400 bg-red-400/10',
};

export default function StrategyMarketplace() {
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'AI-Generated', 'Community', 'Low Risk'];

  const filtered = STRATEGIES.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Low Risk') return ['Very Low', 'Low'].includes(s.risk);
    return s.type === filter;
  });

  const handleCopy = (name) => {
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Strategy Marketplace</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">Browse & copy proven trading strategies</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Strategies', val: '48' },
          { label: 'Active Copiers', val: '12.4K' },
          { label: 'Top Return', val: '+67.2%', green: true },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-sm font-bold ${s.green ? 'text-emerald-400' : 'text-white'}`}>{s.val}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              filter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((s, i) => {
          const Icon = s.icon;
          const isCopied = copied === s.name;
          return (
            <div key={i} className={`glass-card rounded-2xl p-4 border ${s.border}`}>
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color}`}>{s.type}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">30d Ret.</p>
                  <p className={`text-[11px] font-bold ${s.positive ? 'text-emerald-400' : 'text-red-400'}`}>{s.ret30d}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Win Rate</p>
                  <p className="text-[11px] font-bold text-white">{s.winRate}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Max DD</p>
                  <p className="text-[11px] font-bold text-red-400">{s.drawdown}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Trades</p>
                  <p className="text-[11px] font-bold text-white">{s.trades}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${riskColor[s.risk]}`}>{s.risk} Risk</span>
                  <span className="text-[10px] text-slate-500">Cost: <span className="text-slate-300 font-semibold">{s.cost}</span></span>
                </div>
                <button
                  onClick={() => handleCopy(s.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    isCopied
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                      : 'bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/20'
                  }`}>
                  <Copy className="w-3 h-3" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}