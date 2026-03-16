import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, ChevronRight } from 'lucide-react';
import { EXAMPLE_VAULTS } from '../components/strategies/StrategyExampleData';

export default function StrategyVaults() {
  const [sortBy, setSortBy] = useState('aum');
  const [filterRisk, setFilterRisk] = useState('all');

  const riskColor = {
    'very-low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'high': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const filtered = EXAMPLE_VAULTS.filter(v =>
    filterRisk === 'all' || v.risk === filterRisk
  ).sort((a, b) => {
    if (sortBy === 'aum') return b.aum - a.aum;
    if (sortBy === 'roi') return b.roi30d - a.roi30d;
    if (sortBy === 'investors') return b.investors - a.investors;
    return 0;
  });

  const totalAUM = EXAMPLE_VAULTS.reduce((sum, v) => sum + v.aum, 0);
  const totalInvestors = EXAMPLE_VAULTS.reduce((sum, v) => sum + v.investors, 0);

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
        <div>
          <h1 className="text-xl font-bold text-white">Strategy Vaults</h1>
          <p className="text-xs text-slate-500">Invest in professionally managed strategy portfolios</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-white">${(totalAUM / 1000000).toFixed(1)}M</p>
          <p className="text-[9px] text-slate-500 mt-1">Total AUM</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-white">{totalInvestors}</p>
          <p className="text-[9px] text-slate-500 mt-1">Investors</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-emerald-400">+18.5%</p>
          <p className="text-[9px] text-slate-500 mt-1">Avg 30D ROI</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['all', 'very-low', 'low', 'medium'].map(risk => (
          <button key={risk} onClick={() => setFilterRisk(risk)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              filterRisk === risk ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-[rgba(148,163,184,0.08)] bg-[#151c2e]'
            }`}>
            {risk === 'all' ? 'All' : risk.replace('-', ' ').toUpperCase()}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 outline-none">
          <option value="aum">By AUM</option>
          <option value="roi">By ROI</option>
          <option value="investors">By Investors</option>
        </select>
      </div>

      {/* Vault Cards */}
      <div className="space-y-3">
        {filtered.map(vault => (
          <Link key={vault.id} to={`/VaultDetail?id=${vault.id}`}>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">{vault.name}</h3>
                  <p className="text-[10px] text-slate-500">Token: {vault.tokenSymbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-white">${(vault.aum / 1000000).toFixed(1)}M</p>
                  <p className="text-[9px] text-slate-500">AUM</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">30D ROI</p>
                  <p className="text-[11px] font-bold text-emerald-400">+{vault.roi30d.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Investors</p>
                  <p className="text-[11px] font-bold text-white">{vault.investors}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Price</p>
                  <p className="text-[11px] font-bold text-[#00d4aa]">${vault.tokenPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Risk & Button */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${riskColor[vault.risk]}`}>
                  {vault.risk.replace('-', ' ').toUpperCase()}
                </span>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-[11px] font-semibold rounded-lg hover:bg-[#00d4aa]/20 transition-all">
                  Invest
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}