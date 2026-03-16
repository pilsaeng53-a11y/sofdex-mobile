import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, PieChart, Zap, Shield, RefreshCw, ChevronRight, Target, BarChart3 } from 'lucide-react';

const PORTFOLIO = {
  totalValue: '$127,840',
  healthScore: 68,
  healthLabel: 'Good',
  healthColor: 'text-blue-400',
  riskLevel: 'Medium',
  riskScore: 58,
  diversificationScore: 72,
  allocation: [
    { name: 'Crypto',         pct: 42, value: '$53,693', color: 'bg-amber-400', trend: '+8.2%' },
    { name: 'Tokenized Stocks', pct: 18, value: '$23,011', color: 'bg-blue-400',  trend: '+1.4%' },
    { name: 'RWA / Real Estate', pct: 22, value: '$28,125', color: 'bg-purple-400', trend: '+3.1%' },
    { name: 'Gold / Commodities', pct: 12, value: '$15,341', color: 'bg-yellow-400', trend: '+0.9%' },
    { name: 'SOF Token',        pct: 6,  value: '$7,670',  color: 'bg-[#00d4aa]', trend: '+14.2%' },
  ],
};

const SUGGESTIONS = [
  {
    type: 'Rebalance', icon: RefreshCw, color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10',
    title: 'Reduce Crypto Exposure',
    desc: 'Crypto is 42% of portfolio vs. recommended 30%. Consider shifting 12% to RWA bonds for yield stability.',
    impact: 'Risk ↓ · Yield ↑',
  },
  {
    type: 'Opportunity', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10',
    title: 'Increase RWA Allocation',
    desc: 'RWA sector momentum +9.2% · Tokenized treasury inflows surging. Target: 28% allocation (currently 22%).',
    impact: 'Yield ↑ · Stability ↑',
  },
  {
    type: 'Risk Alert', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10',
    title: 'BTC Concentration Risk',
    desc: 'BTC alone represents 28% of total portfolio. HHI concentration above recommended 0.25 threshold.',
    impact: 'Action recommended',
  },
];

const STRATEGIES = [
  { name: 'Growth Portfolio',    alloc: '60% Crypto · 25% Stocks · 15% RWA',  risk: 'High',     ret: '+48% avg', color: 'text-red-400' },
  { name: 'Balanced Income',     alloc: '30% Crypto · 30% RWA · 25% Stocks',  risk: 'Medium',   ret: '+22% avg', color: 'text-amber-400' },
  { name: 'Defensive Portfolio', alloc: '15% Crypto · 50% RWA · 35% Gold',    risk: 'Low',      ret: '+9% avg',  color: 'text-emerald-400' },
];

const TABS = ['Overview', 'Rebalance', 'Strategies', 'Risk Alerts'];

export default function AIWealthManager() {
  const [tab, setTab] = useState('Overview');
  const [applying, setApplying] = useState(null);

  const handleApply = (name) => {
    setApplying(name);
    setTimeout(() => setApplying(null), 1800);
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">AI Wealth Manager</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">AI-driven portfolio intelligence and financial advisory</p>

      {/* Health score card */}
      <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-blue-400/15 mb-4">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-400/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] text-slate-500 font-medium mb-0.5">Portfolio Health Score</p>
              <p className="text-3xl font-black text-white">{PORTFOLIO.healthScore}<span className="text-lg text-slate-500">/100</span></p>
              <span className={`text-xs font-bold ${PORTFOLIO.healthColor}`}>{PORTFOLIO.healthLabel}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 mb-0.5">Total Value</p>
              <p className="text-xl font-black text-white">{PORTFOLIO.totalValue}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-1">
            <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${PORTFOLIO.healthScore}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Risk Level</p>
              <p className="text-xs font-bold text-amber-400">{PORTFOLIO.riskLevel}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Risk Score</p>
              <p className="text-xs font-bold text-white">{PORTFOLIO.riskScore}/100</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Diversification</p>
              <p className="text-xs font-bold text-emerald-400">{PORTFOLIO.diversificationScore}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Allocation</p>
          {PORTFOLIO.allocation.map((a, i) => (
            <div key={i} className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                  <p className="text-xs font-semibold text-white">{a.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-semibold">{a.trend}</span>
                  <span className="text-xs font-bold text-white">{a.pct}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
                <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{a.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rebalance */}
      {tab === 'Rebalance' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#00d4aa]/5 border border-[#00d4aa]/15 mb-1">
            <p className="text-[10px] text-[#00d4aa]/80 font-semibold">AI Rebalancing Engine</p>
            <p className="text-[10px] text-slate-600">AI analyzes volatility, correlation, yield, and momentum to suggest optimized portfolio changes.</p>
          </div>
          {SUGGESTIONS.map((s, i) => {
            const Icon = s.icon;
            const isApplying = applying === s.title;
            return (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white">{s.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color}`}>{s.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Impact: <span className={`font-semibold ${s.color}`}>{s.impact}</span></span>
                  <button
                    onClick={() => handleApply(s.title)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      isApplying
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                        : 'bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/20'
                    }`}>
                    {isApplying ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strategies */}
      {tab === 'Strategies' && (
        <div className="space-y-3">
          {STRATEGIES.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{s.name}</p>
                <span className={`text-[10px] font-bold ${s.color}`}>{s.risk} Risk</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{s.alloc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Historical avg: <span className="text-emerald-400 font-bold">{s.ret}</span></span>
                <button
                  onClick={() => handleApply(s.name)}
                  className="px-3 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-[11px] font-bold hover:bg-[#00d4aa]/20 transition-all">
                  {applying === s.name ? 'Applying…' : 'Use Strategy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Alerts */}
      {tab === 'Risk Alerts' && (
        <div className="space-y-3">
          {[
            { level: 'High', color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/8', msg: 'BTC concentration exceeds 28% of portfolio — above recommended 20% max single asset.', action: 'Reduce BTC' },
            { level: 'Medium', color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/8', msg: 'Crypto sector total (42%) approaching 45% sector limit. Continued appreciation will trigger rebalance.', action: 'Monitor' },
            { level: 'Low', color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/8', msg: 'RWA yield assets underrepresented at 22%. Current macro environment favors higher allocation.', action: 'Explore RWA' },
          ].map((r, i) => (
            <div key={i} className={`glass-card rounded-2xl p-4 border ${r.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 ${r.color}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${r.bg} ${r.color} border ${r.border}`}>{r.level} Priority</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{r.msg}</p>
              <Link to={createPageUrl('AIIntelligence')}>
                <button className={`text-[11px] font-bold ${r.color} hover:opacity-80 transition-opacity`}>→ {r.action}</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}