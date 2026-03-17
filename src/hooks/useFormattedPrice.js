import { useCurrency } from '../components/shared/CurrencyContext';
import { formatPrice, formatPriceCompact } from '@/lib/currencyUtils';

/**
 * Hook to easily format prices with current display currency
 * @param {number} price - USD price to format
 * @param {boolean} compact - Use compact format (B, M, K suffix)
 * @returns {string} Formatted price string
 */
export const useFormattedPrice = (price, compact = false) => {
  const { displayCurrency, exchangeRates } = useCurrency();

  if (compact) {
    return formatPriceCompact(price, displayCurrency, exchangeRates);
  }

  return formatPrice(price, displayCurrency, exchangeRates);
};

/**
 * Hook to get current display currency and exchange rates
 * @returns {object} { displayCurrency, exchangeRates }
 */
export const useCurrencyData = () => {
  const { displayCurrency, exchangeRates } = useCurrency();
  return { displayCurrency, exchangeRates };
};