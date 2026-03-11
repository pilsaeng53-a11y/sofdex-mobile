import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '../shared/MarketData';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function generateOrders(basePrice, side, count = 12) {
  const orders = [];
  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    const offset = side === 'ask'
      ? (i + 1) * (basePrice * 0.00025)
      : -(i + 1) * (basePrice * 0.00025);
    const price = basePrice + offset;
    const size = parseFloat((Math.random() * 8 + 0.2).toFixed(3));
    cumulative += size;
    orders.push({ price: price.toFixed(2), size: size.toFixed(3), cumulative: cumulative.toFixed(3) });
  }
  return side === 'ask' ? orders.reverse() : orders;
}

export default function OrderBook({ price = 100 }) {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    function refresh() {
      setAsks(generateOrders(price, 'ask'));
      setBids(generateOrders(price, 'bid'));
    }
    refresh();
    const id = setInterval(refresh, 2200);
    return () => clearInterval(id);
  }, [price]);

  const maxCum = Math.max(
    ...asks.map(o => parseFloat(o.cumulative)),
    ...bids.map(o => parseFloat(o.cumulative))
  );

  const depthData = useMemo(() => {
    const bidPoints = bids.map(o => ({ price: parseFloat(o.price), bid: parseFloat(o.cumulative), ask: null })).reverse();
    const askPoints = asks.map(o => ({ price: parseFloat(o.price), ask: parseFloat(o.cumulative), bid: null }));
    return [...bidPoints, ...askPoints];
  }, [bids, asks]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[rgba(148,163,184,0.06)] flex items-center justify-between">
        <span className="text-xs font-bold text-white">Order Book</span>
        <span className="text-[10px] text-slate-500">Real-time depth</span>
      </div>

      {/* Depth chart */}
      <div className="px-2 pt-2 pb-1 border-b border-[rgba(148,163,184,0.04)]">
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart data={depthData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bidDepth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="askDepth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 6, fontSize: 10, padding: '4px 8px' }}
              labelFormatter={v => `$${parseFloat(v).toFixed(2)}`}
            />
            <Area type="stepAfter" dataKey="bid" stroke="#22c55e" fill="url(#bidDepth)" strokeWidth={1.5} dot={false} connectNulls={false} />
            <Area type="stepAfter" dataKey="ask" stroke="#ef4444" fill="url(#askDepth)" strokeWidth={1.5} dot={false} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-[9px] text-slate-600 px-1 mt-0.5">
          <span className="text-emerald-400">BID</span>
          <span className="text-slate-600">Depth</span>
          <span className="text-red-400">ASK</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-slate-600 font-medium">
        <span>Price (USD)</span>
        <span className="text-center">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div>
        {asks.map((o, i) => {
          const pct = (parseFloat(o.cumulative) / maxCum) * 100;
          return (
            <div key={i} className="relative grid grid-cols-3 px-3 py-[3.5px] text-[11px] hover:bg-[#1a2340]/40 transition-colors">
              <div className="absolute right-0 top-0 bottom-0 bg-red-500/8" style={{ width: `${pct}%` }} />
              <span className="text-red-400 font-mono font-medium z-10 relative">{formatPrice(parseFloat(o.price))}</span>
              <span className="text-slate-400 text-center z-10 relative">{o.size}</span>
              <span className="text-slate-500 text-right z-10 relative">{o.cumulative}</span>
            </div>
          );
        })}
      </div>

      {/* Spread row */}
      <div className="px-3 py-2 bg-[#0d1220] flex items-center justify-between">
        <span className="text-sm font-bold text-white font-mono">{formatPrice(price)}</span>
        <span className="text-[10px] text-slate-600">
          Spread: <span className="text-slate-400">{(price * 0.00025 * 2).toFixed(2)}</span>
        </span>
      </div>

      {/* Bids */}
      <div>
        {bids.map((o, i) => {
          const pct = (parseFloat(o.cumulative) / maxCum) * 100;
          return (
            <div key={i} className="relative grid grid-cols-3 px-3 py-[3.5px] text-[11px] hover:bg-[#1a2340]/40 transition-colors">
              <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/8" style={{ width: `${pct}%` }} />
              <span className="text-emerald-400 font-mono font-medium z-10 relative">{formatPrice(parseFloat(o.price))}</span>
              <span className="text-slate-400 text-center z-10 relative">{o.size}</span>
              <span className="text-slate-500 text-right z-10 relative">{o.cumulative}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}