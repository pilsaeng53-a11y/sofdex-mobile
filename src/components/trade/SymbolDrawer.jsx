/**
 * SymbolDrawer
 * Slide-up panel (mobile-first) showing all Orderly perpetual futures.
 * Searchable, sorted, with coin icons and 24h price/change.
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { fetchAllSymbols } from '../../services/orderly/orderlySymbolsService';
import { preloadIcons } from '../../services/coinIconService';
import CoinIcon from '../shared/CoinIcon';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(4)}`;
}
function fmtPct(n) {
  if (n == null) return null;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function SymbolRow({ sym, isActive, onSelect }) {
  const pct    = sym.change24h;
  const pctStr = fmtPct(pct);
  const isUp   = pct == null ? null : pct >= 0;

  return (
    <button
      onClick={() => onSelect(sym)}
      className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left"
      style={{
        background: isActive
          ? 'rgba(0,212,170,0.07)'
          : 'transparent',
        borderLeft: isActive
          ? '2px solid #00d4aa'
          : '2px solid transparent',
      }}
    >
      {/* Icon */}
      <CoinIcon symbol={sym.base} size={32} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-white truncate">
            {sym.base}
          </span>
          <span className="text-[10px] text-slate-600 font-medium">
            /{sym.quote}
          </span>
          {isActive && (
            <span
              className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}
            >
              ACTIVE
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5 truncate">
          {sym.displayName}
        </div>
      </div>

      {/* Price + change */}
      <div className="text-right flex-shrink-0">
        <div className="text-[12px] font-mono font-semibold text-slate-200">
          {sym.lastPrice != null ? `$${Number(sym.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '—'}
        </div>
        {pctStr && (
          <div
            className="text-[10px] font-bold flex items-center gap-0.5 justify-end mt-0.5"
            style={{ color: isUp ? '#22c55e' : '#ef4444' }}
          >
            {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {pctStr}
          </div>
        )}
      </div>
    </button>
  );
}

export default function SymbolDrawer({ isOpen, onClose, activeBase, onSelect }) {
  const [symbols,  setSymbols]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [query,    setQuery]    = useState('');
  const inputRef = useRef(null);

  // Fetch symbols on mount
  useEffect(() => {
    fetchAllSymbols()
      .then(syms => {
        setSymbols(syms);
        setLoading(false);
        // Pre-warm icons for the first 30
        preloadIcons(syms.slice(0, 30).map(s => s.base));
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? symbols.filter(s =>
        s.base.includes(query.toUpperCase()) ||
        s.displayName.toLowerCase().includes(query.toLowerCase())
      )
    : symbols;

  function handleSelect(sym) {
    onSelect(sym);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          maxHeight: '82vh',
          background: 'rgba(8,11,20,0.99)',
          border: '1px solid rgba(0,212,170,0.12)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.7)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(148,163,184,0.2)' }} />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-black text-white">Markets</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${symbols.length} perpetual futures`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(148,163,184,0.08)' }}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}
          >
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search symbol…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div
          className="px-4 py-1.5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Symbol</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Price / 24h</span>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 scrollbar-none">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
              <p className="text-[12px] text-slate-600">Fetching markets…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[12px] text-slate-600">No results for "{query}"</p>
            </div>
          )}

          {!loading && !error && filtered.map(sym => (
            <SymbolRow
              key={sym.orderlySymbol}
              sym={sym}
              isActive={sym.base === activeBase}
              onSelect={handleSelect}
            />
          ))}

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}