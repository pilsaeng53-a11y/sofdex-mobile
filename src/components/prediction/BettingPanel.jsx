import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';

const ASSETS = ['USDT', 'SOL', 'ETH'];
const AMOUNT_PRESETS = [10, 50, 100, 500];

const BALANCES = { USDT: 10000, SOL: 24.5, ETH: 3.2 };

export default function BettingPanel({ market, existingBet, onClose, onPlace }) {
  const [side, setSide]     = useState(existingBet?.side ?? 'YES');
  const [amount, setAmount] = useState('100');
  const [asset, setAsset]   = useState('USDT');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]     = useState(false);

  if (!market) return null;

  const blocked = existingBet && existingBet.side !== side;
  const payout  = side === 'YES' ? market.payoutYes : market.payoutNo;
  const amt     = parseFloat(amount) || 0;
  const profit  = amt * payout - amt;
  const balance = BALANCES[asset];

  const handleSubmit = () => {
    if (blocked || !amt || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      onPlace?.({ marketId: market.id, side, amount: amt, asset, payout });
      setTimeout(onClose, 1200);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-t-3xl p-5 pb-8 fade-in"
        style={{ background: '#0f1525', border: '1px solid rgba(148,163,184,0.1)', borderBottom: 'none' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{market.category}</p>
            <p className="text-sm font-bold text-white leading-snug">{market.question}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1a2340] flex items-center justify-center flex-shrink-0">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Existing bet warning */}
        {existingBet && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-[11px] font-bold"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            You already bet {existingBet.side} on this market. Cannot bet opposite side.
          </div>
        )}

        {/* YES / NO */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {['YES', 'NO'].map(s => {
            const isBlocked = existingBet && existingBet.side !== s;
            const p = s === 'YES' ? market.payoutYes : market.payoutNo;
            return (
              <button key={s}
                onClick={() => !isBlocked && setSide(s)}
                disabled={isBlocked}
                className={`py-3 rounded-xl font-black text-sm transition-all relative overflow-hidden ${
                  side === s
                    ? s === 'YES' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : isBlocked ? 'bg-[#1a2340]/40 text-slate-700 cursor-not-allowed' : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.08)]'
                }`}>
                <div className="text-xs opacity-70 font-mono">{p.toFixed(2)}x payout</div>
                {s === 'YES' ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}
                {s}
                {isBlocked && <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-red-400/70 bg-[#0f1525]/70">BLOCKED</div>}
              </button>
            );
          })}
        </div>

        {/* Asset */}
        <div className="mb-3">
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Asset</label>
          <div className="flex gap-2">
            {ASSETS.map(a => (
              <button key={a} onClick={() => setAsset(a)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${asset === a ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="text-right text-[9px] text-slate-600 mt-1">Balance: {BALANCES[asset].toLocaleString()} {asset}</div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Amount ({asset})</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00d4aa]/40 mb-2" />
          <div className="flex gap-1">
            {AMOUNT_PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(String(p))}
                className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${Number(amount) === p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setAmount(String(Math.floor(balance)))}
              className="flex-1 py-1 rounded text-[9px] font-bold bg-[#1a2340] text-slate-500 hover:text-slate-300 transition-all">MAX</button>
          </div>
        </div>

        {/* Calc summary */}
        {amt > 0 && (
          <div className="bg-[#1a2340] rounded-xl p-3 mb-4 space-y-1.5 border border-[rgba(148,163,184,0.06)]">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Bet Amount</span>
              <span className="font-mono text-white">{amt} {asset}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Payout Rate</span>
              <span className="font-mono text-[#00d4aa] font-bold">{payout.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between text-[10px] border-t border-[rgba(148,163,184,0.06)] pt-1.5 mt-1">
              <span className="text-slate-400 font-bold">If correct</span>
              <span className="font-mono text-emerald-400 font-black">+{profit.toFixed(2)} {asset}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={blocked || !amt || submitting || done}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            done ? 'bg-slate-600 text-slate-300'
            : side === 'YES' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
          }`}>
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</>
           : done ? '✓ Bet Placed!'
           : `Bet ${side} · ${amt} ${asset}`}
        </button>
      </div>
    </div>
  );
}