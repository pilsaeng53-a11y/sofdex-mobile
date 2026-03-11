import React, { useState } from 'react';
import { Users, Copy, TrendingUp, Shield, Star, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const TRADERS = [
  {
    rank: 1, name: 'AlphaWolf_77',  roi: '+184.2%', win: '92%', trades: 342,
    risk: 'Medium', followers: 2840, pnl: '+$184,200', badge: 'Elite',
    desc: 'BTC/SOL momentum trader. Scalps with tight risk management. Max drawdown 8%.',
    chart: [65,70,68,78,80,75,88,92,89,95,98,100],
  },
  {
    rank: 2, name: 'QuantTrader',   roi: '+121.8%', win: '88%', trades: 218,
    risk: 'Low',    followers: 1920, pnl: '+$121,800', badge: 'Pro',
    desc: 'Quantitative multi-asset strategy. Low drawdown, steady consistent returns.',
    chart: [60,62,64,68,66,70,74,76,78,80,82,86],
  },
  {
    rank: 3, name: 'SolGod',        roi: '+98.4%',  win: '85%', trades: 187,
    risk: 'High',   followers: 3210, pnl: '+$98,400',  badge: 'Pro',
    desc: 'Solana ecosystem specialist. High risk/reward on SOL ecosystem tokens.',
    chart: [50,55,60,45,65,70,68,80,85,88,92,98],
  },
  {
    rank: 4, name: 'RWA_King',      roi: '+67.2%',  win: '79%', trades: 134,
    risk: 'Low',    followers: 890,  pnl: '+$67,200',  badge: 'Gold',
    desc: 'Tokenized real-world assets specialist. Conservative, yield-focused strategy.',
    chart: [55,57,58,60,62,63,65,66,68,70,72,74],
  },
  {
    rank: 5, name: 'HedgeMaster',   roi: '+54.9%',  win: '76%', trades: 98,
    risk: 'Medium', followers: 1140, pnl: '+$54,900',  badge: 'Gold',
    desc: 'Delta-neutral hedging. Consistent returns across all market conditions.',
    chart: [52,54,56,55,58,60,62,63,65,67,68,70],
  },
];

const RISK_STYLE = {
  Low:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  High:   'text-red-400 bg-red-400/10 border-red-400/20',
};
const BADGE_STYLE = {
  Elite: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Pro:   'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
  Gold:  'text-amber-500 bg-amber-500/10 border-amber-500/20',
};

function MiniChart({ data }) {
  const d = data.map(v => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d}>
        <defs>
          <linearGradient id="copyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="#00d4aa" fill="url(#copyGrad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function CopyTrading() {
  const [copying, setCopying] = useState({});

  const toggle = (rank) => setCopying(prev => ({ ...prev, [rank]: !prev[rank] }));

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Copy Trading</h1>
        </div>
        <p className="text-[11px] text-slate-500">Mirror top traders' strategies automatically in real-time</p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-[#00d4aa]">10.2K</p>
            <p className="text-[10px] text-slate-500">Copiers</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-white">+82.4%</p>
            <p className="text-[10px] text-slate-500">Avg ROI</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-emerald-400">$48.2M</p>
            <p className="text-[10px] text-slate-500">Copy Volume</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {TRADERS.map(trader => (
          <div key={trader.rank} className={`glass-card rounded-2xl overflow-hidden transition-all ${copying[trader.rank] ? 'border border-[#00d4aa]/20' : ''}`}>
            {/* Header */}
            <div className="p-3.5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#1a2340] flex items-center justify-center text-xs font-black text-[#00d4aa]">
                    {trader.name.slice(0,2).toUpperCase()}
                  </div>
                  {trader.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] font-black text-black">
                      {trader.rank}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white">{trader.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${BADGE_STYLE[trader.badge]}`}>{trader.badge}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{trader.followers.toLocaleString()} followers · {trader.trades} trades</p>
                </div>
              </div>
              <button onClick={() => toggle(trader.rank)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                  copying[trader.rank]
                    ? 'bg-[#00d4aa] text-white border-[#00d4aa] shadow-lg shadow-[#00d4aa]/20'
                    : 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20 hover:bg-[#00d4aa]/20'
                }`}>
                {copying[trader.rank] ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                {copying[trader.rank] ? 'Copying' : 'Copy'}
              </button>
            </div>

            {/* Stats + chart */}
            <div className="px-3.5 pb-2 flex items-end gap-4">
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div>
                  <p className="text-[9px] text-slate-500 mb-0.5">ROI</p>
                  <p className="text-sm font-black text-emerald-400">{trader.roi}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 mb-0.5">Win Rate</p>
                  <p className="text-sm font-bold text-white">{trader.win}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 mb-0.5">Risk</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${RISK_STYLE[trader.risk]}`}>{trader.risk}</span>
                </div>
              </div>
              <div className="w-24 flex-shrink-0">
                <MiniChart data={trader.chart} />
              </div>
            </div>

            {/* Description */}
            <div className="px-3.5 pb-3.5">
              <p className="text-[10px] text-slate-500 leading-snug">{trader.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}