import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Copy, UserPlus, BarChart3, Shield, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PROFILES = {
  1: { name: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', roi_30d: 38.4, win_rate: 74, followers: 1284, trades: 312, profit_share: 10, bio: 'Crypto trader since 2017. Specializes in BTC momentum breakouts and macro positioning.', strategy: 'Momentum + Breakout. Focus on BTC/SOL perpetuals with high R:R setups.' },
  2: { name: 'SolanaKing', avatar: 'SK', color: '#9945ff', roi_30d: 61.2, win_rate: 68, followers: 2841, trades: 189, profit_share: 5, bio: 'SOL ecosystem specialist. Trading DeFi narrative cycles and on-chain signals.', strategy: 'On-chain data driven. SOL ecosystem plays with 2-5 day holds.' },
  3: { name: 'BearHunter', avatar: 'BH', color: '#ef4444', roi_30d: 22.1, win_rate: 71, followers: 674, trades: 421, profit_share: 20, bio: 'Short-side specialist. Finds overextended assets and fades them systematically.', strategy: 'Counter-trend short selling. Strict stop losses, 1:3 R:R minimum.' },
  4: { name: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', roi_30d: 52.7, win_rate: 79, followers: 4102, trades: 278, profit_share: 10, bio: 'Top 10 trader on SOFDex for 3 consecutive months. Whale wallet tracking expert.', strategy: 'Whale tracking + momentum. Focus on high-liquidity altcoins.' },
  default: { name: 'SolanaKing', avatar: 'SK', color: '#9945ff', roi_30d: 61.2, win_rate: 68, followers: 2841, trades: 189, profit_share: 5, bio: 'SOL ecosystem specialist.', strategy: 'On-chain data driven.' },
};

const roiData = [
  { day: 'D1', roi: 2.1 }, { day: 'D5', roi: 5.8 }, { day: 'D10', roi: 3.2 },
  { day: 'D15', roi: 12.4 }, { day: 'D20', roi: 9.1 }, { day: 'D25', roi: 18.7 }, { day: 'D30', roi: 24.3 },
];

const recentTrades = [
  { asset: 'BTC/USDT', dir: 'long', entry: 61200, exit: 67800, roi: 10.78, date: '2d ago' },
  { asset: 'SOL/USDT', dir: 'long', entry: 142, exit: 168, roi: 18.31, date: '4d ago' },
  { asset: 'ETH/USDT', dir: 'short', entry: 3820, exit: 3440, roi: 9.95, date: '6d ago' },
  { asset: 'BTC/USDT', dir: 'long', entry: 58900, exit: 61100, roi: 3.73, date: '8d ago' },
  { asset: 'SOL/USDT', dir: 'short', entry: 172, exit: 158, roi: 8.14, date: '10d ago' },
];

export default function TraderProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || 2;
  const profile = PROFILES[id] || PROFILES.default;

  const [following, setFollowing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyAmount, setCopyAmount] = useState('500');

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white" style={{ background: profile.color }}>
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{profile.name}</h1>
                <div className="flex items-center gap-1 bg-[#00d4aa]/10 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-[#00d4aa]" />
                  <span className="text-xs text-[#00d4aa] font-semibold">Lead Trader</span>
                </div>
              </div>
              <p className="text-sm text-slate-400">{profile.bio}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">30d ROI</p>
            <p className="text-lg font-black text-green-400">+{profile.roi_30d}%</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Win Rate</p>
            <p className="text-lg font-black text-white">{profile.win_rate}%</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Followers</p>
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-lg font-black text-white">{profile.followers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-[#0a0e1a] rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-[#00d4aa]">Strategy</span>
          </div>
          <p className="text-sm text-slate-300">{profile.strategy}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Profit share: <span className="text-amber-400 font-semibold">{profile.profit_share}%</span> of follower profits</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setFollowing(!following)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${following ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#1a2340] text-slate-300 border border-[rgba(148,163,184,0.1)]'}`}
          >
            <UserPlus className="w-4 h-4" />
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            onClick={() => setShowCopyModal(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${copying ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white'}`}
          >
            <Copy className="w-4 h-4" />
            {copying ? 'Copying' : 'Copy Trader'}
          </button>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="text-sm font-semibold text-white">30-Day ROI Performance</h2>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={roiData}>
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v) => [`+${v}%`, 'ROI']} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="roi" stroke="#00d4aa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trade History */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Trade History</h2>
        <div className="space-y-2">
          {recentTrades.map((t, i) => (
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
            <h3 className="text-base font-bold text-white">Copy {profile.name}</h3>
            <div className="bg-[#0a0e1a] rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Profit share to trader</span><span className="text-amber-400 font-semibold">{profile.profit_share}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">You keep</span><span className="text-green-400 font-semibold">{100 - profile.profit_share}%</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Copy Amount (USDC)</label>
              <input
                value={copyAmount}
                onChange={e => setCopyAmount(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCopyModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-[#1a2340] border border-[rgba(148,163,184,0.1)]">Cancel</button>
              <button
                onClick={() => { setCopying(true); setShowCopyModal(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]"
              >
                Start Copying
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}