import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function WalletAssets({ balances }) {
  if (!balances || Object.keys(balances).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No assets yet. Deposit to get started.</p>
      </div>
    );
  }

  // Calculate total balance
  const totalUSD = Object.values(balances).reduce((sum, asset) => sum + (asset.usdValue || 0), 0);

  // Sort by USD value
  const sortedAssets = Object.entries(balances).sort(([, a], [, b]) => (b.usdValue || 0) - (a.usdValue || 0));

  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-1">Total Balance</p>
        <h2 className="text-2xl font-bold text-white">${totalUSD.toFixed(2)}</h2>
        <p className="text-xs text-slate-500 mt-1">in {Object.keys(balances).length} assets</p>
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        {sortedAssets.map(([symbol, data]) => (
          <div key={symbol} className="glass-card p-3 rounded-xl flex items-center justify-between hover:bg-slate-800/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-bold text-teal-400">
                {symbol[0]}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{symbol}</p>
                <p className="text-xs text-slate-400">{data.balance?.toFixed(6) || '0.000000'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white text-sm">${(data.usdValue || 0).toFixed(2)}</p>
              <p className={`text-xs flex items-center justify-end gap-1 ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.change24h || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}