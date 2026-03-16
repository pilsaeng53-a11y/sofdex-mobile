import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, ChevronRight } from 'lucide-react';
import { EXAMPLE_INDEX_FUNDS } from '../components/strategies/StrategyExampleData';

export default function StrategyIndexFunds() {
  const [sortBy, setSortBy] = useState('aum');

  const riskColor = {
    'low': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'high': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const sorted = [...EXAMPLE_INDEX_FUNDS].sort((a, b) => {
    if (sortBy === 'aum') return b.aum - a.aum;
    if (sortBy === 'roi') return b.roi30d - a.roi30d;
    return 0;
  });

  const totalAUM = EXAMPLE_INDEX_FUNDS.reduce((sum, f) => sum + f.aum, 0);

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-[#00d4aa]" />
        <div>
          <h1 className="text-xl font-bold text-white">Strategy Index Funds</h1>
          <p className="text-xs text-slate-500">Diversified baskets of top strategies</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-white">{EXAMPLE_INDEX_FUNDS.length}</p>
          <p className="text-[9px] text-slate-500 mt-1">Indices</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-white">${(totalAUM / 1000000).toFixed(1)}M</p>
          <p className="text-[9px] text-slate-500 mt-1">Total AUM</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[11px] font-bold text-emerald-400">+28.3%</p>
          <p className="text-[9px] text-slate-500 mt-1">Avg ROI</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 outline-none">
          <option value="aum">By AUM</option>
          <option value="roi">By ROI</option>
        </select>
      </div>

      {/* Index Cards */}
      <div className="space-y-3">
        {sorted.map(fund => (
          <Link key={fund.id} to={`/IndexFundDetail?id=${fund.id}`}>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">{fund.name}</h3>
                  <p className="text-[10px] text-slate-500">{fund.included.length} Strategies</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-white">${(fund.aum / 1000000).toFixed(1)}M</p>
                  <p className="text-[9px] text-slate-500">AUM</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">30D ROI</p>
                  <p className="text-[11px] font-bold text-emerald-400">+{fund.roi30d.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Strategies</p>
                  <p className="text-[11px] font-bold text-white">{fund.included.length}</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-2 text-center">
                  <p className="text-[9px] text-slate-500">Risk</p>
                  <p className="text-[11px] font-bold text-amber-400">{fund.risk.toUpperCase()}</p>
                </div>
              </div>

              {/* Description & Button */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 flex-1">{fund.description}</p>
                <button className="flex-shrink-0 ml-2 p-2 hover:bg-[#00d4aa]/10 rounded-lg transition-all">
                  <ChevronRight className="w-4 h-4 text-[#00d4aa]" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}