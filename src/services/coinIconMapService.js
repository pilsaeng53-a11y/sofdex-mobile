/**
 * coinIconMapService.js
 *
 * Fetches the coin icon map from the Render backend ONCE on app load.
 * All UI components call getIconForSymbol() — fully synchronous after load.
 *
 * Source of truth: https://solfort-api.onrender.com/coin-icons
 * Returns: { BTC: "https://...", SOL: "https://...", ... }
 */

const ENDPOINT = 'https://solfort-api.onrender.com/coin-icons';
const FALLBACK  = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/generic.png';

// In-memory store — populated once on first fetch
let _iconMap = {};
let _loaded  = false;
let _fetchPromise = null;

/** Subscribe callbacks notified after map loads */
const _listeners = new Set();

/**
 * Extracts the plain base symbol from any trading-pair format.
 *   "BTC"            → "BTC"
 *   "BTC-USDT"       → "BTC"
 *   "BTC/USDC"       → "BTC"
 *   "PERP_BTC_USDC"  → "BTC"
 */
export function extractBase(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();
  if (s.startsWith('PERP_')) return s.split('_')[1] ?? s;
  if (s.includes('-') || s.includes('/')) return s.split(/[-/]/)[0];
  return s;
}

/**
 * Fetch the icon map from the backend. Safe to call multiple times —
 * only one request is ever made.
 */
export async function loadIconMap() {
  if (_loaded) return _iconMap;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(ENDPOINT, { signal: AbortSignal.timeout(8000) })
    .then(async (res) => {
      const map = await res.json();
      _iconMap = map;
      _loaded  = true;

      // Debug logs
      const keys   = Object.keys(map);
      const sample = keys.slice(0, 8).join(', ');
      console.log(`[CoinIconMap] ✅ Loaded ${keys.length} icons from ${ENDPOINT}`);
      console.log(`[CoinIconMap] Sample keys: ${sample}`);

      _listeners.forEach(fn => fn());
      return map;
    })
    .catch((err) => {
      console.warn('[CoinIconMap] ⚠️ Failed to load from backend, using fallback:', err.message);
      _loaded = true; // mark as attempted so we don't retry infinitely
      return {};
    })
    .finally(() => {
      _fetchPromise = null;
    });

  return _fetchPromise;
}

/** Subscribe to map-loaded event. Returns unsubscribe fn. */
export function onIconMapLoaded(cb) {
  if (_loaded) { cb(); return () => {}; }
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

/**
 * Synchronously resolve an icon URL for any symbol format.
 * Returns the URL string, or FALLBACK if not found.
 *
 * @param {string} symbol - any format: "BTC", "PERP_BTC_USDC", "BTC-USDT"
 * @returns {string}
 */
export function getIconForSymbol(symbol) {
  const base = extractBase(symbol);
  const url  = _iconMap[base];

  // Treat missing or "/icons/fallback-coin.png" placeholder as no icon
  const resolved = (url && !url.startsWith('/icons/')) ? url : FALLBACK;

  console.debug('[CoinIcon]', { symbol, base, resolved, mapLoaded: _loaded });
  return resolved;
}

/** Whether the map has been fetched (success or failure). */
export function isIconMapLoaded() {
  return _loaded;
}