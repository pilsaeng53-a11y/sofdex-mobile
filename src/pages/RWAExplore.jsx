import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Shield, Globe, ArrowRight, Building2, Package, BarChart2, Palette, TrendingUp, Zap } from 'lucide-react';
import { RWA_MARKETS, TRADFI_MARKETS } from '../components/shared/MarketData';
import { LANDMARK_RE, ART_MARKETS } from '../components/shared/RWAData';
import RWACategoryCard from '../components/rwa/RWACategoryCard';
import RWAAssetCard from '../components/rwa/RWAAssetCard';
import PropertyCard from '../components/rwa/PropertyCard';
import RWAOverviewDashboard from '../components/rwa/RWAOverviewDashboard';
import XStocksPanel from '../components/rwa/XStocksPanel';
import RWAYieldDashboard from '../components/rwa/RWAYieldDashboard';

const MAIN_TABS = ['All', 'Real Estate', 'Commodities', 'Gold', 'Equities', 'xStocks', 'Yield', 'Art / Collectibles', 'Infrastructure', 'Energy'];

const categoryStats = {
  'Real Estate':  { count: 5,  value: '$9.2B',  icon: Building2, color: '#8b5cf6' },
  'Commodities':  { count: RWA_MARKETS.filter(a => a.type === 'Commodity').length, value: '$21.4B', icon: Package, color: '#f59e0b' },
  'xStocks':      { count: TRADFI_MARKETS.length, value: '$82B',  icon: BarChart2, color: '#60a5fa' },
  'Equities':     { count: RWA_MARKETS.filter(a => a.type === 'Equity').length, value: '$18.0B', icon: BarChart2, color: '#00d4aa' },
  'Yield':        { count: 8,  value: '$53.5B', icon: TrendingUp, color: '#22c55e' },
  'Art / Collectibles': { count: ART_MARKETS.length, value: '$852M', icon: Palette, color: '#ec4899' },
};

export default function RWAExplore() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  // Filter logic per tab
  const getContent = () => {
    if (activeTab === 'Real Estate') {
      const filtered = LANDMARK_RE.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.symbol.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <div className="space-y-4">
          {filtered.map(p => <PropertyCard key={p.symbol} property={p} />)}
        </div>
      );
    }

    if (activeTab === 'xStocks') {
      return <XStocksPanel />;
    }

    if (activeTab === 'Yield') {
      return <RWAYieldDashboard />;
    }

    if (activeTab === 'Infrastructure') {
      const infra = RWA_MARKETS.filter(a => a.type === 'Treasury' || a.symbol.includes('INFRA'));
      return (
        <div className="space-y-3">
          {infra.length === 0 && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <Zap className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
              <p className="text-sm font-bold text-white mb-1">Infrastructure RWA</p>
              <p className="text-[11px] text-slate-500">Coming soon — infrastructure bond tokens and project financing assets will be listed here.</p>
            </div>
          )}
          {infra.map(a => <RWAAssetCard key={a.symbol} asset={a} />)}
        </div>
      );
    }

    if (activeTab === 'Energy') {
      return (
        <div className="glass-card rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white mb-1">Energy RWA</p>
          <p className="text-[11px] text-slate-500">Renewable energy project tokens coming soon. Proposal SFD-007 is currently being voted on.</p>
        </div>
      );
    }

    if (activeTab === 'Art / Collectibles') {
      const filtered = ART_MARKETS.filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.symbol} className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <img src={a.image} alt={a.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{a.symbol}</p>
                  <span className={`text-xs font-bold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {a.change >= 0 ? '+' : ''}{a.change}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{a.name}</p>
                <p className="text-[11px] text-slate-500">{a.artist}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-bold text-white">${a.price.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Vol: {a.volume}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Commodities / Gold / Equities / All
    let base = RWA_MARKETS;
    if (activeTab === 'Gold') base = RWA_MARKETS.filter(a => a.symbol === 'GOLD-T');
    else if (activeTab === 'Commodities') base = RWA_MARKETS.filter(a => a.type === 'Commodity');
    else if (activeTab === 'Equities') base = [...RWA_MARKETS.filter(a => a.type === 'Equity'), ...TRADFI_MARKETS.slice(0, 4)];
    else if (activeTab === 'All') {
      // Mix: property cards first, then RWA
      const filteredRE = LANDMARK_RE.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.symbol.toLowerCase().includes(search.toLowerCase())
      );
      const filteredRWA = RWA_MARKETS.filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <div className="space-y-3">
          {filteredRE.slice(0, 2).map(p => <PropertyCard key={p.symbol} property={p} />)}
          {filteredRWA.map(a => <RWAAssetCard key={a.symbol} asset={a} />)}
        </div>
      );
    }

    const filtered = base.filter(a =>
      !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="space-y-3">
        {filtered.map(a => <RWAAssetCard key={a.symbol} asset={a} />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-[#8b5cf6]" />
          <h1 className="text-xl font-bold text-white">RWA Markets</h1>
        </div>
        <p className="text-xs text-slate-500">Tokenized Real-World Assets on Solana</p>
      </div>

      {/* RWA Overview Dashboard */}
      {activeTab === 'All' && !search && <RWAOverviewDashboard />}

      {/* Hero banner (only on All, no search) */}
      {activeTab === 'All' && !search && (
        <div className="px-4 mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a103c] via-[#15112e] to-[#0d1220] border border-[#8b5cf6]/15 p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b5cf6]">Institutional Grade</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Real-World Assets</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mb-3">
                Trade tokenized real estate, commodities, government bonds, equities, and collectibles with transparent on-chain pricing.
              </p>
              <Link to={createPageUrl('RealEstate')}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-semibold hover:bg-[#8b5cf6]/20 transition-all">
                  Explore Real Estate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Category cards (only on All, no search) */}
      {activeTab === 'All' && !search && (
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-3">Categories</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(categoryStats).map(([type, stats]) => (
              <button key={type} onClick={() => setActiveTab(type)} className="text-left">
                <RWACategoryCard type={type} count={stats.count} totalValue={stats.value} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search RWA assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/30 transition-colors"
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {MAIN_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic content */}
      <div className="px-4 pb-8">
        {getContent()}
      </div>
    </div>
  );
}