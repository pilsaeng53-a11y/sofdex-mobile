/**
 * marketDataService.js
 * Single source of truth for live market data.
 * Fetches from https://solfort-api.onrender.com/market-data
 * and normalizes to a consistent shape for all components.
 *
 * Price rule: use liveTradingPrice only.
 * NEVER use marketCap, fdv, metadata price, or summary price.
 */

import { getMarketData } from './solfortApi';

/**
 * Fetch and normalize market data from the SolFort backend.
 * @returns {Promise<Array<{symbol, normalizedSymbol, liveTradingPrice}>>}
 */
export async function fetchMarketData() {
  const data = await getMarketData();
  // data is already unwrapped array from solfortApi.getMarketData()
  return data.map(normalizeMarketItem);
}

/**
 * Normalize a single market data item.
 * Maps liveTradingPrice as the canonical price field.
 */
function normalizeMarketItem(item) {
  return {
    symbol:            item.symbol ?? '',
    normalizedSymbol:  item.normalizedSymbol ?? item.symbol ?? '',
    liveTradingPrice:  Number(item.liveTradingPrice ?? item.markPrice ?? item.lastPrice ?? item.indexPrice ?? 0),
    // Keep originals for resolveTradingPrice fallback
    markPrice:         Number(item.markPrice  ?? 0),
    lastPrice:         Number(item.lastPrice  ?? 0),
    indexPrice:        Number(item.indexPrice ?? 0),
    change24h:         Number(item.change24h  ?? item.priceChangePercent ?? 0),
    volume24h:         Number(item.volume24h  ?? item.volume ?? 0),
  };
}