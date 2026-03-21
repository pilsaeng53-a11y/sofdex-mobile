/**
 * OrderlyDebugPanel — Live validation of Orderly market data streams
 *
 * Toggle: window.__toggleOrderlyDebug() or URL ?orderly_debug=1
 *
 * Indicators:
 *   LIVE         — data updated within last 5s
 *   STALE        — no update for 5–30s
 *   DEAD         — no update for 30s+
 *   RECONNECTING — WS in reconnect state
 *
 * All WS events + symbol changes logged to console.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTicker, useOrderBook, useRecentTrades, useKlines } from '../../hooks/useOrderlyMarket';

const STALE_MS = 5000;
const DEAD_MS  = 30000;

// ─── Per-stream staleness tracker ────────────────────────────────────────────
function useStreamAge(sentinel) {
  const lastRef  = useRef(null);
  const [ageMs, setAgeMs] = useState(0);

  useEffect(() => {
    if (sentinel != null) {
      lastRef.current = Date.now();
      setAgeMs(0);
    }
  }, [sentinel]);

  useEffect(() => {
    const id = setInterval(() => {
      if (lastRef.current != null) setAgeMs(Date.now() - lastRef.current);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const isStale = lastRef.current != null && ageMs > STALE_MS;
  const isDead  = lastRef.current != null && ageMs > DEAD_MS;
  const noData  = lastRef.current == null;
  return { ageMs, isStale, isDead, noData, lastTs: lastRef.current };
}

// ─── Health badge (LIVE / STALE / DEAD / RECONNECTING) ────────────────────────
function HealthBadge({ wsStatus, ageMs, noData, isStale, isDead }) {
  let label, dot, color;

  if (wsStatus === 'reconnecting') {
    label = 'RECONNECTING'; dot = 'bg-yellow-400 animate-ping'; color = 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10';
  } else if (noData) {
    label = 'NO DATA'; dot = 'bg-slate-500'; color = 'text-slate-400 border-slate-600/40 bg-slate-700/20';
  } else if (isDead) {
    label = 'DEAD'; dot = 'bg-red-400'; color = 'text-red-300 border-red-500/40 bg-red-500/10';
  } else if (isStale) {
    label = 'STALE'; dot = 'bg-orange-400 animate-pulse'; color = 'text-orange-300 border-orange-500/40 bg-orange-500/10';
  } else {
    label = 'LIVE'; dot = 'bg-emerald-400 animate-pulse'; color = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8.5px] font-black tracking-wider ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

// ─── Age display ──────────────────────────────────────────────────────────────
function AgeLabel({ ageMs, noData }) {
  if (noData) return <span className="text-[8.5px] text-slate-600 font-mono">—</span>;
  const secs = (ageMs / 1000).toFixed(1);
  const color = ageMs > DEAD_MS ? 'text-red-400' : ageMs > STALE_MS ? 'text-orange-400' : 'text-emerald-400';
  return <span className={`text-[8.5px] font-mono ${color}`}>{secs}s ago</span>;
}

// ─── Timestamp display ────────────────────────────────────────────────────────
function TsLabel({ ts }) {
  if (!ts) return <span className="text-[8.5px] text-slate-600 font-mono">—</span>;
  const d = new Date(ts);
  const t = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
  return <span className="text-[8.5px] font-mono text-slate-300">{t}</span>;
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-[2px]">
      <span className="text-[8.5px] text-slate-500 flex-shrink-0 mr-2">{label}</span>
      <span className="text-[8.5px] font-mono text-slate-200 truncate max-w-[120px] text-right">{value ?? '—'}</span>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, wsStatus, streamAge }) {
  return (
    <div className="flex items-center justify-between mb-1 mt-2.5 first:mt-0">
      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="flex items-center gap-1.5">
        <AgeLabel ageMs={streamAge.ageMs} noData={streamAge.noData} />
        <HealthBadge wsStatus={wsStatus} {...streamAge} />
      </div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Div() {
  return <div className="h-px my-1.5" style={{ background: 'rgba(148,163,184,0.06)' }} />;
}

const TEST_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'ARB'];
const TEST_TFS     = ['1m', '5m', '1h', '1D'];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderlyDebugPanel() {
  const [visible,   setVisible]   = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [symbol,    setSymbol]    = useState('BTC');
  const [tf,        setTf]        = useState('1h');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('orderly_debug') === '1' || window.__ORDERLY_DEBUG__) setVisible(true);
    window.__toggleOrderlyDebug = () => setVisible(v => !v);

    // Print integration verification summary on load
    console.group('[Orderly Debug] ═══ Integration Verification Summary ═══');
    console.log('WS URL:          wss://ws-evm.orderly.org/ws/stream/<guest_id>');
    console.log('REST URL:        https://api.orderly.org');
    console.log('Price priority:  mark_price → lastPrice (24h_close) → indexPrice');
    console.log('OrderPanel:      uses Orderly ticker only (no MarketDataProvider)');
    console.log('ChartContainer:  uses Orderly ticker + klines only');
    console.log('StatsBar:        uses Orderly ticker (REST poll every 5s)');
    console.log('Subscriptions:   orderbook · trade · kline_{tf} — all via WS');
    console.log('Stale watchdog:  15s → forced reconnect');
    console.log('Heartbeat:       client ping every 10s; server ping → pong reply');
    console.log('Toggle panel:    window.__toggleOrderlyDebug()  or  ?orderly_debug=1');
    console.groupEnd();
  }, []);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { ticker, loading: tLoad }             = useTicker(symbol);
  const { asks, bids, status: bookStatus }      = useOrderBook(symbol);
  const { trades, status: tradeStatus }         = useRecentTrades(symbol);
  const { candles, status: klinesStatus }       = useKlines(symbol, tf);

  // ── Stream sentinels (change = new data) ──────────────────────────────────
  const bookSentinel   = bids?.[0]?.price;
  const tradeSentinel  = trades?.[0]?.id ?? trades?.[0]?.price;
  const candleSentinel = candles?.[candles.length - 1]?.ts;
  const tickerSentinel = ticker?.markPrice ?? ticker?.lastPrice;

  const bookAge   = useStreamAge(bookSentinel);
  const tradeAge  = useStreamAge(tradeSentinel);
  const candleAge = useStreamAge(candleSentinel);
  const tickerAge = useStreamAge(tickerSentinel);

  // ── Console logging: WS status changes ────────────────────────────────────
  const prevStatuses = useRef({});
  useEffect(() => {
    const streams = { book: bookStatus, trades: tradeStatus, klines: klinesStatus };
    Object.entries(streams).forEach(([k, v]) => {
      if (prevStatuses.current[k] !== v) {
        const prev = prevStatuses.current[k];
        prevStatuses.current[k] = v;
        console.log(`[Orderly WS] ${k}(${symbol}) ${prev ?? 'init'} → ${v}`);
      }
    });
  }, [bookStatus, tradeStatus, klinesStatus, symbol]);

  // ── Console logging: data events ──────────────────────────────────────────
  const prevBook  = useRef(null);
  const prevTrade = useRef(null);
  const prevCandle = useRef(null);

  useEffect(() => {
    const bid = bids?.[0], ask = asks?.[0];
    const key = bid?.price;
    if (key != null && key !== prevBook.current) {
      prevBook.current = key;
      console.log(`[Orderly Data] OrderBook(${symbol}) topBid=${bid.price} topAsk=${ask?.price} spread=${ask && bid ? (ask.price - bid.price).toFixed(2) : '?'} ts=${new Date().toISOString()}`);
    }
  }, [bids, asks, symbol]);

  useEffect(() => {
    const t = trades?.[0];
    const key = t?.id ?? t?.price;
    if (key != null && key !== prevTrade.current) {
      prevTrade.current = key;
      console.log(`[Orderly Data] Trade(${symbol}) price=${t.price} side=${t.side} size=${t.size} ts=${new Date(t.ts ?? Date.now()).toISOString()}`);
    }
  }, [trades, symbol]);

  useEffect(() => {
    const c = candles?.[candles.length - 1];
    if (c?.ts != null && c.ts !== prevCandle.current) {
      const isFirst = prevCandle.current == null;
      prevCandle.current = c.ts;
      console.log(`[Orderly Data] Kline(${symbol}@${tf}) ${isFirst ? '✅ first candle' : 'update'} close=${c.close} ts=${new Date(c.ts).toISOString()}`);
    }
  }, [candles, symbol, tf]);

  // ── Log symbol / tf changes ───────────────────────────────────────────────
  useEffect(() => {
    prevBook.current = null; prevTrade.current = null; prevCandle.current = null;
    prevStatuses.current = {};
    console.log(`[Orderly Debug] ▶ Symbol change → ${symbol} | tf=${tf}`);
    console.log(`[Orderly Debug]   Will subscribe: orderbook, trades, klines/${tf}`);
  }, [symbol, tf]);

  if (!visible) return null;

  const fmt2 = v => v != null ? Number(v).toFixed(2) : '—';
  const fmt4 = v => v != null ? Number(v).toFixed(4) : '—';

  return (
    <div className="fixed bottom-24 right-2 z-[9999] select-none" style={{ width: minimized ? 'auto' : 228 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-2.5 py-1.5 rounded-t-xl cursor-pointer"
        style={{ background: 'rgba(4,6,14,0.99)', border: '1px solid rgba(0,212,170,0.35)' }}
        onClick={() => setMinimized(m => !m)}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse flex-shrink-0" />
          <span className="text-[8.5px] font-black tracking-widest" style={{ color: '#00d4aa' }}>ORDERLY LIVE DEBUG</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8.5px] text-slate-500">{minimized ? '▲' : '▼'}</span>
          <button className="text-[8.5px] text-slate-600 hover:text-red-400 ml-1" onClick={e => { e.stopPropagation(); setVisible(false); }}>✕</button>
        </div>
      </div>

      {!minimized && (
        <div className="rounded-b-xl overflow-hidden" style={{ background: 'rgba(3,5,12,0.99)', border: '1px solid rgba(0,212,170,0.12)', borderTop: 'none' }}>
          <div className="p-2.5">

            {/* Symbol + TF switcher */}
            <div className="flex flex-wrap gap-1 mb-2">
              {TEST_SYMBOLS.map(s => (
                <button key={s} onClick={() => setSymbol(s)}
                  className="px-1.5 py-0.5 rounded text-[8.5px] font-bold transition-all"
                  style={symbol === s
                    ? { background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }
                    : { color: '#475569', border: '1px solid transparent' }}>
                  {s}
                </button>
              ))}
              {TEST_TFS.map(t => (
                <button key={t} onClick={() => setTf(t)}
                  className="px-1.5 py-0.5 rounded text-[8.5px] font-bold transition-all"
                  style={tf === t
                    ? { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
                    : { color: '#475569', border: '1px solid transparent' }}>
                  {t}
                </button>
              ))}
            </div>

            <Div />

            {/* ── Ticker (REST poll) ── */}
            <SectionHeader title="Ticker (REST 5s)" wsStatus={tLoad ? 'reconnecting' : 'live'} streamAge={tickerAge} />
            <Row label="Symbol"     value={symbol} />
            <Row label="Mark Price" value={ticker?.markPrice != null ? `$${fmt2(ticker.markPrice)}` : tLoad ? 'loading…' : '—'} />
            <Row label="Last Price" value={ticker?.lastPrice != null ? `$${fmt2(ticker.lastPrice)}` : '—'} />
            <Row label="24h Change" value={ticker?.change24h != null ? `${ticker.change24h.toFixed(3)}%` : '—'} />
            <Row label="Last upd"   value={<TsLabel ts={tickerAge.lastTs} />} />

            <Div />

            {/* ── Order Book (WS) ── */}
            <SectionHeader title="Order Book (WS)" wsStatus={bookStatus} streamAge={bookAge} />
            <Row label="Top Bid"  value={bids?.[0] ? `$${fmt2(bids[0].price)} × ${fmt4(bids[0].size)}` : '—'} />
            <Row label="Top Ask"  value={asks?.[0] ? `$${fmt2(asks[0].price)} × ${fmt4(asks[0].size)}` : '—'} />
            <Row label="Spread"   value={(bids[0] && asks[0]) ? `$${(asks[0].price - bids[0].price).toFixed(3)}` : '—'} />
            <Row label="Depth"    value={`${bids.length} bids / ${asks.length} asks`} />
            <Row label="Last upd" value={<TsLabel ts={bookAge.lastTs} />} />
            {bookAge.isDead && <p className="text-[8px] text-red-400 mt-0.5">⚠ No book update in 30s — reconnecting…</p>}

            <Div />

            {/* ── Trades (WS) ── */}
            <SectionHeader title="Recent Trades (WS)" wsStatus={tradeStatus} streamAge={tradeAge} />
            <Row label="Last Price" value={trades?.[0] ? `$${fmt2(trades[0].price)}` : '—'} />
            <Row label="Last Side"  value={trades?.[0]?.side ?? '—'} />
            <Row label="Last Size"  value={trades?.[0] ? fmt4(trades[0].size) : '—'} />
            <Row label="Count"      value={`${trades.length} trades buffered`} />
            <Row label="Last upd"   value={<TsLabel ts={tradeAge.lastTs} />} />
            {tradeAge.isDead && <p className="text-[8px] text-red-400 mt-0.5">⚠ No trade update in 30s — reconnecting…</p>}

            <Div />

            {/* ── Klines (WS) ── */}
            <SectionHeader title={`Klines (WS · ${tf})`} wsStatus={klinesStatus} streamAge={candleAge} />
            <Row label="Candles"    value={candles.length > 0 ? candles.length : klinesStatus === 'live' ? 'waiting first tick…' : 'no data'} />
            <Row label="Last Close" value={candles.length ? `$${fmt2(candles[candles.length - 1].close)}` : '—'} />
            <Row label="Last Open"  value={candles.length ? `$${fmt2(candles[candles.length - 1].open)}` : '—'} />
            <Row label="Candle ts"  value={candles.length ? <TsLabel ts={candles[candles.length - 1].ts} /> : '—'} />
            <Row label="Last upd"   value={<TsLabel ts={candleAge.lastTs} />} />
            {candles.length === 0 && klinesStatus === 'live' && (
              <p className="text-[8px] text-yellow-400 mt-0.5">⚡ WS live — awaiting first {tf} candle tick</p>
            )}
            {candleAge.isDead && <p className="text-[8px] text-red-400 mt-0.5">⚠ No kline update in 30s — reconnecting…</p>}

            <Div />

            {/* Footer */}
            <p className="text-[7.5px] text-slate-700 text-center">
              STALE &gt;{STALE_MS/1000}s · DEAD &gt;{DEAD_MS/1000}s · all events → console
            </p>
          </div>
        </div>
      )}
    </div>
  );
}