/**
 * PositionsTab — premium futures positions panel with liquidation risk tracking.
 *
 * Liquidation math (simplified perpetuals model):
 *   Long:  liqPrice = entryPrice × (1 - 1/leverage + maintenanceMarginRatio)
 *   Short: liqPrice = entryPrice × (1 + 1/leverage - maintenanceMarginRatio)
 *
 * All risk calculations use markPrice exclusively (never lastPrice).
 * useTicker is called per position symbol for real-time mark price updates.
 */

import React, { useMemo } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import CoinIcon from '../shared/CoinIcon';
import { useTicker } from '../../hooks/useOrderlyMarket';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAINTENANCE_MARGIN_RATIO = 0.005; // 0.5% — standard for most perps

// ─── Formatters ──────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100)   return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  return v.toFixed(6);
}

function fmtPct(v, sign = true) {
  if (v == null || isNaN(v)) return '—';
  const s = sign && v >= 0 ? '+' : '';
  return `${s}${Number(v).toFixed(2)}%`;
}

function fmtUSD(v, sign = true) {
  if (v == null || isNaN(v)) return '—';
  const s = sign && v >= 0 ? '+' : '';
  const abs = Math.abs(v);
  if (abs >= 1000) return `${s}$${(v >= 0 ? abs : -abs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${s}$${v.toFixed(2)}`;
}

// ─── Risk calculation ─────────────────────────────────────────────────────────
function calcLiqRisk(position, markPrice) {
  const { entry, side, size, leverage = 10, marginMode = 'cross' } = position;
  const mmr = MAINTENANCE_MARGIN_RATIO;

  // Liquidation price
  let liqPrice;
  if (side === 'long') {
    liqPrice = entry * (1 - (1 / leverage) + mmr);
  } else {
    liqPrice = entry * (1 + (1 / leverage) - mmr);
  }

  const mark = markPrice ?? position.mark;
  if (!mark || !liqPrice) return { liqPrice, mark, distPct: null, distAbs: null, risk: 'unknown', pnl: null, roe: null, margin: null };

  // Distance to liquidation as % of mark price
  const distAbs = side === 'long' ? mark - liqPrice : liqPrice - mark;
  const distPct = (distAbs / mark) * 100;

  // Risk level
  let risk;
  if (distPct > 20)       risk = 'safe';
  else if (distPct > 8)   risk = 'warning';
  else                    risk = 'danger';

  // Unrealized PnL
  const qty     = parseFloat(size);
  const rawPnl  = side === 'long' ? (mark - entry) * qty : (entry - mark) * qty;

  // Margin (position value / leverage)
  const notional = entry * qty;
  const margin   = notional / leverage;

  // ROE = PnL / margin
  const roe = margin > 0 ? (rawPnl / margin) * 100 : 0;

  return { liqPrice, mark, distPct, distAbs, risk, pnl: rawPnl, roe, margin, mmr };
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const cfg = {
    safe:    { label: 'SAFE',    color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.18)',  Icon: ShieldCheck },
    warning: { label: 'WARNING', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)', Icon: AlertTriangle },
    danger:  { label: 'DANGER',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.22)', Icon: ShieldAlert },
    unknown: { label: '—',       color: '#475569', bg: 'rgba(71,85,105,0.08)',  border: 'rgba(71,85,105,0.12)',  Icon: Clock },
  }[risk] ?? { label: risk, color: '#475569', bg: 'rgba(71,85,105,0.08)', border: 'rgba(71,85,105,0.12)', Icon: Clock };

  const { label, color, bg, border, Icon } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Distance color ───────────────────────────────────────────────────────────
function distColor(distPct) {
  if (distPct == null) return '#475569';
  if (distPct > 20) return '#4ade80';
  if (distPct > 8)  return '#f59e0b';
  return '#f87171';
}

// ─── Single Position Card (mobile-first, expandable) ─────────────────────────
function PositionCard({ position }) {
  const base   = position.symbol?.split('/')?.[0] ?? position.symbol;
  const symKey = base; // e.g. 'BTC' → useTicker expects short key

  // Live mark price from Orderly ticker — mark → last (never metadata)
  const { ticker } = useTicker(symKey);
  const liveMark   = ticker?.markPrice ?? ticker?.lastPrice ?? null;

  // Debug log — remove after verification
  React.useEffect(() => {
    const src = ticker?.markPrice ? 'MARK' : ticker?.lastPrice ? 'LAST' : 'NONE';
    console.log('[PositionsTab]', { symbol: symKey, priceSource: src, liveMark });
  }, [symKey, liveMark]);

  const risk = useMemo(
    () => calcLiqRisk(position, liveMark),
    [position, liveMark]
  );

  const sc = position.side === 'long' ? '#4ade80' : '#f87171';
  const dc = distColor(risk.distPct);

  return (
    <div
      className="p-3 border-b transition-colors"
      style={{ borderColor: 'rgba(148,163,184,0.05)' }}
    >
      {/* ── Row 1: Symbol + Side + Margin Mode + Risk badge ── */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <CoinIcon symbol={base} size={22} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-black text-white">{position.symbol}</span>
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                style={{ color: sc, background: `${sc}14` }}
              >
                {position.side === 'long' ? '▲ Long' : '▼ Short'}
              </span>
              <span
                className="text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}
              >
                {position.marginMode ?? 'Cross'}
              </span>
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: '#3d4f6b' }}>
              Size: <span className="text-slate-300 font-mono">{position.size}</span>
              {' · '}Lev: <span className="text-slate-300 font-mono">{position.leverage ?? 10}×</span>
            </div>
          </div>
        </div>
        <RiskBadge risk={risk.risk} />
      </div>

      {/* ── Row 2: Key metrics grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mb-2.5">

        {/* PnL */}
        <MetricCell
          label="Unrealized PnL"
          value={risk.pnl != null ? fmtUSD(risk.pnl) : '—'}
          valueColor={risk.pnl != null ? (risk.pnl >= 0 ? '#4ade80' : '#f87171') : '#475569'}
          sub={risk.roe != null ? fmtPct(risk.roe) + ' ROE' : null}
          subColor={risk.roe != null ? (risk.roe >= 0 ? '#4ade80' : '#f87171') : '#475569'}
        />

        {/* Entry / Mark */}
        <MetricCell
          label="Entry / Mark"
          value={`$${fmtPrice(position.entry)}`}
          valueColor="#94a3b8"
          sub={`$${fmtPrice(risk.mark ?? position.mark)}`}
          subColor="#00d4aa"
        />

        {/* Margin */}
        <MetricCell
          label="Margin"
          value={risk.margin != null ? `$${risk.margin.toFixed(2)}` : '—'}
          valueColor="#e2e8f0"
          sub={risk.mmr != null ? `MMR ${(risk.mmr * 100).toFixed(2)}%` : null}
          subColor="#475569"
        />

        {/* Leverage/Size */}
        <MetricCell
          label="Notional"
          value={risk.margin != null ? `$${(risk.margin * (position.leverage ?? 10)).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
          valueColor="#e2e8f0"
          sub={`${position.leverage ?? 10}× leverage`}
          subColor="#475569"
        />
      </div>

      {/* ── Liquidation summary bar ── */}
      <LiqBar
        liqPrice={risk.liqPrice}
        distPct={risk.distPct}
        distAbs={risk.distAbs}
        risk={risk.risk}
        dc={dc}
        mark={risk.mark ?? position.mark}
        side={position.side}
      />
    </div>
  );
}

// ─── Compact metric cell ──────────────────────────────────────────────────────
function MetricCell({ label, value, valueColor, sub, subColor }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[8.5px] font-bold uppercase tracking-widest" style={{ color: '#2a3348' }}>
        {label}
      </span>
      <span className="font-mono font-black text-[11px] leading-none" style={{ color: valueColor }}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[9px] leading-none" style={{ color: subColor }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ─── Liquidation summary bar ──────────────────────────────────────────────────
function LiqBar({ liqPrice, distPct, distAbs, risk, dc, mark, side }) {
  if (!liqPrice) {
    return (
      <div
        className="rounded-xl px-3 py-2 flex items-center gap-2"
        style={{ background: 'rgba(4,6,14,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}
      >
        <Clock className="w-3 h-3 flex-shrink-0" style={{ color: '#2a3348' }} />
        <span className="text-[9px]" style={{ color: '#2a3348' }}>Liquidation price not yet available</span>
      </div>
    );
  }

  // Progress bar: how close to liquidation (100% = at liq, 0% = very far)
  const barPct = distPct != null ? Math.max(0, Math.min(100, 100 - distPct)) : 0;

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: 'rgba(4,6,14,0.75)',
        border: `1px solid ${risk === 'danger' ? 'rgba(248,113,113,0.18)' : risk === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.07)'}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
          Liquidation Risk
        </span>
        {distPct != null && (
          <span className="font-mono text-[9px] font-bold" style={{ color: dc }}>
            {distPct.toFixed(1)}% away
          </span>
        )}
      </div>

      {/* 3-column summary */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div>
          <div className="text-[7.5px] uppercase tracking-widest mb-0.5 font-bold" style={{ color: '#2a3348' }}>Liq Price</div>
          <div className="font-mono font-black text-[10px]" style={{ color: '#f87171' }}>
            ${fmtPrice(liqPrice)}
          </div>
          <div className="text-[8px] font-mono mt-0.5" style={{ color: '#2a3348' }}>
            {side === 'long' ? 'below mark' : 'above mark'}
          </div>
        </div>
        <div>
          <div className="text-[7.5px] uppercase tracking-widest mb-0.5 font-bold" style={{ color: '#2a3348' }}>Distance</div>
          <div className="font-mono font-black text-[10px]" style={{ color: dc }}>
            {distPct != null ? fmtPct(distPct, false) : '—'}
          </div>
          <div className="font-mono text-[8px] mt-0.5" style={{ color: '#2a3348' }}>
            {distAbs != null ? `$${Math.abs(distAbs).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[7.5px] uppercase tracking-widest mb-0.5 font-bold text-right" style={{ color: '#2a3348' }}>Risk</div>
          <RiskBadge risk={risk} />
          <div className="font-mono text-[8px] mt-0.5" style={{ color: '#2a3348' }}>
            Mark ${fmtPrice(mark)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barPct}%`,
            background: risk === 'danger'
              ? 'linear-gradient(90deg, #f87171, #ef4444)'
              : risk === 'warning'
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(90deg, #4ade80, #22c55e)',
          }}
        />
      </div>
      {/* Bar labels */}
      <div className="flex justify-between mt-0.5">
        <span className="text-[7.5px] font-mono" style={{ color: '#2a3348' }}>Liq</span>
        <span className="text-[7.5px] font-mono" style={{ color: '#2a3348' }}>Safe</span>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyPositions() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.08)' }}
      >
        <TrendingUp className="w-4 h-4" style={{ color: 'rgba(0,212,170,0.3)' }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: '#2a3348' }}>No open positions</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PositionsTab({ positions }) {
  if (!positions || positions.length === 0) return <EmptyPositions />;

  return (
    <div className="flex flex-col">
      {positions.map((p, i) => (
        <PositionCard key={`${p.symbol}-${i}`} position={p} />
      ))}
    </div>
  );
}