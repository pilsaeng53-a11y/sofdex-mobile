import React, { useState } from 'react';
import { Search, Shield, Globe, ArrowRight } from 'lucide-react';
import { RWA_MARKETS } from '../components/shared/MarketData';
import RWACategoryCard from '../components/rwa/RWACategoryCard';
import RWAAssetCard from '../components/rwa/RWAAssetCard';

const categories = ['All', 'Real Estate', 'Commodity', 'Treasury', 'Equity'];

export default function RWAExplore() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = RWA_MARKETS.filter(a => {
    const categoryMatch = activeCategory === 'All' || a.type === activeCategory;
    const searchMatch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const categoryStats = {
    'Real Estate': { count: RWA_MARKETS.filter(a => a.type === 'Real Estate').length, value: '$3.0B' },
    'Commodity': { count: RWA_MARKETS.filter(a => a.type === 'Commodity').length, value: '$21.4B' },
    'Treasury': { count: RWA_MARKETS.filter(a => a.type === 'Treasury').length, value: '$53.5B' },
    'Equity': { count: RWA_MARKETS.filter(a => a.type === 'Equity').length, value: '$18.0B' },
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

      {/* Hero banner */}
      <div className="px-4 my-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a103c] via-[#15112e] to-[#0d1220] border border-[#8b5cf6]/15 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3b82f6]/8 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b5cf6]">Institutional Grade</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Real-World Assets</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
              Access tokenized real estate, commodities, government bonds, and global equities with transparent on-chain pricing and institutional custody.
            </p>
            <div className="flex gap-4 mt-4">
              <div>
                <p className="text-lg font-bold text-white">$96.3B</p>
                <p className="text-[10px] text-slate-500">Total TVL</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-lg font-bold text-white">{RWA_MARKETS.length}</p>
                <p className="text-[10px] text-slate-500">Assets</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-lg font-bold text-[#00d4aa]">5.12%</p>
                <p className="text-[10px] text-slate-500">Avg Yield</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search RWA assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/30 transition-colors"
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-bold text-white mb-3">Categories</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(categoryStats).map(([type, stats]) => (
            <div key={type} onClick={() => setActiveCategory(type)}>
              <RWACategoryCard type={type} count={stats.count} totalValue={stats.value} />
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20'
                  : 'text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset list */}
      <div className="px-4 space-y-3 pb-6">
        {filtered.map(asset => (
          <RWAAssetCard key={asset.symbol} asset={asset} />
        ))}
      </div>
    </div>
  );
}