import React, { useState } from 'react';
import { Gift, Copy, Share2, Users, TrendingUp, CheckCircle2, Crown, Star, Zap, Wallet, Clock, DollarSign, ArrowDownCircle, Filter } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';

const MY_CODE = 'SOFDEX-K9QR';
const MY_LINK = 'https://sofdex.io/r/K9QR';

const GRADE_CONFIG = {
  Green:    { commission: '10%', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', badge: '🟢', min: 0    },
  Purple:   { commission: '30%', color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  badge: '🟣', min: 10   },
  Gold:     { commission: '40%', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   badge: '🥇', min: 30   },
  Platinum: { commission: '50%', color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/10',   border: 'border-[#00d4aa]/20',   badge: '💎', min: 100  },
};

const MY_STATS = {
  grade: 'Gold',
  invited: 12,
  totalEarnings: '$1,248.40',
  pendingEarnings: '$86.20',
  paidEarnings: '$1,162.20',
  teamVolume: '$892,100',
};

const REFERRED_USERS = [
  { name: 'User ...aX4f', joined: '2h ago',  volume: '$12,400', earned: '$124.00', status: 'active',   activity: 'Traded BTC Perp' },
  { name: 'User ...mN2q', joined: '1d ago',  volume: '$8,200',  earned: '$82.00',  status: 'active',   activity: 'Swapped SOL→USDC' },
  { name: 'User ...Kp9r', joined: '3d ago',  volume: '$31,000', earned: '$310.00', status: 'active',   activity: 'RWA purchase' },
  { name: 'User ...Tt7s', joined: '5d ago',  volume: '$5,600',  earned: '$56.00',  status: 'inactive', activity: 'Last: 5d ago' },
  { name: 'User ...Rn8b', joined: '8d ago',  volume: '$19,800', earned: '$198.00', status: 'active',   activity: 'Copy trade opened' },
  { name: 'User ...Wm3x', joined: '12d ago', volume: '$4,200',  earned: '$42.00',  status: 'inactive', activity: 'Last: 12d ago' },
];

const HISTORY_DATA = {
  daily: [
    { date: 'Mar 14', fee: '+$28.40', category: 'Spot Trading',  status: 'Paid' },
    { date: 'Mar 13', fee: '+$14.20', category: 'Perp Trading',  status: 'Paid' },
    { date: 'Mar 12', fee: '+$32.10', category: 'Spot Trading',  status: 'Paid' },
    { date: 'Mar 11', fee: '+$9.60',  category: 'RWA',           status: 'Paid' },
    { date: 'Mar 10', fee: '+$18.90', category: 'Swap',          status: 'Pending' },
  ],
  weekly: [
    { date: 'Week of Mar 10', fee: '+$103.20', category: 'All Categories', status: 'Paid' },
    { date: 'Week of Mar 3',  fee: '+$218.40', category: 'All Categories', status: 'Paid' },
    { date: 'Week of Feb 24', fee: '+$142.80', category: 'All Categories', status: 'Paid' },
    { date: 'Week of Feb 17', fee: '+$89.40',  category: 'All Categories', status: 'Paid' },
  ],
  monthly: [
    { date: 'March 2026',   fee: '+$248.20', category: 'All Categories', status: 'Pending' },
    { date: 'February 2026',fee: '+$412.80', category: 'All Categories', status: 'Paid' },
    { date: 'January 2026', fee: '+$318.60', category: 'All Categories', status: 'Paid' },
    { date: 'December 2025',fee: '+$268.80', category: 'All Categories', status: 'Paid' },
  ],
  yearly: [
    { date: '2026 YTD',  fee: '+$661.00', category: 'All Categories', status: 'In Progress' },
    { date: '2025 Full', fee: '+$587.40', category: 'All Categories', status: 'Paid' },
  ],
};

const TOP_REFERRERS = [
  { rank: 1, name: 'CryptoWhale_88', invited: 342, rewards: '$42,100', grade: 'Platinum' },
  { rank: 2, name: 'SolMaxi',        invited: 218, rewards: '$28,400', grade: 'Platinum' },
  { rank: 3, name: 'RWA_Maestro',   invited: 187, rewards: '$22,800', grade: 'Platinum' },
  { rank: 4, name: 'TradeKing_99',  invited: 134, rewards: '$16,200', grade: 'Gold' },
  { rank: 5, name: 'DeFi_Overlord', invited: 98,  rewards: '$11,900', grade: 'Gold' },
  { rank: 6, name: 'You (K9QR)',    invited: 12,  rewards: '$1,248',  grade: 'Gold', isMe: true },
];

const AFFILIATES_URL = 'https://www.solfort.foundation/affiliates';

export default function Referral() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [historyFilter, setHistoryFilter] = useState('daily');
  const [claimDone, setClaimDone] = useState(false);

  const myGrade = GRADE_CONFIG[MY_STATS.grade];
  const grade = GRADE_CONFIG[MY_STATS.grade];

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleClaim = () => { setClaimDone(true); setTimeout(() => setClaimDone(false), 3000); };

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Referral Hub</h1>
        </div>
        <p className="text-[11px] text-slate-500">Earn up to {GRADE_CONFIG.Platinum.commission} of your referrals' trading fees forever</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[['dashboard','Dashboard'],['users','Referred Users'],['history','Earnings History'],['leaderboard','Leaderboard']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === key ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}>{label}</button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="px-4 space-y-4">
          {/* My Grade Badge */}
          <div className={`glass-card rounded-2xl p-4 border ${grade.border}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{grade.badge}</span>
                <div>
                  <p className="text-sm font-black text-white">{MY_STATS.grade} Grade</p>
                  <p className={`text-[10px] font-bold ${grade.color}`}>{grade.commission} Commission Rate</p>
                </div>
              </div>
              <a href={AFFILIATES_URL} target="_blank" rel="noopener noreferrer"
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${grade.bg} ${grade.color} border ${grade.border}`}>
                Upgrade →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500">
              {Object.entries(GRADE_CONFIG).map(([name, cfg]) => (
                <div key={name} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${name === MY_STATS.grade ? cfg.bg : 'bg-[#0d1220]'}`}>
                  <span>{cfg.badge}</span>
                  <span className={name === MY_STATS.grade ? cfg.color : 'text-slate-600'}>{name}</span>
                  <span className="ml-auto font-semibold">{cfg.commission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral code */}
          <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d4aa]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-[#0d1220] rounded-xl px-4 py-3 border border-[rgba(148,163,184,0.08)]">
                  <p className="text-lg font-black text-[#00d4aa] tracking-widest">{MY_CODE}</p>
                </div>
                <button onClick={handleCopy}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : 'bg-[#00d4aa] text-white hover:bg-[#00bfa3]'}`}>
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)]">
                <span className="text-[10px] text-slate-500 truncate flex-1">{MY_LINK}</span>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] text-[10px] font-semibold text-slate-300 border border-[rgba(148,163,184,0.08)] flex-shrink-0">
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Earnings overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card rounded-2xl p-3 col-span-3 flex items-center justify-between border border-emerald-400/10">
              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">Total Earned</p>
                <p className="text-xl font-black text-emerald-400">{MY_STATS.totalEarnings}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-0.5">Paid Out</p>
                <p className="text-sm font-bold text-white">{MY_STATS.paidEarnings}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-0.5">Pending</p>
                <p className="text-sm font-bold text-amber-400">{MY_STATS.pendingEarnings}</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-3">
              <Users className="w-3.5 h-3.5 text-violet-400 mb-1" />
              <p className="text-[10px] text-slate-500">Invited</p>
              <p className="text-xl font-black text-white">{MY_STATS.invited}</p>
            </div>
            <div className="glass-card rounded-2xl p-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#00d4aa] mb-1" />
              <p className="text-[10px] text-slate-500">Team Vol.</p>
              <p className="text-sm font-bold text-white">{MY_STATS.teamVolume}</p>
            </div>
            <div className="glass-card rounded-2xl p-3">
              <Crown className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <p className="text-[10px] text-slate-500">Grade</p>
              <p className={`text-sm font-bold ${grade.color}`}>{MY_STATS.grade}</p>
            </div>
          </div>

          {/* Claim Rewards */}
          <button onClick={handleClaim}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              claimDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/20' : 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black hover:opacity-90'
            }`}>
            {claimDone ? <><CheckCircle2 className="w-4 h-4" />Rewards sent to Spot Wallet</> : <><Wallet className="w-4 h-4" />Claim Rewards ({MY_STATS.pendingEarnings})</>}
          </button>
          <p className="text-[10px] text-slate-600 text-center -mt-2">Claimed rewards are transferred to your Spot Wallet</p>
        </div>
      )}

      {/* REFERRED USERS */}
      {tab === 'users' && (
        <div className="px-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referred Users · {REFERRED_USERS.length} total</p>
          {REFERRED_USERS.map((u, i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${u.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-600/20 text-slate-600'}`}>{u.status}</span>
                </div>
                <p className="text-[10px] text-slate-600">{u.activity} · Vol: {u.volume}</p>
                <p className="text-[10px] text-slate-600">Joined {u.joined}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex-shrink-0">{u.earned}</span>
            </div>
          ))}
        </div>
      )}

      {/* EARNINGS HISTORY */}
      {tab === 'history' && (
        <div className="px-4 space-y-3">
          {/* Time filter */}
          <div className="flex gap-1.5">
            {['daily','weekly','monthly','yearly'].map(f => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                  historyFilter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
                }`}>{f}</button>
            ))}
          </div>

          {/* Summary row */}
          <div className="glass-card rounded-2xl p-3 flex items-center justify-between border border-emerald-400/10">
            <div>
              <p className="text-[10px] text-slate-500">Total ({historyFilter})</p>
              <p className="text-sm font-black text-emerald-400">
                {HISTORY_DATA[historyFilter].reduce((acc, r) => acc + parseFloat(r.fee.replace('+$', '').replace(',', '')), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Entries</p>
              <p className="text-sm font-bold text-white">{HISTORY_DATA[historyFilter].length}</p>
            </div>
          </div>

          {/* History rows */}
          <div className="glass-card rounded-2xl divide-y divide-[rgba(148,163,184,0.05)]">
            {HISTORY_DATA[historyFilter].map((row, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">{row.date}</p>
                  <p className="text-[10px] text-slate-500">{row.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{row.fee}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                    row.status === 'Paid' ? 'bg-emerald-400/10 text-emerald-400' :
                    row.status === 'Pending' ? 'bg-amber-400/10 text-amber-400' :
                    'bg-blue-400/10 text-blue-400'
                  }`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === 'leaderboard' && (
        <div className="px-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Top Referrers This Month</p>
          {TOP_REFERRERS.map((r) => {
            const gc = GRADE_CONFIG[r.grade] || GRADE_CONFIG.Green;
            return (
              <div key={r.rank} className={`glass-card rounded-2xl p-3.5 flex items-center gap-3 ${r.isMe ? 'border border-[#00d4aa]/20' : ''}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
                  r.rank === 1 ? 'bg-amber-400/20 text-amber-400' : r.rank === 2 ? 'bg-slate-300/10 text-slate-300' : r.rank === 3 ? 'bg-orange-400/10 text-orange-400' : 'bg-[#1a2340] text-slate-500'
                }`}>{r.rank}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${r.isMe ? 'text-[#00d4aa]' : 'text-white'}`}>{r.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px]">{gc.badge}</span>
                    <span className={`text-[9px] font-semibold ${gc.color}`}>{r.grade}</span>
                    <span className="text-[9px] text-slate-600">· {r.invited} invited</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">{r.rewards}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}