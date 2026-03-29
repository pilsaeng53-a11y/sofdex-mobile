/**
 * CRITICAL: Single source of truth for all trading prices.
 *
 * ARCHITECTURE NOTE:
 * This file is the canonical export point for trading price resolution.
 * All components must import from HERE — not from lib/trading/resolveTradingPrice directly.
 *
 * Ticker fields (camelCase — matches fetchTicker output from publicMarketService):
 *   markPrice  → priority 1 (PnL, margin, liquidation)
 *   lastPrice  → priority 2 (last traded / 24h close)
 *   indexPrice → priority 3 (oracle reference)
 *
 * FORBIDDEN: marketCap, fdv, summaryPrice, metadata price, CoinGecko price
 * These are for portfolio/display only — NEVER for trading UI.
 */

// Re-export the canonical resolver (camelCase field names — matches fetchTicker)
import { resolveTradingPrice as _resolve, priceSourceLabel } from '../lib/trading/resolveTradingPrice';
export { _resolve as resolveTradingPrice, priceSourceLabel };

/**
 * Debug log: call after every price resolution in a trading component.
 * @param {string} symbol
 * @param {Object} ticker  - raw ticker from useTicker()
 * @param {{ price: number, source: string }} resolved
 */
export function logPriceResolution(symbol, ticker, resolved) {
  console.log(`[PRICE RESOLVER] ${symbol}`, {
    source:        resolved.source,
    price:         resolved.price,
    markPrice:     ticker?.markPrice,
    lastPrice:     ticker?.lastPrice,
    indexPrice:    ticker?.indexPrice,
    hasValidPrice: resolved.price != null && resolved.price > 0,
  });
}

/**
 * OVERRIDE: Force any price value through the trading resolver.
 * Blocks metadata, market cap, or stale prices.
 * @param {Object} ticker - Valid Orderly ticker (camelCase fields)
 * @returns {{ price: number, source: string }}
 */
export function hardLockTradingPrice(ticker) {
  const resolved = _resolve(ticker);
  if (resolved.price != null && resolved.price > 0) return resolved;
  console.error('[PRICE LOCK HARD FAIL] No valid trading price in ticker:', ticker);
  return { price: 0, source: 'none' };
}