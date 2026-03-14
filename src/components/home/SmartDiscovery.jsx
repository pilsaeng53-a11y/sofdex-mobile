import React, { useState } from 'react';
import { Zap, TrendingUp, Star, BarChart2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DISCOVERY_SECTIONS = [
  {
    id: 'trending_rwa',
    icon: TrendingUp,
    color: '#8b5cf6',
    title: 'Trending RWA',
    subtitle: 'Most active this week',
    items: [
      { symbol: 'RE-DXB', label: 'Dubai RE Portfolio', meta: '9.2% APY · +2.1%', color: '#8b5cf6' },
      { symbol: 'INFRA-1', label: 'Infrastructure Bond', meta: '6.4% APY · +0.8%', color: '#06b6d4' },
      { symbol: 'ENERGY-1', label: 'Renewable Energy', meta: '8.1% APY · +1.4%', color: '#22c55e' },
    ],
  },
  {
    id: 'high_yield',
    icon: Star,
    color: '#f59e0b',
    title: 'High Yield Assets',
    subtitle: 'Top yielding opportunities',
    items: [
      { symbol: 'RE-DXB', label: 'Dubai RE Portfolio', meta: '9.2% yield', color: '#8b5cf6' },
      { symbol: 'RE-NYC', label: 'NYC Real Estate', meta: '7.8% yield', color: '#8b5cf6' },
      { symbol: 'ENERGY-1', label: 'Renewable Energy', meta: '8.1% yield', color: '#22c55e' },
    ],
  },
  {
    id: 'undervalued',
    icon: Zap,
    color: '#00d4aa',
    title: 'AI: Undervalued',
    subtitle: 'Below fair value estimates',
    items: [
      { symbol: 'AMDx', label: 'AMD (Tokenized)', meta: '-12% vs fair value', color: '#3b82f6' },
      { symbol: 'BABAx', label: 'Alibaba (Token)', meta: '-18% vs fair value', color: '#3b82f6' },
      { symbol: 'EURO-B', label: 'Euro Bond Token', meta: 'Yield spread +0.4%', color: '#3b82f6' },
    ],
  },
  {
    id: 'sectors',
    icon: BarChart2,
    color: '#06b6d4',
    title: 'Growing Sectors',
    subtitle: 'Strong momentum',
    items: [
      { symbol: 'AI', label: 'AI & Semiconductor', meta: 'NVDAx +4.56% · AMDx +2.34%', color: '#06b6d4' },
      { symbol: 'RE', label: 'Real Estate RWA', meta: 'Dubai +2.15% this week', color: '#8b5cf6' },
      { symbol: 'DeFi', label: 'DeFi on Solana', meta: 'JUP +8.71% · RAY -2.45%', color: '#9945FF' },
    ],
  },
];

export default function SmartDiscovery() {
  const [active, setActive] = useState('trending_rwa');
  const section = DISCOVERY_SECTIONS.find(s => s.id === active);

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-white">Smart Discovery</h3>
          <span className="text-[9px] bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 px-1.5 py-0.5 rounded-lg font-bold">AI</span>
        </div>
        <Link to={createPageUrl('AIIntelligence')} className="text-[10px] text-[#00d4aa] font-medium">Full AI →</Link>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {DISCOVERY_SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                active === s.id
                  ? 'border-opacity-30 text-white'
                  : 'border-transparent text-slate-500'
              }`}
              style={active === s.id ? { background: `${s.color}15`, borderColor: `${s.color}30`, color: s.color } : {}}
            >
              <Icon className="w-3 h-3" />
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {section && (
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
          <p className="text-[10px] text-slate-600 mb-3">{section.subtitle}</p>
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                  style={{ background: `${item.color}20`, border: `1px solid ${item.color}30`, color: item.color }}>
                  {item.symbol.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.meta}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}