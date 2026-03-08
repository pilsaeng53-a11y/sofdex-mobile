import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, Flame, ChevronDown } from 'lucide-react';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS } from '../components/shared/MarketData';
import MarketRow from '../components/markets/MarketRow';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'perpetuals', label: 'Perps' },
  { key: 'rwa', label: 'RWA' },
  { key: 'tradfi', label: 'TradFi' },
];

const sortOptions = [
  { key: 'volume', label: 'Volume' },
  { key: 'change_desc', label: 'Top Gainers' },
  { key: 'change_asc', label: 'Top Losers' },
  { key: 'price', label: 'Price' },
];

export default function Markets() {
  const urlParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('volume');
  const [showSort, setShowSort] = useState(false);

  const allMarkets = useMemo(() => {
    switch (activeTab) {
      case 'perpetuals': return CRYPTO_MARKETS;
      case 'rwa': return RWA_MARKETS;
      case 'tradfi': return TRADFI_MARKETS;
      default: return [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];
    }
  }, [activeTab]);

  const markets = useMemo(() => {
    let result = allMarkets;
    if (search) {
      result = result.filter(m =>
        m.symbol.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    switch (sort) {
      case 'change_desc': result = [...result].sort((a, b) => b.change - a.change); break;
      case 'change_asc': result = [...result].sort((a, b) => a.change - b.change); break;
      case 'price': result = [...result].sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return result;
  }, [allMarkets, search, sort]);

  const gainers = [...allMarkets].sort((a, b) => b.change - a.change).slice(0, 3);
  const losers = [...allMarkets].sort((a, b) => a.change - b.change).slice(0, 3);

  const activeSortLabel = sortOptions.find(s => s.key === sort)?.label || 'Sort';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Markets</h1>
          <p className="text-xs text-slate-500">Explore crypto, RWA & TradFi</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="px-4 mb-4 flex gap-2">
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
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="h-10 px-3 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeSortLabel}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-12 glass-card rounded-xl overflow-hidden z-20 w-36 shadow-xl">
              {sortOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setShowSort(false); }}
                  className={`w-full px-3 py-2.5 text-left text-xs transition-colors hover:bg-[#1a2340] ${
                    sort === opt.key ? 'text-[#00d4aa] font-semibold' : 'text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
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

      {/* Movers strip (only on All tab when no search) */}
      {activeTab === 'all' && !search && (
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Top Gainers */}
            <div className="glass-card rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400">Top Gainers</span>
              </div>
              {gainers.map(a => (
                <div key={a.symbol} className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-semibold text-white">{a.symbol}</span>
                  <span className="text-[11px] text-emerald-400 font-medium">+{a.change.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            {/* Top Losers */}
            <div className="glass-card rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-bold text-red-400">Top Losers</span>
              </div>
              {losers.map(a => (
                <div key={a.symbol} className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-semibold text-white">{a.symbol}</span>
                  <span className="text-[11px] text-red-400 font-medium">{a.change.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market count + header row */}
      <div className="px-4 mb-1 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 font-medium">{markets.length} assets</p>
        <div className="flex gap-6 pr-1 text-[10px] text-slate-600 font-medium">
          <span className="w-16 text-center">7d</span>
          <span className="w-20 text-right">Price / 24h</span>
        </div>
      </div>

      {/* Market list */}
      <div className="px-2 pb-6">
        {markets.map(asset => (
          <MarketRow key={asset.symbol} asset={asset} />
        ))}
      </div>
    </div>
  );
}