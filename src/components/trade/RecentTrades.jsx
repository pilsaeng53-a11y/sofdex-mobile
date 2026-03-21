import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, WifiOff, ArrowDownUp } from 'lucide-react';
import { useMarketData } from '../shared/MarketDataProvider';
import { useRecentTrades } from '../../hooks/useOrderlyMarket';
import CoinIcon from '../shared/CoinIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_TRADES   = 30;
const TICK_MS      = 1400; // how often new trades arrive
const INIT_COUNT   = 20;   // initial synthetic history

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtPrice(price) {
  if (price == null || isNaN(price)) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 10)   return price.toFixed(2);
  if (price >= 1)    return price.toFixed(4);
  return price.toFixed(6);
}

function fmtSize(size) {
  if (size == null || isNaN(size)) return '—';
  if (size >= 1000) return `${(size / 1000).toFixed(2)}K`;
  if (size >= 100)  return size.toFixed(1);
  return size.toFixed(3);
}

function fmtTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// ─── Trade generator ──────────────────────────────────────────────────────────
let _idCounter = 1;
function makeTrade(midPrice, prevPrice) {
  const spread  = midPrice * 0.0008;
  const isBuy   = Math.random() > 0.5;
  // Cluster trades near the mid with occasional larger slippage
  const slip    = (Math.random() - 0.5) * spread * 2.5;
  const price   = parseFloat((midPrice + slip).toFixed(
    midPrice >= 1000 ? 2 : midPrice >= 10 ? 2 : 4
  ));
  // Heavy-tail size distribution (mostly small, occasional whale)
  const u       = Math.random();
  const size    = u > 0.96
    ? parseFloat((2 + Math.random() * 18).toFixed(3))  // whale
    : parseFloat((0.005 + Math.random() * 1.2).toFixed(3)); // retail

  return {
    id:    _idCounter++,
    price,
    size,
    side:  isBuy ? 'buy' : 'sell',
    ts:    Date.now(),
    fresh: true,
  };
}

function buildHistory(midPrice, count) {
  const now   = Date.now();
  const trades = [];
  for (let i = count; i >= 1; i--) {
    trades.push({
      ...(makeTrade(midPrice, midPrice)),
      ts:    now - i * TICK_MS * (0.8 + Math.random() * 0.4),
      fresh: false,
    });
  }
  return trades;
}

// ─── Status pill (matches OrderBook exactly) ─────────────────────────────────
function StatusPill({ state }) {
  if (state === 'live') return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
      </div>
      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
    </div>
  );
  if (state === 'reconnecting') return (
    <div className="flex items-center gap-1">
      <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Reconnecting</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <WifiOff className="w-3 h-3 text-slate-500" />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offline</span>
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows({ count = 16 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center px-3 gap-2" style={{ height: 26 }}>
          <div
            className="h-2.5 rounded-full animate-pulse"
            style={{
              width: `${32 + (i % 3) * 8}%`,
              background: i % 2 === 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
            }}
          />
          <div className="h-2 rounded-full bg-slate-800 animate-pulse ml-auto" style={{ width: '20%' }} />
          <div className="h-2 rounded-full bg-slate-800/50 animate-pulse" style={{ width: '16%' }} />
        </div>
      ))}
    </>
  );
}

// ─── Single trade row ─────────────────────────────────────────────────────────
function TradeRow({ trade }) {
  const isBuy     = trade.side === 'buy';
  const color     = isBuy ? '#4ade80' : '#f87171';
  const flashBg   = isBuy ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';
  const [flashing, setFlashing] = useState(trade.fresh);

  useEffect(() => {
    if (!trade.fresh) return;
    const t = setTimeout(() => setFlashing(false), 420);
    return () => clearTimeout(t);
  }, [trade.fresh]);

  return (
    <div
      className="relative flex items-center px-3 transition-colors hover:bg-white/[0.025] cursor-default select-none"
      style={{ height: 26 }}
    >
      {/* Flash overlay */}
      {flashing && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-400"
          style={{ background: flashBg, opacity: flashing ? 1 : 0 }}
        />
      )}

      {/* Price */}
      <span
        className="relative z-10 font-mono text-[11px] font-semibold w-[40%] leading-none"
        style={{ color }}
      >
        {fmtPrice(trade.price)}
      </span>

      {/* Size */}
      <span
        className="relative z-10 font-mono text-[11px] font-medium w-[32%] text-right leading-none"
        style={{ color: '#94a3b8' }}
      >
        {fmtSize(trade.size)}
      </span>

      {/* Time */}
      <span
        className="relative z-10 font-mono text-[10px] w-[28%] text-right leading-none"
        style={{ color: '#3d4f6b' }}
      >
        {fmtTime(trade.ts)}
      </span>
    </div>
  );
}

// ─── Empty / error state ──────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <ArrowDownUp className="w-6 h-6" style={{ color: '#2a3348' }} />
      <span className="text-[10px] font-semibold" style={{ color: '#3d4f6b' }}>{message}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecentTrades({ symbol = 'BTC' }) {
  // Live trade stream from Orderly public WebSocket
  const { trades, status, loading } = useRecentTrades(symbol);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, rgba(0,212,170,0.25), rgba(59,130,246,0.15), transparent)' }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.07)', background: 'rgba(5,7,13,0.8)' }}
      >
        <div className="flex items-center gap-2">
          <CoinIcon symbol={symbol} size={18} />
          <span className="text-xs font-black text-white tracking-wide">{symbol}</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            Trades
          </span>
        </div>
        <StatusPill state={status} />
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-3 py-1.5 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.05)', background: 'rgba(5,7,13,0.5)' }}
      >
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-[40%]">Price (USD)</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-[32%] text-right">Size ({symbol})</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-[28%] text-right">Time</span>
      </div>

      {/* Trade rows */}
      <div className="flex flex-col overflow-hidden">
        {loading ? (
          <SkeletonRows count={16} />
        ) : trades.length === 0 ? (
          <EmptyState message="No recent trades available" />
        ) : (
          trades.map(trade => (
            <TradeRow key={trade.id} trade={trade} />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: 'rgba(148,163,184,0.05)', background: 'rgba(5,7,13,0.7)' }}
      >
        <span className="text-[9px]" style={{ color: '#2a3348' }}>
          {trades.length > 0 ? `${trades.length} trades` : 'Waiting for trades'}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
            <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Buy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
            <span className="text-[9px]" style={{ color: '#3d4f6b' }}>Sell</span>
          </div>
        </div>
      </div>
    </div>
  );
}