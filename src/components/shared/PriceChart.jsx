/**
 * PriceChart — unified market price chart component.
 *
 * RULE: Always displays real market price. Never market cap. Never fake data.
 *
 * Delegates to TradingViewChart (candlestick, BINANCE/NASDAQ/etc. feed).
 * For illiquid RWA with no public feed, TradingViewChart shows a
 * "Valuation Model" notice — never a market cap chart.
 *
 * Props:
 *   symbol   (string) — SOFDex asset symbol, e.g. "BTC", "SOL", "AAPLx"
 *   height   (number) — chart height in px (default 280)
 *   basePrice / positive — accepted but IGNORED (legacy compat, removed fake data)
 */
import React from 'react';
import TradingViewChart from '../trade/TradingViewChart.jsx';

export default function PriceChart({ symbol = 'BTC', height = 280 }) {
  return <TradingViewChart symbol={symbol} height={height} />;
}