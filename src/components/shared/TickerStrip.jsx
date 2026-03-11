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
    <div className="w-full overflow-hidden bg-[#0d1220] border-b border-[rgba(148,163,184,0.06)]">
      <div className="flex ticker-scroll whitespace-nowrap py-2">
        {display.map((m, i) => (
          <div key={i} className="flex items-center gap-2 px-5 text-xs">
            <span className="text-slate-400 font-medium">{m.symbol}</span>
            <span className="text-slate-200 font-semibold">${formatPrice(m.price)}</span>
            <span className={m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {formatChange(m.change)}
            </span>
            <span className="text-slate-700 ml-1">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}