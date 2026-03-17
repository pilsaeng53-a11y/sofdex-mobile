/**
 * SOF Chart - DEX-Based (No TradingView)
 * 
 * RULE: SOF charts must NEVER use TradingView.
 * This component generates charts from DEX price history.
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useSOFPrice } from '@/hooks/useSOFPrice';

/**
 * Fetch SOF price history directly from exact pool address via Dexscreener
 * Pool: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
 * (Returns candles/prices over time)
 */
async function fetchSOFPriceHistory(timeframe = '1h') {
  try {
    // Exact pool address - single source of truth
    const POOL_ADDRESS = '4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS';
    
    // Dexscreener pool-based OHLCV endpoint with resolution
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${POOL_ADDRESS}?resolution=${timeframe}`
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.pair) throw new Error('Pool data not available');
    
    // Check if bars/candles exist
    const bars = data.pair.bars || data.pair.candles;
    if (!bars || bars.length === 0) {
      throw new Error('No price history available');
    }

    // Convert to chart format with validation
    return bars.map(bar => {
      const closePrice = parseFloat(bar.close);
      if (isNaN(closePrice) || closePrice <= 0) {
        return null;
      }
      
      return {
        timestamp: new Date(bar.time || bar.T).getTime(),
        time: new Date(bar.time || bar.T).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: closePrice,
        high: parseFloat(bar.high) || closePrice,
        low: parseFloat(bar.low) || closePrice,
        volume: parseFloat(bar.volume) || 0,
      };
    }).filter(d => d !== null); // Remove invalid entries
  } catch (err) {
    console.warn('[SOF Chart] Price history fetch failed:', err.message);
    return null; // Return null, not empty array, to trigger "no data" state
  }
}

export default function SOFChartDEX({ timeframe = '1h', height = 300, showVolume = false }) {
  const { sofPrice, loading, error } = useSOFPrice();
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  // Fetch price history on mount
  useEffect(() => {
    (async () => {
      setChartLoading(true);
      setChartError(null);
      
      const history = await fetchSOFPriceHistory(timeframe);
      
      if (history === null) {
        // API failed - show error, not fallback
        setChartError('No liquidity data');
        setChartData([]);
      } else if (history.length === 0) {
        // Empty response - show error
        setChartError('No price history available');
        setChartData([]);
      } else {
        setChartData(history);
      }
      
      setChartLoading(false);
    })();
  }, [timeframe]);

  if (loading || chartLoading) {
    return (
      <div 
        className="w-full bg-[#0f1525] rounded-xl border border-[rgba(148,163,184,0.08)] flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-sm text-slate-400">Loading SOF chart...</div>
      </div>
    );
  }

  if (chartError || error) {
    return (
      <div 
        className="w-full bg-[#0f1525] rounded-xl border border-[rgba(148,163,184,0.08)] flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-sm text-red-400">{chartError || error || 'No liquidity data'}</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div 
        className="w-full bg-[#0f1525] rounded-xl border border-[rgba(148,163,184,0.08)] flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-sm text-slate-400">No chart data available</div>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...chartData.map(d => d.high)) * 1.01;
  const isPositive = chartData[chartData.length - 1].price >= chartData[0].price;

  return (
    <div className="w-full bg-[#0f1525] rounded-xl border border-[rgba(148,163,184,0.08)] p-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={isPositive ? '#00d4aa' : '#ef4444'} 
                stopOpacity={0.3}
              />
              <stop 
                offset="95%" 
                stopColor={isPositive ? '#00d4aa' : '#ef4444'} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            domain={[minPrice, maxPrice]}
            stroke="#64748b" 
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
            width={45}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 21, 37, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              padding: '8px',
            }}
            labelStyle={{ color: '#f1f5f9', fontSize: '12px' }}
            formatter={(value) => `$${value.toFixed(6)}`}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={isPositive ? '#00d4aa' : '#ef4444'}
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {showVolume && (
        <div className="mt-4 pt-4 border-t border-[rgba(148,163,184,0.08)]">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '10px' }} hide />
              <YAxis stroke="#64748b" style={{ fontSize: '10px' }} width={45} />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#3b82f6" 
                fill="rgba(59, 130, 246, 0.1)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-2">Volume</p>
        </div>
      )}
    </div>
  );
}