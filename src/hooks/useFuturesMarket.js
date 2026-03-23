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
  const [loadingQuote,     setLoadingQuote]     = useState(true);
  const [loadingCandles,   setLoadingCandles]   = useState(true);
  const [wsStatus,         setWsStatus]         = useState('connecting');

  // Stable refs so callbacks don't cause re-mounts
  const wsRef           = useRef(null);
  const reconnectRef    = useRef(null);
  const mountedRef      = useRef(true);
  const baseSymbolRef   = useRef(baseSymbol);
  baseSymbolRef.current = baseSymbol;

  // ── 1. Fetch available symbols once ───────────────────────────────
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
      .catch(() => {/* keep static fallback */});
  }, []);

  // ── 2. Fetch REST quote for selected symbol ────────────────────────
  useEffect(() => {
    if (!baseSymbol) return;
    let cancelled = false;
    setLoadingQuote(true);
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

  // ── 3. Fetch candles on symbol + interval change ───────────────────
  useEffect(() => {
    if (!baseSymbol) return;
    let cancelled = false;
    setLoadingCandles(true);
    fetch(`${API_BASE}/candles?symbol=${baseSymbol}&interval=${interval}&limit=200`)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !mountedRef.current) return;
        const raw = Array.isArray(data) ? data : data?.candles ?? [];
        setCandles(raw.map(c => ({
          time:      c.time      ?? c.timestamp ?? null,
          timestamp: c.timestamp ?? c.time      ?? null,
          open:      c.open,
          high:      c.high,
          low:       c.low,
          close:     c.close,
          volume:    c.volume ?? 0,
        })));
      })
      .catch(() => { if (!cancelled && mountedRef.current) setCandles([]); })
      .finally(() => { if (!cancelled && mountedRef.current) setLoadingCandles(false); });
    return () => { cancelled = true; };
  }, [baseSymbol, interval]);

  // ── 4. Stable WebSocket (never reconnects on symbol change) ────────
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
          if (q) {
            setQuotesMap(prev => ({ ...prev, [sym]: q }));
            if (sym === baseSymbolRef.current) setLoadingQuote(false);
          }
        }
        // 'connected' / 'subscribed' messages — no action needed
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setWsStatus('disconnected');
      reconnectRef.current = setTimeout(connectWS, 4000);
    };

    ws.onerror = () => ws.close();
  }, [availableSymbols]); // re-create only when symbol list changes

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
    loadingQuote,
    loadingCandles,
    wsStatus,
  };
}