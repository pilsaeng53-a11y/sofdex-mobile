/**
 * components/trade/OrderPanel.jsx
 *
 * UI-only component. All state and calculation logic lives in useOrderForm.
 * Sub-components (LiquidationPanel, OrderSummary, etc.) are pure presentational.
 *
 * Data flow:
 *   TradingDesk → props (asset, externalPrice)
 *   useOrderForm → all derived values & handlers
 *   lib/trading/formatters → display strings
 */

import React, { useEffect } from 'react';
import {
  Wallet, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, CircleDot, TrendingUp, TrendingDown,
  DollarSign, Coins, Percent, ShieldCheck, ShieldAlert, ShieldX,
} from 'lucide-react';
import { useWallet } from '../shared/WalletContext';
import CoinIcon from '../shared/CoinIcon';
import LeverageControls from './LeverageControls';
import useOrderForm, { MOCK_BALANCE } from '../../hooks/useOrderForm';
import { fmt, fmtUSD, fmtPct, smartDecimals, fmtQty } from '../../lib/trading/formatters';

// ─── Constants ────────────────────────────────────────────────────────────────
const PCT_STEPS = [25, 50, 75, 100];

const DENOM_MODES = [
  { id: 'base',    shortLabel: 'Coin', Icon: Coins },
  { id: 'quote',   shortLabel: 'USDC', Icon: DollarSign },
  { id: 'percent', shortLabel: '%',    Icon: Percent },
];

// ─── Shared primitives ────────────────────────────────────────────────────────
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
  const [focused, setFocused] = React.useState(false);
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

function PriceAppliedFlash({ show }) {
  if (!show) return null;
  return (
    <div
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg pointer-events-none"
      style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}
    >
      <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#00d4aa' }} />
      <span className="text-[8.5px] font-black" style={{ color: '#00d4aa' }}>Applied</span>
    </div>
  );
}

// ─── Denom selector ───────────────────────────────────────────────────────────
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

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ state }) {
  const config = {
    safe:    { Icon: ShieldCheck, color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)',  label: 'SAFE' },
    warning: { Icon: ShieldAlert, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)', label: 'WARNING' },
    danger:  { Icon: ShieldX,     color: '#f87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.2)',label: 'DANGER' },
    none:    { Icon: CircleDot,   color: '#3d4f6b', bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.07)', label: '—' },
  }[state] ?? { Icon: CircleDot, color: '#3d4f6b', bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.07)', label: '—' };

  const { Icon, color, bg, border, label } = config;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-[9px] font-black tracking-widest uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Liquidation panel ────────────────────────────────────────────────────────
function LiquidationPanel({ entryPrice, liqPrice, liqDistance, riskState, margin, positionValue, side }) {
  const hasData   = entryPrice > 0 && liqPrice != null;
  const sideLabel = side === 'buy' ? 'Long' : 'Short';

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(4,6,14,0.5)' }}>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
          Liquidation Risk
        </span>
        <RiskBadge state={riskState} />
      </div>

      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Liq. Price ({sideLabel})</span>
          <span className="text-[9.5px] font-black font-mono" style={{ color: hasData ? '#f87171' : '#2a3348' }}>
            {hasData ? `$${fmt(liqPrice, 2)}` : '—'}
          </span>
        </div>

        {hasData && liqDistance && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Distance (%)</span>
              <span className="text-[9.5px] font-black font-mono"
                style={{ color: riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80' }}>
                {fmtPct(-liqDistance.pct)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Distance ($)</span>
              <span className="text-[9.5px] font-black font-mono" style={{ color: '#64748b' }}>
                ${fmt(liqDistance.diff, 2)}
              </span>
            </div>
            <div className="pt-1">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(2, 100 - liqDistance.pct * 3))}%`,
                    background: riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80',
                  }}
                />
              </div>
            </div>
          </>
        )}

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

        {!hasData && (
          <p className="text-[9px] text-center py-1" style={{ color: '#2a3348' }}>
            Enter price &amp; amount to see liquidation risk
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Order summary ────────────────────────────────────────────────────────────
function SummaryRow({ label, value, valueColor, dimTop }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${dimTop ? 'mt-1 pt-2 border-t' : ''}`}
      style={dimTop ? { borderColor: 'rgba(148,163,184,0.06)' } : {}}>
      <span className="text-[9px]" style={{ color: '#3d4f6b' }}>{label}</span>
      <span className="text-[9.5px] font-black font-mono" style={{ color: valueColor || '#64748b' }}>{value}</span>
    </div>
  );
}

function OrderSummary({ mode, side, denom, symbol, entryPrice, baseQty, quoteQty, leverage, fee, margin, liqPrice, liqDistance, riskState, balance, isReady, riskLevel, activePct }) {
  const sideColor = side === 'buy' ? '#4ade80' : '#f87171';
  const riskColor = riskLevel === 'Low' ? '#4ade80' : riskLevel === 'Med' ? '#f59e0b' : '#f87171';

  return (
    <div className="rounded-xl px-3 py-2.5 space-y-0.5 transition-all duration-300"
      style={{
        background: isReady ? 'rgba(0,212,170,0.03)' : 'rgba(4,6,14,0.7)',
        border: isReady ? '1px solid rgba(0,212,170,0.1)' : '1px solid rgba(148,163,184,0.06)',
      }}>
      <div className="flex items-center justify-between pb-1.5 mb-0.5"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
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

      <SummaryRow label="Direction"   value={side === 'buy' ? '▲ Long' : '▼ Short'} valueColor={sideColor} />
      <SummaryRow label="Order Type"  value={mode === 'limit' ? 'Limit' : 'Market'}  valueColor="#64748b" />
      <SummaryRow label="Amount Mode" value={denom === 'base' ? symbol : denom === 'quote' ? 'USDC' : '%'} valueColor="#64748b" />
      <SummaryRow
        label="Entry Price"
        value={entryPrice > 0 ? (mode === 'market' ? `~$${entryPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${entryPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`) : '—'}
        valueColor="#94a3b8"
      />
      <SummaryRow
        label="Est. Quantity"
        value={baseQty > 0 ? `${fmtQty(baseQty)} ${symbol}` : '—'}
        valueColor={baseQty > 0 ? '#94a3b8' : undefined}
      />
      <SummaryRow label="Est. Total"  value={quoteQty > 0 ? fmtUSD(quoteQty) : '—'} valueColor={quoteQty > 0 ? '#e2e8f0' : undefined} dimTop />
      <SummaryRow label={`Est. Margin (÷${leverage}×)`} value={margin > 0 ? fmtUSD(margin) : '—'} valueColor={margin > 0 ? '#f59e0b' : undefined} />
      <SummaryRow
        label="Balance After"
        value={margin > 0 ? fmtUSD(Math.max(0, balance - margin)) : '—'}
        valueColor={margin > 0 && (balance - margin) < balance * 0.2 ? '#f87171' : '#475569'}
      />
      <SummaryRow label="Liq. Price"  value={liqPrice != null && liqPrice > 0 ? `$${fmt(liqPrice, 2)}` : '—'} valueColor={liqPrice ? '#f87171' : undefined} dimTop />
      {liqDistance && (
        <SummaryRow
          label="Dist. to Liq."
          value={`${fmtPct(-liqDistance.pct)} / $${fmt(liqDistance.diff, 2)}`}
          valueColor={riskState === 'danger' ? '#f87171' : riskState === 'warning' ? '#f59e0b' : '#4ade80'}
        />
      )}
      <SummaryRow label="Risk Level" value={riskLevel ?? '—'} valueColor={riskLevel ? riskColor : undefined} />
      <SummaryRow label={`Est. Fee (${mode === 'limit' ? '0.02%' : '0.05%'})`} value={fee > 0 ? `$${fee.toFixed(4)}` : '—'} valueColor="#64748b" />
      {activePct && <SummaryRow label="Size Allocation" value={`${activePct}% of balance`} valueColor="#475569" />}
    </div>
  );
}

// ─── Readiness badge ──────────────────────────────────────────────────────────
function ReadinessBadge({ errors, isReady }) {
  if (isReady) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
        style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.12)' }}>
        <CheckCircle2 className="w-3 h-3" style={{ color: '#4ade80' }} />
        <span className="text-[9px] font-bold" style={{ color: '#4ade80' }}>Order ready</span>
      </div>
    );
  }
  const msgs = Object.values(errors).filter(Boolean);
  if (msgs.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
        style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.07)' }}>
        <CircleDot className="w-3 h-3" style={{ color: '#3d4f6b' }} />
        <span className="text-[9px] font-bold" style={{ color: '#3d4f6b' }}>Fill in order details</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)' }}>
      <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f87171' }} />
      <span className="text-[9px] font-bold truncate" style={{ color: '#f87171' }}>{msgs[0]}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {{ symbol: string, price: number, maxLeverage: number }} props.asset
 * @param {number|null} props.externalPrice  — price injected from OrderBook click
 */
export default function OrderPanel({ asset, externalPrice }) {
  const { isConnected, requireWallet } = useWallet();

  const symbol   = asset?.symbol       ?? 'BTC';
  const maxLev   = asset?.maxLeverage  ?? 50;
  const markPrice = asset?.price        ?? 0;

  const form = useOrderForm({ symbol, markPrice, maxLeverage: maxLev });

  // Apply OrderBook-clicked price into the form
  useEffect(() => {
    if (externalPrice != null && externalPrice > 0) {
      form.applyExternalPrice(externalPrice);
    }
  }, [externalPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──
  const isBuy      = form.side === 'buy';
  const sideColor  = isBuy ? '#4ade80' : '#f87171';
  const sideBg     = isBuy ? 'rgba(74,222,128,0.1)'  : 'rgba(248,113,113,0.1)';
  const sideBorder = isBuy ? 'rgba(74,222,128,0.2)'  : 'rgba(248,113,113,0.2)';
  const SideIcon   = isBuy ? TrendingUp : TrendingDown;

  const amountPlaceholder = form.denom === 'base' ? '0.000000' : form.denom === 'quote' ? '0.00' : '0';
  const amountSuffix      = form.denom === 'base' ? symbol    : form.denom === 'quote' ? 'USDC' : '%';
  const amountStep        = form.denom === 'base' ? '0.000001': form.denom === 'quote' ? '0.01' : '1';

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(10,14,26,0.99) 0%, rgba(6,9,18,0.99) 100%)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Accent bar */}
      <div className="h-px w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${sideColor}45, ${sideColor}18, transparent)` }} />

      {/* Symbol header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.055)', background: 'rgba(4,6,14,0.6)' }}>
        <CoinIcon symbol={symbol} size={20} />
        <span className="text-[12px] font-black text-white">{symbol}</span>
        <span className="text-[9px] text-slate-600">/USDC Perpetual</span>
        {markPrice > 0 && (
          <span className="ml-auto font-mono text-[10px] font-semibold" style={{ color: '#64748b' }}>
            ${markPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Buy / Sell toggle */}
      <div className="p-3 pb-2.5 border-b" style={{ borderColor: 'rgba(148,163,184,0.055)' }}>
        <div className="flex rounded-xl p-0.5"
          style={{ background: 'rgba(4,6,14,0.9)', border: '1px solid rgba(148,163,184,0.07)' }}>
          {[['buy', 'Buy / Long'], ['sell', 'Sell / Short']].map(([s, label]) => {
            const active = form.side === s;
            const c = s === 'buy' ? '#4ade80' : '#f87171';
            return (
              <button key={s}
                onClick={() => form.setSide(s)}
                className="flex-1 py-2.5 rounded-[10px] text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5"
                style={active ? {
                  background: s === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  color: c,
                  border: `1px solid ${s === 'buy' ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.22)'}`,
                  boxShadow: `0 2px 14px ${c}18`,
                } : { color: '#2e3d55', border: '1px solid transparent' }}>
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
              onClick={() => form.setMode(type)}
              className="flex-1 py-2 text-[10px] font-black transition-all duration-200"
              style={form.mode === type ? {
                background: 'rgba(0,212,170,0.1)',
                color: '#00d4aa',
                borderBottom: '2px solid rgba(0,212,170,0.3)',
              } : { color: '#3d4f6b' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Available balance */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{
            background: form.insufficientBalance ? 'rgba(248,113,113,0.05)' : 'rgba(4,6,14,0.6)',
            border: form.insufficientBalance ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(148,163,184,0.06)',
          }}>
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3 h-3" style={{ color: form.insufficientBalance ? '#f87171' : '#3d4f6b' }} />
            <span className="text-[9.5px] font-bold" style={{ color: form.insufficientBalance ? '#f87171' : '#3d4f6b' }}>
              {form.insufficientBalance ? 'Insufficient Balance' : 'Available'}
            </span>
          </div>
          <span className="text-[11px] font-black font-mono" style={{ color: form.insufficientBalance ? '#f87171' : 'white' }}>
            {MOCK_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' '}<span style={{ color: '#3d4f6b' }}>USDC</span>
          </span>
        </div>

        {/* Price */}
        {form.mode === 'limit' ? (
          <div>
            <FieldLabel
              label="Limit Price"
              right={markPrice > 0 ? `Mark: $${fmt(markPrice, smartDecimals(markPrice))}` : undefined}
            />
            <div className="relative">
              <InputRow
                value={form.price}
                onChange={v => { form.setPrice(v); }}
                placeholder={markPrice > 0 ? markPrice.toFixed(smartDecimals(markPrice)) : '0.00'}
                prefix="$"
                suffix="USDC"
                highlight={form.priceFlash}
                error={!!form.errors.price}
                step="0.01"
              />
              <PriceAppliedFlash show={form.priceFlash} />
            </div>
            <ErrorMsg msg={form.errors.price} />
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(4,6,14,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}>
            <span className="text-[9.5px] font-bold" style={{ color: '#3d4f6b' }}>Market Price</span>
            {markPrice > 0 ? (
              <span className="text-[11px] font-black font-mono text-white">
                ${markPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Stale
              </span>
            )}
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: '#3d4f6b' }}>Amount</span>
            <DenomSelector value={form.denom} onChange={form.setDenom} symbol={symbol} />
          </div>

          <InputRow
            value={form.amount}
            onChange={form.setAmount}
            placeholder={amountPlaceholder}
            suffix={amountSuffix}
            error={!!form.errors.amount}
            step={amountStep}
          />

          {form.parsedAmt > 0 && form.entryPrice > 0 && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[8.5px] font-mono" style={{ color: '#2a3348' }}>
                {form.denom === 'base'    ? `≈ ${fmtUSD(form.quoteQty)} position` : ''}
                {form.denom === 'quote'   ? `≈ ${fmtQty(form.baseQty)} ${symbol}` : ''}
                {form.denom === 'percent' ? `≈ ${fmtUSD(form.quoteQty)} · ${fmtQty(form.baseQty)} ${symbol}` : ''}
              </span>
              {form.margin > 0 && (
                <span className="text-[8.5px] font-mono" style={{ color: '#2a3348' }}>
                  Margin: {fmtUSD(form.margin)}
                </span>
              )}
            </div>
          )}
          <ErrorMsg msg={form.errors.amount} />

          {/* Percentage buttons */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {PCT_STEPS.map(pct => {
              const isActive = form.activePct === pct;
              return (
                <button key={pct}
                  onClick={() => form.handlePct(pct)}
                  className="py-1.5 rounded-lg text-[9px] font-black transition-all duration-150"
                  style={isActive ? {
                    background: sideBg,
                    border: `1px solid ${sideBorder}`,
                    color: sideColor,
                  } : {
                    background: 'rgba(4,6,14,0.8)',
                    border: '1px solid rgba(148,163,184,0.07)',
                    color: '#3d4f6b',
                  }}>
                  {pct === 100 ? 'Max' : `${pct}%`}
                </button>
              );
            })}
          </div>

          {form.activePct && form.entryPrice > 0 && (
            <div className="mt-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.08)' }}>
              <p className="text-[8.5px] font-mono" style={{ color: '#3d4f6b' }}>
                {form.activePct}% × ${MOCK_BALANCE.toFixed(2)} = ${(MOCK_BALANCE * form.activePct / 100).toFixed(2)} margin → {form.leverage}× = {fmtUSD(MOCK_BALANCE * form.activePct / 100 * form.leverage)} position
              </p>
            </div>
          )}
        </div>

        {/* Leverage */}
        <div>
          <FieldLabel label="Leverage" />
          <LeverageControls leverage={form.leverage} onChange={form.setLeverage} maxLev={maxLev} minLev={1} />
        </div>

        {/* Liquidation panel */}
        <LiquidationPanel
          entryPrice={form.entryPrice}
          liqPrice={form.liqPrice}
          liqDistance={form.liqDistance}
          riskState={form.riskState}
          margin={form.margin}
          positionValue={form.quoteQty}
          side={form.side}
        />

        {/* TP / SL */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.07)' }}>
          <button
            onClick={() => form.setShowTPSL(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5"
            style={{ background: 'rgba(4,6,14,0.6)' }}
          >
            <span className="text-[9.5px] font-bold" style={{ color: form.showTPSL ? '#00d4aa' : '#3d4f6b' }}>
              Take Profit / Stop Loss
            </span>
            <div className="flex items-center gap-1">
              {(form.tp || form.sl) && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4aa' }} />}
              {form.showTPSL
                ? <ChevronUp  className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />
                : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#3d4f6b' }} />}
            </div>
          </button>
          {form.showTPSL && (
            <div className="px-3 pb-3 pt-2 space-y-2" style={{ background: 'rgba(4,6,14,0.4)' }}>
              <div>
                <FieldLabel label="Take Profit" />
                <InputRow value={form.tp} onChange={form.setTp}
                  placeholder={form.entryPrice > 0 ? (form.entryPrice * 1.05).toFixed(2) : '0.00'}
                  prefix="$" suffix="USDC" />
              </div>
              <div>
                <FieldLabel label="Stop Loss" />
                <InputRow value={form.sl} onChange={form.setSl}
                  placeholder={form.entryPrice > 0 ? (form.entryPrice * 0.95).toFixed(2) : '0.00'}
                  prefix="$" suffix="USDC" />
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <OrderSummary
          mode={form.mode}
          side={form.side}
          denom={form.denom}
          symbol={symbol}
          entryPrice={form.entryPrice}
          baseQty={form.baseQty}
          quoteQty={form.quoteQty}
          leverage={form.leverage}
          fee={form.fee}
          margin={form.margin}
          liqPrice={form.liqPrice}
          liqDistance={form.liqDistance}
          riskState={form.riskState}
          balance={MOCK_BALANCE}
          isReady={form.isReady}
          riskLevel={form.riskLevel}
          activePct={form.activePct}
        />

        <ReadinessBadge errors={form.errors} isReady={form.isReady} />

        {form.errors.submit && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <span className="text-[10px] font-semibold leading-snug" style={{ color: '#f87171' }}>{form.errors.submit}</span>
          </div>
        )}
      </div>

      {/* Submit footer */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.055)', background: 'rgba(4,6,14,0.7)' }}>
        {isConnected ? (
          <button
            onClick={form.handleSubmit}
            disabled={form.submitting || form.submitted || form.insufficientBalance}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            style={{
              background: form.submitted
                ? 'rgba(74,222,128,0.15)'
                : form.insufficientBalance
                ? 'rgba(248,113,113,0.08)'
                : `linear-gradient(135deg, ${sideColor}18, ${sideColor}0c)`,
              color: form.submitted ? '#4ade80' : form.insufficientBalance ? '#f87171' : sideColor,
              border: `1px solid ${form.submitted ? 'rgba(74,222,128,0.3)' : form.insufficientBalance ? 'rgba(248,113,113,0.3)' : sideBorder}`,
              boxShadow: form.submitted ? '0 0 24px rgba(74,222,128,0.12)' : `0 4px 24px ${sideColor}12`,
              opacity: form.submitting ? 0.7 : 1,
            }}
          >
            {form.submitted ? (
              <><CheckCircle2 className="w-4 h-4" /> Order Submitted!</>
            ) : form.submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Placing Order...</>
            ) : form.insufficientBalance ? (
              <><AlertTriangle className="w-4 h-4" /> Insufficient Balance</>
            ) : (
              <>
                <SideIcon className="w-4 h-4" />
                {isBuy ? 'Buy / Long' : 'Sell / Short'}
                {form.quoteQty > 0 && (
                  <span className="text-[10px] font-semibold opacity-70 ml-1">· {fmtUSD(form.quoteQty)}</span>
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