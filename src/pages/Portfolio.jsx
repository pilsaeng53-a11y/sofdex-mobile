import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Eye, EyeOff, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const holdings = [
  { symbol: 'SOL', name: 'Solana', amount: '24.82', value: '$4,648.54', change: 5.23, allocation: 27 },
  { symbol: 'USDC', name: 'USD Coin', amount: '12,450', value: '$12,450.00', change: 0, allocation: 42 },
  { symbol: 'BTC', name: 'Bitcoin', amount: '0.045', value: '$4,429.15', change: 2.14, allocation: 15 },
  { symbol: 'TBILL', name: 'US T-Bill Token', amount: '25', value: '$2,506.00', change: 0.02, allocation: 8 },
  { symbol: 'GOLD-T', name: 'Tokenized Gold', amount: '1.2', value: '$2,810.16', change: 0.87, allocation: 8 },
];

const positions = [
  { pair: 'SOL-PERP', side: 'Long', leverage: '10x', size: '$2,450', pnl: '+$126.80', pnlPercent: '+5.17%', positive: true },
  { pair: 'BTC-PERP', side: 'Short', leverage: '25x', size: '$5,000', pnl: '+$340.50', pnlPercent: '+6.81%', positive: true },
  { pair: 'ETH-PERP', side: 'Long', leverage: '5x', size: '$1,200', pnl: '-$18.40', pnlPercent: '-1.53%', positive: false },
];

const transactions = [
  { type: 'Buy', asset: 'SOL', amount: '+2.5 SOL', value: '$468.55', time: '2h ago' },
  { type: 'Sell', asset: 'ETH', amount: '-0.5 ETH', value: '$1,921.09', time: '5h ago' },
  { type: 'Deposit', asset: 'USDC', amount: '+5,000 USDC', value: '$5,000', time: '1d ago' },
];

const pieData = [
  { name: 'Crypto', value: 42, color: '#00d4aa' },
  { name: 'Stables', value: 30, color: '#3b82f6' },
  { name: 'RWA', value: 16, color: '#8b5cf6' },
  { name: 'Positions', value: 12, color: '#f59e0b' },
];

export default function Portfolio() {
  const [showBalance, setShowBalance] = useState(true);
  const totalBalance = '$26,843.85';
  const totalPnL = '+$448.90';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Portfolio</h1>
        <button onClick={() => setShowBalance(!showBalance)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          {showBalance ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Balance card */}
      <div className="px-4 mb-5">
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 glow-border">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#00d4aa]/8 to-transparent rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-[11px] text-slate-500 font-medium mb-1">Total Balance</p>
            <h2 className="text-3xl font-bold text-white mb-1">
              {showBalance ? totalBalance : '••••••'}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{showBalance ? totalPnL : '••••'}</span>
              </div>
              <span className="text-[11px] text-slate-500">24h PnL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation chart */}
      <div className="px-4 mb-5">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Allocation</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-slate-400">{item.name}</span>
                  <span className="text-[11px] text-white font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-bold text-white mb-3">Holdings</h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {holdings.map((h, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a2340] flex items-center justify-center text-[10px] font-bold text-[#00d4aa]">
                  {h.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{h.symbol}</p>
                  <p className="text-[11px] text-slate-500">{h.amount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{showBalance ? h.value : '••••'}</p>
                <p className={`text-[11px] font-medium ${h.change > 0 ? 'text-emerald-400' : h.change < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {h.change > 0 ? '+' : ''}{h.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active positions */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Active Positions</h3>
          <Link to={createPageUrl('Trade')}>
            <span className="text-[11px] text-[#00d4aa] font-medium">View All</span>
          </Link>
        </div>
        <div className="space-y-2">
          {positions.map((pos, i) => (
            <div key={i} className="glass-card rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{pos.pair}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    pos.side === 'Long' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {pos.side} {pos.leverage}
                  </span>
                </div>
                <p className={`text-xs font-bold ${pos.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos.pnl}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Size: {pos.size}</span>
                <span className={pos.positive ? 'text-emerald-400' : 'text-red-400'}>{pos.pnlPercent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-4 pb-6">
        <h3 className="text-sm font-bold text-white mb-3">Recent Transactions</h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {transactions.map((tx, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'Buy' || tx.type === 'Deposit' ? 'bg-emerald-400/10' : 'bg-red-400/10'
                }`}>
                  {tx.type === 'Buy' || tx.type === 'Deposit' 
                    ? <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{tx.type} {tx.asset}</p>
                  <p className="text-[11px] text-slate-500">{tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white">{tx.amount}</p>
                <p className="text-[11px] text-slate-500">{tx.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}