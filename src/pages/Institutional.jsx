import React, { useState } from 'react';
import { Shield, Layers, Briefcase, Database, BarChart2, Lock, TrendingUp, DollarSign, Globe, Zap, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import InstitutionalGate from '../components/institutional/InstitutionalGate';
import { DEV_MODE } from '@/components/shared/devConfig';
import RiskDashboard from '../components/institutional/RiskDashboard';
import AssetRegistry from '../components/institutional/AssetRegistry';
import OTCDesk from '../components/institutional/OTCDesk';
import LiquidityView from '../components/institutional/LiquidityView';
import AssetRegistryDetail from './AssetRegistryDetail';

const TABS = [
  { key: 'overview', icon: BarChart2, label: 'Overview' },
  { key: 'liquidity', icon: Layers, label: 'Liquidity' },
  { key: 'otc', icon: Briefcase, label: 'OTC Desk' },
  { key: 'risk', icon: Shield, label: 'Risk' },
  { key: 'registry', icon: Database, label: 'Registry' },
];

const FEE_TIERS = [
  { tier: 'Standard', vol: '< $1M / mo', maker: '0.04%', taker: '0.06%', color: '#64748b', bg: 'bg-slate-700/10', border: 'border-slate-700/20' },
  { tier: 'Prime', vol: '$1M – $10M', maker: '0.02%', taker: '0.04%', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { tier: 'Elite', vol: '$10M – $100M', maker: '0.01%', taker: '0.02%', color: '#8b5cf6', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { tier: 'VIP', vol: '> $100M', maker: '0.00%', taker: '0.01%', color: '#00d4aa', bg: 'bg-[#00d4aa]/10', border: 'border-[#00d4aa]/20' },
];

function OverviewTab() {
  return (
    <div className="space-y-4">
      {/* AUM Overview */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#151c2e] via-[#1a2340] to-[#151c2e] rounded-2xl border border-[#00d4aa]/15 p-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs font-bold text-[#00d4aa] uppercase tracking-wider">AUM Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Total AUM</p>
              <p className="text-3xl font-black text-white">$284M</p>
              <p className="text-[10px] text-emerald-400 mt-1">↑ +12.4% this month</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Daily Volume</p>
              <p className="text-3xl font-black text-white">$47M</p>
              <p className="text-[10px] text-slate-500 mt-1">Across 6 venues</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Institutions', value: '142' },
              { label: 'Avg Fill Rate', value: '99.7%' },
              { label: 'Avg Latency', value: '1.4ms' },
            ].map((s, i) => (
              <div key={i} className="bg-[#0a0e1a]/60 rounded-xl p-2.5 text-center border border-[rgba(148,163,184,0.06)]">
                <p className="text-sm font-black text-white">{s.value}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liquidity Depth Preview */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-sm font-bold text-white">Liquidity Depth Preview</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-[#00d4aa]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            Live
          </span>
        </div>
        <div className="space-y-2">
          {[
            { asset: 'BTC/USDC', bid: '$22.4M', ask: '$19.8M', spread: '0.03%' },
            { asset: 'ETH/USDC', bid: '$8.1M', ask: '$7.4M', spread: '0.04%' },
            { asset: 'SOL/USDC', bid: '$3.2M', ask: '$2.9M', spread: '0.06%' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#1a2340] text-[11px]">
              <span className="font-bold text-white w-24">{row.asset}</span>
              <span className="text-emerald-400">{row.bid}</span>
              <span className="text-red-400">{row.ask}</span>
              <span className="text-slate-400">{row.spread}</span>
            </div>
          ))}
          <div className="flex justify-between px-3 text-[9px] text-slate-600">
            <span>Pair</span><span>Bid Depth</span><span>Ask Depth</span><span>Spread</span>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-white">Institutional Fee Structure</span>
        </div>
        <div className="space-y-2">
          {FEE_TIERS.map((tier, i) => (
            <div key={i} className={`${tier.bg} border ${tier.border} rounded-xl p-3 flex items-center justify-between`}>
              <div>
                <p className="text-sm font-bold text-white">{tier.tier}</p>
                <p className="text-[10px] text-slate-500">{tier.vol}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-600">Maker</p>
                    <p className="text-xs font-black" style={{ color: tier.color }}>{tier.maker}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-600">Taker</p>
                    <p className="text-xs font-black" style={{ color: tier.color }}>{tier.taker}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OTC Request CTA */}
      <div className="bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 rounded-2xl border border-[#3b82f6]/20 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">OTC Trading Desk</p>
            <p className="text-[11px] text-slate-400 leading-snug">Execute block trades from $100K+ with dedicated desk support, tight spreads and T+0 settlement.</p>
          </div>
        </div>
        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
          Request OTC Quote
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Apply CTA */}
      <a
        href="https://solfort.foundation"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-[#0a0e1a] font-bold text-sm"
      >
        Apply for Full Institutional Access
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function Institutional() {
  // DEV_MODE: start as approved, skip gate entirely
  const [approved, setApproved] = useState(DEV_MODE ? true : false);
  const [activeTab, setActiveTab] = useState('overview');
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
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#3b82f6]/20 border border-[#00d4aa]/25 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Institutional Access</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                <span className="text-[10px] text-[#00d4aa] font-semibold">Approved · Demo Mode</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setApproved(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-[10px] text-slate-500 hover:text-slate-300 transition-all"
          >
            <Lock className="w-3 h-3" />
            Lock
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'AUM', value: '$284M', color: 'text-[#00d4aa]' },
            { label: 'Venues', value: '6 CEX/DEX', color: 'text-white' },
            { label: 'Latency', value: '1.4ms', color: 'text-blue-400' },
          ].map((s, i) => (
            <div key={i} className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#00d4aa]/15 to-[#3b82f6]/10 text-[#00d4aa] border-[#00d4aa]/25 shadow-sm shadow-[#00d4aa]/10'
                  : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)] hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'liquidity' && <LiquidityView />}
        {activeTab === 'otc' && <OTCDesk />}
        {activeTab === 'risk' && <RiskDashboard />}
        {activeTab === 'registry' && <AssetRegistry onSelectAsset={setSelectedAsset} />}
      </div>
    </div>
  );
}