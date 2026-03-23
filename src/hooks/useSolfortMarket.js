/**
 * useSolfortMarket.js
 * React hook for live market data, symbols, and icons from SolFort API.
 * All data comes from https://solfort-api.onrender.com
 */

import { useState, useEffect, useCallback } from 'react';
import { normalizeSymbol, resolveTradingPrice } from '@/services/solfortApi';
import { fetchMarketData } from '@/services/marketDataService';

const POLL_INTERVAL = 5000; // 5s refresh

/** Full market data hook — prices, symbols, icons */
export function useSolfortMarket() {
  const [marketData, setMarketData] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [coinIcons, setCoinIcons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const data = await fetchMarketData();
      setMarketData(data);
      setSymbols(data.map(d => d.symbol).filter(Boolean));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  /** Get resolved trading price for a symbol — uses liveTradingPrice only */
  const getPriceForSymbol = useCallback((rawSymbol) => {
    if (!marketData) return { price: 0, source: 'none' };
    const base = normalizeSymbol(rawSymbol);
    const ticker = marketData.find(t => normalizeSymbol(t.symbol ?? '') === base
      || normalizeSymbol(t.normalizedSymbol ?? '') === base);
    return resolveTradingPrice(ticker);
  }, [marketData]);

  return { marketData, symbols, coinIcons, loading, error, getPriceForSymbol };
}

/** Single symbol price hook */
export function useSymbolPrice(rawSymbol) {
  const { getPriceForSymbol, loading } = useSolfortMarket();
  const resolved = getPriceForSymbol(rawSymbol);
  return { ...resolved, loading };
}