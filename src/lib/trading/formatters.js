/**
 * lib/trading/formatters.js
 *
 * Trading-specific formatters used across the order panel,
 * liquidation panel, order summary, etc.
 *
 * Rules:
 *   - Never import from market-data services here
 *   - Pure functions only — no side effects
 */

/**
 * Format a number to a fixed number of decimal places.
 * Returns '—' for null/NaN/empty.
 */
export function fmt(v, decimals = 2) {
  if (v == null || isNaN(v) || v === '') return '—';
  return Number(v).toFixed(decimals);
}

/**
 * Format a USD value with K/M suffixes.
 */
export function fmtUSD(v) {
  if (!v || isNaN(v)) return '$—';
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
}

/**
 * Format a percentage change with sign.
 * e.g. 2.5 → '+2.50%', -1.3 → '-1.30%'
 */
export function fmtPct(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

/**
 * Determine appropriate decimal places for a given price level.
 * High prices need fewer decimals; low-priced tokens need more.
 */
export function smartDecimals(price) {
  if (!price || price === 0) return 2;
  if (price >= 1000) return 2;
  if (price >= 1)    return 4;
  return 6;
}

/**
 * Format a quantity value based on its magnitude.
 * Used for base-asset quantities (e.g. 0.00045 BTC).
 */
export function fmtQty(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1000)  return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  return v.toFixed(6);
}