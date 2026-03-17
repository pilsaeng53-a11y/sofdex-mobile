/**
 * priceUtils.js — Centralized price formatting utilities for SOFDex.
 *
 * All price display logic lives here so every component shows
 * identical formatting for the same price value.
 *
 * Architecture rules:
 * - Never pass raw numbers to JSX directly; always use these formatters.
 * - For live prices use formatMarketPrice(price).
 * - For percentage changes use formatChange(change).
 * - Never show a stale static seed for non-crypto assets — show null/loading.
 */

/**
 * Format a market price for display.
 * @param {number|null} price
 * @param {object} opts
 * @param {string} opts.loadingText - Text to show while loading (default '—')
 * @returns {string}
 */
export function formatMarketPrice(price, { loadingText = '—' } = {}) {
  if (price == null || isNaN(price)) return loadingText;
  if (price >= 1_000_000)  return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000)      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1)          return `$${price.toFixed(2)}`;
  if (price >= 0.01)       return `$${price.toFixed(4)}`;
  if (price >= 0.0001)     return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

/**
 * Format a 24h change percentage.
 * @param {number|null} change
 * @returns {string}
 */
export function formatChange(change) {
  if (change == null || isNaN(change)) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Get the Tailwind color class for a change value.
 * @param {number|null} change
 * @returns {string}
 */
export function getChangeColor(change) {
  if (change == null) return 'text-slate-500';
  return change >= 0 ? 'text-emerald-400' : 'text-red-400';
}

/**
 * Format a large number (volume, market cap) for display.
 * @param {number|null} value
 * @returns {string}
 */
export function formatLargeNumber(value) {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3)  return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Parse a formatted volume/mcap string back to a number for sorting.
 * @param {string} str
 * @returns {number}
 */
export function parseFormattedNumber(str) {
  if (!str || str === '—') return 0;
  const s = String(str).replace(/[$,]/g, '').trim();
  if (s.endsWith('T')) return parseFloat(s) * 1e12;
  if (s.endsWith('B')) return parseFloat(s) * 1e9;
  if (s.endsWith('M')) return parseFloat(s) * 1e6;
  if (s.endsWith('K')) return parseFloat(s) * 1e3;
  return parseFloat(s) || 0;
}

/**
 * Determine if a price is "live" (non-null and non-zero).
 */
export function isPriceLive(price) {
  return price != null && !isNaN(price) && price > 0;
}

/**
 * Loading placeholder component-friendly — returns null or the value.
 * Useful for ternary display logic.
 */
export function priceOrNull(price) {
  return isPriceLive(price) ? price : null;
}