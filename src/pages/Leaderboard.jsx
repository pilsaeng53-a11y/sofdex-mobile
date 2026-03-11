import React, { useState } from 'react';
import { Trophy, TrendingUp, Gift, Target, Crown, Medal } from 'lucide-react';

const CATEGORIES = [
  { id: 'traders',    label: 'Top Traders',      icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'referrers',  label: 'Top Referrers',    icon: Gift,       color: 'text-violet-400' },
  { id: 'rwa',        label: 'RWA Investors',    icon: Trophy,     color: 'text-amber-400' },
  { id: 'predictors', label: 'Top Predictors',   icon: Target,     color: 'text-[#00d4aa]' },
];

const LEADERBOARDS = {
  traders: [
    { rank: 1, name: 'AlphaWolf_77',   metric: '+$184,200', sub: '92% win rate · 342 trades',  badge: 'Elite',   change: '+22.4%' },
    { rank: 2, name: 'QuantTrader',    metric: '+$121,800', sub: '88% win rate · 218 trades',  badge: 'Pro',     change: '+18.1%' },
    { rank: 3, name: 'SolGod',         metric: '+$98,400',  sub: '85% win rate · 187 trades',  badge: 'Pro',     change: '+15.6%' },
    { rank: 4, name: 'CryptoDesk_X',   metric: '+$67,200',  sub: '79% win rate · 134 trades',  badge: 'Gold',    change: '+12.3%' },
    { rank: 5, name: 'DeepFi_Ops',     metric: '+$54,900',  sub: '76% win rate · 98 trades',   badge: 'Gold',    change: '+10.8%' },
    { rank: 6, name: 'MemeLord_404',   metric: '+$38,100',  sub: '71% win rate · 421 trades',  badge: 'Silver',  change: '+8.2%' },
    { rank: 7, name: 'RWA_King',       metric: '+$29,800',  sub: '68% win rate · 76 trades',   badge: 'Silver',  change: '+6.9%' },
    { rank: 8, name: 'HedgeMaster',    metric: '+$22,400',  sub: '65% win rate · 54 trades',   badge: 'Silver',  change: '+5.4%' },
    { rank: 9, name: 'ZeroRisk_Never', metric: '+$17,200',  sub: '62% win rate · 89 trades',   badge: 'Bronze',  change: '+4.1%' },
    { rank: 10, name: 'LiqHunter',     metric: '+$11,900',  sub: '59% win rate · 210 trades',  badge: 'Bronze',  change: '+3.2%' },
  ],
  referrers: [
    { rank: 1, name: 'CryptoWhale_88', metric: '$42,100',   sub: '342 referrals · Diamond tier', badge: 'Diamond', change: '+340' },
    { rank: 2, name: 'SolMaxi',        metric: '$28,400',   sub: '218 referrals · Diamond tier', badge: 'Diamond', change: '+215' },
    { rank: 3, name: 'RWA_Maestro',    metric: '$22,800',   sub: '187 referrals · Diamond tier', badge: 'Diamond', change: '+184' },
    { rank: 4, name: 'TradeKing_99',   metric: '$16,200',   sub: '134 referrals · Platinum tier',badge: 'Platinum',change: '+131' },
    { rank: 5, name: 'DeFi_Overlord',  metric: '$11,900',   sub: '98 referrals · Platinum tier', badge: 'Platinum',change: '+95' },
    { rank: 6, name: 'NodeRunner',     metric: '$8,400',    sub: '67 referrals · Gold tier',     badge: 'Gold',    change: '+64' },
    { rank: 7, name: 'SOFDex_Fan',     metric: '$5,800',    sub: '44 referrals · Gold tier',     badge: 'Gold',    change: '+41' },
    { rank: 8, name: 'You (K9QR)',     metric: '$1,248',    sub: '12 referrals · Gold tier',     badge: 'Gold',    change: '+12', isMe: true },
  ],
  rwa: [
    { rank: 1, name: 'InstiFund_X',    metric: '$4.2M AUM', sub: '12 properties · 9.4% avg yield', badge: 'Institutional', change: '+34.2%' },
    { rank: 2, name: 'DubaiMax',       metric: '$2.8M AUM', sub: '8 properties · 11.2% avg yield', badge: 'Whale',         change: '+28.8%' },
    { rank: 3, name: 'GoldVault_7',    metric: '$1.9M AUM', sub: 'GOLD-T heavy · 0.87% yield',     badge: 'Pro',           change: '+18.4%' },
    { rank: 4, name: 'TBillKing',      metric: '$1.4M AUM', sub: 'Treasury focused · 5.1% yield',  badge: 'Pro',           change: '+12.1%' },
    { rank: 5, name: 'RWA_Degen',      metric: '$890K AUM', sub: '5 assets · 8.3% blended yield',  badge: 'Gold',          change: '+9.8%' },
  ],
  predictors: [
    { rank: 1, name: 'OracleMind',     metric: '91% acc.',  sub: '148 correct / 163 total bets',   badge: 'Legendary', change: '+$28,400' },
    { rank: 2, name: 'FutureSeer_X',   metric: '87% acc.',  sub: '112 correct / 129 total bets',   badge: 'Elite',     change: '+$19,100' },
    { rank: 3, name: 'DataDriven_99',  metric: '82% acc.',  sub: '98 correct / 120 total bets',    badge: 'Elite',     change: '+$14,800' },
    { rank: 4, name: 'MacroGuru',      metric: '79% acc.',  sub: '87 correct / 110 total bets',    badge: 'Pro',       change: '+$10,400' },
    { rank: 5, name: 'CryptoSage',     metric: '74% acc.',  sub: '74 correct / 100 total bets',    badge: 'Pro',       change: '+$7,200' },
    { rank: 6, name: 'NewsTrader',     metric: '70% acc.',  sub: '63 correct / 90 total bets',     badge: 'Gold',      change: '+$4,900' },
  ],
};

const BADGE_STYLES = {
  'Elite':       'bg-amber-400/10 text-amber-400 border-amber-400/20',
  'Legendary':   'bg-violet-400/10 text-violet-400 border-violet-400/20',
  'Pro':         'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20',
  'Gold':        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Silver':      'bg-slate-300/10 text-slate-300 border-slate-300/20',
  'Bronze':      'bg-orange-700/10 text-orange-400 border-orange-700/20',
  'Diamond':     'bg-blue-400/10 text-blue-400 border-blue-400/20',
  'Platinum':    'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20',
  'Institutional':'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Whale':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const RANK_STYLES = {
  1: { bg: 'bg-amber-400/15', text: 'text-amber-400', icon: Crown },
  2: { bg: 'bg-slate-300/10', text: 'text-slate-300', icon: Medal },
  3: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: Medal },
};

export default function Leaderboard() {
  const [cat, setCat] = useState('traders');
  const data = LEADERBOARDS[cat];
  const catInfo = CATEGORIES.find(c => c.id === cat);

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Leaderboards</h1>
        </div>
        <p className="text-[11px] text-slate-500">Rankings refresh every 24 hours · This month</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-4 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                cat === c.id ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
              }`}>
              <Icon className={`w-3 h-3 ${cat === c.id ? 'text-[#00d4aa]' : c.color}`} />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 space-y-2">
        {data.map((entry) => {
          const rankStyle = RANK_STYLES[entry.rank];
          const RankIcon = rankStyle?.icon;
          const badgeStyle = BADGE_STYLES[entry.badge] || 'bg-slate-700/50 text-slate-400 border-slate-700';

          return (
            <div key={entry.rank}
              className={`glass-card rounded-2xl p-3.5 flex items-center gap-3 ${entry.isMe ? 'border border-[#00d4aa]/20' : ''}`}>
              {/* Rank */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${rankStyle ? rankStyle.bg + ' ' + rankStyle.text : 'bg-[#1a2340] text-slate-500'}`}>
                {RankIcon ? <RankIcon className="w-4 h-4" /> : entry.rank}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-xs font-bold ${entry.isMe ? 'text-[#00d4aa]' : 'text-white'}`}>{entry.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${badgeStyle}`}>{entry.badge}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{entry.sub}</p>
              </div>

              {/* Metric */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black text-emerald-400">{entry.metric}</p>
                <p className="text-[10px] text-slate-500">{entry.change}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}