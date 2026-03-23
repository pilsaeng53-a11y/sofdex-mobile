/**
 * useSolfortMarket.js
 * React hook for live market data, symbols, and icons from SolFort API.
 * All data comes from https://solfort-api.onrender.com
 */

import { useState, useEffect, useCallback } from 'react';
import { getMarketData, getSymbols, getCoinIcons, normalizeSymbol, resolveTradingPrice } from '@/services/solfortApi';

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
      const [market, syms, icons] = await Promise.all([
        getMarketData(),
        getSymbols(),
        getCoinIcons(),
      ]);
      setMarketData(market);
      setSymbols(Array.isArray(syms) ? syms : []);
      setCoinIcons(icons && typeof icons === 'object' ? icons : {});
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

  /** Get resolved trading price for a symbol */
  const getPriceForSymbol = useCallback((rawSymbol) => {
    if (!marketData) return { price: 0, source: 'none' };
    const base = normalizeSymbol(rawSymbol);
    // Try to find ticker in market data (support various shapes)
    const tickers = Array.isArray(marketData) ? marketData : (marketData.tickers ?? marketData.data ?? []);
    const ticker = tickers.find(t => normalizeSymbol(t.symbol ?? t.pair ?? '') === base);
    return resolveTradingPrice(ticker);
  }, [marketData]);

  /** Get icon URL for a symbol */
  const getIconUrl = useCallback((rawSymbol) => {
    const base = normalizeSymbol(rawSymbol);
    return coinIcons[base] ?? coinIcons[rawSymbol] ?? null;
  }, [coinIcons]);

  return { marketData, symbols, coinIcons, loading, error, getPriceForSymbol, getIconUrl };
}

/** Single symbol price hook */
export function useSymbolPrice(rawSymbol) {
  const { getPriceForSymbol, loading } = useSolfortMarket();
  const resolved = getPriceForSymbol(rawSymbol);
  return { ...resolved, loading };
}