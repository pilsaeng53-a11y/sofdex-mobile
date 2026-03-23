/**
 * useFuturesMarket
 * Single source of truth for all live quote data in the Futures UI.
 *
 * - Fetches REST quote for the selected symbol on symbol change
 * - Maintains a WebSocket connection for all subscribed symbols
 * - Exposes quotesMap (all symbols) + selectedQuote + wsStatus
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeSymbol } from '../lib/trading/symbolMapper';
import { TRADING_ASSETS } from '../data/futuresTradingAssets';

const API_BASE = 'https://solfort-api.onrender.com';
const WS_BASE  = 'wss://solfort-api.onrender.com';

// All raw symbols → normalized base list for WS subscription
const ALL_SYMBOLS = Object.values(TRADING_ASSETS)
  .flat()
  .map(a => normalizeSymbol(a.symbol));
const UNIQUE_SYMBOLS = [...new Set(ALL_SYMBOLS)];

function formatQuote(raw) {
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

export default function useFuturesMarket(rawSymbol) {
  const baseSymbol = normalizeSymbol(rawSymbol);

  const [quotesMap, setQuotesMap]       = useState({}); // { BASE: QuoteObject }
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [wsStatus, setWsStatus]         = useState('connecting'); // connecting | connected | disconnected

  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);
  const mountedRef   = useRef(true);

  // ── REST: fetch quote for selected symbol ──────────────────────────
  useEffect(() => {
    if (!baseSymbol) return;
    setLoadingQuote(true);
    fetch(`${API_BASE}/quotes?symbol=${baseSymbol}`)
      .then(r => r.json())
      .then(data => {
        if (!mountedRef.current) return;
        const q = formatQuote(data);
        if (q) setQuotesMap(prev => ({ ...prev, [baseSymbol]: q }));
      })
      .catch(() => {/* keep stale data on error */})
      .finally(() => { if (mountedRef.current) setLoadingQuote(false); });
  }, [baseSymbol]);

  // ── WebSocket: live stream for all symbols ─────────────────────────
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const symbolsParam = UNIQUE_SYMBOLS.join(',');
    const ws = new WebSocket(`${WS_BASE}?symbols=${symbolsParam}`);
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
          const q   = formatQuote(msg);
          if (q) {
            setQuotesMap(prev => ({ ...prev, [sym]: q }));
            // clear loading once first live quote arrives for selected symbol
            if (sym === baseSymbol) setLoadingQuote(false);
          }
        }
      } catch {/* malformed message */}
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setWsStatus('disconnected');
      // auto-reconnect after 4s
      reconnectRef.current = setTimeout(connect, 4000);
    };

    ws.onerror = () => ws.close();
  }, [baseSymbol]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const selectedQuote = quotesMap[baseSymbol] ?? null;

  return { selectedQuote, quotesMap, loadingQuote, wsStatus };
}