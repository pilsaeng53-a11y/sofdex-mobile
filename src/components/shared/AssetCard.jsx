import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice, formatChange } from './MarketData';
import { useMarketData, COMMODITY_SYMBOLS } from './MarketDataProvider';
import { TrendingUp, TrendingDown } from 'lucide-react';

const symbolColors = {
  SOL:  'from-[#9945FF] to-[#14F195]',
  BTC:  'from-[#F7931A] to-[#FFB347]',
  ETH:  'from-[#627EEA] to-[#8B9FEF]',
  JUP:  'from-[#00D4AA] to-[#06B6D4]',
  RAY:  'from-[#5AC4BE] to-[#2B6CB0]',
  RNDR: 'from-[#E84142] to-[#FF6B6B]',
};

export default function AssetCard({ asset, compact = false }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(asset.symbol);

  const isCommodity = COMMODITY_SYMBOLS.has(asset.symbol);
  const price  = live.available ? live.price  : (isCommodity ? null : asset.price);
  const change = live.available ? live.change : (isCommodity ? 0   : asset.change);
  const gradientClass = symbolColors[asset.symbol] || 'from-slate-500 to-slate-600';
  const isPositive = change >= 0;

  if (compact) {
    return (
      <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
        <div className="glass-card rounded-xl p-3.5 hover:bg-[#1a2340] transition-all duration-200 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{asset.symbol}</p>
                <p className="text-[11px] text-slate-500">{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-100">${formatPrice(price)}</p>
              <div className={`flex items-center gap-0.5 justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-[11px] font-medium">{formatChange(change)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
      <div className="glass-card rounded-2xl p-4 hover:bg-[#1a2340] transition-all duration-300 cursor-pointer group min-w-[160px]">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-sm font-bold mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
          {asset.symbol.slice(0, 2)}
        </div>
        <p className="text-sm font-semibold text-slate-100 mb-0.5">{asset.symbol}</p>
        <p className="text-[11px] text-slate-500 mb-2">{asset.name}</p>
        <p className="text-lg font-bold text-white mb-1">${formatPrice(price)}</p>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatChange(change)}
        </div>
      </div>
    </Link>
  );
}