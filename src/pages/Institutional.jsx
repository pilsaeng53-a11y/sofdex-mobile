import React, { useState } from 'react';
import { Shield, Layers, Briefcase, Database, BarChart2, ChevronLeft, Lock } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import InstitutionalGate from '../components/institutional/InstitutionalGate';
import RiskDashboard from '../components/institutional/RiskDashboard';
import AssetRegistry from '../components/institutional/AssetRegistry';
import OTCDesk from '../components/institutional/OTCDesk';
import LiquidityView from '../components/institutional/LiquidityView';
import AssetRegistryDetail from './AssetRegistryDetail';

const TABS = [
  { key: 'liquidity', icon: Layers, labelKey: 'inst_tab_liquidity' },
  { key: 'otc', icon: Briefcase, labelKey: 'inst_tab_otc' },
  { key: 'risk', icon: Shield, labelKey: 'inst_tab_risk' },
  { key: 'registry', icon: Database, labelKey: 'inst_tab_registry' },
];

export default function Institutional() {
  const { t } = useLang();
  const [approved, setApproved] = useState(false);
  const [activeTab, setActiveTab] = useState('liquidity');
  const [selectedAsset, setSelectedAsset] = useState(null);

  if (!approved) {
    return <InstitutionalGate onDemoApprove={() => setApproved(true)} />;
  }

  if (selectedAsset) {
    return <AssetRegistryDetail asset={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#3b82f6]/20 border border-[#00d4aa]/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#00d4aa]" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-black text-white">{t('inst_dashboard_title')}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] pulse-dot" />
              <span className="text-[10px] text-[#00d4aa]">{t('inst_approved_access')}</span>
              <span className="text-[10px] text-slate-600">· {t('inst_demo_mode')}</span>
            </div>
          </div>
          <button
            onClick={() => setApproved(false)}
            className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400"
          >
            <Lock className="w-3 h-3" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { label: 'inst_stat_aum', value: '$284M' },
            { label: 'inst_stat_venues', value: '6 CEX/DEX' },
            { label: 'inst_stat_latency', value: '1.4ms' },
          ].map(s => (
            <div key={s.label} className="bg-[#151c2e] rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)]">
              <p className="text-[9px] text-slate-600">{t(s.label)}</p>
              <p className="text-sm font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {activeTab === 'liquidity' && <LiquidityView />}
        {activeTab === 'otc' && <OTCDesk />}
        {activeTab === 'risk' && <RiskDashboard />}
        {activeTab === 'registry' && <AssetRegistry onSelectAsset={setSelectedAsset} />}
      </div>
    </div>
  );
}