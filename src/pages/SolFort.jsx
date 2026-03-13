import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  TrendingUp, Zap, Shield, Globe, BarChart3, Users,
  ArrowUpRight, ExternalLink, Copy, Check, ChevronRight, Layers
} from 'lucide-react';

const SOF_STATS = [
  { label: 'Token Price',    value: '$0.0842',  change: '+12.4%',  positive: true },
  { label: 'Market Cap',    value: '$84.2M',   change: '+8.1%',   positive: true },
  { label: 'Total Supply',  value: '1B SOF',   change: null,       positive: null },
  { label: '24h Volume',    value: '$3.2M',    change: '+34.5%',  positive: true },
];

const PLATFORM_FEATURES = [
  { icon: BarChart3, color: '#00d4aa', title: 'Multi-Asset DEX',       desc: 'Trade crypto, RWA, tokenized equities and commodities on a single platform.' },
  { icon: Layers,    color: '#9945FF', title: 'RWA Tokenization',      desc: 'Real-world assets bridged onto Solana with institutional-grade custody.' },
  { icon: Shield,    color: '#06b6d4', title: 'On-Chain Governance',   desc: 'SOF holders vote on protocol upgrades, fee structures and treasury allocation.' },
  { icon: Zap,       color: '#F7931A', title: 'Ultra-Low Fees',        desc: 'Powered by Solana\'s 65,000 TPS for sub-cent settlement finality.' },
  { icon: Globe,     color: '#22c55e', title: 'Global Liquidity',      desc: 'Deep liquidity pools with concentrated AMM and integrated order books.' },
  { icon: Users,     color: '#8B5CF6', title: 'Social Trading',        desc: 'Copy top traders, join leaderboards, and earn referral rewards.' },
];

const TOKENOMICS = [
  { label: 'Ecosystem & Rewards',  pct: 35, color: '#00d4aa' },
  { label: 'Team & Advisors',      pct: 15, color: '#9945FF' },
  { label: 'Public Sale',          pct: 20, color: '#06b6d4' },
  { label: 'Treasury / DAO',       pct: 15, color: '#F7931A' },
  { label: 'Liquidity Provision',  pct: 10, color: '#22c55e' },
  { label: 'Strategic Partners',   pct: 5,  color: '#8B5CF6' },
];

const REVENUE_ITEMS = [
  { icon: '💰', pct: '40%', label: 'SOF Staker Rewards',      desc: 'Distributed proportionally to staked SOF holders every epoch.' },
  { icon: '🏦', pct: '30%', label: 'Protocol Treasury',       desc: 'Funds development, security audits, and ecosystem grants.' },
  { icon: '🔥', pct: '20%', label: 'Token Buyback & Burn',    desc: 'Deflationary pressure via market buybacks and scheduled burns.' },
  { icon: '🌐', pct: '10%', label: 'Liquidity Incentives',    desc: 'Reward LPs providing depth across key trading pairs.' },
];

const CONTRACT = '4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3';
const RAYDIUM_URL = `https://raydium.io/swap/?inputMint=4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`;

export default function SolFort() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('platform');

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0d1a2e] to-[#0a0e1a]" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(153,69,255,0.18) 0%, transparent 70%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,212,170,0.1) 0%, transparent 60%)',
        }} />

        <div className="relative px-4 pt-8 pb-6">
          {/* Emblem */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#9945FF] via-[#00d4aa] to-[#06b6d4] p-0.5 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(153,69,255,0.4), 0 0 30px rgba(0,212,170,0.3)' }}>
                <div className="w-full h-full rounded-3xl bg-[#0d1220] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-black text-white tracking-tighter leading-none">SF</p>
                    <p className="text-[8px] font-bold text-[#00d4aa] tracking-[0.2em] mt-0.5">SOLFORT</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#9945FF] flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#9945FF]/15 border border-[#9945FF]/30 text-[10px] font-bold text-[#9945FF] tracking-wider">BUILT ON SOLANA</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[10px] font-bold text-[#00d4aa] tracking-wider">LIVE</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight mb-2">
              The Next-Gen<br />
              <span style={{ background: 'linear-gradient(135deg, #9945FF, #00d4aa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Multi Asset Platform
              </span><br />
              of Solana
            </h1>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              Trade crypto, tokenized real-world assets, and earn yield — all in one decentralized exchange.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center mb-6">
            <Link to={createPageUrl('Swap')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00d4aa] text-white text-sm font-bold hover:opacity-90 transition-all active:scale-95">
              <Zap className="w-3.5 h-3.5" />
              Trade SOF
            </Link>
            <a
              href={RAYDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(153,69,255,0.3)] text-slate-300 text-sm font-semibold hover:border-[#9945FF]/50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Raydium
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {SOF_STATS.map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-3 border border-[rgba(148,163,184,0.04)]">
                <p className="text-[10px] text-slate-500 mb-1">{stat.label}</p>
                <p className="text-sm font-bold text-white">{stat.value}</p>
                {stat.change && (
                  <p className={`text-[10px] font-semibold ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chart Entry */}
      <div className="mx-4 mt-2">
        <a
          href={RAYDIUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block glass-card rounded-2xl overflow-hidden border border-[rgba(153,69,255,0.2)] hover:border-[#9945FF]/40 transition-all group"
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#9945FF]/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#9945FF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">View Live Chart</p>
                <p className="text-[10px] text-slate-500">SOF/USDT • Raydium DEX • Real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ArrowUpRight className="w-4 h-4 text-[#9945FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
          {/* Fake sparkline */}
          <div className="px-4 pb-3">
            <svg viewBox="0 0 300 40" className="w-full h-8" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="100%" stopColor="#00d4aa" />
                </linearGradient>
              </defs>
              <polyline
                points="0,30 30,25 60,28 90,18 120,22 150,12 180,16 210,8 240,11 270,5 300,3"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </a>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 px-4 mt-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { key: 'platform', label: 'SolFort' },
          { key: 'token',    label: '$SOF Token' },
          { key: 'revenue',  label: 'Revenue' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSection === s.key
                ? 'bg-[#9945FF]/15 text-[#9945FF] border border-[#9945FF]/30'
                : 'text-slate-500 border border-transparent hover:text-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Platform Section */}
      {activeSection === 'platform' && (
        <div className="px-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Platform Features</p>
          {PLATFORM_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-4 flex items-start gap-3.5 border border-[rgba(148,163,184,0.04)]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{f.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Token Section */}
      {activeSection === 'token' && (
        <div className="px-4 space-y-4">
          {/* Contract */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(153,69,255,0.1)]">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Contract Address</p>
            <div className="flex items-center gap-2 bg-[#0d1220] rounded-xl px-3 py-2.5 border border-[rgba(148,163,184,0.06)]">
              <p className="text-[10px] text-[#9945FF] font-mono flex-1 truncate">{CONTRACT}</p>
              <button onClick={handleCopy} className="flex-shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />}
              </button>
            </div>
          </div>

          {/* Tokenomics */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-4">Tokenomics — 1,000,000,000 SOF</p>
            <div className="space-y-3">
              {TOKENOMICS.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-slate-400">{item.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#151c2e] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utility */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">$SOF Utility</p>
            {[
              ['Governance', 'Vote on protocol proposals and treasury decisions.'],
              ['Fee Discounts', 'Hold SOF for up to 50% trading fee reduction.'],
              ['Staking Rewards', 'Earn protocol revenue by staking SOF.'],
              ['Launchpad Access', 'Priority allocation in new RWA and token launches.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-2.5 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0">
                <ChevronRight className="w-3.5 h-3.5 text-[#9945FF] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-300">{title}</p>
                  <p className="text-[10px] text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Section */}
      {activeSection === 'revenue' && (
        <div className="px-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Revenue Distribution</p>
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)] mb-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              100% of protocol fees generated by SOFDex — trading fees, swap fees, RWA settlement fees — are distributed on-chain according to the following allocation:
            </p>
          </div>
          {REVENUE_ITEMS.map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex items-start gap-3.5 border border-[rgba(148,163,184,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#151c2e] flex items-center justify-center flex-shrink-0 text-lg">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <span className="text-sm font-black text-[#9945FF]">{item.pct}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Revenue visual */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)] mt-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Distribution Chart</p>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              {REVENUE_ITEMS.map((item, i) => (
                <div key={i} title={`${item.label} ${item.pct}`}
                  className="h-full transition-all"
                  style={{ width: item.pct, background: ['#00d4aa','#3B82F6','#F7931A','#22c55e'][i], boxShadow: `0 0 8px ${['#00d4aa','#3B82F6','#F7931A','#22c55e'][i]}50` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {REVENUE_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ['#00d4aa','#3B82F6','#F7931A','#22c55e'][i] }} />
                  <span className="text-[10px] text-slate-500 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mx-4 mt-6 space-y-3">
        <a
          href={RAYDIUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-[#9945FF]/30 bg-[#9945FF]/10 text-[#9945FF] font-bold text-sm hover:bg-[#9945FF]/15 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Buy SOF on Raydium
        </a>
        <Link
          to={createPageUrl('Swap')}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9945FF] to-[#00d4aa] text-white font-bold text-sm hover:opacity-90 transition-all"
        >
          <Zap className="w-4 h-4" />
          Swap SOF Now
        </Link>
      </div>
    </div>
  );
}