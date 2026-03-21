import React, { useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import CoinIcon from '../shared/CoinIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'positions',     label: 'Positions',     count: 2 },
  { id: 'open_orders',   label: 'Open Orders',   count: 1 },
  { id: 'order_history', label: 'Order History', count: null },
  { id: 'trade_history', label: 'Trade History', count: null },
];

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_POSITIONS = [
  { symbol: 'BTC/USDT', side: 'long',  size: '0.450',  entry: 83241.00, mark: 84180.50, pnl: 422.73,  roe: 1.86  },
  { symbol: 'ETH/USDT', side: 'short', size: '2.800',  entry: 3218.40,  mark: 3190.20,  pnl: 78.96,   roe: 0.87  },
];

const DEMO_OPEN_ORDERS = [
  { symbol: 'SOL/USDT', side: 'long',  type: 'Limit',  price: 138.50, size: '10.00', status: 'Open' },
];

const DEMO_ORDER_HISTORY = [
  { symbol: 'BTC/USDT', side: 'long',  type: 'Market', price: 82100.00, size: '0.250', status: 'Filled',    ts: '2026-03-21 14:32:11' },
  { symbol: 'ETH/USDT', side: 'short', type: 'Limit',  price: 3250.00,  size: '1.500', status: 'Cancelled', ts: '2026-03-21 11:18:44' },
  { symbol: 'SOL/USDT', side: 'long',  type: 'Limit',  price: 135.20,   size: '5.000', status: 'Filled',    ts: '2026-03-20 22:05:30' },
];

const DEMO_TRADE_HISTORY = [
  { symbol: 'BTC/USDT', side: 'long',  price: 82100.00, size: '0.250', fee: '4.11',  pnl: null,    ts: '2026-03-21 14:32:11' },
  { symbol: 'BTC/USDT', side: 'short', price: 84180.50, size: '0.200', fee: '3.37',  pnl: '+423.7', ts: '2026-03-21 09:14:02' },
  { symbol: 'ETH/USDT', side: 'long',  price: 3102.50,  size: '2.000', fee: '1.24',  pnl: null,    ts: '2026-03-20 17:55:19' },
];

// ─── Extract base from "BTC/USDT" → "BTC" ────────────────────────────────────
function extractBase(symbol) {
  return symbol?.split('/')?.[0] ?? symbol ?? '?';
}

// ─── Symbol cell with icon ────────────────────────────────────────────────────
function SymbolCell({ symbol }) {
  const base = extractBase(symbol);
  return (
    <div className="flex items-center gap-1.5">
      <CoinIcon symbol={base} size={16} />
      <span className="font-bold text-white text-[11px]">{symbol}</span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v, decimals = 2) {
  if (v == null) return '—';
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function sideColor(side) {
  return side === 'long' || side === 'buy' ? '#4ade80' : '#f87171';
}

function pnlColor(v) {
  return v > 0 ? '#4ade80' : v < 0 ? '#f87171' : '#94a3b8';
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Filled:    { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  icon: CheckCircle2 },
    Open:      { color: '#00d4aa', bg: 'rgba(0,212,170,0.08)',   icon: Clock },
    Cancelled: { color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: XCircle },
    Rejected:  { color: '#f87171', bg: 'rgba(248,113,113,0.08)', icon: AlertCircle },
  };
  const cfg = map[status] || map.Open;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon className="w-2.5 h-2.5" />
      {status}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.08)' }}
      >
        <Clock className="w-4 h-4" style={{ color: 'rgba(0,212,170,0.3)' }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: '#2a3348' }}>No {label}</span>
    </div>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
function ScrollTable({ children }) {
  return (
    <div className="overflow-x-auto scrollbar-none">
      <table className="w-full min-w-max border-collapse">{children}</table>
    </div>
  );
}

function TH({ children, right }) {
  return (
    <th
      className={`px-3 py-2 text-[8.5px] font-bold uppercase tracking-widest whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
      style={{ color: '#2a3348', borderBottom: '1px solid rgba(148,163,184,0.05)' }}
    >
      {children}
    </th>
  );
}

function TD({ children, right, style }) {
  return (
    <td
      className={`px-3 py-2.5 text-[11px] font-mono whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
      style={{ borderBottom: '1px solid rgba(148,163,184,0.04)', ...style }}
    >
      {children}
    </td>
  );
}

// ─── Positions tab ────────────────────────────────────────────────────────────
function PositionsTab({ positions }) {
  if (!positions.length) return <EmptyState label="open positions" />;
  return (
    <ScrollTable>
      <thead>
        <tr>
          <TH>Symbol</TH>
          <TH>Side</TH>
          <TH right>Size</TH>
          <TH right>Entry Price</TH>
          <TH right>Mark Price</TH>
          <TH right>PnL (USDT)</TH>
          <TH right>ROE %</TH>
        </tr>
      </thead>
      <tbody>
        {positions.map((p, i) => (
          <tr key={i} className="hover:bg-white/[0.015] transition-colors">
            <TD><span className="font-bold text-white text-[11px]">{p.symbol}</span></TD>
            <TD>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                style={{ color: sideColor(p.side), background: p.side === 'long' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}>
                {p.side}
              </span>
            </TD>
            <TD right style={{ color: '#e2e8f0' }}>{p.size}</TD>
            <TD right style={{ color: '#94a3b8' }}>{fmt(p.entry, p.entry > 100 ? 2 : 4)}</TD>
            <TD right style={{ color: '#00d4aa' }}>{fmt(p.mark, p.mark > 100 ? 2 : 4)}</TD>
            <TD right>
              <span className="font-bold" style={{ color: pnlColor(p.pnl) }}>
                {p.pnl >= 0 ? '+' : ''}{fmt(p.pnl)}
              </span>
            </TD>
            <TD right>
              <span className="font-bold" style={{ color: pnlColor(p.roe) }}>
                {p.roe >= 0 ? '+' : ''}{fmt(p.roe)}%
              </span>
            </TD>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

// ─── Open Orders tab ──────────────────────────────────────────────────────────
function OpenOrdersTab({ orders }) {
  if (!orders.length) return <EmptyState label="open orders" />;
  return (
    <ScrollTable>
      <thead>
        <tr>
          <TH>Symbol</TH>
          <TH>Side</TH>
          <TH>Type</TH>
          <TH right>Price</TH>
          <TH right>Size</TH>
          <TH>Status</TH>
          <TH right>Cancel</TH>
        </tr>
      </thead>
      <tbody>
        {orders.map((o, i) => (
          <tr key={i} className="hover:bg-white/[0.015] transition-colors">
            <TD><span className="font-bold text-white text-[11px]">{o.symbol}</span></TD>
            <TD>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                style={{ color: sideColor(o.side), background: o.side === 'long' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}>
                {o.side}
              </span>
            </TD>
            <TD style={{ color: '#64748b' }}>{o.type}</TD>
            <TD right style={{ color: '#e2e8f0' }}>{fmt(o.price, o.price > 100 ? 2 : 4)}</TD>
            <TD right style={{ color: '#94a3b8' }}>{o.size}</TD>
            <TD><StatusBadge status={o.status} /></TD>
            <TD right>
              <button
                className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-red-500/15"
                style={{ border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}
              >
                <X className="w-3 h-3" />
              </button>
            </TD>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

// ─── Order History tab ────────────────────────────────────────────────────────
function OrderHistoryTab({ orders }) {
  if (!orders.length) return <EmptyState label="order history" />;
  return (
    <div className="flex flex-col divide-y" style={{ divideColor: 'rgba(148,163,184,0.04)' }}>
      {orders.map((o, i) => (
        <div key={i} className="flex items-center px-3 py-2.5 gap-3 hover:bg-white/[0.015] transition-colors">
          {/* Side pill */}
          <span
            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ color: sideColor(o.side), background: o.side === 'long' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}
          >
            {o.side}
          </span>
          {/* Symbol + type */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-white">{o.symbol}</span>
            <span className="text-[9px] ml-1.5" style={{ color: '#3d4f6b' }}>{o.type}</span>
          </div>
          {/* Price × size */}
          <div className="text-right hidden sm:block">
            <div className="font-mono text-[10px] text-slate-300">{fmt(o.price, o.price > 100 ? 2 : 4)}</div>
            <div className="font-mono text-[9px]" style={{ color: '#3d4f6b' }}>× {o.size}</div>
          </div>
          {/* Status */}
          <StatusBadge status={o.status} />
          {/* Timestamp */}
          <span className="font-mono text-[8.5px] flex-shrink-0 hidden md:block" style={{ color: '#2a3348' }}>{o.ts}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Trade History tab ────────────────────────────────────────────────────────
function TradeHistoryTab({ trades }) {
  if (!trades.length) return <EmptyState label="trade history" />;
  return (
    <div className="flex flex-col divide-y" style={{ divideColor: 'rgba(148,163,184,0.04)' }}>
      {trades.map((t, i) => (
        <div key={i} className="flex items-center px-3 py-2.5 gap-3 hover:bg-white/[0.015] transition-colors">
          {/* Side dot */}
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: sideColor(t.side) }}
          />
          {/* Symbol */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-white">{t.symbol}</span>
          </div>
          {/* Price × size */}
          <div className="text-right">
            <div className="font-mono text-[10px] text-slate-300">{fmt(t.price, t.price > 100 ? 2 : 4)}</div>
            <div className="font-mono text-[9px]" style={{ color: '#3d4f6b' }}>× {t.size}</div>
          </div>
          {/* Fee */}
          <div className="text-right hidden sm:block">
            <div className="text-[8.5px]" style={{ color: '#2a3348' }}>Fee</div>
            <div className="font-mono text-[9px]" style={{ color: '#3d4f6b' }}>${t.fee}</div>
          </div>
          {/* PnL (only on closing trades) */}
          <div className="text-right w-16">
            {t.pnl ? (
              <span className="font-mono text-[10px] font-bold" style={{ color: pnlColor(parseFloat(t.pnl)) }}>
                {t.pnl}
              </span>
            ) : (
              <span className="text-[8.5px]" style={{ color: '#2a3348' }}>Open</span>
            )}
          </div>
          {/* Timestamp */}
          <span className="font-mono text-[8.5px] flex-shrink-0 hidden md:block" style={{ color: '#2a3348' }}>{t.ts}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TradingBottomPanel({
  positions   = DEMO_POSITIONS,
  openOrders  = DEMO_OPEN_ORDERS,
  orderHistory = DEMO_ORDER_HISTORY,
  tradeHistory = DEMO_TRADE_HISTORY,
}) {
  const [active, setActive] = useState('positions');

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.08)',
        borderRadius: '0 0 16px 16px',
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center border-b overflow-x-auto scrollbar-none"
        style={{ borderColor: 'rgba(148,163,184,0.07)', background: 'rgba(5,7,13,0.85)' }}
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-2.5 text-[10.5px] font-black whitespace-nowrap transition-colors flex-shrink-0"
              style={{ color: isActive ? '#00d4aa' : '#2a3348' }}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className="text-[8px] font-black px-1 py-0.5 rounded"
                  style={{
                    background: isActive ? 'rgba(0,212,170,0.12)' : 'rgba(148,163,184,0.06)',
                    color: isActive ? '#00d4aa' : '#3d4f6b',
                  }}
                >
                  {tab.count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00d4aa, rgba(0,212,170,0.4))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="overflow-x-auto overflow-y-auto scrollbar-none" style={{ maxHeight: 260 }}>
        {active === 'positions'     && <PositionsTab    positions={positions} />}
        {active === 'open_orders'   && <OpenOrdersTab   orders={openOrders} />}
        {active === 'order_history' && <OrderHistoryTab orders={orderHistory} />}
        {active === 'trade_history' && <TradeHistoryTab trades={tradeHistory} />}
      </div>
    </div>
  );
}