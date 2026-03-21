/**
 * useOrderlyMarket — React hook layer over publicMarketService.js
 *
 * Hooks:
 *   useTicker(symbol)       → { ticker, loading, error }
 *   useOrderBook(symbol)    → { asks, bids, status, loading }
 *   useRecentTrades(symbol) → { trades, status, loading }
 *   useKlines(symbol, tf)   → { candles, loading, error, status }
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchTicker,
  fetchTrades,
  subscribeOrderBook,
  subscribeTrades,
  subscribeKlines,
} from '../services/orderly/publicMarketService';

const TICKER_POLL_MS  = 5000;
const BOOK_ROWS       = 10;
const MAX_TRADES      = 30;
const MAX_CANDLES     = 200;
const STALE_TIMEOUT_MS = 15000; // reconnect if no data in 15s

/**
 * Watchdog: if no data arrives within STALE_TIMEOUT_MS, bump a reconnect key.
 * Returns [reconnectKey, markReceived] — call markReceived() on each data event.
 */
function useStaleWatchdog(symbol, label) {
  const [reconnectKey, setReconnectKey] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.warn(`[Orderly Watchdog] No ${label} data for ${STALE_TIMEOUT_MS}ms (${symbol}). Forcing reconnect…`);
      setReconnectKey(k => k + 1);
    }, STALE_TIMEOUT_MS);
  }, [symbol, label]);

  // Start watchdog when symbol changes, clear on unmount
  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timerRef.current);
  }, [symbol, resetTimer]);

  return [reconnectKey, resetTimer];
}

// ─── useTicker ────────────────────────────────────────────────────────────────
export function useTicker(symbol) {
  const [ticker,  setTicker]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let dead = false;

    async function poll() {
      try {
        const t = await fetchTicker(symbol);
        if (!dead) { setTicker(t); setLoading(false); setError(null); }
      } catch (e) {
        if (!dead) { setError(e.message); setLoading(false); }
      }
    }

    poll();
    const id = setInterval(poll, TICKER_POLL_MS);
    return () => { dead = true; clearInterval(id); };
  }, [symbol]);

  return { ticker, loading, error };
}

// ─── useOrderBook ─────────────────────────────────────────────────────────────
export function useOrderBook(symbol) {
  const [asks,    setAsks]    = useState([]);
  const [bids,    setBids]    = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);
  const [reconnectKey, markReceived] = useStaleWatchdog(symbol, 'orderbook');

  useEffect(() => {
    if (!symbol) return;

    const unsub = subscribeOrderBook(
      symbol,
      BOOK_ROWS,
      ({ asks, bids }) => {
        setAsks(asks);
        setBids(bids);
        setLoading(false);
        markReceived();
      },
      setStatus,
    );

    return unsub;
  }, [symbol, reconnectKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { asks, bids, status, loading };
}

// ─── useRecentTrades ──────────────────────────────────────────────────────────
export function useRecentTrades(symbol) {
  const [trades,  setTrades]  = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    let dead = false;

    fetchTrades(symbol, 20)
      .then(rows => { if (!dead) { setTrades(rows); setLoading(false); } })
      .catch(() => { if (!dead) setLoading(false); });

    const unsub = subscribeTrades(
      symbol,
      (newTrades) => {
        setTrades(prev => [...newTrades, ...prev].slice(0, MAX_TRADES));
        setLoading(false);
      },
      setStatus,
    );

    return () => { dead = true; unsub(); };
  }, [symbol]);

  return { trades, status, loading };
}

// ─── useKlines ────────────────────────────────────────────────────────────────
export function useKlines(symbol, timeframe) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState('reconnecting');
  const tsIndexRef = useRef(new Map());

  useEffect(() => {
    if (!symbol || !timeframe) return;

    setCandles([]);
    setLoading(true);
    setError(null);
    setStatus('reconnecting');
    tsIndexRef.current = new Map();

    const unsub = subscribeKlines(
      symbol,
      timeframe,
      (candle) => {
        setCandles(prev => {
          const map = tsIndexRef.current;
          const existing = map.get(candle.ts);
          if (existing !== undefined) {
            const next = [...prev];
            next[existing] = candle;
            return next;
          }
          const next = [...prev, candle].slice(-MAX_CANDLES);
          const newMap = new Map();
          next.forEach((c, i) => newMap.set(c.ts, i));
          tsIndexRef.current = newMap;
          return next;
        });
        setLoading(false);
        setError(null);
      },
      (s) => {
        setStatus(s);
        if (s === 'offline') { setError('Connection offline'); setLoading(false); }
      },
    );

    return () => { tsIndexRef.current = new Map(); unsub(); };
  }, [symbol, timeframe]);

  return { candles, loading, error, status };
}