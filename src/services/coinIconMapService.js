/**
 * coinIconMapService.js
 *
 * Fetches the coin icon map from the Render backend ONCE per session.
 * On subsequent page loads the map is served from localStorage (TTL: 1 hour).
 * All trading data services are completely isolated from this module.
 *
 * Source of truth: https://solfort-api.onrender.com/coin-icons
 * Shape: { BTC: "https://...", ETH: "https://...", ... }
 */

const ENDPOINT   = 'https://solfort-api.onrender.com/coin-icons';
const CACHE_KEY  = 'solfort_icon_map_v1';
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour in ms
const FALLBACK   = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/generic.png';

// ── In-memory state ────────────────────────────────────────────────────────
let _iconMap      = {};
let _loaded       = false;
let _fetchPromise = null;
const _listeners  = new Set();

// ── localStorage helpers ───────────────────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, map } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return map;
  } catch { return null; }
}

function writeCache(map) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), map })); }
  catch { /* storage full — silently skip */ }
}

// ── Symbol extraction ──────────────────────────────────────────────────────
/**
 * Extracts the plain base asset from any symbol format.
 *   "BTC"           → "BTC"
 *   "BTC-USDT"      → "BTC"
 *   "BTC/USDC"      → "BTC"
 *   "PERP_BTC_USDC" → "BTC"
 */
export function extractBase(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();
  if (s.startsWith('PERP_')) return s.split('_')[1] ?? s;
  if (s.includes('-') || s.includes('/')) return s.split(/[-/]/)[0];
  return s;
}

// ── Core loader ────────────────────────────────────────────────────────────
/**
 * Load the icon map. Order of precedence:
 *   1. Already in memory (hot)
 *   2. localStorage cache within TTL (warm)
 *   3. Network fetch from Render backend (cold)
 *
 * Safe to call multiple times — only one network request is ever made.
 */
export async function loadIconMap() {
  if (_loaded) return _iconMap;
  if (_fetchPromise) return _fetchPromise;

  // Warm path — serve from cache without hitting the network
  const cached = readCache();
  if (cached && Object.keys(cached).length > 0) {
    _iconMap = cached;
    _loaded  = true;
    const keys = Object.keys(cached);
    console.log(`[CoinIconMap] ✅ Restored ${keys.length} icons from cache (${keys.slice(0, 6).join(', ')}, …)`);
    _listeners.forEach(fn => fn());
    return _iconMap;
  }

  // Cold path — fetch from backend
  _fetchPromise = fetch(ENDPOINT, { signal: AbortSignal.timeout(8000) })
    .then(async (res) => {
      const map = await res.json();
      _iconMap  = map;
      _loaded   = true;
      writeCache(map);

      const keys   = Object.keys(map);
      const sample = keys.slice(0, 8).join(', ');
      console.log(`[CoinIconMap] ✅ Fetched ${keys.length} icons from backend — keys: ${sample}`);

      _listeners.forEach(fn => fn());
      return map;
    })
    .catch((err) => {
      console.warn('[CoinIconMap] ⚠️ Backend fetch failed, icons will use fallback:', err.message);
      _loaded = true; // don't retry endlessly
      _listeners.forEach(fn => fn());
      return {};
    })
    .finally(() => { _fetchPromise = null; });

  return _fetchPromise;
}

// ── Public API ─────────────────────────────────────────────────────────────
/** Subscribe to map-loaded event. Fires immediately if already loaded. Returns unsubscribe fn. */
export function onIconMapLoaded(cb) {
  if (_loaded) { cb(); return () => {}; }
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

/**
 * Synchronously resolve an icon URL for any symbol format.
 * Always returns a string (URL or FALLBACK) — never undefined/null.
 */
export function getIconForSymbol(symbol) {
  const base = extractBase(symbol);
  const url  = _iconMap[base];
  // Treat missing entries and the backend's "/icons/fallback-coin.png" placeholder as no icon
  return (url && !url.startsWith('/icons/')) ? url : FALLBACK;
}

/** Whether the map has been fetched (success or failure). */
export function isIconMapLoaded() {
  return _loaded;
}