import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart3, Search, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import { useMarketData } from '../components/shared/MarketDataProvider';
import MiniChart from '../components/shared/MiniChart';

const TABS = ['All', 'Crypto', 'RWA', 'TradFi', 'Gainers', 'Losers', 'Volume'];

function MarketRow({ asset, showYield }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(asset.symbol);
  const price = live.available ? live.price : asset.price;
  const change = live.available ? live.change : asset.change;
  const positive = change >= 0;

  return (
    <Link to={`${createPageUrl('MarketDetail')}?symbol=${asset.symbol}`}>
      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#151c2e] transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[10px] font-black text-[#00d4aa] flex-shrink-0">
            {asset.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{asset.symbol}</p>
            <p className="text-[10px] text-slate-500 truncate">{asset.name}</p>
          </div>
        </div>

        <div className="w-16 flex-shrink-0">
          <MiniChart positive={positive} />
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-white">${formatPrice(price)}</p>
          <div className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatChange(change)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Markets() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const { getLiveAsset } = useMarketData();

  const allAssets = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];

  const getFiltered = () => {
    let base = allAssets;
    if (tab === 'Crypto') base = CRYPTO_MARKETS;
    else if (tab === 'RWA') base = RWA_MARKETS;
    else if (tab === 'TradFi') base = TRADFI_MARKETS;
    else if (tab === 'Gainers') {
      base = [...allAssets].sort((a, b) => {
        const la = getLiveAsset(a.symbol), lb = getLiveAsset(b.symbol);
        return (lb.available ? lb.change : b.change) - (la.available ? la.change : a.change);
      }).slice(0, 10);
    } else if (tab === 'Losers') {
      base = [...allAssets].sort((a, b) => {
        const la = getLiveAsset(a.symbol), lb = getLiveAsset(b.symbol);
        return (la.available ? la.change : a.change) - (lb.available ? lb.change : b.change);
      }).slice(0, 10);
    } else if (tab === 'Volume') {
      base = [...CRYPTO_MARKETS].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
    }

    if (search) {
      base = base.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    return base;
  };

  const filtered = getFiltered();

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Markets</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.06)]">
        <span>Asset</span>
        <span>7d Chart</span>
        <span className="text-right">Price / 24h</span>
      </div>

      {/* Rows */}
      <div className="glass-card mx-4 mt-2 rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.05)]">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No assets found</div>
        )}
        {filtered.map(asset => (
          <MarketRow key={asset.symbol} asset={asset} />
        ))}
      </div>

      <div className="pb-6" />
    </div>
  );
}