import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const PULSES = [
  { label: 'BTC Dominance', value: '54.2%', change: '+0.4%', up: true },
  { label: 'Fear & Greed',  value: '74 Greed', change: null,   up: true },
  { label: 'Total Liq. 24h',value: '$248M',  change: '-12%',  up: false },
  { label: 'RWA TVL',       value: '$142B',  change: '+2.1%', up: true },
  { label: 'SOL TPS',       value: '4,120',  change: null,    up: true },
];

export default function MarketPulseBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % PULSES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const item = PULSES[idx];

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)] overflow-hidden">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Activity className="w-3 h-3 text-[#00d4aa]" />
          <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Market Pulse</span>
        </div>
        <div className="h-3 w-px bg-[rgba(148,163,184,0.1)]" />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] text-slate-500 flex-shrink-0">{item.label}:</span>
          <span className="text-[10px] font-bold text-white">{item.value}</span>
          {item.change && (
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {item.change}
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {PULSES.map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === idx ? 'bg-[#00d4aa]' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}