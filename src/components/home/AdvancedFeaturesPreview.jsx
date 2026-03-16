import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Eye, Compass, BookOpen, BarChart3, TrendingUp, ChevronRight, Zap, ArrowDownRight } from 'lucide-react';

const AI_SIGNALS = [
  { asset: 'SOL', dir: 'Long', conf: 88, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { asset: 'BTC', dir: 'Long', conf: 81, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { asset: 'BONK', dir: 'Short', conf: 67, color: 'text-red-400', bg: 'bg-red-400/10' },
];

const WHALE_ALERTS = [
  { type: 'Whale Buy', asset: 'BTC', usd: '$13.9M', time: '4m', dir: 'in' },
  { type: 'Exchange Outflow', asset: 'SOL', usd: '$9.0M', time: '11m', dir: 'in' },
];

const TRENDING = [
  { asset: 'RNDR', change: '+12.3%', tag: 'AI Compute' },
  { asset: 'JUP', change: '+8.7%', tag: 'Volume Spike' },
  { asset: 'SOL', change: '+11.3%', tag: 'Whale Buy' },
];

const STRATEGY_HIGHLIGHTS = [
  { name: 'AI Momentum Alpha', ret: '+42.8%', risk: 'Medium', copiers: '3.2K' },
  { name: 'RWA Yield Harvester', ret: '+9.2%', risk: 'Low', copiers: '1.8K' },
];

export default function AdvancedFeaturesPreview() {
  return (
    <div className="px-4 space-y-3 mb-4">
      {/* Section title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-xs font-bold text-white">Advanced Features</p>
        </div>
      </div>

      {/* AI Copilot Preview */}
      <Link to={createPageUrl('AIIntelligence')} className="block">
        <div className="glass-card rounded-2xl p-3.5 border border-[#00d4aa]/12 hover:bg-[#1a2340] transition-all group">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#00d4aa]" />
              <p className="text-[11px] font-bold text-white">AI Copilot Signals</p>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] pulse-dot" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
          </div>
          <div className="flex gap-2">
            {AI_SIGNALS.map((s, i) => (
              <div key={i} className={`flex-1 rounded-xl ${s.bg} p-2 text-center`}>
                <p className="text-[10px] font-black text-white">{s.asset}</p>
                <p className={`text-[10px] font-bold ${s.color}`}>{s.dir}</p>
                <p className="text-[9px] text-slate-500">{s.conf}%</p>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Whale Radar Preview */}
      <Link to={createPageUrl('WhaleTracker')} className="block">
        <div className="glass-card rounded-2xl p-3.5 border border-violet-400/12 hover:bg-[#1a2340] transition-all group">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-violet-400" />
              <p className="text-[11px] font-bold text-white">Whale Radar</p>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            {WHALE_ALERTS.map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">{w.type}</span>
                  <span className="text-[10px] text-slate-500">· {w.asset}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white">{w.usd}</span>
                  <span className="text-[9px] text-slate-600">{w.time} ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* 2-col row: Trending + Strategy */}
      <div className="grid grid-cols-2 gap-2">
        <Link to={createPageUrl('AssetDiscovery')} className="block">
          <div className="glass-card rounded-2xl p-3 border border-cyan-400/12 hover:bg-[#1a2340] transition-all h-full group">
            <div className="flex items-center gap-1.5 mb-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <p className="text-[10px] font-bold text-white">Trending</p>
              <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto" />
            </div>
            {TRENDING.map((t, i) => (
              <div key={i} className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-white">{t.asset}</span>
                <span className="text-[10px] font-bold text-emerald-400">{t.change}</span>
              </div>
            ))}
          </div>
        </Link>
        <Link to={createPageUrl('StrategyMarketplace')} className="block">
          <div className="glass-card rounded-2xl p-3 border border-purple-400/12 hover:bg-[#1a2340] transition-all h-full group">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[10px] font-bold text-white">Strategies</p>
              <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto" />
            </div>
            {STRATEGY_HIGHLIGHTS.map((s, i) => (
              <div key={i} className="mb-1.5">
                <p className="text-[10px] font-semibold text-white truncate">{s.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-emerald-400 font-bold">{s.ret}</span>
                  <span className="text-[9px] text-slate-600">· {s.copiers} copiers</span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      </div>

      {/* Heatmap preview */}
      <Link to={createPageUrl('MarketHeatmap')} className="block">
        <div className="glass-card rounded-2xl p-3.5 border border-amber-400/12 hover:bg-[#1a2340] transition-all group">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[11px] font-bold text-white">Market Heatmap</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[
              { s: 'BTC', v: '+6.4' }, { s: 'SOL', v: '+11.3' }, { s: 'ETH', v: '+2.1' },
              { s: 'JUP', v: '+8.7' }, { s: 'BONK', v: '-5.1' }, { s: 'RNDR', v: '+12.3' },
            ].map((c, i) => {
              const val = parseFloat(c.v);
              const cls = val > 8 ? 'bg-emerald-400 text-white' : val > 3 ? 'bg-emerald-600/70 text-white' : val > 0 ? 'bg-emerald-900/50 text-emerald-300' : val > -3 ? 'bg-red-900/50 text-red-300' : 'bg-red-600/70 text-white';
              return (
                <div key={i} className={`${cls} rounded-lg p-1.5 text-center`}>
                  <p className="text-[8px] font-black">{c.s}</p>
                  <p className="text-[8px] font-bold">{c.v}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </Link>
    </div>
  );
}