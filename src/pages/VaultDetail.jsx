import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, DollarSign, Shield, BarChart3, Award, CheckCircle2, Zap, PieChart } from 'lucide-react';
import { EXAMPLE_VAULTS, EXAMPLE_STRATEGIES } from '../components/strategies/StrategyExampleData';
import StrategyChart from '../components/strategies/StrategyChart';

const RISK_STYLE = {
  'very-low': { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  'low': { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  'medium': { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  'high': { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

export default function VaultDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vaultId = searchParams.get('id');
  const vault = EXAMPLE_VAULTS.find(v => v.id === vaultId) || EXAMPLE_VAULTS[0];
  const [investAmount, setInvestAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const includedStrategies = EXAMPLE_STRATEGIES.filter(s => vault.strategies?.includes(s.id));
  const estTokens = investAmount ? (parseFloat(investAmount) / vault.tokenPrice).toFixed(4) : '0';
  const estReturn = investAmount ? ((parseFloat(investAmount) * (vault.roi30d || 18) / 100)).toFixed(2) : '0';
  const rs = RISK_STYLE[vault.risk] || RISK_STYLE.medium;

  const handleInvest = () => {
    if (!investAmount || parseFloat(investAmount) < vault.minInvestment) return;
    navigate('/Payment?vault=' + vault.id + '&amount=' + investAmount);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-8">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-4 pb-5 border-b border-[rgba(148,163,184,0.06)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 via-transparent to-[#8b5cf6]/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${rs.text} ${rs.bg} ${rs.border}`}>
              {vault.risk?.replace('-', ' ')?.toUpperCase()} RISK
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6]">
              {vault.tokenSymbol}
            </span>
          </div>
          <h1 className="text-xl font-black text-white mb-1">{vault.name}</h1>
          <p className="text-sm text-slate-400 mb-3">{vault.description?.slice(0, 80)}...</p>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">AUM</p>
              <p className="text-sm font-black text-white">${(vault.aum / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Investors</p>
              <p className="text-sm font-black text-[#00d4aa]">{vault.investors}</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">30D ROI</p>
              <p className="text-sm font-black text-emerald-400">+{vault.roi30d || 18}%</p>
            </div>
            <div className="bg-[#151c2e]/80 rounded-xl p-2.5 border border-[rgba(148,163,184,0.06)] text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Strategies</p>
              <p className="text-sm font-black text-blue-400">{vault.strategies?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Panel */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00d4aa]/8 to-[#3b82f6]/5 rounded-2xl border border-[#00d4aa]/20 p-4 mb-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4aa]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-white mb-3">Invest in {vault.name}</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 mb-1.5">Investment Amount (USDC)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder={`Min $${vault.minInvestment}`}
                    className="flex-1 px-3.5 py-2.5 bg-[#0d1220] border border-[rgba(148,163,184,0.1)] rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-[#00d4aa]/30 transition-colors"
                  />
                  <div className="flex gap-1">
                    {['500', '1000', '5000'].map(amt => (
                      <button key={amt} onClick={() => setInvestAmount(amt)}
                        className="px-2 py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-[10px] font-bold text-slate-400 hover:text-[#00d4aa] hover:border-[#00d4aa]/20 transition-all">
                        ${amt === '1000' ? '1K' : amt === '5000' ? '5K' : amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1220] rounded-xl p-3 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <p className="text-slate-500">Token Price</p>
                  <p className="text-white font-semibold">${vault.tokenPrice?.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-500">Tokens You'll Receive</p>
                  <p className="text-[#00d4aa] font-black">{estTokens} {vault.tokenSymbol}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-500">Expected Monthly Return</p>
                  <p className="text-emerald-400 font-bold">+${estReturn}</p>
                </div>
                <div className="border-t border-[rgba(148,163,184,0.06)] pt-2 flex justify-between">
                  <p className="text-slate-500">Your Vault Share</p>
                  <p className="text-white font-semibold">{investAmount ? ((parseFloat(investAmount) / vault.aum) * 100).toFixed(4) : '0'}%</p>
                </div>
              </div>

              <button
                onClick={handleInvest}
                disabled={!investAmount || parseFloat(investAmount) < vault.minInvestment}
                className="w-full px-4 py-3.5 bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-[#0a0e1a] font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20">
                <TrendingUp className="w-4 h-4" />
                Invest Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          {['overview', 'performance', 'strategies', 'distribution', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
                  : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'overview' && (
            <>
              <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                <p className="text-sm font-bold text-white mb-2">Vault Overview</p>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{vault.description}</p>
                <div className="border-t border-[rgba(148,163,184,0.06)] pt-3 space-y-2.5">
                  <div className="flex justify-between">
                    <p className="text-[10px] text-slate-500">Strategy Style</p>
                    <p className="text-[11px] text-white font-semibold">{vault.targetStyle}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[10px] text-slate-500">Ideal For</p>
                    <p className="text-[11px] text-white font-semibold">{vault.expectedInvestors}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[10px] text-slate-500">Min Investment</p>
                    <p className="text-[11px] text-[#00d4aa] font-bold">${vault.minInvestment}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'All-time ROI', value: '+142%', icon: TrendingUp, color: '#00d4aa' },
                  { label: 'Sharpe Ratio', value: '2.38', icon: Award, color: '#3b82f6' },
                  { label: 'Max Drawdown', value: '-8.2%', icon: Shield, color: '#ef4444' },
                  { label: 'Volatility', value: 'Low', icon: BarChart3, color: '#8b5cf6' },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.06)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                        <p className="text-[10px] text-slate-500">{m.label}</p>
                      </div>
                      <p className="text-base font-black text-white">{m.value}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'performance' && (
            <>
              <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                <p className="text-sm font-bold text-white mb-3">30-Day Performance</p>
                <StrategyChart data={vault.performanceData?.weekly} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '7D ROI', value: '+6.4%', color: 'text-emerald-400' },
                  { label: '30D ROI', value: `+${vault.roi30d || 18}%`, color: 'text-emerald-400' },
                  { label: '90D ROI', value: '+52%', color: 'text-emerald-400' },
                ].map((m, i) => (
                  <div key={i} className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.06)] text-center">
                    <p className="text-[9px] text-slate-500 mb-1">{m.label}</p>
                    <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-3">
              {includedStrategies.map(strat => (
                <div key={strat.id} className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{strat.name}</p>
                      <p className="text-[10px] text-slate-500">by {strat.creator}</p>
                    </div>
                    <p className="text-base font-black text-emerald-400">+{strat.roi30d}%</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-[#0d1220] rounded-lg p-2 text-center">
                      <p className="text-slate-600">Win Rate</p>
                      <p className="text-white font-bold">{strat.winRate}%</p>
                    </div>
                    <div className="bg-[#0d1220] rounded-lg p-2 text-center">
                      <p className="text-slate-600">Drawdown</p>
                      <p className="text-red-400 font-bold">{strat.maxDrawdown}%</p>
                    </div>
                    <div className="bg-[#0d1220] rounded-lg p-2 text-center">
                      <p className="text-slate-600">Risk</p>
                      <p className="text-amber-400 font-bold capitalize">{strat.risk}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-3">
              <div className="bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                <p className="text-sm font-bold text-white mb-3">Profit Distribution</p>
                {[
                  { label: 'Investors', pct: vault.investorShare || 75, color: '#00d4aa', desc: 'Distributed weekly to token holders' },
                  { label: 'Vault Creator', pct: vault.creatorShare || 20, color: '#3b82f6', desc: 'Performance fee for strategy creator' },
                  { label: 'Platform', pct: vault.exchangeShare || 5, color: '#8b5cf6', desc: 'Protocol maintenance fee' },
                ].map((item, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-600">{item.desc}</p>
                      </div>
                      <p className="text-base font-black" style={{ color: item.color }}>{item.pct}%</p>
                    </div>
                    <div className="h-2.5 bg-[#0d1220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/15 rounded-xl p-3">
                <p className="text-[10px] text-[#00d4aa] font-bold mb-1">💸 Distribution Schedule</p>
                <p className="text-[10px] text-slate-500">Profits are distributed every Friday at 00:00 UTC to all token holders proportional to their holdings.</p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-2">
              {vault.recentTrades?.map((trade, i) => (
                <div key={i} className="bg-[#151c2e] rounded-xl p-3.5 border border-[rgba(148,163,184,0.06)]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{trade.type}</p>
                    <p className="text-sm font-black text-emerald-400">+${trade.profit}</p>
                  </div>
                  <p className="text-[11px] text-slate-500">{trade.action}</p>
                  <p className="text-[10px] text-slate-700 mt-1">{trade.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}