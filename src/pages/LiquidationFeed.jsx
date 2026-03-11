import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'JUP', 'RNDR', 'RAY'];
const SIZES = [24000, 48000, 120000, 250000, 500000, 1200000, 2400000];

function genLiq() {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = Math.random() > 0.5 ? 'long' : 'short';
  const size = SIZES[Math.floor(Math.random() * SIZES.length)];
  const leverage = [5, 10, 20, 25, 50, 100][Math.floor(Math.random() * 6)];
  return {
    symbol,
    side,
    size,
    leverage: `${leverage}x`,
    price: (Math.random() * 200 + 10).toFixed(2),
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    exchange: ['SOFDex', 'Bybit', 'OKX', 'Binance'][Math.floor(Math.random() * 4)],
  };
}

function formatSize(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function LiquidationFeed() {
  const [liqs, setLiqs] = useState(() => Array.from({ length: 24 }, genLiq));
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setLiqs(prev => [genLiq(), ...prev.slice(0, 49)]);
    }, 1200 + Math.random() * 1600);
    return () => clearInterval(id);
  }, [paused]);

  const shown = filter === 'all' ? liqs : liqs.filter(l => l.side === filter);
  const totalLiq24h = liqs.reduce((acc, l) => acc + l.size, 0);
  const bigLiqs = liqs.filter(l => l.size >= 500000).length;

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-bold text-white">Liquidation Feed</h1>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            paused
              ? 'bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]'
              : 'bg-[#151c2e] border-[rgba(148,163,184,0.08)] text-slate-400'
          }`}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{formatSize(totalLiq24h)}</p>
          <p className="text-[10px] text-slate-500">Total Liquidated</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-orange-400">{bigLiqs}</p>
          <p className="text-[10px] text-slate-500">Large ({'>'}$500K)</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{liqs.length}</p>
          <p className="text-[10px] text-slate-500">Total Events</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'long', label: 'Longs Liq.' },
          { key: 'short', label: 'Shorts Liq.' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-3 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.06)]">
          <span>Asset / Side</span>
          <span className="text-center">Size</span>
          <span className="text-center">Lev.</span>
          <span className="text-right">Time</span>
        </div>
        <div className="max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {shown.map((l, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 px-3 py-2.5 text-[11px] border-b border-[rgba(148,163,184,0.04)] ${
                i === 0 && !paused ? 'bg-orange-500/5' : ''
              } ${l.size >= 500000 ? 'bg-red-500/5' : ''}`}
            >
              <div className="flex items-center gap-1.5">
                {l.side === 'long'
                  ? <TrendingUp className="w-3 h-3 text-red-400 flex-shrink-0" />
                  : <TrendingDown className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                <div>
                  <span className="font-bold text-white">{l.symbol}</span>
                  <span className={`ml-1 text-[10px] ${l.side === 'long' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {l.side === 'long' ? 'Long' : 'Short'}
                  </span>
                </div>
              </div>
              <span className={`text-center font-bold ${l.size >= 500000 ? 'text-orange-400' : 'text-white'}`}>
                {formatSize(l.size)}
              </span>
              <span className="text-center text-slate-400">{l.leverage}</span>
              <span className="text-right text-slate-500 font-mono">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}