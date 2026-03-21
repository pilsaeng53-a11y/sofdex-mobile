/**
 * OrderlyDebugPanel — Debug & Testing UI for Orderly Market Data Integration
 *
 * Toggle with: window.__ORDERLY_DEBUG__ = true; or add ?orderly_debug=1 to URL
 *
 * Shows:
 *  - WS connection status per stream (orderbook, trades, klines)
 *  - Last received data (price, bid/ask, last trade, last candle)
 *  - Stale data detection (>10s no update = orange, >30s = red)
 *  - Symbol switcher for testing topic re-subscribe
 *  - All events are also logged to console
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTicker, useOrderBook, useRecentTrades, useKlines } from '../../hooks/useOrderlyMarket';

// ─── Stale detection ──────────────────────────────────────────────────────────
function useStaleDetector(value, thresholdMs = 10000) {
  const lastUpdateRef = useRef(null);
  const [ageMs, setAgeMs] = useState(0);

  useEffect(() => {
    if (value != null) {
      lastUpdateRef.current = Date.now();
    }
  }, [value]);

  useEffect(() => {
    const id = setInterval(() => {
      if (lastUpdateRef.current != null) {
        setAgeMs(Date.now() - lastUpdateRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isStale = lastUpdateRef.current != null && ageMs > thresholdMs;
  const isDead  = lastUpdateRef.current != null && ageMs > 30000;
  return { ageMs, isStale, isDead, lastUpdate: lastUpdateRef.current };
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    live:         { label: 'LIVE',         cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    reconnecting: { label: 'RECONNECTING', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    offline:      { label: 'OFFLINE',      cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
    error:        { label: 'ERROR',        cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
  }[status] ?? { label: status?.toUpperCase() ?? '—', cls: 'bg-slate-700 text-slate-400 border-slate-600' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black tracking-wider ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-emerald-400 animate-pulse' : status === 'reconnecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
      {cfg.label}
    </span>
  );
}

// ─── Staleness indicator ──────────────────────────────────────────────────────
function StaleIndicator({ ageMs, lastUpdate }) {
  if (!lastUpdate) return <span className="text-[9px] text-slate-600">no data yet</span>;
  const secs = Math.round(ageMs / 1000);
  const color = ageMs > 30000 ? 'text-red-400' : ageMs > 10000 ? 'text-yellow-400' : 'text-emerald-400';
  return <span className={`text-[9px] font-mono ${color}`}>{secs}s ago</span>;
}

// ─── Data row ─────────────────────────────────────────────────────────────────
function Row({ label, value, mono = true }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[9px] text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-[9px] text-slate-200 ${mono ? 'font-mono' : ''} truncate max-w-[110px] text-right`}>{value ?? '—'}</span>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ title, status, stale }) {
  return (
    <div className="flex items-center justify-between mb-1.5 mt-2 first:mt-0">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="flex items-center gap-1.5">
        {stale && <span className="text-[9px] text-slate-500">last: </span>}
        {stale}
        {status && <StatusPill status={status} />}
      </div>
    </div>
  );
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

// ─── Main Debug Panel ─────────────────────────────────────────────────────────
export default function OrderlyDebugPanel() {
  const [visible, setVisible]   = useState(false);
  const [symbol,  setSymbol]    = useState('BTC');
  const [tf,      setTf]        = useState('1h');
  const [minimized, setMinimized] = useState(false);

  // Check URL param or global flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('orderly_debug') === '1' || window.__ORDERLY_DEBUG__) {
      setVisible(true);
    }
    // Expose toggle globally
    window.__toggleOrderlyDebug = () => setVisible(v => !v);
  }, []);

  // ── Live hooks ──────────────────────────────────────────────────────────
  const { ticker,  loading: tLoading } = useTicker(symbol);
  const { asks, bids, status: bookStatus }  = useOrderBook(symbol);
  const { trades, status: tradeStatus }     = useRecentTrades(symbol);
  const { candles, status: klinesStatus }   = useKlines(symbol, tf);

  // ── Staleness tracking ──────────────────────────────────────────────────
  const bookTop    = bids?.[0];
  const tradeTop   = trades?.[0];
  const candleTop  = candles?.[candles.length - 1];

  const bookStale  = useStaleDetector(bookTop?.price);
  const tradeStale = useStaleDetector(tradeTop?.price);
  const candleStale = useStaleDetector(candleTop?.ts);
  const tickerStale = useStaleDetector(ticker?.price);

  // ── Console logging ─────────────────────────────────────────────────────
  const prevBook  = useRef(null);
  const prevTrade = useRef(null);
  const prevCandle = useRef(null);
  const prevBookStatus  = useRef(null);
  const prevTradeStatus = useRef(null);
  const prevKlinesStatus = useRef(null);

  useEffect(() => {
    if (bookStatus !== prevBookStatus.current) {
      prevBookStatus.current = bookStatus;
      console.log(`[Orderly WS] OrderBook(${symbol}) status → ${bookStatus}`);
    }
  }, [bookStatus, symbol]);

  useEffect(() => {
    if (tradeStatus !== prevTradeStatus.current) {
      prevTradeStatus.current = tradeStatus;
      console.log(`[Orderly WS] Trades(${symbol}) status → ${tradeStatus}`);
    }
  }, [tradeStatus, symbol]);

  useEffect(() => {
    if (klinesStatus !== prevKlinesStatus.current) {
      prevKlinesStatus.current = klinesStatus;
      console.log(`[Orderly WS] Klines(${symbol}@${tf}) status → ${klinesStatus}`);
    }
  }, [klinesStatus, symbol, tf]);

  useEffect(() => {
    if (bookTop && bookTop.price !== prevBook.current) {
      prevBook.current = bookTop.price;
      console.log(`[Orderly WS] OrderBook msg (${symbol}): topBid=${bookTop.price}, topAsk=${asks?.[0]?.price}`);
    }
  }, [bookTop, symbol, asks]);

  useEffect(() => {
    if (tradeTop && tradeTop.id !== prevTrade.current) {
      prevTrade.current = tradeTop.id;
      console.log(`[Orderly WS] Trade msg (${symbol}): price=${tradeTop.price} side=${tradeTop.side} size=${tradeTop.size}`);
    }
  }, [tradeTop, symbol]);

  useEffect(() => {
    if (candleTop && candleTop.ts !== prevCandle.current) {
      const isFirst = prevCandle.current == null;
      prevCandle.current = candleTop.ts;
      if (isFirst) {
        console.log(`[Orderly WS] ✅ First candle arrived (${symbol}@${tf}): close=${candleTop.close} ts=${new Date(candleTop.ts).toISOString()}`);
      } else {
        console.log(`[Orderly WS] Kline update (${symbol}@${tf}): close=${candleTop.close}`);
      }
    }
  }, [candleTop, symbol, tf]);

  // Symbol change: reset prev refs so logs re-fire
  useEffect(() => {
    prevBook.current  = null;
    prevTrade.current = null;
    prevCandle.current = null;
    prevBookStatus.current = null;
    prevTradeStatus.current = null;
    prevKlinesStatus.current = null;
    console.log(`[Orderly Debug] Symbol changed → ${symbol} | tf=${tf}`);
  }, [symbol, tf]);

  if (!visible) return null;

  const fmt = (n, d = 4) => n != null ? Number(n).toFixed(d) : '—';
  const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString() : '—';

  return (
    <div
      className="fixed bottom-24 right-3 z-[9999] select-none"
      style={{ width: minimized ? 'auto' : 220 }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-2.5 py-1.5 rounded-t-xl cursor-pointer"
        style={{ background: 'rgba(6,10,22,0.98)', border: '1px solid rgba(0,212,170,0.3)', borderBottom: minimized ? undefined : '1px solid rgba(0,212,170,0.1)' }}
        onClick={() => setMinimized(m => !m)}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
          <span className="text-[9px] font-black text-[#00d4aa] tracking-widest">ORDERLY DEBUG</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-500">{minimized ? '▲' : '▼'}</span>
          <button
            className="text-[9px] text-slate-600 hover:text-red-400 transition-colors ml-1"
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          >✕</button>
        </div>
      </div>

      {!minimized && (
        <div
          className="rounded-b-xl overflow-hidden"
          style={{ background: 'rgba(4,6,14,0.97)', border: '1px solid rgba(0,212,170,0.12)', borderTop: 'none' }}
        >
          <div className="p-2.5 space-y-0.5">

            {/* Symbol switcher */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {SYMBOLS.map(s => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${symbol === s ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                >
                  {s}
                </button>
              ))}
              {['1m','5m','1h','1D'].map(t => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${tf === t ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="h-px bg-[rgba(148,163,184,0.07)] mb-1.5" />

            {/* Ticker */}
            <Section
              title="Ticker (REST)"
              stale={<StaleIndicator ageMs={tickerStale.ageMs} lastUpdate={tickerStale.lastUpdate} />}
            />
            <Row label="Mark Price"  value={ticker?.markPrice  != null ? `$${fmt(ticker.markPrice, 2)}`  : tLoading ? 'loading…' : '—'} />
            <Row label="24h Change"  value={ticker?.change24h  != null ? `${ticker.change24h.toFixed(3)}%` : '—'} />
            <Row label="24h Vol"     value={ticker?.volume24h  != null ? Number(ticker.volume24h).toLocaleString() : '—'} />

            <div className="h-px bg-[rgba(148,163,184,0.07)] my-1.5" />

            {/* Order Book */}
            <Section
              title={`OrderBook`}
              status={bookStatus}
              stale={<StaleIndicator ageMs={bookStale.ageMs} lastUpdate={bookStale.lastUpdate} />}
            />
            <Row label="Top Bid"  value={bookTop  ? `$${fmt(bookTop.price, 2)} (${fmt(bookTop.size, 3)})` : '—'} />
            <Row label="Top Ask"  value={asks?.[0] ? `$${fmt(asks[0].price, 2)} (${fmt(asks[0].size, 3)})` : '—'} />
            <Row label="Spread"   value={(bids[0] && asks[0]) ? `$${(asks[0].price - bids[0].price).toFixed(2)}` : '—'} />
            <Row label="Rows"     value={`${bids.length} bids / ${asks.length} asks`} />
            {bookStale.isDead && <p className="text-[9px] text-red-400 mt-0.5">⚠ No book update in 30s</p>}

            <div className="h-px bg-[rgba(148,163,184,0.07)] my-1.5" />

            {/* Trades */}
            <Section
              title="Trades"
              status={tradeStatus}
              stale={<StaleIndicator ageMs={tradeStale.ageMs} lastUpdate={tradeStale.lastUpdate} />}
            />
            <Row label="Last Price" value={tradeTop ? `$${fmt(tradeTop.price, 2)}` : '—'} />
            <Row label="Last Side"  value={tradeTop?.side ?? '—'} />
            <Row label="Last Size"  value={tradeTop ? fmt(tradeTop.size, 4) : '—'} />
            <Row label="Total"      value={`${trades.length} trades`} />
            {tradeStale.isDead && <p className="text-[9px] text-red-400 mt-0.5">⚠ No trade update in 30s</p>}

            <div className="h-px bg-[rgba(148,163,184,0.07)] my-1.5" />

            {/* Klines */}
            <Section
              title={`Klines (${tf})`}
              status={klinesStatus}
              stale={<StaleIndicator ageMs={candleStale.ageMs} lastUpdate={candleStale.lastUpdate} />}
            />
            <Row label="Candles"    value={candles.length > 0 ? `${candles.length} candles` : klinesStatus === 'live' ? 'waiting…' : 'no data'} />
            <Row label="Last Close" value={candleTop ? `$${fmt(candleTop.close, 2)}` : '—'} />
            <Row label="Last Time"  value={candleTop ? fmtTime(candleTop.ts) : '—'} />
            {candles.length === 0 && klinesStatus === 'live' && (
              <p className="text-[9px] text-yellow-400 mt-0.5">⚡ Connected — awaiting first {tf} tick</p>
            )}
            {candleStale.isDead && <p className="text-[9px] text-red-400 mt-0.5">⚠ No kline update in 30s</p>}

            <div className="h-px bg-[rgba(148,163,184,0.07)] my-1.5" />

            {/* Footer hint */}
            <p className="text-[8px] text-slate-700 text-center pt-0.5">
              All events → console · close: window.__toggleOrderlyDebug()
            </p>
          </div>
        </div>
      )}
    </div>
  );
}