import React, { useState } from 'react';
import { Brain, Flame, Building2, Globe } from 'lucide-react';
import AISignalsPanel from '../components/analytics/AISignalsPanel';
import HotAssetsByRegion from '../components/analytics/HotAssetsByRegion';
import InstitutionalPortfolios from '../components/analytics/InstitutionalPortfolios';

const TABS = [
  { key: 'signals', label: 'AI Signals', icon: Brain, color: '#00d4aa' },
  { key: 'regional', label: 'Hot by Region', icon: Flame, color: '#f97316' },
  { key: 'institutional', label: 'Institutional', icon: Building2, color: '#3b82f6' },
];

export default function AnalyticsIntelligence() {
  const [tab, setTab] = useState('signals');

  return (
    <div className="px-4 py-4 pb-8 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Brain className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">AI Intelligence</h1>
        </div>
        <p className="text-xs text-slate-500">Signals, indicators, regional trends & institutional flow</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-[#0a0e1a] rounded-xl p-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                tab === t.key ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-3 h-3" style={{ color: tab === t.key ? t.color : undefined }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'signals' && <AISignalsPanel />}
      {tab === 'regional' && <HotAssetsByRegion />}
      {tab === 'institutional' && <InstitutionalPortfolios />}
    </div>
  );
}