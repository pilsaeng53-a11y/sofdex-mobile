/**
 * useLiveMarket — single hook that provides a live-enriched market entry
 * for any SOFDex symbol.
 *
 * Returns { price, change, sparkline, available, baseAsset }
 * where baseAsset is the raw MarketData static entry (for name, mcap, etc.)
 *
 * All price/change/sparkline values come from the unified MarketDataProvider
 * (Binance WS + CoinGecko fallback). If live data is not yet available for
 * the symbol, the static fallback from MarketData.js is returned so the UI
 * always has something to show.
 */
import { useMarketData } from './MarketDataProvider';
import { getMarketBySymbol, formatPrice, formatChange } from './MarketData';

export function useLiveMarket(symbol) {
  const { getLiveAsset } = useMarketData();
  const live   = getLiveAsset(symbol);
  const base   = getMarketBySymbol(symbol);

  const price    = live.available ? live.price   : (base?.price  ?? null);
  const change   = live.available ? live.change  : (base?.change ?? 0);
  const sparkline = live.sparkline ?? null;

  return {
    available: live.available,
    price,
    change,
    sparkline,
    base,
    formattedPrice:  price  != null ? formatPrice(price)  : '—',
    formattedChange: change != null ? formatChange(change) : '—',
  };
}

/**
 * useLiveMarkets — batch version; returns a map of symbol → live-enriched entry.
 * Useful for list views (Markets page, Hot Assets, etc.).
 */
export function useLiveMarkets(symbols) {
  const { liveData, sparklines } = useMarketData();

  const result = {};
  symbols.forEach(symbol => {
    const live = liveData[symbol];
    const base = getMarketBySymbol(symbol);
    const price    = live?.available ? live.price  : (base?.price  ?? null);
    const change   = live?.available ? live.change : (base?.change ?? 0);
    const sparkline = sparklines[symbol] ?? null;
    result[symbol] = {
      available: !!live?.available,
      price, change, sparkline, base,
      formattedPrice:  price  != null ? formatPrice(price)  : '—',
      formattedChange: change != null ? formatChange(change) : '—',
    };
  });
  return result;
}