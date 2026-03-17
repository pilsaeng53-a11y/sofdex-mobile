import { useState, useEffect, useCallback } from 'react';
import PriceEngine from '@/services/PriceEngine';

/**
 * Hook to get real-time price from centralized Price Engine
 * 
 * Usage:
 *   const btcPrice = usePriceEngine('BTC');
 *   const { price, change24h, error } = btcPrice;
 * 
 * Returns: { symbol, price, change24h, volume24h, source, lastUpdate, error }
 */
export function usePriceEngine(symbol) {
  const [priceData, setPriceData] = useState(() => PriceEngine.getPrice(symbol));

  useEffect(() => {
    // Subscribe to global price updates
    const unsubscribe = PriceEngine.subscribeToPrices((state) => {
      setPriceData(state[symbol] || PriceEngine.getPrice(symbol));
    });

    return unsubscribe;
  }, [symbol]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await PriceEngine.updatePrice(symbol);
  }, [symbol]);

  return {
    ...priceData,
    refresh,
    formattedPrice: PriceEngine.formatPriceDisplay(symbol),
    formattedChange: PriceEngine.formatChangeDisplay(priceData.change24h),
  };
}

/**
 * Hook to get prices for multiple symbols at once
 * 
 * Usage:
 *   const prices = usePriceEngineMulti(['BTC', 'ETH', 'SOL']);
 */
export function usePriceEngineMulti(symbols) {
  const [allPrices, setAllPrices] = useState(() => {
    const result = {};
    symbols.forEach(s => {
      result[s] = PriceEngine.getPrice(s);
    });
    return result;
  });

  useEffect(() => {
    const unsubscribe = PriceEngine.subscribeToPrices((state) => {
      const updated = {};
      symbols.forEach(s => {
        updated[s] = state[s] || PriceEngine.getPrice(s);
      });
      setAllPrices(updated);
    });

    return unsubscribe;
  }, [symbols.join(',')]);

  // Batch refresh
  const refresh = useCallback(async () => {
    await PriceEngine.updatePrices(symbols);
  }, [symbols.join(',')]);

  return { prices: allPrices, refresh };
}

/**
 * Hook to auto-refresh prices on interval
 * 
 * Usage:
 *   usePriceAutoRefresh('BTC', 10000); // Refresh every 10 seconds
 */
export function usePriceAutoRefresh(symbols = [], interval = 10000) {
  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    // Initial fetch
    PriceEngine.updatePrices(symbols).catch(err => {
      console.error('[usePriceAutoRefresh] Initial fetch failed:', err);
    });

    // Set up interval
    const intervalId = setInterval(() => {
      PriceEngine.updatePrices(symbols).catch(err => {
        console.error('[usePriceAutoRefresh] Interval fetch failed:', err);
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [symbols.join(','), interval]);
}

export default usePriceEngine;