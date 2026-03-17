import React, { useState } from 'react';
import { useWallet } from '../shared/WalletContext';
import { useSolanaBalances } from '../../hooks/useSolanaBalances';
import { Eye, EyeOff, RotateCw } from 'lucide-react';

export default function BalanceSummary({ compact = false, showRefresh = true }) {
  const { isConnected, address } = useWallet();
  const { balances, prices, loading } = useSolanaBalances(isConnected ? address : null);
  const [showBal, setShowBal] = React.useState(true);

  if (!isConnected || !balances) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-slate-500">Wallet not connected</p>
      </div>
    );
  }

  const totalValue = balances.SOL.value + balances.USDC.value + balances.USDT.value;

  if (compact) {
    return (
      <div className="glass-card rounded-2xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">Total Balance</p>
          <p className={`text-lg font-bold ${showBal ? 'text-[#00d4aa]' : 'text-slate-400'}`}>
            {showBal ? `$${totalValue.toFixed(2)}` : '••••'}
          </p>
        </div>
        <button
          onClick={() => setShowBal(!showBal)}
          className="w-8 h-8 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          {showBal ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Holdings (Solana)</p>
        <button
          onClick={() => setShowBal(!showBal)}
          className="w-7 h-7 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          {showBal ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
        </button>
      </div>

      {/* Total */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 mb-1">Total Portfolio Value</p>
        <p className={`text-2xl font-bold ${showBal ? 'text-[#00d4aa]' : 'text-slate-400'}`}>
          {loading ? (
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 animate-spin" /> Loading
            </span>
          ) : showBal
            ? `$${totalValue.toFixed(2)}`
            : '••••'}
        </p>
      </div>

      {/* Asset breakdown */}
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
        {['SOL', 'USDC', 'USDT'].map((symbol) => {
          const bal = balances[symbol];
          const price = prices[symbol] || 0;
          return (
            <div key={symbol} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{symbol}</p>
                <p className="text-[10px] text-slate-500">
                  {price > 0 ? `$${price.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-white">
                  {showBal ? (bal.balance > 0 ? bal.balance.toFixed(4) : '0') : '••••'}
                </p>
                {showBal && bal.value > 0 && (
                  <p className="text-[10px] text-[#00d4aa]">≈ ${bal.value.toFixed(2)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}