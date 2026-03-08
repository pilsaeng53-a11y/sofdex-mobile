import React, { useState } from 'react';
import { CRYPTO_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import TradingViewChart from '../components/trade/TradingViewChart';
import OrderPanel from '../components/trade/OrderPanel';
import PositionsPanel from '../components/trade/PositionsPanel';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

export default function Trade() {
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_MARKETS[0]);
  const [showSelector, setShowSelector] = useState(false);
  const isPositive = selectedAsset.change >= 0;

  return (
    <div className="min-h-screen">
      {/* Header with pair selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2 bg-[#151c2e] px-3 py-2 rounded-xl border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
          >
            <span className="text-sm font-bold text-white">{selectedAsset.symbol}-PERP</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white">${formatPrice(selectedAsset.price)}</p>
              <div className={`flex items-center gap-0.5 justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-[11px] font-medium">{formatChange(selectedAsset.change)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pair selector dropdown */}
        {showSelector && (
          <div className="mt-2 glass-card rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {CRYPTO_MARKETS.map(asset => (
              <button
                key={asset.symbol}
                onClick={() => { setSelectedAsset(asset); setShowSelector(false); }}
                className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors ${
                  selectedAsset.symbol === asset.symbol ? 'bg-[#00d4aa]/5' : ''
                }`}
              >
                <span className="text-xs font-semibold text-white">{asset.symbol}-PERP</span>
                <span className="text-xs text-slate-400">${formatPrice(asset.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="px-4 mb-3 flex gap-4 text-[11px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Vol 24h </span>
          <span className="text-slate-300 font-medium">{selectedAsset.volume}</span>
        </div>
        <div className="flex-shrink-0">
          <span className="text-slate-500">Max Lev </span>
          <span className="text-[#00d4aa] font-medium">{selectedAsset.leverage || '50x'}</span>
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
          <span className="text-slate-300 font-medium">{selectedAsset.mcap}</span>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="px-4 mb-4">
        <TradingViewChart symbol={selectedAsset.symbol} height={300} />
      </div>

      {/* Order panel */}
      <div className="px-4 mb-4">
        <OrderPanel asset={selectedAsset} />
      </div>

      {/* Positions */}
      <div className="px-4 pb-6">
        <PositionsPanel />
      </div>
    </div>
  );
}