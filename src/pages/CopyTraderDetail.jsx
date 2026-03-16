import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users, Award, Copy, UserPlus, BarChart3, Shield, Star, Lock, Eye, ArrowLeft, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TRADERS = {
  1: {
    name: 'AlphaWolf_77', avatar: 'AW', color: '#00d4aa', badge: 'Elite',
    roi: '+184.2%', win: '92%', trades: 342, risk: 'Medium',
    followers: 2840, copiedVolume: '$4.2M',
    bio: 'BTC/SOL momentum trader since 2019. Scalps with tight risk management. Max drawdown 8%.',
    strategy: 'Momentum + Breakout. Focus on BTC/SOL perpetuals with high R:R setups. Always uses 1:3 risk-reward minimum.',
    profitShare: 8,
    visiblePositions: true,
    riskScore: 6.2,
    weeklyData: [{ d: 'Mon', v: 2.1 }, { d: 'Tue', v: 4.8 }, { d: 'Wed', v: 3.2 }, { d: 'Thu', v: 7.4 }, { d: 'Fri', v: 5.1 }, { d: 'Sat', v: 9.3 }, { d: 'Sun', v: 11.2 }],
    monthlyData: [{ d: 'W1', v: 8.2 }, { d: 'W2', v: 22.1 }, { d: 'W3', v: 18.4 }, { d: 'W4', v: 41.8 }],
    yearlyData: [{ d: 'Jan', v: 12 }, { d: 'Feb', v: 28 }, { d: 'Mar', v: 44 }, { d: 'Apr', v: 38 }, { d: 'May', v: 62 }, { d: 'Jun', v: 91 }, { d: 'Jul', v: 88 }, { d: 'Aug', v: 110 }, { d: 'Sep', v: 134 }, { d: 'Oct', v: 148 }, { d: 'Nov', v: 162 }, { d: 'Dec', v: 184 }],
    openPositions: [
      { asset: 'BTC/USDT', dir: 'long', entry: 94200, size: '$12,400', leverage: '5x', pnl: '+3.4%' },
      { asset: 'SOL/USDT', dir: 'long', entry: 182, size: '$4,800', leverage: '3x', pnl: '+1.8%' },
    ],
    tradeHistory: [
      { asset: 'BTC/USDT', dir: 'long', entry: 91200, exit: 97800, roi: 7.24, date: '2d ago' },
      { asset: 'SOL/USDT', dir: 'long', entry: 162, exit: 188, roi: 16.05, date: '4d ago' },
      { asset: 'ETH/USDT', dir: 'short', entry: 3820, exit: 3540, roi: 7.33, date: '6d ago' },
      { asset: 'BTC/USDT', dir: 'long', entry: 88900, exit: 92100, roi: 3.60, date: '8d ago' },
    ],
  },
  2: {
    name: 'QuantTrader', avatar: 'QT', color: '#9945ff', badge: 'Pro',
    roi: '+121.8%', win: '88%', trades: 218, risk: 'Low',
    followers: 1920, copiedVolume: '$2.8M',
    bio: 'Quantitative multi-asset strategy. AI-driven signal generation with low drawdown.',
    strategy: 'Systematic quant. Multi-asset cross-correlation strategy. Low drawdown, steady consistent returns below 5% per trade.',
    profitShare: 5,
    visiblePositions: false,
    riskScore: 3.8,
    weeklyData: [{ d: 'Mon', v: 1.2 }, { d: 'Tue', v: 2.4 }, { d: 'Wed', v: 1.9 }, { d: 'Thu', v: 3.1 }, { d: 'Fri', v: 4.2 }, { d: 'Sat', v: 3.8 }, { d: 'Sun', v: 5.1 }],
    monthlyData: [{ d: 'W1', v: 5.4 }, { d: 'W2', v: 12.8 }, { d: 'W3', v: 19.1 }, { d: 'W4', v: 28.4 }],
    yearlyData: [{ d: 'Jan', v: 8 }, { d: 'Feb', v: 18 }, { d: 'Mar', v: 28 }, { d: 'Apr', v: 36 }, { d: 'May', v: 48 }, { d: 'Jun', v: 62 }, { d: 'Jul', v: 74 }, { d: 'Aug', v: 84 }, { d: 'Sep', v: 94 }, { d: 'Oct', v: 104 }, { d: 'Nov', v: 112 }, { d: 'Dec', v: 122 }],
    openPositions: [],
    tradeHistory: [
      { asset: 'ETH/USDT', dir: 'long', entry: 3200, exit: 3620, roi: 13.13, date: '1d ago' },
      { asset: 'BTC/USDT', dir: 'long', entry: 89000, exit: 93400, roi: 4.94, date: '3d ago' },
      { asset: 'SOL/USDT', dir: 'short', entry: 195, exit: 178, roi: 8.72, date: '7d ago' },
    ],
  },
  3: {
    name: 'SolGod', avatar: 'SG', color: '#ef4444', badge: 'Pro',
    roi: '+98.4%', win: '85%', trades: 187, risk: 'High',
    followers: 3210, copiedVolume: '$5.1M',
    bio: 'Solana ecosystem specialist. High risk/reward on SOL ecosystem tokens.',
    strategy: 'High conviction SOL plays. Uses on-chain data and DEX flow analysis. Bold size with strict stop-losses.',
    profitShare: 15,
    visiblePositions: true,
    riskScore: 8.4,
    weeklyData: [{ d: 'Mon', v: 4.1 }, { d: 'Tue', v: -2.2 }, { d: 'Wed', v: 8.4 }, { d: 'Thu', v: 3.1 }, { d: 'Fri', v: 12.4 }, { d: 'Sat', v: 8.2 }, { d: 'Sun', v: 14.8 }],
    monthlyData: [{ d: 'W1', v: 12.4 }, { d: 'W2', v: -4.1 }, { d: 'W3', v: 28.8 }, { d: 'W4', v: 44.2 }],
    yearlyData: [{ d: 'Jan', v: 6 }, { d: 'Feb', v: 14 }, { d: 'Mar', v: 28 }, { d: 'Apr', v: 18 }, { d: 'May', v: 42 }, { d: 'Jun', v: 58 }, { d: 'Jul', v: 44 }, { d: 'Aug', v: 72 }, { d: 'Sep', v: 84 }, { d: 'Oct', v: 78 }, { d: 'Nov', v: 90 }, { d: 'Dec', v: 98 }],
    openPositions: [
      { asset: 'JUP/USDT', dir: 'long', entry: 1.18, size: '$8,200', leverage: '4x', pnl: '+5.1%' },
    ],
    tradeHistory: [
      { asset: 'SOL/USDT', dir: 'long', entry: 172, exit: 198, roi: 15.12, date: '1d ago' },
      { asset: 'JUP/USDT', dir: 'long', entry: 1.02, exit: 1.24, roi: 21.57, date: '5d ago' },
      { asset: 'RAY/USDT', dir: 'long', entry: 4.82, exit: 6.10, roi: 26.56, date: '9d ago' },
    ],
  },
  4: {
    name: 'RWA_King', avatar: 'RK', color: '#06b6d4', badge: 'Gold',
    roi: '+67.2%', win: '79%', trades: 134, risk: 'Low',
    followers: 890, copiedVolume: '$1.2M',
    bio: 'Tokenized real-world assets specialist. Conservative, yield-focused strategy.',
    strategy: 'RWA + yield plays. Focus on tokenized bonds, real estate and stablecoins. Long-term holds with consistent returns.',
    profitShare: 10,
    visiblePositions: false,
    riskScore: 2.9,
    weeklyData: [{ d: 'Mon', v: 0.8 }, { d: 'Tue', v: 1.4 }, { d: 'Wed', v: 1.2 }, { d: 'Thu', v: 2.1 }, { d: 'Fri', v: 1.9 }, { d: 'Sat', v: 2.8 }, { d: 'Sun', v: 3.2 }],
    monthlyData: [{ d: 'W1', v: 3.1 }, { d: 'W2', v: 7.4 }, { d: 'W3', v: 11.8 }, { d: 'W4', v: 16.2 }],
    yearlyData: [{ d: 'Jan', v: 5 }, { d: 'Feb', v: 10 }, { d: 'Mar', v: 16 }, { d: 'Apr', v: 22 }, { d: 'May', v: 28 }, { d: 'Jun', v: 34 }, { d: 'Jul', v: 40 }, { d: 'Aug', v: 46 }, { d: 'Sep', v: 52 }, { d: 'Oct', v: 57 }, { d: 'Nov', v: 62 }, { d: 'Dec', v: 67 }],
    openPositions: [],
    tradeHistory: [
      { asset: 'GOLD-T/USDT', dir: 'long', entry: 2180, exit: 2240, roi: 2.75, date: '3d ago' },
      { asset: 'TBILL/USDT', dir: 'long', entry: 98.2, exit: 99.1, roi: 0.92, date: '7d ago' },
    ],
  },
  5: {
    name: 'HedgeMaster', avatar: 'HM', color: '#f59e0b', badge: 'Gold',
    roi: '+54.9%', win: '76%', trades: 98, risk: 'Medium',
    followers: 1140, copiedVolume: '$1.8M',
    bio: 'Delta-neutral hedging. Consistent returns across all market conditions.',
    strategy: 'Delta-neutral pairs trading + carry strategies. Designed to profit in any market direction.',
    profitShare: 12,
    visiblePositions: true,
    riskScore: 5.1,
    weeklyData: [{ d: 'Mon', v: 1.4 }, { d: 'Tue', v: 2.8 }, { d: 'Wed', v: 2.1 }, { d: 'Thu', v: 4.2 }, { d: 'Fri', v: 3.8 }, { d: 'Sat', v: 5.4 }, { d: 'Sun', v: 6.8 }],
    monthlyData: [{ d: 'W1', v: 6.2 }, { d: 'W2', v: 14.8 }, { d: 'W3', v: 22.4 }, { d: 'W4', v: 30.1 }],
    yearlyData: [{ d: 'Jan', v: 4 }, { d: 'Feb', v: 9 }, { d: 'Mar', v: 14 }, { d: 'Apr', v: 20 }, { d: 'May', v: 26 }, { d: 'Jun', v: 32 }, { d: 'Jul', v: 36 }, { d: 'Aug', v: 40 }, { d: 'Sep', v: 44 }, { d: 'Oct', v: 48 }, { d: 'Nov', v: 52 }, { d: 'Dec', v: 55 }],
    openPositions: [
      { asset: 'BTC/USDT', dir: 'long', entry: 93800, size: '$6,200', leverage: '2x', pnl: '+1.2%' },
      { asset: 'ETH/USDT', dir: 'short', entry: 3740, size: '$6,200', leverage: '2x', pnl: '+0.8%' },
    ],
    tradeHistory: [
      { asset: 'BTC/USDT', dir: 'long', entry: 91000, exit: 95200, roi: 4.62, date: '2d ago' },
      { asset: 'ETH/USDT', dir: 'short', entry: 3850, exit: 3610, roi: 6.23, date: '5d ago' },
    ],
  },
};

const RISK_STYLE = { Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20', High: 'text-red-400 bg-red-400/10 border-red-400/20' };
const BADGE_STYLE = { Elite: 'text-amber-400 bg-amber-400/10 border-amber-400/20', Pro: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20', Gold: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
const PERIODS = [{ key: 'weeklyData', label: '7D' }, { key: 'monthlyData', label: '30D' }, { key: 'yearlyData', label: '1Y' }];

export default function CopyTraderDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || 1;
  const trader = TRADERS[id] || TRADERS[1];
  const navigate = useNavigate();

  const [period, setPeriod] = useState('monthlyData');
  const [copying, setCopying] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyAmount, setCopyAmount] = useState('500');

  const chartData = trader[period] || trader.monthlyData;
  const lastVal = chartData[chartData.length - 1]?.v || 0;
  const isPositive = lastVal >= 0;

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0" style={{ background: trader.color }}>
            {trader.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-white">{trader.name}</h1>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${BADGE_STYLE[trader.badge]}`}>{trader.badge}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${RISK_STYLE[trader.risk]}`}>{trader.risk} Risk</span>
            </div>
            <p className="text-xs text-slate-400">{trader.bio}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">ROI</p>
            <p className="text-base font-black text-green-400">{trader.roi}</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Win Rate</p>
            <p className="text-base font-black text-white">{trader.win}</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Trades</p>
            <p className="text-base font-black text-white">{trader.trades}</p>
          </div>
        </div>

        {/* Follower Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <Users className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{trader.followers.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Followers</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <Copy className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{trader.copiedVolume}</p>
            <p className="text-[10px] text-slate-500">Copy Vol.</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            {trader.visiblePositions
              ? <Eye className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
              : <Lock className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />}
            <p className="text-sm font-bold text-white">{trader.visiblePositions ? 'Public' : 'Private'}</p>
            <p className="text-[10px] text-slate-500">Positions</p>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-[#0a0e1a] rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span className="text-xs font-semibold text-[#00d4aa]">Risk Score</span>
            </div>
            <span className={`text-sm font-black ${trader.riskScore >= 7 ? 'text-red-400' : trader.riskScore >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{trader.riskScore}/10</span>
          </div>
          <div className="w-full bg-[#151c2e] rounded-full h-2">
            <div className="h-2 rounded-full transition-all" style={{
              width: `${trader.riskScore * 10}%`,
              background: trader.riskScore >= 7 ? '#ef4444' : trader.riskScore >= 5 ? '#f59e0b' : '#22c55e'
            }} />
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-[#0a0e1a] rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">Strategy Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{trader.strategy}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <Star className="w-3 h-3 text-amber-400" />
            Profit share: <span className="text-amber-400 font-semibold ml-1">{trader.profitShare}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => setFollowing(!following)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${following ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#1a2340] text-slate-300 border border-[rgba(148,163,184,0.1)]'}`}>
            <UserPlus className="w-4 h-4" />{following ? 'Following' : 'Follow'}
          </button>
          <button onClick={() => setShowCopyModal(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white">
            <Copy className="w-4 h-4" />{copying ? 'Copying' : 'Copy Trader'}
          </button>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00d4aa]" />
            <h2 className="text-sm font-semibold text-white">ROI Performance</h2>
          </div>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${period === p.key ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#0a0e1a] text-slate-500 border border-[rgba(148,163,184,0.06)]'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="traderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v) => [`+${v}%`, 'ROI']} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="v" stroke="#00d4aa" fill="url(#traderGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Open Positions */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="text-sm font-semibold text-white">Current Positions</h2>
        </div>
        {!trader.visiblePositions ? (
          <div className="flex items-center gap-3 bg-[#0a0e1a] rounded-xl p-4">
            <Lock className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-400">Current positions are private.</p>
              <p className="text-xs text-slate-600 mt-0.5">This trader has chosen not to share open positions publicly.</p>
            </div>
          </div>
        ) : trader.openPositions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-3">No open positions currently.</p>
        ) : (
          <div className="space-y-2">
            {trader.openPositions.map((pos, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0a0e1a] rounded-xl p-3">
                <div className="flex items-center gap-2">
                  {pos.dir === 'long' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  <div>
                    <p className="text-sm font-semibold text-white">{pos.asset}</p>
                    <p className="text-xs text-slate-500">{pos.leverage} · Entry: ${typeof pos.entry === 'number' && pos.entry > 100 ? pos.entry.toLocaleString() : pos.entry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${pos.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{pos.pnl}</p>
                  <p className="text-xs text-slate-500">{pos.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade History */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Trade History</h2>
        <div className="space-y-2">
          {trader.tradeHistory.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
              <div className="flex items-center gap-3">
                {t.dir === 'long' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                <div>
                  <p className="text-sm font-semibold text-white">{t.asset}</p>
                  <p className="text-xs text-slate-500">{t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{t.roi >= 0 ? '+' : ''}{t.roi}%</p>
                <p className="text-xs text-slate-500">${t.entry} → ${t.exit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4">
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.1)] p-5 w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-white">Copy {trader.name}</h3>
            <div className="bg-[#0a0e1a] rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Profit share</span><span className="text-amber-400 font-semibold">{trader.profitShare}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">You keep</span><span className="text-green-400 font-semibold">{100 - trader.profitShare}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Risk Level</span><span className={`font-semibold ${RISK_STYLE[trader.risk].split(' ')[0]}`}>{trader.risk}</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Copy Amount (USDC)</label>
              <input value={copyAmount} onChange={e => setCopyAmount(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCopyModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-[#1a2340] border border-[rgba(148,163,184,0.1)]">Cancel</button>
              <button onClick={() => { setCopying(true); setShowCopyModal(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]">Start Copying</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}