import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Brain, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

const ASSETS = [
  { category: 'crypto', name: 'Bitcoin', symbol: 'BTC', value: 12840, change: 4.21, color: '#f59e0b', allocation: 34 },
  { category: 'crypto', name: 'Solana', symbol: 'SOL', value: 6420, change: 8.14, color: '#9945ff', allocation: 17 },
  { category: 'crypto', name: 'Ethereum', symbol: 'ETH', value: 4120, change: 2.31, color: '#627eea', allocation: 11 },
  { category: 'sof', name: 'SOF Token', symbol: 'SOF', value: 2840, change: 12.4, color: '#00d4aa', allocation: 8 },
  { category: 'stocks', name: 'Apple Inc. Token', symbol: 'AAPL', value: 3820, change: 1.12, color: '#94a3b8', allocation: 10 },
  { category: 'stocks', name: 'S&P 500 ETF Token', symbol: 'SPY', value: 2100, change: 0.87, color: '#64748b', allocation: 6 },
  { category: 'rwa', name: 'Manhattan RE', symbol: 'RE-MAN', value: 2400, change: 0.43, color: '#3b82f6', allocation: 6 },
  { category: 'gold', name: 'Gold RWA', symbol: 'GOLD', value: 1800, change: 1.8, color: '#d97706', allocation: 5 },
  { category: 'commodities', name: 'Wheat Futures', symbol: 'WHEAT', value: 960, change: -1.2, color: '#78716c', allocation: 3 },
];

const CATEGORIES = ['all', 'crypto', 'stocks', 'rwa', 'gold', 'commodities', 'sof'];
const CAT_LABELS = { all: 'All', crypto: '🪙 Crypto', stocks: '📈 Stocks', rwa: '🏛️ RWA', gold: '🥇 Gold', commodities: '🌾 Commodities', sof: '⚡ SOF' };

const perfData = [
  { d: 'W1', v: 34200 }, { d: 'W2', v: 36800 }, { d: 'W3', v: 35100 },
  { d: 'W4', v: 38900 }, { d: 'W5', v: 37200 }, { d: 'W6', v: 41300 }, { d: 'Now', v: 37300 },
];

const PIE_DATA = [
  { name: 'Crypto', value: 62, color: '#9945ff' },
  { name: 'Stocks', value: 16, color: '#94a3b8' },
  { name: 'RWA', value: 6, color: '#3b82f6' },
  { name: 'Gold', value: 5, color: '#d97706' },
  { name: 'SOF', value: 8, color: '#00d4aa' },
  { name: 'Other', value: 3, color: '#475569' },
];

export default function UniversalPortfolio() {
  const [cat, setCat] = useState('all');
  const totalValue = ASSETS.reduce((s, a) => s + a.value, 0);
  const filtered = cat === 'all' ? ASSETS : ASSETS.filter(a => a.category === cat);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Universal Portfolio</h1>
        <p className="text-xs text-slate-400">All assets in one unified dashboard</p>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-2xl border border-[rgba(148,163,184,0.08)] p-5">
        <p className="text-xs text-slate-400 mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-black text-white">${totalValue.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-semibold">+$2,840 (8.2%) this month</span>
        </div>

        {/* Performance Chart */}
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={perfData}>
              <Line type="monotone" dataKey="v" stroke="#00d4aa" strokeWidth={2} dot={false} />
              <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Value']} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation Pie */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Asset Allocation</h2>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {PIE_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">AI Portfolio Analysis</span>
          <div className="ml-auto bg-[#00d4aa]/10 px-2 py-0.5 rounded-full">
            <span className="text-xs text-[#00d4aa]">Live</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">Diversification Score: 72/100</span>
            </div>
            <p className="text-xs text-slate-400">Your portfolio is moderately diversified. Crypto concentration at 62% is above optimal range of 40-50%.</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <p className="text-xs font-semibold text-[#00d4aa] mb-1">💡 AI Suggestions</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Reduce crypto to ~45% for better risk distribution</li>
              <li>• Increase RWA allocation to 12-15% for stable yield</li>
              <li>• Gold allocation at 5% is appropriate as hedge</li>
              <li>• Consider adding tokenized bond exposure</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${cat === c ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-400 border border-[rgba(148,163,184,0.08)]'}`}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        {filtered.map((asset, i) => (
          <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: asset.color }}>
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{asset.name}</p>
                <p className="text-xs text-slate-500">{asset.symbol} · {asset.allocation}% of portfolio</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">${asset.value.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1">
                {asset.change >= 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={`text-xs font-semibold ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{asset.change >= 0 ? '+' : ''}{asset.change}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}