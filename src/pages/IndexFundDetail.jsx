import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { EXAMPLE_INDEX_FUNDS, EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import StrategyChart from '../components/strategies/StrategyChart';

export default function IndexFundDetail() {
  const [searchParams] = useSearchParams();
  const fundId = searchParams.get('id');
  const fund = EXAMPLE_INDEX_FUNDS.find(f => f.id === fundId) || EXAMPLE_INDEX_FUNDS[0];

  const includedStrategies = EXAMPLE_STRATEGIES.filter(s => fund.included.includes(s.id));

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{fund.name}</h1>
        <p className="text-sm text-slate-400">Token: {fund.tokenSymbol}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[11px] text-slate-500">${(fund.aum / 1000000).toFixed(1)}M AUM</span>
          <span className="text-[11px] text-slate-500">{fund.investors} Investors</span>
          <span className="text-[11px] text-emerald-400 font-semibold">+{fund.roi30d.toFixed(1)}%</span>
        </div>
      </div>

      {/* Overview */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-2">Overview</p>
        <p className="text-[11px] text-slate-300">{fund.description}</p>
      </div>

      {/* Performance Chart */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">30-Day Performance</p>
        <StrategyChart data={[8.2, 12.4, 15.8, 18.3, 21.2, 19.8, 22.1]} />
      </div>

      {/* Allocation Breakdown */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Allocation Breakdown</p>
        <div className="space-y-3">
          {fund.allocation.map((alloc, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white font-semibold">{alloc.name}</p>
                <p className="text-[11px] font-bold text-[#00d4aa]">{alloc.pct}%</p>
              </div>
              <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]" style={{ width: alloc.pct + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Included Strategies Details */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Included Strategies</p>
        <div className="space-y-2">
          {includedStrategies.map((strategy, i) => (
            <div key={i} className="bg-[#0d1220] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-white">{strategy.name}</p>
                <p className="text-[10px] font-bold text-emerald-400">+{strategy.roi30d.toFixed(1)}%</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[9px]">
                <div className="text-slate-500">Win Rate: <span className="text-white">{strategy.winRate}%</span></div>
                <div className="text-slate-500">by <span className="text-white">{strategy.creator}</span></div>
                <div className="text-slate-500">{strategy.followers} followers</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Profile */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
        <p className="text-sm font-bold text-white mb-3">Risk Profile</p>
        <div className="text-[11px] text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <p>Risk Level</p>
            <p className="font-bold text-amber-400">{fund.risk.replace('-', ' ').toUpperCase()}</p>
          </div>
          <p className="text-[10px]">This index combines multiple strategies to provide diversification and reduce single-strategy risk. Suitable for investors seeking balanced exposure.</p>
        </div>
      </div>
    </div>
  );
}