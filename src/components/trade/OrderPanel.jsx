import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Wallet, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';
import { useWallet } from '../shared/WalletContext';
import CollateralSelector from './CollateralSelector';
import { getCollateralAsset, getCollateralValue } from './CollateralEngine';

// ─── Constants ────────────────────────────────────────────────────────────────
const ORDER_TYPES  = [['market','Market'], ['limit','Limit']];
const PCT_STEPS    = [25, 50, 75, 100];
const LEVERAGE_PRESETS = [1, 2, 5, 10, 25, 50, 100];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt2(v) { return v != null && !isNaN(v) ? Number(v).toFixed(2) : '—'; }
function fmtCcy(v) {
  if (v == null || isNaN(v)) return '$—';
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

// ─── Field Input ──────────────────────────────────────────────────────────────
function Field({ label, right, children, error }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        {right && <span className="text-[10px] text-slate-600">{right}</span>}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1">
          <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
          <span className="text-[9px] text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Numeric input ────────────────────────────────────────────────────────────
function NumInput({ value, onChange, placeholder, prefix, suffix, error, disabled, highlight }) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden transition-all"
      style={{
        background: 'rgba(5,7,13,0.8)',
        border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : highlight ? 'rgba(0,212,170,0.3)' : 'rgba(148,163,184,0.09)'}`,
        boxShadow: highlight ? '0 0 0 3px rgba(0,212,170,0.06)' : 'none',
      }}
    >
      {prefix && (
        <span className="pl-3 text-[10px] font-bold text-slate-600 select-none">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-10 px-3 bg-transparent text-sm font-mono font-semibold text-white placeholder-slate-700 focus:outline-none disabled:opacity-40"
        style={{ minWidth: 0 }}
      />
      {suffix && (
        <span className="pr-3 text-[10px] font-bold text-slate-500 select-none">{suffix}</span>
      )}
    </div>
  );
}

// ─── Summary row ─────────────────────────────────────────────────────────────
function SummaryRow({ label, value, valueColor, highlight }) {
  return (
    <div className={`flex items-center justify-between py-1 ${highlight ? 'border-t border-[rgba(148,163,184,0.07)] mt-1 pt-2' : ''}`}>
      <span className="text-[10px] text-slate-600">{label}</span>
      <span className="text-[10px] font-semibold font-mono" style={{ color: valueColor || '#94a3b8' }}>{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderPanel({ asset, externalPrice }) {
  const { t } = useLang();
  const { isConnected, requireWallet } = useWallet();

  const maxLev = asset?.maxLeverage || 50;
  const basePrice = asset?.price || 0;

  const [side, setSide]           = useState('buy');
  const [orderType, setOrderType] = useState('limit');
  const [limitPrice, setLimitPrice] = useState('');
  const [amount, setAmount]       = useState('');
  const [leverage, setLeverage]   = useState(Math.min(10, maxLev));
  const [collateral, setCollateral] = useState(getCollateralAsset('USDT'));
  const [showTPSL, setShowTPSL]   = useState(false);
  const [tpPrice, setTpPrice]     = useState('');
  const [slPrice, setSlPrice]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [errors, setErrors]       = useState({});

  // Auto-fill price from OrderBook click
  useEffect(() => {
    if (externalPrice != null) {
      setLimitPrice(String(externalPrice));
      setOrderType('limit');
    }
  }, [externalPrice]);

  const entryPrice   = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : basePrice;
  const parsedAmt    = parseFloat(amount) || 0;
  const { effectiveUSD: margin } = getCollateralValue(collateral, parsedAmt || collateral.balance * 0.5);
  const positionSize = margin * leverage;
  const fee          = positionSize * 0.0005;
  const liqDist      = 1 / leverage;
  const liqPrice     = entryPrice
    ? side === 'buy'
      ? entryPrice * (1 - liqDist * 0.9)
      : entryPrice * (1 + liqDist * 0.9)
    : null;

  const handlePct = useCallback((pct) => {
    const bal = collateral.balance;
    const val = pct === 100 ? bal : bal * (pct / 100);
    setAmount(val.toFixed(4));
    setErrors(e => ({ ...e, amount: null }));
  }, [collateral.balance]);

  const validate = () => {
    const e = {};
    if (!parsedAmt || parsedAmt <= 0) e.amount = 'Enter a valid amount';
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) e.price = 'Enter a valid price';
    if (parsedAmt > collateral.balance) e.amount = 'Exceeds available balance';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      setLimitPrice('');
    }, 2000);
  };

  const isBuy = side === 'buy';
  const accentColor = isBuy ? '#4ade80' : '#f87171';
  const accentBg    = isBuy ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';
  const accentBorder = isBuy ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)';

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.09)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top accent */}
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accentColor}40, transparent)` }} />

      {/* Header: Buy / Sell toggle */}
      <div className="p-3 border-b" style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(5,7,13,0.6)' }}>
        <div
          className="flex rounded-xl p-0.5 gap-0.5"
          style={{ background: 'rgba(5,7,13,0.8)', border: '1px solid rgba(148,163,184,0.07)' }}
        >
          {[['buy','Buy / Long'],['sell','Sell / Short']].map(([s, label]) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className="flex-1 py-2.5 rounded-[10px] text-xs font-black transition-all"
              style={side === s ? {
                background: s === 'buy' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                color: s === 'buy' ? '#4ade80' : '#f87171',
                border: `1px solid ${s === 'buy' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                boxShadow: `0 2px 12px ${s === 'buy' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}`,
              } : { color: '#475569' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">

        {/* Order type tabs */}
        <div className="flex gap-1">
          {ORDER_TYPES.map(([type, label]) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={orderType === type ? {
                background: 'rgba(0,212,170,0.1)',
                color: '#00d4aa',
                border: '1px solid rgba(0,212,170,0.2)',
              } : {
                color: '#475569',
                border: '1px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Collateral */}
        <CollateralSelector selected={collateral} onSelect={setCollateral} amount={parsedAmt} />

        {/* Available balance */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: 'rgba(5,7,13,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3 h-3 text-slate-600" />
            <span className="text-[10px] text-slate-600">Available</span>
          </div>
          <span className="text-[11px] font-black font-mono text-white">
            {collateral.balance.toLocaleString()} <span className="text-slate-500">{collateral.symbol}</span>
          </span>
        </div>

        {/* Price input (limit only) */}
        {orderType === 'limit' && (
          <Field label="Limit Price" error={errors.price}>
            <NumInput
              value={limitPrice}
              onChange={v => { setLimitPrice(v); setErrors(e => ({ ...e, price: null })); }}
              placeholder={basePrice ? basePrice.toFixed(2) : '0.00'}
              prefix="$"
              suffix="USDT"
              error={!!errors.price}
              highlight={!!externalPrice && limitPrice === String(externalPrice)}
            />
          </Field>
        )}

        {/* Amount */}
        <Field
          label="Amount"
          right={`≈ ${fmtCcy(parsedAmt * (entryPrice || basePrice))}`}
          error={errors.amount}
        >
          <NumInput
            value={amount}
            onChange={v => { setAmount(v); setErrors(e => ({ ...e, amount: null })); }}
            placeholder="0.0000"
            suffix={collateral.symbol}
            error={!!errors.amount}
          />
          {/* Quick % buttons */}
          <div className="flex gap-1 mt-2">
            {PCT_STEPS.map(pct => (
              <button
                key={pct}
                onClick={() => handlePct(pct)}
                className="flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all"
                style={{
                  background: 'rgba(5,7,13,0.8)',
                  border: '1px solid rgba(148,163,184,0.07)',
                  color: '#475569',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00d4aa'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.07)'; }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        </Field>

        {/* Leverage */}
        <Field label={`Leverage  ${leverage}×`}>
          <div className="flex gap-1 flex-wrap">
            {LEVERAGE_PRESETS.filter(l => l <= maxLev).map(lev => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className="flex-1 min-w-[28px] py-1.5 rounded-lg text-[9px] font-black transition-all"
                style={leverage === lev ? {
                  background: 'rgba(0,212,170,0.12)',
                  color: '#00d4aa',
                  border: '1px solid rgba(0,212,170,0.2)',
                } : {
                  background: 'rgba(5,7,13,0.8)',
                  color: '#475569',
                  border: '1px solid rgba(148,163,184,0.07)',
                }}
              >
                {lev}×
              </button>
            ))}
          </div>
          {/* Risk bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(leverage / maxLev) * 100}%`,
                background: leverage <= maxLev * 0.2 ? '#4ade80'
                  : leverage <= maxLev * 0.5 ? '#f59e0b' : '#f87171',
              }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-700 mt-0.5">
            <span>Conservative</span><span>High Risk</span>
          </div>
        </Field>

        {/* TP / SL collapsible */}
        <div>
          <button
            onClick={() => setShowTPSL(v => !v)}
            className="w-full flex items-center justify-between py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span>Take Profit / Stop Loss</span>
            {showTPSL ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showTPSL && (
            <div className="space-y-2">
              <NumInput
                value={tpPrice}
                onChange={setTpPrice}
                placeholder="Take Profit price"
                prefix="TP $"
                suffix="USDT"
              />
              <NumInput
                value={slPrice}
                onChange={setSlPrice}
                placeholder="Stop Loss price"
                prefix="SL $"
                suffix="USDT"
              />
            </div>
          )}
        </div>

        {/* Order summary */}
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(5,7,13,0.7)', border: '1px solid rgba(148,163,184,0.06)' }}
        >
          <SummaryRow label="Order Type" value={orderType === 'market' ? 'Market' : 'Limit'} />
          <SummaryRow
            label="Est. Entry"
            value={orderType === 'market' ? 'Market' : limitPrice ? `$${fmt2(parseFloat(limitPrice))}` : '—'}
          />
          <SummaryRow
            label="Position Size"
            value={parsedAmt > 0 ? `$${positionSize.toFixed(0)}` : '—'}
          />
          <SummaryRow
            label="Liq. Price"
            value={parsedAmt > 0 && liqPrice ? `$${fmt2(liqPrice)}` : '—'}
            valueColor={parsedAmt > 0 ? '#f87171' : undefined}
          />
          <SummaryRow
            label="Trading Fee"
            value={parsedAmt > 0 ? `$${fee.toFixed(4)}` : '0.05%'}
            highlight
          />
        </div>
      </div>

      {/* Submit */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(5,7,13,0.6)' }}>
        {isConnected ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{
              background: submitted
                ? 'rgba(74,222,128,0.2)'
                : submitting
                ? accentBg
                : `linear-gradient(135deg, ${accentColor}22, ${accentColor}14)`,
              border: `1px solid ${submitted ? 'rgba(74,222,128,0.4)' : accentBorder}`,
              boxShadow: submitted ? '0 0 20px rgba(74,222,128,0.15)' : `0 4px 20px ${accentColor}15`,
              color: submitted ? '#4ade80' : accentColor,
            }}
          >
            {submitted ? (
              <><CheckCircle className="w-4 h-4" /> Order Placed!</>
            ) : submitting ? (
              <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Placing...</>
            ) : (
              <><Zap className="w-4 h-4" /> {isBuy ? 'Buy / Long' : 'Sell / Short'} {parsedAmt > 0 ? `· $${positionSize.toFixed(0)}` : ''}</>
            )}
          </button>
        ) : (
          <button
            onClick={() => requireWallet()}
            className="w-full py-3.5 rounded-xl font-black text-sm text-[#00d4aa] transition-all flex items-center justify-center gap-2"
            style={{
              background: 'rgba(0,212,170,0.06)',
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