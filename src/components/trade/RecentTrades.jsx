import React, { useState, useEffect, useRef } from 'react';
import { formatPrice } from '../shared/MarketData';

function genTrade(price) {
  const side = Math.random() > 0.5 ? 'buy' : 'sell';
  const offset = (Math.random() - 0.5) * price * 0.001;
  return {
    price: (price + offset).toFixed(2),
    size: (Math.random() * 6 + 0.05).toFixed(3),
    side,
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}

export default function RecentTrades({ price = 100 }) {
  const [trades, setTrades] = useState(() => Array.from({ length: 20 }, () => genTrade(price)));
  const latestPriceRef = useRef(price);

  useEffect(() => { latestPriceRef.current = price; }, [price]);

  useEffect(() => {
    const id = setInterval(() => {
      setTrades(prev => [genTrade(latestPriceRef.current), ...prev.slice(0, 29)]);
    }, 1000 + Math.random() * 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[rgba(148,163,184,0.06)] flex items-center justify-between">
        <span className="text-xs font-bold text-white">Recent Trades</span>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          Live
        </span>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-slate-600 font-medium">
        <span>Price (USD)</span>
        <span className="text-center">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {trades.map((t, i) => (
          <div
            key={i}
            className={`grid grid-cols-3 px-3 py-[3.5px] text-[11px] transition-all ${i === 0 ? 'bg-[#1a2340]/30' : ''}`}
          >
            <span className={`font-mono font-medium ${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPrice(parseFloat(t.price))}
            </span>
            <span className="text-slate-400 text-center">{t.size}</span>
            <span className="text-slate-500 text-right font-mono">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}