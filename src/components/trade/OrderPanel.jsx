import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Zap, Wallet, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, CircleDot, TrendingUp, TrendingDown
} from 'lucide-react';
import { useWallet } from '../shared/WalletContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const PCT_STEPS = [25, 50, 75, 100];
const LEVERAGE_PRESETS = [1, 2, 5, 10, 25, 50, 100];
const MOCK_BALANCE = 4821.36;

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(v, decimals = 2) {
  if (v == null || isNaN(v) || v === '') return '—';
  return Number(v).toFixed(decimals);
}
function fmtUSD(v) {
  if (!v || isNaN(v)) return '$—';
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ label, right }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
        {label}
      </span>
      {right && (
        <span className="text-[9.5px] font-mono" style={{ color: '#475569' }}>{right}</span>
      )}
    </div>
  );
}

function InputRow({ value, onChange, placeholder, prefix, suffix, highlight, error, disabled, step }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? 'rgba(248,113,113,0.5)'
    : highlight
    ? 'rgba(0,212,170,0.4)'
    : focused
    ? 'rgba(148,163,184,0.22)'
    : 'rgba(148,163,184,0.08)';
  const glow = highlight
    ? '0 0 0 3px rgba(0,212,170,0.07)'
    : focused
    ? '0 0 0 2px rgba(148,163,184,0.05)'
    : 'none';

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(4,6,14,0.85)',
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
      }}
    >
      {prefix && (
        <span className="pl-3 pr-1 text-[10px] font-bold select-none whitespace-nowrap" style={{ color: '#3d4f6b' }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? '0.00'}
        disabled={disabled}
        step={step}
        className="flex-1 h-10 px-2.5 bg-transparent font-mono font-semibold text-[13px] text-white placeholder-[#2a3348] focus:outline-none disabled:opacity-40"
        style={{ minWidth: 0 }}
      />
      {suffix && (
        <span className="pr-3 text-[9.5px] font-black select-none" style={{ color: '#3d4f6b' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1 mt-1.5">
      <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f87171' }} />
      <span className="text-[9px] font-semibold" style={{ color: '#f87171' }}>{msg}</span>
    </div>
  );
}

function SummaryRow({ label, value, valueColor, dimTop }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${dimTop ? 'mt-1 pt-2 border-t' : ''}`}
      style={dimTop ? { borderColor: 'rgba(148,163,184,0.06)' } : {}}
    >
      <span className="text-[9.5px]" style={{ color: '#3d4f6b' }}>{label}</span>
      <span
        className="text-[9.5px] font-black font-mono"
        style={{ color: valueColor || '#64748b' }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Validation status badge ──────────────────────────────────────────────────
function ReadinessBadge({ errors, isReady }) {
  if (isReady) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.12)' }}>
        <CheckCircle2 className="w-3 h-3" style={{ color: '#4ade80' }} />
        <span className="text-[9px] font-bold" style={{ color: '#4ade80' }}>Order ready</span>
      </div>
    );
  }
  const msgs = Object.values(errors).filter(Boolean);
  if (msgs.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.07)' }}>
        <CircleDot className="w-3 h-3" style={{ color: '#3d4f6b' }} />
        <span className="text-[9px] font-bold" style={{ color: '#3d4f6b' }}>Fill in order details</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)' }}>
      <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f87171' }} />
      <span className="text-[9px] font-bold truncate" style={{ color: '#f87171' }}>{msgs[0]}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderPanel({ asset, externalPrice }) {
  const { isConnected, requireWallet } = useWallet();

  const maxLev    = asset?.maxLeverage ?? 50;
  const basePrice = asset?.price ?? 0;
  const symbol    = asset?.symbol ?? 'BTC';

  // ── State ──
  const [side, setSide]         = useState('buy');
  const [mode, setMode]         = useState('limit'); // 'limit' | 'market'
  const [price, setPrice]       = useState('');
  const [amount, setAmount]     = useState('');
  const [leverage, setLeverage] = useState(Math.min(10, maxLev));
  const [tp, setTp]             = useState('');
  const [sl, setSl]             = useState('');
  const [showTPSL, setShowTPSL] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [errors, setErrors]     = useState({});

  // Auto-fill from OrderBook click
  useEffect(() => {
    if (externalPrice != null && externalPrice > 0) {
      setPrice(String(externalPrice));
      setMode('limit');
      setErrors(e => ({ ...e, price: null }));
    }
  }, [externalPrice]);

  // ── Derived calculations ──
  const entryPrice  = mode === 'market' ? basePrice : (parseFloat(price) || 0);
  const parsedAmt   = parseFloat(amount) || 0;
  const total       = entryPrice > 0 && parsedAmt > 0 ? entryPrice * parsedAmt : 0;
  const margin      = total / leverage;
  const fee         = total * 0.0005;
  const liqOffset   = entryPrice / leverage * 0.9;
  const liqPrice    = entryPrice > 0
    ? side === 'buy' ? entryPrice - liqOffset : entryPrice + liqOffset
    : null;

  const priceIsValid  = mode === 'market' || (price !== '' && parseFloat(price) > 0);
  const amountIsValid = parsedAmt > 0 && parsedAmt <= MOCK_BALANCE / (entryPrice || 1);

  // ── Validation ──
  const validate = useCallback(() => {
    const e = {};
    if (mode === 'limit' && (!price || parseFloat(price) <= 0))
      e.price = 'Enter a valid limit price';
    if (!parsedAmt || parsedAmt <= 0)
      e.amount = 'Enter an amount';
    if (parsedAmt > 0 && entryPrice > 0 && parsedAmt * entryPrice > MOCK_BALANCE * leverage)
      e.amount = 'Exceeds max position size';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [mode, price, parsedAmt, entryPrice, leverage]);

  const isReady = useMemo(
    () => priceIsValid && amountIsValid && Object.values(errors).every(v => !v),
    [priceIsValid, amountIsValid, errors]
  );

  // ── Quick % allocation (of available balance in base units) ──
  const handlePct = useCallback((pct) => {
    if (!entryPrice || entryPrice === 0) return;
    const usdAmt = MOCK_BALANCE * (pct / 100);
    const baseAmt = usdAmt / entryPrice;
    setAmount(baseAmt.toFixed(6));
    setErrors(e => ({ ...e, amount: null }));
  }, [entryPrice]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1300));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      setPrice('');
      setTp('');
      setSl('');
    }, 2500);
  };

  // ── Colors ──
  const isBuy         = side === 'buy';
  const sideColor     = isBuy ? '#4ade80' : '#f87171';
  const sideBg        = isBuy ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)';
  const sideBorder    = isBuy ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)';
  const SideIcon      = isBuy ? TrendingUp : TrendingDown;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(10,14,26,0.99) 0%, rgba(6,9,18,0.99) 100%)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Dynamic top accent */}
      <div
        className="h-px w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${sideColor}45, ${sideColor}18, transparent)` }}
      />

      {/* ── Buy / Sell toggle ── */}
      <div className="p-3 pb-2.5 border-b" style={{ borderColor: 'rgba(148,163,184,0.055)' }}>
        <div
          className="flex rounded-xl p-0.5"
          style={{ background: 'rgba(4,6,14,0.9)', border: '1px solid rgba(148,163,184,0.07)' }}
        >
          {[['buy', 'Buy / Long'], ['sell', 'Sell / Short']].map(([s, label]) => {
            const active = side === s;
            const c = s === 'buy' ? '#4ade80' : '#f87171';
            return (
              <button
                key={s}
                onClick={() => { setSide(s); setErrors({}); }}
                className="flex-1 py-2.5 rounded-[10px] text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5"
                style={active ? {
                  background: s === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  color: c,
                  border: `1px solid ${s === 'buy' ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.22)'}`,
                  boxShadow: `0 2px 14px ${c}18`,
                } : { color: '#2e3d55', border: '1px solid transparent' }}
              >
                {active && (s === 'buy'
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5">

        {/* Order type tabs */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}
        >
          {[['limit', 'Limit'], ['market', 'Market']].map(([type, label]) => (
            <button
              key={type}
              onClick={() => { setMode(type); setErrors(e => ({ ...e, price: null })); }}
              className="flex-1 py-2 text-[10px] font-black transition-all duration-200"
              style={mode === type ? {
                background: 'rgba(0,212,170,0.1)',
                color: '#00d4aa',
                borderBottom: '2px solid rgba(0,212,170,0.3)',
              } : { color: '#3d4f6b' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Available balance */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: 'rgba(4,6,14,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3 h-3" style={{ color: '#3d4f6b' }} />
            <span className="text-[9.5px] font-bold" style={{ color: '#3d4f6b' }}>Available</span>
          </div>
          <span className="text-[11px] font-black font-mono text-white">
            {MOCK_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' '}<span style={{ color: '#3d4f6b' }}>USDT</span>
          </span>
        </div>

        {/* Price input */}
        {mode === 'limit' ? (
          <div>
            <FieldLabel
              label="Limit Price"
              right={basePrice > 0 ? `Last: $${fmt(basePrice, 2)}` : undefined}
            />
            <InputRow
              value={price}
              onChange={v => { setPrice(v); setErrors(e => ({ ...e, price: null })); }}
              placeholder={basePrice > 0 ? basePrice.toFixed(2) : '0.00'}
              prefix="$"
              suffix="USDT"
              highlight={!!externalPrice && price === String(externalPrice)}
              error={!!errors.price}
              step="0.01"
            />
            <ErrorMsg msg={errors.price} />
          </div>
        ) : (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(4,6,14,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}
          >
            <span className="text-[9.5px] font-bold" style={{ color: '#3d4f6b' }}>Market Price</span>
            <span className="text-[11px] font-black font-mono text-white">
              {basePrice > 0 ? `$${basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </span>
          </div>
        )}

        {/* Amount */}
        <div>
          <FieldLabel
            label={`Amount (${symbol})`}
            right={total > 0 ? `≈ ${fmtUSD(total)}` : undefined}
          />
          <InputRow
            value={amount}
            onChange={v => { setAmount(v); setErrors(e => ({ ...e, amount: null })); }}
            placeholder="0.000000"
            suffix={symbol}
            error={!!errors.amount}
            step="0.000001"
          />
          <ErrorMsg msg={errors.amount} />
          {/* Quick % buttons */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {PCT_STEPS.map(pct => (
              <button
                key={pct}
                onClick={() => handlePct(pct)}
                className="py-1.5 rounded-lg text-[9px] font-black transition-all duration-150"
                style={{
                  background: 'rgba(4,6,14,0.8)',
                  border: '1px solid rgba(148,163,184,0.07)',
                  color: '#3d4f6b',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = sideColor;
                  e.currentTarget.style.borderColor = sideBorder;
                  e.currentTarget.style.background = sideBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#3d4f6b';
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,0.07)';
                  e.currentTarget.style.background = 'rgba(4,6,14,0.8)';
                }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div>
          <FieldLabel label={`Leverage — ${leverage}×`} />
          <div className="flex gap-1 flex-wrap">
            {LEVERAGE_PRESETS.filter(l => l <= maxLev).map(lev => {
              const active = leverage === lev;
              return (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className="flex-1 min-w-[32px] py-1.5 rounded-lg text-[9px] font-black transition-all duration-150"
                  style={active ? {
                    background: 'rgba(0,212,170,0.1)',
                    color: '#00d4aa',
                    border: '1px solid rgba(0,212,170,0.22)',
                    boxShadow: '0 0 10px rgba(0,212,170,0.1)',
                  } : {
                    background: 'rgba(4,6,14,0.8)',
                    color: '#3d4f6b',
                    border: '1px solid rgba(148,163,184,0.07)',
                  }}
                >
                  {lev}×
                </button>
              );
            })}
          </div>
          {/* Risk gradient bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{
                width: `${(leverage / maxLev) * 100}%`,
                background: leverage <= maxLev * 0.2
                  ? '#4ade80'
                  : leverage <= maxLev * 0.5
                  ? '#f59e0b'
                  : '#f87171',
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[8px]" style={{ color: '#2a3348' }}>Low risk</span>
            <span className="text-[8px]" style={{ color: '#2a3348' }}>High risk</span>
          </div>
        </div>

        {/* TP / SL */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(148,163,184,0.07)' }}
        >
          <button
            onClick={() => setShowTPSL(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
            style={{ background: 'rgba(4,6,14,0.6)' }}
          >
            <span className="text-[9.5px] font-bold" style={{ color: showTPSL ? '#00d4aa' : '#3d4f6b' }}>
              Take Profit / Stop Loss
            </span>
            <div className="flex items-center gap-1">
              {(tp || sl) && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4aa' }} />
              )}
              {showTPSL
                ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />
                : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />
              }
            </div>
          </button>
          {showTPSL && (
            <div className="px-3 pb-3 pt-2 space-y-2" style={{ background: 'rgba(4,6,14,0.4)' }}>
              <div>
                <FieldLabel label="Take Profit" />
                <InputRow
                  value={tp}
                  onChange={setTp}
                  placeholder={entryPrice > 0 ? (entryPrice * 1.05).toFixed(2) : '0.00'}
                  prefix="$"
                  suffix="USDT"
                />
              </div>
              <div>
                <FieldLabel label="Stop Loss" />
                <InputRow
                  value={sl}
                  onChange={setSl}
                  placeholder={entryPrice > 0 ? (entryPrice * 0.95).toFixed(2) : '0.00'}
                  prefix="$"
                  suffix="USDT"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div
          className="rounded-xl px-3 py-2"
          style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.06)' }}
        >
          <SummaryRow
            label="Order Type"
            value={mode === 'limit' ? 'Limit' : 'Market'}
            valueColor="#64748b"
          />
          <SummaryRow
            label="Est. Entry"
            value={
              mode === 'market'
                ? 'Market Price'
                : price && parseFloat(price) > 0
                ? `$${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '—'
            }
            valueColor="#94a3b8"
          />
          <SummaryRow
            label="Total Value"
            value={total > 0 ? fmtUSD(total) : '—'}
            valueColor={total > 0 ? '#e2e8f0' : undefined}
          />
          <SummaryRow
            label="Margin Required"
            value={total > 0 ? fmtUSD(margin) : '—'}
            valueColor={total > 0 ? '#94a3b8' : undefined}
          />
          <SummaryRow
            label="Liq. Price"
            value={total > 0 && liqPrice ? `$${fmt(liqPrice, 2)}` : '—'}
            valueColor={total > 0 ? '#f87171' : undefined}
          />
          <SummaryRow
            label="Est. Fee"
            value={total > 0 ? `$${fee.toFixed(4)}` : '0.050%'}
            valueColor="#64748b"
            dimTop
          />
        </div>

        {/* Readiness badge */}
        <ReadinessBadge errors={errors} isReady={isReady && parsedAmt > 0} />
      </div>

      {/* ── Submit footer ── */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.055)', background: 'rgba(4,6,14,0.7)' }}>
        {isConnected ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            style={{
              background: submitted
                ? 'rgba(74,222,128,0.15)'
                : `linear-gradient(135deg, ${sideColor}18, ${sideColor}0c)`,
              color: submitted ? '#4ade80' : sideColor,
              border: `1px solid ${submitted ? 'rgba(74,222,128,0.3)' : sideBorder}`,
              boxShadow: submitted
                ? '0 0 24px rgba(74,222,128,0.12)'
                : `0 4px 24px ${sideColor}12`,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitted ? (
              <><CheckCircle2 className="w-4 h-4" /> Order Submitted!</>
            ) : submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <SideIcon className="w-4 h-4" />
                {isBuy ? 'Buy / Long' : 'Sell / Short'}
                {total > 0 && (
                  <span className="text-[10px] font-semibold opacity-70 ml-1">· {fmtUSD(total)}</span>
                )}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => requireWallet()}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: 'rgba(0,212,170,0.06)',
              color: '#00d4aa',
              border: '1px solid rgba(0,212,170,0.15)',
            }}
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet to Trade
          </button>
        )}
      </div>
    </div>
  );
}