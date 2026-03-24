/**
 * MarketDetailPanel — Full detail + betting UI for a single prediction market.
 * Fetches GET /prediction/market/:source/:id on open.
 */
import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, BarChart2, AlertCircle, Loader2, ExternalLink, Zap, ShieldCheck, Crown, LogOut } from 'lucide-react';
import { useMarketDetail } from './usePredictionAPI';
import { calcFees, calcCashOut, calcInsuranceRefund, applySpread, isHighRoller, PLATFORM_FEE_RATE, INSURANCE_RATE, CASHOUT_FEE_RATE, HIGH_ROLLER_MINIMUM } from '../../lib/prediction/monetization';

const ASSETS   = ['USDT', 'SOL', 'ETH'];
const PRESETS  = [10, 50, 100, 500, 1000];
const BALANCES = { USDT: 10000, SOL: 24.5, ETH: 3.2 };

const SOURCE_BADGE = {
  polymarket: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)', label: 'Polymarket' },
  kalshi:     { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)', label: 'Kalshi' },
  internal:   { bg: 'rgba(0,212,170,0.12)',  text: '#00d4aa', border: 'rgba(0,212,170,0.25)', label: 'SolFort' },
};

const BOOSTERS = [
  { id: 'boost',     label: '⚡ Bet Boost',  desc: `+15% payout (+$${5})`,           cost: 5,  color: '#f97316' },
  { id: 'insurance', label: '🛡️ Insurance',  desc: `50% refund if wrong (${(INSURANCE_RATE*100).toFixed(0)}% fee)`, cost: null, color: '#3b82f6' },
  { id: 'cashout',   label: '💸 Cash Out',   desc: 'Early exit enabled',             cost: 0,  color: '#00d4aa' },
];

function fmtVol(n) {
  if (!n) return '—';
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}
function daysLeft(dateStr) {
  if (!dateStr) return '—';
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1 day';
  if (d < 30) return `${d} days`;
  return `${Math.round(d/30)} months`;
}

function OutcomeButton({ outcome, selected, blocked, onSelect }) {
  const prob    = outcome.prob;
  const payout  = (1 / Math.max(prob, 0.001)).toFixed(2);
  const cents   = Math.round(prob * 100);
  const isYes   = outcome.id === 'YES' || outcome.label === 'YES';
  const isNo    = outcome.id === 'NO'  || outcome.label === 'NO';
  const color   = isNo ? '#ef4444' : isYes ? '#22c55e' : '#00d4aa';
  const glow    = isNo ? 'rgba(239,68,68,0.18)' : isYes ? 'rgba(34,197,94,0.18)' : 'rgba(0,212,170,0.18)';

  return (
    <button onClick={() => !blocked && onSelect(outcome.id)}
      disabled={blocked}
      className={`relative flex flex-col gap-2 px-3.5 py-3 rounded-xl font-bold text-left transition-all w-full ${blocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
      style={selected
        ? { background: `${color}10`, border: `1.5px solid ${color}50`, boxShadow: `0 0 20px ${glow}` }
        : { background: 'rgba(15,21,37,0.8)', border: '1px solid rgba(148,163,184,0.09)' }}>
      {/* Top row: label + payout */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[12px] font-black" style={selected ? { color } : { color: '#e2e8f0' }}>{outcome.label}</span>
        <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded-lg"
          style={selected
            ? { background: `${color}15`, color, border: `1px solid ${color}30` }
            : { background: 'rgba(26,35,64,0.8)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.08)' }}>
          {payout}x
        </span>
      </div>
      {/* Prob bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${cents}%`, background: color, boxShadow: selected ? `0 0 6px ${color}` : 'none' }} />
      </div>
      {/* Bottom row: prob + cents */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[9px]" style={selected ? { color } : { color: '#64748b' }}>{cents}% probability</span>
        <span className="text-[9px] font-mono" style={selected ? { color } : { color: '#64748b' }}>{cents}¢</span>
      </div>
    </button>
  );
}

export default function MarketDetailPanel({ preloaded, source, id, existingBet, onClose, onPlace, onAddToParlay }) {
  const { market: fetched, loading, error } = useMarketDetail(
    preloaded ? null : source,
    preloaded ? null : id
  );
  const rawMarket = preloaded ?? fetched;
  // Apply spread to outcomes for platform margin
  const market = rawMarket ? { ...rawMarket, outcomes: applySpread(rawMarket.outcomes) } : rawMarket;

  const [selectedOutcome, setSelectedOutcome] = useState(existingBet?.outcomeId ?? null);
  const [amount,     setAmount]     = useState('100');
  const [asset,      setAsset]      = useState('USDT');
  const [boosts,     setBoosts]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [cashedOut,  setCashedOut]  = useState(false);

  const outcome    = market?.outcomes?.find(o => o.id === selectedOutcome);
  const blocked    = existingBet && existingBet.outcomeId !== selectedOutcome;
  const amt        = parseFloat(amount) || 0;
  const hrMode     = isHighRoller(amt);
  const srcBadge   = SOURCE_BADGE[market?.source] ?? SOURCE_BADGE.internal;

  const fees = outcome && amt > 0
    ? calcFees({ stake: amt, outcome, boosts, isHighRoller: hrMode })
    : null;

  const cashOutValue = existingBet && outcome
    ? calcCashOut({ stake: existingBet.amount, outcome, currentProb: outcome.prob })
    : 0;

  const insuranceRefund = boosts.includes('insurance') && amt > 0
    ? calcInsuranceRefund(amt)
    : 0;

  const toggleBoost = (bid) => setBoosts(prev => prev.includes(bid) ? prev.filter(b => b !== bid) : [...prev, bid]);

  const handleSubmit = () => {
    if (!outcome || blocked || !amt || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      onPlace?.({
        marketId: market.id, outcomeId: selectedOutcome,
        outcomeLabel: outcome.label, side: outcome.label,
        amount: fees?.totalCost ?? amt, asset,
        payout: fees?.finalMultiplier ?? 1,
        boosts, source: market.source,
        fees: { entry: fees?.entryFee, settle: fees?.settleFee },
      });
      setTimeout(onClose, 1200);
    }, 700);
  };

  const handleCashOut = () => {
    if (!cashOutValue) return;
    setCashedOut(true);
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto max-h-[92vh] fade-in"
        style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.1)', borderBottom: 'none' }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-[rgba(148,163,184,0.06)]">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                style={{ background: srcBadge.bg, color: srcBadge.text, borderColor: srcBadge.border }}>
                {srcBadge.label}
              </span>
              {market?.category && <span className="text-[8px] text-slate-600 uppercase font-bold">{market.category}</span>}
              {market?.sub      && <span className="text-[8px] text-slate-700">· {market.sub}</span>}
            </div>
            <p className="text-[13px] font-bold text-white leading-snug">{market?.question ?? 'Loading...'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1a2340] flex items-center justify-center flex-shrink-0">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="px-5 py-4 text-[11px] text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />Failed to load market detail.
          </div>
        )}

        {market && (
          <div className="px-5 py-4 space-y-4">

            {/* Market stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Volume',    value: fmtVol(market.volume) },
                { label: 'Liquidity', value: fmtVol(market.liquidity) },
                { label: 'Closes',    value: daysLeft(market.endDate) },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-2 py-2 text-center border border-[rgba(148,163,184,0.07)]"
                  style={{ background: 'rgba(26,35,64,0.5)' }}>
                  <p className="text-[11px] font-black text-white">{s.value}</p>
                  <p className="text-[8px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Blocked warning */}
            {blocked && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                Already placed a bet on this market. Cannot switch outcome.
              </div>
            )}

            {/* Outcomes */}
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Select Outcome</label>
              <div className={`grid gap-2 ${market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {market.outcomes.map(o => (
                  <OutcomeButton key={o.id} outcome={o}
                    selected={selectedOutcome === o.id}
                    blocked={!!(existingBet && existingBet.outcomeId !== o.id)}
                    onSelect={setSelectedOutcome} />
                ))}
              </div>
            </div>

            {/* Asset */}
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Asset</label>
              <div className="flex gap-2">
                {ASSETS.map(a => (
                  <button key={a} onClick={() => setAsset(a)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${asset===a ? 'bg-[#00d4aa]/12 text-[#00d4aa] border border-[#00d4aa]/25' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.07)]'}`}>
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
                    className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${Number(amount)===p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>{p}</button>
                ))}
                <button onClick={() => setAmount(String(BALANCES[asset]))}
                  className="flex-1 py-1 rounded text-[9px] font-bold bg-[#1a2340] text-slate-500 hover:text-slate-300">MAX</button>
              </div>
            </div>

            {/* Boosters */}
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1.5 block">Boosters</label>
              <div className="flex gap-1.5">
                {BOOSTERS.map(b => {
                  const active = boosts.includes(b.id);
                  return (
                    <button key={b.id} onClick={() => toggleBoost(b.id)}
                      className="flex-1 py-2 px-2 rounded-xl text-[8px] font-bold border transition-all text-center"
                      style={active ? { background: `${b.color}12`, borderColor: `${b.color}30`, color: b.color } : { background: '#1a2340', borderColor: 'rgba(148,163,184,0.07)', color: '#64748b' }}>
                      {b.label}<br />
                      <span className="opacity-70 font-normal">{b.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payout summary */}
            {outcome && amt > 0 && (
              <div className="rounded-xl overflow-hidden border border-[rgba(148,163,184,0.07)]"
                style={{ background: 'rgba(15,21,37,0.9)' }}>
                <div className="px-3 py-2 border-b border-[rgba(148,163,184,0.05)] flex justify-between text-[10px]">
                  <span className="text-slate-500">Outcome</span>
                  <span className="font-bold text-white">{outcome.label}</span>
                </div>
                <div className="px-3 py-2 border-b border-[rgba(148,163,184,0.05)] flex justify-between text-[10px]">
                  <span className="text-slate-500">Stake</span>
                  <span className="font-mono text-slate-300">{amt} {asset}</span>
                </div>
                <div className="px-3 py-2 border-b border-[rgba(148,163,184,0.05)] flex justify-between text-[10px]">
                  <span className="text-slate-500">Payout rate</span>
                  <span className="font-mono font-black text-[#00d4aa]">{finalPayout.toFixed(2)}x</span>
                </div>
                <div className="px-3 py-3 flex justify-between items-center"
                  style={{ background: 'rgba(34,197,94,0.05)' }}>
                  <span className="text-[11px] font-black text-slate-200">If correct</span>
                  <span className="text-[15px] font-black font-mono text-emerald-400">+{profit.toFixed(2)} {asset}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button onClick={handleSubmit}
              disabled={!outcome || blocked || !amt || submitting || done}
              className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
              style={done
                ? { background: '#1e293b', color: '#94a3b8' }
                : { background: 'linear-gradient(135deg, #00d4aa, #06b6d4)', color: '#fff', boxShadow: '0 4px 24px rgba(0,212,170,0.25)' }}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Placing...</>
               : done      ? '✓ Bet Placed!'
               : !outcome  ? 'Select an outcome'
               : `Bet ${outcome.label} · ${amt} ${asset}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}