import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, PieChart, Zap, Shield, RefreshCw, ChevronRight, Target, BarChart3, Sparkles, CheckCircle2, Activity } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const PORTFOLIO = {
  totalValue: '$127,840',
  healthScore: 68,
  healthLabel: 'Good',
  healthColor: 'text-blue-400',
  riskLevel: 'Medium',
  riskScore: 58,
  diversificationScore: 72,
  allocation: [
    { name: 'Crypto', pct: 42, value: '$53,693', color: '#f59e0b', trend: '+8.2%', positive: true },
    { name: 'Tokenized Stocks', pct: 18, value: '$23,011', color: '#3b82f6', trend: '+1.4%', positive: true },
    { name: 'RWA / Real Estate', pct: 22, value: '$28,125', color: '#8b5cf6', trend: '+3.1%', positive: true },
    { name: 'Gold / Commodities', pct: 12, value: '$15,341', color: '#eab308', trend: '+0.9%', positive: true },
    { name: 'SOF Token', pct: 6, value: '$7,670', color: '#00d4aa', trend: '+14.2%', positive: true },
  ],
};

const SUGGESTIONS = [
  {
    type: 'Rebalance', icon: RefreshCw, color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10', border: 'border-[#00d4aa]/20',
    title: 'Reduce Crypto Exposure',
    desc: 'Crypto is 42% of portfolio vs. recommended 30%. Consider shifting 12% to RWA bonds for yield stability.',
    impact: 'Risk ↓ · Yield ↑',
  },
  {
    type: 'Opportunity', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20',
    title: 'Increase RWA Allocation',
    desc: 'RWA sector momentum +9.2% · Tokenized treasury inflows surging. Target: 28% allocation (currently 22%).',
    impact: 'Yield ↑ · Stability ↑',
  },
  {
    type: 'Risk Alert', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20',
    title: 'BTC Concentration Risk',
    desc: 'BTC alone represents 28% of total portfolio. HHI concentration above recommended 0.25 threshold.',
    impact: 'Action recommended',
  },
];

const STRATEGIES = [
  { name: 'Growth Portfolio', alloc: '60% Crypto · 25% Stocks · 15% RWA', risk: 'High', ret: '+48% avg', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: '🚀' },
  { name: 'Balanced Income', alloc: '30% Crypto · 30% RWA · 25% Stocks', risk: 'Medium', ret: '+22% avg', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: '⚖️' },
  { name: 'Defensive Portfolio', alloc: '15% Crypto · 50% RWA · 35% Gold', risk: 'Low', ret: '+9% avg', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: '🛡️' },
];

const healthData = [
  { subject: 'Diversification', value: 72 },
  { subject: 'Risk Mgmt', value: 58 },
  { subject: 'Yield', value: 64 },
  { subject: 'Stability', value: 78 },
  { subject: 'Growth', value: 82 },
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
    <div className="min-h-screen bg-[#0a0e1a] pb-8">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-4 pb-5 border-b border-[rgba(148,163,184,0.06)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#00d4aa]/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#00d4aa]/15 border border-[#8b5cf6]/25 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">AI Wealth Manager</h1>
              <p className="text-[10px] text-slate-500">AI-driven portfolio intelligence & advisory</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
              <span className="text-[10px] text-[#00d4aa] font-bold">Live</span>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#151c2e] via-[#1a2340] to-[#151c2e] rounded-2xl p-4 border border-[#3b82f6]/15">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Portfolio Health Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-white">{PORTFOLIO.healthScore}</p>
                    <p className="text-lg text-slate-600 mb-1">/100</p>
                    <span className={`text-sm font-bold mb-1 ${PORTFOLIO.healthColor}`}>{PORTFOLIO.healthLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 mb-0.5">Total Value</p>
                  <p className="text-xl font-black text-white">{PORTFOLIO.totalValue}</p>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-[#0d1220] overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${PORTFOLIO.healthScore}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[9px] text-slate-600">Risk Level</p>
                  <p className="text-xs font-bold text-amber-400">{PORTFOLIO.riskLevel}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-600">Risk Score</p>
                  <p className="text-xs font-bold text-white">{PORTFOLIO.riskScore}/100</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-600">Diversification</p>
                  <p className="text-xs font-bold text-emerald-400">{PORTFOLIO.diversificationScore}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.06)] bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <>
            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-3">Portfolio Allocation</p>
              <div className="space-y-3">
                {PORTFOLIO.allocation.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                        <p className="text-xs font-semibold text-white">{a.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-emerald-400 font-semibold">{a.trend}</span>
                        <span className="text-xs font-bold text-white w-8 text-right">{a.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                    </div>
                    <p className="text-[9px] text-slate-600 mt-0.5">{a.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick AI Recs */}
            <div className="bg-gradient-to-br from-[#8b5cf6]/8 to-[#00d4aa]/5 rounded-2xl p-4 border border-[#8b5cf6]/15">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                <p className="text-sm font-bold text-white">AI Recommendations</p>
              </div>
              {SUGGESTIONS.slice(0, 2).map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${s.bg} border ${s.border} mb-2 last:mb-0`}>
                    <Icon className={`w-4 h-4 ${s.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-white">{s.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.desc.slice(0, 80)}...</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* REBALANCE */}
        {tab === 'Rebalance' && (
          <>
            <div className="p-3 rounded-xl bg-[#00d4aa]/5 border border-[#00d4aa]/12 mb-1">
              <p className="text-[10px] text-[#00d4aa] font-bold">🤖 AI Rebalancing Engine</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Analyzes volatility, correlation, yield, and momentum to suggest optimized portfolio changes.</p>
            </div>
            {SUGGESTIONS.map((s, i) => {
              const Icon = s.icon;
              const isApplying = applying === s.title;
              return (
                <div key={i} className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">{s.title}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color} border ${s.border}`}>{s.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Impact: <span className={`font-bold ${s.color}`}>{s.impact}</span></span>
                    <button onClick={() => handleApply(s.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isApplying ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : `${s.bg} border ${s.border} ${s.color} hover:opacity-80`
                      }`}>
                      {isApplying ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* STRATEGIES */}
        {tab === 'Strategies' && (
          <div className="space-y-3">
            {STRATEGIES.map((s, i) => (
              <div key={i} className={`bg-[#151c2e] rounded-2xl p-4 border ${s.border} hover:border-opacity-40 transition-all`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.icon}</span>
                    <p className="text-sm font-bold text-white">{s.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${s.bg} border ${s.border} ${s.color}`}>{s.risk} Risk</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{s.alloc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Historical: <span className="text-emerald-400 font-bold">{s.ret}</span></span>
                  <button onClick={() => handleApply(s.name)}
                    className="px-3 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/20 transition-all">
                    {applying === s.name ? 'Applying…' : 'Use Strategy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RISK ALERTS */}
        {tab === 'Risk Alerts' && (
          <div className="space-y-3">
            {[
              { level: 'High', color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5', icon: '🔴', msg: 'BTC concentration exceeds 28% of portfolio — above recommended 20% max single asset.', action: 'Reduce BTC', page: 'Trade' },
              { level: 'Medium', color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5', icon: '🟡', msg: 'Crypto sector total (42%) approaching 45% sector limit. Continued appreciation will trigger rebalance.', action: 'Monitor', page: 'Portfolio' },
              { level: 'Low', color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5', icon: '🔵', msg: 'RWA yield assets underrepresented at 22%. Current macro environment favors higher allocation.', action: 'Explore RWA', page: 'AIIntelligence' },
            ].map((r, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${r.border} ${r.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{r.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${r.border} ${r.color}`}>{r.level} Priority</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{r.msg}</p>
                <Link to={createPageUrl(r.page)}>
                  <button className={`text-xs font-bold ${r.color} flex items-center gap-1 hover:opacity-80 transition-opacity`}>
                    → {r.action} <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}