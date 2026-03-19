import React from 'react';
import { TrendingUp, BarChart2, Globe, Building2, Zap, Shield, ArrowUpRight } from 'lucide-react';

const INSIGHTS = [
  {
    category: 'Real Estate',
    color: '#8b5cf6',
    icon: Building2,
    headline: 'Tokenized RE hits $3.5B TVL',
    detail: 'On-chain real estate volumes surged 42% in Q1 2026, driven by institutional adoption in Dubai and Singapore markets.',
    change: '+42%',
    positive: true,
  },
  {
    category: 'Commodities',
    color: '#f59e0b',
    icon: Globe,
    headline: 'Gold-backed tokens outperform',
    detail: 'Tokenized gold positions returned 18.4% YTD as macro uncertainty drives flight-to-safety flows.',
    change: '+18.4%',
    positive: true,
  },
  {
    category: 'Equity',
    color: '#3b82f6',
    icon: BarChart2,
    headline: 'Tokenized stocks gain regulatory clarity',
    detail: 'SEC guidance opens doors for compliant equity tokenization. Volume expected to 3× in 2026.',
    change: '+3×',
    positive: true,
  },
  {
    category: 'Yield',
    color: '#22c55e',
    icon: TrendingUp,
    headline: 'Treasury token yields hit 5.2% APY',
    detail: 'On-chain US Treasury pools attract $1.2B inflow as DeFi users chase stable, compliant yield.',
    change: '5.2% APY',
    positive: true,
  },
  {
    category: 'Alternative',
    color: '#a78bfa',
    icon: Zap,
    headline: 'Music royalty tokens debut',
    detail: 'First batch of streaming royalty RWAs listed with avg 7.8% yield. 3 more collections pending.',
    change: '7.8% yield',
    positive: true,
  },
];

const MARKET_STATS = [
  { label: 'Total RWA TVL', value: '$12.4B', sub: 'On-chain', color: '#00d4aa' },
  { label: 'Active Assets', value: '2,847', sub: 'Listed globally', color: '#8b5cf6' },
  { label: 'Avg. APY', value: '8.3%', sub: 'Across categories', color: '#f59e0b' },
  { label: 'New Listings', value: '+94', sub: 'This month', color: '#22c55e' },
];

export default function RWAInsights() {
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">RWA Insights</h1>
            <p className="text-xs text-slate-500">Real-world asset market intelligence</p>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          {MARKET_STATS.map(stat => (
            <div key={stat.label} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-[10px] text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-slate-600">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shield banner */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#00d4aa]/5 border border-[#00d4aa]/15">
          <Shield className="w-5 h-5 text-[#00d4aa] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#00d4aa]">Institutional-Grade Intelligence</p>
            <p className="text-[10px] text-slate-400">RWA insights sourced from verified on-chain data, regulatory filings, and SolFort Foundation research.</p>
          </div>
        </div>
      </div>

      {/* Insights Feed */}
      <div className="px-4 space-y-3">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Latest Insights</p>
        {INSIGHTS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: item.color }}>{item.category}</span>
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <ArrowUpRight className="w-3 h-3" />
                      {item.change}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{item.headline}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}