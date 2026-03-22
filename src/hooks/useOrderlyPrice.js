/**
 * hooks/useOrderlyPrice.js
 *
 * Single hook for getting the canonical mark price for a trading symbol
 * from the Orderly Network ticker feed.
 *
 * Price priority (Orderly standard):
 *   1. markPrice   — used for PnL, margin, and liquidation calculations
 *   2. lastPrice   — fallback when mark is unavailable
 *   3. indexPrice  — secondary fallback
 *   0              — returned when data is unavailable/stale
 *
 * IMPORTANT: This price must NEVER be mixed with:
 *   - CoinGecko prices (token metadata)
 *   - Binance WS prices (from MarketDataProvider)
 *   - Market cap or circulating supply data
 *
 * Those are for display/portfolio context only, not for trading calculations.
 */

import { useMemo } from 'react';
import { useTicker } from './useOrderlyMarket';

/**
 * @param {string} base - base symbol, e.g. 'BTC'
 * @returns {{
 *   markPrice:  number,  // primary — always use this for order/liq math
 *   lastPrice:  number,  // for display / recent trade reference
 *   indexPrice: number,  // oracle/index price
 *   isStale:    boolean, // true if data is missing or feed is down
 * }}
 */
export function useOrderlyPrice(base) {
  const { ticker, isConnected } = useTicker(base);

  return useMemo(() => {
    const mark  = ticker?.markPrice  ?? 0;
    const last  = ticker?.lastPrice  ?? 0;
    const index = ticker?.indexPrice ?? 0;

    // Primary trading price: mark → last → index
    const markPrice = mark > 0 ? mark : last > 0 ? last : index;

    return {
      markPrice,
      lastPrice:  last,
      indexPrice: index,
      isStale:    !isConnected || markPrice === 0,
    };
  }, [ticker, isConnected]);
}