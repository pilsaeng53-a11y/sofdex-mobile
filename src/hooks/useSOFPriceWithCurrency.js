/**
 * SOF Price with Display Currency Conversion
 * 
 * Converts SOF base USD price to selected display currency with stable FX fallback.
 * 
 * CRITICAL RULES:
 * 1. SOF base price always comes from Dexscreener pool (USD)
 * 2. Display currency conversion is applied ON TOP of base USD price
 * 3. If FX data unavailable, fall back to USD display
 * 4. Auto-update when either SOF price or FX rates change
 * 5. No broken converted values - either show valid price or USD fallback
 */

import { useSOFPrice } from './useSOFPrice';
import { useCurrency } from '@/components/shared/CurrencyContext';
import { useCallback, useMemo } from 'react';

const CURRENCY_SYMBOLS = {
  'USD': '$',
  'KRW': '₩',
  'JPY': '¥',
  'EUR': '€',
  'Default': '$',
};

const CURRENCY_FORMATS = {
  'USD': (val) => `$${val.toFixed(val < 0.01 ? 8 : val < 1 ? 6 : 4)}`,
  'KRW': (val) => `₩${Math.round(val).toLocaleString()}`,
  'JPY': (val) => `¥${Math.round(val).toLocaleString()}`,
  'EUR': (val) => `€${val.toFixed(val < 0.01 ? 8 : val < 1 ? 6 : 4)}`,
  'Default': (val) => `$${val.toFixed(val < 0.01 ? 8 : val < 1 ? 6 : 4)}`,
};

/**
 * useSOFPriceWithCurrency
 * 
 * Returns SOF price in selected display currency with automatic FX conversion.
 * 
 * Returns: {
 *   sofPrice: number,           // USD base price (always from Dexscreener)
 *   displayPrice: number,       // Converted price in selected currency
 *   formattedPrice: string,     // Formatted display string (e.g., "$3.76" or "₩5,000")
 *   symbol: string,             // Currency symbol
 *   displayCurrency: string,    // Selected currency (USD, KRW, JPY, EUR, Default)
 *   change24h: number,          // Still in %
 *   volume24h: number,          // USD
 *   liquidity: number,          // USD
 *   loading: boolean,
 *   error: string|null,
 *   refresh: function,
 *   ... (all other useSOFPrice props)
 * }
 */
export function useSOFPriceWithCurrency() {
  // Get base SOF price from Dexscreener pool (always USD)
  const sofData = useSOFPrice();
  
  // Get display currency and FX rates
  const { displayCurrency, exchangeRates, ratesLoading } = useCurrency();
  
  // Determine which currency to use for conversion
  const activeCurrency = useMemo(() => {
    // 'Default' means use USD display format but no conversion
    if (displayCurrency === 'Default') return 'USD';
    return displayCurrency || 'USD';
  }, [displayCurrency]);
  
  // Convert SOF price to display currency
  const displayPrice = useMemo(() => {
    if (sofData.sofPrice === null || sofData.sofPrice === undefined) {
      return null;
    }
    
    // Get conversion rate
    const rate = exchangeRates[activeCurrency];
    if (!rate || rate <= 0) {
      // FX data unavailable - fall back to USD
      console.warn(`[SOF Currency] No FX rate for ${activeCurrency}, falling back to USD`);
      return sofData.sofPrice; // Return USD as fallback
    }
    
    // Apply conversion
    const converted = sofData.sofPrice * rate;
    return isNaN(converted) || converted < 0 ? null : converted;
  }, [sofData.sofPrice, activeCurrency, exchangeRates]);
  
  // Format for display
  const formattedPrice = useMemo(() => {
    if (displayPrice === null) return '—';
    
    const formatter = CURRENCY_FORMATS[activeCurrency] || CURRENCY_FORMATS['USD'];
    try {
      return formatter(displayPrice);
    } catch (e) {
      console.error('[SOF Currency] Format error:', e);
      return '—';
    }
  }, [displayPrice, activeCurrency]);
  
  // Get symbol for current currency
  const symbol = CURRENCY_SYMBOLS[activeCurrency] || '$';
  
  // Helper: calculate output with currency conversion
  const calculateOutputInDisplayCurrency = useCallback((inputAmount, inputToken, outputToken) => {
    const baseOutput = sofData.calculateOutput(inputAmount, inputToken, outputToken);
    
    if (baseOutput === 0) return 0;
    
    // If output is SOF, convert to display currency
    if (outputToken === 'SOF') {
      const rate = exchangeRates[activeCurrency] || 1;
      // Note: output is SOF tokens, not USD value
      // For display purposes, multiply displayed value by rate
      return baseOutput; // SOF amount stays the same, we just display converted USD value
    }
    
    return baseOutput;
  }, [sofData, activeCurrency, exchangeRates]);
  
  // Helper: calculate portfolio value in display currency
  const calculatePortfolioInDisplayCurrency = useCallback((sofHolding) => {
    const usdValue = sofData.calculatePortfolio(sofHolding);
    
    if (usdValue === 0) return 0;
    
    const rate = exchangeRates[activeCurrency] || 1;
    const converted = usdValue * rate;
    return isNaN(converted) ? 0 : converted;
  }, [sofData, activeCurrency, exchangeRates]);
  
  return {
    // Base USD price (from Dexscreener)
    sofPrice: sofData.sofPrice,
    priceNative: sofData.priceNative,
    
    // Display currency converted values
    displayPrice,
    formattedPrice,
    symbol,
    displayCurrency: activeCurrency,
    
    // Market data (always in USD)
    change24h: sofData.change24h,
    volume24h: sofData.volume24h,
    liquidity: sofData.liquidity,
    transactions: sofData.transactions,
    
    // Source info
    source: sofData.source,
    poolAddress: sofData.poolAddress,
    apiStatus: sofData.apiStatus,
    
    // State
    loading: sofData.loading || ratesLoading,
    error: sofData.error,
    
    // Actions
    refresh: sofData.refresh,
    calculateOutput: sofData.calculateOutput,
    calculatePortfolio: sofData.calculatePortfolio,
    calculateOutputInDisplayCurrency,
    calculatePortfolioInDisplayCurrency,
    
    // Full data
    rawData: sofData.rawData,
  };
}

export default useSOFPriceWithCurrency;