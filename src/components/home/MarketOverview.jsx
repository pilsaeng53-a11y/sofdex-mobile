import React from 'react';
import { TrendingUp, Activity, DollarSign, Users, RefreshCw } from 'lucide-react';
import { useMarketStats } from '../shared/useMarketStats';

const CARD_CONFIG = [
  {
    key:   'totalVolume',
    label: 'Total Volume',
    sub:   'CoinGecko · 24h',
    icon:  Activity,
    color: 'from-[#00d4aa] to-[#06b6d4]',
  },
  {
    key:   'openInterest',
    label: 'Open Interest',
    sub:   'Binance Futures',
    icon:  DollarSign,
    color: 'from-[#3b82f6] to-[#8b5cf6]',
  },
  {
    key:   'trades24h',
    label: '24h Trades',
    sub:   'Top 8 pairs',
    icon:  TrendingUp,
    color: 'from-[#f59e0b] to-[#ef4444]',
  },
  {
    key:        'activeTraders',
    label:      'Active Traders',
    sub:        'SOFDex · coming soon',
    icon:       Users,
    color:      'from-[#ec4899] to-[#8b5cf6]',
    placeholder: 'N/A',
  },
];

function Skeleton() {
  return (
    <div className="h-5 w-16 rounded-md bg-[#1a2340] animate-pulse mt-0.5" />
  );
}

export default function MarketOverview() {
  const { stats, loading, error, refetch } = useMarketStats();

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Market Stats</p>
        <button
          onClick={refetch}
          className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-[#00d4aa] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {error && !loading && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-[11px] text-slate-500 flex items-center justify-between">
          <span>Stats temporarily unavailable</span>
          <button onClick={refetch} className="text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {CARD_CONFIG.map((card) => {
          const Icon  = card.icon;
          const value = stats?.[card.key];
          const display = value ?? card.placeholder ?? null;

          return (
            <div key={card.key} className="glass-card rounded-2xl p-4 glow-border">
              <div className="flex items-start justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[9px] text-slate-600 font-medium text-right leading-tight max-w-[60px]">
                  {card.sub}
                </span>
              </div>
              {loading
                ? <Skeleton />
                : <p className={`text-lg font-bold ${display === 'N/A' ? 'text-slate-600' : 'text-white'}`}>
                    {display ?? '—'}
                  </p>
              }
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}