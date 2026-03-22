import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice, formatChange } from './MarketData';
import { useMarketData, COMMODITY_SYMBOLS } from './MarketDataProvider';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CoinIcon from './CoinIcon';

export default function AssetCard({ asset, compact = false }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(asset.symbol);

  const isCommodity = COMMODITY_SYMBOLS.has(asset.symbol);
  const price  = live.available ? live.price  : (isCommodity ? null : asset.price);
  const change = live.available ? live.change : (isCommodity ? 0   : asset.change);
  const isPositive = change >= 0;

  if (compact) {
    return (
      <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
        <div className="glass-card rounded-xl p-3.5 hover:bg-[#1a2340] transition-all duration-200 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CoinIcon symbol={asset.symbol} size={36} debugLabel="AssetCard-compact" />
              <div>
                <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{asset.symbol}</p>
                <p className="text-[11px] text-slate-500">{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              {price != null ? (
                <>
                  <p className="text-sm font-semibold text-slate-100">${formatPrice(price)}</p>
                  <div className={`flex items-center gap-0.5 justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-[11px] font-medium">{formatChange(change)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm font-semibold text-slate-600 animate-pulse">—</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
      <div className="glass-card rounded-2xl p-4 hover:bg-[#1a2340] transition-all duration-300 cursor-pointer group min-w-[160px]">
        <div className="mb-3">
          <CoinIcon symbol={asset.symbol} size={40} debugLabel="AssetCard-full" />
        </div>
        <p className="text-sm font-semibold text-slate-100 mb-0.5">{asset.symbol}</p>
        <p className="text-[11px] text-slate-500 mb-2">{asset.name}</p>
        {price != null ? (
          <>
            <p className="text-lg font-bold text-white mb-1">${formatPrice(price)}</p>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatChange(change)}
            </div>
          </>
        ) : (
          <p className="text-lg font-bold text-slate-600 animate-pulse mb-1">—</p>
        )}
      </div>
    </Link>
  );
}