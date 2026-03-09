import React from 'react';
import { Flame } from 'lucide-react';
import { CRYPTO_MARKETS } from '../shared/MarketData';
import { useMarketData } from '../shared/MarketDataProvider';
import AssetCard from '../shared/AssetCard';

export default function TrendingAssets() {
  const { liveData } = useMarketData();

  // Sort by absolute live 24h change; fall back to static change while loading
  const trending = [...CRYPTO_MARKETS]
    .map(a => {
      const live = liveData[a.symbol];
      return live?.available ? { ...a, price: live.price, change: live.change } : a;
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4);

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