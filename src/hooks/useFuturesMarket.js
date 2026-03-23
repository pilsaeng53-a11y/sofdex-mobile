/**
 * useFuturesMarket — single source of truth for the Futures UI.
 *
 * Provides:
 *  - availableSymbols  (from GET /symbols)
 *  - selectedQuote     (from GET /quotes + WS stream)
 *  - quotesMap         (all live quotes, keyed by normalized base symbol)
 *  - candles           (from GET /candles, refreshed on symbol/interval change)
 *  - loadingQuote / loadingCandles
 *  - wsStatus          (connecting | connected | disconnected)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeSymbol } from '../lib/trading/symbolMapper';
import { TRADING_ASSETS } from '../data/futuresTradingAssets';

const API_BASE = 'https://solfort-api.onrender.com';
const WS_BASE  = 'wss://solfort-api.onrender.com';

const INTERVAL_SECONDS = {
  '1m': 60, '5m': 300, '15m': 900, '30m': 1800,
  '1h': 3600, '4h': 14400, '1d': 86400, '1D': 86400, '1W': 604800,
};

function getBucketTime(intervalKey) {
  const secs = INTERVAL_SECONDS[intervalKey] ?? 3600;
  return Math.floor(Date.now() / 1000 / secs) * secs;
}

// Static fallback symbol list (used before /symbols responds)
const STATIC_SYMBOLS = [...new Set(
  Object.values(TRADING_ASSETS).flat().map(a => normalizeSymbol(a.symbol))
)];

function parseQuote(raw) {
  if (!raw) return null;
  return {
    bid:           raw.bid           ?? null,
    ask:           raw.ask           ?? null,
    last:          raw.last          ?? raw.ask ?? raw.bid ?? null,
    spread:        raw.spread        ?? null,
    changePercent: raw.changePercent ?? raw.change ?? 0,
    high:          raw.high          ?? null,
    low:           raw.low           ?? null,
    volume:        raw.volume        ?? null,
    updatedAt:     raw.updatedAt     ?? null,
  };
}

export default function useFuturesMarket(rawSymbol, interval = '1h') {
  const baseSymbol = normalizeSymbol(rawSymbol);

  const [availableSymbols, setAvailableSymbols] = useState(STATIC_SYMBOLS);
  const [quotesMap,        setQuotesMap]        = useState({});
  const [candles,          setCandles]          = useState([]);
  const [liveCandle,       setLiveCandle]       = useState(null);
  const [loadingQuote,     setLoadingQuote]     = useState(true);
  const [loadingCandles,   setLoadingCandles]   = useState(true);
  const [wsStatus,         setWsStatus]         = useState('connecting');

  // Stable refs so callbacks don't cause re-mounts
  const wsRef           = useRef(null);
  const reconnectRef    = useRef(null);
  const mountedRef      = useRef(true);
  const baseSymbolRef   = useRef(baseSymbol);
  baseSymbolRef.current = baseSymbol;
  const intervalRef     = useRef(interval);
  intervalRef.current   = interval;
  const liveCandleRef   = useRef(null);
  // Track quotes in a ref so the WS handler always sees current data
  const quotesMapRef    = useRef({});

  // Keep quotesMapRef in sync
  useEffect(() => { quotesMapRef.current = quotesMap; }, [quotesMap]);

  // 1. Fetch available symbols once
  useEffect(() => {
    fetch(`${API_BASE}/symbols`)
      .then(r => r.json())
      .then(data => {
        if (!mountedRef.current) return;
        const list = Array.isArray(data)
          ? data.map(s => (typeof s === 'string' ? s : s.symbol || s.name || '')).filter(Boolean)
          : STATIC_SYMBOLS;
        if (list.length) setAvailableSymbols(list);
      })
      .catch(() => {});
  }, []);

  // 2. Fetch REST quote for selected symbol on symbol change
  useEffect(() => {
    if (!baseSymbol) return;
    let cancelled = false;

    // Only show loading spinner if we have no cached quote yet
    if (!quotesMapRef.current[baseSymbol]) {
      setLoadingQuote(true);
    } else {
      setLoadingQuote(false);
    }

    fetch(`${API_BASE}/quotes?symbol=${baseSymbol}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !mountedRef.current) return;
        const q = parseQuote(data);
        if (q) setQuotesMap(prev => ({ ...prev, [baseSymbol]: q }));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled && mountedRef.current) setLoadingQuote(false); });

    return () => { cancelled = true; };
  }, [baseSymbol]);

  // 3. Fetch candles — clear stale data immediately on symbol/interval change
  useEffect(() => {
    if (!baseSymbol) return;
    let cancelled = false;

    // Clear stale candles immediately so chart doesn't show wrong symbol data
    setCandles([]);
    setLiveCandle(null);
    liveCandleRef.current = null;
    setLoadingCandles(true);

    const url = `${API_BASE}/candles?symbol=${baseSymbol}&interval=${interval}&limit=300`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !mountedRef.current) return;

        const raw = Array.isArray(data)
          ? data
          : (data?.data ?? data?.candles ?? data?.result ?? data?.bars ?? []);

        const mapped = raw.map(c => ({
          time:      c.time      ?? c.timestamp ?? c.t ?? null,
          timestamp: c.timestamp ?? c.time      ?? c.t ?? null,
          open:      c.open      ?? c.o,
          high:      c.high      ?? c.h,
          low:       c.low       ?? c.l,
          close:     c.close     ?? c.c,
          volume:    c.volume    ?? c.v ?? 0,
        }));

        setCandles(mapped);
      })
      .catch(() => { if (!cancelled && mountedRef.current) setCandles([]); })
      .finally(() => { if (!cancelled && mountedRef.current) setLoadingCandles(false); });

    return () => { cancelled = true; };
  }, [baseSymbol, interval]);

  // 4. Stable WebSocket — subscribes to all symbols, updates quotesMap for all
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const syms = availableSymbols.join(',') || STATIC_SYMBOLS.join(',');
    const ws   = new WebSocket(`${WS_BASE}?symbols=${syms}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setWsStatus('connected');
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'quote' && msg.symbol) {
          const sym = normalizeSymbol(msg.symbol);
          const q   = parseQuote(msg);
          if (!q) return;

          // Update quotes map for ALL symbols (simulator needs all of them)
          setQuotesMap(prev => ({ ...prev, [sym]: q }));

          // Live candle only for currently selected symbol
          if (sym === baseSymbolRef.current) {
            setLoadingQuote(false);
            const price = q.last ?? q.ask ?? q.bid;
            if (price != null) {
              const bucketTime = getBucketTime(intervalRef.current);
              const prev = liveCandleRef.current;
              if (prev && prev.time === bucketTime) {
                const updated = {
                  ...prev,
                  high:  Math.max(prev.high, price),
                  low:   Math.min(prev.low,  price),
                  close: price,
                };
                liveCandleRef.current = updated;
                setLiveCandle({ ...updated });
              } else {
                const candle = { time: bucketTime, open: price, high: price, low: price, close: price };
                liveCandleRef.current = candle;
                setLiveCandle({ ...candle });
              }
            }
          }
        }
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setWsStatus('disconnected');
      reconnectRef.current = setTimeout(connectWS, 4000);
    };

    ws.onerror = () => ws.close();
  }, [availableSymbols]);

  useEffect(() => {
    mountedRef.current = true;
    connectWS();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connectWS]);

  const selectedQuote = quotesMap[baseSymbol] ?? null;

  return {
    availableSymbols,
    selectedQuote,
    quotesMap,
    candles,
    liveCandle,
    loadingQuote,
    loadingCandles,
    wsStatus,
  };
}