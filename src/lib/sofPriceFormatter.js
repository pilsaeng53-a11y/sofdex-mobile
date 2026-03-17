/**
 * SOF Price Formatting Utilities
 * 
 * Consistent formatting for SOF prices across the entire app.
 * Handles both USD base prices and display-currency converted values.
 */

const CURRENCY_SYMBOLS = {
  'USD': '$',
  'KRW': '₩',
  'JPY': '¥',
  'EUR': '€',
  'Default': '$',
};

/**
 * Format SOF price for display
 * 
 * @param {number} price - The price value to format
 * @param {string} currency - Currency code (USD, KRW, JPY, EUR, Default)
 * @returns {string} Formatted price string
 */
export function formatSOFPrice(price, currency = 'USD') {
  if (price === null || price === undefined || price <= 0) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (isNaN(price)) {
    return '—';
  }

  // Currency-specific formatting
  switch (currency) {
    case 'KRW':
      // Korean Won: ₩1,234,567 (no decimals)
      return `${symbol}${Math.round(price).toLocaleString()}`;

    case 'JPY':
      // Japanese Yen: ¥1,234 (no decimals)
      return `${symbol}${Math.round(price).toLocaleString()}`;

    case 'EUR':
      // Euro: €3.76
      const decimals = price < 0.01 ? 8 : price < 1 ? 6 : 4;
      return `${symbol}${price.toFixed(decimals)}`;

    case 'USD':
    case 'Default':
    default:
      // USD: $3.76
      const usdDecimals = price < 0.01 ? 8 : price < 1 ? 6 : 4;
      return `${symbol}${price.toFixed(usdDecimals)}`;
  }
}

/**
 * Format SOF portfolio value for display
 * 
 * @param {number} value - The portfolio value
 * @param {string} currency - Currency code
 * @returns {string} Formatted value
 */
export function formatSOFPortfolioValue(value, currency = 'USD') {
  if (value === null || value === undefined || value <= 0) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (isNaN(value)) {
    return '—';
  }

  // Large values: use K/M/B suffix
  if (value >= 1e9) {
    return `${symbol}${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${symbol}${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${symbol}${(value / 1e3).toFixed(2)}K`;
  }

  return formatSOFPrice(value, currency);
}

/**
 * Format SOF 24h volume for display
 * 
 * @param {number} volume - Volume in USD
 * @param {string} currency - Currency code
 * @returns {string} Formatted volume
 */
export function formatSOFVolume(volume, currency = 'USD') {
  if (volume === null || volume === undefined || volume <= 0) {
    return '—';
  }

  if (isNaN(volume)) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Always show in M (millions) for volume
  if (volume >= 1e6) {
    return `${symbol}${(volume / 1e6).toFixed(2)}M`;
  }
  if (volume >= 1e3) {
    return `${symbol}${(volume / 1e3).toFixed(2)}K`;
  }

  return `${symbol}${volume.toFixed(2)}`;
}

/**
 * Format SOF liquidity for display
 * 
 * @param {number} liquidity - Liquidity in USD
 * @param {string} currency - Currency code
 * @returns {string} Formatted liquidity
 */
export function formatSOFLiquidity(liquidity, currency = 'USD') {
  if (liquidity === null || liquidity === undefined || liquidity <= 0) {
    return '—';
  }

  if (isNaN(liquidity)) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Always show in M (millions) for liquidity
  if (liquidity >= 1e6) {
    return `${symbol}${(liquidity / 1e6).toFixed(2)}M`;
  }
  if (liquidity >= 1e3) {
    return `${symbol}${(liquidity / 1e3).toFixed(2)}K`;
  }

  return `${symbol}${liquidity.toFixed(2)}`;
}

export default {
  formatSOFPrice,
  formatSOFPortfolioValue,
  formatSOFVolume,
  formatSOFLiquidity,
};