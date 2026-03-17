import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GLOBAL_MARKETS_ASSETS, GLOBAL_MARKETS_CATEGORIES, formatPrice } from './GlobalMarketsData';

export default function MarketWatch({ selectedAsset, onSelectAsset, expandedCategories, onToggleCategory }) {
  return (
    <div className="w-64 bg-[#0f1525] border-r border-[rgba(148,163,184,0.08)] flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.08)]">
        <h2 className="text-sm font-bold text-white">Market Watch</h2>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {Object.entries(GLOBAL_MARKETS_ASSETS).map(([categoryKey, assets]) => {
          const isExpanded = expandedCategories[categoryKey];
          
          return (
            <div key={categoryKey}>
              {/* Category Header */}
              <button
                onClick={() => onToggleCategory(categoryKey)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#151c2e] rounded-lg transition-colors group"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-1 text-left">
                  {categoryKey}
                </span>
              </button>

              {/* Assets */}
              {isExpanded && (
                <div className="space-y-0.5 pl-2">
                  {assets.map(asset => {
                    const isSelected = selectedAsset?.symbol === asset.symbol;
                    const isGain = asset.change24h >= 0;
                    
                    return (
                      <button
                        key={asset.symbol}
                        onClick={() => onSelectAsset(asset)}
                        className={`w-full px-3 py-2 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30'
                            : 'hover:bg-[#151c2e] border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{asset.symbol}</p>
                            <p className="text-[10px] text-slate-500 truncate">{asset.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-white">
                              {formatPrice(asset.bid, asset.tvSymbol)}
                            </p>
                            <p className={`text-[10px] font-semibold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isGain ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}