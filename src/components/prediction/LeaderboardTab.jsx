import React from 'react';
import { LEADERBOARD } from './mockData';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black text-white">Top 50 Daily</p>
        <span className="text-[9px] text-slate-500">Resets in 14h 22m</span>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((p, i) => {
          const heights = ['h-20', 'h-24', 'h-20'];
          return (
            <div key={p.rank} className={`flex flex-col items-center justify-end ${heights[i]} rounded-2xl border px-2 py-2`}
              style={{ background: 'rgba(15,21,37,0.8)', borderColor: i === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(148,163,184,0.08)' }}>
              <div className="text-xl mb-0.5">{p.avatar}</div>
              <div className="text-[10px] font-black text-white truncate w-full text-center">{p.name.slice(0,8)}</div>
              <div className="text-[9px] text-emerald-400 font-mono font-bold">+${(p.profit/1000).toFixed(0)}K</div>
              <div className="text-xs mt-0.5">{MEDAL[p.rank]}</div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.08)]">
        <div className="grid grid-cols-5 px-3 py-2 text-[8px] font-black text-slate-600 uppercase tracking-widest bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
          <span>#</span><span className="col-span-2">Trader</span><span>Profit</span><span>Win%</span>
        </div>
        {LEADERBOARD.map(p => (
          <div key={p.rank} className="grid grid-cols-5 px-3 py-2.5 border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50 transition-colors items-center">
            <span className="text-[10px] font-black text-slate-400">{MEDAL[p.rank] ?? p.rank}</span>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-base">{p.avatar}</span>
              <div>
                <p className="text-[10px] font-bold text-white">{p.name}</p>
                <p className="text-[8px] text-slate-600">{p.trades} trades · 🔥{p.streak}</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-400 font-mono">+${(p.profit/1000).toFixed(1)}K</span>
            <span className="text-[10px] font-bold text-[#00d4aa]">{p.winRate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}