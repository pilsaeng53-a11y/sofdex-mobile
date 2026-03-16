import React from 'react';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { EXAMPLE_VAULTS } from '../components/strategies/StrategyExampleData';

export default function MyStrategyInvestments() {
  // Example investor data
  const investments = [
    { vaultId: 'vault-1', vaultName: 'AlphaQuant Vault', tokenSymbol: 'AQV', tokens: 850.45, tokenPrice: 1.24, value: 1054.56, roi: 18.4, allocation: 15 },
    { vaultId: 'vault-2', vaultName: 'RWA Income Vault', tokenSymbol: 'RIV', tokens: 2150, tokenPrice: 1.08, value: 2322, roi: 12.3, allocation: 30 },
    { vaultId: 'vault-3', vaultName: 'Momentum Growth Vault', tokenSymbol: 'MGV', tokens: 320.15, tokenPrice: 2.18, value: 697.93, roi: 28.5, allocation: 40 },
    { vaultId: 'vault-4', vaultName: 'Defensive Hedge Vault', tokenSymbol: 'DHV', tokens: 3200, tokenPrice: 1.02, value: 3264, roi: 8.2, allocation: 15 },
  ];

  const totalInvested = investments.reduce((sum, i) => sum + i.value, 0);
  const totalROI = (investments.reduce((sum, i) => sum + (i.value * i.roi / 100), 0) / totalInvested * 100).toFixed(1);
  const totalDistributed = (totalInvested * 0.12).toFixed(2); // 12% distributed

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-[#00d4aa]" />
        <div>
          <h1 className="text-xl font-bold text-white">My Strategy Investments</h1>
          <p className="text-xs text-slate-500">Monitor your vault investments and earnings</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Current Value</p>
          <p className="text-2xl font-bold text-emerald-400">${(totalInvested * (1 + parseFloat(totalROI) / 100)).toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Portfolio ROI</p>
          <p className="text-2xl font-bold text-emerald-400">+{totalROI}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Distributed</p>
          <p className="text-2xl font-bold text-[#00d4aa]">${totalDistributed}</p>
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-6">
        <p className="text-sm font-bold text-white mb-3">Portfolio Allocation</p>
        <div className="space-y-3">
          {investments.map((inv, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white font-semibold">{inv.vaultName}</p>
                <p className="text-[11px] font-bold text-[#00d4aa]">{inv.allocation}%</p>
              </div>
              <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]" style={{ width: inv.allocation + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investments */}
      <div className="space-y-3 mb-6">
        {investments.map((inv, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{inv.vaultName}</h3>
                <p className="text-[10px] text-slate-500">{inv.tokens.toFixed(2)} {inv.tokenSymbol} @ ${inv.tokenPrice.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-bold text-white">${inv.value.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">+{inv.roi}%</p>
              </div>
            </div>

            <div className="bg-[#0d1220] rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-[10px]">
                <p className="text-slate-500">Invested Value</p>
                <p className="text-white font-semibold">${inv.value.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-[10px]">
                <p className="text-slate-500">Profit</p>
                <p className="text-emerald-400 font-semibold">+${(inv.value * inv.roi / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-[10px]">
                <p className="text-slate-500">Distributions Received</p>
                <p className="text-[#00d4aa] font-semibold">${(inv.value * 0.12).toFixed(2)}</p>
              </div>
            </div>

            <button className="w-full mt-3 px-3 py-2 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 text-[11px] font-semibold rounded-lg hover:border-[#00d4aa]/30 transition-all">
              View Vault Details
            </button>
          </div>
        ))}
      </div>

      {/* Recent Distributions */}
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
        <p className="text-sm font-bold text-white mb-3">Recent Distributions</p>
        <div className="space-y-2">
          {[
            { date: '2 hours ago', vault: 'Momentum Growth Vault', amount: 42.50, type: 'Performance' },
            { date: '1 day ago', vault: 'AlphaQuant Vault', amount: 18.30, type: 'Trading Fee' },
            { date: '3 days ago', vault: 'RWA Income Vault', amount: 156.80, type: 'Yield' },
            { date: '1 week ago', vault: 'Defensive Hedge Vault', amount: 32.10, type: 'Yield' },
          ].map((dist, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.06)] last:border-0">
              <div>
                <p className="text-[11px] text-white font-semibold">{dist.vault}</p>
                <p className="text-[9px] text-slate-500">{dist.type} • {dist.date}</p>
              </div>
              <p className="text-[11px] font-bold text-emerald-400">+${dist.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}