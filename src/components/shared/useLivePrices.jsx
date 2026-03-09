import { useState, useEffect } from 'react';
import { getBinanceSymbol } from './symbolMap';

/**
 * Fetches live 24h ticker stats + hourly sparkline data from Binance
 * for any SOFDex symbols that map to a BINANCE: TradingView ticker.
 * Non-Binance symbols (RWA, TradFi) are marked { available: false }.
 *
 * Returns: { prices: { [sofSymbol]: LiveEntry }, loading: boolean }
 *
 * LiveEntry (available):
 *   { available: true, price: number, change: number, sparkline: number[] }
 * LiveEntry (unavailable):
 *   { available: false }
 */
export function useLivePrices(symbols) {
  const [prices, setPrices]   = useState({});
  const [loading, setLoading] = useState(true);
  const symbolsKey = symbols.join(',');

  async function fetchAll(syms) {
    const binancePairs = syms
      .map(s => ({ sof: s, bn: getBinanceSymbol(s) }))
      .filter(x => x.bn !== null);

    const result = {};

    // Mark non-Binance symbols immediately
    syms.forEach(s => {
      if (!getBinanceSymbol(s)) result[s] = { available: false };
    });

    if (binancePairs.length === 0) {
      setPrices(result);
      setLoading(false);
      return;
    }

    const bnList  = binancePairs.map(x => x.bn);
    const encoded = encodeURIComponent(JSON.stringify(bnList));

    // Batch 24h tickers + per-symbol 1h klines (sparkline) — all in parallel
    const [tickerData, ...klineResults] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encoded}`).then(r => r.json()),
      ...bnList.map(bn =>
        fetch(`https://api.binance.com/api/v3/klines?symbol=${bn}&interval=1h&limit=20`)
          .then(r => r.json())
          .catch(() => [])
      ),
    ]);

    const tickerMap = {};
    if (Array.isArray(tickerData)) {
      tickerData.forEach(t => { tickerMap[t.symbol] = t; });
    }

    binancePairs.forEach(({ sof, bn }, i) => {
      const t        = tickerMap[bn];
      const klines   = klineResults[i];
      const sparkline = Array.isArray(klines)
        ? klines.map(k => parseFloat(k[4])) // close prices
        : [];

      result[sof] = t
        ? {
            available: true,
            price:     parseFloat(t.lastPrice),
            change:    parseFloat(t.priceChangePercent),
            sparkline,
          }
        : { available: false };
    });

    setPrices(result);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll(symbols);
    const id = setInterval(() => fetchAll(symbols), 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, [symbolsKey]);

  return { prices, loading };
}