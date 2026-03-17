import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import MarketWatch from '../components/globalmarkets/MarketWatch';
import TradingPanel from '../components/globalmarkets/TradingPanel';
import PositionsPanel from '../components/globalmarkets/PositionsPanel';
import { GLOBAL_MARKETS_ASSETS, getAssetBySymbol } from '../components/globalmarkets/GlobalMarketsData';

export default function GlobalMarkets() {
  const [selectedAsset, setSelectedAsset] = useState(GLOBAL_MARKETS_ASSETS.forex[0]);
  const [expandedCategories, setExpandedCategories] = useState({
    forex: true,
    commodities: false,
    indices: false,
    stocks: false,
  });

  const handleToggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  return (
    <div className="min-h-screen bg-[#05070d] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.08)] flex items-center gap-2 bg-[#0d1220]/50 backdrop-blur">
        <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
        <div>
          <h1 className="text-lg font-bold text-white">Global Markets</h1>
          <p className="text-xs text-slate-500">MT5-style trading interface</p>
        </div>
      </div>

      {/* Main Trading Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Market Watch */}
        <MarketWatch
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          expandedCategories={expandedCategories}
          onToggleCategory={handleToggleCategory}
        />

        {/* Center: Chart & Info */}
        <div className="flex-1 bg-[#05070d] border-r border-[rgba(148,163,184,0.08)] flex flex-col overflow-hidden">
          {/* Chart Container */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full h-full rounded-2xl bg-[#0f1525] border border-[rgba(148,163,184,0.08)] flex flex-col items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#00d4aa]/5 border border-[#00d4aa]/20 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-[#00d4aa]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {selectedAsset?.symbol}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">TradingView chart integration</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-2xl font-bold text-white">{selectedAsset?.bid.toFixed(4)}</p>
                    <p className={`text-sm font-semibold ${selectedAsset?.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedAsset?.change24h >= 0 ? '+' : ''}{selectedAsset?.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-slate-600 space-y-1">
                  <p>Bid: {selectedAsset?.bid.toFixed(4)} | Ask: {selectedAsset?.ask.toFixed(4)}</p>
                  <p>Spread: {selectedAsset?.spread.toFixed(4)} | Volume: {selectedAsset?.volume.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Positions Panel */}
          <PositionsPanel />
        </div>

        {/* Right: Trading Panel */}
        <TradingPanel asset={selectedAsset} />
      </div>
    </div>
  );
}