import React, { useState } from 'react';
import { Gift, Copy, Share2, Users, TrendingUp, ChevronRight, CheckCircle2, Crown, Star, Zap } from 'lucide-react';

const MY_CODE = 'SOFDEX-K9QR';
const MY_LINK = 'https://sofdex.io/r/K9QR';

const TIERS = [
  { name: 'Starter',     min: 0,    max: 5,   reward: '10%', color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  { name: 'Silver',      min: 5,    max: 20,  reward: '15%', color: 'text-slate-300',   bg: 'bg-slate-300/10',   border: 'border-slate-300/20' },
  { name: 'Gold',        min: 20,   max: 50,  reward: '20%', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  { name: 'Platinum',    min: 50,   max: 100, reward: '25%', color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/10',   border: 'border-[#00d4aa]/20' },
  { name: 'Diamond',     min: 100,  max: Infinity, reward: '30%', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
];

const MY_STATS = {
  invited: 12,
  rewards: '$1,248.40',
  teamVolume: '$892,100',
  tier: 'Gold',
  tierIndex: 2,
  nextTier: 'Platinum',
  nextAt: 50,
};

const TOP_REFERRERS = [
  { rank: 1, name: 'CryptoWhale_88',   invited: 342, rewards: '$42,100', tier: 'Diamond' },
  { rank: 2, name: 'SolMaxi',          invited: 218, rewards: '$28,400', tier: 'Diamond' },
  { rank: 3, name: 'RWA_Maestro',      invited: 187, rewards: '$22,800', tier: 'Diamond' },
  { rank: 4, name: 'TradeKing_99',     invited: 134, rewards: '$16,200', tier: 'Platinum' },
  { rank: 5, name: 'DeFi_Overlord',    invited: 98,  rewards: '$11,900', tier: 'Platinum' },
  { rank: 6, name: 'You (K9QR)',       invited: 12,  rewards: '$1,248',  tier: 'Gold', isMe: true },
];

const RECENT_REFERRALS = [
  { name: 'User ...aX4f', joined: '2h ago',   volume: '$12,400', reward: '+$124.00' },
  { name: 'User ...mN2q', joined: '1d ago',   volume: '$8,200',  reward: '+$82.00' },
  { name: 'User ...Kp9r', joined: '3d ago',   volume: '$31,000', reward: '+$310.00' },
  { name: 'User ...Tt7s', joined: '5d ago',   volume: '$5,600',  reward: '+$56.00' },
];

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('dashboard');

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = ((MY_STATS.invited - TIERS[MY_STATS.tierIndex].min) / (TIERS[MY_STATS.tierIndex].max - TIERS[MY_STATS.tierIndex].min)) * 100;

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Referral Hub</h1>
        </div>
        <p className="text-[11px] text-slate-500">Earn up to 30% of your referrals' trading fees forever</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['dashboard', 'leaderboard', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="px-4 space-y-4">
          {/* Referral code card */}
          <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d4aa]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-[#0d1220] rounded-xl px-4 py-3 border border-[rgba(148,163,184,0.08)]">
                  <p className="text-lg font-black text-[#00d4aa] tracking-widest">{MY_CODE}</p>
                </div>
                <button onClick={handleCopy}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-[#00d4aa] text-white hover:bg-[#00bfa3]'
                  }`}>
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)] mb-3">
                <span className="text-[10px] text-slate-500 truncate flex-1">{MY_LINK}</span>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] text-[10px] font-semibold text-slate-300 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all flex-shrink-0">
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-card rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <p className="text-[10px] text-slate-500">Invited Users</p>
              </div>
              <p className="text-xl font-black text-white">{MY_STATS.invited}</p>
            </div>
            <div className="glass-card rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] text-slate-500">Total Rewards</p>
              </div>
              <p className="text-xl font-black text-emerald-400">{MY_STATS.rewards}</p>
            </div>
            <div className="glass-card rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#00d4aa]" />
                <p className="text-[10px] text-slate-500">Team Volume</p>
              </div>
              <p className="text-sm font-bold text-white">{MY_STATS.teamVolume}</p>
            </div>
            <div className="glass-card rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-[10px] text-slate-500">Current Tier</p>
              </div>
              <p className="text-sm font-bold text-amber-400">{MY_STATS.tier}</p>
            </div>
          </div>

          {/* Tier progress */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white">Tier Progress</p>
              <span className="text-[10px] text-slate-500">{MY_STATS.invited} / {MY_STATS.nextAt} referrals to {MY_STATS.nextTier}</span>
            </div>
            <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#00d4aa] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="grid grid-cols-5 gap-1">
              {TIERS.map((tier, i) => (
                <div key={tier.name} className={`rounded-xl p-2 text-center border ${i <= MY_STATS.tierIndex ? tier.border + ' ' + tier.bg : 'border-[rgba(148,163,184,0.06)] bg-transparent'}`}>
                  <p className={`text-[9px] font-bold ${i <= MY_STATS.tierIndex ? tier.color : 'text-slate-600'}`}>{tier.name}</p>
                  <p className={`text-[10px] font-black ${i <= MY_STATS.tierIndex ? tier.color : 'text-slate-700'}`}>{tier.reward}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent referrals */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Recent Referrals</p>
            <div className="space-y-2">
              {RECENT_REFERRALS.map((r, i) => (
                <div key={i} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1a2340] flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{r.name}</p>
                      <p className="text-[10px] text-slate-500">Vol: {r.volume} · {r.joined}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{r.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="px-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Top Referrers This Month</p>
          {TOP_REFERRERS.map((r) => (
            <div key={r.rank} className={`glass-card rounded-2xl p-3.5 flex items-center gap-3 ${r.isMe ? 'border border-[#00d4aa]/20' : ''}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
                r.rank === 1 ? 'bg-amber-400/20 text-amber-400' : r.rank === 2 ? 'bg-slate-300/10 text-slate-300' : r.rank === 3 ? 'bg-orange-400/10 text-orange-400' : 'bg-[#1a2340] text-slate-500'
              }`}>{r.rank}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${r.isMe ? 'text-[#00d4aa]' : 'text-white'}`}>{r.name}</p>
                <p className="text-[10px] text-slate-500">{r.invited} invited · {r.tier}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">{r.rewards}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="px-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-4">Reward History</p>
            <div className="space-y-3">
              {[...RECENT_REFERRALS, ...RECENT_REFERRALS].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-white">{r.name} traded</p>
                    <p className="text-[10px] text-slate-500">{r.joined}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{r.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}