/**
 * Centralized price / number formatting for the futures terminal.
 */

/** Returns the number of decimal places appropriate for the given symbol. */
export function decimalsFor(symbol = '') {
  const s = symbol.toUpperCase().replace(/-T$|-PERP$/, '');
  if (s.includes('JPY') || s.includes('HUF') || s.includes('NOK') || s.includes('SEK')) return 3;
  if (['XRP', 'ADA', 'DOGE', 'MATIC', 'LINK', 'DOT', 'UNI'].some(x => s.includes(x))) return 4;
  if (['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'EURGBP'].some(x => s.includes(x))) return 5;
  if (['BTC', 'ETH', 'BNB', 'SOL', 'GOLD', 'XAU', 'OIL', 'WTI', 'SP500', 'NDX', 'NASDAQ', 'DAX', 'NQ', 'YM', 'ES', 'SILVER', 'XAG'].some(x => s.includes(x))) return 2;
  // Default: 2 decimals for all other symbols
  return 2;
}

/**
 * Format a price value for display.
 * @param {number|null} price
 * @param {string} symbol  — e.g. 'EURUSD-T', 'BTC-PERP'
 * @param {number|null} [override]  — force a specific decimal count
 */
export function fmtPrice(price, symbol = '', override = null) {
  if (price == null || !isFinite(price)) return '—';
  const dec = override ?? decimalsFor(symbol);
  return price.toFixed(dec);
}

/**
 * Format a PnL / currency value with sign and $ prefix.
 */
export function fmtPnl(value) {
  if (value == null || !isFinite(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

/**
 * Format dollars (no sign, always 2dp).
 */
export function fmtUsd(value) {
  if (value == null || !isFinite(value)) return '—';
  return `$${value.toFixed(2)}`;
}

/**
 * Spread in points / pips given symbol.
 */
export function fmtSpread(ask, bid, symbol = '') {
  if (!ask || !bid) return '—';
  const raw = ask - bid;
  const dec = decimalsFor(symbol) ?? 4;
  // Points = raw * 10^dec (loosely)
  const pts = raw * Math.pow(10, Math.min(dec, 4));
  return `${pts.toFixed(1)} pts`;
}