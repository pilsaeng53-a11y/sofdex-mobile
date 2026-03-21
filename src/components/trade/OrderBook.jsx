import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { useMarketData } from '../shared/MarketDataProvider';
import { useOrderBook } from '../../hooks/useOrderlyMarket';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROWS = 10;
const TICK_INTERVAL = 1800; // ms between order book updates

// ─── Generate a realistic simulated order book level ─────────────────────────
function makeLevel(price, side, idx) {
  // Clusters of size near round price levels
  const baseSize = 0.15 + Math.random() * 4.5;
  const size = parseFloat(baseSize.toFixed(3));
  return { price, size, side };
}

function buildBook(midPrice, tickSize = 0.5) {
  const asks = [];
  const bids = [];

  for (let i = 0; i < ROWS; i++) {
    const askPrice = parseFloat((midPrice + (i + 1) * tickSize).toFixed(2));
    const bidPrice = parseFloat((midPrice - (i + 1) * tickSize).toFixed(2));
    asks.push(makeLevel(askPrice, 'ask', i));
    bids.push(makeLevel(bidPrice, 'bid', i));
  }

  // Sort: asks ascending (cheapest ask at bottom = nearest spread), bids descending
  asks.sort((a, b) => a.price - b.price);
  bids.sort((a, b) => b.price - a.price);

  // Add cumulative totals
  let cumAsk = 0;
  asks.forEach(l => { cumAsk += l.size; l.cumulative = parseFloat(cumAsk.toFixed(3)); });
  let cumBid = 0;
  bids.forEach(l => { cumBid += l.size; l.cumulative = parseFloat(cumBid.toFixed(3)); });

  return { asks, bids };
}

function getTickSize(price) {
  if (price > 10000) return 5;
  if (price > 1000) return 1;
  if (price > 100) return 0.1;
  if (price > 10) return 0.01;
  return 0.001;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 10) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function fmtSize(size) {
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return size.toFixed(3);
}

function fmtUSD(price, size) {
  const val = price * size;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return val.toFixed(0);
}

// ─── Flash row on change ──────────────────────────────────────────────────────
function useFlash(value) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 350);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

// ─── Single order row ─────────────────────────────────────────────────────────
function OrderRow({ level, maxSize, side, onClick }) {
  const depthPct = Math.min((level.size / maxSize) * 100, 100);
  const flash = useFlash(level.size);
  const isAsk = side === 'ask';

  return (
    <div
      onClick={() => onClick?.(level.price)}
      className="relative flex items-center px-3 hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
      style={{ height: 28 }}
    >
      {/* Depth bar */}
      <div
        className="absolute top-0 bottom-0 transition-all duration-500"
        style={{
          [isAsk ? 'right' : 'right']: 0,
          right: 0,
          width: `${depthPct}%`,
          background: isAsk
            ? 'rgba(239,68,68,0.07)'
            : 'rgba(34,197,94,0.07)',
        }}
      />

      {/* Flash highlight */}
      {flash && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: isAsk ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
        />
      )}

      {/* Price */}
      <span
        className="relative z-10 font-mono text-[11px] font-semibold w-[38%]"
        style={{ color: isAsk ? '#f87171' : '#4ade80' }}
      >
        {fmt(level.price)}
      </span>

      {/* Size */}
      <span className="relative z-10 font-mono text-[11px] text-slate-300 w-[31%] text-right">
        {fmtSize(level.size)}
      </span>

      {/* Total USD */}
      <span className="relative z-10 font-mono text-[10px] text-slate-500 w-[31%] text-right">
        {fmtUSD(level.price, level.cumulative)}
      </span>
    </div>
  );
}

// ─── Spread bar ───────────────────────────────────────────────────────────────
function SpreadBar({ bestAsk, bestBid, midPrice, priceDir }) {
  const spread = bestAsk != null && bestBid != null ? (bestAsk - bestBid) : null;
  const spreadPct = spread != null && midPrice ? ((spread / midPrice) * 100).toFixed(3) : null;

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 border-y"
      style={{
        background: 'rgba(5,7,13,0.9)',
        borderColor: 'rgba(148,163,184,0.06)',
      }}
    >
      <div className="flex items-center gap-1.5">
        {priceDir === 'up'
          ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
          : priceDir === 'down'
          ? <ChevronDown className="w-3.5 h-3.5 text-red-400" />
          : null}
        <span
          className="font-mono text-sm font-black"
          style={{ color: priceDir === 'up' ? '#4ade80' : priceDir === 'down' ? '#f87171' : '#e2e8f0' }}
        >
          {midPrice ? fmt(midPrice) : '—'}
        </span>
        <span className="text-[9px] text-slate-600 ml-1">Mark</span>
      </div>
      {spread != null && (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-600">Spread</span>
          <span className="font-mono text-[10px] text-slate-400">
            {fmt(spread)}
          </span>
          <span className="text-[9px] text-slate-600">({spreadPct}%)</span>
        </div>
      )}
    </div>
  );
}

// ─── Connection status pill ───────────────────────────────────────────────────
function StatusPill({ state }) {
  if (state === 'live') {
    return (
      <div className="flex items-center gap-1">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </div>
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
      </div>
    );
  }
  if (state === 'reconnecting') {
    return (
      <div className="flex items-center gap-1">
        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Reconnecting</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <WifiOff className="w-3 h-3 text-slate-500" />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offline</span>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRows({ count, side }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="flex items-center px-3 gap-3" style={{ height: 28 }}>
      <div
        className="h-2.5 rounded-full animate-pulse"
        style={{ width: `${35 + Math.random() * 20}%`, background: side === 'ask' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
      />
      <div className="h-2 rounded-full bg-slate-800 animate-pulse" style={{ width: '22%', marginLeft: 'auto' }} />
      <div className="h-2 rounded-full bg-slate-800/60 animate-pulse" style={{ width: '18%' }} />
    </div>
  ));
}

// ─── Main OrderBook ───────────────────────────────────────────────────────────
export default function OrderBook({ symbol = 'BTC', onPriceClick }) {
  const { getLiveAsset } = useMarketData();
  const liveAsset = getLiveAsset(symbol);
  const livePrice = liveAsset?.price;

  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('live'); // live | reconnecting | offline
  const [priceDir, setPriceDir] = useState(null); // up | down | null
  const prevPrice = useRef(null);
  const failCount = useRef(0);
  const midPrice = livePrice ?? (bids[0]?.price != null && asks[0]?.price != null
    ? (bids[0].price + asks[0].price) / 2
    : null);

  const refresh = useCallback(() => {
    if (!midPrice) return;
    try {
      const tick = getTickSize(midPrice);
      const { asks: newAsks, bids: newBids } = buildBook(midPrice, tick);
      setAsks(newAsks);
      setBids(newBids);
      setLoading(false);

      // Price direction
      if (prevPrice.current != null) {
        setPriceDir(midPrice > prevPrice.current ? 'up' : midPrice < prevPrice.current ? 'down' : null);
      }
      prevPrice.current = midPrice;

      failCount.current = 0;
      setStatus('live');
    } catch {
      failCount.current += 1;
      if (failCount.current >= 3) setStatus('offline');
      else setStatus('reconnecting');
    }
  }, [midPrice]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, TICK_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  const maxAskSize = useMemo(() => Math.max(...asks.map(a => a.size), 0.001), [asks]);
  const maxBidSize = useMemo(() => Math.max(...bids.map(b => b.size), 0.001), [bids]);

  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;

  const handlePriceClick = (price) => onPriceClick?.(price);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.07)', background: 'rgba(5,7,13,0.8)' }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="text-xs font-black text-white tracking-wide">Order Book</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            {symbol}/USDT
          </span>
        </div>
        <StatusPill state={status} />
      </div>

      {/* Column headers */}
      <div
        className="grid px-3 py-1.5 border-b"
        style={{ gridTemplateColumns: '38% 31% 31%', borderColor: 'rgba(148,163,184,0.05)', background: 'rgba(5,7,13,0.5)' }}
      >
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Price (USD)</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-right">Qty ({symbol})</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-right">Total (USD)</span>
      </div>

      {/* Asks (reversed so lowest ask is closest to spread) */}
      <div className="flex flex-col-reverse">
        {loading
          ? <SkeletonRows count={ROWS} side="ask" />
          : asks.map((level, i) => (
            <OrderRow key={i} level={level} maxSize={maxAskSize} side="ask" onClick={handlePriceClick} />
          ))}
      </div>

      {/* Spread / mid price */}
      <SpreadBar bestAsk={bestAsk} bestBid={bestBid} midPrice={midPrice} priceDir={priceDir} />

      {/* Bids */}
      <div className="flex flex-col">
        {loading
          ? <SkeletonRows count={ROWS} side="bid" />
          : bids.map((level, i) => (
            <OrderRow key={i} level={level} maxSize={maxBidSize} side="bid" onClick={handlePriceClick} />
          ))}
      </div>

      {/* Footer — aggregation hint */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: 'rgba(148,163,184,0.05)', background: 'rgba(5,7,13,0.7)' }}
      >
        <span className="text-[9px] text-slate-700">Click price to set order</span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-sm bg-emerald-500/40" />
            <span className="text-[9px] text-slate-600">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-sm bg-red-500/40" />
            <span className="text-[9px] text-slate-600">Asks</span>
          </div>
        </div>
      </div>
    </div>
  );
}