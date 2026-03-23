import React, { useState, useMemo } from 'react';
import { Search, Star, TrendingUp, TrendingDown, X } from 'lucide-react';
import { TRADING_ASSETS } from '@/data/futuresTradingAssets';
import CoinIcon from '../shared/CoinIcon';

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'FAVORITES', label: '★' },
  { id: 'FOREX', label: 'FX' },
  { id: 'COMMODITIES', label: 'Comm' },
  { id: 'INDICES', label: 'Idx' },
  { id: 'STOCKS', label: 'EQ' },
  { id: 'CRYPTO_PERPS', label: 'Crypto' },
];

// Mock live prices per symbol
const MOCK_PRICES = {
  'EURUSD-T': { price: 1.0873, change: 0.12 },
  'USDJPY-T': { price: 149.82, change: -0.31 },
  'GBPUSD-T': { price: 1.2641, change: 0.08 },
  'AUDUSD-T': { price: 0.6512, change: -0.22 },
  'GOLD-T':   { price: 2341.5, change: 0.55 },
  'OIL-T':    { price: 78.34, change: -1.12 },
  'SILVER-T': { price: 27.81, change: 0.34 },
  'NATGAS-T': { price: 1.932, change: -2.14 },
  'SP500-T':  { price: 5214.2, change: 1.08 },
  'NASDAQ-T': { price: 18320.0, change: 1.43 },
  'DAX-T':    { price: 17892.4, change: 0.67 },
  'FTSE-T':   { price: 7852.1, change: -0.19 },
  'AAPL-T':   { price: 172.45, change: 0.88 },
  'GOOGL-T':  { price: 175.20, change: 1.11 },
  'MSFT-T':   { price: 415.30, change: 0.52 },
  'TSLA-T':   { price: 182.60, change: -2.41 },
  'NVDA-T':   { price: 879.50, change: 3.22 },
  'BTC-PERP': { price: 67450.0, change: 2.14 },
  'ETH-PERP': { price: 3542.0, change: 1.88 },
  'SOL-PERP': { price: 178.40, change: 4.11 },
};

export default function InstrumentSidebar({ selectedSymbol, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('ALL');
  const [favorites, setFavorites] = useState(new Set(['GOLD-T', 'BTC-PERP', 'EURUSD-T']));

  const allAssets = useMemo(() => Object.entries(TRADING_ASSETS).flatMap(([cat, items]) =>
    items.map(a => ({ ...a, catKey: cat }))
  ), []);

  const filtered = useMemo(() => {
    let list = allAssets;
    if (cat === 'FAVORITES') list = list.filter(a => favorites.has(a.symbol));
    else if (cat !== 'ALL') list = list.filter(a => a.catKey === cat);
    if (search) list = list.filter(a =>
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [allAssets, cat, search, favorites]);

  const toggleFav = (e, sym) => {
    e.stopPropagation();
    setFavorites(f => {
      const n = new Set(f);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });
  };

  // Top movers
  const movers = [...allAssets]
    .sort((a, b) => Math.abs((MOCK_PRICES[b.symbol]?.change ?? 0)) - Math.abs((MOCK_PRICES[a.symbol]?.change ?? 0)))
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-[#0b0f1a] border-r border-[rgba(148,163,184,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[rgba(148,163,184,0.08)]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symbols</span>
        <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#151c2e] transition-colors">
          <X className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center gap-1.5 bg-[#151c2e] rounded-lg px-2 py-1">
          <Search className="w-3 h-3 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-[10px] text-white placeholder-slate-600 outline-none"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-[rgba(148,163,184,0.06)]">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`flex-shrink-0 px-2 py-1.5 text-[9px] font-bold transition-all ${cat === c.id ? 'text-[#00d4aa] border-b-2 border-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Top movers strip */}
      {cat === 'ALL' && !search && (
        <div className="px-2 py-1.5 border-b border-[rgba(148,163,184,0.06)]">
          <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">Top Movers</p>
          <div className="space-y-0.5">
            {movers.map(a => {
              const mp = MOCK_PRICES[a.symbol] || {};
              const pos = (mp.change ?? 0) >= 0;
              return (
                <button key={a.symbol} onClick={() => onSelect(a.symbol)}
                  className="w-full flex items-center justify-between px-1 py-0.5 rounded hover:bg-[#151c2e] transition-colors">
                  <span className="text-[9px] font-mono text-slate-300">{a.symbol.replace(/-T$|-PERP$/, '')}</span>
                  <span className={`text-[9px] font-bold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos ? '+' : ''}{mp.change?.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Symbol list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filtered.map(a => {
          const mp = MOCK_PRICES[a.symbol] || {};
          const pos = (mp.change ?? 0) >= 0;
          const isSel = selectedSymbol === a.symbol;
          const isFav = favorites.has(a.symbol);
          return (
            <button key={a.symbol} onClick={() => onSelect(a.symbol)}
              className={`w-full flex items-center gap-1.5 px-2 py-2 border-b border-[rgba(148,163,184,0.04)] transition-all ${isSel ? 'bg-[#00d4aa]/10 border-l-2 border-l-[#00d4aa]' : 'hover:bg-[#151c2e]/60'}`}>
              <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 bg-[#151c2e] flex items-center justify-center">
                <CoinIcon symbol={a.symbol.replace(/-T$|-PERP$/, '')} size={20} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-bold text-white truncate">{a.symbol.replace(/-T$|-PERP$/, '')}</p>
                <p className="text-[8px] text-slate-600 truncate">sp {a.spread}</p>
              </div>
              <div className="text-right">
                <p className={`text-[9px] font-bold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos ? '+' : ''}{mp.change?.toFixed(2)}%
                </p>
                <button onClick={e => toggleFav(e, a.symbol)} className="mt-0.5">
                  <Star className={`w-2.5 h-2.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}