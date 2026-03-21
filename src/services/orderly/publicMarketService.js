/**
 * Orderly Network — Public Market Data Service
 *
 * Provides:
 *  - fetchTicker()    → 24h stats (price, change, volume, OI, funding)
 *  - fetchOrderBook() → current bids/asks snapshot
 *  - fetchTrades()    → recent public trades
 *  - fetchKlines()    → OHLCV candles for a timeframe
 *  - subscribeOrderBook() → live WS order book with reconnect
 *  - subscribeTrades()    → live WS trade stream with reconnect
 *
 * Design principles:
 *  - NO UI imports, NO React, NO component coupling
 *  - Returns plain data objects matching the shapes the UI components expect
 *  - All errors are thrown so callers (hooks) can handle loading/error state
 *  - WebSocket subscriptions return an `unsubscribe` function for cleanup
 *
 * Future-proofing:
 *  - Private order/account endpoints will live in a separate
 *    services/orderly/privateAccountService.js — never in this file
 *  - Database caching (watchlist, order history) will be layered on top
 *    of these primitives in services/user/ without modifying this file
 */

import { ORDERLY_BASE_URL, ORDERLY_WS_URL, toOrderlySymbol, TIMEFRAME_MAP } from './orderlySymbolMap';

const MAX_RECONNECT_DELAY = 16000; // ms

// ─── REST helpers ──────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${ORDERLY_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Orderly API ${res.status}: ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Orderly API error');
  return json.data;
}

// ─── Ticker / market stats ─────────────────────────────────────────────────────

/**
 * Fetch 24h ticker for a symbol.
 * Returns { price, markPrice, change24h, volume24h, openInterest, fundingRate, symbol }
 */
export async function fetchTicker(appSymbol) {
  const sym  = toOrderlySymbol(appSymbol);
  const data = await get(`/v1/public/futures/${sym}`);

  return {
    symbol:      appSymbol,
    price:       data.mark_price ?? data.last_price ?? null,
    markPrice:   data.mark_price ?? null,
    lastPrice:   data.last_price ?? null,
    change24h:   data['24h_change'] ?? null,          // percentage, e.g. 2.34
    volume24h:   data['24h_amount'] ?? null,           // in quote (USDC)
    openInterest: data.open_interest ?? null,
    fundingRate:  data.est_funding_rate ?? null,       // decimal, e.g. 0.0001
    indexPrice:   data.index_price ?? null,
  };
}

// ─── Order book ───────────────────────────────────────────────────────────────

/**
 * Fetch current order book snapshot (20 levels each side).
 * Returns { asks: [{price, size}], bids: [{price, size}] }
 */
export async function fetchOrderBook(appSymbol, maxRows = 10) {
  const sym  = toOrderlySymbol(appSymbol);
  const data = await get(`/v1/public/orderbook/${sym}?max_level=${maxRows}`);
  return normaliseBook(data, maxRows);
}

function normaliseBook(data, maxRows) {
  const asks = (data.asks ?? []).slice(0, maxRows).map(([price, size]) => ({
    price: parseFloat(price),
    size:  parseFloat(size),
    side:  'ask',
  }));
  const bids = (data.bids ?? []).slice(0, maxRows).map(([price, size]) => ({
    price: parseFloat(price),
    size:  parseFloat(size),
    side:  'bid',
  }));

  // Cumulative totals
  let cumAsk = 0;
  asks.forEach(l => { cumAsk += l.size; l.cumulative = parseFloat(cumAsk.toFixed(6)); });
  let cumBid = 0;
  bids.forEach(l => { cumBid += l.size; l.cumulative = parseFloat(cumBid.toFixed(6)); });

  return { asks, bids };
}

// ─── Recent trades ─────────────────────────────────────────────────────────────

/**
 * Fetch recent public trades.
 * Returns array of { id, price, size, side, ts, fresh }
 */
export async function fetchTrades(appSymbol, limit = 20) {
  const sym  = toOrderlySymbol(appSymbol);
  const data = await get(`/v1/public/market_trades?symbol=${sym}&limit=${limit}`);
  const rows  = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);
  return normaliseTrades(rows, false);
}

let _tradeIdCounter = Date.now();
function normaliseTrades(rows, fresh = true) {
  return rows.map(t => ({
    id:    _tradeIdCounter++,
    price: parseFloat(t.executed_price ?? t.price),
    size:  parseFloat(t.executed_quantity ?? t.quantity ?? t.size),
    side:  (t.side ?? '').toLowerCase() === 'buy' ? 'buy' : 'sell',
    ts:    t.executed_timestamp ?? t.ts ?? Date.now(),
    fresh,
  }));
}

// ─── Klines (candlesticks) ────────────────────────────────────────────────────

/**
 * Fetch OHLCV candles.
 * Returns array of { ts, open, high, low, close, volume }
 */
export async function fetchKlines(appSymbol, timeframe = '1h', limit = 200) {
  const sym  = toOrderlySymbol(appSymbol);
  const tf   = TIMEFRAME_MAP[timeframe] ?? '1h';
  const data = await get(`/v1/public/kline?symbol=${sym}&type=${tf}&limit=${limit}`);
  const rows  = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);
  return rows.map(k => ({
    ts:     k.start_timestamp,
    open:   parseFloat(k.open),
    high:   parseFloat(k.high),
    low:    parseFloat(k.low),
    close:  parseFloat(k.close),
    volume: parseFloat(k.volume),
  }));
}

// ─── WebSocket helpers ────────────────────────────────────────────────────────

/**
 * Create a managed WebSocket connection to Orderly public feed.
 * Handles heartbeat (Orderly requires pong within 10s of ping) and
 * exponential-backoff reconnect.
 *
 * @param {object} opts
 *   topic       — Orderly WS topic string
 *   onMessage   — called with each parsed message payload
 *   onStatus    — called with 'live' | 'reconnecting' | 'offline'
 *   maxRows     — passed to the normaliser
 *   normalise   — function(raw) => transformed payload
 * @returns unsubscribe function
 */
function openPublicWS({ topic, onMessage, onStatus, normalise }) {
  let ws;
  let dead = false;
  let delay = 1000;
  let heartbeat;

  function connect() {
    if (dead) return;
    onStatus('reconnecting');

    ws = new WebSocket(ORDERLY_WS_URL);

    ws.onopen = () => {
      delay = 1000; // reset back-off
      ws.send(JSON.stringify({ id: 'sub', event: 'subscribe', topic }));
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        // Orderly heartbeat
        if (msg.event === 'ping') {
          ws.send(JSON.stringify({ id: 'pong', event: 'pong' }));
          return;
        }

        if (msg.data != null) {
          onStatus('live');
          onMessage(normalise(msg.data));
        }
      } catch { /* ignore malformed frames */ }
    };

    ws.onerror = () => { /* let onclose handle */ };

    ws.onclose = () => {
      clearInterval(heartbeat);
      if (dead) return;
      onStatus('reconnecting');
      delay = Math.min(delay * 2, MAX_RECONNECT_DELAY);
      setTimeout(connect, delay);
    };

    // Client-side heartbeat every 8s (Orderly sends ping ~10s)
    heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ id: 'ping', event: 'ping' }));
      }
    }, 8000);
  }

  connect();

  return function unsubscribe() {
    dead = true;
    clearInterval(heartbeat);
    if (ws) ws.close();
  };
}

// ─── Live order book subscription ─────────────────────────────────────────────

/**
 * Subscribe to live order book updates via WebSocket.
 *
 * @param {string}   appSymbol
 * @param {number}   maxRows
 * @param {function} onBook    — called with { asks, bids }
 * @param {function} onStatus  — called with 'live' | 'reconnecting' | 'offline'
 * @returns unsubscribe()
 */
export function subscribeOrderBook(appSymbol, maxRows, onBook, onStatus) {
  const sym   = toOrderlySymbol(appSymbol);
  const topic = `${sym}@orderbook`;

  return openPublicWS({
    topic,
    onStatus,
    onMessage: onBook,
    normalise: (data) => normaliseBook(data, maxRows),
  });
}

// ─── Live trade stream subscription ───────────────────────────────────────────

/**
 * Subscribe to live trade stream via WebSocket.
 *
 * @param {string}   appSymbol
 * @param {function} onTrades  — called with array of new trade objects (fresh=true)
 * @param {function} onStatus  — called with 'live' | 'reconnecting' | 'offline'
 * @returns unsubscribe()
 */
export function subscribeTrades(appSymbol, onTrades, onStatus) {
  const sym   = toOrderlySymbol(appSymbol);
  const topic = `${sym}@trade`;

  return openPublicWS({
    topic,
    onStatus,
    onMessage: onTrades,
    normalise: (data) => {
      // WS trade payload is a single object, not an array
      const row = Array.isArray(data) ? data : [data];
      return normaliseTrades(row, true);
    },
  });
}