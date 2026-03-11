import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'JUP', 'RNDR', 'RAY', 'BONK', 'AVAX', 'HNT'];
const EXCHANGES = ['Binance', 'OKX', 'Bybit', 'dYdX', 'Hyperliquid', 'BitMEX'];
const PRICES = { BTC: 98425, ETH: 3842, SOL: 187, BNB: 412, JUP: 1.24, RNDR: 8.92, RAY: 5.83, BONK: 0.0000234, AVAX: 38.5, HNT: 8.45 };

let _id = 0;
function genLiq() {
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const side = Math.random() > 0.5 ? 'Long' : 'Short';
  const price = PRICES[asset] || 100;
  const amount = Math.floor(Math.random() * 600 + 20);
  const usdValue = amount * price;
  return {
    id: ++_id,
    asset,
    side,
    amount,
    usdValue,
    exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
    markPrice: (price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(price >= 1 ? 2 : 8),
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function LiquidationFeed() {
  const [items, setItems] = useState(() => Array.from({ length: 30 }, genLiq));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setItems(prev => [genLiq(), ...prev.slice(0, 59)]);
    }, 900 + Math.random() * 600);
    return () => clearInterval(id);
  }, [paused]);

  const total = items.reduce((a, l) => a + l.usdValue, 0);
  const longLiqs = items.filter(l => l.side === 'Long').reduce((a, l) => a + l.usdValue, 0);
  const shortLiqs = items.filter(l => l.side === 'Short').reduce((a, l) => a + l.usdValue, 0);
  const largest = Math.max(...items.map(l => l.usdValue));

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-bold text-white">Liquidation Feed</h1>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot ml-1" />
        </div>
        <button
          onClick={() => setPaused(v => !v)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            paused
              ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
              : 'bg-[#151c2e] text-slate-400 border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20'
          }`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="glass-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-1">Total Liquidated</p>
          <p className="text-base font-bold text-white">{fmt(total)}</p>
        </div>
        <div className="glass-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-1">Largest Single</p>
          <p className="text-base font-bold text-orange-400">{fmt(largest)}</p>
        </div>
        <div className="glass-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-1">Long Liquidations</p>
          <p className="text-sm font-bold text-red-400">{fmt(longLiqs)}</p>
        </div>
        <div className="glass-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-1">Short Liquidations</p>
          <p className="text-sm font-bold text-emerald-400">{fmt(shortLiqs)}</p>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {items.map((liq, i) => (
          <div
            key={liq.id}
            className={`glass-card rounded-xl px-3.5 py-3 flex items-center justify-between transition-all duration-300 ${
              i === 0 ? 'border border-orange-400/25 bg-orange-400/3' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                liq.side === 'Long' ? 'bg-red-400/10' : 'bg-emerald-400/10'
              }`}>
                {liq.side === 'Long'
                  ? <TrendingDown className="w-4 h-4 text-red-400" />
                  : <TrendingUp className="w-4 h-4 text-emerald-400" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{liq.asset}-PERP</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    liq.side === 'Long' ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'
                  }`}>
                    {liq.side} Liq
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{liq.exchange} · {liq.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${liq.usdValue >= 100_000 ? 'text-orange-400' : 'text-white'}`}>
                {fmt(liq.usdValue)}
              </p>
              <p className="text-[10px] text-slate-500">{liq.amount} {liq.asset}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}