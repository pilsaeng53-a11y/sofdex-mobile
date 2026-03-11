import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Zap, AlertTriangle, Landmark, TrendingUp } from 'lucide-react';

const EVENTS = [
  { icon: ArrowUpRight,    color: 'text-emerald-400', bg: 'bg-emerald-400/8',  label: 'Whale Buy',         detail: '142 BTC · $13.9M',       time: '2m ago' },
  { icon: Zap,             color: 'text-amber-400',   bg: 'bg-amber-400/8',    label: 'Liquidation',       detail: 'SOL-PERP Long · $2.4M',  time: '4m ago' },
  { icon: TrendingUp,      color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/8',   label: 'Large Trade',       detail: 'JUP/USDC · $7.7M',       time: '7m ago' },
  { icon: Landmark,        color: 'text-purple-400',  bg: 'bg-purple-400/8',   label: 'Governance Vote',   detail: 'Proposal #2 · 89% Yes',   time: '12m ago' },
  { icon: ArrowDownRight,  color: 'text-red-400',     bg: 'bg-red-400/8',      label: 'Whale Sell',        detail: '89 BTC · $8.8M',         time: '18m ago' },
  { icon: Zap,             color: 'text-orange-400',  bg: 'bg-orange-400/8',   label: 'Liquidation',       detail: 'BTC-PERP Short · $5.1M', time: '23m ago' },
  { icon: ArrowUpRight,    color: 'text-emerald-400', bg: 'bg-emerald-400/8',  label: 'New Listing',       detail: 'RE-DXB tokenized RE',     time: '31m ago' },
  { icon: AlertTriangle,   color: 'text-red-400',     bg: 'bg-red-400/8',      label: 'Volatility Alert',  detail: 'BONK: +42% in 1h',       time: '45m ago' },
];

export default function ActivityStream() {
  const [events, setEvents] = useState(EVENTS);

  // Simulate new activity coming in
  useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => {
        const newEvent = { ...EVENTS[Math.floor(Math.random() * EVENTS.length)], time: 'just now' };
        return [newEvent, ...prev.slice(0, 7)];
      });
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <h3 className="text-sm font-bold text-white">Live Activity</h3>
        </div>
        <span className="text-[10px] text-slate-600">Real-time platform events</span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.04)]">
        {events.slice(0, 5).map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 transition-all ${i === 0 ? 'bg-[#00d4aa]/3' : ''}`}>
              <div className={`w-7 h-7 rounded-lg ${ev.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${ev.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${ev.color}`}>{ev.label}</span>
                  {i === 0 && <span className="text-[8px] bg-[#00d4aa]/10 text-[#00d4aa] px-1 py-0.5 rounded font-bold">NEW</span>}
                </div>
                <p className="text-[10px] text-slate-500 truncate">{ev.detail}</p>
              </div>
              <span className="text-[9px] text-slate-700 flex-shrink-0">{ev.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}