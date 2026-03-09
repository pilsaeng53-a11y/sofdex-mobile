/**
 * MarketDataProvider — single live data engine for the entire app.
 *
 * • Opens a Binance combined @ticker WebSocket for all crypto symbols.
 * • Buffers incoming ticks and flushes to React state every 500 ms
 *   (prevents re-render storms for high-frequency pairs like BTC/ETH).
 * • Fetches 24-hour kline sparklines via REST once on mount, refreshed every 30 min.
 * • Auto-reconnects with exponential back-off on disconnect.
 * • Non-Binance symbols (RWA / TradFi) are flagged available:false.
 */
import React, {
  createContext, useContext,
  useState, useEffect,
  useRef, useCallback,
} from 'react';
import { getBinanceSymbol } from './symbolMap';
import { ALL_MARKETS } from './MarketData';

// ── Symbol tables (built once at module load) ─────────────────────────────────
const BINANCE_PAIRS = ALL_MARKETS
  .map(a => ({ sof: a.symbol, bn: getBinanceSymbol(a.symbol) }))
  .filter(x => x.bn !== null);

const BN_TO_SOF = {};
BINANCE_PAIRS.forEach(p => { BN_TO_SOF[p.bn] = p.sof; });

// ── Context ───────────────────────────────────────────────────────────────────
const noop = () => ({ available: false, price: null, change: null, sparkline: null });
export const MarketDataContext = createContext({ liveData: {}, sparklines: {}, getLiveAsset: noop });
export const useMarketData = () => useContext(MarketDataContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function MarketDataProvider({ children }) {
  const [liveData,   setLiveData]   = useState({});
  const [sparklines, setSparklines] = useState({});

  const bufferRef    = useRef({});   // accumulates WS ticks between flushes
  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);
  const flushRef     = useRef(null);
  const retryCount   = useRef(0);
  const alive        = useRef(true);

  // ── Sparklines: 24 × 1 h candles from Binance REST ───────────────────────
  async function fetchSparklines() {
    if (!alive.current) return;
    const results = await Promise.all(
      BINANCE_PAIRS.map(({ bn }) =>
        fetch(`https://api.binance.com/api/v3/klines?symbol=${bn}&interval=1h&limit=24`)
          .then(r => r.json()).catch(() => [])
      )
    );
    if (!alive.current) return;
    const map = {};
    BINANCE_PAIRS.forEach(({ sof }, i) => {
      map[sof] = Array.isArray(results[i]) ? results[i].map(k => parseFloat(k[4])) : [];
    });
    setSparklines(map);
  }

  // ── WebSocket: Binance combined @ticker stream ────────────────────────────
  function connectWS() {
    if (!alive.current) return;
    const streams = BINANCE_PAIRS.map(p => `${p.bn.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen = () => { retryCount.current = 0; };

    ws.onmessage = (e) => {
      if (!alive.current) return;
      const msg = JSON.parse(e.data);
      const d = msg?.data;
      if (!d?.s) return;
      const sof = BN_TO_SOF[d.s];
      if (!sof) return;
      // Write into buffer; flushed to state every 500 ms
      bufferRef.current[sof] = {
        price:     parseFloat(d.c),
        change:    parseFloat(d.P),
        available: true,
      };
    };

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      if (!alive.current) return;
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30_000);
      retryCount.current++;
      reconnectRef.current = setTimeout(connectWS, delay);
    };
  }

  // ── Flush buffer → React state every 500 ms ───────────────────────────────
  function startFlush() {
    flushRef.current = setInterval(() => {
      if (!alive.current) return;
      const buf = bufferRef.current;
      if (Object.keys(buf).length === 0) return;
      bufferRef.current = {};
      setLiveData(prev => ({ ...prev, ...buf }));
    }, 500);
  }

  useEffect(() => {
    alive.current = true;
    fetchSparklines();
    connectWS();
    startFlush();
    const spTimer = setInterval(fetchSparklines, 30 * 60 * 1000);
    return () => {
      alive.current = false;
      wsRef.current?.close();
      clearTimeout(reconnectRef.current);
      clearInterval(flushRef.current);
      clearInterval(spTimer);
    };
  }, []);

  const getLiveAsset = useCallback((sofSymbol) => {
    const live = liveData[sofSymbol];
    return {
      available: !!live?.available,
      price:     live?.price  ?? null,
      change:    live?.change ?? null,
      sparkline: sparklines[sofSymbol] ?? null,
    };
  }, [liveData, sparklines]);

  return (
    <MarketDataContext.Provider value={{ liveData, sparklines, getLiveAsset }}>
      {children}
    </MarketDataContext.Provider>
  );
}