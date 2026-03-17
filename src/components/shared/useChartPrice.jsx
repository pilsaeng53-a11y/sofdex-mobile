/**
 * useChartPrice — THE SINGLE SOURCE OF TRUTH for all asset prices.
 *
 * Rules (permanent):
 * - Chart always shows MARKET PRICE — never market cap.
 * - Commodity RWA (Gold, Oil, Silver, S&P500, etc.) use the same live
 *   MarketDataProvider feed as crypto assets.
 * - SOF uses DexScreener live price via useSOFPrice.
 * - Static fallback from MarketData is only used while live data loads.
 * - Market cap is NEVER used as a price source anywhere in the app.
 */

import { useMarketData, COMMODITY_SYMBOLS } from './MarketDataProvider';
import { useSOFPrice } from './useSOFPrice';
import { getMarketBySymbol } from './MarketData';

export function useChartPrice(symbol) {
  const { getLiveAsset } = useMarketData();
  const sofLive = useSOFPrice();

  // Derive master price — MarketDataProvider is the single live data bus
  // for ALL assets (crypto + commodity RWA). Chart displays the same symbol
  // so price and chart are always in sync.
  let price, change24h, isLive;

  // Commodity RWA symbols that must NEVER show stale static prices —
  // their live feed is required for accurate display (chart shows ~4900+ for gold, not 3300).
  const COMMODITY_SYMBOLS = new Set(['GOLD-T', 'SILVER-T', 'CRUDE-T', 'SP500-T', 'TBILL', 'EURO-B']);

  if (symbol === 'SOF') {
    price     = sofLive.price    ?? null;
    change24h = sofLive.change24h ?? 0;
    isLive    = sofLive.price != null;
  } else {
    const live = getLiveAsset(symbol);
    if (live?.available) {
      price     = live.price;
      change24h = live.change;
      isLive    = true;
    } else if (COMMODITY_SYMBOLS.has(symbol)) {
      // Commodity RWA: return null until live data arrives.
      // This prevents the stale static seed (e.g. 3300 for gold) from ever
      // displaying while the chart already shows the real live price (~4900+).
      price     = null;
      change24h = 0;
      isLive    = false;
    } else {
      // Regular crypto — static seed is close enough while WS loads
      const base = getMarketBySymbol(symbol);
      price     = base?.price ?? null;
      change24h = base?.change ?? 0;
      isLive    = false;
    }
  }

  return {
    price,      // Master market price (never market cap)
    change24h,  // 24h % change from same live source
    chartReady: true,  // TradingView chart uses correct TV symbol via getTVSymbol
    isLive,
  };
}