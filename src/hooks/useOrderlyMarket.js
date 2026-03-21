/**
 * useOrderlyMarket — React hook layer over publicMarketService.js
 *
 * Provides clean, component-ready state for:
 *   - ticker (price, markPrice, change24h, volume, OI, funding)
 *   - order book (asks, bids, status)
 *   - recent trades (list, status)
 *   - klines (candles, status)
 *
 * Design:
 *   - One hook per concern so components only subscribe to what they need
 *   - Reconnect/retry is handled inside the service; this hook just exposes status
 *   - Adding user-specific data (positions, order history) later should never
 *     require changing this file — create useOrderlyAccount.js separately
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchTicker,
  fetchOrderBook,
  fetchTrades,
  fetchKlines,
  subscribeOrderBook,
  subscribeTrades,
} from '../services/orderly/publicMarketService';

const TICKER_POLL_MS   = 5000;
const BOOK_ROWS        = 10;
const MAX_TRADES       = 30;

// ─── Ticker ───────────────────────────────────────────────────────────────────

/**
 * useTicker(symbol)
 * Returns { ticker, loading, error }
 * ticker: { price, markPrice, lastPrice, change24h, volume24h, openInterest, fundingRate }
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

// ─── Order Book ───────────────────────────────────────────────────────────────

/**
 * useOrderBook(symbol)
 * Returns { asks, bids, status, loading }
 * status: 'live' | 'reconnecting' | 'offline'
 */
export function useOrderBook(symbol) {
  const [asks,    setAsks]    = useState([]);
  const [bids,    setBids]    = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    // Seed with REST snapshot first for instant paint
    fetchOrderBook(symbol, BOOK_ROWS)
      .then(({ asks, bids }) => {
        setAsks(asks);
        setBids(bids);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Then upgrade to live WebSocket
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

// ─── Recent Trades ────────────────────────────────────────────────────────────

/**
 * useRecentTrades(symbol)
 * Returns { trades, status, loading }
 * Each trade: { id, price, size, side, ts, fresh }
 */
export function useRecentTrades(symbol) {
  const [trades,  setTrades]  = useState([]);
  const [status,  setStatus]  = useState('reconnecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    // REST seed
    fetchTrades(symbol, 20)
      .then(rows => {
        setTrades(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // WS live stream
    const unsub = subscribeTrades(
      symbol,
      (newTrades) => {
        setTrades(prev => {
          const combined = [...newTrades, ...prev];
          return combined.slice(0, MAX_TRADES);
        });
        setLoading(false);
      },
      setStatus,
    );

    return unsub;
  }, [symbol]);

  return { trades, status, loading };
}

// ─── Klines / Candlesticks ────────────────────────────────────────────────────

/**
 * useKlines(symbol, timeframe)
 * Returns { candles, loading, error }
 * Each candle: { ts, open, high, low, close, volume }
 */
export function useKlines(symbol, timeframe) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!symbol || !timeframe) return;
    let dead = false;
    setLoading(true);
    setError(null);

    fetchKlines(symbol, timeframe, 200)
      .then(data => {
        if (!dead) { setCandles(data); setLoading(false); }
      })
      .catch(e => {
        if (!dead) { setError(e.message); setLoading(false); }
      });

    return () => { dead = true; };
  }, [symbol, timeframe]);

  return { candles, loading, error };
}