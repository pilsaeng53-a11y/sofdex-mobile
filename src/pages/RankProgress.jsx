import React from 'react';
import { Award, CheckCircle2, Circle, TrendingUp, Users, Zap } from 'lucide-react';

const TIERS = [
  { name: 'Green', badge: '🟢', commission: '10%', color: '#22c55e', border: 'border-emerald-400/20', bg: 'bg-emerald-400/10', minPartners: 1, minVol: 10000, done: true },
  { name: 'Purple', badge: '🟣', commission: '30%', color: '#a855f7', border: 'border-purple-400/20', bg: 'bg-purple-400/10', minPartners: 10, minVol: 100000, done: true },
  { name: 'Gold', badge: '🥇', commission: '40%', color: '#f59e0b', border: 'border-amber-400/20', bg: 'bg-amber-400/10', minPartners: 30, minVol: 500000, done: true, current: true },
  { name: 'Platinum', badge: '💎', commission: '50%', color: '#00d4aa', border: 'border-[#00d4aa]/20', bg: 'bg-[#00d4aa]/10', minPartners: 100, minVol: 2000000, done: false, next: true },
];

const CURRENT_METRICS = {
  partners: 34,
  vol: 2400000,
  activeUsers: 28,
};

function Metric({ label, current, target, color, icon: Icon }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="bg-[#0a0e1a] rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-bold text-white">{typeof current === 'number' && current > 1000 ? `$${(current/1000000).toFixed(1)}M` : current} / {typeof target === 'number' && target > 1000 ? `$${(target/1000000).toFixed(1)}M` : target}</span>
      </div>
      <div className="w-full bg-[#151c2e] rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-right" style={{ color }}>{pct}% complete</p>
    </div>
  );
}

export default function RankProgress() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Rank Progress</h1>
        <p className="text-xs text-slate-400">Track your path to the next tier</p>
      </div>

      {/* Current Rank */}
      <div className="bg-gradient-to-br from-amber-400/15 to-transparent rounded-2xl border border-amber-400/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🥇</span>
          <div>
            <p className="text-base font-black text-white">Gold Distributor</p>
            <p className="text-xs text-amber-400 font-semibold">40% Commission Rate</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">Next: <span className="text-[#00d4aa] font-semibold">Platinum (50% commission)</span></p>
      </div>

      {/* Progress to Platinum */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💎</span>
          <h2 className="text-sm font-semibold text-white">Progress to Platinum</h2>
        </div>
        <div className="space-y-3">
          <Metric label="Direct Partners" current={CURRENT_METRICS.partners} target={100} color="#00d4aa" icon={Users} />
          <Metric label="Team Volume" current={CURRENT_METRICS.vol} target={5000000} color="#9945ff" icon={TrendingUp} />
          <Metric label="Active Users (30d)" current={CURRENT_METRICS.activeUsers} target={60} color="#f59e0b" icon={Zap} />
        </div>
      </div>

      {/* All Tiers */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Tier Roadmap</h2>
        <div className="space-y-3">
          {TIERS.map((tier, i) => (
            <div key={tier.name} className={`flex items-center gap-3 p-3 rounded-xl border ${tier.current ? tier.border + ' ' + tier.bg : tier.done ? 'border-[rgba(148,163,184,0.06)] bg-[#0a0e1a]' : 'border-[rgba(148,163,184,0.04)] opacity-60'}`}>
              <span className="text-2xl">{tier.badge}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{tier.name}</p>
                  {tier.current && <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Current</span>}
                  {tier.next && <span className="text-xs bg-[#00d4aa]/20 text-[#00d4aa] px-2 py-0.5 rounded-full font-semibold">Next</span>}
                </div>
                <p className="text-xs text-slate-500">{tier.minPartners} partners · ${(tier.minVol/1000).toFixed(0)}K volume</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black" style={{ color: tier.color }}>{tier.commission}</p>
                {tier.done ? <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto mt-1" /> : <Circle className="w-4 h-4 text-slate-600 ml-auto mt-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}