/**
 * resolveTradingPrice.js
 *
 * Single source of truth for resolving the canonical trading price
 * from an Orderly ticker object.
 *
 * Priority (Orderly standard):
 *   1. markPrice   — used for PnL, margin, liquidation
 *   2. lastPrice   — last traded price / 24h close
 *   3. indexPrice  — oracle/index price
 *
 * FORBIDDEN inputs:
 *   - CoinGecko / Binance prices
 *   - MarketDataProvider asset.price
 *   - Market cap or token metadata
 *
 * These are for portfolio / metadata display only, never for trading UI.
 */

/**
 * @param {object|null} ticker — Orderly ticker OR SolFort API market data object
 * @returns {{ price: number, source: 'live'|'mark'|'last'|'index'|'none' }}
 *
 * Priority: liveTradingPrice → markPrice → lastPrice → indexPrice
 * FORBIDDEN: marketCap, fdv, summaryPrice, metadataPrice, tokenPrice
 * If no valid trading price exists, returns price=0, source='none'. Never falls back to market cap.
 */
export function resolveTradingPrice(ticker) {
  if (!ticker) return { price: 0, source: 'none' };

  const live  = Number(ticker.liveTradingPrice ?? 0);
  const mark  = Number(ticker.markPrice        ?? 0);
  const last  = Number(ticker.lastPrice        ?? 0);
  const index = Number(ticker.indexPrice       ?? 0);

  if (live  > 0) return { price: live,  source: 'live'  };
  if (mark  > 0) return { price: mark,  source: 'mark'  };
  if (last  > 0) return { price: last,  source: 'last'  };
  if (index > 0) return { price: index, source: 'index' };
  return           { price: 0,     source: 'none'  };
}

/** Source label for debug badge */
export function priceSourceLabel(source) {
  return {
    mark:  'PRICE SOURCE: MARK',
    last:  'PRICE SOURCE: LAST',
    index: 'PRICE SOURCE: INDEX',
    none:  'PRICE SOURCE: NONE',
  }[source] ?? 'PRICE SOURCE: UNKNOWN';
}