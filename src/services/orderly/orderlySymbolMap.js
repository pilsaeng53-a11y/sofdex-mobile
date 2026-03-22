/**
 * services/orderly/orderlySymbolMap.js
 *
 * Re-exports from lib/trading/symbols (the canonical source).
 * Also defines Orderly-specific network config that doesn't belong in the
 * domain lib (API URLs, WS path, timeframe mapping).
 *
 * Import symbol helpers from lib/trading/symbols everywhere else.
 * Only import from here when you specifically need ORDERLY_BASE_URL / ORDERLY_WS_URL.
 */

export { ORDERLY_SYMBOL_MAP as SYMBOL_MAP, toOrderlySymbol } from '../../lib/trading/symbols';

export const ORDERLY_BASE_URL = 'https://api.orderly.org';

// Public WS requires an account_id in the URL path.
// Any valid hex-format string works for unauthenticated public topics.
const PUBLIC_GUEST_ID = '0x0000000000000000000000000000000000000001';
export const ORDERLY_WS_URL = `wss://ws-evm.orderly.org/ws/stream/${PUBLIC_GUEST_ID}`;

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
  '1d':  '1d',
};