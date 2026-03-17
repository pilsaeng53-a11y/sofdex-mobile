import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Copy, UserPlus, BarChart3, Shield, Star, CheckCircle2, Activity, Target, Zap, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PROFILES = {
  1: { name: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', roi_30d: 38.4, win_rate: 74, followers: 1284, trades: 312, profit_share: 10, bio: 'Crypto trader since 2017. Specializes in BTC momentum breakouts and macro positioning.', strategy: 'Momentum + Breakout. Focus on BTC/SOL perpetuals with high R:R setups.', pnl_total: '+$84,200', avg_hold: '2.4 days', max_dd: 8.2 },
  2: { name: 'SolanaKing', avatar: 'SK', color: '#9945ff', roi_30d: 61.2, win_rate: 68, followers: 2841, trades: 189, profit_share: 5, bio: 'SOL ecosystem specialist. Trading DeFi narrative cycles and on-chain signals.', strategy: 'On-chain data driven. SOL ecosystem plays with 2-5 day holds.', pnl_total: '+$142,000', avg_hold: '3.1 days', max_dd: 11.4 },
  3: { name: 'BearHunter', avatar: 'BH', color: '#ef4444', roi_30d: 22.1, win_rate: 71, followers: 674, trades: 421, profit_share: 20, bio: 'Short-side specialist. Finds overextended assets and fades them systematically.', strategy: 'Counter-trend short selling. Strict stop losses, 1:3 R:R minimum.', pnl_total: '+$28,400', avg_hold: '1.2 days', max_dd: 5.8 },
  4: { name: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', roi_30d: 52.7, win_rate: 79, followers: 4102, trades: 278, profit_share: 10, bio: 'Top 10 trader on SOFDex for 3 consecutive months. Whale wallet tracking expert.', strategy: 'Whale tracking + momentum. Focus on high-liquidity altcoins.', pnl_total: '+$218,500', avg_hold: '4.7 days', max_dd: 9.1 },
};

const roiData = [
  { day: 'D1', roi: 2.1, cum: 2.1 }, { day: 'D5', roi: 5.8, cum: 8.2 }, { day: 'D10', roi: 3.2, cum: 12.1 },
  { day: 'D15', roi: 12.4, cum: 26.8 }, { day: 'D20', roi: 9.1, cum: 37.2 }, { day: 'D25', roi: 18.7, cum: 48.9 }, { day: 'D30', roi: 24.3, cum: 61.2 },
];

const recentTrades = [
  { asset: 'BTC/USDT', dir: 'long', entry: 61200, exit: 67800, roi: 10.78, pnl: '+$2,412', date: '2d ago' },
  { asset: 'SOL/USDT', dir: 'long', entry: 142, exit: 168, roi: 18.31, pnl: '+$4,820', date: '4d ago' },
  { asset: 'ETH/USDT', dir: 'short', entry: 3820, exit: 3440, roi: 9.95, pnl: '+$1,980', date: '6d ago' },
  { asset: 'BTC/USDT', dir: 'long', entry: 58900, exit: 61100, roi: 3.73, pnl: '+$892', date: '8d ago' },
  { asset: 'SOL/USDT', dir: 'short', entry: 172, exit: 158, roi: 8.14, pnl: '+$1,240', date: '10d ago' },
];

const openPositions = [
  { asset: 'SOL/USDT', dir: 'long', entry: 182, current: 194.2, roi: 6.71, size: '$12,400' },
  { asset: 'WIF/USDT', dir: 'long', entry: 2.84, current: 3.12, roi: 9.86, size: '$4,200' },
];

export default function TraderProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || 2;
  const profile = PROFILES[id] || PROFILES[2];

  const [following, setFollowing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyAmount, setCopyAmount] = useState('500');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-8">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-4 pb-5 border-b border-[rgba(148,163,184,0.06)]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${profile.color}10 0%, transparent 60%)` }} />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${profile.color}, ${profile.color}99)` }}>
              {profile.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-black text-white">{profile.name}</h1>
                <div className="flex items-center gap-1 bg-[#00d4aa]/10 px-2 py-0.5 rounded-full border border-[#00d4aa]/20">
                  <Award className="w-3 h-3 text-[#00d4aa]" />
                  <span className="text-[10px] text-[#00d4aa] font-bold">Lead Trader</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mb-2">{profile.bio}</p>
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-amber-400 font-semibold">Profit share: {profile.profit_share}%</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">30D ROI</p>
              <p className="text-sm font-black text-emerald-400">+{profile.roi_30d}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Win Rate</p>
              <p className="text-sm font-black text-white">{profile.win_rate}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Followers</p>
              <p className="text-sm font-black text-white">{profile.followers.toLocaleString()}</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Trades</p>
              <p className="text-sm font-black text-white">{profile.trades}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setFollowing(!following)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                following ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-300 border-[rgba(148,163,184,0.1)] hover:border-[#00d4aa]/20'
              }`}>
              <UserPlus className="w-4 h-4" />
              {following ? 'Following' : 'Follow'}
            </button>
            <button onClick={() => setShowCopyModal(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                copying ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white shadow-[#00d4aa]/20'
              }`}>
              <Copy className="w-4 h-4" />
              {copying ? '✓ Copying' : 'Copy Trader'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none">
        {['overview', 'chart', 'trades', 'positions', 'strategies'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
              activeTab === tab
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
                : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total P&L', value: profile.pnl_total, color: 'text-emerald-400' },
                { label: 'Max Drawdown', value: `-${profile.max_dd}%`, color: 'text-red-400' },
                { label: 'Avg Hold Time', value: profile.avg_hold, color: 'text-blue-400' },
                { label: 'Total Trades', value: profile.trades.toString(), color: 'text-white' },
              ].map((m, i) => (
                <div key={i} className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.06)]">
                  <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                  <p className={`text-base font-black ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#00d4aa]" />
                <span className="text-sm font-bold text-white">Trading Strategy</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{profile.strategy}</p>
            </div>
            <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white mb-3">Performance Breakdown</p>
              {[
                { label: 'Win Rate', val: profile.win_rate, max: 100, color: '#00d4aa' },
                { label: '30D ROI', val: Math.min(profile.roi_30d, 100), max: 100, color: '#3b82f6' },
                { label: 'Risk Score', val: 72, max: 100, color: '#8b5cf6' },
              ].map((m, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-[11px] text-slate-400">{m.label}</p>
                    <p className="text-[11px] font-bold text-white">{m.val}%</p>
                  </div>
                  <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'chart' && (
          <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#00d4aa]" />
              <h2 className="text-sm font-bold text-white">30-Day Cumulative ROI</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={roiData}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => [`+${v}%`, 'Cum. ROI']} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10, fontSize: 11 }} />
                <Area type="monotone" dataKey="cum" stroke="#00d4aa" strokeWidth={2} fill="url(#roiGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-2">
            {recentTrades.map((t, i) => (
              <div key={i} className="bg-[#151c2e] rounded-xl p-3.5 border border-[rgba(148,163,184,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.dir === 'long' ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
                      {t.dir === 'long' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.asset}</p>
                      <p className="text-[10px] text-slate-500">{t.date} · ${t.entry} → ${t.exit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">+{t.roi}%</p>
                    <p className="text-[10px] text-emerald-400/70">{t.pnl}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-3">
            <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/15 rounded-xl p-3 mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00d4aa]" />
                <p className="text-[10px] text-[#00d4aa] font-bold">{openPositions.length} Open Positions (Live)</p>
              </div>
            </div>
            {openPositions.map((pos, i) => (
              <div key={i} className="bg-[#151c2e] rounded-xl p-3.5 border border-[rgba(148,163,184,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-sm font-bold text-white">{pos.asset}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 uppercase">{pos.dir}</span>
                  </div>
                  <p className="text-sm font-black text-emerald-400">+{pos.roi}%</p>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Entry: <span className="text-white">${pos.entry}</span></span>
                  <span className="text-slate-500">Current: <span className="text-[#00d4aa]">${pos.current}</span></span>
                  <span className="text-slate-500">Size: <span className="text-white">{pos.size}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-3">
            {[
              { name: 'SOL Momentum Breakout', roi: '+61.2%', subs: 89, risk: 'Medium' },
              { name: 'DeFi Narrative Plays', roi: '+44.8%', subs: 52, risk: 'High' },
            ].map((s, i) => (
              <div key={i} className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <p className="text-base font-black text-emerald-400">{s.roi}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{s.subs} subscribers · {s.risk} Risk</span>
                  <button className="flex items-center gap-1 text-[10px] text-[#00d4aa] font-bold">
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-[#151c2e] rounded-3xl border border-[rgba(148,163,184,0.1)] p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: profile.color }}>
                {profile.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Copy {profile.name}</h3>
                <p className="text-[10px] text-slate-500">Automatically mirror all trades</p>
              </div>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">30D ROI</span><span className="text-emerald-400 font-bold">+{profile.roi_30d}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Win Rate</span><span className="text-white font-semibold">{profile.win_rate}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Profit share</span><span className="text-amber-400 font-bold">{profile.profit_share}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">You keep</span><span className="text-emerald-400 font-bold">{100 - profile.profit_share}%</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Copy Amount (USDC)</label>
              <input
                value={copyAmount}
                onChange={e => setCopyAmount(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCopyModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-[#1a2340] border border-[rgba(148,163,184,0.1)]">Cancel</button>
              <button onClick={() => { setCopying(true); setShowCopyModal(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] shadow-lg shadow-[#00d4aa]/20">
                Start Copying
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}