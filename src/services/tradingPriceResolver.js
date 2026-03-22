/**
 * CRITICAL: Single source of truth for all trading prices.
 * 
 * This resolver ENFORCES the price priority chain:
 * 1. Mark Price (live Orderly mark)
 * 2. Last Price (24h close / last trade)
 * 3. Index Price (reference price)
 * 4. NEVER market cap, metadata, or token info prices
 * 
 * All trading calculations, charts, and UI must use this function.
 * No exceptions. No fallbacks to metadata.
 */

/**
 * Resolve trading price from Orderly ticker
 * @param {Object} ticker - Orderly ticker object with mark_price, last_price, index_price
 * @returns {{ price: number, source: string }}
 */
export function resolveTradingPrice(ticker) {
  if (!ticker) {
    return { price: null, source: null };
  }

  // Priority 1: Mark Price (live Orderly mark)
  if (ticker.mark_price != null && ticker.mark_price > 0) {
    return { price: ticker.mark_price, source: 'mark' };
  }

  // Priority 2: Last Price (24h close / last trade)
  if (ticker.last_price != null && ticker.last_price > 0) {
    return { price: ticker.last_price, source: 'last' };
  }

  // Priority 3: Index Price (reference)
  if (ticker.index_price != null && ticker.index_price > 0) {
    return { price: ticker.index_price, source: 'index' };
  }

  // DEAD END: No valid trading price
  console.error('[PRICE RESOLVER CRITICAL] No valid price in ticker:', ticker);
  return { price: null, source: null };
}

/**
 * Get human-readable price source label for UI
 * @param {string} source - 'mark' | 'last' | 'index' | null
 * @returns {string}
 */
export function priceSourceLabel(source) {
  const labels = {
    mark: '📊 MARK',
    last: '📈 LAST',
    index: '📉 INDEX',
  };
  return labels[source] || '❌ NO DATA';
}

/**
 * Log price source for debug system
 * @param {string} symbol - Trading symbol
 * @param {Object} ticker - Ticker object
 * @param {{ price: number, source: string }} resolved - Resolved price
 */
export function logPriceResolution(symbol, ticker, resolved) {
  console.log(`[PRICE RESOLVER] ${symbol}`, {
    source: resolved.source,
    price: resolved.price,
    mark: ticker?.mark_price,
    last: ticker?.last_price,
    index: ticker?.index_price,
    hasValidPrice: resolved.price != null && resolved.price > 0,
  });
}

/**
 * OVERRIDE: Force any price value to use trading resolver
 * Blocks metadata, market cap, or stale prices
 * @param {any} rawValue - Any price value from any source
 * @param {Object} ticker - Valid Orderly ticker
 * @returns {{ price: number, source: string }}
 */
export function hardLockTradingPrice(rawValue, ticker) {
  // ALWAYS prefer live ticker
  const resolved = resolveTradingPrice(ticker);
  if (resolved.price != null) {
    return resolved;
  }

  // If no ticker, REJECT raw value (don't fall back to metadata)
  console.error('[PRICE LOCK HARD FAIL]', { rawValue, noTickerAvailable: true });
  return { price: null, source: null };
}