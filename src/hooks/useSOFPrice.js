/**
 * SOF Price Hook
 * 
 * RULE: Every component needing SOF price must use this hook.
 * This ensures single source of truth across the entire app.
 * 
 * Usage:
 *   const { sofPrice, change24h, volume24h, loading, error } = useSOFPrice();
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSOFPrice } from '@/services/SOFPriceService';

// Shared state across all hook instances (ensures sync)
let globalSOFPrice = null;
let globalSOFTimestamp = 0;
let globalError = null;
let subscribers = [];

const CACHE_TTL = 10 * 1000; // 10 seconds

/**
 * Subscribe to SOF price updates
 * Called by all components using the hook
 */
function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
}

/**
 * Notify all subscribers of price change
 */
function notifySubscribers() {
  subscribers.forEach(cb => cb({ sofPrice: globalSOFPrice, error: globalError }));
}

/**
 * Refresh SOF price from DEX
 */
async function refreshSOFPrice() {
  try {
    const data = await fetchSOFPrice();
    globalSOFPrice = data;
    globalSOFTimestamp = Date.now();
    globalError = null;
    notifySubscribers();
    return data;
  } catch (err) {
    globalError = err;
    notifySubscribers();
    throw err;
  }
}

/**
 * useSOFPrice Hook
 * Returns current SOF price and helpers
 * 
 * Returns: {
 *   sofPrice: number,          // Current SOF price in USD
 *   change24h: number,         // 24h change %
 *   volume24h: number,         // 24h volume
 *   liquidity: number,         // Pool liquidity in USD
 *   source: string,            // Data source (raydium/dexscreener)
 *   loading: boolean,          // Fetching in progress
 *   error: string|null,        // Error message if any
 *   refresh: function,         // Manual refresh function
 *   calculateOutput: function, // Swap calculation helper
 *   calculatePortfolio: function, // Portfolio valuation helper
 * }
 */
export function useSOFPrice(autoRefreshInterval = 10000) {
  const [sofData, setSOFData] = useState(() => globalSOFPrice || {
    price: null,
    change24h: 0,
    volume24h: 0,
    liquidity: 0,
    source: 'uninitialized',
    timestamp: null,
    error: null,
  });

  const [loading, setLoading] = useState(!globalSOFPrice);
  const [error, setError] = useState(globalError);
  const refreshIntervalRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    if (!globalSOFPrice || Date.now() - globalSOFTimestamp > CACHE_TTL) {
      setLoading(true);
      refreshSOFPrice()
        .then(data => {
          setSOFData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setSOFData(globalSOFPrice);
      setError(globalError);
    }

    // Subscribe to updates
    const unsubscribe = subscribe(({ sofPrice, error }) => {
      if (sofPrice) setSOFData(sofPrice);
      if (error) setError(error);
    });

    return unsubscribe;
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshSOFPrice().catch(err => console.warn('[SOF] Auto-refresh failed:', err));
      }, autoRefreshInterval);

      return () => clearInterval(refreshIntervalRef.current);
    }
  }, [autoRefreshInterval]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await refreshSOFPrice();
      setSOFData(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Swap output calculation
  const calculateOutput = useCallback((inputAmount, inputToken, outputToken) => {
    // Check if price is valid
    if (sofData.price === null || sofData.price === undefined || sofData.price <= 0) {
      return 0; // Return 0 only if no valid price
    }
    
    if (outputToken === 'SOF') {
      const output = inputAmount / sofData.price;
      return isNaN(output) ? 0 : output;
    }
    if (inputToken === 'SOF') {
      const output = inputAmount * sofData.price;
      return isNaN(output) ? 0 : output;
    }
    return inputAmount;
  }, [sofData.price]);

  // Portfolio value calculation
  const calculatePortfolio = useCallback((sofHolding) => {
    if (sofData.price === null || sofData.price === undefined || sofData.price <= 0) {
      return 0;
    }
    const value = sofHolding * sofData.price;
    return isNaN(value) ? 0 : value;
  }, [sofData.price]);

  return {
    // Price data
    sofPrice: sofData.price || null,
    change24h: sofData.change24h || 0,
    volume24h: sofData.volume24h || 0,
    liquidity: sofData.liquidity || 0,
    source: sofData.source || 'unknown',
    poolAddress: sofData.poolAddress || null,

    // State
    loading,
    error: error || sofData.error,

    // Actions
    refresh,
    calculateOutput,
    calculatePortfolio,

    // Full data (for advanced usage)
    rawData: sofData,
  };
}

export default useSOFPrice;