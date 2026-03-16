import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wrench, Flame, Brain, Eye, BarChart3, Compass, BookOpen, ChevronRight, Zap, Shield, TrendingUp } from 'lucide-react';

const TOOLS = [
  {
    icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20',
    title: 'Liquidation Heatmap', subtitle: 'Live price cluster risk zones',
    desc: 'Visualize major liquidation clusters across BTC, ETH, and SOL. See where large leveraged positions could cascade.',
    page: 'AIIntelligence',
  },
  {
    icon: Brain, color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10', border: 'border-[#00d4aa]/20',
    title: 'AI Stop-Loss Engine', subtitle: 'Smart risk-adjusted stop placement',
    desc: 'AI calculates optimal stop-loss levels based on volatility, support zones, and position risk — reducing emotional bias.',
    page: 'AIIntelligence',
  },
  {
    icon: Eye, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20',
    title: 'Whale Radar', subtitle: 'Track large wallet movements',
    desc: 'Real-time alerts for whale accumulation, exchange inflows, large OTC trades, and institutional block moves.',
    page: 'WhaleTracker',
  },
  {
    icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20',
    title: 'Market Heatmap', subtitle: 'Cross-asset performance grid',
    desc: 'Color-coded heatmap across crypto, tokenized stocks, and RWA assets showing relative performance in real time.',
    page: 'MarketHeatmap',
  },
  {
    icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20',
    title: 'Asset Discovery Engine', subtitle: 'AI-curated opportunity finder',
    desc: 'AI surfaces trending assets, high-volume breakouts, new listings, and undervalued opportunities before they move.',
    page: 'AssetDiscovery',
  },
  {
    icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20',
    title: 'Strategy Marketplace', subtitle: 'Browse & copy proven strategies',
    desc: 'Access AI-generated and community-built trading strategies with full performance history, risk profile, and one-click copy.',
    page: 'StrategyMarketplace',
  },
];

export default function TradingTools() {
  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Trading Tools</h1>
      </div>
      <p className="text-xs text-slate-500 mb-5">Advanced instruments for smarter trading decisions</p>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Tools Available', val: '6', color: 'text-[#00d4aa]' },
          { label: 'Signals Today', val: '142', color: 'text-white' },
          { label: 'Avg Accuracy', val: '83%', color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <Link key={i} to={createPageUrl(tool.page)} className="block">
              <div className={`glass-card rounded-2xl p-4 border ${tool.border} hover:bg-[#1a2340] transition-all group`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-white">{tool.title}</p>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                    </div>
                    <p className={`text-[10px] font-semibold ${tool.color} mb-1.5`}>{tool.subtitle}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Copilot CTA */}
      <div className="mt-5 relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/15">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4aa]/5 rounded-full blur-xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-0.5">AI Trading Copilot</p>
            <p className="text-[11px] text-slate-500">Get real-time AI analysis with directional bias, confidence scoring, and trade reasoning.</p>
          </div>
          <Link to={createPageUrl('AIIntelligence')}>
            <button className="px-3 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-[11px] font-bold hover:bg-[#00d4aa]/20 transition-all whitespace-nowrap">
              Open
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}