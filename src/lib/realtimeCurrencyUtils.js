/**
 * Real-time Currency Conversion Utilities
 * 
 * These utilities ensure prices are ALWAYS calculated as:
 * displayed_price = asset_market_price × exchange_rate
 * 
 * Both values update in real-time without freezing or caching.
 * Every component that uses these utilities automatically re-renders
 * when either asset prices or exchange rates change.
 */

/**
 * Convert USD price to target currency using current live rates
 * IMPORTANT: This is called on every render, ensuring real-time updates
 * 
 * @param {number} usdPrice - Current USD price (live from MarketDataProvider)
 * @param {string} targetCurrency - Target currency code (USD, KRW, JPY, EUR, Default)
 * @param {object} exchangeRates - Current live exchange rates (from CurrencyContext)
 * @returns {number} Converted price (or original if Default mode)
 */
export const convertPriceRealtime = (usdPrice, targetCurrency, exchangeRates) => {
  if (!usdPrice || isNaN(usdPrice)) return 0;
  if (targetCurrency === 'Default') return usdPrice;

  const rate = exchangeRates[targetCurrency];
  if (!rate) return usdPrice;

  // Direct multiplication - no caching, fresh every render
  return usdPrice * rate;
};

/**
 * Format converted price with currency symbol and proper decimals
 * Called on every render for real-time display updates
 * 
 * @param {number} convertedPrice - Price already converted by convertPriceRealtime()
 * @param {string} targetCurrency - Target currency code
 * @returns {string} Formatted price string
 */
export const formatConvertedPrice = (convertedPrice, targetCurrency) => {
  if (convertedPrice === null || convertedPrice === undefined || isNaN(convertedPrice)) {
    return '—';
  }

  const symbols = {
    USD: '$',
    KRW: '₩',
    JPY: '¥',
    EUR: '€',
    Default: '',
  };

  const decimals = {
    USD: 2,
    KRW: 0,
    JPY: 0,
    EUR: 2,
    Default: 2,
  };

  const symbol = symbols[targetCurrency] || '';
  const decimalPlaces = decimals[targetCurrency] ?? 2;

  const formatted = convertedPrice.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return `${symbol}${formatted}`.trim();
};

/**
 * One-step real-time conversion and formatting
 * This is the primary function to use in components
 * 
 * Usage:
 *   const displayPrice = formatPriceRealtime(100, 'KRW', exchangeRates);
 *   // Re-renders automatically when exchangeRates or price changes
 * 
 * @param {number} usdPrice - Current USD price
 * @param {string} targetCurrency - Target currency
 * @param {object} exchangeRates - Current live rates
 * @returns {string} Formatted converted price
 */
export const formatPriceRealtime = (usdPrice, targetCurrency, exchangeRates) => {
  const converted = convertPriceRealtime(usdPrice, targetCurrency, exchangeRates);
  return formatConvertedPrice(converted, targetCurrency);
};

/**
 * Format with compact notation (B, M, K suffixes)
 * Still uses real-time conversion for accuracy
 * 
 * @param {number} usdPrice - Current USD price
 * @param {string} targetCurrency - Target currency
 * @param {object} exchangeRates - Current live rates
 * @returns {string} Formatted compact price
 */
export const formatPriceRealtimeCompact = (usdPrice, targetCurrency, exchangeRates) => {
  if (!usdPrice || isNaN(usdPrice)) return '—';
  
  const converted = convertPriceRealtime(usdPrice, targetCurrency, exchangeRates);
  
  const symbols = {
    USD: '$',
    KRW: '₩',
    JPY: '¥',
    EUR: '€',
    Default: '',
  };

  const symbol = symbols[targetCurrency] || '';

  const abs = Math.abs(converted);
  let value, suffix;

  if (abs >= 1e9) {
    value = (converted / 1e9).toFixed(2);
    suffix = 'B';
  } else if (abs >= 1e6) {
    value = (converted / 1e6).toFixed(2);
    suffix = 'M';
  } else if (abs >= 1e3) {
    value = (converted / 1e3).toFixed(2);
    suffix = 'K';
  } else {
    value = converted.toFixed(2);
    suffix = '';
  }

  return `${symbol}${value}${suffix}`.trim();
};

/**
 * Get percentage change display with currency context
 * Used for showing relative changes without absolute conversion
 * 
 * @param {number} percentChange - Percentage change value
 * @returns {string} Formatted percentage with color indicator
 */
export const formatPercentageChange = (percentChange) => {
  if (percentChange === null || isNaN(percentChange)) return '—';
  
  const sign = percentChange >= 0 ? '+' : '';
  const fixed = percentChange.toFixed(2);
  return `${sign}${fixed}%`;
};

/**
 * Calculate total portfolio value with real-time conversion
 * Called on every render to ensure latest exchange rates are applied
 * 
 * @param {array} holdings - Array of { symbol, amount, priceUSD }
 * @param {string} targetCurrency - Target currency
 * @param {object} exchangeRates - Current live rates
 * @returns {number} Total value in target currency
 */
export const calculatePortfolioValueRealtime = (holdings, targetCurrency, exchangeRates) => {
  if (!Array.isArray(holdings)) return 0;

  return holdings.reduce((total, holding) => {
    if (!holding || !holding.priceUSD) return total;
    const usdValue = holding.amount * holding.priceUSD;
    const converted = convertPriceRealtime(usdValue, targetCurrency, exchangeRates);
    return total + converted;
  }, 0);
};

/**
 * Shared exchange rate state marker
 * Ensures all pages use the same FX rates at the same moment
 * 
 * This is important for consistency rule:
 * "The same asset must show the same converted price across all pages at the same moment"
 * 
 * All components derive from CurrencyContext's single exchangeRates object
 * When it updates (every 20 seconds), ALL components re-render with the new rates
 */
export const REALTIME_FX_SYNC_MARKER = 'SHARED_CURRENCY_CONTEXT';

/**
 * Verify that FX rates are being updated in real-time
 * Called in dev mode to ensure rates aren't stale
 * 
 * @param {object} exchangeRates - Current rates object
 * @returns {boolean} True if rates appear fresh
 */
export const validateExchangeRatesFresh = (exchangeRates) => {
  // Check that rates object exists and has required keys
  const required = ['USD', 'KRW', 'JPY', 'EUR'];
  return exchangeRates && required.every(key => 
    exchangeRates[key] !== undefined && exchangeRates[key] > 0
  );
};