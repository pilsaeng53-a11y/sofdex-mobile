/**
 * useCoinIcon — React hook for resolving a coin icon URL.
 *
 * Uses the bundled coinIconMapService (data/coinIconMap.js) as source of truth.
 * Returns the icon URL instantly (synchronous — no network fetch needed).
 * Completely isolated from trading price data.
 */

import { getIconForSymbol } from '../services/coinIconMapService';

export function useCoinIcon(symbol) {
  // getIconForSymbol handles all normalization (MATIC→POL, PERP_ prefix, etc.)
  // and always returns a valid URL — never null/undefined.
  return getIconForSymbol(symbol);
}