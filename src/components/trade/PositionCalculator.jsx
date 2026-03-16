import React, { useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../shared/MarketData';

export default function PositionCalculator({ price = 0, symbol = 'BTC', maxLeverage = 100 }) {
  const [entry, setEntry] = useState(price ? price.toFixed(2) : '');
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState('');
  const [side, setSide] = useState('long');

  const entryNum  = parseFloat(entry)  || 0;
  const marginNum = parseFloat(margin) || 0;
  const hasData = entryNum > 0 && marginNum > 0 && leverage > 0;

  const positionSize = marginNum * leverage;
  const qty          = entryNum > 0 ? positionSize / entryNum : 0;

  // Liquidation price (simplified, assuming 0.5% maintenance margin)
  const maintenanceRate = 0.005;
  const liqPrice = side === 'long'
    ? entryNum * (1 - (1 / leverage) + maintenanceRate)
    : entryNum * (1 + (1 / leverage) - maintenanceRate);

  // P&L at +10% and -10%
  const pnlPlus10  = side === 'long' ? positionSize * 0.1  : positionSize * -0.1;
  const pnlMinus10 = side === 'long' ? positionSize * -0.1 : positionSize * 0.1;

  // Risk level
  const riskPct = leverage / maxLeverage;
  const riskLabel = riskPct <= 0.2 ? 'Low' : riskPct <= 0.5 ? 'Medium' : riskPct <= 0.8 ? 'High' : 'Extreme';
  const riskColor = riskPct <= 0.2 ? 'text-emerald-400' : riskPct <= 0.5 ? 'text-amber-400' : 'text-red-400';

  const presets = [1, 2, 5, 10, 25, 50, maxLeverage].filter((v, i, arr) => arr.indexOf(v) === i && v <= maxLeverage);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-[#00d4aa]" />
        <span className="text-sm font-bold text-white">Position Calculator</span>
        <span className="text-[10px] text-slate-500 ml-auto">max {maxLeverage}x</span>
      </div>

      {/* Side */}
      <div className="flex gap-1 bg-[#0d1220] rounded-xl p-1">
        <button onClick={() => setSide('long')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${side === 'long' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
          Long
        </button>
        <button onClick={() => setSide('short')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${side === 'short' ? 'bg-red-500 text-white' : 'text-slate-500'}`}>
          Short
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-slate-500 font-medium mb-1 block">Entry Price ($)</label>
          <input type="number" placeholder={price ? price.toFixed(2) : '0.00'} value={entry} onChange={e => setEntry(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30" />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 font-medium mb-1 block">Margin (USDT)</label>
          <input type="number" placeholder="100" value={margin} onChange={e => setMargin(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30" />
        </div>
      </div>

      {/* Leverage */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-[11px] text-slate-500 font-medium">Leverage</label>
          <span className="text-sm font-bold text-[#00d4aa]">{leverage}x</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {presets.map(l => (
            <button key={l} onClick={() => setLeverage(l)}
              className={`flex-1 min-w-[32px] py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                leverage === l
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'bg-[#0d1220] text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              {l}x
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {hasData ? (
        <div className="bg-[#0d1220] rounded-xl p-3.5 space-y-2.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Position Size</span>
            <span className="text-white font-bold">${positionSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Quantity ({symbol})</span>
            <span className="text-white font-medium">{qty.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-[11px] border-t border-[rgba(148,163,184,0.06)] pt-2">
            <span className="text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-400" /> Liquidation Price
            </span>
            <span className="text-orange-400 font-bold">${formatPrice(liqPrice)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">P&L at +10%</span>
            <span className={`font-bold ${pnlPlus10 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnlPlus10 >= 0 ? '+' : ''}${pnlPlus10.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">P&L at −10%</span>
            <span className={`font-bold ${pnlMinus10 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnlMinus10 >= 0 ? '+' : ''}${pnlMinus10.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] border-t border-[rgba(148,163,184,0.06)] pt-2">
            <span className="text-slate-500">Risk Level</span>
            <span className={`font-bold ${riskColor}`}>{riskLabel}</span>
          </div>
          {/* Risk bar */}
          <div className="h-1.5 rounded-full bg-[#0a0e1a] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${riskPct * 100}%`,
              background: riskPct <= 0.2 ? '#22c55e' : riskPct <= 0.5 ? '#f59e0b' : '#ef4444'
            }} />
          </div>
        </div>
      ) : (
        <div className="bg-[#0d1220] rounded-xl p-4 text-center">
          <p className="text-xs text-slate-600">Enter entry price, margin, and leverage to see results</p>
        </div>
      )}
    </div>
  );
}