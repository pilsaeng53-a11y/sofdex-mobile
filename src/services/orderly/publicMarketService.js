/**
 * Orderly Network — Public Market Data Service
 *
 * Verified endpoints (live tested 2024):
 *  - GET  /v1/public/futures/{symbol}     → ticker/stats for one symbol
 *  - GET  /v1/public/market_trades        → recent trades (REST snapshot)
 *  - WS   {symbol}@orderbook             → live order book (depth 100, 1s push)
 *  - WS   {symbol}@trade                 → live trade stream
 *  - WS   {symbol}@kline_{type}          → live kline/OHLCV updates
 *
 * NOTE: There is no public REST orderbook or kline endpoint — these are
 * WebSocket-only on Orderly's public API.
 *
 * Design:
 *  - NO React, NO UI imports
 *  - All errors thrown so hooks can surface loading/error state
 *  - WS subscriptions return unsubscribe() for cleanup
 *  - Private endpoints → separate privateAccountService.js (never here)
 */

import { ORDERLY_BASE_URL, ORDERLY_WS_URL, toOrderlySymbol, TIMEFRAME_MAP } from './orderlySymbolMap';

const MAX_RECONNECT_DELAY = 16000;

// ─── REST helpers ─────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${ORDERLY_BASE_URL}${path}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Orderly ${res.status}: ${path}`);
  const json = await res.json();
  if (json.success === false) throw new Error(json.message ?? 'Orderly API error');
  return json.data;
}

// ─── Ticker / market stats ─────────────────────────────────────────────────────

/**
 * Fetch 24h ticker for one symbol.
 *
 * Live response fields (verified):
 *   mark_price, index_price, last_price (= 24h_close), est_funding_rate,
 *   open_interest, 24h_open, 24h_close, 24h_high, 24h_low,
 *   24h_volume, 24h_amount
 *
 * NOTE: There is no "24h_change" percentage field — we calculate it.
 */
export async function fetchTicker(appSymbol) {
  const sym  = toOrderlySymbol(appSymbol);
  const data = await get(`/v1/public/futures/${sym}`);

  const open24  = data['24h_open']  ?? null;
  const close24 = data['24h_close'] ?? null;
  const change24h = (open24 != null && close24 != null && open24 !== 0)
    ? ((close24 - open24) / open24) * 100
    : null;

  return {
    symbol:       appSymbol,
    price:        data.mark_price  ?? data['24h_close'] ?? null,
    markPrice:    data.mark_price  ?? null,
    indexPrice:   data.index_price ?? null,
    lastPrice:    data['24h_close'] ?? null,
    high24h:      data['24h_high'] ?? null,
    low24h:       data['24h_low']  ?? null,
    open24h:      open24,
    change24h,                                    // calculated %
    volume24h:    data['24h_volume'] ?? null,      // base asset qty
    amount24h:    data['24h_amount'] ?? null,      // quote (USDC)
    openInterest: data.open_interest ?? null,      // base asset
    fundingRate:  data.est_funding_rate ?? null,   // decimal fraction
    nextFundingTime: data.next_funding_time ?? null,
  };
}

// ─── Recent trades (REST snapshot) ────────────────────────────────────────────

/**
 * Fetch recent public trades snapshot.
 * Returns array of { id, price, size, side, ts, fresh }
 */
export async function fetchTrades(appSymbol, limit = 20) {
  const sym  = toOrderlySymbol(appSymbol);
  const data = await get(`/v1/public/market_trades?symbol=${sym}&limit=${limit}`);
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  return normaliseTrades(rows, false);
}

let _tradeIdCounter = Date.now();
function normaliseTrades(rows, fresh = true) {
  return rows.map(t => ({
    id:    _tradeIdCounter++,
    price: parseFloat(t.executed_price ?? t.price ?? 0),
    size:  parseFloat(t.executed_quantity ?? t.quantity ?? t.size ?? 0),
    side:  (t.side ?? '').toUpperCase() === 'BUY' ? 'buy' : 'sell',
    ts:    t.executed_timestamp ?? t.ts ?? Date.now(),
    fresh,
  }));
}

// ─── WebSocket core ───────────────────────────────────────────────────────────

/**
 * Open a managed public WebSocket to Orderly.
 * Handles Orderly's ping/pong heartbeat and exponential-backoff reconnect.
 *
 * @returns unsubscribe()
 */
function openPublicWS({ topic, onMessage, onStatus, normalise }) {
  let ws;
  let dead  = false;
  let delay = 1500;
  let hbTimer;
  let firstMessageReceived = false;
  let reconnectCount = 0;
  let hbCount = 0;

  function connect() {
    if (dead) return;
    firstMessageReceived = false;
    onStatus('reconnecting');
    console.log(`[Orderly WS] ▶ Connecting to ${ORDERLY_WS_URL}`);
    console.log(`[Orderly WS]   topic="${topic}" attempt=${reconnectCount + 1}`);

    try {
      ws = new WebSocket(ORDERLY_WS_URL);
    } catch (err) {
      console.error(`[Orderly WS] ❌ Failed to open WebSocket for topic="${topic}":`, err);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      delay = 1500;
      reconnectCount++;
      console.log(`[Orderly WS] ✅ WS open (topic="${topic}", attempt=${reconnectCount})`);
      // Orderly public WS subscription format:
      // { event: "subscribe", topic: "<SYMBOL>@<stream>" }
      // The topic itself includes the symbol, no extra params needed
      const subPayload = { event: 'subscribe', topic };
      console.log(`[Orderly WS]   ▶ Subscribe sent:`, JSON.stringify(subPayload));
      ws.send(JSON.stringify(subPayload));
      // Orderly requires client ping every 10s to keep connection alive
      hbTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          hbCount++;
          ws.send(JSON.stringify({ event: 'ping' }));
        }
      }, 10000);
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        // Server heartbeat ping → reply pong
        if (msg.event === 'ping') {
          ws.send(JSON.stringify({ event: 'pong' }));
          return;
        }

        // Subscription acknowledgement or info frames
        if (msg.event) {
          console.log(`[Orderly WS] ℹ event="${msg.event}" topic="${topic}"`, msg);
          return;
        }

        // Orderly market data frames: { topic, ts, data: {...} }
        // The payload data lives under msg.data
        const payload = msg.data ?? msg;

        if (payload != null && (msg.topic || msg.data != null)) {
          if (!firstMessageReceived) {
            firstMessageReceived = true;
            console.log(`[Orderly WS] 🟢 First data for topic="${topic}"`, msg);
          }
          onStatus('live');
          onMessage(normalise(payload));
        }
      } catch (e) {
        console.error(`[Orderly WS] ❌ Parse error topic="${topic}":`, e, ev.data?.slice?.(0, 200));
      }
    };

    ws.onerror = (err) => {
      console.error(`[Orderly WS] ❌ Error on topic="${topic}":`, err?.type ?? err);
      // If we've already tried multiple times and still failing, report error state
      if (reconnectCount > 3) {
        onStatus('error');
      }
    };

    ws.onclose = (ev) => {
      clearInterval(hbTimer);
      if (!dead) {
        console.warn(`[Orderly WS] ⚡ Disconnected topic="${topic}" code=${ev.code} reason="${ev.reason}". Reconnecting in ${delay}ms…`);
        scheduleReconnect();
      } else {
        console.log(`[Orderly WS] ◀ Cleanly closed topic="${topic}"`);
      }
    };
  }

  function scheduleReconnect() {
    onStatus('reconnecting');
    delay = Math.min(delay * 2, MAX_RECONNECT_DELAY);
    console.log(`[Orderly WS] ⏳ Scheduled reconnect for topic="${topic}" in ${delay}ms`);
    setTimeout(connect, delay);
  }

  connect();

  return function unsubscribe() {
    dead = true;
    clearInterval(hbTimer);
    console.log(`[Orderly WS] ◀ Unsubscribed topic="${topic}" (reconnects=${reconnectCount}, hbSent=${hbCount})`);
    try { ws?.close(); } catch { /* ignore */ }
  };
}

// ─── Live order book ───────────────────────────────────────────────────────────

function parseLevel(level) {
  // Orderly sends [price, size] arrays
  if (Array.isArray(level)) {
    return { price: parseFloat(level[0]), size: parseFloat(level[1]) };
  }
  // Fallback: object with price/quantity fields
  return {
    price: parseFloat(level.price ?? level.p ?? 0),
    size:  parseFloat(level.quantity ?? level.size ?? level.q ?? 0),
  };
}

function normaliseBook(data, maxRows) {
  // Orderly book WS payload: { asks: [[price,size],...], bids: [[price,size],...] }
  const rawAsks = data.asks ?? data.sell ?? [];
  const rawBids = data.bids ?? data.buy  ?? [];

  const asks = rawAsks.slice(0, maxRows).map(l => ({ ...parseLevel(l), side: 'ask' }));
  const bids = rawBids.slice(0, maxRows).map(l => ({ ...parseLevel(l), side: 'bid' }));

  // Sort correctly
  asks.sort((a, b) => a.price - b.price);
  bids.sort((a, b) => b.price - a.price);

  // Cumulative depth
  let cum = 0;
  asks.forEach(l => { cum += l.size; l.cumulative = parseFloat(cum.toFixed(6)); });
  cum = 0;
  bids.forEach(l => { cum += l.size; l.cumulative = parseFloat(cum.toFixed(6)); });

  return { asks, bids };
}

/**
 * Subscribe to live order book via WebSocket.
 * Topic: {symbol}@orderbook (depth 100, pushed every 1s)
 */
export function subscribeOrderBook(appSymbol, maxRows, onBook, onStatus) {
  const sym = toOrderlySymbol(appSymbol);
  return openPublicWS({
    topic:     `${sym}@orderbook`,
    onStatus,
    onMessage: onBook,
    normalise: (data) => normaliseBook(data, maxRows),
  });
}

// ─── Live trade stream ─────────────────────────────────────────────────────────

/**
 * Subscribe to live trade stream via WebSocket.
 * Topic: {symbol}@trade
 */
export function subscribeTrades(appSymbol, onTrades, onStatus) {
  const sym = toOrderlySymbol(appSymbol);
  return openPublicWS({
    topic:     `${sym}@trade`,
    onStatus,
    onMessage: onTrades,
    normalise: (data) => {
      const rows = Array.isArray(data) ? data : [data];
      return normaliseTrades(rows, true);
    },
  });
}

// ─── Live klines (OHLCV) ──────────────────────────────────────────────────────

/**
 * Subscribe to live kline/OHLCV updates via WebSocket.
 * Topic: {symbol}@kline_{type}  (e.g. PERP_BTC_USDC@kline_1h)
 *
 * WS payload fields (verified from docs):
 *   open, close, high, low, volume, amount, startTime, endTime, type, symbol
 *
 * onCandle is called with { ts, open, high, low, close, volume }
 */
export function subscribeKlines(appSymbol, timeframe, onCandle, onStatus) {
  const sym  = toOrderlySymbol(appSymbol);
  const type = TIMEFRAME_MAP[timeframe] ?? '1h';
  return openPublicWS({
    topic:     `${sym}@kline_${type}`,
    onStatus,
    onMessage: onCandle,
    normalise: (data) => ({
      ts:     data.startTime ?? Date.now(),
      open:   parseFloat(data.open),
      high:   parseFloat(data.high),
      low:    parseFloat(data.low),
      close:  parseFloat(data.close),
      volume: parseFloat(data.volume ?? 0),
    }),
  });
}