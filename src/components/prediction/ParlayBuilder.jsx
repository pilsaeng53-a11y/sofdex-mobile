/**
 * ParlayBuilder — Multi-market parlay slip.
 * Lets users combine multiple market predictions for multiplied payouts.
 */
import React, { useState } from 'react';
import { X, Zap, Plus, Trash2, TrendingUp } from 'lucide-react';
import { calcParlay, PLATFORM_FEE_RATE } from '../../lib/prediction/monetization';

export default function ParlayBuilder({ legs = [], onRemoveLeg, onClear, onPlace }) {
  const [stake,      setStake]      = useState('50');
  const [submitted,  setSubmitted]  = useState(false);

  const stakeNum = parseFloat(stake) || 0;
  const legsWithStake = legs.map(l => ({ ...l, stake: stakeNum }));
  const parlay = calcParlay(legsWithStake);

  if (!legs.length) {
    return (
      <div className="rounded-2xl border p-4 text-center space-y-2"
        style={{ background: 'rgba(10,14,26,0.8)', borderColor: 'rgba(139,92,246,0.15)', borderStyle: 'dashed' }}>
        <Zap className="w-6 h-6 text-purple-500 mx-auto" />
        <p className="text-[11px] font-bold text-slate-400">Parlay Builder</p>
        <p className="text-[9px] text-slate-600">Add markets to build a multi-bet parlay</p>
      </div>
    );
  }

  const handlePlace = () => {
    if (submitted || !stakeNum || legs.length < 2) return;
    setSubmitted(true);
    onPlace?.({ legs, stake: stakeNum, parlay });
    setTimeout(() => { setSubmitted(false); onClear?.(); }, 1500);
  };

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: 'rgba(10,14,26,0.95)', borderColor: 'rgba(139,92,246,0.25)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b"
        style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.15)' }}>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-black text-purple-300">Parlay Slip</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black"
            style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
            {legs.length} legs
          </span>
        </div>
        <button onClick={onClear} className="text-[8px] text-slate-600 hover:text-red-400 transition-colors">
          Clear all
        </button>
      </div>

      {/* Legs */}
      <div className="divide-y" style={{ divideColor: 'rgba(148,163,184,0.05)' }}>
        {legs.map((leg, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-slate-400 truncate">{leg.market?.question}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>
                  {leg.outcome?.label}
                </span>
                <span className="text-[8px] font-mono text-yellow-400">
                  {(1 / Math.max(leg.outcome?.prob ?? 0.5, 0.001)).toFixed(2)}x
                </span>
              </div>
            </div>
            <button onClick={() => onRemoveLeg?.(i)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Stake + summary */}
      <div className="px-3 py-3 space-y-2 border-t" style={{ borderColor: 'rgba(148,163,184,0.07)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 flex-shrink-0">Stake</span>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)}
            className="flex-1 bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none" />
          <span className="text-[9px] text-slate-500">USDT</span>
        </div>

        {stakeNum > 0 && legs.length >= 1 && (
          <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.15)]"
            style={{ background: 'rgba(139,92,246,0.05)' }}>
            <div className="flex justify-between px-3 py-1.5 text-[9px]">
              <span className="text-slate-500">Combined multiplier</span>
              <span className="font-black text-purple-300">{parlay.multiplier}x</span>
            </div>
            <div className="flex justify-between px-3 py-1.5 text-[9px] border-t" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
              <span className="text-slate-500">Platform fee ({(PLATFORM_FEE_RATE*100).toFixed(0)}%)</span>
              <span className="text-red-400 font-mono">-${parlay.entryFee}</span>
            </div>
            <div className="flex justify-between px-3 py-2 text-[11px] border-t" style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'rgba(139,92,246,0.08)' }}>
              <span className="font-black text-white">If all correct</span>
              <span className="font-black font-mono text-emerald-400">+${parlay.netPayout}</span>
            </div>
          </div>
        )}

        <button onClick={handlePlace}
          disabled={legs.length < 2 || !stakeNum || submitted}
          className="w-full py-2.5 rounded-xl text-[11px] font-black transition-all disabled:opacity-40"
          style={{ background: submitted ? '#1e293b' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }}>
          {submitted ? '✓ Parlay Placed!' : legs.length < 2 ? `Add ${2 - legs.length} more leg` : `Place Parlay · $${stakeNum}`}
        </button>
      </div>
    </div>
  );
}