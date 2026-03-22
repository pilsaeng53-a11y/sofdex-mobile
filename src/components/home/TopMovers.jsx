import React, { useState } from 'react';
import { CRYPTO_MARKETS, RWA_MARKETS } from '../shared/MarketData';
import { useMarketData } from '../shared/MarketDataProvider';
import MiniChart from '../shared/MiniChart';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnimatedPrice from '../shared/AnimatedPrice';
import CoinIcon from '../shared/CoinIcon';

const ALL_ASSETS = [...CRYPTO_MARKETS, ...RWA_MARKETS];

function formatPrice(price) {
  if (price == null) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1)    return price.toFixed(2);
  if (price >= 0.0001) return price.toFixed(4);
  return price.toFixed(8);
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-3.5">
      <div className="flex items-center gap-3">
        <div className="w-4 h-3 rounded bg-[#1a2340] animate-pulse" />
        <div>
          <div className="w-10 h-3.5 rounded bg-[#1a2340] animate-pulse mb-1" />
          <div className="w-16 h-2.5 rounded bg-[#1a2340] animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-[60px] h-6 rounded bg-[#1a2340] animate-pulse" />
        <div className="text-right">
          <div className="w-16 h-3.5 rounded bg-[#1a2340] animate-pulse mb-1" />
          <div className="w-12 h-2.5 rounded bg-[#1a2340] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function TopMovers() {
  const [tab, setTab] = useState('gainers');
  const { liveData, sparklines } = useMarketData();
  const hasLiveData = Object.keys(liveData).length > 0;

  // Merge live data on top of static; static is fallback for RWA/non-Binance
  const enriched = ALL_ASSETS.map(asset => {
    const live = liveData[asset.symbol];
    return {
      ...asset,
      price:    live?.available ? live.price  : asset.price,
      change:   live?.available ? live.change : asset.change,
      sparkline: sparklines[asset.symbol] ?? null,
      isLive:   !!live?.available,
    };
  });

  const sorted = [...enriched]
    .sort((a, b) => tab === 'gainers' ? b.change - a.change : a.change - b.change)
    .slice(0, 5);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Top Movers</h2>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" style={{ animationDuration: '2s' }} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Live</span>
          </span>
        </div>
        <div className="flex gap-1 bg-[#151c2e] rounded-lg p-0.5">
          <button
            onClick={() => setTab('gainers')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === 'gainers' ? 'bg-emerald-400/15 text-emerald-400' : 'text-slate-500'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setTab('losers')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === 'losers' ? 'bg-red-400/15 text-red-400' : 'text-slate-500'
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
        {!hasLiveData
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : sorted.map((asset, i) => {
              const isPos = asset.change >= 0;
              return (
                <Link key={asset.symbol} to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
                  <div
                    className="flex items-center justify-between p-3.5 group/row stagger-item"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#1a2340';
                      e.currentTarget.style.paddingLeft = '18px';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '';
                      e.currentTarget.style.paddingLeft = '';
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-600 font-medium w-4 num-highlight">{i + 1}</span>
                      <CoinIcon symbol={asset.symbol} size={28} debugLabel="TopMovers" />
                      <div>
                        <p className="text-sm font-semibold text-slate-100 group-hover/row:text-[#00d4aa] fluid">{asset.symbol}</p>
                        <p className="text-[11px] text-slate-500">{asset.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <MiniChart data={asset.sparkline} positive={isPos} width={60} height={24} />
                      <div className="text-right min-w-[80px]">
                        <AnimatedPrice
                          value={asset.price}
                          prefix="$"
                          formatter={formatPrice}
                          className="text-sm font-semibold text-slate-100 num-highlight block"
                        />
                        <AnimatedPrice
                          value={asset.change}
                          formatter={v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
                          className={`text-[11px] font-medium num-highlight ${isPos ? 'text-emerald-400' : 'text-red-400'}`}
                          flashOnly
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
        }
      </div>
    </div>
  );
}