import React from 'react';
import { ALL_MARKETS, formatPrice, formatChange } from './MarketData';
import { useMarketData } from './MarketDataProvider';

// Show top 8 most important assets in the ticker
const TICKER_SYMBOLS = ['BTC', 'ETH', 'SOL', 'JUP', 'RNDR', 'BONK', 'TSLA-T', 'GOLD-T'];
const TICKER_ASSETS  = TICKER_SYMBOLS
  .map(sym => ALL_MARKETS.find(m => m.symbol === sym))
  .filter(Boolean);

export default function TickerStrip() {
  const { getLiveAsset } = useMarketData();

  // Build display items — live price overlay on static fallback
  const items = TICKER_ASSETS.map(asset => {
    const live = getLiveAsset(asset.symbol);
    return {
      symbol: asset.symbol,
      price:  live.available ? live.price  : asset.price,
      change: live.available ? live.change : asset.change,
    };
  });

  // Duplicate for seamless loop
  const display = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-[#0a0e1a] via-[#0d1220] to-[#0a0e1a] border-b border-[rgba(148,163,184,0.05)]">
      {/* fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10 pointer-events-none" />
        <div className="flex ticker-scroll whitespace-nowrap py-1.5">
          {display.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 px-4 text-xs">
              <span className="text-slate-500 font-semibold tracking-wide">{m.symbol}</span>
              <span className="text-slate-200 font-bold tabular-nums">${formatPrice(m.price)}</span>
              <span className={`font-semibold tabular-nums ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatChange(m.change)}
              </span>
              <span className="text-[rgba(148,163,184,0.12)] ml-1 text-[10px]">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}