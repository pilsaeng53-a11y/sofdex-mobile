import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Star, Copy, Shield, Award, Clock } from 'lucide-react';

const FEED_DATA = [
  { trader: 'CryptoWhale_X', handle: '@whaleX', asset: 'SOL', dir: 'Long', entry: '$182.40', roi: '+14.2%', time: '2m ago', positive: true, avatar: 'CW' },
  { trader: 'DefiQuant', handle: '@dfquant', asset: 'BTC', dir: 'Long', entry: '$91,200', roi: '+6.8%', time: '8m ago', positive: true, avatar: 'DQ' },
  { trader: 'SolanaKing', handle: '@solking', asset: 'RNDR', dir: 'Long', entry: '$8.92', roi: '+18.4%', time: '14m ago', positive: true, avatar: 'SK' },
  { trader: 'RWA_Pro', handle: '@rwapro', asset: 'RE-DXB', dir: 'Long', entry: '$122.50', roi: '+3.1%', time: '22m ago', positive: true, avatar: 'RP' },
  { trader: 'LeverageLord', handle: '@levlord', asset: 'ETH', dir: 'Short', entry: '$3,890', roi: '-4.2%', time: '31m ago', positive: false, avatar: 'LL' },
  { trader: 'CryptoWhale_X', handle: '@whaleX', asset: 'JUP', dir: 'Long', entry: '$1.18', roi: '+9.4%', time: '45m ago', positive: true, avatar: 'CW' },
];

const TRADERS = [
  {
    rank: 1, name: 'CryptoWhale_X', handle: '@whaleX',
    pnl30d: '+$48,240', pnlPct: '+142.4%', winRate: '78%',
    followers: 8420, riskRating: 'Medium', strategy: 'Momentum + Breakout',
    trades: 142, positive: true,
  },
  {
    rank: 2, name: 'SolanaKing', handle: '@solking',
    pnl30d: '+$31,880', pnlPct: '+89.2%', winRate: '71%',
    followers: 5240, riskRating: 'High', strategy: 'High Leverage Scalping',
    trades: 298, positive: true,
  },
  {
    rank: 3, name: 'DefiQuant', handle: '@dfquant',
    pnl30d: '+$22,150', pnlPct: '+58.7%', winRate: '85%',
    followers: 3180, riskRating: 'Low', strategy: 'Quant + Mean Reversion',
    trades: 64, positive: true,
  },
  {
    rank: 4, name: 'RWA_Pro', handle: '@rwapro',
    pnl30d: '+$14,920', pnlPct: '+39.1%', winRate: '82%',
    followers: 2840, riskRating: 'Low', strategy: 'RWA + Yield Arbitrage',
    trades: 38, positive: true,
  },
  {
    rank: 5, name: 'LeverageLord', handle: '@levlord',
    pnl30d: '-$3,240', pnlPct: '-8.4%', winRate: '45%',
    followers: 1920, riskRating: 'Very High', strategy: 'Max Leverage YOLO',
    trades: 512, positive: false,
  },
];

const riskColor = {
  Low: 'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  High: 'text-red-400 bg-red-400/10',
  'Very High': 'text-red-500 bg-red-500/15',
};

const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

export default function SocialTrading() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Social Trading</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">Follow and copy top-performing traders</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Top Traders', value: '1,240' },
          { label: 'Copy Portfolios', value: '18,400' },
          { label: 'Avg Return (30d)', value: '+62.4%' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-sm font-bold ${i === 2 ? 'text-emerald-400' : 'text-white'}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {['leaderboard', 'following'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'leaderboard' && (
        <div className="space-y-3">
          {TRADERS.map((trader, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a2340] flex items-center justify-center">
                    <span className={`text-base font-black ${rankColors[i] || 'text-slate-400'}`}>#{trader.rank}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{trader.name}</p>
                    <p className="text-[11px] text-slate-500">{trader.handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${trader.positive ? 'text-emerald-400' : 'text-red-400'}`}>{trader.pnlPct}</p>
                  <p className="text-[10px] text-slate-500">30d PnL</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">Win Rate</p>
                  <p className="text-xs font-bold text-white">{trader.winRate}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">Trades</p>
                  <p className="text-xs font-bold text-white">{trader.trades}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">Followers</p>
                  <p className="text-xs font-bold text-white">{(trader.followers / 1000).toFixed(1)}K</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Strategy</p>
                  <p className="text-xs text-slate-300">{trader.strategy}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${riskColor[trader.riskRating]}`}>
                  {trader.riskRating}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/20 transition-all flex items-center justify-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />Copy Trade
                </button>
                <button className="flex-1 py-2 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-semibold hover:border-[#00d4aa]/20 transition-all flex items-center justify-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'following' && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">No traders followed yet</p>
          <p className="text-xs text-slate-500">Follow traders from the leaderboard to see their activity here.</p>
        </div>
      )}
    </div>
  );
}