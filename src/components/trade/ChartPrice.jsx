/**
 * ChartPrice — Hard-locked trading price display
 *
 * This component ensures the chart header price ONLY comes from:
 *   1. Mark price (Orderly)
 *   2. Last traded price (Orderly)
 *   3. Index price (Orderly)
 *
 * NEVER: market cap, token metadata, or MarketDataProvider fallback
 */

import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTicker } from '../../hooks/useOrderlyMarket';
import { toBaseSymbol } from '../../services/symbolResolver';
import { resolveTradingPrice, priceSourceLabel } from '../../lib/trading/resolveTradingPrice';

function formatPrice(v) {
  if (v == null || isNaN(v) || v === 0) return '—';
  if (v >= 10000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100)   return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  return v.toFixed(6);
}

function formatChange(v) {
  if (v == null || isNaN(v)) return '—';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${Number(v).toFixed(2)}%`;
}

export default function ChartPrice({ symbol = 'BTC' }) {
  const normalizedSymbol = toBaseSymbol(symbol);
  const { ticker } = useTicker(normalizedSymbol);
  const { price, source } = resolveTradingPrice(ticker);
  const change24h = ticker?.change24h ?? 0;
  const positive = change24h >= 0;

  // AUDIT: Log the exact price source
  useEffect(() => {
    if (ticker) {
      console.log(`[CHART PRICE AUDIT] symbol="${symbol}", normalized="${normalizedSymbol}"`, {
        component: 'ChartPrice',
        ticker_markPrice: ticker.markPrice,
        ticker_lastPrice: ticker.lastPrice,
        ticker_indexPrice: ticker.indexPrice,
        ticker_change24h: ticker.change24h,
        resolved_price: price,
        resolved_source: source,
      });
    }
  }, [symbol, normalizedSymbol, ticker, price, source]);

  return (
    <div className="flex items-center justify-between">
      {/* Left: Price + Change */}
      <div className="flex items-center gap-3">
        {/* Price */}
        <div>
          <p className="text-lg font-bold text-white font-mono">${formatPrice(price)}</p>
          {/* Change + source badge */}
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatChange(change24h)}
            </div>
            {/* HARD LOCK: Visible price source badge */}
            <span
              className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{
                background: source === 'mark' ? 'rgba(0,212,170,0.15)' : source === 'last' ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
                color: source === 'mark' ? '#00d4aa' : source === 'last' ? '#3b82f6' : '#8b5cf6',
                border: source === 'mark' ? '1px solid rgba(0,212,170,0.3)' : source === 'last' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(139,92,246,0.3)',
              }}
              title={priceSourceLabel(source)}
            >
              {source.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}