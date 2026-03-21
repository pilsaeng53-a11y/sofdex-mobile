/**
 * Coin Icon Service
 * Resolves coin image URLs from CoinGecko's public assets.
 * Uses a simple symbol→id map for the most common coins, with a
 * dynamic fallback that queries the CoinGecko search API.
 *
 * Images are cached in-memory for the session lifetime.
 */

// Fast lookup for the most common perpetual futures symbols
const KNOWN_IDS = {
  BTC:   'bitcoin',
  ETH:   'ethereum',
  SOL:   'solana',
  BNB:   'binancecoin',
  XRP:   'ripple',
  ARB:   'arbitrum',
  LINK:  'chainlink',
  UNI:   'uniswap',
  APT:   'aptos',
  TON:   'the-open-network',
  DOGE:  'dogecoin',
  AVAX:  'avalanche-2',
  MATIC: 'matic-network',
  POL:   'polygon-ecosystem-token',
  OP:    'optimism',
  ATOM:  'cosmos',
  DOT:   'polkadot',
  ADA:   'cardano',
  LTC:   'litecoin',
  BCH:   'bitcoin-cash',
  FIL:   'filecoin',
  NEAR:  'near',
  ICP:   'internet-computer',
  INJ:   'injective-protocol',
  SUI:   'sui',
  SEI:   'sei-network',
  TIA:   'celestia',
  JUP:   'jupiter-exchange-solana',
  PYTH:  'pyth-network',
  WIF:   'dogwifcoin',
  BONK:  'bonk',
  PEPE:  'pepe',
  SHIB:  'shiba-inu',
  WLD:   'worldcoin-wld',
  BLUR:  'blur',
  GMX:   'gmx',
  DYDX:  'dydx-chain',
  STRK:  'starknet',
  MEME:  'memecoin-2',
  ORDI:  'ordinals',
  SATS:  '1000sats-ordinals',
  W:     'wormhole',
  ENA:   'ethena',
  EIGEN: 'eigenlayer',
  ZK:    'zksync',
  IO:    'io-net',
  ZRO:   'layerzero',
};

// Cache: symbol → image URL (or null if not found)
const _iconCache = new Map();
// In-flight requests to avoid duplicate fetches
const _pending = new Map();

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

async function resolveById(geckoId) {
  // Use the small (thumb) image from CoinGecko's coin endpoint
  const url = `${COINGECKO_BASE}/coins/${geckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`;
  const res  = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json?.image?.small ?? json?.image?.thumb ?? null;
}

async function resolveBySearch(symbol) {
  const res  = await fetch(`${COINGECKO_BASE}/search?query=${encodeURIComponent(symbol)}`);
  if (!res.ok) return null;
  const json = await res.json();
  const coin = (json?.coins ?? []).find(
    c => c.symbol?.toUpperCase() === symbol.toUpperCase()
  );
  if (!coin) return null;
  // Use the large image from the thumb field that's part of the search response
  return coin.large ?? coin.thumb ?? null;
}

/**
 * Get a coin icon URL for the given base symbol (e.g. 'BTC').
 * Returns the URL string, or null if not found.
 * Results are cached per symbol.
 */
export async function getCoinIcon(symbol) {
  const key = symbol.toUpperCase();

  if (_iconCache.has(key)) return _iconCache.get(key);
  if (_pending.has(key))   return _pending.get(key);

  const p = (async () => {
    try {
      let url = null;
      const knownId = KNOWN_IDS[key];
      if (knownId) {
        url = await resolveById(knownId);
      }
      if (!url) {
        url = await resolveBySearch(key);
      }
      _iconCache.set(key, url);
      return url;
    } catch {
      _iconCache.set(key, null);
      return null;
    } finally {
      _pending.delete(key);
    }
  })();

  _pending.set(key, p);
  return p;
}

/** Pre-warm icons for a list of symbols (fire-and-forget) */
export function preloadIcons(symbols) {
  symbols.forEach(s => getCoinIcon(s));
}