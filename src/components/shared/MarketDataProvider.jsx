/**
 * MarketDataProvider — unified live data engine for SOFDex.
 *
 * LIVE PRICE SOURCES:
 * 1. Binance WebSocket @ticker — real-time crypto prices
 * 2. CoinGecko REST — initial crypto load + 30s polling fallback
 * 3. Yahoo Finance (via allorigins proxy) + Stooq CSV fallback
 *    — covers ALL non-crypto assets: commodities, xStocks, xETFs, RWA
 * 4. Metals.live — gold/silver spot (no-auth, CORS-allowed)
 * 5. Frankfurter.app — EUR/USD FX rate (CORS-allowed)
 *
 * ARCHITECTURE RULE:
 * Every non-crypto asset symbol is in NON_CRYPTO_SYMBOLS.
 * Every component that calls getLiveAsset() for a non-crypto symbol
 * must NOT fall back to the static seed in MarketData — it must wait
 * for the live price from this provider.
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
const defaultCtx = {
  liveData: {},
  sparklines: {},
  getLiveAsset: () => ({ available: false, price: null, change: null, sparkline: null }),
};
export const MarketDataContext = createContext(defaultCtx);
export const useMarketData = () => useContext(MarketDataContext);

// ── ALL non-crypto asset config — Yahoo Finance symbol, Stooq fallback ────────
// Every asset here gets live price polling. Static seeds in MarketData are
// only used for layout/metadata, NEVER for displayed prices.
const NON_CRYPTO_CONFIG = {
  // Liquid commodity-style RWA
  'GOLD-T':   { yahoo: 'GC=F',       stooq: 'xauusd'  },
  'SILVER-T': { yahoo: 'SI=F',       stooq: 'xagusd'  },
  'CRUDE-T':  { yahoo: 'CL=F',       stooq: 'clusd'   },
  'SP500-T':  { yahoo: '%5EGSPC',    stooq: 'spx'     },
  'TBILL':    { yahoo: '%5ETNX',     stooq: 'tnx.b'   },
  'EURO-B':   { yahoo: 'EURUSD%3DX', stooq: 'eurusd'  },
  // Illiquid RWA — tokenized equities / real estate
  'TSLA-T':   { yahoo: 'TSLA',       stooq: 'tsla.us' },
  'RE-NYC':   { yahoo: 'VNQ',        stooq: 'vnq.us'  },   // proxy: Vanguard Real Estate ETF
  'RE-DXB':   { yahoo: 'VNQ',        stooq: 'vnq.us'  },   // same proxy (no public DXB feed)
  // xStocks — Tech
  'AAPLx':    { yahoo: 'AAPL',       stooq: 'aapl.us' },
  'MSFTx':    { yahoo: 'MSFT',       stooq: 'msft.us' },
  'GOOGLx':   { yahoo: 'GOOGL',      stooq: 'googl.us'},
  'AMZNx':    { yahoo: 'AMZN',       stooq: 'amzn.us' },
  'METAx':    { yahoo: 'META',       stooq: 'meta.us' },
  'NVDAx':    { yahoo: 'NVDA',       stooq: 'nvda.us' },
  'TSLAx':    { yahoo: 'TSLA',       stooq: 'tsla.us' },
  'NFLXx':    { yahoo: 'NFLX',       stooq: 'nflx.us' },
  'AMDx':     { yahoo: 'AMD',        stooq: 'amd.us'  },
  'INTCx':    { yahoo: 'INTC',       stooq: 'intc.us' },
  'TSMx':     { yahoo: 'TSM',        stooq: 'tsm.us'  },
  // xStocks — Finance
  'JPMx':     { yahoo: 'JPM',        stooq: 'jpm.us'  },
  'BACx':     { yahoo: 'BAC',        stooq: 'bac.us'  },
  'GSx':      { yahoo: 'GS',         stooq: 'gs.us'   },
  'BRKx':     { yahoo: 'BRK-B',      stooq: 'brk_b.us'},
  // xStocks — Consumer
  'DISx':     { yahoo: 'DIS',        stooq: 'dis.us'  },
  'NIKEx':    { yahoo: 'NKE',        stooq: 'nke.us'  },
  'SBUXx':    { yahoo: 'SBUX',       stooq: 'sbux.us' },
  'MCDx':     { yahoo: 'MCD',        stooq: 'mcd.us'  },
  // xStocks — Industrial
  'CATx':     { yahoo: 'CAT',        stooq: 'cat.us'  },
  'BAx':      { yahoo: 'BA',         stooq: 'ba.us'   },
  'GEx':      { yahoo: 'GE',         stooq: 'ge.us'   },
  // xStocks — Healthcare
  'JNJx':     { yahoo: 'JNJ',        stooq: 'jnj.us'  },
  'PFEx':     { yahoo: 'PFE',        stooq: 'pfe.us'  },
  'MRKx':     { yahoo: 'MRK',        stooq: 'mrk.us'  },
  // xStocks — Energy
  'XOMx':     { yahoo: 'XOM',        stooq: 'xom.us'  },
  'CVXx':     { yahoo: 'CVX',        stooq: 'cvx.us'  },
  // xETFs
  'SPYx':     { yahoo: 'SPY',        stooq: 'spy.us'  },
  'QQQx':     { yahoo: 'QQQ',        stooq: 'qqq.us'  },
  'VTIx':     { yahoo: 'VTI',        stooq: 'vti.us'  },
  'DIAx':     { yahoo: 'DIA',        stooq: 'dia.us'  },
  'IWMx':     { yahoo: 'IWM',        stooq: 'iwm.us'  },
  'GLDx':     { yahoo: 'GLD',        stooq: 'gld.us'  },
  'SLVx':     { yahoo: 'SLV',        stooq: 'slv.us'  },
};

/**
 * COMMODITY_SYMBOLS — exported set of ALL non-crypto symbols.
 * Every component must check this set and NOT fall back to the static
 * MarketData seed price for any symbol in this set.
 */
export const COMMODITY_SYMBOLS = new Set(Object.keys(NON_CRYPTO_CONFIG));

// ── Provider ──────────────────────────────────────────────────────────────────
export function MarketDataProvider({ children }) {
  const [liveData,   setLiveData]   = useState({});
  const [sparklines, setSparklines] = useState({});

  const bufferRef      = useRef({});
  const wsRef          = useRef(null);
  const reconnectRef   = useRef(null);
  const flushRef       = useRef(null);
  const cgPollRef      = useRef(null);
  const ncPollRef      = useRef(null);
  const wsAliveRef     = useRef(false);
  const retryCount     = useRef(0);
  const alive          = useRef(true);
  const prevPrices     = useRef({});

  // ── CoinGecko REST (crypto — initial + fallback polling) ──────────────────
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
      if (!bufferRef.current[sof] && !wsAliveRef.current) {
        patch[sof] = { available: true, price: d.usd, change: d.usd_24h_change ?? 0 };
      }
    });
    if (Object.keys(patch).length > 0) {
      setLiveData(prev => ({ ...prev, ...patch }));
    }
  }

  // ── Yahoo Finance via allorigins proxy ────────────────────────────────────
  async function fetchOneYahoo(yahooSym) {
    const yUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=2d`
    )}`;
    const res = await fetch(yUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('allorigins non-200');
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('no meta');
    const close = meta.regularMarketPrice ?? meta.chartPreviousClose;
    const prev  = meta.chartPreviousClose ?? meta.previousClose;
    if (!close || isNaN(close)) throw new Error('bad price');
    const change = prev && !isNaN(prev) ? ((close - prev) / prev) * 100 : 0;
    return { price: close, change };
  }

  // ── Stooq CSV — direct CORS fallback ─────────────────────────────────────
  async function fetchOneStooq(stooqSym) {
    const res = await fetch(
      `https://stooq.com/q/l/?s=${stooqSym}&f=sd2t2ohlcv&h&e=csv`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error('stooq non-200');
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('no data');
    const cols = lines[1].split(',');
    const close = parseFloat(cols[6]);
    const open  = parseFloat(cols[3]);
    if (!close || isNaN(close)) throw new Error('bad price');
    const change = open && !isNaN(open) ? ((close - open) / open) * 100 : 0;
    return { price: close, change };
  }

  // ── Metals.live — best source for gold & silver ───────────────────────────
  async function fetchMetals() {
    try {
      const res = await fetch('https://metals.live/api/v1/spot', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('metals non-200');
      const data = await res.json();
      const patch = {};
      data.forEach(item => {
        const sym = item.metal === 'gold' ? 'GOLD-T' : item.metal === 'silver' ? 'SILVER-T' : null;
        if (sym && item.price) {
          const prev = prevPrices.current[sym];
          const change = prev ? ((item.price - prev) / prev) * 100 : 0;
          patch[sym] = { available: true, price: item.price, change };
          prevPrices.current[sym] = item.price;
        }
      });
      if (Object.keys(patch).length > 0 && alive.current) {
        setLiveData(prev => ({ ...prev, ...patch }));
      }
      return Object.keys(patch);
    } catch { return []; }
  }

  // ── Frankfurter.app — EUR/USD FX ─────────────────────────────────────────
  async function fetchFX() {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('fx non-200');
      const data = await res.json();
      const rate = data?.rates?.USD;
      if (!rate) throw new Error('no rate');
      const prev = prevPrices.current['EURO-B'];
      const change = prev ? ((rate - prev) / prev) * 100 : 0;
      prevPrices.current['EURO-B'] = rate;
      if (alive.current) {
        setLiveData(prev => ({ ...prev, 'EURO-B': { available: true, price: rate, change } }));
      }
      return ['EURO-B'];
    } catch { return []; }
  }

  // ── Fetch ALL non-crypto assets in parallel batches ───────────────────────
  async function fetchAllNonCrypto() {
    if (!alive.current) return;

    // Fast dedicated sources first
    const [metalsHit, fxHit] = await Promise.all([fetchMetals(), fetchFX()]);
    const alreadyCovered = new Set([...metalsHit, ...fxHit]);

    // Remaining assets — fetch in parallel (Yahoo → Stooq fallback)
    const remaining = Object.entries(NON_CRYPTO_CONFIG).filter(([sym]) => !alreadyCovered.has(sym));
    if (remaining.length === 0) return;

    const patch = {};

    // Batch into groups of 8 to avoid overwhelming the proxy
    const BATCH = 8;
    for (let i = 0; i < remaining.length; i += BATCH) {
      if (!alive.current) break;
      const batch = remaining.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async ([sofSym, cfg]) => {
          try {
            let result;
            try   { result = await fetchOneYahoo(cfg.yahoo); }
            catch { result = await fetchOneStooq(cfg.stooq); }
            patch[sofSym] = { available: true, price: result.price, change: result.change };
            prevPrices.current[sofSym] = result.price;
          } catch {
            // Keep last known price if both sources fail
            const prev = prevPrices.current[sofSym];
            if (prev != null) {
              patch[sofSym] = { available: true, price: prev, change: 0 };
            }
            // If no previous price, leave as unavailable — component shows loading
          }
        })
      );
    }

    if (Object.keys(patch).length > 0 && alive.current) {
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

    // Crypto: immediate CoinGecko + WebSocket
    fetchCoinGecko();
    fetchSparklines();
    connectWS();
    startFlush();

    // Non-crypto: fire immediately, then poll every 30s
    fetchAllNonCrypto();

    cgPollRef.current  = setInterval(fetchCoinGecko,      30_000);
    ncPollRef.current  = setInterval(fetchAllNonCrypto,   30_000);
    const spTimer      = setInterval(fetchSparklines, 30 * 60_000);

    return () => {
      alive.current = false;
      wsRef.current?.close();
      clearTimeout(reconnectRef.current);
      clearInterval(flushRef.current);
      clearInterval(cgPollRef.current);
      clearInterval(ncPollRef.current);
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