import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Eye, EyeOff, PieChart } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from '../hooks/useSolanaBalances';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import CryptoHoldingsSection from '../components/portfolio/CryptoHoldingsSection';
import RWAHoldingsSection from '../components/portfolio/RWAHoldingsSection';



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
  { name: 'Crypto',     value: 28, color: '#00d4aa' },
  { name: 'Stables',    value: 18, color: '#3b82f6' },
  { name: 'Real Estate',value: 22, color: '#8b5cf6' },
  { name: 'Gold',       value: 9,  color: '#FFD700' },
  { name: 'xStocks',    value: 11, color: '#60a5fa' },
  { name: 'Commodities',value: 4,  color: '#f59e0b' },
  { name: 'Positions',  value: 8,  color: '#ec4899' },
];

const PORTFOLIO_TAB_KEYS = [['All','portfolio_all'],['Crypto','portfolio_crypto'],['RWA','portfolio_rwa'],['Positions','portfolio_positions']];

const CHART_PERIODS = ['1D', '7D', '1M', '3M', 'ALL'];

function generatePortfolioData(period) {
  const points = { '1D': 24, '7D': 7, '1M': 30, '3M': 90, 'ALL': 180 };
  const n = points[period];
  let v = 68000;
  return Array.from({ length: n }, (_, i) => {
    v = v + (Math.random() - 0.42) * 800;
    return { i, v: Math.max(v, 50000) };
  });
}

export default function Portfolio() {
  const { t } = useLang();
  const [showBalance, setShowBalance] = useState(true);
  const [tab, setTab] = useState('All');
  const [chartPeriod, setChartPeriod] = useState('7D');
  const chartData = generatePortfolioData(chartPeriod);
  const totalBalance = '$71,823.85';
  const totalPnL = '+$1,248.90';
  const unrealizedPnL = '+$449.90';
  const realizedPnL = '+$799.00';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{t('page_portfolio')}</h1>
        <button onClick={() => setShowBalance(!showBalance)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          {showBalance ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Balance card */}
      <div className="px-4 mb-5">
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 glow-border">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#00d4aa]/8 to-transparent rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-[11px] text-slate-500 font-medium mb-1">{t('portfolio_totalBalance')}</p>
            <h2 className="text-3xl font-bold text-white mb-1">
              {showBalance ? totalBalance : '••••••'}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{showBalance ? totalPnL : '••••'}</span>
              </div>
              <span className="text-[11px] text-slate-500">{t('portfolio_24hPnl')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance chart */}
      <div className="px-4 mb-5">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">{t('portfolio_performance')}</h3>
            <div className="flex gap-1">
              {CHART_PERIODS.map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    chartPeriod === p ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-600'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <Tooltip
                contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 10 }}
                formatter={(v) => [`$${v.toFixed(0)}`, 'Portfolio']}
                labelFormatter={() => ''}
              />
              <Area type="monotone" dataKey="v" stroke="#00d4aa" fill="url(#portGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation chart */}
      <div className="px-4 mb-5">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t('portfolio_allocation')}</h3>
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

      {/* PnL summary */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-slate-500 mb-0.5">{t('portfolio_unrealizedPnl')}</p>
            <p className="text-sm font-bold text-emerald-400">{showBalance ? unrealizedPnL : '••••'}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-slate-500 mb-0.5">{t('portfolio_realizedPnl')}</p>
            <p className="text-sm font-bold text-emerald-400">{showBalance ? realizedPnL : '••••'}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 mb-4">
        {PORTFOLIO_TAB_KEYS.map(([val, key]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === val ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 bg-[#151c2e] border border-transparent'
            }`}>
            {t(key)}
          </button>
        ))}
      </div>

      <CryptoHoldingsSection showBalance={showBalance} tab={tab} />
      <RWAHoldingsSection showBalance={showBalance} tab={tab} />

      {/* Active positions */}
      <div className={tab !== 'All' && tab !== 'Positions' ? 'hidden' : 'px-4 mb-5'}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">{t('portfolio_activePositions')}</h3>
          <Link to={createPageUrl('Trade')}>
            <span className="text-[11px] text-[#00d4aa] font-medium">{t('portfolio_viewAll')}</span>
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
      <div className={tab !== 'All' && tab !== 'Positions' ? 'hidden' : 'px-4 pb-6'}>
        <h3 className="text-sm font-bold text-white mb-3">{t('portfolio_recentTx')}</h3>
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