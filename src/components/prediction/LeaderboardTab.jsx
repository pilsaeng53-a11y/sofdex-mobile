import React, { useState } from 'react';
import { LEADERBOARD } from './mockData';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const SORTS = ['Profit','Win Rate','Streak','Trades'];

export default function LeaderboardTab() {
  const [sort, setSort] = useState('Profit');
  const sorted = [...LEADERBOARD].sort((a,b) => {
    if (sort === 'Win Rate') return b.winRate - a.winRate;
    if (sort === 'Streak')   return b.streak - a.streak;
    if (sort === 'Trades')   return b.trades - a.trades;
    return b.profit - a.profit;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-white">Leaderboard</p>
        <span className="text-[9px] text-slate-500">Resets in 14h 22m</span>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1">
        {SORTS.map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${sort === s ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-2">
        {[sorted[1], sorted[0], sorted[2]].map((p, i) => (
          <div key={p.rank} className="flex flex-col items-center justify-end rounded-2xl border px-2 py-2.5"
            style={{ minHeight: i===1?88:72, background: 'rgba(15,21,37,0.8)', borderColor: i===1?'rgba(251,191,36,0.3)':'rgba(148,163,184,0.08)' }}>
            <div className="text-xl mb-0.5">{p.avatar}</div>
            <div className="text-[9px] font-black text-white truncate w-full text-center">{p.name.slice(0,9)}</div>
            <div className="text-[8px] text-emerald-400 font-mono font-bold">+${(p.profit/1000).toFixed(0)}K</div>
            <div className="text-sm mt-0.5">{MEDAL[i===0?2:i===1?1:3]}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.07)]">
        <div className="grid grid-cols-12 px-3 py-2 text-[7px] font-black text-slate-600 uppercase tracking-widest bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.05)]">
          <span className="col-span-1">#</span>
          <span className="col-span-4">Trader</span>
          <span className="col-span-3">Profit</span>
          <span className="col-span-2">Win%</span>
          <span className="col-span-2">ROI</span>
        </div>
        {sorted.map((p, i) => (
          <div key={p.rank} className="grid grid-cols-12 px-3 py-2.5 border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50 transition-colors items-center">
            <span className="col-span-1 text-[10px] font-black text-slate-400">{MEDAL[i+1] ?? i+1}</span>
            <div className="col-span-4 flex items-center gap-1.5">
              <span className="text-sm">{p.avatar}</span>
              <div>
                <p className="text-[9px] font-bold text-white leading-none">{p.name}</p>
                <p className="text-[7px] text-slate-600">🔥{p.streak} · {p.trades}t</p>
              </div>
            </div>
            <span className="col-span-3 text-[10px] font-black text-emerald-400 font-mono">+${(p.profit/1000).toFixed(1)}K</span>
            <span className="col-span-2 text-[9px] font-bold text-[#00d4aa]">{p.winRate}%</span>
            <span className="col-span-2 text-[9px] font-bold text-yellow-400">{p.roi}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}