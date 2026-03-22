import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice, formatChange } from '../shared/MarketData';
import { useMarketData, COMMODITY_SYMBOLS } from '../shared/MarketDataProvider';
import MiniChart from '../shared/MiniChart';
import AnimatedPrice from '../shared/AnimatedPrice';
import CoinIcon from '../shared/CoinIcon';

const categoryLabels = {
  rwa:    { label: 'RWA',    color: 'text-purple-400 bg-purple-400/10' },
  tradfi: { label: 'TradFi', color: 'text-blue-400 bg-blue-400/10' },
  crypto: { label: 'PERP',   color: 'text-[#00d4aa] bg-[#00d4aa]/8' },
};

export default function MarketRow({ asset }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(asset.symbol);

  // Commodity assets: return null until live data arrives (never show stale static seed)
  const isCommodity = COMMODITY_SYMBOLS.has(asset.symbol);
  const price  = live.available ? live.price  : (isCommodity ? null : asset.price);
  const change = live.available ? live.change : (isCommodity ? 0   : asset.change);
  const sparkline = live.sparkline ?? null;
  const isPositive = change >= 0;
  const catLabel  = categoryLabels[asset.category] || categoryLabels.crypto;

  return (
    <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
      <div
        className="flex items-center gap-3 py-3 px-3.5 rounded-xl group stagger-item fluid"
        style={{ '--hover-bg': '#151c2e' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#151c2e';
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,212,170,0.09), 0 4px 20px rgba(0,0,0,0.25)';
          e.currentTarget.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '';
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.transform = '';
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateX(1px) scale(0.99)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateX(2px)'; }}
      >
        <div className="flex-shrink-0 group-hover:scale-110 fluid-fast" style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <CoinIcon symbol={asset.symbol} size={40} debugLabel="MarketRow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-white group-hover:text-[#00d4aa] fluid truncate">{asset.symbol}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${catLabel.color}`}>{catLabel.label}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{asset.name}</p>
        </div>
        <div className="w-16 flex-shrink-0">
          <MiniChart data={sparkline} positive={isPositive} width={64} height={28} />
        </div>
        <div className="text-right flex-shrink-0 min-w-[80px]">
          {price != null ? (
            <>
              <AnimatedPrice
                value={price}
                prefix="$"
                formatter={formatPrice}
                className="text-sm font-bold text-white num-highlight block"
              />
              <AnimatedPrice
                value={change}
                formatter={v => formatChange(v)}
                className={`text-[11px] font-semibold num-highlight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                flashOnly
              />
            </>
          ) : (
            <div className="space-y-1">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}