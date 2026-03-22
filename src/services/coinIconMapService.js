/**
 * coinIconMapService.js
 *
 * Single source of truth for coin icon resolution.
 * Uses the bundled COIN_ICON_MAP (data/coinIconMap.js) as primary source.
 * Optionally merges with backend overrides from Render (extra/custom icons).
 *
 * No trading data ever flows through this module.
 */

import { COIN_ICON_MAP, FALLBACK_ICON, extractBase as extractBaseRaw } from '../data/coinIconMap';
import { normalizeSymbol } from './marketPriceResolver';

// Wrap extractBase to apply alias normalization after extraction
function extractBase(symbol) {
  const raw = extractBaseRaw(symbol);
  return normalizeSymbol(raw);
}

const BACKEND_ENDPOINT = 'https://solfort-api.onrender.com/coin-icons';
const CACHE_KEY        = 'solfort_icon_map_v3'; // bumped to bust old inverted cache
const CACHE_TTL        = 60 * 60 * 1000; // 1 hour

// ── In-memory state ─────────────────────────────────────────────────────────
// Start with bundled CDN map as fallback — backend is the authority
let _iconMap  = { ...COIN_ICON_MAP };
let _loaded   = false; // false until backend responds
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

// ── One-time cleanup: remove old cache keys with inverted priority ───────────
try { localStorage.removeItem('solfort_icon_map_v2'); } catch { /* ignore */ }

// ── Bootstrap: apply cached backend map immediately (non-blocking startup) ──
(function bootstrap() {
  const cached = readCache();
  if (cached && Object.keys(cached).length > 0) {
    // Backend takes priority; bundled CDN is fallback only
    _iconMap = { ...COIN_ICON_MAP, ...cached };
    _loaded  = true;
    console.log(`[CoinIconMap] ✅ Cache restored: ${Object.keys(cached).length} backend icons. Sample: ${Object.keys(cached).slice(0,5).join(', ')}`);
  } else {
    console.log(`[CoinIconMap] ⏳ No cache — using bundled CDN fallback (${Object.keys(COIN_ICON_MAP).length} icons) until backend loads`);
  }
})();

// ── Primary fetch: backend IS the source of truth ───────────────────────────
let _fetchStarted = false;
export async function loadIconMap() {
  if (_fetchStarted) return _iconMap;
  _fetchStarted = true;

  console.log(`[CoinIconMap] 🔄 Fetching backend: ${BACKEND_ENDPOINT}`);
  try {
    const res  = await fetch(BACKEND_ENDPOINT, { signal: AbortSignal.timeout(8000) });
    console.log(`[CoinIconMap] 📡 Backend response: HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const map  = await res.json();
    const keys = Object.keys(map);
    // Backend takes priority; bundled CDN only fills gaps for missing entries
    _iconMap   = { ...COIN_ICON_MAP, ...map };
    _loaded    = true;
    writeCache(map);
    console.log(`[CoinIconMap] ✅ Backend is authoritative: ${keys.length} icons loaded. Sample: ${keys.slice(0,5).join(', ')}`);
    _listeners.forEach(fn => fn());
  } catch (err) {
    console.warn(`[CoinIconMap] ❌ Backend fetch failed — staying on bundled CDN fallback. Error: ${err.message}`);
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
export { extractBase, FALLBACK_ICON, normalizeSymbol };