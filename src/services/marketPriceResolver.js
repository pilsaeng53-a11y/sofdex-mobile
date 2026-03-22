/**
 * services/marketPriceResolver.js
 *
 * Single source of truth for trading price resolution.
 *
 * All of the following MUST use this module:
 *   - ChartContainer       (display price, price direction)
 *   - OrderBook            (mid-price / spread center)
 *   - OrderPanel           (mark price for market orders)
 *   - LiveMarketStatsBar   (mark price stat)
 *   - useOrderForm         (markPrice input)
 *   - Liquidation calc     (entry price basis)
 *
 * Price priority (Orderly standard):
 *   1. markPrice   — PnL, margin, liquidation
 *   2. lastPrice   — last traded / 24h close
 *   3. indexPrice  — oracle fallback
 *
 * Symbol normalization:
 *   All symbols are normalized via normalizeSymbol() before passing to Orderly.
 *   The alias map (data/symbol_alias_map.json) is the canonical source of aliases.
 *
 * FORBIDDEN: CoinGecko, Binance, MarketDataProvider prices for any trading UI.
 */

import aliasMap from '../data/symbol_alias_map.json';
import { resolveTradingPrice, priceSourceLabel } from '../lib/trading/resolveTradingPrice';

// Re-export core resolver so consumers import from ONE place
export { resolveTradingPrice, priceSourceLabel };

/**
 * Normalizes any symbol format to a plain base symbol.
 *
 * Examples:
 *   "PERP_BTC_USDC" → "BTC"
 *   "BTC-USDT"      → "BTC"
 *   "BTC/USDT"      → "BTC"
 *   "MATIC"         → "POL"   (alias map)
 *   "WBTC"          → "BTC"   (alias map)
 *   "BTC"           → "BTC"
 */
export function normalizeSymbol(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();

  // Strip Orderly PERP prefix: "PERP_BTC_USDC" → "BTC"
  if (s.startsWith('PERP_')) {
    const parts = s.split('_');
    const base  = parts[1] ?? s;
    return aliasMap.aliases[base] ?? base;
  }

  // Strip pair separators: "BTC-USDT" or "BTC/USDT" → "BTC"
  if (s.includes('-') || s.includes('/')) {
    // Check full pair first (e.g. "BTC-USDT" → "BTC" via alias map)
    if (aliasMap.aliases[s]) return aliasMap.aliases[s];
    const base = s.split(/[-/]/)[0];
    return aliasMap.aliases[base] ?? base;
  }

  // Plain symbol — check alias map
  return aliasMap.aliases[s] ?? s;
}

/**
 * Returns the Orderly perpetual symbol string for a given base symbol.
 *   "BTC" → "PERP_BTC_USDC"
 */
export function toOrderlyPerp(symbol) {
  const base = normalizeSymbol(symbol);
  return `${aliasMap.orderly_prefix}${base}${aliasMap.orderly_quote}`;
}

/**
 * Returns the display pair string for UI labels.
 *   "BTC" → "BTC/USDT"
 */
export function toDisplayPair(symbol) {
  const base = normalizeSymbol(symbol);
  return `${base}/${aliasMap.display_quote}`;
}

/**
 * Resolves the canonical trading price from a raw Orderly ticker.
 * This is the ONLY function that should be called to get a price for trading UI.
 *
 * Returns: { price: number, source: 'mark'|'last'|'index'|'none' }
 */
export function resolvePrice(ticker) {
  return resolveTradingPrice(ticker);
}