import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Filter } from 'lucide-react';
import { TRADFI_MARKETS } from '../shared/MarketData';
import { useMarketData } from '../shared/MarketDataProvider';

const TYPE_TABS = [
  { key: 'all',    label: 'All' },
  { key: 'xStock', label: 'xStocks' },
  { key: 'xETF',   label: 'xETFs' },
];

const TYPE_COLORS = {
  xStock: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  xETF:   { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
};

function StockRow({ asset }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset?.(asset.symbol);
  const price = live?.price ?? asset.price;
  const change = live?.change ?? asset.change;
  const positive = change >= 0;
  const cfg = TYPE_COLORS[asset.type] || TYPE_COLORS.xStock;

  const spark = Array.from({ length: 8 }, (_, i) => {
    const seed = asset.symbol.charCodeAt(i % asset.symbol.length) * (i + 1);
    return 50 + ((seed * 7 + i * 13) % 40) - 20;
  });
  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const pts = spark.map((v, i) => `${(i / 7) * 60},${40 - ((v - min) / (max - min + 1)) * 35}`).join(' ');

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0">
        <span className="text-[9px] font-black text-slate-300">{asset.symbol.replace('x','').slice(0, 3)}</span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[12px] font-bold text-white">{asset.symbol}</p>
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {asset.type}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">{asset.name}</p>
      </div>

      {/* Mini sparkline */}
      <svg width="60" height="40" viewBox="0 0 60 40" className="flex-shrink-0">
        <polyline
          points={pts}
          fill="none"
          stroke={positive ? '#22c55e' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-[12px] font-bold text-white">
          ${price >= 1000 ? price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(2)}
        </p>
        <p className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {positive ? '+' : ''}{change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function XStocksPanel() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = typeFilter === 'all'
    ? TRADFI_MARKETS
    : TRADFI_MARKETS.filter(a => a.type === typeFilter);

  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Tokenized Stocks & ETFs</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">xStocks</span>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 mb-3">
        {TYPE_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              typeFilter === t.key
                ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Asset type disclaimer */}
      <div className="bg-blue-400/5 border border-blue-400/10 rounded-xl px-3 py-2 mb-3">
        <p className="text-[10px] text-blue-300 leading-relaxed">
          <span className="font-bold">Tokenized Assets</span> — These are blockchain-based representations of real-world stocks and ETFs. They are not direct equity ownership but track underlying asset prices via on-chain oracle feeds.
        </p>
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl px-4 border border-[rgba(148,163,184,0.04)]">
        {displayed.map(asset => (
          <StockRow key={asset.symbol} asset={asset} />
        ))}
      </div>

      {!showAll && filtered.length > 8 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2.5 rounded-xl border border-[rgba(148,163,184,0.08)] text-xs text-slate-400 hover:text-white hover:border-[#00d4aa]/20 transition-all"
        >
          Load more ({filtered.length - 8} more assets)
        </button>
      )}
    </div>
  );
}