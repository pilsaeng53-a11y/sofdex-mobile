import React, { useState } from 'react';
import { Shield, Star, TrendingUp, Clock, Vote, AlertTriangle, Award } from 'lucide-react';

const MY_SCORE = {
  total: 742,
  grade: 'B+',
  gradeColor: 'text-blue-400',
  breakdown: [
    { label: 'Wallet Age', score: 88, max: 100, icon: Clock, color: 'bg-blue-400', desc: 'Wallet active since Mar 2022 (2y 10m)' },
    { label: 'Trading History', score: 74, max: 100, icon: TrendingUp, color: 'bg-[#00d4aa]', desc: '142 trades · 68% win rate · No liquidations' },
    { label: 'Governance', score: 62, max: 100, icon: Vote, color: 'bg-purple-400', desc: 'Voted on 8 of 24 active proposals' },
    { label: 'Risk Behavior', score: 81, max: 100, icon: Shield, color: 'bg-emerald-400', desc: 'Low leverage usage · No red flags' },
  ],
  badges: ['Early Adopter', 'Governance Voter', 'RWA Pioneer'],
};

const LEADERBOARD = [
  { rank: 1, handle: 'CryptoWhale_X',  score: 982, grade: 'S',  gradeColor: 'text-yellow-400' },
  { rank: 2, handle: 'DefiQuant',       score: 941, grade: 'S-', gradeColor: 'text-yellow-400' },
  { rank: 3, handle: 'RWA_Pro',         score: 898, grade: 'A+', gradeColor: 'text-emerald-400' },
  { rank: 4, handle: 'SolanaKing',      score: 854, grade: 'A',  gradeColor: 'text-emerald-400' },
  { rank: 5, handle: 'You',             score: 742, grade: 'B+', gradeColor: 'text-blue-400', isMe: true },
];

const GRADE_SCALE = [
  { grade: 'S', range: '900–1000', color: 'text-yellow-400', desc: 'Elite trader' },
  { grade: 'A', range: '800–899',  color: 'text-emerald-400', desc: 'Advanced' },
  { grade: 'B', range: '700–799',  color: 'text-blue-400',    desc: 'Established' },
  { grade: 'C', range: '500–699',  color: 'text-amber-400',   desc: 'Developing' },
  { grade: 'D', range: '<500',     color: 'text-slate-400',   desc: 'New' },
];

export default function ReputationScore() {
  const [tab, setTab] = useState('My Score');

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Reputation Score</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">On-chain credibility based on wallet behavior</p>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {['My Score', 'Leaderboard', 'How It Works'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'My Score' && (
        <div className="space-y-3">
          {/* Score card */}
          <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-blue-400/15">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-400/5 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-slate-500 font-medium mb-1">Your Reputation Score</p>
                <p className="text-4xl font-black text-white">{MY_SCORE.total}<span className="text-xl text-slate-500">/1000</span></p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                <span className={`text-3xl font-black ${MY_SCORE.gradeColor}`}>{MY_SCORE.grade}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#00d4aa]" style={{ width: `${MY_SCORE.total / 10}%` }} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {MY_SCORE.badges.map((b, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[9px] font-bold text-amber-400">
                  <Award className="w-2.5 h-2.5" />{b}
                </span>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          {MY_SCORE.breakdown.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-bold text-white flex-1">{b.label}</p>
                  <span className="text-sm font-black text-white">{b.score}<span className="text-[10px] text-slate-500">/{b.max}</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.score}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">{b.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'Leaderboard' && (
        <div className="space-y-2.5">
          {LEADERBOARD.map((u, i) => (
            <div key={i} className={`glass-card rounded-2xl p-4 ${u.isMe ? 'border border-blue-400/25' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center">
                  <span className={`text-base font-black ${i < 3 ? ['text-yellow-400','text-slate-300','text-amber-600'][i] : 'text-slate-400'}`}>#{u.rank}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${u.isMe ? 'text-blue-400' : 'text-white'}`}>{u.isMe ? `${u.handle} (You)` : u.handle}</p>
                  <p className="text-[10px] text-slate-500">Score: {u.score} / 1000</p>
                </div>
                <span className={`text-xl font-black ${u.gradeColor}`}>{u.grade}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'How It Works' && (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-3">Score Components</p>
            <div className="space-y-2.5">
              {[
                { label: 'Wallet Age', weight: '25%', desc: 'Older wallets earn more trust' },
                { label: 'Trading History', weight: '30%', desc: 'Win rate, trade count, liquidation history' },
                { label: 'Governance Participation', weight: '20%', desc: 'DAO votes cast and proposals supported' },
                { label: 'Risk Behavior', weight: '25%', desc: 'Leverage usage, drawdown patterns, flagged activity' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-[#00d4aa]">
                    {c.weight}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{c.label}</p>
                    <p className="text-[10px] text-slate-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-2">Grade Scale</p>
            <div className="space-y-1.5">
              {GRADE_SCALE.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-sm font-black w-8 ${g.color}`}>{g.grade}</span>
                  <span className="text-[11px] text-slate-400 flex-1">{g.range}</span>
                  <span className="text-[10px] text-slate-600">{g.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}