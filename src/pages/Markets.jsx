import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import AssetCard from '../components/shared/AssetCard';
import MiniChart from '../components/shared/MiniChart';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'perpetuals', label: 'Perpetuals' },
  { key: 'rwa', label: 'RWA' },
  { key: 'tradfi', label: 'TradFi' },
];

export default function Markets() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');

  const getMarkets = () => {
    let markets;
    switch (activeTab) {
      case 'perpetuals': markets = CRYPTO_MARKETS; break;
      case 'rwa': markets = RWA_MARKETS; break;
      case 'tradfi': markets = TRADFI_MARKETS; break;
      default: markets = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];
    }
    if (search) {
      markets = markets.filter(m => 
        m.symbol.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return markets;
  };

  const markets = getMarkets();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-white mb-1">Markets</h1>
        <p className="text-xs text-slate-500">Explore crypto, RWA & TradFi assets</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30 transition-colors"
            />
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 bg-[#0d1220] rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/15'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Market count */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 font-medium">{markets.length} assets</p>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[10px] text-slate-500">Live</span>
        </div>
      </div>

      {/* Market list */}
      <div className="px-4 space-y-2 pb-6">
        {markets.map(asset => (
          <AssetCard key={asset.symbol} asset={asset} compact />
        ))}
      </div>
    </div>
  );
}