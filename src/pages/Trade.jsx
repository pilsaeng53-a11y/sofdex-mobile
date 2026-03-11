import React, { useState } from 'react';
import { CRYPTO_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import TradingViewChart from '../components/trade/TradingViewChart';
import OrderPanel from '../components/trade/OrderPanel';
import PositionsPanel from '../components/trade/PositionsPanel';
import OrderBook from '../components/trade/OrderBook';
import RecentTrades from '../components/trade/RecentTrades';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

export default function Trade() {
  const [selectedSymbol, setSelectedSymbol] = useState(CRYPTO_MARKETS[0].symbol);
  const [showSelector, setShowSelector]     = useState(false);
  const { getLiveAsset } = useMarketData();

  const staticAsset   = CRYPTO_MARKETS.find(a => a.symbol === selectedSymbol) || CRYPTO_MARKETS[0];
  const live          = getLiveAsset(selectedSymbol);
  const displayPrice  = live.available ? live.price  : staticAsset.price;
  const displayChange = live.available ? live.change : staticAsset.change;
  const isPositive    = displayChange >= 0;

  // Pass live-merged asset to OrderPanel so it uses current price
  const assetForPanel = { ...staticAsset, price: displayPrice, change: displayChange };

  return (
    <div className="min-h-screen">
      {/* Header with pair selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2 bg-[#151c2e] px-3 py-2 rounded-xl border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
          >
            <span className="text-sm font-bold text-white">{selectedSymbol}-PERP</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white">${formatPrice(displayPrice)}</p>
              <div className={`flex items-center gap-0.5 justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-[11px] font-medium">{formatChange(displayChange)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pair selector dropdown */}
        {showSelector && (
          <div className="mt-2 glass-card rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {CRYPTO_MARKETS.map(asset => {
              const al = getLiveAsset(asset.symbol);
              const lp = al.available ? al.price : asset.price;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => { setSelectedSymbol(asset.symbol); setShowSelector(false); }}
                  className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors ${
                    selectedSymbol === asset.symbol ? 'bg-[#00d4aa]/5' : ''
                  }`}
                >
                  <span className="text-xs font-semibold text-white">{asset.symbol}-PERP</span>
                  <span className="text-xs text-slate-400">${formatPrice(lp)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="px-4 mb-3 flex gap-4 text-[11px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Vol 24h </span>
          <span className="text-slate-300 font-medium">{staticAsset.volume}</span>
        </div>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Max Lev </span>
          <span className="text-[#00d4aa] font-medium">{staticAsset.leverage || '50x'}</span>
        </div>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Funding </span>
          <span className="text-emerald-400 font-medium">+0.01%</span>
        </div>
        <div className="flex-shrink-0">
          <span className="text-slate-500">OI </span>
          <span className="text-slate-300 font-medium">$248M</span>
        </div>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Mcap </span>
          <span className="text-slate-300 font-medium">{staticAsset.mcap}</span>
        </div>
      </div>

      {/* TradingView Chart — uses same mapped symbol as the live data engine */}
      <div className="px-4 mb-4">
        <TradingViewChart symbol={selectedSymbol} height={300} />
      </div>

      {/* OrderBook + Recent Trades */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <OrderBook price={displayPrice} />
        <RecentTrades price={displayPrice} />
      </div>

      {/* Order panel */}
      <div className="px-4 mb-4">
        <OrderPanel asset={assetForPanel} />
      </div>

      {/* Positions */}
      <div className="px-4 pb-6">
        <PositionsPanel />
      </div>
    </div>
  );
}