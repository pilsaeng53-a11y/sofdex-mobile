/**
 * Orderly Network — Dynamic Symbol List Service
 * Fetches all available perpetual futures from the public API.
 */

import { ORDERLY_BASE_URL } from './orderlySymbolMap';

let _cachedSymbols = null;
let _fetchPromise  = null;

/**
 * Fetch all tradeable perpetual futures from Orderly.
 * Returns array of { orderlySymbol, base, quote, displayName }
 * Results are cached in-memory for the session.
 */
export async function fetchAllSymbols() {
  if (_cachedSymbols) return _cachedSymbols;
  if (_fetchPromise)  return _fetchPromise;

  _fetchPromise = (async () => {
    const res  = await fetch(`${ORDERLY_BASE_URL}/v1/public/futures`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Orderly ${res.status}: /v1/public/futures`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? 'Failed to load symbols');

    const rows = Array.isArray(json.data?.rows) ? json.data.rows : [];
    _cachedSymbols = rows
      .filter(r => r.symbol && r.symbol.startsWith('PERP_'))
      .map(r => {
        // PERP_BTC_USDC  →  base=BTC  quote=USDC
        const parts = r.symbol.split('_');
        let base    = parts[1] ?? r.symbol;
        const quote = parts[2] ?? 'USDC';
        // Normalize legacy rename: MATIC → POL
        if (base === 'MATIC') base = 'POL';
        return {
          orderlySymbol: r.symbol,
          base,
          quote,
          displayName: `${base}-${quote}`,
          // Extra stats if available
          volume24h:   r['24h_volume']  ?? null,
          change24h:   r['24h_change']  ?? null,
          lastPrice:   r['24h_close']   ?? r.mark_price ?? null,
        };
      })
      // Remove RNDR from the list
      .filter(r => r.base !== 'RNDR')
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return _cachedSymbols;
  })();

  return _fetchPromise;
}

/** Clear cache (e.g. for refresh button) */
export function clearSymbolCache() {
  _cachedSymbols = null;
  _fetchPromise  = null;
}