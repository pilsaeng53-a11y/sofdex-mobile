import React, { useState } from 'react';

export default function OrderPanel() {
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(10);

  const leverageOptions = [1, 2, 5, 10, 25, 50, 100];

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Buy/Sell toggle */}
      <div className="flex gap-1 bg-[#0d1220] rounded-xl p-1 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            side === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500'
          }`}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500'
          }`}
        >
          Sell / Short
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-1 mb-4">
        {['market', 'limit', 'stop'].map(type => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
              orderType === type ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Price input (for limit/stop) */}
      {orderType !== 'market' && (
        <div className="mb-3">
          <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Price (USD)</label>
          <input
            type="text"
            placeholder="0.00"
            className="w-full h-11 px-4 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
          />
        </div>
      )}

      {/* Amount input */}
      <div className="mb-3">
        <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Amount (USD)</label>
        <input
          type="text"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
        />
        <div className="flex gap-2 mt-2">
          {['25%', '50%', '75%', '100%'].map(pct => (
            <button key={pct} className="flex-1 py-1.5 rounded-lg bg-[#0d1220] text-[10px] font-medium text-slate-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/5 transition-all">
              {pct}
            </button>
          ))}
        </div>
      </div>

      {/* Leverage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-slate-500 font-medium">Leverage</label>
          <span className="text-sm font-bold text-[#00d4aa]">{leverage}x</span>
        </div>
        <div className="flex gap-1.5">
          {leverageOptions.map(lev => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                leverage === lev
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'bg-[#0d1220] text-slate-500 border border-transparent'
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-[#0d1220] rounded-xl p-3 mb-4 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Est. Entry</span>
          <span className="text-slate-300">Market Price</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Est. Liq. Price</span>
          <span className="text-slate-300">—</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Fee</span>
          <span className="text-slate-300">0.05%</span>
        </div>
      </div>

      {/* Submit button */}
      <button className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
        side === 'buy' 
          ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' 
          : 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
      }`}>
        {side === 'buy' ? 'Open Long' : 'Open Short'}
      </button>
    </div>
  );
}