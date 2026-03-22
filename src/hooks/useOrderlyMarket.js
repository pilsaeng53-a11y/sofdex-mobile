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

const TICKER_POLL_MS   = 5000;
const BOOK_ROWS        = 10;
const MAX_TRADES       = 30;
const MAX_CANDLES      = 200;
const STALE_TIMEOUT_MS = 15000; // forced reconnect if no data in 15s

/**
 * Watchdog: if no data arrives within STALE_TIMEOUT_MS, force a reconnect.
 * Logs every subscription start, stale detection, and reconnect attempt.
 */
function useStaleWatchdog(symbol, label) {
  const [reconnectKey, setReconnectKey] = useState(0);
  const timerRef      = useRef(null);
  const subCountRef   = useRef(0);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.warn(`[Orderly Watchdog] ⚠ STALE: no ${label} data for ${STALE_TIMEOUT_MS}ms on ${symbol}. Forcing reconnect (attempt #${subCountRef.current + 1})…`);
      subCountRef.current += 1;
      setReconnectKey(k => k + 1);
    }, STALE_TIMEOUT_MS);
  }, [symbol, label]);

  useEffect(() => {
    console.log(`[Orderly WS] ▶ Subscribing to ${label} for symbol=${symbol} (key=${reconnectKey})`);
    resetTimer();
    return () => {
      clearTimeout(timerRef.current);
      console.log(`[Orderly WS] ◀ Unsubscribing from ${label} for symbol=${symbol}`);
    };
  }, [symbol, reconnectKey, resetTimer, label]);

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
  const [asks,      setAsks]      = useState([]);
  const [bids,      setBids]      = useState([]);
  const [status,    setStatus]    = useState('reconnecting');
  const [loading,   setLoading]   = useState(true);
  const [reconnectKey, markReceived] = useStaleWatchdog(symbol, 'orderbook');

  // Reset rows when symbol changes so stale rows are never shown for new symbol
  useEffect(() => {
    setAsks([]);
    setBids([]);
    setLoading(true);
    setStatus('reconnecting');
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;

    const unsub = subscribeOrderBook(
      symbol,
      BOOK_ROWS,
      ({ asks: newAsks, bids: newBids }) => {
        if (newAsks.length > 0 || newBids.length > 0) {
          setAsks(newAsks);
          setBids(newBids);
          setLoading(false);
          markReceived();
        }
      },
      (s) => {
        setStatus(s);
        console.log(`[useOrderBook] status="${s}" symbol="${symbol}" reconnectKey=${reconnectKey}`);
      },
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
  const [reconnectKey, markReceived] = useStaleWatchdog(symbol, 'trades');

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
        markReceived();
      },
      setStatus,
    );

    return () => { dead = true; unsub(); };
  }, [symbol, reconnectKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { trades, status, loading };
}

// ─── useKlines ────────────────────────────────────────────────────────────────
export function useKlines(symbol, timeframe) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState('reconnecting');
  const tsIndexRef = useRef(new Map());
  // Klines can be slow on low-activity symbols — use longer stale window
  const [reconnectKey, markReceived] = useStaleWatchdog(symbol, `klines/${timeframe}`);

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
        markReceived();
      },
      (s) => {
        setStatus(s);
        if (s === 'offline') { setError('Connection offline'); setLoading(false); }
      },
    );

    return () => { tsIndexRef.current = new Map(); unsub(); };
  }, [symbol, timeframe, reconnectKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { candles, loading, error, status };
}