import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, ChevronUp, ChevronDown, Bug } from 'lucide-react';
import { useOrderBook, useTicker } from '../../hooks/useOrderlyMarket';
import { toOrderlySymbol } from '../../services/orderly/orderlySymbolMap';
import { resolveTradingPrice, normalizeSymbol } from '../../services/tradingPriceResolver';
import CoinIcon from '../shared/CoinIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROWS = 10;
const STALE_MS = 5000; // show STALE if no update in 5s

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(price) {
  if (!price) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 10) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function fmtSize(size) {
  if (!size) return '—';
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return size.toFixed(3);
}

function fmtUSD(price, cumSize) {
  const val = (price ?? 0) * (cumSize ?? 0);
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return val.toFixed(0);
}

function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString();
}

// ─── Flash hook ───────────────────────────────────────────────────────────────
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
function OrderRow({ level, maxSize, side, onClick, selectedPrice }) {
  const depthPct = Math.min((level.size / maxSize) * 100, 100);
  const flash = useFlash(level.size);
  const isAsk = side === 'ask';
  const isSelected = selectedPrice === level.price;

  return (
    <div
      onClick={() => onClick?.(level.price)}
      className="relative flex items-center px-3 hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
      style={{
        height: 28,
        background: isSelected ? (isAsk ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)') : undefined,
      }}
    >
      {/* Depth bar */}
      <div
        className="absolute top-0 bottom-0 right-0 transition-all duration-500"
        style={{
          width: `${depthPct}%`,
          background: isAsk ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
        }}
      />

      {/* Flash highlight */}
      {flash && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: isAsk ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
        />
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: isAsk ? '#f87171' : '#4ade80' }}
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
      style={{ background: 'rgba(5,7,13,0.9)', borderColor: 'rgba(148,163,184,0.06)' }}
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
          <span className="font-mono text-[10px] text-slate-400">{fmt(spread)}</span>
          {spreadPct && <span className="text-[9px] text-slate-600">({spreadPct}%)</span>}
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
  if (state === 'stale') {
    return (
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Stale</span>
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
  if (state === 'error') {
    return (
      <div className="flex items-center gap-1">
        <WifiOff className="w-3 h-3 text-red-400" />
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Error</span>
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
        style={{ width: `${35 + (i * 7) % 20}%`, background: side === 'ask' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
      />
      <div className="h-2 rounded-full bg-slate-800 animate-pulse" style={{ width: '22%', marginLeft: 'auto' }} />
      <div className="h-2 rounded-full bg-slate-800/60 animate-pulse" style={{ width: '18%' }} />
    </div>
  ));
}

// ─── Debug Panel ─────────────────────────────────────────────────────────────
function DebugPanel({ symbol, wsStatus, displayStatus, lastUpdateTs, asks, bids, lastError }) {
  const orderlySymbol = toOrderlySymbol(symbol);
  return (
    <div
      className="mx-2 mb-2 rounded-xl p-2.5 space-y-1"
      style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(234,179,8,0.2)', fontFamily: 'monospace' }}
    >
      <div className="text-[8px] font-black text-yellow-400 uppercase tracking-widest mb-1.5">
        🔬 OrderBook Debug
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span className="text-[8.5px] text-slate-500">App Symbol</span>
        <span className="text-[8.5px] text-white">{symbol}</span>
        <span className="text-[8.5px] text-slate-500">WS Topic</span>
        <span className="text-[8.5px] text-yellow-300 truncate">{orderlySymbol}@orderbook</span>
        <span className="text-[8.5px] text-slate-500">WS State</span>
        <span className={`text-[8.5px] font-bold ${wsStatus === 'live' ? 'text-emerald-400' : wsStatus === 'error' ? 'text-red-400' : 'text-amber-400'}`}>{wsStatus}</span>
        <span className="text-[8.5px] text-slate-500">Display</span>
        <span className="text-[8.5px] text-slate-300">{displayStatus}</span>
        <span className="text-[8.5px] text-slate-500">Last Update</span>
        <span className="text-[8.5px] text-slate-300">{fmtTime(lastUpdateTs)}</span>
        <span className="text-[8.5px] text-slate-500">Bids / Asks</span>
        <span className="text-[8.5px] text-slate-300">{bids.length} / {asks.length} rows</span>
        <span className="text-[8.5px] text-slate-500">Top Bid</span>
        <span className="text-[8.5px] text-emerald-400">{bids[0] ? fmt(bids[0].price) : '—'}</span>
        <span className="text-[8.5px] text-slate-500">Top Ask</span>
        <span className="text-[8.5px] text-red-400">{asks[0] ? fmt(asks[0].price) : '—'}</span>
        {lastError && <>
          <span className="text-[8.5px] text-slate-500">Error</span>
          <span className="text-[8.5px] text-red-400 truncate">{lastError}</span>
        </>}
      </div>
    </div>
  );
}

// ─── Price click toast ────────────────────────────────────────────────────────
function PriceCopiedToast({ price }) {
  if (!price) return null;
  return (
    <div
      className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-[9px] font-black pointer-events-none transition-all duration-300"
      style={{
        background: 'rgba(0,212,170,0.9)',
        color: '#000',
        boxShadow: '0 4px 20px rgba(0,212,170,0.4)',
      }}
    >
      ✓ ${fmt(price)} copied to price
    </div>
  );
}

// ─── Main OrderBook ───────────────────────────────────────────────────────────
export default function OrderBook({ symbol = 'BTC', onPriceClick }) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const { ticker } = useTicker(normalizedSymbol);
  // HARD LOCK: Use only Orderly mark/last/index price — never metadata
  const { price: tickerPrice } = resolveTradingPrice(ticker);
  const livePrice = tickerPrice > 0 ? tickerPrice : null;

  const { asks, bids, status: wsStatus, loading } = useOrderBook(normalizedSymbol);

  const [priceDir, setPriceDir] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [copiedPrice, setCopiedPrice] = useState(null);
  const [lastUpdateTs, setLastUpdateTs] = useState(null);
  const [displayStatus, setDisplayStatus] = useState('reconnecting');
  const [showDebug, setShowDebug] = useState(false);
  const prevPrice = useRef(null);
  const staleTimer = useRef(null);

  const hasData = asks.length > 0 || bids.length > 0;

  // Track last update timestamp whenever data changes
  useEffect(() => {
    if (hasData) {
      setLastUpdateTs(Date.now());
      // Reset stale timer
      clearTimeout(staleTimer.current);
      staleTimer.current = setTimeout(() => {
        setDisplayStatus(s => s === 'live' ? 'stale' : s);
      }, STALE_MS);
    }
    return () => clearTimeout(staleTimer.current);
  }, [asks, bids]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive display status: stale overrides live if data is old
  useEffect(() => {
    if (wsStatus === 'live' && !hasData) {
      setDisplayStatus('live'); // connected but empty
    } else {
      setDisplayStatus(wsStatus);
    }
  }, [wsStatus, hasData]);

  const midPrice = livePrice ?? (bids[0]?.price != null && asks[0]?.price != null
    ? (bids[0].price + asks[0].price) / 2
    : null);

  // Track price direction
  useEffect(() => {
    if (midPrice == null) return;
    if (prevPrice.current != null) {
      setPriceDir(midPrice > prevPrice.current ? 'up' : midPrice < prevPrice.current ? 'down' : null);
      const t = setTimeout(() => setPriceDir(null), 1500);
      prevPrice.current = midPrice;
      return () => clearTimeout(t);
    }
    prevPrice.current = midPrice;
  }, [midPrice]);

  const maxAskSize = useMemo(() => Math.max(...asks.map(a => a.size), 0.001), [asks]);
  const maxBidSize = useMemo(() => Math.max(...bids.map(b => b.size), 0.001), [bids]);

  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;

  const handlePriceClick = useCallback((price) => {
    setSelectedPrice(price);
    setCopiedPrice(price);
    onPriceClick?.(price);
    setTimeout(() => setCopiedPrice(null), 1500);
  }, [onPriceClick]);

  // Empty state when connected but no rows
  const isEmpty = wsStatus === 'live' && !loading && !hasData;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl relative"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Price copied toast */}
      <PriceCopiedToast price={copiedPrice} />

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
            Book
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill state={displayStatus} />
          {/* Debug toggle */}
          <button
            onClick={() => setShowDebug(v => !v)}
            className="w-5 h-5 flex items-center justify-center rounded opacity-30 hover:opacity-80 transition-opacity"
            title="Toggle debug panel"
          >
            <Bug className="w-3 h-3 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <DebugPanel
          symbol={symbol}
          wsStatus={wsStatus}
          displayStatus={displayStatus}
          lastUpdateTs={lastUpdateTs}
          asks={asks}
          bids={bids}
          lastError={wsStatus === 'error' ? 'WebSocket connection failed' : null}
        />
      )}

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
          : isEmpty
          ? <div className="flex items-center justify-center" style={{ height: 28 * ROWS }}>
              <span className="text-[9px] text-slate-600">No ask data</span>
            </div>
          : asks.slice(0, ROWS).map((level, i) => (
            <OrderRow
              key={`ask-${level.price}`}
              level={level}
              maxSize={maxAskSize}
              side="ask"
              onClick={handlePriceClick}
              selectedPrice={selectedPrice}
            />
          ))}
      </div>

      {/* Spread / mid price */}
      <SpreadBar bestAsk={bestAsk} bestBid={bestBid} midPrice={midPrice} priceDir={priceDir} />

      {/* Bids */}
      <div className="flex flex-col">
        {loading
          ? <SkeletonRows count={ROWS} side="bid" />
          : isEmpty
          ? <div className="flex items-center justify-center" style={{ height: 28 * ROWS }}>
              <span className="text-[9px] text-slate-600">No bid data</span>
            </div>
          : bids.slice(0, ROWS).map((level, i) => (
            <OrderRow
              key={`bid-${level.price}`}
              level={level}
              maxSize={maxBidSize}
              side="bid"
              onClick={handlePriceClick}
              selectedPrice={selectedPrice}
            />
          ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: 'rgba(148,163,184,0.05)', background: 'rgba(5,7,13,0.7)' }}
      >
        <span className="text-[9px] text-slate-700">
          {selectedPrice ? `Selected: $${fmt(selectedPrice)}` : 'Click price to set order'}
        </span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-sm bg-emerald-500/40" />
            <span className="text-[9px] text-slate-600">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-sm bg-red-500/40" />
            <span className="text-[9px] text-slate-600">Asks</span>
          </div>
          {lastUpdateTs && (
            <span className="text-[8px] text-slate-700">{fmtTime(lastUpdateTs)}</span>
          )}
        </div>
      </div>
    </div>
  );
}