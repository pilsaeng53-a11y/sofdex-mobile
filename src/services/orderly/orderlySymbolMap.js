/**
 * Orderly Network — public symbol mapping
 *
 * Maps the app's short symbol strings (e.g. 'BTC') to the Orderly
 * perpetual futures instrument format (e.g. 'PERP_BTC_USDC').
 *
 * Verified against live API: https://api.orderly.org/v1/public/futures
 */

export const ORDERLY_BASE_URL = 'https://api.orderly.org';
export const ORDERLY_WS_URL   = 'wss://ws.orderly.org/ws/stream/public';

/** Map app symbol → Orderly instrument string */
export const SYMBOL_MAP = {
  BTC:   'PERP_BTC_USDC',
  ETH:   'PERP_ETH_USDC',
  SOL:   'PERP_SOL_USDC',
  BNB:   'PERP_BNB_USDC',
  XRP:   'PERP_XRP_USDC',
  ARB:   'PERP_ARB_USDC',
  LINK:  'PERP_LINK_USDC',
  UNI:   'PERP_UNI_USDC',
  APT:   'PERP_APT_USDC',
  TON:   'PERP_TON_USDC',
};

/**
 * WS timeframe → Orderly kline topic suffix
 * Topic format: {symbol}@kline_{type}
 */
export const TIMEFRAME_MAP = {
  '1m':  '1m',
  '5m':  '5m',
  '15m': '15m',
  '1h':  '1h',
  '4h':  '4h',
  '1D':  '1d',
};

/**
 * Resolve an app-level short symbol to an Orderly instrument string.
 * Falls back to a best-guess PERP_ format if not in the map.
 */
export function toOrderlySymbol(appSymbol) {
  return SYMBOL_MAP[appSymbol?.toUpperCase()] ?? `PERP_${appSymbol?.toUpperCase()}_USDC`;
}