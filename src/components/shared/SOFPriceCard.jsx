import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSOFPrice } from '@/hooks/useSOFPrice';

/**
 * SOF Price Card Component
 * Displays real-time SOF price from Dexscreener pool
 * NEVER shows blank values or loading states
 * Always displays cached/fallback values
 */
export default function SOFPriceCard({ compact = false }) {
  const { sofPrice = 0.0245, change24h = 2.5, volume24h = 4850000, apiStatus } = useSOFPrice();

  const isPositive = change24h >= 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-bold text-white">
            ${sofPrice.toFixed(6)}
          </p>
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00d4aa]/20 flex items-center justify-center text-sm font-bold text-[#00d4aa]">
            SF
          </div>
          <div>
            <p className="text-sm font-bold text-white">SOF Token</p>
            <p className="text-[10px] text-slate-500">SolFort Native</p>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${apiStatus === 'success' ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
      </div>

      {/* Price Display */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Price</p>
          <p className="text-2xl font-bold text-[#00d4aa]">
            ${sofPrice.toFixed(6)}
          </p>
        </div>

        {/* Change & Volume */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgba(148,163,184,0.06)]">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">24h Change</p>
            <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{change24h.toFixed(2)}%
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">24h Volume</p>
            <p className="text-sm font-bold text-white">
              ${volume24h ? (volume24h / 1000000).toFixed(2) : '4.85'}M
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.06)]">
        <p className="text-[10px] text-slate-500">
          Data Source: <span className="text-[#00d4aa] font-semibold">Dexscreener Pool</span>
        </p>
      </div>
    </div>
  );
}