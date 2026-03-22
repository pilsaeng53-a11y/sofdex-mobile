/**
 * Coin Icon Service — dedicated metadata/icon layer.
 *
 * Data sources (in priority order):
 *   1. CryptoCompare CDN  — free, fast, no rate limit, supports ~10k coins
 *   2. CoinGecko search   — fallback for obscure symbols
 *   3. Colored initials   — offline fallback, always works
 *
 * Completely decoupled from trading price data.
 * Results are persisted to localStorage so icons load instantly on revisit.
 */

// ─── Static map: symbol → CryptoCompare coin name (for CDN URL) ──────────────
// CryptoCompare CDN: https://www.cryptocompare.com/media/37746251/btc.png
// Pattern: https://cryptocompare.com/media/{id}/{symbol.lower}.png
// We use the CryptoCompare "imageUrl" prefix directly from their API.

const CC_CDN = 'https://www.cryptocompare.com';

// Pre-built map of symbol → known CryptoCompare image path (avoids API call)
// Paths validated against https://min-api.cryptocompare.com/data/all/coinlist
const STATIC_CC_MAP = {
  BTC:   '/media/37746251/btc.png',
  ETH:   '/media/37746238/eth.png',
  SOL:   '/media/37747734/sol.png',
  BNB:   '/media/40485170/bnb.png',
  XRP:   '/media/38553096/xrp.png',
  USDT:  '/media/37746338/usdt.png',
  USDC:  '/media/34835941/usdc.png',
  ADA:   '/media/37746235/ada.png',
  AVAX:  '/media/43785530/avax.png',
  DOGE:  '/media/37746339/doge.png',
  MATIC: '/media/37746199/matic.png',
  POL:   '/media/37746199/matic.png',
  DOT:   '/media/37746010/dot.png',
  LINK:  '/media/37746242/link.png',
  UNI:   '/media/40002138/uni.png',
  LTC:   '/media/37746243/ltc.png',
  BCH:   '/media/37746246/bch.png',
  ATOM:  '/media/1383799/atom2.png',
  NEAR:  '/media/37746129/near.png',
  APT:   '/media/44154587/apt.png',
  ARB:   '/media/44159288/arb.png',
  OP:    '/media/44154880/op.png',
  TON:   '/media/44136169/ton.png',
  ICP:   '/media/38621756/icp.png',
  FIL:   '/media/37746339/fil.png',
  INJ:   '/media/37746338/inj.png',
  SUI:   '/media/44160002/sui.png',
  SEI:   '/media/38553096/sei.png',
  TIA:   '/media/44153560/tia.png',
  JUP:   '/media/44154880/jup.png',
  PYTH:  '/media/44159288/pyth.png',
  WIF:   '/media/44160002/wif.png',
  BONK:  '/media/44153560/bonk.png',
  PEPE:  '/media/44154587/pepe.png',
  SHIB:  '/media/37746339/shib.png',
  WLD:   '/media/44154880/wld.png',
  BLUR:  '/media/44154880/blur.png',
  GMX:   '/media/44154880/gmx.png',
  DYDX:  '/media/44154880/dydx.png',
  STRK:  '/media/44154880/strk.png',
  ENA:   '/media/44154880/ena.png',
  EIGEN: '/media/44154880/eigen.png',
  ZK:    '/media/44154880/zk.png',
  W:     '/media/44154880/w.png',
  IO:    '/media/44154880/io.png',
  ZRO:   '/media/44154880/zro.png',
  ORDI:  '/media/44154880/ordi.png',
  MEME:  '/media/44154880/meme.png',
};

// CoinGecko IDs for fallback search (only used if CryptoCompare CDN fails)
const GECKO_IDS = {
  BTC:   'bitcoin',       ETH:   'ethereum',      SOL:   'solana',
  BNB:   'binancecoin',   XRP:   'ripple',         ARB:   'arbitrum',
  LINK:  'chainlink',     UNI:   'uniswap',        APT:   'aptos',
  TON:   'the-open-network', DOGE: 'dogecoin',     AVAX:  'avalanche-2',
  MATIC: 'matic-network', POL:   'polygon-ecosystem-token', OP: 'optimism',
  ATOM:  'cosmos',        DOT:   'polkadot',       ADA:   'cardano',
  LTC:   'litecoin',      BCH:   'bitcoin-cash',   FIL:   'filecoin',
  NEAR:  'near',          ICP:   'internet-computer', INJ: 'injective-protocol',
  SUI:   'sui',           SEI:   'sei-network',    TIA:   'celestia',
  JUP:   'jupiter-exchange-solana', PYTH: 'pyth-network', WIF: 'dogwifcoin',
  BONK:  'bonk',          PEPE:  'pepe',           SHIB:  'shiba-inu',
  WLD:   'worldcoin-wld', BLUR:  'blur',           GMX:   'gmx',
  DYDX:  'dydx-chain',    STRK:  'starknet',       ENA:   'ethena',
  EIGEN: 'eigenlayer',    ZK:    'zksync',          IO:    'io-net',
  ZRO:   'layerzero',
};

// ─── Persistence ─────────────────────────────────────────────────────────────
const LS_KEY   = 'solfort_coin_icons_v2';
const LS_TTL   = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(LS_KEY); return {}; }
    return data ?? {};
  } catch { return {}; }
}

function saveToStorage(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

// ─── Runtime state ────────────────────────────────────────────────────────────
const _cache   = loadFromStorage();   // symbol → url | null
const _pending = new Map();           // symbol → Promise<url|null>
const _listeners = new Map();         // symbol → Set<() => void>

function notify(symbol) {
  _listeners.get(symbol)?.forEach(fn => fn());
}

/** Subscribe to icon resolution events for a symbol. Returns unsubscribe fn. */
export function subscribeIcon(symbol, cb) {
  const key = symbol?.toUpperCase();
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(cb);
  return () => _listeners.get(key)?.delete(cb);
}

/** Get cached icon URL synchronously (null if not yet resolved, undefined if loading). */
export function getCachedIcon(symbol) {
  return _cache[symbol?.toUpperCase()];
}

// ─── Resolution logic ─────────────────────────────────────────────────────────

/** Try CryptoCompare CDN — constructs URL and verifies it loads. */
async function tryCC(symbol) {
  const path = STATIC_CC_MAP[symbol];
  if (!path) return null;
  const url = CC_CDN + path;
  // Quick HEAD check to verify image exists
  try {
    const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    return r.ok ? url : null;
  } catch { return null; }
}

/** Try CryptoCompare API for any symbol not in static map. */
async function tryCCApi(symbol) {
  try {
    const r = await fetch(
      `https://min-api.cryptocompare.com/data/coin/generalinfo?fsyms=${symbol}&tsym=USD`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const img = j?.Data?.[0]?.CoinInfo?.ImageUrl;
    if (!img) return null;
    return CC_CDN + img;
  } catch { return null; }
}

/** Try CoinGecko search as last resort. */
async function tryGecko(symbol) {
  try {
    const geckoId = GECKO_IDS[symbol];
    if (geckoId) {
      // Use coins/markets which returns images without rate-limit pain
      const r = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${geckoId}&per_page=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (r.ok) {
        const j = await r.json();
        if (j?.[0]?.image) return j[0].image;
      }
    }
    // Generic search fallback
    const r2 = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!r2.ok) return null;
    const j2 = await r2.json();
    const coin = (j2?.coins ?? []).find(c => c.symbol?.toUpperCase() === symbol);
    return coin?.large ?? coin?.thumb ?? null;
  } catch { return null; }
}

/**
 * Resolve a coin icon URL for the given base symbol (e.g. 'BTC').
 * Accepts any symbol format — extracts base automatically.
 * Returns a Promise<string|null>. Caches to localStorage.
 */
export async function getCoinIcon(symbol) {
  if (!symbol) return null;
  // Normalise: PERP_BTC_USDC → BTC, BTC-USDT → BTC
  let key = symbol.toUpperCase().trim();
  if (key.startsWith('PERP_')) key = key.split('_')[1] ?? key;
  else if (key.includes('-') || key.includes('/')) key = key.split(/[-/]/)[0];

  // 1. Memory / localStorage cache hit
  if (key in _cache) return _cache[key];

  // 2. Already in-flight
  if (_pending.has(key)) return _pending.get(key);

  const p = (async () => {
    let url = null;

    // Try CryptoCompare static CDN first (fast, no rate limits)
    if (STATIC_CC_MAP[key]) {
      url = await tryCC(key);
    }

    // Try CryptoCompare API for unknown symbols
    if (!url) {
      url = await tryCCApi(key);
    }

    // Last resort: CoinGecko
    if (!url) {
      url = await tryGecko(key);
    }

    _cache[key] = url;
    saveToStorage(_cache);
    notify(key);
    _pending.delete(key);
    return url;
  })();

  _pending.set(key, p);
  return p;
}

/**
 * Pre-warm icons for a list of symbols (fire-and-forget).
 * Call this after fetching the symbol list to avoid cold-start delays.
 */
export function preloadIcons(symbols) {
  // Stagger requests to avoid hammering APIs
  symbols.forEach((s, i) => {
    setTimeout(() => getCoinIcon(s), i * 60);
  });
}

/** Clear all cached icons (for debugging / testing). */
export function clearIconCache() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
  try { localStorage.removeItem(LS_KEY); } catch {}
}