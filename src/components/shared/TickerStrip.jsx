import React from 'react';
import { CRYPTO_MARKETS, formatPrice, formatChange } from './MarketData';

export default function TickerStrip() {
  const items = [...CRYPTO_MARKETS, ...CRYPTO_MARKETS];

  return (
    <div className="w-full overflow-hidden bg-[#0d1220] border-b border-[rgba(148,163,184,0.06)]">
      <div className="flex ticker-scroll whitespace-nowrap py-2">
        {items.map((m, i) => (
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