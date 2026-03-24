/**
 * PersonalStats — User's trading stats panel for prediction market.
 */
import React from 'react';
import { TrendingUp, Percent, Trophy, Wallet } from 'lucide-react';

export default function PersonalStats({ bets = [] }) {
  const resolved = bets.filter(b => b.result);
  const wins     = resolved.filter(b => b.result === 'WON').length;
  const winRate  = resolved.length ? Math.round((wins / resolved.length) * 100) : 0;
  const totalIn  = bets.reduce((s, b) => s + (b.amount ?? 0), 0);
  const totalOut = resolved.reduce((s, b) => s + (b.result === 'WON' ? (b.amount * (b.payout ?? 2)) : 0), 0);
  const pnl      = totalOut - resolved.reduce((s, b) => s + (b.amount ?? 0), 0);

  const stats = [
    { icon: Wallet,    label: 'Staked',   value: `$${totalIn.toFixed(0)}`,       color: 'text-slate-300' },
    { icon: Percent,   label: 'Win Rate', value: `${winRate}%`,                  color: winRate >= 50 ? 'text-emerald-400' : 'text-red-400' },
    { icon: Trophy,    label: 'Wins',     value: `${wins}/${resolved.length}`,   color: 'text-yellow-400' },
    { icon: TrendingUp,label: 'P&L',      value: `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(0)}`, color: pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ];

  return (
    <div className="rounded-2xl border p-3" style={{ background: 'rgba(10,14,26,0.9)', borderColor: 'rgba(148,163,184,0.07)' }}>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2.5">Your Stats</p>
      <div className="grid grid-cols-4 gap-2">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <Icon className="w-3 h-3 text-slate-600 mb-0.5" />
              <span className={`text-[11px] font-black ${s.color}`}>{s.value}</span>
              <span className="text-[7px] text-slate-600">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}