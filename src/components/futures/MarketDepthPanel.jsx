/**
 * MarketDepthPanel — interactive broker-style depth of market.
 * Clicking a bid or ask level fires onPriceClick(price).
 */
import React, { useMemo } from 'react';

function generateLevels(basePrice, isBid, count = 8, spread = 0.0002) {
  return Array.from({ length: count }, (_, i) => {
    const offset = isBid ? -(i * spread * basePrice) : (i * spread * basePrice);
    const price  = basePrice + offset;
    // Pseudo-realistic size distribution
    const size   = (Math.sin(i * 1.3 + (isBid ? 1 : 2)) * 0.4 + 0.6) * 800 + i * 40;
    const total  = isBid
      ? Array.from({ length: i + 1 }, (_, j) => (Math.sin(j * 1.3 + 1) * 0.4 + 0.6) * 800 + j * 40).reduce((a, b) => a + b, 0)
      : size;
    return { price, size: Math.round(size), total: Math.round(total) };
  });
}

const MAX_TOTAL = 6000;

export default function MarketDepthPanel({ ask, bid, onPriceClick }) {
  const dec = ask && ask > 1000 ? 2 : ask && ask > 10 ? 3 : 5;

  const askLevels = useMemo(() => {
    if (!ask) return [];
    return generateLevels(ask, false, 8, 0.0002).reverse();
  }, [ask]);

  const bidLevels = useMemo(() => {
    if (!bid) return [];
    return generateLevels(bid, true, 8, 0.0002);
  }, [bid]);

  const spread    = ask && bid ? ask - bid : null;
  const spreadPts = spread != null ? (spread * (dec <= 3 ? 100 : 10000)).toFixed(1) : null;

  if (!ask && !bid) {
    return (
      <div className="flex items-center justify-center h-full text-[11px] text-slate-600">
        Waiting for quote…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1525] text-[10px] select-none">
      {/* Header */}
      <div className="grid grid-cols-3 px-2 py-1.5 text-[8px] font-black text-slate-600 uppercase tracking-widest border-b border-[rgba(148,163,184,0.06)] flex-shrink-0">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Ask side (sell wall) */}
        <div className="space-y-px py-1">
          {askLevels.map((lvl, i) => {
            const barW = Math.min(100, (lvl.size / MAX_TOTAL) * 100);
            return (
              <button key={i} onClick={() => onPriceClick?.(lvl.price)}
                className="w-full relative flex items-center justify-between px-2 py-[3px] group hover:bg-red-500/10 transition-colors cursor-pointer">
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/12 group-hover:bg-red-500/20 transition-colors"
                  style={{ width: `${barW}%` }} />
                <span className="font-mono text-red-400 font-bold relative z-10">{lvl.price.toFixed(dec)}</span>
                <span className="text-slate-500 relative z-10">{lvl.size.toLocaleString()}</span>
                <span className="text-slate-600 relative z-10 text-right">{lvl.total.toLocaleString()}</span>
              </button>
            );
          })}
        </div>

        {/* Spread row */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#0b0f1a] border-y border-[rgba(148,163,184,0.08)]">
          <span className="font-mono font-black text-[#00d4aa] text-[11px]">
            {ask ? ask.toFixed(dec) : '—'}
          </span>
          {spreadPts && (
            <span className="text-[8px] text-slate-600 font-bold">
              ▲ {spreadPts} pts spread ▼
            </span>
          )}
          <span className="font-mono font-black text-[#00d4aa] text-[11px]">
            {bid ? bid.toFixed(dec) : '—'}
          </span>
        </div>

        {/* Bid side (buy wall) */}
        <div className="space-y-px py-1">
          {bidLevels.map((lvl, i) => {
            const barW = Math.min(100, (lvl.size / MAX_TOTAL) * 100);
            return (
              <button key={i} onClick={() => onPriceClick?.(lvl.price)}
                className="w-full relative flex items-center justify-between px-2 py-[3px] group hover:bg-emerald-500/10 transition-colors cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/12 group-hover:bg-emerald-500/20 transition-colors"
                  style={{ width: `${barW}%` }} />
                <span className="font-mono text-emerald-400 font-bold relative z-10">{lvl.price.toFixed(dec)}</span>
                <span className="text-slate-500 relative z-10">{lvl.size.toLocaleString()}</span>
                <span className="text-slate-600 relative z-10 text-right">{lvl.total.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-2 py-1.5 border-t border-[rgba(148,163,184,0.06)] text-[8px] text-slate-700 text-center flex-shrink-0">
        Click any level to set order price
      </div>
    </div>
  );
}