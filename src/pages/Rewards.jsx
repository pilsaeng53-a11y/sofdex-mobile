import React, { useState } from 'react';
import { Zap, TrendingUp, Award, Gift, AlertTriangle, ChevronRight, Clock } from 'lucide-react';

const HISTORY = [
  { date: 'Mar 15', vol: 12400, earned: 24.8, status: 'claimed' },
  { date: 'Mar 14', vol: 8700, earned: 17.4, status: 'claimed' },
  { date: 'Mar 13', vol: 21300, earned: 42.6, status: 'claimed' },
  { date: 'Mar 12', vol: 5600, earned: 11.2, status: 'claimed' },
  { date: 'Mar 11', vol: 18900, earned: 37.8, status: 'claimed' },
];

const LEADERBOARD = [
  { rank: 1, name: 'DeFiQueen', vol: 284000, earned: 568, avatar: 'DQ', color: '#f59e0b' },
  { rank: 2, name: 'SolanaKing', vol: 211000, earned: 422, avatar: 'SK', color: '#9945ff' },
  { rank: 3, name: 'CryptoWhale99', vol: 187000, earned: 374, avatar: 'CW', color: '#00d4aa' },
  { rank: 4, name: 'BearHunter', vol: 143000, earned: 286, avatar: 'BH', color: '#ef4444' },
  { rank: 5, name: 'You', vol: 66400, earned: 133, avatar: 'ME', color: '#3b82f6' },
];

const RULES = [
  { icon: '📊', rule: 'Earn 0.2 SOF per $100 trading volume', detail: 'Both long and short trades qualify' },
  { icon: '🔄', rule: 'Min. 3 different assets per day', detail: 'Prevents wash trading on single pairs' },
  { icon: '⏱️', rule: 'Min. position hold time: 5 minutes', detail: 'Very short trades do not qualify' },
  { icon: '💰', rule: 'Max daily reward: 500 SOF', detail: 'Cap per wallet to prevent abuse' },
  { icon: '🛡️', rule: 'Anti-wash trading detection active', detail: 'Circular trades between wallets excluded' },
];

export default function Rewards() {
  const [claimed, setClaimed] = useState(false);
  const claimable = 133.4;
  const dailyEarned = 24.8;
  const totalEarned = 1847.2;

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Trade2Earn Rewards</h1>
        <p className="text-xs text-slate-400">Earn SOF tokens by trading on SOFDex</p>
      </div>

      {/* Claimable Card */}
      <div className="bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/10 rounded-2xl border border-[#00d4aa]/30 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-[#00d4aa]">Available to Claim</span>
        </div>
        <div>
          <p className="text-4xl font-black text-white">{claimable} <span className="text-xl text-[#00d4aa]">SOF</span></p>
          <p className="text-xs text-slate-400 mt-1">≈ ${(claimable * 0.42).toFixed(2)} USD</p>
        </div>
        <button
          onClick={() => setClaimed(true)}
          disabled={claimed}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${claimed ? 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.1)] cursor-not-allowed' : 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white'}`}
        >
          {claimed ? '✓ Claimed to Spot Wallet' : 'Claim to Spot Wallet'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#151c2e] rounded-xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Today's Earned</span>
          </div>
          <p className="text-xl font-black text-white">{dailyEarned} <span className="text-sm text-amber-400">SOF</span></p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs text-slate-400">Total Earned</span>
          </div>
          <p className="text-xl font-black text-white">{totalEarned.toLocaleString()} <span className="text-sm text-[#00d4aa]">SOF</span></p>
        </div>
      </div>

      {/* Today's Volume */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Today's Trading Activity</span>
          <div className="flex items-center gap-1 text-xs text-[#00d4aa]">
            <Clock className="w-3 h-3" />
            <span>Resets 00:00 UTC</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Volume</span>
            <span className="text-white font-semibold">$12,400</span>
          </div>
          <div className="w-full bg-[#0a0e1a] rounded-full h-2">
            <div className="bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] h-2 rounded-full" style={{ width: '42%' }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>$0</span>
            <span>Daily cap: $25,000</span>
          </div>
        </div>
      </div>

      {/* Reward Rules */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Reward Rules & Anti-Abuse</span>
        </div>
        <div className="space-y-3">
          {RULES.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-base mt-0.5">{r.icon}</span>
              <div>
                <p className="text-sm text-white font-medium">{r.rule}</p>
                <p className="text-xs text-slate-400">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">Rewards Leaderboard</span>
        </div>
        <div className="space-y-2">
          {LEADERBOARD.map(t => (
            <div key={t.rank} className={`flex items-center gap-3 py-2 px-3 rounded-xl ${t.name === 'You' ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/20' : ''}`}>
              <span className={`w-5 text-center text-xs font-black ${t.rank <= 3 ? ['text-yellow-400','text-slate-300','text-amber-600'][t.rank-1] : 'text-slate-500'}`}>#{t.rank}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: t.color }}>{t.avatar}</div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${t.name === 'You' ? 'text-[#00d4aa]' : 'text-white'}`}>{t.name}</p>
                <p className="text-xs text-slate-500">${(t.vol/1000).toFixed(0)}K volume</p>
              </div>
              <p className="text-sm font-bold text-amber-400">{t.earned} SOF</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Reward History</h2>
        <div className="space-y-2">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
              <div>
                <p className="text-sm text-white">{h.date}</p>
                <p className="text-xs text-slate-500">${h.vol.toLocaleString()} volume</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#00d4aa]">+{h.earned} SOF</p>
                <p className="text-xs text-green-400">Claimed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}