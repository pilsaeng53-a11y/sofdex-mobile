/**
 * Format and convert prices based on display currency setting
 */

const CURRENCY_SYMBOLS = {
  Default: '',
  USD: '$',
  KRW: '₩',
  JPY: '¥',
  EUR: '€',
  'Crypto Native': '',
};

const CURRENCY_DECIMALS = {
  USD: 2,
  KRW: 0,
  JPY: 0,
  EUR: 2,
  Default: 2,
  'Crypto Native': 4,
};

const CURRENCY_PLACEMENT = {
  USD: 'before',
  KRW: 'before',
  JPY: 'before',
  EUR: 'before',
  Default: 'after',
  'Crypto Native': 'after',
};

/**
 * Convert a USD price to the target display currency
 * @param {number} usdPrice - Price in USD
 * @param {string} displayCurrency - Target currency ('Default', 'USD', 'KRW', 'JPY', 'EUR', 'Crypto Native')
 * @param {object} exchangeRates - Exchange rates object { USD: 1, KRW: xxx, JPY: xxx, EUR: xxx }
 * @returns {number} Converted price
 */
export const convertPrice = (usdPrice, displayCurrency, exchangeRates) => {
  if (!usdPrice || displayCurrency === 'Default' || displayCurrency === 'Crypto Native') {
    return usdPrice;
  }

  const rate = exchangeRates[displayCurrency];
  if (!rate) return usdPrice;

  return usdPrice * rate;
};

/**
 * Format a price for display with proper currency symbol and decimals
 * @param {number} price - The price to format
 * @param {string} displayCurrency - Target currency
 * @param {object} exchangeRates - Exchange rates
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted price string
 */
export const formatPrice = (
  price,
  displayCurrency = 'Default',
  exchangeRates = { USD: 1, KRW: 1300, JPY: 150, EUR: 0.92 },
  showSymbol = true
) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '—';
  }

  // Convert price if needed
  const converted = convertPrice(price, displayCurrency, exchangeRates);

  // Determine decimals
  const decimals = CURRENCY_DECIMALS[displayCurrency] || 2;

  // Format number
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!showSymbol) {
    return formatted;
  }

  // Add symbol
  const symbol = CURRENCY_SYMBOLS[displayCurrency] || '';
  const placement = CURRENCY_PLACEMENT[displayCurrency] || 'after';

  if (placement === 'before') {
    return `${symbol}${formatted}`;
  } else {
    return symbol ? `${formatted} ${symbol}` : formatted;
  }
};

/**
 * Format a large value (like market cap) with abbreviations
 */
export const formatPriceCompact = (
  price,
  displayCurrency = 'Default',
  exchangeRates = { USD: 1, KRW: 1300, JPY: 150, EUR: 0.92 },
  showSymbol = true
) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '—';
  }

  const converted = convertPrice(price, displayCurrency, exchangeRates);

  let absValue = Math.abs(converted);
  let suffix = '';

  if (absValue >= 1e9) {
    absValue = converted / 1e9;
    suffix = 'B';
  } else if (absValue >= 1e6) {
    absValue = converted / 1e6;
    suffix = 'M';
  } else if (absValue >= 1e3) {
    absValue = converted / 1e3;
    suffix = 'K';
  }

  const decimals = CURRENCY_DECIMALS[displayCurrency] || 2;
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals === 0 ? 0 : 1,
    maximumFractionDigits: decimals === 0 ? 0 : 2,
  });

  const symbol = CURRENCY_SYMBOLS[displayCurrency] || '';
  const placement = CURRENCY_PLACEMENT[displayCurrency] || 'after';

  const result = `${formatted}${suffix}`;

  if (!showSymbol) {
    return result;
  }

  if (placement === 'before') {
    return `${symbol}${result}`;
  } else {
    return symbol ? `${result} ${symbol}` : result;
  }
};

/**
 * Get currency symbol for a given display currency
 */
export const getCurrencySymbol = (displayCurrency) => {
  return CURRENCY_SYMBOLS[displayCurrency] || '';
};

/**
 * Get all supported currencies
 */
export const getSupportedCurrencies = () => [
  { value: 'Default', label: 'Default' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'Crypto Native', label: 'Crypto Native' },
];