import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Shield, Globe, ArrowRight, Building2, Package, BarChart2, Palette, TrendingUp, Zap, Music, Gem, Flame } from 'lucide-react';
import RWAPropertyCard from '../components/rwa/RWAPropertyCard';
import { getPropertyList } from '@/services/rwaPropertyService';
import { LANDMARK_RE, ART_MARKETS, COMMODITY_MARKETS, YIELD_MARKETS, ALT_MARKETS, STOCK_MARKETS, ETF_MARKETS } from '../components/shared/RWAData';
import RWACategoryCard from '../components/rwa/RWACategoryCard';
import RWAAssetCard from '../components/rwa/RWAAssetCard';
import PropertyCard from '../components/rwa/PropertyCard';
import RWAOverviewDashboard from '../components/rwa/RWAOverviewDashboard';
import XStocksPanel from '../components/rwa/XStocksPanel';
import RWAYieldDashboard from '../components/rwa/RWAYieldDashboard';
import TrendingRWA from '../components/rwa/TrendingRWA';
import CommodityCard from '../components/rwa/CommodityCard';
import YieldCard from '../components/rwa/YieldCard';
import AltAssetCard from '../components/rwa/AltAssetCard';

const MAIN_TABS = ['All', 'Real Estate', 'Commodities', 'Stocks', 'ETFs', 'Yield', 'Art & Collectibles', 'Alternative'];

const categoryStats = {
  'Real Estate':       { count: LANDMARK_RE.length,      value: '$11.4B', icon: Building2,  color: '#8b5cf6', desc: 'Landmark properties worldwide' },
  'Commodities':       { count: COMMODITY_MARKETS.length, value: '$21.4B', icon: Package,    color: '#f59e0b', desc: 'Gold, oil, metals & more' },
  'Stocks':            { count: STOCK_MARKETS.length,     value: '$82B',   icon: BarChart2,  color: '#3b82f6', desc: 'Blue-chip tokenized equities' },
  'ETFs':              { count: ETF_MARKETS.length,       value: '$76B',   icon: TrendingUp, color: '#00d4aa', desc: 'Diversified index exposure' },
  'Yield':             { count: YIELD_MARKETS.length,     value: '$53.5B', icon: Zap,        color: '#22c55e', desc: 'Bonds, treasuries & pools' },
  'Art & Collectibles':{ count: ART_MARKETS.length,       value: '$3.5B',  icon: Palette,    color: '#ec4899', desc: 'Blue-chip art & watches' },
  'Alternative':       { count: ALT_MARKETS.length,       value: '$2.1B',  icon: Music,      color: '#a78bfa', desc: 'Royalties, gaming & luxury' },
};

function ArtCard({ asset }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
      <img src={asset.image} alt={asset.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-xs font-bold text-white">{asset.symbol}</p>
          <span className={`text-xs font-bold ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {asset.change >= 0 ? '+' : ''}{asset.change}%
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">{asset.name}</p>
        <p className="text-[10px] text-slate-500">{asset.artist}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold text-white">${asset.price.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            {asset.tag && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">{asset.tag}</span>}
            {asset.verified && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RWAExplore() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [rwaProperties, setRwaProperties] = useState([]);

  useEffect(() => {
    getPropertyList('published').then(setRwaProperties).catch(() => {});
  }, []);

  const filterBySearch = (arr, fields = ['name', 'symbol']) =>
    !search ? arr : arr.filter(a => fields.some(f => a[f]?.toLowerCase().includes(search.toLowerCase())));

  const getContent = () => {
    if (activeTab === 'Real Estate') {
      const filtered = filterBySearch(LANDMARK_RE);
      const filteredRWA = !search ? rwaProperties : rwaProperties.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <div className="space-y-4">
          {filteredRWA.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider px-1">SolFort RWA 등록 자산</p>
              {filteredRWA.map((p, i) => <RWAPropertyCard key={p.id || i} property={p} />)}
              <div className="h-px bg-[rgba(148,163,184,0.08)]" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">토큰화 자산 (시장 데이터)</p>
            </>
          )}
          {filtered.map(p => <PropertyCard key={p.symbol} property={p} />)}
        </div>
      );
    }

    if (activeTab === 'Commodities') {
      const filtered = filterBySearch(COMMODITY_MARKETS);
      return <div className="space-y-3">{filtered.map(a => <CommodityCard key={a.symbol} asset={a} />)}</div>;
    }

    if (activeTab === 'Stocks') {
      const filtered = filterBySearch(STOCK_MARKETS);
      return (
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 px-1">Tokenized blue-chip equities — economic exposure only. T+0 settlement on-chain.</p>
          {filtered.map(a => (
            <div key={a.symbol} className="glass-card rounded-2xl p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white">{a.name}</p>
                    {a.tag && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{a.tag}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{a.symbol} · {a.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">${a.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className={`text-xs font-bold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {a.change >= 0 ? '+' : ''}{a.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'ETFs') {
      const filtered = filterBySearch(ETF_MARKETS);
      return (
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 px-1">Tokenized index ETFs with on-chain T+0 settlement and transparent NAV pricing.</p>
          {filtered.map(a => (
            <div key={a.symbol} className="glass-card rounded-2xl p-4 border border-teal-500/10 hover:border-teal-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white">{a.name}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">{a.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{a.symbol} · AUM: {a.mcap}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">${a.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <span className={`text-xs font-bold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {a.change >= 0 ? '+' : ''}{a.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'Yield') {
      const filtered = filterBySearch(YIELD_MARKETS);
      return <div className="space-y-3">{filtered.map(a => <YieldCard key={a.symbol} asset={a} />)}</div>;
    }

    if (activeTab === 'Art & Collectibles') {
      const filtered = filterBySearch(ART_MARKETS);
      return <div className="space-y-3">{filtered.map(a => <ArtCard key={a.symbol} asset={a} />)}</div>;
    }

    if (activeTab === 'Alternative') {
      const filtered = filterBySearch(ALT_MARKETS);
      return (
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 px-1">Tokenized alternative assets — music royalties, sports contracts, luxury goods, film revenue, and more.</p>
          {filtered.map(a => <AltAssetCard key={a.symbol} asset={a} />)}
        </div>
      );
    }

    // All tab — overview
    const filteredRE = filterBySearch(LANDMARK_RE);
    const filteredComm = filterBySearch(COMMODITY_MARKETS);
    return (
      <div className="space-y-3">
        {filteredRE.slice(0, 2).map(p => <PropertyCard key={p.symbol} property={p} />)}
        {filteredComm.slice(0, 3).map(a => <CommodityCard key={a.symbol} asset={a} />)}
        {filterBySearch(STOCK_MARKETS).slice(0, 2).map(a => (
          <div key={a.symbol} className="glass-card rounded-2xl p-4 border border-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{a.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{a.symbol} · {a.sector}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">${a.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs font-bold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{a.change >= 0 ? '+' : ''}{a.change}%</span>
              </div>
            </div>
          </div>
        ))}
        {filterBySearch(ART_MARKETS).slice(0, 2).map(a => <ArtCard key={a.symbol} asset={a} />)}
        {filterBySearch(ALT_MARKETS).slice(0, 2).map(a => <AltAssetCard key={a.symbol} asset={a} />)}
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
        <p className="text-xs text-slate-500">Tokenized Real-World Assets on Solana — {Object.values(categoryStats).reduce((s,c) => s + c.count, 0)}+ assets across {Object.keys(categoryStats).length} categories</p>
      </div>

      {/* Overview Dashboard */}
      {activeTab === 'All' && !search && <RWAOverviewDashboard />}

      {/* Hero Banner */}
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
                Trade tokenized real estate, commodities, blue-chip stocks, government bonds, collectibles, and alternative assets with transparent on-chain pricing.
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

      {/* Trending Section */}
      {activeTab === 'All' && !search && <TrendingRWA />}

      {/* Category Cards */}
      {activeTab === 'All' && !search && (
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-3">All Categories</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(categoryStats).map(([type, stats]) => {
              const Icon = stats.icon;
              return (
                <button key={type} onClick={() => setActiveTab(type)} className="text-left">
                  <div className="glass-card rounded-2xl p-3.5 border border-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.12)] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stats.color}18` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: stats.color }} />
                      </div>
                      <span className="text-xs font-bold text-white truncate">{type}</span>
                    </div>
                    <p className="text-base font-black" style={{ color: stats.color }}>{stats.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{stats.count} assets · {stats.desc}</p>
                  </div>
                </button>
              );
            })}
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
                : 'text-slate-500 border border-transparent hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {getContent()}
      </div>
    </div>
  );
}