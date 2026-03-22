/**
 * coinIconMapService.js
 *
 * Single source of truth for coin icon resolution.
 * Uses the bundled COIN_ICON_MAP (data/coinIconMap.js) as primary source.
 * Optionally merges with backend overrides from Render (extra/custom icons).
 *
 * No trading data ever flows through this module.
 */

import { COIN_ICON_MAP, FALLBACK_ICON, extractBase } from '../data/coinIconMap';

const BACKEND_ENDPOINT = 'https://solfort-api.onrender.com/coin-icons';
const CACHE_KEY        = 'solfort_icon_map_v2';
const CACHE_TTL        = 60 * 60 * 1000; // 1 hour

// ── In-memory state ─────────────────────────────────────────────────────────
// Start with the bundled map — icons work immediately without any fetch
let _iconMap  = { ...COIN_ICON_MAP };
let _loaded   = true;  // bundled map is always available
const _listeners = new Set();

// ── localStorage helpers ────────────────────────────────────────────────────
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
  catch { /* storage full */ }
}

// ── Bootstrap: merge cached backend overrides if available ──────────────────
(function bootstrap() {
  const cached = readCache();
  if (cached && Object.keys(cached).length > 0) {
    // Bundled map takes priority; backend only fills gaps
    _iconMap = { ...cached, ...COIN_ICON_MAP };
    console.log(`[CoinIconMap] ✅ Bundled ${Object.keys(COIN_ICON_MAP).length} icons + ${Object.keys(cached).length} from cache`);
  } else {
    console.log(`[CoinIconMap] ✅ Bundled ${Object.keys(COIN_ICON_MAP).length} icons (no cache)`);
  }
})();

// ── Background fetch: merge backend overrides (non-blocking) ────────────────
let _fetchStarted = false;
export async function loadIconMap() {
  if (_fetchStarted) return _iconMap;
  _fetchStarted = true;

  try {
    const res  = await fetch(BACKEND_ENDPOINT, { signal: AbortSignal.timeout(8000) });
    const map  = await res.json();
    // Bundled map takes priority over backend — backend only adds extras
    _iconMap   = { ...map, ...COIN_ICON_MAP };
    writeCache(map);
    const keys = Object.keys(map);
    console.log(`[CoinIconMap] ✅ Backend merged ${keys.length} icons (bundled takes priority)`);
    _listeners.forEach(fn => fn());
  } catch (err) {
    console.info('[CoinIconMap] Backend fetch skipped (using bundled):', err.message);
  }

  return _iconMap;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Subscribe to map updates. Fires immediately since bundled map is pre-loaded. */
export function onIconMapLoaded(cb) {
  // Always fire immediately — bundled map is ready from module init
  cb();
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

/**
 * Resolve icon URL for any symbol format.
 * Always returns a valid URL string — never null/undefined.
 */
export function getIconForSymbol(symbol) {
  const base = extractBase(symbol);
  const url  = _iconMap[base];
  // Reject backend placeholder paths
  if (url && !url.startsWith('/icons/')) return url;
  return FALLBACK_ICON;
}

/** Whether the icon map is ready (always true since bundled). */
export function isIconMapLoaded() {
  return true;
}

// Re-export for convenience
export { extractBase, FALLBACK_ICON };