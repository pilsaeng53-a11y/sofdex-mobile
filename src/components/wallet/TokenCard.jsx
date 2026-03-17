import React from 'react';

/**
 * Reusable token balance card component
 * Displays token symbol, balance, and USD value
 */
export default function TokenCard({ symbol, balance, price, value, showValue = true }) {
  const getTokenColor = (symbol) => {
    const colors = {
      SOL: '#00d4aa',
      USDC: '#3b82f6',
      USDT: '#8b5cf6',
      SOF: '#f59e0b',
    };
    return colors[symbol] || '#00d4aa';
  };

  return (
    <div className="glass-card rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: `${getTokenColor(symbol)}15` }}
        >
          {symbol.slice(0, 2)}
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{symbol}</p>
          <p className="text-[10px] text-slate-500">
            {price > 0 ? `$${price.toFixed(2)}/unit` : 'N/A'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-white">
          {balance > 0 ? balance.toFixed(4) : '0'}
        </p>
        {showValue && value > 0 && (
          <p className="text-[10px]" style={{ color: getTokenColor(symbol) }}>
            ≈ ${value.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}