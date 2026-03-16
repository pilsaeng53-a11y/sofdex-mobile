import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { EXAMPLE_VAULTS, EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import StrategyChart from '../components/strategies/StrategyChart';

export default function VaultDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vaultId = searchParams.get('id');
  const vault = EXAMPLE_VAULTS.find(v => v.id === vaultId) || EXAMPLE_VAULTS[0];
  const [investAmount, setInvestAmount] = useState('');

  const includedStrategies = EXAMPLE_STRATEGIES.filter(s => vault.strategies.includes(s.id));
  const estTokens = investAmount ? (parseFloat(investAmount) / vault.tokenPrice).toFixed(4) : '0';

  const riskColor = {
    'very-low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'high': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const handleInvest = () => {
    navigate('/Payment?vault=' + vault.id + '&amount=' + investAmount);
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{vault.name}</h1>
        <p className="text-sm text-slate-400">Token: {vault.tokenSymbol}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${riskColor[vault.risk]}`}>
            {vault.risk.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-500">${(vault.aum / 1000000).toFixed(1)}M AUM</span>
          <span className="text-[11px] text-slate-500">{vault.investors} investors</span>
        </div>
      </div>

      {/* Investment Panel */}
      <div className="glass-card rounded-2xl p-4 border border-[#00d4aa]/20 bg-[#00d4aa]/5 mb-6">
        <p className="text-sm font-bold text-white mb-3">Invest in {vault.name}</p>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Investment Amount (USDC)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-2 bg-[#0d1220] border border-[rgba(148,163,184,0.08)] rounded-lg text-white text-sm placeholder-slate-500 outline-none"
              />
              <span className="text-[11px] text-slate-500">min: ${vault.minInvestment}</span>
            </div>
          </div>

          <div className="bg-[#0d1220] rounded-lg p-3 space-y-2 text-[10px]">
            <div className="flex justify-between">
              <p className="text-slate-500">Vault Token Price</p>
              <p className="text-white font-semibold">${vault.tokenPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Estimated Tokens You'll Receive</p>
              <p className="text-[#00d4aa] font-bold">{estTokens} {vault.tokenSymbol}</p>
            </div>
            <div className="border-t border-[rgba(148,163,184,0.08)] pt-2 mt-2 flex justify-between">
              <p className="text-slate-500">Estimated Share</p>
              <p className="text-white font-semibold">{investAmount ? ((parseFloat(investAmount) / vault.aum) * 100).toFixed(3) : '0'}%</p>
            </div>
          </div>

          <button
            onClick={handleInvest}
            disabled={!investAmount || parseFloat(investAmount) < vault.minInvestment}
            className="w-full px-4 py-3 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] font-semibold rounded-lg hover:bg-[#00d4aa]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Invest Now
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-2">Vault Overview</p>
        <p className="text-[11px] text-slate-300 mb-3">{vault.description}</p>
        <div className="border-t border-[rgba(148,163,184,0.08)] pt-3 space-y-2 text-[10px]">
          <div><p className="text-slate-500">Strategy Style</p><p className="text-white">{vault.targetStyle}</p></div>
          <div><p className="text-slate-500">Ideal For</p><p className="text-white">{vault.expectedInvestors}</p></div>
          <div><p className="text-slate-500">Overview</p><p className="text-white">{vault.overview}</p></div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">30-Day Performance</p>
        <StrategyChart data={vault.performanceData.weekly} />
      </div>

      {/* Profit Distribution */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Profit Distribution</p>
        <div className="space-y-2">
          {[
            { label: 'Investors', pct: vault.investorShare, color: 'emerald' },
            { label: 'Vault Creator', pct: vault.creatorShare, color: 'blue' },
            { label: 'Exchange', pct: vault.exchangeShare, color: 'slate' }
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1 text-[10px]">
                <p className="text-slate-500">{item.label}</p>
                <p className="text-white font-semibold">{item.pct}%</p>
              </div>
              <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${item.color}-500`}
                  style={{ width: item.pct + '%', backgroundColor: item.color === 'emerald' ? '#22c55e' : item.color === 'blue' ? '#3b82f6' : '#64748b' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Included Strategies */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Included Strategies</p>
        <div className="space-y-2">
          {includedStrategies.map(strat => (
            <div key={strat.id} className="bg-[#0d1220] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-white">{strat.name}</p>
                <p className="text-[10px] font-bold text-emerald-400">+{strat.roi30d}%</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
                <div>Win Rate: <span className="text-white">{strat.winRate}%</span></div>
                <div>By: <span className="text-white">{strat.creator}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
        <p className="text-sm font-bold text-white mb-3">Recent Activity</p>
        <div className="space-y-2">
          {vault.recentTrades.map((trade, i) => (
            <div key={i} className="bg-[#0d1220] rounded-xl p-3 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-semibold">{trade.type}</p>
                <p className="text-emerald-400 font-bold">+${trade.profit}</p>
              </div>
              <p className="text-slate-500">{trade.action}</p>
              <p className="text-slate-600 text-[9px] mt-1">{trade.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}