import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Zap, TrendingUp, Users, Gift, Rocket, Lock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { HOT_INSTRUMENTS, BONUS_PROMOTIONS, ACCOUNT_TYPES } from '@/data/futuresTradingAssets';

export default function FuturesDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Markets', icon: '📊' },
    { id: 'forex', label: 'Forex', icon: '💱' },
    { id: 'commodities', label: 'Commodities', icon: '⛽' },
    { id: 'indices', label: 'Indices', icon: '📈' },
    { id: 'stocks', label: 'Stocks', icon: '🏢' },
    { id: 'crypto', label: 'Crypto Perps', icon: '₿' },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4aa] via-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">
          Futures Trading
        </h1>
        <p className="text-sm text-slate-400">
          Professional MT5-style trading with broker-grade instruments
        </p>
      </div>

      {/* Promotion Banner */}
      <div className="relative rounded-2xl overflow-hidden p-5 glass-card border border-[#00d4aa]/20 bg-gradient-to-br from-[#00d4aa]/10 to-transparent">
        <div className="absolute top-2 right-2">
          <Gift className="w-5 h-5 text-[#00d4aa]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1">50% Welcome Bonus</h3>
          <p className="text-xs text-slate-400 mb-3">
            Deposit $100+ and receive a 50% trading bonus (up to $5,000)
          </p>
          <Link to={createPageUrl('FuturesTrade')}>
            <button className="w-full bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-bold py-2 rounded-lg transition-all">
              Start Trading Now →
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link to={createPageUrl('FuturesTrade')}>
          <button className="w-full glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <Zap className="w-5 h-5 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-white">Trade</span>
          </button>
        </Link>
        <Link to={createPageUrl('FuturesAccountTypes')}>
          <button className="w-full glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <Rocket className="w-5 h-5 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-white">Account Types</span>
          </button>
        </Link>
        <Link to={createPageUrl('FuturesSalesPartner')}>
          <button className="w-full glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <Users className="w-5 h-5 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-white">Sales Partner</span>
          </button>
        </Link>
        <Link to={createPageUrl('FuturesReferral')}>
          <button className="w-full glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <Gift className="w-5 h-5 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-white">Referral</span>
          </button>
        </Link>
        <Link to={createPageUrl('PartnerHubNew')}>
          <button className="w-full glass-card hover:border-[#8b5cf6]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
            <span className="text-xs font-semibold text-white">Partner Hub</span>
          </button>
        </Link>
        <Link to={createPageUrl('SalesDashboard')}>
          <button className="w-full glass-card hover:border-[#f59e0b]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
            <ArrowUpRight className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-xs font-semibold text-white">Sales Dashboard</span>
          </button>
        </Link>
      </div>

      {/* Hot Instruments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🔥 Hot Instruments</h3>
          <Link to={createPageUrl('FuturesMarketWatch')}>
            <button className="text-[10px] text-[#00d4aa] hover:text-[#00d4aa]/80 font-semibold">See All →</button>
          </Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {HOT_INSTRUMENTS.map((instr) => (
            <div key={instr.symbol} className="p-3 flex items-center justify-between hover:bg-[#151c2e] transition-all">
              <div>
                <p className="text-xs font-bold text-white">{instr.symbol}</p>
                <p className="text-[9px] text-slate-500">Vol: ${(instr.volume / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${instr.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {instr.change > 0 ? '+' : ''}{instr.change.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Categories */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Trading Categories</h3>

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`glass-card rounded-lg p-3 text-center transition-all ${
                selectedCategory === cat.id
                  ? 'border-[#00d4aa]/40 bg-[#00d4aa]/10'
                  : 'hover:border-[#00d4aa]/20'
              }`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <p className="text-[10px] font-semibold text-white">{cat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Account Types Overview */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Account Types Comparison</h3>

        <div className="space-y-2">
          {Object.values(ACCOUNT_TYPES).map((account) => (
            <div
              key={account.id}
              className={`rounded-xl p-3 glass-card border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{account.icon}</span>
                    <p className="font-bold text-white text-sm">{account.name}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">{account.description}</p>
                  <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-400">
                    <span>Spread: {(account.features.spread_multiplier * 100).toFixed(0)}%</span>
                    <span>Leverage: 1:{account.features.max_leverage}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        <Link to={createPageUrl('FuturesAccountTypes')}>
          <button className="w-full bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-bold py-2.5 rounded-lg transition-all">
            View Full Comparison
          </button>
        </Link>
      </div>

      {/* Featured Promotions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Active Promotions</h3>

        <div className="space-y-2">
          {BONUS_PROMOTIONS.map((promo) => (
            <div key={promo.id} className="rounded-xl p-3 glass-card border border-[#8b5cf6]/20 bg-gradient-to-r from-[#8b5cf6]/10 to-transparent">
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-white">{promo.title}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{promo.description}</p>
                  <p className="text-[8px] text-slate-500 mt-1">{promo.requirement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Trading Pairs</p>
          <p className="text-xl font-bold text-[#00d4aa]">50+</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Max Leverage</p>
          <p className="text-xl font-bold text-[#00d4aa]">1:100</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Daily Volume</p>
          <p className="text-xl font-bold text-[#00d4aa]">$2.5B</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-2">
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#00d4aa] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Secure & Regulated</p>
              <p className="text-[9px] text-slate-400">Professional-grade trading infrastructure</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-[#00d4aa] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Real-Time Execution</p>
              <p className="text-[9px] text-slate-400">Instant order processing with competitive spreads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}