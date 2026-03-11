import React, { useState } from 'react';
import { Zap, Lock, Unlock, TrendingUp, Award, Clock } from 'lucide-react';

const STAKING_POOLS = [
  {
    name: 'SOFD Flexible',
    apy: '8.4%',
    locked: false,
    myStaked: '2,500 SOFD',
    rewards: '12.48 SOFD',
    tvl: '$48.2M',
    min: '10 SOFD',
  },
  {
    name: 'SOFD 30-Day Lock',
    apy: '14.2%',
    locked: true,
    duration: '30 days',
    myStaked: '5,000 SOFD',
    rewards: '41.37 SOFD',
    tvl: '$92.4M',
    min: '100 SOFD',
  },
  {
    name: 'SOFD 90-Day Lock',
    apy: '22.8%',
    locked: true,
    duration: '90 days',
    myStaked: '-',
    rewards: '-',
    tvl: '$124.7M',
    min: '500 SOFD',
  },
];

const RWA_YIELD = [
  { name: 'US Treasury Bills', ticker: 'TBILL', apy: '5.12%', risk: 'Low', tvl: '$45.1B', category: 'Treasury' },
  { name: 'NYC Real Estate', ticker: 'RE-NYC', apy: '7.8%', risk: 'Medium', tvl: '$2.1B', category: 'Real Estate' },
  { name: 'Euro Bond Token', ticker: 'EURO-B', apy: '3.8%', risk: 'Low', tvl: '$8.4B', category: 'Bonds' },
  { name: 'Dubai RE Portfolio', ticker: 'RE-DXB', apy: '9.2%', risk: 'Medium', tvl: '$890M', category: 'Real Estate' },
];

const riskColor = { Low: 'text-emerald-400 bg-emerald-400/10', Medium: 'text-amber-400 bg-amber-400/10', High: 'text-red-400 bg-red-400/10' };

export default function Earn() {
  const [tab, setTab] = useState('staking');

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Earn / Staking</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">Grow your holdings with SOFD staking and RWA yield</p>

      {/* My earnings summary */}
      <div className="glass-card rounded-2xl p-4 mb-5 glow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-[11px] text-slate-500 mb-1">Total Staked Value</p>
          <p className="text-2xl font-bold text-white">$18,240.50</p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-[10px] text-slate-500">Earned (30d)</p>
              <p className="text-sm font-bold text-emerald-400">+$312.80</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Blended APY</p>
              <p className="text-sm font-bold text-[#00d4aa]">11.2%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Reward Token</p>
              <p className="text-sm font-bold text-white">SOFD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {['staking', 'rwa yield'].map(t => (
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

      {tab === 'staking' && (
        <div className="space-y-3">
          {STAKING_POOLS.map((pool, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center">
                    {pool.locked ? <Lock className="w-4 h-4 text-[#00d4aa]" /> : <Unlock className="w-4 h-4 text-[#00d4aa]" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{pool.name}</p>
                    {pool.locked
                      ? <p className="text-[10px] text-amber-400">{pool.duration} lock period</p>
                      : <p className="text-[10px] text-emerald-400">Flexible · No lock</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#00d4aa]">{pool.apy}</p>
                  <p className="text-[10px] text-slate-500">APY</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">My Staked</p>
                  <p className="text-xs font-bold text-white">{pool.myStaked}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">Rewards</p>
                  <p className="text-xs font-bold text-emerald-400">{pool.rewards}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2">
                  <p className="text-[10px] text-slate-500">TVL</p>
                  <p className="text-xs font-bold text-white">{pool.tvl}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/20 transition-all">
                  Stake
                </button>
                {pool.myStaked !== '-' && (
                  <button className="flex-1 py-2 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-semibold hover:border-[#00d4aa]/20 transition-all">
                    Unstake
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rwa yield' && (
        <div className="space-y-3">
          {RWA_YIELD.map((rwa, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{rwa.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{rwa.ticker} · {rwa.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">{rwa.apy}</p>
                  <p className="text-[10px] text-slate-500">APY</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] mb-3">
                <span className="text-slate-500">TVL: <span className="text-white font-medium">{rwa.tvl}</span></span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${riskColor[rwa.risk]}`}>{rwa.risk} Risk</span>
              </div>
              <button className="w-full py-2 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/20 transition-all">
                Invest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}