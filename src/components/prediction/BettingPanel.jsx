import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Loader2, Zap, ShieldCheck, Sparkles, Plus } from 'lucide-react';

const ASSETS   = ['USDT', 'SOL', 'ETH'];
const PRESETS  = [10, 50, 100, 500, 1000];
const BALANCES = { USDT: 10000, SOL: 24.5, ETH: 3.2 };

const BOOSTERS = [
  { id: 'boost',     label: '⚡ Bet Boost',  desc: '+15% payout', cost: 5,   color: '#f97316' },
  { id: 'insurance', label: '🛡️ Insurance',  desc: '50% back if wrong', cost: 8, color: '#3b82f6' },
  { id: 'cashout',   label: '💸 Cash Out',   desc: 'Enable early exit', cost: 0, color: '#00d4aa' },
];

export default function BettingPanel({ market, existingBet, onClose, onPlace }) {
  const [selectedOutcome, setSelectedOutcome] = useState(
    existingBet?.outcomeId ?? market?.outcomes?.[0]?.id ?? 'YES'
  );
  const [amount,  setAmount]  = useState('100');
  const [asset,   setAsset]   = useState('USDT');
  const [boosts,  setBoosts]  = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done,    setDone]    = useState(false);

  if (!market) return null;

  const outcome       = market.outcomes.find(o => o.id === selectedOutcome) ?? market.outcomes[0];
  const blocked       = existingBet && existingBet.outcomeId !== selectedOutcome;
  const amt           = parseFloat(amount) || 0;
  const basePayout    = outcome ? (1 / outcome.prob) : 1;
  const boostMult     = boosts.includes('boost') ? 1.15 : 1;
  const finalPayout   = basePayout * boostMult;
  const profit        = amt * finalPayout - amt;
  const insuranceBack = boosts.includes('insurance') ? amt * 0.5 : 0;
  const boostCost     = BOOSTERS.filter(b => boosts.includes(b.id) && b.cost > 0).reduce((s,b) => s + b.cost, 0);
  const balance       = BALANCES[asset];

  const toggleBoost = (id) => setBoosts(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const handleSubmit = () => {
    if (blocked || !amt || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      onPlace?.({ marketId: market.id, outcomeId: selectedOutcome, outcomeLabel: outcome.label, side: outcome.label, amount: amt, asset, payout: finalPayout, boosts });
      setTimeout(onClose, 1200);
    }, 700);
  };

  const outcomeColor = (o) => {
    if (o.id === 'NO' || o.label === 'NO') return { active: '#ef4444', glow: 'rgba(239,68,68,0.25)', bg: 'rgba(239,68,68,0.08)' };
    if (o.prob >= 0.6) return { active: '#22c55e', glow: 'rgba(34,197,94,0.25)', bg: 'rgba(34,197,94,0.08)' };
    if (o.prob <= 0.25) return { active: '#fbbf24', glow: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.08)' };
    return { active: '#00d4aa', glow: 'rgba(0,212,170,0.25)', bg: 'rgba(0,212,170,0.08)' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-t-3xl pb-8 fade-in overflow-y-auto max-h-[90vh]"
        style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.1)', borderBottom: 'none' }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase"
                style={{ background: 'rgba(148,163,184,0.1)', color: '#64748b' }}>{market.category}</span>
              <span className="text-[8px] text-slate-600 uppercase font-bold">{market.type}</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug">{market.question}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1a2340] flex items-center justify-center flex-shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="px-5 space-y-4">
          {/* Blocked warning */}
          {blocked && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Already bet on this market. Cannot switch outcome.
            </div>
          )}

          {/* Outcomes grid */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Select Outcome</label>
            <div className={`grid gap-2 ${market.outcomes.length === 2 ? 'grid-cols-2' : market.outcomes.length <= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {market.outcomes.map(o => {
                const c = outcomeColor(o);
                const isSelected = selectedOutcome === o.id;
                const isBlocked  = existingBet && existingBet.outcomeId !== o.id;
                return (
                  <button key={o.id}
                    onClick={() => !isBlocked && setSelectedOutcome(o.id)}
                    disabled={isBlocked}
                    className={`relative py-2.5 px-3 rounded-xl font-bold text-[11px] transition-all text-left ${isBlocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={isSelected ? { background: c.bg, border: `1px solid ${c.active}40`, boxShadow: `0 0 20px ${c.glow}` } : { background: 'rgba(26,35,64,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? '' : 'text-slate-400'} style={isSelected ? { color: c.active } : {}}>{o.label}</span>
                      <span className={`font-mono text-[10px] ${isSelected ? 'font-black' : 'text-slate-500'}`}
                        style={isSelected ? { color: c.active } : {}}>{(1/o.prob).toFixed(2)}x</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(o.prob*100)}%`, background: c.active }} />
                    </div>
                    <div className="text-[8px] mt-0.5" style={{ color: isSelected ? c.active : '#64748b' }}>{Math.round(o.prob*100)}%</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Asset</label>
            <div className="flex gap-2">
              {ASSETS.map(a => (
                <button key={a} onClick={() => setAsset(a)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${asset === a ? 'bg-[#00d4aa]/12 text-[#00d4aa] border border-[#00d4aa]/25' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.07)]'}`}>
                  {a}
                </button>
              ))}
            </div>
            <div className="text-right text-[9px] text-slate-600 mt-1">Balance: {BALANCES[asset].toLocaleString()} {asset}</div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00d4aa]/40 mb-2" />
            <div className="flex gap-1.5">
              {PRESETS.map(p => (
                <button key={p} onClick={() => setAmount(String(p))}
                  className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${Number(amount) === p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>
                  {p >= 1000 ? `${p/1000}K` : p}
                </button>
              ))}
              <button onClick={() => setAmount(String(Math.floor(balance)))}
                className="flex-1 py-1 rounded text-[9px] font-bold bg-[#1a2340] text-slate-500 hover:text-slate-300 transition-all">MAX</button>
            </div>
          </div>

          {/* Boosters */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Boosters</label>
            <div className="space-y-1.5">
              {BOOSTERS.map(b => {
                const active = boosts.includes(b.id);
                return (
                  <button key={b.id} onClick={() => toggleBoost(b.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${active ? 'border' : 'border border-[rgba(148,163,184,0.07)] bg-[#1a2340]'}`}
                    style={active ? { background: `${b.color}12`, borderColor: `${b.color}30`, color: b.color } : {}}>
                    <span>{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] opacity-70">{b.desc}</span>
                      {b.cost > 0 && <span className="text-[8px] font-black" style={{ color: active ? b.color : '#64748b' }}>+{b.cost} USDT</span>}
                      <div className={`w-3 h-3 rounded flex items-center justify-center text-[7px] ${active ? 'bg-white/20' : 'bg-slate-700'}`}>
                        {active ? '✓' : '+'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {amt > 0 && (
            <div className="rounded-xl p-3 space-y-1.5 border border-[rgba(148,163,184,0.06)]"
              style={{ background: 'rgba(26,35,64,0.5)' }}>
              {boostCost > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Booster cost</span>
                  <span className="font-mono text-orange-400">-{boostCost} {asset}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Payout rate</span>
                <span className="font-mono font-black text-[#00d4aa]">{finalPayout.toFixed(2)}x</span>
              </div>
              {insuranceBack > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Insurance (if wrong)</span>
                  <span className="font-mono text-blue-400">+{insuranceBack.toFixed(0)} {asset}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] pt-1 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-slate-300 font-bold">If correct</span>
                <span className="font-mono text-emerald-400 font-black">+{profit.toFixed(2)} {asset}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit}
            disabled={blocked || !amt || submitting || done}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
            style={done ? { background: '#1e293b', color: '#94a3b8' }
              : { background: `linear-gradient(135deg, ${outcomeColor(outcome).active}, ${outcomeColor(outcome).active}cc)`, color: '#fff', boxShadow: `0 4px 24px ${outcomeColor(outcome).glow}` }}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</>
             : done      ? '✓ Bet Placed!'
             : `Bet ${outcome?.label ?? ''} · ${amt} ${asset}`}
          </button>
        </div>
      </div>
    </div>
  );
}