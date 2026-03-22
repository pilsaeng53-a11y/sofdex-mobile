import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Zap, Wallet, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, CircleDot, TrendingUp, TrendingDown,
  DollarSign, Coins, Percent, ShieldCheck, ShieldAlert, ShieldX,
  Info
} from 'lucide-react';
import { useWallet } from '../shared/WalletContext';
import CoinIcon from '../shared/CoinIcon';
import LeverageControls from './LeverageControls';
import { formatOrderlyError } from '../../services/orderly/orderlyErrors';

// ─── Constants ────────────────────────────────────────────────────────────────
const PCT_STEPS    = [25, 50, 75, 100];
const MOCK_BALANCE = 4821.36;
const TAKER_FEE    = 0.0005; // 0.05%
const MAKER_FEE    = 0.0002; // 0.02%
const MAINTENANCE_MARGIN_RATE = 0.005; // 0.5% maintenance margin

const DENOM_MODES = [
  { id: 'base',    label: 'Coin',  shortLabel: 'Coin', Icon: Coins },
  { id: 'quote',   label: 'USDC',  shortLabel: 'USDC', Icon: DollarSign },
  { id: 'percent', label: '%',     shortLabel: '%',    Icon: Percent },
];

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
function smartDecimals(price) {
  if (!price || price === 0) return 2;
  if (price >= 1000) return 2;
  if (price >= 1)    return 4;
  return 6;
}
function fmtPct(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

// ─── Liquidation math ─────────────────────────────────────────────────────────
// Standard futures liquidation price formula:
//   Long:  liq = entry * (1 - 1/leverage + maintenanceMarginRate)
//   Short: liq = entry * (1 + 1/leverage - maintenanceMarginRate)
function calcLiqPrice(entryPrice, leverage, side) {
  if (!entryPrice || !leverage || entryPrice <= 0 || leverage <= 0) return null;
  if (side === 'buy') {
    return entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN_RATE);
  }
  return entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN_RATE);
}

function calcLiqDistance(entryPrice, liqPrice, side) {
  if (!entryPrice || !liqPrice) return null;
  const diff = side === 'buy' ? entryPrice - liqPrice : liqPrice - entryPrice;
  const pct  = (diff / entryPrice) * 100;
  return { diff, pct };
}

function getRiskState(liqDistPct) {
  if (liqDistPct == null) return 'none';
  if (liqDistPct > 20) return 'safe';
  if (liqDistPct > 8)  return 'warning';
  return 'danger';
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FieldLabel({ label, right }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
        {label}
      </span>
      {right && <span className="text-[9.5px] font-mono" style={{ color: '#475569' }}>{right}</span>}
    </div>
  );
}

function InputRow({ value, onChange, placeholder, prefix, suffix, highlight, error, disabled, step, readOnly }) {
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
      className="flex items-center rounded-xl overflow-hidden transition-all duration-150"
      style={{ background: 'rgba(4,6,14,0.85)', border: `1px solid ${borderColor}`, boxShadow: glow }}
    >
      {prefix && (
        <span className="pl-3 pr-1 text-[10px] font-bold select-none whitespace-nowrap" style={{ color: '#3d4f6b' }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? '0.00'}
        disabled={disabled}
        readOnly={readOnly}
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

function DenomSelector({ value, onChange, symbol }) {
  return (
    <div
      className="flex rounded-lg overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(4,6,14,0.9)', border: '1px solid rgba(148,163,184,0.09)' }}
    >
      {DENOM_MODES.map(({ id, shortLabel, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={id === 'base' ? `Amount in ${symbol}` : id === 'quote' ? 'Amount in USDC' : 'Percentage of balance'}
            className="flex items-center gap-1 px-2.5 py-2 text-[9px] font-black transition-all duration-150"
            style={active ? {
              background: 'rgba(0,212,170,0.12)',
              color: '#00d4aa',
              borderBottom: '1.5px solid rgba(0,212,170,0.4)',
            } : {
              color: '#2e3d55',
              borderBottom: '1.5px solid transparent',
            }}
          >
            <Icon className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">{id === 'base' ? symbol : shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ state }) {
  const config = {
    safe:    { Icon: ShieldCheck,  color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)',  label: 'SAFE' },
    warning: { Icon: ShieldAlert,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)', label: 'WARNING' },
    danger:  { Icon: ShieldX,      color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)',label: 'DANGER' },
    none:    { Icon: CircleDot,    color: '#3d4f6b', bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.07)', label: '—' },
  }[state] ?? { Icon: CircleDot, color: '#3d4f6b', bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.07)', label: '—' };

  const { Icon, color, bg, border, label } = config;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-[9px] font-black tracking-widest uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Liquidation Panel ────────────────────────────────────────────────────────
function LiquidationPanel({ entryPrice, liqPrice, liqDistance, riskState, margin, positionValue, side }) {
  const hasData = entryPrice > 0 && liqPrice != null;
  const sideLabel = side === 'buy' ? 'Long' : 'Short';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(4,6,14,0.5)' }}
      >
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
          Liquidation Risk
        </span>
        <RiskBadge state={riskState} />
      </div>

      <div className="px-3 py-2.5 space-y-1.5">
        {/* Liquidation price row */}
        <div className="flex items-center justify-between">
          <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Liq. Price ({sideLabel})</span>
          <span className="text-[9.5px] font-black font-mono" style={{ color: hasData ? '#f87171' : '#2a3348' }}>
            {hasData ? `$${fmt(liqPrice, 2)}` : '—'}
          </span>
        </div>

        {/* Distance rows */}
        {hasData && liqDistance && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Distance (%)</span>
              <span
                className="text-[9.5px] font-black font-mono"
                style={{ color: riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80' }}
              >
                {fmtPct(-liqDistance.pct)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Distance ($)</span>
              <span className="text-[9.5px] font-black font-mono" style={{ color: '#64748b' }}>
                ${fmt(liqDistance.diff, 2)}
              </span>
            </div>
          </>
        )}

        {/* Risk bar */}
        {hasData && liqDistance && (
          <div className="pt-1">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-400"
                style={{
                  width: `${Math.min(100, Math.max(2, 100 - liqDistance.pct * 3))}%`,
                  background: riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80',
                }}
              />
            </div>
          </div>
        )}

        {/* Margin + Position value */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t" style={{ borderColor: 'rgba(148,163,184,0.05)' }}>
          <div>
            <p className="text-[8.5px] mb-0.5" style={{ color: '#2a3348' }}>Est. Margin</p>
            <p className="text-[10px] font-black font-mono" style={{ color: margin > 0 ? '#f59e0b' : '#2a3348' }}>
              {margin > 0 ? fmtUSD(margin) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[8.5px] mb-0.5" style={{ color: '#2a3348' }}>Position Value</p>
            <p className="text-[10px] font-black font-mono" style={{ color: positionValue > 0 ? '#94a3b8' : '#2a3348' }}>
              {positionValue > 0 ? fmtUSD(positionValue) : '—'}
            </p>
          </div>
        </div>

        {/* Placeholder */}
        {!hasData && (
          <p className="text-[9px] text-center py-1" style={{ color: '#2a3348' }}>
            Enter price &amp; amount to see liquidation risk
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function SummaryRow({ label, value, valueColor, dimTop }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${dimTop ? 'mt-1 pt-2 border-t' : ''}`}
      style={dimTop ? { borderColor: 'rgba(148,163,184,0.06)' } : {}}
    >
      <span className="text-[9px]" style={{ color: '#3d4f6b' }}>{label}</span>
      <span className="text-[9.5px] font-black font-mono" style={{ color: valueColor || '#64748b' }}>
        {value}
      </span>
    </div>
  );
}

function OrderSummary({ mode, side, denom, symbol, entryPrice, baseQty, quoteQty, leverage, fee, margin, liqPrice, liqDistance, riskState, balance, isReady, riskLevel, activePct }) {
  const sideColor  = side === 'buy' ? '#4ade80' : '#f87171';
  const riskColor  = riskLevel === 'Low' ? '#4ade80' : riskLevel === 'Med' ? '#f59e0b' : '#f87171';
  const hasOrder   = quoteQty > 0 && entryPrice > 0;

  return (
    <div
      className="rounded-xl px-3 py-2.5 space-y-0.5 transition-all duration-300"
      style={{
        background: isReady ? 'rgba(0,212,170,0.03)' : 'rgba(4,6,14,0.7)',
        border: isReady ? '1px solid rgba(0,212,170,0.1)' : '1px solid rgba(148,163,184,0.06)',
      }}
    >
      <div className="flex items-center justify-between pb-1.5 mb-0.5" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        <span className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
          Order Summary
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full font-mono"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
            {leverage}×
          </span>
          <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ background: isReady ? 'rgba(0,212,170,0.1)' : 'rgba(148,163,184,0.06)', color: isReady ? '#00d4aa' : '#3d4f6b' }}>
            {isReady ? 'READY' : 'PENDING'}
          </span>
        </div>
      </div>

      <SummaryRow label="Direction"       value={side === 'buy' ? '▲ Long' : '▼ Short'} valueColor={sideColor} />
      <SummaryRow label="Order Type"      value={mode === 'limit' ? 'Limit' : 'Market'}  valueColor="#64748b" />
      <SummaryRow label="Amount Mode"     value={denom === 'base' ? symbol : denom === 'quote' ? 'USDC' : '%'} valueColor="#64748b" />
      <SummaryRow
        label="Entry Price"
        value={entryPrice > 0 ? (mode === 'market' ? `~$${entryPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${entryPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`) : '—'}
        valueColor="#94a3b8"
      />
      <SummaryRow
        label="Est. Quantity"
        value={baseQty > 0 ? `${baseQty.toFixed(6)} ${symbol}` : '—'}
        valueColor={baseQty > 0 ? '#94a3b8' : undefined}
      />
      <SummaryRow
        label="Est. Total"
        value={quoteQty > 0 ? fmtUSD(quoteQty) : '—'}
        valueColor={quoteQty > 0 ? '#e2e8f0' : undefined}
        dimTop
      />
      <SummaryRow
        label={`Est. Margin (÷${leverage}×)`}
        value={margin > 0 ? fmtUSD(margin) : '—'}
        valueColor={margin > 0 ? '#f59e0b' : undefined}
      />
      <SummaryRow
        label="Balance After"
        value={margin > 0 ? fmtUSD(Math.max(0, balance - margin)) : '—'}
        valueColor={margin > 0 && (balance - margin) < balance * 0.2 ? '#f87171' : '#475569'}
      />
      <SummaryRow
        label="Liq. Price"
        value={liqPrice != null && liqPrice > 0 ? `$${fmt(liqPrice, 2)}` : '—'}
        valueColor={liqPrice != null && liqPrice > 0 ? '#f87171' : undefined}
        dimTop
      />
      {liqDistance && (
        <SummaryRow
          label="Dist. to Liq."
          value={`${fmtPct(-liqDistance.pct)} / $${fmt(liqDistance.diff, 2)}`}
          valueColor={riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80'}
        />
      )}
      <SummaryRow label="Risk Level"      value={riskLevel ?? '—'} valueColor={riskLevel ? riskColor : undefined} />
      <SummaryRow label={`Est. Fee (${mode === 'limit' ? '0.02%' : '0.05%'})`} value={fee > 0 ? `$${fee.toFixed(4)}` : '—'} valueColor="#64748b" />
      {activePct && (
        <SummaryRow label="Size Allocation" value={`${activePct}% of balance`} valueColor="#475569" />
      )}
    </div>
  );
}

// ─── Readiness badge ──────────────────────────────────────────────────────────
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

// ─── Price applied flash ──────────────────────────────────────────────────────
function PriceAppliedFlash({ show }) {
  if (!show) return null;
  return (
    <div
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg pointer-events-none transition-all duration-300"
      style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}
    >
      <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#00d4aa' }} />
      <span className="text-[8.5px] font-black" style={{ color: '#00d4aa' }}>Applied</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderPanel({ asset, externalPrice }) {
  const { isConnected, requireWallet } = useWallet();

  const maxLev    = asset?.maxLeverage ?? 50;
  const basePrice = asset?.price ?? 0;
  const symbol    = asset?.symbol ?? 'BTC';

  // ── Core state ──
  const [side,      setSide]      = useState('buy');
  const [mode,      setMode]      = useState('limit');
  const [denom,     setDenom]     = useState('base');
  const [price,     setPrice]     = useState('');
  const [amount,    setAmount]    = useState('');
  const [leverage,  setLeverage]  = useState(Math.min(10, maxLev));
  const [tp,        setTp]        = useState('');
  const [sl,        setSl]        = useState('');
  const [showTPSL,  setShowTPSL]  = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors,    setErrors]    = useState({});

  // Track active percentage button so re-deriving works on leverage/price change
  const [activePct,     setActivePct]     = useState(null); // null | 25 | 50 | 75 | 100
  const [priceFlash,    setPriceFlash]    = useState(false);
  const priceFlashTimer = useRef(null);

  // ── Reset on symbol change ──
  useEffect(() => {
    setAmount('');
    setErrors({});
    setActivePct(null);
  }, [symbol]);

  // ── Auto-fill price from OrderBook click ──
  useEffect(() => {
    if (externalPrice != null && externalPrice > 0) {
      setPrice(String(externalPrice));
      setMode('limit');
      setErrors(e => ({ ...e, price: null }));
      // Show flash
      clearTimeout(priceFlashTimer.current);
      setPriceFlash(true);
      priceFlashTimer.current = setTimeout(() => setPriceFlash(false), 1500);
    }
    return () => clearTimeout(priceFlashTimer.current);
  }, [externalPrice]);

  // ── Resolved entry price ──
  const entryPrice = useMemo(() => {
    if (mode === 'market') return basePrice;
    const p = parseFloat(price);
    return p > 0 ? p : 0;
  }, [mode, price, basePrice]);

  // ── Derive amount from activePct whenever leverage, entryPrice, or denom changes ──
  // This ensures pct buttons stay accurate when leverage/price change
  const pctDerivedAmount = useMemo(() => {
    if (!activePct || entryPrice <= 0) return null;
    const usdAvailable = MOCK_BALANCE * (activePct / 100);
    // How much position can I control with leverage?
    const positionUSD = usdAvailable * leverage;
    if (denom === 'quote') return usdAvailable.toFixed(2);
    if (denom === 'base')  return (positionUSD / entryPrice).toFixed(6);
    if (denom === 'percent') return String(activePct);
    return null;
  }, [activePct, entryPrice, leverage, denom]);

  // The effective amount: use pctDerived if active pct is set, otherwise manual input
  const effectiveAmount = activePct ? (pctDerivedAmount ?? amount) : amount;

  const parsedAmt = parseFloat(effectiveAmount) || 0;

  // ── Calculate base/quote quantities ──
  const { baseQty, quoteQty } = useMemo(() => {
    if (entryPrice <= 0 || parsedAmt <= 0) return { baseQty: 0, quoteQty: 0 };
    if (denom === 'base') {
      return { baseQty: parsedAmt, quoteQty: parsedAmt * entryPrice };
    }
    if (denom === 'quote') {
      // In quote mode, the entered amount IS the margin; position = amount * leverage
      const positionUSD = parsedAmt * leverage;
      return { baseQty: positionUSD / entryPrice, quoteQty: positionUSD };
    }
    if (denom === 'percent') {
      const usdAmt = MOCK_BALANCE * (parsedAmt / 100);
      const positionUSD = usdAmt * leverage;
      return { baseQty: positionUSD / entryPrice, quoteQty: positionUSD };
    }
    return { baseQty: 0, quoteQty: 0 };
  }, [denom, parsedAmt, entryPrice, leverage]);

  // ── Margin: amount the user actually puts up ──
  const margin = useMemo(() => {
    if (quoteQty <= 0) return 0;
    return quoteQty / leverage;
  }, [quoteQty, leverage]);

  const feeRate = mode === 'limit' ? MAKER_FEE : TAKER_FEE;
  const fee     = quoteQty * feeRate;

  // ── Liquidation calculations ──
  const liqPrice    = useMemo(() => calcLiqPrice(entryPrice, leverage, side), [entryPrice, leverage, side]);
  const liqDistance = useMemo(() => calcLiqDistance(entryPrice, liqPrice, side), [entryPrice, liqPrice, side]);
  const riskState   = useMemo(() => {
    if (!quoteQty) return 'none';
    return getRiskState(liqDistance?.pct ?? null);
  }, [liqDistance, quoteQty]);

  const riskLevel = useMemo(() => {
    const pct = leverage / maxLev;
    if (pct <= 0.2) return 'Low';
    if (pct <= 0.5) return 'Med';
    return 'High';
  }, [leverage, maxLev]);

  // ── Validation flags ──
  const priceIsValid  = mode === 'market' || (price !== '' && parseFloat(price) > 0);
  const amountIsValid = parsedAmt > 0;

  const validate = useCallback(() => {
    const e = {};
    if (mode === 'limit' && (!price || parseFloat(price) <= 0))
      e.price = 'Enter a valid limit price';
    if (!amountIsValid)
      e.amount = 'Enter an amount';
    if (denom === 'percent' && parsedAmt > 100)
      e.amount = 'Percentage cannot exceed 100%';
    if (margin > MOCK_BALANCE)
      e.amount = 'Insufficient balance';
    if (entryPrice <= 0 && mode === 'market')
      e.price = 'Market price unavailable — data may be stale';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [mode, price, amountIsValid, denom, parsedAmt, margin, entryPrice]);

  const isReady = useMemo(
    () => priceIsValid && amountIsValid && Object.values(errors).every(v => !v) && quoteQty > 0 && margin <= MOCK_BALANCE,
    [priceIsValid, amountIsValid, errors, quoteQty, margin]
  );

  // ── Percentage button handler ──
  const handlePct = useCallback((pct) => {
    // Toggle off if same pct
    if (activePct === pct) {
      setActivePct(null);
      setAmount('');
      return;
    }
    setActivePct(pct);
    setErrors(e => ({ ...e, amount: null }));
  }, [activePct]);

  // Sync pctDerived → amount state so InputRow shows the value
  useEffect(() => {
    if (activePct && pctDerivedAmount) {
      setAmount(pctDerivedAmount);
    }
  }, [activePct, pctDerivedAmount]);

  // ── Manual amount edit clears active pct ──
  const handleAmountChange = useCallback((v) => {
    setAmount(v);
    setActivePct(null);
    setErrors(e => ({ ...e, amount: null }));
  }, []);

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await new Promise(r => setTimeout(r, 1300));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setAmount('');
        setPrice('');
        setTp('');
        setSl('');
        setActivePct(null);
      }, 2500);
    } catch (err) {
      const msg = formatOrderlyError(err);
      setErrors(e => ({ ...e, submit: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ──
  const amountPlaceholder = denom === 'base' ? '0.000000' : denom === 'quote' ? '0.00' : '0';
  const amountSuffix      = denom === 'base' ? symbol : denom === 'quote' ? 'USDC' : '%';
  const amountStep        = denom === 'base' ? '0.000001' : denom === 'quote' ? '0.01' : '1';

  const isBuy      = side === 'buy';
  const sideColor  = isBuy ? '#4ade80' : '#f87171';
  const sideBg     = isBuy ? 'rgba(74,222,128,0.1)'  : 'rgba(248,113,113,0.1)';
  const sideBorder = isBuy ? 'rgba(74,222,128,0.2)'  : 'rgba(248,113,113,0.2)';
  const SideIcon   = isBuy ? TrendingUp : TrendingDown;

  const insufficientBalance = margin > MOCK_BALANCE;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(10,14,26,0.99) 0%, rgba(6,9,18,0.99) 100%)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Dynamic accent bar */}
      <div className="h-px w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${sideColor}45, ${sideColor}18, transparent)` }} />

      {/* Symbol header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.055)', background: 'rgba(4,6,14,0.6)' }}>
        <CoinIcon symbol={symbol} size={20} />
        <span className="text-[12px] font-black text-white">{symbol}</span>
        <span className="text-[9px] text-slate-600">/USDC Perpetual</span>
        {basePrice > 0 && (
          <span className="ml-auto font-mono text-[10px] font-semibold" style={{ color: '#64748b' }}>
            ${basePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Buy / Sell toggle */}
      <div className="p-3 pb-2.5 border-b" style={{ borderColor: 'rgba(148,163,184,0.055)' }}>
        <div className="flex rounded-xl p-0.5"
          style={{ background: 'rgba(4,6,14,0.9)', border: '1px solid rgba(148,163,184,0.07)' }}>
          {[['buy', 'Buy / Long'], ['sell', 'Sell / Short']].map(([s, label]) => {
            const active = side === s;
            const c = s === 'buy' ? '#4ade80' : '#f87171';
            return (
              <button key={s}
                onClick={() => { setSide(s); setErrors({}); }}
                className="flex-1 py-2.5 rounded-[10px] text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5"
                style={active ? {
                  background: s === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  color: c,
                  border: `1px solid ${s === 'buy' ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.22)'}`,
                  boxShadow: `0 2px 14px ${c}18`,
                } : { color: '#2e3d55', border: '1px solid transparent' }}
              >
                {active && (s === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5 scrollbar-none">

        {/* Order type tabs */}
        <div className="flex rounded-lg overflow-hidden"
          style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}>
          {[['limit', 'Limit'], ['market', 'Market']].map(([type, label]) => (
            <button key={type}
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
        <div className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: insufficientBalance ? 'rgba(248,113,113,0.05)' : 'rgba(4,6,14,0.6)', border: insufficientBalance ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(148,163,184,0.06)' }}>
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3 h-3" style={{ color: insufficientBalance ? '#f87171' : '#3d4f6b' }} />
            <span className="text-[9.5px] font-bold" style={{ color: insufficientBalance ? '#f87171' : '#3d4f6b' }}>
              {insufficientBalance ? 'Insufficient Balance' : 'Available'}
            </span>
          </div>
          <span className="text-[11px] font-black font-mono" style={{ color: insufficientBalance ? '#f87171' : 'white' }}>
            {MOCK_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' '}<span style={{ color: '#3d4f6b' }}>USDC</span>
          </span>
        </div>

        {/* Price input */}
        {mode === 'limit' ? (
          <div>
            <FieldLabel
              label="Limit Price"
              right={basePrice > 0 ? `Mark: $${fmt(basePrice, smartDecimals(basePrice))}` : undefined}
            />
            <div className="relative">
              <InputRow
                value={price}
                onChange={v => { setPrice(v); setErrors(e => ({ ...e, price: null })); setActivePct(null); }}
                placeholder={basePrice > 0 ? basePrice.toFixed(smartDecimals(basePrice)) : '0.00'}
                prefix="$"
                suffix="USDC"
                highlight={priceFlash}
                error={!!errors.price}
                step="0.01"
              />
              <PriceAppliedFlash show={priceFlash} />
            </div>
            <ErrorMsg msg={errors.price} />
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(4,6,14,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}>
            <span className="text-[9.5px] font-bold" style={{ color: '#3d4f6b' }}>Market Price</span>
            <div className="flex items-center gap-1.5">
              {basePrice > 0 ? (
                <span className="text-[11px] font-black font-mono text-white">
                  ${basePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Stale
                </span>
              )}
            </div>
          </div>
        )}

        {/* Amount + denomination */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: '#3d4f6b' }}>Amount</span>
            <DenomSelector value={denom} onChange={v => { setDenom(v); setAmount(''); setActivePct(null); setErrors(e => ({ ...e, amount: null })); }} symbol={symbol} />
          </div>

          <InputRow
            value={effectiveAmount}
            onChange={handleAmountChange}
            placeholder={amountPlaceholder}
            suffix={amountSuffix}
            error={!!errors.amount}
            step={amountStep}
          />

          {/* Derived hint */}
          {parsedAmt > 0 && entryPrice > 0 && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[8.5px] font-mono" style={{ color: '#2a3348' }}>
                {denom === 'base'    ? `≈ ${fmtUSD(quoteQty)} position` : ''}
                {denom === 'quote'   ? `≈ ${(baseQty).toFixed(6)} ${symbol}` : ''}
                {denom === 'percent' ? `≈ ${fmtUSD(quoteQty)} · ${baseQty.toFixed(6)} ${symbol}` : ''}
              </span>
              {margin > 0 && (
                <span className="text-[8.5px] font-mono" style={{ color: '#2a3348' }}>
                  Margin: {fmtUSD(margin)}
                </span>
              )}
            </div>
          )}

          <ErrorMsg msg={errors.amount} />

          {/* Percentage quick-select buttons */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {PCT_STEPS.map(pct => {
              const isActive = activePct === pct;
              return (
                <button
                  key={pct}
                  onClick={() => handlePct(pct)}
                  className="py-1.5 rounded-lg text-[9px] font-black transition-all duration-150"
                  style={isActive ? {
                    background: sideBg,
                    border: `1px solid ${sideBorder}`,
                    color: sideColor,
                  } : {
                    background: 'rgba(4,6,14,0.8)',
                    border: '1px solid rgba(148,163,184,0.07)',
                    color: '#3d4f6b',
                  }}
                >
                  {pct === 100 ? 'Max' : `${pct}%`}
                </button>
              );
            })}
          </div>

          {/* Balance/leverage context for % mode */}
          {activePct && entryPrice > 0 && (
            <div className="mt-1.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.08)' }}>
              <p className="text-[8.5px] font-mono" style={{ color: '#3d4f6b' }}>
                {activePct}% × ${MOCK_BALANCE.toFixed(2)} = ${(MOCK_BALANCE * activePct / 100).toFixed(2)} margin → {leverage}× = {fmtUSD(MOCK_BALANCE * activePct / 100 * leverage)} position
              </p>
            </div>
          )}
        </div>

        {/* Leverage */}
        <div>
          <FieldLabel label="Leverage" />
          <LeverageControls
            leverage={leverage}
            onChange={setLeverage}
            maxLev={maxLev}
            minLev={1}
          />
        </div>

        {/* Liquidation risk panel */}
        <LiquidationPanel
          entryPrice={entryPrice}
          liqPrice={quoteQty > 0 ? liqPrice : null}
          liqDistance={quoteQty > 0 ? liqDistance : null}
          riskState={riskState}
          margin={margin}
          positionValue={quoteQty}
          side={side}
        />

        {/* TP / SL */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.07)' }}>
          <button
            onClick={() => setShowTPSL(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
            style={{ background: 'rgba(4,6,14,0.6)' }}
          >
            <span className="text-[9.5px] font-bold" style={{ color: showTPSL ? '#00d4aa' : '#3d4f6b' }}>
              Take Profit / Stop Loss
            </span>
            <div className="flex items-center gap-1">
              {(tp || sl) && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4aa' }} />}
              {showTPSL
                ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />
                : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />}
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
                  suffix="USDC"
                />
              </div>
              <div>
                <FieldLabel label="Stop Loss" />
                <InputRow
                  value={sl}
                  onChange={setSl}
                  placeholder={entryPrice > 0 ? (entryPrice * 0.95).toFixed(2) : '0.00'}
                  prefix="$"
                  suffix="USDC"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <OrderSummary
          mode={mode}
          side={side}
          denom={denom}
          symbol={symbol}
          entryPrice={entryPrice}
          baseQty={baseQty}
          quoteQty={quoteQty}
          leverage={leverage}
          fee={fee}
          margin={margin}
          liqPrice={liqPrice}
          liqDistance={liqDistance}
          riskState={riskState}
          balance={MOCK_BALANCE}
          isReady={isReady}
          riskLevel={riskLevel}
          activePct={activePct}
        />

        {/* Readiness badge */}
        <ReadinessBadge errors={errors} isReady={isReady} />

        {/* Submit-level error (from API) */}
        {errors.submit && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <span className="text-[10px] font-semibold leading-snug" style={{ color: '#f87171' }}>{errors.submit}</span>
          </div>
        )}
      </div>

      {/* Submit footer */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.055)', background: 'rgba(4,6,14,0.7)' }}>
        {isConnected ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted || insufficientBalance}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            style={{
              background: submitted
                ? 'rgba(74,222,128,0.15)'
                : insufficientBalance
                ? 'rgba(248,113,113,0.08)'
                : `linear-gradient(135deg, ${sideColor}18, ${sideColor}0c)`,
              color: submitted ? '#4ade80' : insufficientBalance ? '#f87171' : sideColor,
              border: `1px solid ${submitted ? 'rgba(74,222,128,0.3)' : insufficientBalance ? 'rgba(248,113,113,0.3)' : sideBorder}`,
              boxShadow: submitted ? '0 0 24px rgba(74,222,128,0.12)' : `0 4px 24px ${sideColor}12`,
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
            ) : insufficientBalance ? (
              <><AlertTriangle className="w-4 h-4" /> Insufficient Balance</>
            ) : (
              <>
                <SideIcon className="w-4 h-4" />
                {isBuy ? 'Buy / Long' : 'Sell / Short'}
                {quoteQty > 0 && (
                  <span className="text-[10px] font-semibold opacity-70 ml-1">· {fmtUSD(quoteQty)}</span>
                )}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => requireWallet()}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(0,212,170,0.06)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet to Trade
          </button>
        )}
      </div>
    </div>
  );
}