/**
 * data/coinIconMap.js
 *
 * Primary static icon map. Sourced from coin_icon_map.json.
 * Symbols marked as fallback are kept in RAW but getIconUrl() returns null for them,
 * so the component falls through to coinIconService.
 *
 * extractBase() normalises any symbol format to a plain base symbol:
 *   "BTC"          → "BTC"
 *   "BTC-USDT"     → "BTC"
 *   "BTC/USDC"     → "BTC"
 *   "PERP_BTC_USDC"→ "BTC"
 */

const FALLBACK_PATH = "/icons/fallback-coin.png";

// Symbols that have real CoinGecko URLs in the uploaded map
const ICON_URLS = {
  APT:  "https://coin-images.coingecko.com/coins/images/26455/thumb/Aptos-Network-Symbol-Black-RGB-1x.png?17161789140",
  ARB:  "https://coin-images.coingecko.com/coins/images/16547/thumb/arb.jpg?1721358242",
  BNB:  "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png?1696501970",
  BTC:  "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png?1696501400",
  DOGE: "https://coin-images.coingecko.com/coins/images/5/thumb/dogecoin.png?1696501409",
  DOT:  "https://coin-images.coingecko.com/coins/images/12171/thumb/polkadot.jpg?1766533446",
  SOL:  "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png?1718769756",
  SUI:  "https://coin-images.coingecko.com/coins/images/26375/thumb/sui-ocean-square.png?1727791290",
};

/**
 * Extracts the base symbol from any symbol format.
 *
 * "PERP_BTC_USDC" → "BTC"
 * "BTC-USDT"      → "BTC"
 * "BTC/USDC"      → "BTC"
 * "BTC"           → "BTC"
 */
export function extractBase(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();
  // Orderly perpetual format: PERP_BASE_QUOTE
  if (s.startsWith('PERP_')) {
    const parts = s.split('_');
    return parts[1] ?? s;
  }
  // Hyphen or slash separated: BTC-USDT, BTC/USDC
  if (s.includes('-') || s.includes('/')) {
    return s.split(/[-/]/)[0];
  }
  return s;
}

/**
 * Returns the icon URL for any symbol format, or null if not found.
 * Always extracts the base symbol first, then looks up the map.
 *
 * @param {string} symbol - any format: "BTC", "PERP_BTC_USDC", "BTC-USDT"
 * @returns {string|null}
 */
export function getIconUrl(symbol) {
  const base = extractBase(symbol);
  if (!base) return null;
  const url = ICON_URLS[base];
  console.debug('[CoinIcon] resolve', { input: symbol, base, url: url ?? null });
  return url ?? null;
}

/** Exported map for use outside CoinIcon (e.g. preloading, SymbolDrawer). */
export const COIN_ICON_MAP = { ...ICON_URLS };