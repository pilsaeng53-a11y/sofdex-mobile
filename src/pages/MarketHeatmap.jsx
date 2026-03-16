import React, { useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';

const CRYPTO = [
  { s: 'BTC',  ch: '+6.4',  vol: '$42B' },
  { s: 'ETH',  ch: '+2.1',  vol: '$18B' },
  { s: 'SOL',  ch: '+11.3', vol: '$9B'  },
  { s: 'BNB',  ch: '-1.2',  vol: '$3B'  },
  { s: 'XRP',  ch: '+4.8',  vol: '$6B'  },
  { s: 'JUP',  ch: '+8.7',  vol: '$1.2B'},
  { s: 'RNDR', ch: '+12.3', vol: '$820M'},
  { s: 'BONK', ch: '-5.1',  vol: '$440M'},
  { s: 'HNT',  ch: '+1.4',  vol: '$280M'},
  { s: 'RAY',  ch: '-0.8',  vol: '$190M'},
  { s: 'AVAX', ch: '+3.2',  vol: '$2.1B'},
  { s: 'DOT',  ch: '-2.4',  vol: '$890M'},
];

const STOCKS = [
  { s: 'AAPL-T', ch: '+1.2',  vol: '$420M' },
  { s: 'TSLA-T', ch: '+4.8',  vol: '$380M' },
  { s: 'MSFT-T', ch: '+0.9',  vol: '$310M' },
  { s: 'NVDA-T', ch: '+7.2',  vol: '$290M' },
  { s: 'AMZN-T', ch: '-0.4',  vol: '$270M' },
  { s: 'SPY-T',  ch: '+0.6',  vol: '$520M' },
  { s: 'QQQ-T',  ch: '+1.1',  vol: '$440M' },
  { s: 'GLD-T',  ch: '-0.2',  vol: '$180M' },
];

const RWA = [
  { s: 'RE-NYC',  ch: '+1.8',  vol: '$28M'  },
  { s: 'RE-DXB',  ch: '+3.2',  vol: '$19M'  },
  { s: 'GOLD-T',  ch: '+0.9',  vol: '$142M' },
  { s: 'TBILL',   ch: '+0.1',  vol: '$89M'  },
  { s: 'OIL-T',   ch: '-1.4',  vol: '$62M'  },
  { s: 'WHEAT-T', ch: '+0.4',  vol: '$24M'  },
];

function getColor(ch) {
  const v = parseFloat(ch);
  if (v >= 8)  return 'bg-emerald-400 text-white';
  if (v >= 4)  return 'bg-emerald-500/70 text-white';
  if (v >= 1)  return 'bg-emerald-700/60 text-emerald-200';
  if (v >= 0)  return 'bg-emerald-900/40 text-emerald-400';
  if (v >= -2) return 'bg-red-900/40 text-red-400';
  if (v >= -5) return 'bg-red-700/60 text-red-200';
  return 'bg-red-500/70 text-white';
}

function HeatmapGrid({ assets }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {assets.map((a, i) => (
        <div key={i} className={`${getColor(a.ch)} rounded-xl p-2.5 text-center transition-all hover:scale-105 cursor-pointer`}>
          <p className="text-[11px] font-black">{a.s}</p>
          <p className="text-[10px] font-bold">{a.ch.startsWith('-') ? a.ch : `+${a.ch}`}%</p>
          <p className="text-[9px] opacity-70 mt-0.5">{a.vol}</p>
        </div>
      ))}
    </div>
  );
}

export default function MarketHeatmap() {
  const [tab, setTab] = useState('Crypto');
  const TABS = ['Crypto', 'xStocks', 'RWA'];
  const dataMap = { Crypto: CRYPTO, xStocks: STOCKS, RWA };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Market Heatmap</h1>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> Live
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">Color intensity = performance strength</p>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {[
          { label: '+8%+', cls: 'bg-emerald-400' },
          { label: '+4%', cls: 'bg-emerald-600' },
          { label: '0%', cls: 'bg-slate-700' },
          { label: '-2%', cls: 'bg-red-700' },
          { label: '-5%+', cls: 'bg-red-500' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${l.cls}`} />
            <span className="text-[9px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <HeatmapGrid assets={dataMap[tab]} />

      <div className="mt-4 p-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)]">
        <p className="text-[10px] text-slate-500 text-center">Data refreshes every 30 seconds · Prices sourced from aggregated venues</p>
      </div>
    </div>
  );
}