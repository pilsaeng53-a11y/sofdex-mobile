import React, { useState } from 'react';
import { TRADING_ASSETS } from '@/data/futuresTradingAssets';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

export default function FuturesMarketWatch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('FOREX');

  const categories = Object.keys(TRADING_ASSETS);
  const assets = TRADING_ASSETS[selectedCategory] || [];

  const filteredAssets = assets.filter((asset) =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Market Watch</h1>
        <p className="text-xs text-slate-400">Monitor all trading instruments in real-time</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap text-xs font-semibold transition-all flex-shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.1)] hover:border-[#00d4aa]/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Assets List */}
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div key={asset.symbol} className="p-4 hover:bg-[#1a2340]/50 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-white text-sm">{asset.symbol}</p>
                  <p className="text-xs text-slate-500">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#00d4aa] text-sm">$2,050.50</p>
                  <p className="text-xs text-green-400">+1.23%</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[9px]">
                <div className="bg-[#151c2e] rounded p-1.5 text-center">
                  <p className="text-slate-500">Bid</p>
                  <p className="font-mono text-slate-300">2050.45</p>
                </div>
                <div className="bg-[#151c2e] rounded p-1.5 text-center">
                  <p className="text-slate-500">Ask</p>
                  <p className="font-mono text-slate-300">2050.55</p>
                </div>
                <div className="bg-[#151c2e] rounded p-1.5 text-center">
                  <p className="text-slate-500">Spread</p>
                  <p className="font-mono text-slate-300">{asset.spread} pips</p>
                </div>
                <div className="bg-[#151c2e] rounded p-1.5 text-center">
                  <p className="text-slate-500">Vol</p>
                  <p className="font-mono text-slate-300">2.4M</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">No results found</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-[9px] text-slate-500">
          Data updates every 1 second. Click any instrument to open the chart.
        </p>
      </div>
    </div>
  );
}