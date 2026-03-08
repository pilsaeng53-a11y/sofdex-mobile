import React from 'react';
import { Flame } from 'lucide-react';
import { CRYPTO_MARKETS } from '../shared/MarketData';
import AssetCard from '../shared/AssetCard';

export default function TrendingAssets() {
  const trending = [...CRYPTO_MARKETS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white">Trending</h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">24h Movers</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {trending.map(asset => (
          <div key={asset.symbol} className="flex-shrink-0">
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>
    </div>
  );
}