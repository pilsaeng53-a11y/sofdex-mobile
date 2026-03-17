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

const CACHE_TTL = 2 * 1000; // 2 seconds (aggressive cache for live updates)
const AUTO_REFRESH_INTERVAL = 3000; // 3 seconds - keep price very fresh

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
export function useSOFPrice(autoRefreshInterval = AUTO_REFRESH_INTERVAL) {
  const [sofData, setSOFData] = useState(() => globalSOFPrice || {
    price: null,
    priceNative: null,
    change24h: null,
    volume24h: null,
    liquidity: null,
    transactions: { buy24h: 0, sell24h: 0 },
    source: 'uninitialized',
    apiStatus: 'idle',
    timestamp: null,
    error: null,
  });

  const [loading, setLoading] = useState(!globalSOFPrice);
  const [error, setError] = useState(globalError);
  const refreshIntervalRef = useRef(null);
  const initialFetchDoneRef = useRef(false);

  // INITIAL FETCH: Get price immediately on mount
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      
      // Only fetch if cache is stale
      if (!globalSOFPrice || Date.now() - globalSOFTimestamp > CACHE_TTL) {
        setLoading(true);
        refreshSOFPrice()
          .then(data => {
            setSOFData(data);
            setLoading(false);
          })
          .catch(err => {
            console.error('[SOF Hook] Initial fetch failed:', err);
            setError(err.message || 'Failed to fetch SOF price');
            setLoading(false);
          });
      } else {
        // Use cached data
        setSOFData(globalSOFPrice);
        setError(globalError);
        setLoading(false);
      }
    }

    // Subscribe to global updates (other components may refresh too)
    const unsubscribe = subscribe(({ sofPrice, error }) => {
      if (sofPrice) setSOFData(sofPrice);
      if (error) setError(error);
    });

    return unsubscribe;
  }, []);

  // AUTO-REFRESH: Keep price live (3 second intervals)
  useEffect(() => {
    // Use provided interval or default to 3 seconds
    const interval = autoRefreshInterval || AUTO_REFRESH_INTERVAL;
    
    if (interval && interval > 0) {
      // Set initial refresh immediately after first render
      const initialTimeout = setTimeout(() => {
        refreshSOFPrice().catch(err => {
          console.warn('[SOF] Auto-refresh failed:', err.message);
        });
      }, interval);

      // Then set up recurring interval
      refreshIntervalRef.current = setInterval(() => {
        refreshSOFPrice().catch(err => {
          console.warn('[SOF] Auto-refresh failed:', err.message);
        });
      }, interval);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(refreshIntervalRef.current);
      };
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
    // Live Price Data (from Dexscreener API)
    sofPrice: sofData.price || null,
    priceNative: sofData.priceNative || null,
    change24h: sofData.change24h,
    volume24h: sofData.volume24h,
    liquidity: sofData.liquidity,
    transactions: sofData.transactions || { buy24h: 0, sell24h: 0 },
    
    // Source Info
    source: sofData.source || 'unknown',
    poolAddress: sofData.poolAddress || null,
    apiStatus: sofData.apiStatus || 'idle',

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