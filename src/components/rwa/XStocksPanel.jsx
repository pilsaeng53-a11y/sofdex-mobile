import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrendingUp, TrendingDown, BarChart2, ExternalLink, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { TRADFI_MARKETS } from '../shared/MarketData';
import { useMarketData } from '../shared/MarketDataProvider';

const TYPE_TABS = [
  { key: 'all',    label: 'All' },
  { key: 'xStock', label: 'xStocks' },
  { key: 'xETF',   label: 'xETFs' },
];

const SECTOR_ORDER = ['Tech', 'Finance', 'Consumer', 'Industrial', 'Healthcare', 'Energy', 'ETF'];

const SECTOR_COLORS = {
  Tech:       { bg: 'bg-cyan-400/10',    text: 'text-cyan-400',    border: 'border-cyan-400/20'    },
  Finance:    { bg: 'bg-blue-400/10',    text: 'text-blue-400',    border: 'border-blue-400/20'    },
  Consumer:   { bg: 'bg-orange-400/10',  text: 'text-orange-400',  border: 'border-orange-400/20'  },
  Industrial: { bg: 'bg-amber-400/10',   text: 'text-amber-400',   border: 'border-amber-400/20'   },
  Healthcare: { bg: 'bg-green-400/10',   text: 'text-green-400',   border: 'border-green-400/20'   },
  Energy:     { bg: 'bg-yellow-400/10',  text: 'text-yellow-400',  border: 'border-yellow-400/20'  },
  ETF:        { bg: 'bg-purple-400/10',  text: 'text-purple-400',  border: 'border-purple-400/20'  },
};

const TYPE_COLORS = {
  xStock: { bg: 'bg-blue-400/10',   text: 'text-blue-400',   border: 'border-blue-400/20'   },
  xETF:   { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
};

const PAGE_SIZE = 10;

function Sparkline({ symbol, positive }) {
  const spark = Array.from({ length: 10 }, (_, i) => {
    const seed = symbol.charCodeAt(i % symbol.length) * (i + 1);
    return 50 + ((seed * 7 + i * 13) % 40) - 20;
  });
  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const pts = spark.map((v, i) => `${(i / 9) * 60},${36 - ((v - min) / (max - min + 1)) * 32}`).join(' ');
  return (
    <svg width="60" height="36" viewBox="0 0 60 36" className="flex-shrink-0">
      <polyline points={pts} fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StockRow({ asset }) {
  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset?.(asset.symbol);
  const price = live?.price ?? asset.price;
  const change = live?.change ?? asset.change;
  const positive = change >= 0;
  const typeCfg = TYPE_COLORS[asset.type] || TYPE_COLORS.xStock;

  const tvUrl = asset.tvSymbol
    ? `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(asset.tvSymbol)}`
    : null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0 border border-[rgba(148,163,184,0.06)]">
        <span className="text-[8px] font-black text-slate-300 leading-none text-center">{asset.symbol.replace('x','').slice(0,4)}</span>
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <p className="text-[12px] font-bold text-white">{asset.symbol}</p>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
            {asset.type === 'xETF' ? 'Tokenized ETF' : 'Tokenized Stock'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] text-slate-500 truncate">{asset.name}</p>
          {tvUrl && (
            <a href={tvUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity">
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline symbol={asset.symbol} positive={positive} />

      {/* Price + change */}
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

function SectorGroup({ sector, assets }) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const cfg = SECTOR_COLORS[sector] || SECTOR_COLORS.Tech;
  const paged = assets.slice(0, page * PAGE_SIZE);
  const hasMore = assets.length > paged.length;

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.05)] mb-1"
      >
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{sector}</span>
          <span className="text-[10px] text-slate-500">{assets.length} assets</span>
        </div>
        {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-600" />}
      </button>

      {!collapsed && (
        <>
          <div className="glass-card rounded-2xl px-4 border border-[rgba(148,163,184,0.04)]">
            {paged.map(asset => <StockRow key={asset.symbol} asset={asset} />)}
          </div>
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full mt-2 py-2 rounded-xl border border-[rgba(148,163,184,0.07)] text-[11px] text-slate-400 hover:text-white hover:border-[#00d4aa]/20 transition-all"
            >
              Show more ({assets.length - paged.length} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function XStocksPanel() {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = typeFilter === 'all'
    ? TRADFI_MARKETS
    : TRADFI_MARKETS.filter(a => a.type === typeFilter);

  // Group by sector
  const bySector = {};
  SECTOR_ORDER.forEach(s => { bySector[s] = []; });
  filtered.forEach(a => {
    const s = a.sector || 'Tech';
    if (!bySector[s]) bySector[s] = [];
    bySector[s].push(a);
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Tokenized Stocks & ETFs</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">xStocks</span>
          <span className="text-[9px] text-slate-500">{filtered.length} assets</span>
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

      {/* Disclaimer */}
      <div className="bg-blue-400/5 border border-blue-400/10 rounded-xl px-3 py-2 mb-3">
        <p className="text-[10px] text-blue-300 leading-relaxed">
          <span className="font-bold">Tokenized Assets</span> — Blockchain-based representations of real-world stocks and ETFs. Price tracking via on-chain oracle feeds. Not direct equity ownership. Charts powered by TradingView.
        </p>
      </div>

      {/* Sector groups */}
      {SECTOR_ORDER.map(sector => {
        const assets = bySector[sector] || [];
        if (assets.length === 0) return null;
        return <SectorGroup key={sector} sector={sector} assets={assets} />;
      })}
    </div>
  );
}