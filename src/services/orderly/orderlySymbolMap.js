/**
 * Orderly Network — public symbol mapping
 *
 * Maps the app's short symbol strings (e.g. 'BTC') to the Orderly
 * perpetual futures instrument format (e.g. 'PERP_BTC_USDC').
 *
 * Structure is intentionally decoupled so any new instrument can be
 * added here without touching trading UI components.
 *
 * Future: this table could be hydrated from the Orderly /v1/public/info
 * endpoint and cached in a database for the watchlist feature.
 */

export const ORDERLY_BASE_URL = 'https://api-evm.orderly.network';
export const ORDERLY_WS_URL   = 'wss://ws-evm.orderly.network';

/** Map app symbol → Orderly symbol string */
export const SYMBOL_MAP = {
  BTC:  'PERP_BTC_USDC',
  ETH:  'PERP_ETH_USDC',
  SOL:  'PERP_SOL_USDC',
  BNB:  'PERP_BNB_USDC',
  XRP:  'PERP_XRP_USDC',
  ARB:  'PERP_ARB_USDC',
  MATIC:'PERP_MATIC_USDC',
};

/** Orderly timeframe string for kline REST endpoint */
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