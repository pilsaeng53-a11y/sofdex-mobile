/**
 * MarketDataProvider — unified live data engine for SOFDex.
 *
 * Strategy (layered, fastest first):
 * 1. CoinGecko REST — fires immediately on mount to populate data fast.
 * 2. Binance WebSocket @ticker stream — overlays real-time ticks as they arrive.
 *    Ticks are buffered and flushed to state every 500 ms to avoid render storms.
 * 3. Binance REST klines — sparkline data (1h candles, refreshed every 30 min).
 * 4. Auto-reconnect with exponential back-off on WS disconnect.
 * 5. CoinGecko polling fallback every 30 s if WS is not delivering data.
 */
import React, {
  createContext, useContext,
  useState, useEffect, useRef, useCallback,
} from 'react';
import { getBinanceSymbol, getCoinGeckoId, BINANCE_TICKER, COINGECKO_ID } from './symbolMap';
import { ALL_MARKETS } from './MarketData';

// ── Static symbol tables built once ──────────────────────────────────────────
const BINANCE_PAIRS = ALL_MARKETS
  .map(a => ({ sof: a.symbol, bn: getBinanceSymbol(a.symbol) }))
  .filter(x => x.bn !== null);

const BN_TO_SOF = {};
BINANCE_PAIRS.forEach(p => { BN_TO_SOF[p.bn] = p.sof; });

const CG_PAIRS = ALL_MARKETS
  .map(a => ({ sof: a.symbol, cg: getCoinGeckoId(a.symbol) }))
  .filter(x => x.cg !== null);

const CG_IDS = CG_PAIRS.map(p => p.cg);
const CG_TO_SOF = {};
CG_PAIRS.forEach(p => { CG_TO_SOF[p.cg] = p.sof; });

// ── Context ───────────────────────────────────────────────────────────────────
const defaultCtx = { liveData: {}, sparklines: {}, getLiveAsset: () => ({ available: false, price: null, change: null, sparkline: null }) };
export const MarketDataContext = createContext(defaultCtx);
export const useMarketData = () => useContext(MarketDataContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function MarketDataProvider({ children }) {
  const [liveData,   setLiveData]   = useState({});
  const [sparklines, setSparklines] = useState({});

  const bufferRef    = useRef({});
  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);
  const flushRef     = useRef(null);
  const cgPollRef    = useRef(null);
  const wsAliveRef   = useRef(false);   // tracks if WS is delivering data
  const retryCount   = useRef(0);
  const alive        = useRef(true);

  // ── CoinGecko REST (initial fast load + fallback polling) ─────────────────
  async function fetchCoinGecko() {
    if (!alive.current || CG_IDS.length === 0) return;
    const ids = CG_IDS.join(',');
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    ).catch(() => null);
    if (!res || !res.ok || !alive.current) return;
    const data = await res.json().catch(() => null);
    if (!data || !alive.current) return;

    const patch = {};
    CG_PAIRS.forEach(({ sof, cg }) => {
      const d = data[cg];
      if (!d) return;
      // Only write CoinGecko data if WS hasn't given us fresher data for this symbol
      if (!bufferRef.current[sof] && !wsAliveRef.current) {
        patch[sof] = {
          available: true,
          price:     d.usd,
          change:    d.usd_24h_change ?? 0,
        };
      }
    });
    if (Object.keys(patch).length > 0) {
      setLiveData(prev => ({ ...prev, ...patch }));
    }
  }

  // ── Binance REST klines for sparklines ────────────────────────────────────
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

  // ── Binance WebSocket combined @ticker stream ─────────────────────────────
  function connectWS() {
    if (!alive.current || BINANCE_PAIRS.length === 0) return;
    const streams = BINANCE_PAIRS.map(p => `${p.bn.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen = () => { retryCount.current = 0; };

    ws.onmessage = (e) => {
      if (!alive.current) return;
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      const d = msg?.data;
      if (!d?.s) return;
      const sof = BN_TO_SOF[d.s];
      if (!sof) return;
      wsAliveRef.current = true;
      bufferRef.current[sof] = {
        price:     parseFloat(d.c),
        change:    parseFloat(d.P),
        available: true,
      };
    };

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      wsAliveRef.current = false;
      if (!alive.current) return;
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30_000);
      retryCount.current++;
      reconnectRef.current = setTimeout(connectWS, delay);
    };
  }

  // ── Flush WS buffer → state every 500 ms ─────────────────────────────────
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

    // Layer 1: immediate CoinGecko fetch so UI shows data right away
    fetchCoinGecko();
    // Layer 2: sparklines
    fetchSparklines();
    // Layer 3: WebSocket for real-time ticks
    connectWS();
    startFlush();

    // CoinGecko polling every 30 s — acts as WS fallback
    cgPollRef.current = setInterval(fetchCoinGecko, 30_000);
    // Sparkline refresh every 30 min
    const spTimer = setInterval(fetchSparklines, 30 * 60 * 1000);

    return () => {
      alive.current = false;
      wsRef.current?.close();
      clearTimeout(reconnectRef.current);
      clearInterval(flushRef.current);
      clearInterval(cgPollRef.current);
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