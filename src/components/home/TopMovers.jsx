import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CRYPTO_MARKETS, RWA_MARKETS } from '../shared/MarketData';
import { useLivePrices } from '../shared/useLivePrices';
import MiniChart from '../shared/MiniChart';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ALL_ASSETS = [...CRYPTO_MARKETS, ...RWA_MARKETS];
const ALL_SYMBOLS = ALL_ASSETS.map(a => a.symbol);

function formatPrice(price) {
  if (price >= 1000)      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1)         return price.toFixed(2);
  if (price >= 0.0001)    return price.toFixed(4);
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
  const { prices, loading } = useLivePrices(ALL_SYMBOLS);

  // Build enriched list using live data where available, static fallback otherwise
  const enriched = ALL_ASSETS.map(asset => {
    const live = prices[asset.symbol];
    if (live?.available) {
      return { ...asset, price: live.price, change: live.change, sparkline: live.sparkline, liveOk: true };
    }
    return { ...asset, sparkline: null, liveOk: false };
  });

  // Sort by live change, only include assets we have a change value for
  const sorted = [...enriched]
    .sort((a, b) => tab === 'gainers' ? b.change - a.change : a.change - b.change)
    .slice(0, 5);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Top Movers</h2>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-slate-500">Live</span>
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
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : sorted.map((asset, i) => {
              const isPos = asset.change >= 0;
              return (
                <Link key={asset.symbol} to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
                  <div className="flex items-center justify-between p-3.5 hover:bg-[#1a2340] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-600 font-medium w-4">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{asset.symbol}</p>
                        <p className="text-[11px] text-slate-500">{asset.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {asset.liveOk
                        ? <MiniChart data={asset.sparkline} width={60} height={24} />
                        : <div className="w-[60px] text-center text-[10px] text-slate-600">N/A</div>
                      }
                      <div className="text-right min-w-[80px]">
                        {asset.liveOk
                          ? <>
                              <p className="text-sm font-semibold text-slate-100">${formatPrice(asset.price)}</p>
                              <p className={`text-[11px] font-medium ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                              </p>
                            </>
                          : <>
                              <p className="text-sm font-semibold text-slate-600">—</p>
                              <p className="text-[11px] text-slate-600">Unavailable</p>
                            </>
                        }
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