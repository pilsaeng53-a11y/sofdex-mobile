/**
 * useOrderlyMarket — React hook layer over publicMarketService.js
 *
 * Hooks:
 *   useTicker(symbol)       → { ticker, loading, error }
 *   useOrderBook(symbol)    → { asks, bids, status, loading }
 *   useRecentTrades(symbol) → { trades, status, loading }
 *   useKlines(symbol, tf)   → { candles, loading, error, status }
 *
 * Design:
 *   - One hook per concern — components only subscribe to what they need
 *   - Reconnect/retry handled inside the service; hooks just expose state
 *   - Private account features → create useOrderlyAccount.js separately
 */

import { useState, useEffect, useRef } from 'react';
import {
  fetchTicker,
  fetchTrades,
  subscribeOrderBook,
  subscribeTrades,
  subscribeKlines,
} from '../services/orderly/publicMarketService';

const TICKER_POLL_MS = 5000;
const BOOK_ROWS      = 10;
const MAX_TRADES     = 30;
const MAX_CANDLES    = 200;

// ─── useTicker ────────────────────────────────────────────────────────────────
/**
 * Polls the Orderly REST ticker every 5s.
 * Returns { ticker, loading, error }
 * ticker: { price, markPrice, lastPrice, change24h, volume24h, amount24h,
 *           high24h, low24h, openInterest, fundingRate, nextFundingTime }
 */
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
/**
 * Real-time order book via Orderly WebSocket.
 * Returns { asks, bids, status, loading }
 */
export function useOrderBook(symbol) {
  const [asks,    setAsks]    = useState([]);
  const [bids,    setBids]    = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const unsub = subscribeOrderBook(
      symbol,
      BOOK_ROWS,
      ({ asks, bids }) => {
        setAsks(asks);
        setBids(bids);
        setLoading(false);
      },
      setStatus,
    );

    return unsub;
  }, [symbol]);

  return { asks, bids, status, loading };
}

// ─── useRecentTrades ──────────────────────────────────────────────────────────
/**
 * Seeded with REST snapshot, then updated via WebSocket stream.
 * Returns { trades, status, loading }
 */
export function useRecentTrades(symbol) {
  const [trades,  setTrades]  = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    let dead = false;

    // Seed with REST snapshot
    fetchTrades(symbol, 20)
      .then(rows => { if (!dead) { setTrades(rows); setLoading(false); } })
      .catch(() => { if (!dead) setLoading(false); });

    // Then upgrade to live WS
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
/**
 * Live OHLCV candles via Orderly WebSocket kline feed.
 *
 * Orderly has no public REST kline endpoint — data comes only from WS.
 * We accumulate incoming candles as a sliding window of MAX_CANDLES.
 * When a candle with the same timestamp arrives, it replaces the existing
 * one (in-progress candle update), otherwise it is prepended.
 *
 * Returns { candles, loading, error, status }
 * Each candle: { ts, open, high, low, close, volume }
 */
export function useKlines(symbol, timeframe) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState('reconnecting');

  // Keep a ref map ts→index for O(1) upsert
  const tsIndexRef = useRef(new Map());

  useEffect(() => {
    if (!symbol || !timeframe) return;

    // Reset on symbol/timeframe change
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
            // Update in-progress candle
            const next = [...prev];
            next[existing] = candle;
            return next;
          } else {
            // New candle — append
            const next = [...prev, candle].slice(-MAX_CANDLES);
            // Rebuild index
            const newMap = new Map();
            next.forEach((c, i) => newMap.set(c.ts, i));
            tsIndexRef.current = newMap;
            return next;
          }
        });
        setLoading(false);
        setError(null);
      },
      (s) => {
        setStatus(s);
        if (s === 'offline') {
          setError('Connection offline');
          setLoading(false);
        }
      },
    );

    return () => {
      tsIndexRef.current = new Map();
      unsub();
    };
  }, [symbol, timeframe]);

  return { candles, loading, error, status };
}