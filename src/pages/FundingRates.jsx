import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Zap, Search } from 'lucide-react';
import { CRYPTO_MARKETS } from '../components/shared/MarketData';
import { Link } from 'react-router-dom';

// Deterministic funding rate seeded from symbol
function getFundingRate(symbol) {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const raw = ((seed % 100) - 50) * 0.000_2;
  return parseFloat(raw.toFixed(5));
}

// Next funding in HH:MM:SS countdown
function useCountdown() {
  const [seconds, setSeconds] = useState(() => {
    const now = Date.now();
    const next8h = Math.ceil(now / (8 * 3600_000)) * 8 * 3600_000;
    return Math.floor((next8h - now) / 1000);
  });
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 28800), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function fmt(r) {
  const pct = (r * 100).toFixed(4);
  return `${r >= 0 ? '+' : ''}${pct}%`;
}

const ANNUALIZED_FACTOR = 3 * 365; // 3x/day × 365

export default function FundingRates() {
  const countdown = useCountdown();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('abs'); // abs | asc | desc

  const rows = CRYPTO_MARKETS.map(m => ({
    ...m,
    rate: getFundingRate(m.symbol),
    annualized: getFundingRate(m.symbol) * ANNUALIZED_FACTOR,
  }));

  // Identify arbitrage opportunities (|rate| > 0.01%)
  const arb = rows.filter(r => Math.abs(r.rate) > 0.0001);

  const filtered = rows
    .filter(r => r.symbol.includes(search.toUpperCase()) || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'abs') return Math.abs(b.rate) - Math.abs(a.rate);
      if (sortBy === 'asc') return a.rate - b.rate;
      return b.rate - a.rate;
    });

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Funding Rates</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)]">
          <Clock className="w-3 h-3 text-[#00d4aa]" />
          <span className="text-[11px] font-mono text-[#00d4aa]">{countdown}</span>
        </div>
      </div>

      {/* Funding Arb Banner */}
      {arb.length > 0 && (
        <div className="mb-4 bg-amber-400/8 border border-amber-400/20 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Funding Arbitrage Opportunities</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {arb.map(r => (
              <Link key={r.symbol} to={`/Trade?symbol=${r.symbol}`}
                className="flex-shrink-0 px-3 py-2 bg-[#0a0e1a] rounded-xl border border-amber-400/15 hover:border-amber-400/35 transition-all">
                <p className="text-xs font-bold text-white">{r.symbol}</p>
                <p className={`text-[11px] font-semibold ${r.rate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(r.rate)}</p>
                <p className="text-[9px] text-slate-600">{r.rate >= 0 ? 'Shorts earn' : 'Longs earn'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset..."
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30" />
        </div>
        {[['abs','|Rate|'],['desc','Highest'],['asc','Lowest']].map(([v, l]) => (
          <button key={v} onClick={() => setSortBy(v)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition-all ${
              sortBy === v ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
            }`}>{l}</button>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-3 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.04)]">
        <span>Asset</span>
        <span className="text-center">Rate (8h)</span>
        <span className="text-center">Annual.</span>
        <span className="text-right">Next Fund.</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[rgba(148,163,184,0.04)]">
        {filtered.map(r => (
          <Link key={r.symbol} to={`/Trade?symbol=${r.symbol}`}
            className="grid grid-cols-4 px-3 py-3 hover:bg-[#151c2e]/60 transition-colors items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1a2340] flex items-center justify-center text-[9px] font-black text-[#00d4aa]">
                {r.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{r.symbol}</p>
                <p className="text-[9px] text-slate-600">{r.maxLeverage}x max</p>
              </div>
            </div>
            <div className="text-center">
              <span className={`text-xs font-bold ${r.rate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(r.rate)}
              </span>
            </div>
            <div className="text-center">
              <span className={`text-[11px] font-medium ${r.annualized >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(r.annualized)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400">{countdown}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-4 bg-[#151c2e] rounded-2xl p-3.5 border border-[rgba(148,163,184,0.06)]">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <span className="text-white font-semibold">Funding rates</span> are paid every 8 hours between long and short holders.
          Positive rate = longs pay shorts. Negative = shorts pay longs.
          High absolute rates signal strong directional bias and <span className="text-amber-400">arbitrage opportunities</span>.
        </p>
      </div>
    </div>
  );
}