import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Zap, Eye, BarChart3, Compass, BookOpen, Shield, Brain, Wrench, TrendingUp, RefreshCw, ChevronRight } from 'lucide-react';

const UPDATES = [
  {
    version: 'v3.0 — March 2026',
    label: 'Major Release',
    labelColor: 'text-[#00d4aa]',
    labelBg: 'bg-[#00d4aa]/10',
    labelBorder: 'border-[#00d4aa]/20',
    features: [
      {
        icon: Brain, color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10',
        title: 'AI Trading Copilot',
        desc: 'Real-time directional bias signals with confidence scoring and full reasoning for 8+ major assets.',
        page: 'AIIntelligence',
      },
      {
        icon: Eye, color: 'text-violet-400', bg: 'bg-violet-400/10',
        title: 'Whale Radar',
        desc: 'Track large wallet movements in real time. Identify whale accumulation, exchange flows, and OTC block trades.',
        page: 'WhaleTracker',
      },
      {
        icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-400/10',
        title: 'Market Heatmap',
        desc: 'Visual performance grid across Crypto, tokenized stocks, and RWA assets with color-coded intensity.',
        page: 'MarketHeatmap',
      },
      {
        icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-400/10',
        title: 'Asset Discovery Engine',
        desc: 'AI highlights trending assets, volume spikes, new listings, and undervalued opportunities before they move.',
        page: 'AssetDiscovery',
      },
      {
        icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10',
        title: 'Strategy Marketplace',
        desc: 'Browse AI-generated and community strategies. View full performance metrics and copy with one tap.',
        page: 'StrategyMarketplace',
      },
      {
        icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10',
        title: 'On-Chain Reputation Score',
        desc: 'Score each wallet based on age, trading history, governance participation, and risk behavior.',
        page: 'ReputationScore',
      },
      {
        icon: Wrench, color: 'text-slate-300', bg: 'bg-slate-300/10',
        title: 'Trading Tools Hub',
        desc: 'Centralized hub for Liquidation Heatmap, AI Stop-Loss, Whale Radar, Market Heatmap, Discovery, and Strategies.',
        page: 'TradingTools',
      },
      {
        icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10',
        title: 'AI Wealth Manager',
        desc: 'Portfolio health score, diversification analysis, risk alerts, and AI rebalancing suggestions.',
        page: 'AIWealthManager',
      },
    ],
  },
  {
    version: 'v2.0 — January 2026',
    label: 'Previous Release',
    labelColor: 'text-slate-400',
    labelBg: 'bg-slate-400/10',
    labelBorder: 'border-slate-400/20',
    features: [
      { icon: Shield, color: 'text-slate-400', bg: 'bg-slate-400/10', title: 'Institutional Hub', desc: 'Aggregated liquidity, OTC desk, risk dashboard, and on-chain asset registry for verified institutions.', page: 'Institutional' },
      { icon: Zap, color: 'text-slate-400', bg: 'bg-slate-400/10', title: 'Universal Wallet', desc: 'Multi-asset wallet supporting crypto, tokenized stocks, gold, real estate, and SOF token management.', page: 'Wallet' },
      { icon: RefreshCw, color: 'text-slate-400', bg: 'bg-slate-400/10', title: 'Cross-Asset Trading', desc: 'Swap between asset classes: BTC → Gold, ETH → Tesla token, SOF → Real Estate.', page: 'Swap' },
    ],
  },
];

export default function WhatsNew() {
  const [expanded, setExpanded] = useState({ 'v3.0 — March 2026': true });

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">What's New</h1>
      </div>
      <p className="text-xs text-slate-500 mb-5">Platform updates and new feature releases</p>

      <div className="space-y-4">
        {UPDATES.map((update, ui) => (
          <div key={ui} className="glass-card rounded-2xl overflow-hidden">
            {/* Version header */}
            <button
              className="w-full flex items-center justify-between p-4 border-b border-[rgba(148,163,184,0.06)]"
              onClick={() => setExpanded(e => ({ ...e, [update.version]: !e[update.version] }))}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${update.labelBg} ${update.labelColor} ${update.labelBorder}`}>
                  {update.label}
                </span>
                <p className="text-sm font-bold text-white">{update.version}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded[update.version] ? 'rotate-90' : ''}`} />
            </button>

            {expanded[update.version] && (
              <div className="divide-y divide-[rgba(148,163,184,0.04)]">
                {update.features.map((feat, fi) => {
                  const Icon = feat.icon;
                  return (
                    <Link key={fi} to={createPageUrl(feat.page)} className="block">
                      <div className="flex items-start gap-3 p-4 hover:bg-[#1a2340] transition-all group">
                        <div className={`w-9 h-9 rounded-xl ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4.5 h-4.5 ${feat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white mb-0.5">{feat.title}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}