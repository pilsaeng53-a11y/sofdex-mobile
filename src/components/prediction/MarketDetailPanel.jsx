/**
 * MarketDetailPanel — Full detail + betting UI for a single prediction market.
 * Includes local-state pre-DB betting flow, My Position panel, lock UX.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Clock, AlertCircle, Loader2, Zap, Crown, Lock,
  CheckCircle2, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Target, Activity, Wallet
} from 'lucide-react';
import { useMarketDetail } from './usePredictionAPI';
import {
  calcFees, calcCashOut, calcInsuranceRefund, applySpread,
  isHighRoller, PLATFORM_FEE_RATE, INSURANCE_RATE, CASHOUT_FEE_RATE
} from '../../lib/prediction/monetization';

const ASSETS   = ['USDT', 'SOL', 'ETH'];
const PRESETS  = [10, 50, 100, 500, 1000];
const BALANCES = { USDT: 10000, SOL: 24.5, ETH: 3.2 };

const SOURCE_BADGE = {
  polymarket: { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8', border: 'rgba(99,102,241,0.3)',  label: 'Polymarket' },
  kalshi:     { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.25)', label: 'Kalshi' },
  solfort:    { bg: 'rgba(0,212,170,0.12)',   text: '#00d4aa', border: 'rgba(0,212,170,0.25)',  label: 'SolFort' },
  internal:   { bg: 'rgba(0,212,170,0.12)',   text: '#00d4aa', border: 'rgba(0,212,170,0.25)',  label: 'SolFort' },
};

const BOOSTERS = [
  { id: 'boost',     label: '⚡ Bet Boost',  desc: '+15% payout',          color: '#f97316' },
  { id: 'insurance', label: '🛡 Insurance',  desc: '50% refund if wrong',  color: '#3b82f6' },
  { id: 'cashout',   label: '💸 Cash Out',   desc: 'Early exit enabled',   color: '#00d4aa' },
];

function useCountdown(endDate) {
  const [secsLeft, setSecsLeft] = useState(0);
  useEffect(() => {
    if (!endDate) return;
    const tick = () => setSecsLeft(Math.max(0, Math.floor((new Date(endDate) - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return secsLeft;
}

function formatCountdown(secs) {
  if (secs <= 0) return 'Ended';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function fmtVol(n) {
  if (!n) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
function daysLeft(dateStr) {
  if (!dateStr) return '—';
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1 day';
  if (d < 30) return `${d} days`;
  return `${Math.round(d / 30)} months`;
}

// ─── Status chip ────────────────────────────────────────────────────────────
function StatusChip({ market, secsLeft, hasEndDate }) {
  const status = market.status;
  if (status === 'resolved') return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border"
      style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.25)' }}>
      ✓ RESOLVED
    </span>
  );
  if (status === 'archived') return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border"
      style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }}>
      ARCHIVED
    </span>
  );
  if (status === 'locked' || (hasEndDate && secsLeft <= 0)) return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border flex items-center gap-0.5"
      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', borderColor: 'rgba(239,68,68,0.25)' }}>
      <Lock className="w-2 h-2" />LOCKED
    </span>
  );
  if (hasEndDate && secsLeft > 0 && secsLeft <= 60) return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border animate-pulse"
      style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.25)' }}>
      ⚡ CLOSING SOON
    </span>
  );
  return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border"
      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.2)' }}>
      ● OPEN
    </span>
  );
}

// ─── Outcome Button ──────────────────────────────────────────────────────────
function OutcomeButton({ outcome, selected, blocked, onSelect }) {
  const prob   = outcome.prob;
  const payout = (1 / Math.max(prob, 0.001)).toFixed(2);
  const cents  = Math.round(prob * 100);
  const isYes  = outcome.id === 'YES' || outcome.label === 'YES';
  const isNo   = outcome.id === 'NO'  || outcome.label === 'NO';
  const color  = isNo ? '#ef4444' : isYes ? '#22c55e' : '#00d4aa';
  const glow   = isNo ? 'rgba(239,68,68,0.28)' : isYes ? 'rgba(34,197,94,0.28)' : 'rgba(0,212,170,0.28)';
  const bg     = isNo ? 'rgba(239,68,68,0.13)' : isYes ? 'rgba(34,197,94,0.13)' : 'rgba(0,212,170,0.13)';

  return (
    <button
      onClick={() => !blocked && onSelect(outcome.id)}
      disabled={blocked}
      className={`relative flex flex-col gap-2 px-4 py-3.5 rounded-2xl font-bold text-left w-full transition-all ${
        blocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
      }`}
      style={selected
        ? { background: bg, border: `2px solid ${color}`, boxShadow: `0 0 32px ${glow}, 0 0 0 1px ${color}30 inset` }
        : { background: 'rgba(15,21,37,0.95)', border: '1.5px solid rgba(148,163,184,0.1)' }}>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: color }}>
          <span className="text-[8px] text-black font-black">✓</span>
        </div>
      )}

      {/* Label */}
      <span className="text-[14px] font-black leading-none" style={{ color: selected ? color : '#e2e8f0' }}>
        {outcome.label}
      </span>

      {/* Prob bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${cents}%`, background: color, boxShadow: selected ? `0 0 10px ${color}` : 'none' }} />
      </div>

      {/* Bottom: prob + payout */}
      <div className="flex items-end justify-between w-full">
        <span className="text-[9px] font-bold" style={{ color: selected ? color : '#64748b' }}>{cents}% chance · {cents}¢</span>
        <span className="text-[18px] font-black font-mono leading-none" style={{ color: selected ? color : '#475569' }}>
          {payout}x
        </span>
      </div>
    </button>
  );
}

// ─── My Position Panel ──────────────────────────────────────────────────────
function MyPositionPanel({ position, market, onCashOut, cashedOut }) {
  const [expanded, setExpanded] = useState(true);
  if (!position) return (
    <div className="rounded-xl border px-4 py-4 flex items-center gap-3"
      style={{ background: 'rgba(15,21,37,0.5)', borderColor: 'rgba(148,163,184,0.07)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <Wallet className="w-4 h-4 text-slate-700" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-bold">No Active Position</p>
        <p className="text-[9px] text-slate-700">Select an outcome and place a bet</p>
      </div>
    </div>
  );

  const outcome     = market?.outcomes?.find(o => o.id === position.outcomeId);
  const currentProb = outcome?.prob ?? (position.payoutMult ? (1 / position.payoutMult) : 0.5);
  const totalReturn = (position.amount * position.payoutMult).toFixed(2);
  const netProfit   = (position.amount * position.payoutMult - position.amount).toFixed(2);
  const cashOutVal  = outcome ? calcCashOut({ stake: position.amount, outcome, currentProb }) : 0;
  const timeStr     = new Date(position.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isYes       = position.outcomeLabel === 'YES';
  const isNo        = position.outcomeLabel === 'NO';
  const outcomeColor = isNo ? '#ef4444' : isYes ? '#22c55e' : '#00d4aa';

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(0,212,170,0.2)', boxShadow: '0 0 30px rgba(0,212,170,0.05)' }}>

      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(0,212,170,0.06)', borderBottom: expanded ? '1px solid rgba(0,212,170,0.1)' : 'none' }}>
        <span className="text-[10px] font-black text-[#00d4aa] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />MY POSITION
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.9)' }} />
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">{timeStr}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pt-3 pb-4 space-y-3">

          {/* Outcome + status row */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black px-3 py-1 rounded-lg"
              style={{ background: `${outcomeColor}18`, color: outcomeColor, border: `1px solid ${outcomeColor}35` }}>
              {position.outcomeLabel}
            </span>
            <span className="text-[9px] text-slate-600">{position.asset}</span>
            <span className="ml-auto text-[8px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>● LIVE</span>
          </div>

          {/* Big profit display */}
          <div className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <p className="text-[9px] text-slate-600 mb-0.5 uppercase tracking-wider">Potential Net Profit</p>
            <p className="text-[32px] font-black font-mono leading-none text-emerald-400">+${netProfit}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">{position.asset} · if {position.outcomeLabel} resolves</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Staked',  value: `$${position.amount}`,       color: '#e2e8f0' },
              { label: 'Payout',  value: `${position.payoutMult}x`,   color: '#00d4aa' },
              { label: 'Return',  value: `$${totalReturn}`,           color: '#22c55e' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'rgba(15,21,37,0.8)', border: '1px solid rgba(148,163,184,0.06)' }}>
                <p className="text-[8px] text-slate-600 mb-0.5">{s.label}</p>
                <p className="text-[13px] font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Cash out */}
          {cashOutVal > 0 && !cashedOut && (
            <button onClick={onCashOut}
              className="w-full py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', color: '#00d4aa' }}>
              💸 Cash Out Now — <span className="text-white">${cashOutVal}</span>
              <span className="text-[8px] opacity-50">({(CASHOUT_FEE_RATE * 100).toFixed(0)}% fee)</span>
            </button>
          )}
          {cashedOut && (
            <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-black text-[#00d4aa]">
              <CheckCircle2 className="w-4 h-4" />Cashed out successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MarketDetailPanel({ preloaded, source, id, existingBet, onClose, onPlace, onAddToParlay }) {
  const { market: fetched, loading, error } = useMarketDetail(
    preloaded ? null : source,
    preloaded ? null : id
  );
  const rawMarket = preloaded ?? fetched;
  const market = rawMarket ? { ...rawMarket, outcomes: applySpread(rawMarket.outcomes) } : rawMarket;

  const [selectedOutcome, setSelectedOutcome] = useState(existingBet?.outcomeId ?? null);
  const [amount,     setAmount]     = useState('100');
  const [asset,      setAsset]      = useState('USDT');
  const [boosts,     setBoosts]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [localPosition, setLocalPosition] = useState(null);
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [cashedOut,     setCashedOut]     = useState(false);

  const outcome  = market?.outcomes?.find(o => o.id === selectedOutcome);
  const blocked  = existingBet && existingBet.outcomeId !== selectedOutcome;
  const amt      = parseFloat(amount) || 0;
  const hrMode   = isHighRoller(amt);
  const srcBadge = SOURCE_BADGE[market?.source] ?? SOURCE_BADGE.solfort;

  const secsLeft   = useCountdown(market?.endDate);
  const hasEndDate = !!(market?.endDate && String(market.endDate).length > 5);
  const isLockLocked      = market?.status === 'locked' ||
    (hasEndDate && secsLeft <= 20 && secsLeft >= 0 && market?.source === 'solfort');
  const isBettingBlocked  = isLockLocked || market?.status === 'resolved' ||
    market?.status === 'archived' || (hasEndDate && secsLeft <= 0);
  const isClosingSoon     = !isBettingBlocked && hasEndDate && secsLeft > 0 && secsLeft <= 60;

  const fees = outcome && amt > 0
    ? calcFees({ stake: amt, outcome, boosts, isHighRoller: hrMode })
    : null;

  const toggleBoost = (bid) => setBoosts(prev => prev.includes(bid) ? prev.filter(b => b !== bid) : [...prev, bid]);

  const handleSubmit = () => {
    if (!outcome || blocked || !amt || submitting || isBettingBlocked) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const payoutMult = fees?.finalMultiplier ?? (1 / Math.max(outcome.prob, 0.001));
      const position = {
        marketId:     market.id,
        outcomeId:    selectedOutcome,
        outcomeLabel: outcome.label,
        amount:       fees?.totalCost ?? amt,
        asset,
        payoutMult:   parseFloat(payoutMult.toFixed(2)),
        boosts,
        source:       market.source,
        placedAt:     new Date().toISOString(),
      };
      setLocalPosition(position);
      setShowSuccess(true);
      onPlace?.(position);
      setTimeout(() => setShowSuccess(false), 2500);
    }, 700);
  };

  const handleCashOut = () => {
    setCashedOut(true);
  };

  const hasPosition = !!(localPosition || existingBet);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto max-h-[94vh] fade-in"
        style={{ background: '#0a0e1a', border: '1px solid rgba(148,163,184,0.1)', borderBottom: 'none' }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-[rgba(148,163,184,0.06)]">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                style={{ background: srcBadge.bg, color: srcBadge.text, borderColor: srcBadge.border }}>
                {srcBadge.label}
              </span>
              {market && <StatusChip market={market} secsLeft={secsLeft} hasEndDate={hasEndDate} />}
              {market?.category && <span className="text-[8px] text-slate-600 uppercase font-bold">{market.category}</span>}
            </div>
            <p className="text-[13px] font-bold text-white leading-snug">{market?.question ?? 'Loading...'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1a2340] flex items-center justify-center flex-shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Loading */}
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

        {/* Success banner */}
        {showSuccess && (
          <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-black text-emerald-400">Bet Placed!</p>
              <p className="text-[9px] text-slate-400">Position saved · Settlement pending resolution</p>
            </div>
          </div>
        )}

        {market && (
          <div className="px-5 py-4 space-y-4">

            {/* SolFort exclusive metadata */}
            {(market.source === 'solfort' || market.source === 'internal') && market.timeframe && (
              <div className="rounded-xl border px-3 py-2.5 space-y-1.5"
                style={{ background: 'rgba(0,212,170,0.04)', borderColor: 'rgba(0,212,170,0.18)' }}>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#00d4aa]" />
                  <span className="text-[9px] font-black text-[#00d4aa] uppercase tracking-wider">SolFort Exclusive · Fast Market</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px]">
                  <span className="text-slate-400">Timeframe: <span className="font-black text-white">{market.timeframe}</span></span>
                  {market.resolutionType && <span className="text-slate-400">Resolution: <span className="font-bold text-slate-200">{market.resolutionType}</span></span>}
                  {market.targetPrice && (
                    <span className="flex items-center gap-0.5 text-slate-400">
                      <Target className="w-2.5 h-2.5" />Target: <span className="font-black text-amber-400">${market.targetPrice}</span>
                    </span>
                  )}
                </div>
                {market.metadata?.lockRule && (
                  <p className="text-[8px] text-slate-500 border-t border-[rgba(0,212,170,0.1)] pt-1.5 mt-1">
                    ⚠ {market.metadata.lockRule}
                  </p>
                )}
                {!market.metadata?.lockRule && (
                  <p className="text-[8px] text-slate-600">⚠ Betting closes 20 seconds before resolution</p>
                )}
              </div>
            )}

            {/* Closing soon urgent warning */}
            {isClosingSoon && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${secsLeft <= 30 ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.4)'}`, boxShadow: `0 0 24px ${secsLeft <= 30 ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.1)'}` }}>
                <div className="flex items-center justify-between px-4 py-2"
                  style={{ background: secsLeft <= 30 ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${secsLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`} />
                    <div>
                      <p className={`text-[11px] font-black ${secsLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`}>
                        {secsLeft <= 30 ? '🚨 Betting Closes Very Soon' : '⚡ Closing Soon'}
                      </p>
                      <p className="text-[8px] text-slate-500">Locks at 20s · place your bet now</p>
                    </div>
                  </div>
                  <span className={`text-[28px] font-black font-mono leading-none ${secsLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`}>
                    {formatCountdown(secsLeft)}
                  </span>
                </div>
              </div>
            )}

            {/* Normal countdown for SolFort short markets */}
            {!isClosingSoon && (market.source === 'solfort' || market.source === 'internal') && !isBettingBlocked && secsLeft > 0 && secsLeft <= 3600 && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border"
                style={{ background: 'rgba(0,212,170,0.04)', borderColor: 'rgba(0,212,170,0.15)' }}>
                <span className="text-[9px] text-[#00d4aa] font-bold flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />Resolves in
                </span>
                <span className="text-[22px] font-black font-mono text-white leading-none">{formatCountdown(secsLeft)}</span>
              </div>
            )}

            {/* Locked / Blocked banner */}
            {isBettingBlocked && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold"
                style={market.status === 'archived'
                  ? { background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.18)', color: '#94a3b8' }
                  : market.status === 'resolved'
                  ? { background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }
                  : { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <Lock className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-[11px]">
                    {market.status === 'archived' ? 'Market archived — view only' :
                     market.status === 'resolved' ? 'Market resolved — betting closed' :
                     secsLeft <= 0               ? 'Market closed' :
                     `Betting locked · resolves in ${formatCountdown(secsLeft)}`}
                  </p>
                  {market.source === 'solfort' && isLockLocked && secsLeft > 0 && (
                    <p className="text-[8px] opacity-60 mt-0.5">Betting closes 20 seconds before resolution</p>
                  )}
                </div>
              </div>
            )}

            {/* Market stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Volume',    value: fmtVol(market.volume) },
                { label: 'Liquidity', value: fmtVol(market.liquidity) },
                { label: 'Closes',    value: daysLeft(market.endDate) },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-2 py-2 text-center border"
                  style={{ background: 'rgba(15,21,37,0.9)', borderColor: 'rgba(148,163,184,0.07)' }}>
                  <p className="text-[12px] font-black text-white">{s.value}</p>
                  <p className="text-[8px] text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>

            {/* My Position */}
            <MyPositionPanel
              position={localPosition}
              market={market}
              onCashOut={handleCashOut}
              cashedOut={cashedOut}
            />

            {/* Divider */}
            {!isBettingBlocked && (
              <div className="border-t border-[rgba(148,163,184,0.05)]" />
            )}

            {/* BETTING FORM — hidden when market is inactive */}
            {!isBettingBlocked && (
              <>
                {/* Already-bet blocker */}
                {blocked && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Already placed a bet on this market. Cannot switch outcome.
                  </div>
                )}

                {/* Outcomes */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Select Outcome
                  </label>
                  <div className={`grid gap-2 ${market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {market.outcomes.map(o => (
                      <OutcomeButton key={o.id} outcome={o}
                        selected={selectedOutcome === o.id}
                        blocked={!!(existingBet && existingBet.outcomeId !== o.id)}
                        onSelect={setSelectedOutcome} />
                    ))}
                  </div>
                </div>

                {/* Asset selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Asset</label>
                  <div className="flex gap-2">
                    {ASSETS.map(a => (
                      <button key={a} onClick={() => setAsset(a)}
                        className="flex-1 py-2 rounded-xl text-[11px] font-black transition-all"
                        style={asset === a
                          ? { background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1.5px solid rgba(0,212,170,0.3)' }
                          : { background: 'rgba(15,21,37,0.9)', color: '#64748b', border: '1px solid rgba(148,163,184,0.07)' }}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <p className="text-right text-[9px] text-slate-700 mt-1">
                    Balance: {BALANCES[asset].toLocaleString()} {asset}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl px-4 py-3 text-[18px] text-white font-mono font-black focus:outline-none mb-2 transition-all"
                    style={{ background: 'rgba(15,21,37,0.9)', border: '1px solid rgba(148,163,184,0.1)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.1)'}
                  />
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESETS.map(p => (
                      <button key={p} onClick={() => setAmount(String(p))}
                        className="py-2 rounded-xl text-[10px] font-black transition-all"
                        style={Number(amount) === p
                          ? { background: 'rgba(0,212,170,0.18)', color: '#00d4aa', border: '1.5px solid rgba(0,212,170,0.35)' }
                          : { background: 'rgba(15,21,37,0.9)', color: '#64748b', border: '1px solid rgba(148,163,184,0.08)' }}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setAmount(String(BALANCES[asset]))}
                      className="py-2 rounded-xl text-[10px] font-black transition-all"
                      style={{ background: 'rgba(15,21,37,0.9)', color: '#64748b', border: '1px solid rgba(148,163,184,0.08)' }}>
                      MAX
                    </button>
                  </div>
                </div>

                {/* Boosters */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Boosters</label>
                  <div className="flex gap-1.5">
                    {BOOSTERS.map(b => {
                      const active = boosts.includes(b.id);
                      return (
                        <button key={b.id} onClick={() => toggleBoost(b.id)}
                          className="flex-1 py-2 px-2 rounded-xl text-[8px] font-bold border transition-all text-center"
                          style={active
                            ? { background: `${b.color}12`, borderColor: `${b.color}30`, color: b.color }
                            : { background: 'rgba(15,21,37,0.9)', borderColor: 'rgba(148,163,184,0.07)', color: '#64748b' }}>
                          {b.label}<br />
                          <span className="opacity-60 font-normal text-[7px]">{b.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* High Roller */}
                {hrMode && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[11px] font-black text-yellow-400">High Roller — +5% payout bonus</span>
                  </div>
                )}

                {/* Payout Preview */}
                {fees && outcome && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(0,212,170,0.15)' }}>

                    {/* Big return row */}
                    <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      <div className="px-4 py-4 text-center" style={{ borderRight: '1px solid rgba(148,163,184,0.06)', background: 'rgba(34,197,94,0.05)' }}>
                        <p className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">Total Return</p>
                        <p className="text-[24px] font-black font-mono text-emerald-400 leading-none">
                          ${(fees.netStake * fees.finalMultiplier).toFixed(2)}
                        </p>
                        <p className="text-[8px] text-slate-700 mt-1">{asset}</p>
                      </div>
                      <div className="px-4 py-4 text-center" style={{ background: 'rgba(34,197,94,0.05)' }}>
                        <p className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">Net Profit</p>
                        <p className="text-[24px] font-black font-mono text-emerald-400 leading-none">
                          +${fees.profit.toFixed(2)}
                        </p>
                        <p className="text-[8px] text-slate-700 mt-1">{fees.finalMultiplier}x multiplier</p>
                      </div>
                    </div>

                    {/* Detail rows */}
                    <div>
                      {[
                        { label: 'Stake',             value: `${amt} ${asset}`,      color: '#e2e8f0' },
                        { label: `Fee (${(PLATFORM_FEE_RATE*100).toFixed(0)}%)`,  value: `-$${fees.entryFee}`, color: '#f87171' },
                        { label: 'Implied probability', value: `${Math.round(outcome.prob * 100)}%`, color: '#94a3b8' },
                        boosts.includes('insurance')
                          ? { label: `Insurance (${(INSURANCE_RATE*100).toFixed(0)}%)`, value: `-$${fees.insuranceCost}`, color: '#f87171' }
                          : null,
                      ].filter(Boolean).map((row, i) => (
                        <div key={i} className="px-4 py-1.5 flex justify-between text-[10px]" style={{ borderTop: '1px solid rgba(148,163,184,0.04)' }}>
                          <span className="text-slate-600">{row.label}</span>
                          <span className="font-mono font-bold" style={{ color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Parlay */}
                {outcome && !existingBet && (
                  <button onClick={() => onAddToParlay?.({ market, outcome })}
                    className="w-full py-2 rounded-xl text-[10px] font-black transition-all border"
                    style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                    ⚡ Add to Parlay
                  </button>
                )}

                {/* CTA */}
                <button
                  onClick={handleSubmit}
                  disabled={!outcome || blocked || !amt || submitting || isBettingBlocked}
                  className="w-full py-4 rounded-2xl font-black text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed mb-2 active:scale-[0.98]"
                  style={submitting || !outcome
                    ? { background: '#0f1525', color: '#475569', border: '1px solid rgba(148,163,184,0.08)' }
                    : { background: 'linear-gradient(135deg, #00d4aa 0%, #06b6d4 60%, #3b82f6 100%)', color: '#fff', boxShadow: '0 6px 32px rgba(0,212,170,0.35), 0 2px 8px rgba(0,0,0,0.4)' }}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Placing Bet...</>
                  ) : !outcome ? (
                    'Select an outcome above'
                  ) : hrMode ? (
                    <><Crown className="w-4 h-4" />High Roller · Buy {outcome.label} · ${fees?.totalCost ?? amt}</>
                  ) : (
                    `Buy ${outcome.label} · $${fees?.totalCost ?? amt} ${asset}`
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}