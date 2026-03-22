/**
 * data/coinIconMap.js
 *
 * Coin icon resolution using the GitHub-hosted spothq/cryptocurrency-icons
 * package via jsDelivr CDN.
 *
 * CDN pattern:
 *   https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/{symbol}.png
 *
 * extractBase() normalises any symbol format to a plain base symbol:
 *   "BTC"            → "BTC"
 *   "BTC-USDT"       → "BTC"
 *   "BTC/USDC"       → "BTC"
 *   "PERP_BTC_USDC"  → "BTC"
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color';

/**
 * Symbols known to exist in the spothq/cryptocurrency-icons repo.
 * Keeping a whitelist avoids 404s for obscure or non-existent symbols.
 * Add more as needed.
 */
const KNOWN_SYMBOLS = new Set([
  'ADA','ALGO','APE','APT','ARB','ATOM','AVAX','AXS','BCH','BNB',
  'BTC','CELO','CHZ','COMP','CRO','CRV','DOGE','DOT','DYDX','ENJ',
  'EOS','ETC','ETH','FIL','FTM','GAL','GMT','GRT','ICP','IMX',
  'INJ','KAVA','LINK','LRC','LTC','MANA','MATIC','NEAR','ONE','OP',
  'PEPE','POL','POLS','RUNE','SAND','SHIB','SOL','STX','SUI',
  'TRX','UNI','USDC','USDT','VET','WLD','XLM','XRP','ZEC','ZIL',
]);

// Manual overrides for symbols that exist under a different slug in the repo
// or need a known-good external URL.
const OVERRIDES = {
  // spothq uses 'matic' for the Polygon token
  POL:  `${CDN_BASE}/matic.png`,
};

/**
 * Extracts the base symbol from any trading-pair format.
 *
 * "PERP_BTC_USDC" → "BTC"
 * "BTC-USDT"      → "BTC"
 * "BTC/USDC"      → "BTC"
 * "BTC"           → "BTC"
 */
export function extractBase(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();
  if (s.startsWith('PERP_')) {
    const parts = s.split('_');
    return parts[1] ?? s;
  }
  if (s.includes('-') || s.includes('/')) {
    return s.split(/[-/]/)[0];
  }
  return s;
}

/**
 * Returns the CDN icon URL for any symbol format, or null if unknown.
 *
 * @param {string} symbol - any format: "BTC", "PERP_BTC_USDC", "BTC-USDT"
 * @returns {string|null}
 */
export function getIconUrl(symbol) {
  const base = extractBase(symbol);
  if (!base) return null;

  // Manual override
  if (OVERRIDES[base]) {
    console.debug('[CoinIcon]', symbol, '→', base, '→ override', OVERRIDES[base]);
    return OVERRIDES[base];
  }

  // CDN whitelist
  if (KNOWN_SYMBOLS.has(base)) {
    const url = `${CDN_BASE}/${base.toLowerCase()}.png`;
    console.debug('[CoinIcon]', symbol, '→', base, '→', url);
    return url;
  }

  console.debug('[CoinIcon]', symbol, '→', base, '→ not in map, will fallback');
  return null;
}