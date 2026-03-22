/**
 * data/coinIconMap.js
 *
 * Static coin icon URL map — loaded from coin_icon_map.json (project asset).
 * This is the PRIMARY source for all CoinIcon lookups.
 * Symbols with "/icons/fallback-coin.png" are treated as missing (no URL stored).
 *
 * To update: edit this map directly or regenerate from coin_icon_map.json.
 */

const RAW = {
  "ADA":  "/icons/fallback-coin.png",
  "APT":  "https://coin-images.coingecko.com/coins/images/26455/thumb/Aptos-Network-Symbol-Black-RGB-1x.png?17161789140",
  "ARB":  "https://coin-images.coingecko.com/coins/images/16547/thumb/arb.jpg?1721358242",
  "ATOM": "/icons/fallback-coin.png",
  "AVAX": "/icons/fallback-coin.png",
  "BCH":  "/icons/fallback-coin.png",
  "BNB":  "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png?1696501970",
  "BTC":  "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png?1696501400",
  "DOGE": "https://coin-images.coingecko.com/coins/images/5/thumb/dogecoin.png?1696501409",
  "DOT":  "https://coin-images.coingecko.com/coins/images/12171/thumb/polkadot.jpg?1766533446",
  "ETC":  "/icons/fallback-coin.png",
  "ETH":  "/icons/fallback-coin.png",
  "LINK": "/icons/fallback-coin.png",
  "LTC":  "/icons/fallback-coin.png",
  "MATIC":"/icons/fallback-coin.png",
  "OP":   "/icons/fallback-coin.png",
  "SOL":  "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png?1718769756",
  "SUI":  "https://coin-images.coingecko.com/coins/images/26375/thumb/sui-ocean-square.png?1727791290",
  "TRX":  "/icons/fallback-coin.png",
  "XRP":  "/icons/fallback-coin.png",
};

const FALLBACK = "/icons/fallback-coin.png";

/**
 * Returns the icon URL for a given symbol, or null if not in the map
 * or only has the fallback placeholder.
 *
 * @param {string} symbol - e.g. "BTC"
 * @returns {string|null}
 */
export function getIconUrl(symbol) {
  if (!symbol) return null;
  const url = RAW[symbol.toUpperCase()];
  if (!url || url === FALLBACK) return null;
  return url;
}

/** Full map, filtered to only real URLs (no fallback entries) */
export const COIN_ICON_MAP = Object.fromEntries(
  Object.entries(RAW).filter(([, v]) => v && v !== FALLBACK)
);