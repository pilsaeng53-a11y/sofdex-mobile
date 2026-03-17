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

import { useEffect, useState, useRef } from 'react';
import { useMarketData } from './MarketDataProvider';
import { useSOFPrice } from './useSOFPrice';
import { getMarketBySymbol } from './MarketData';

export function useChartPrice(symbol) {
  const { getLiveAsset } = useMarketData();
  const sofLive = useSOFPrice();

  // Derive master price — MarketDataProvider is the single live data bus
  // for ALL assets (crypto + commodity RWA). Chart displays the same symbol
  // so price and chart are always in sync.
  let price, change24h, isLive;

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
    } else {
      // Static seed — replaced as soon as live data arrives (never market cap)
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