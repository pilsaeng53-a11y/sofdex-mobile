import React, { useState } from 'react';
import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from '../hooks/useSolanaBalances';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { useLang } from '../components/shared/LanguageContext';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Portfolio() {
  const { isConnected, address, shortAddress } = useWallet();
  const { balances, prices, loading } = useSolanaBalances(isConnected ? address : null);
  const { getLiveAsset } = useMarketData();
  const { t } = useLang();
  const [showBalances, setShowBalances] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  if (!isConnected) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Portfolio Not Available</h2>
          <p className="text-sm text-slate-400 mb-6">Connect your wallet to view your portfolio and holdings.</p>
          <Link to={createPageUrl('Wallet')}>
            <button className="btn-solana px-6 py-2 text-sm rounded-xl">Connect Wallet</button>
          </Link>
        </div>
      </div>
    );
  }



  if (!balances) {
    if (error) {
      return (
        <div className="px-4 py-8 max-w-lg mx-auto">
          <div className="glass-card rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Unable to Load Balances</p>
              <p className="text-xs text-slate-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 font-semibold">
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Still loading
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center py-12">
          <RotateCw className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const totalValue = balances.SOL.value + balances.USDC.value + balances.USDT.value + (balances.SOF?.value || 0);
  const assets = [
    { symbol: 'SOL', name: 'Solana', balance: balances.SOL.balance, value: balances.SOL.value, price: prices.SOL },
    { symbol: 'USDC', name: 'USD Coin', balance: balances.USDC.balance, value: balances.USDC.value, price: prices.USDC },
    { symbol: 'USDT', name: 'Tether', balance: balances.USDT.balance, value: balances.USDT.value, price: prices.USDT },
    { symbol: 'SOF', name: 'SOFDex', balance: balances.SOF?.balance || 0, value: balances.SOF?.value || 0, price: prices.SOF },
  ].filter(a => a.balance > 0);

  const btcData = getLiveAsset('BTC');
  const ethData = getLiveAsset('ETH');
  const change24h = btcData.available ? btcData.change : 0;
  const changeColor = change24h > 0 ? 'text-green-400' : change24h < 0 ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-20">
      {/* Account Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20">
            {showBalances ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Account: <code className="font-mono text-[#00d4aa]">{shortAddress}</code></span>
        </div>
      </div>

      {/* Total Value */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Portfolio Value</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold num-large ${showBalances ? 'text-[#00d4aa]' : 'text-slate-400'}`}>
              {showBalances ? `$${totalValue.toFixed(2)}` : '••••••••'}
            </p>
            <span className={`text-sm font-semibold ${changeColor}`}>
              {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#05070d] rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 mb-0.5">Assets</p>
            <p className="text-sm font-bold text-white">{assets.length}</p>
          </div>
          <div className="bg-[#05070d] rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 mb-0.5">Network</p>
            <p className="text-sm font-bold text-[#00d4aa]">Solana</p>
          </div>
          <div className="bg-[#05070d] rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 mb-0.5">Largest</p>
            <p className="text-sm font-bold text-white">{assets[0]?.symbol || '—'}</p>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assets (Solana)</p>
          <span className="text-[10px] text-slate-500">{assets.length} tokens</span>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {assets.map((asset) => {
            const percentage = totalValue > 0 ? ((asset.value / totalValue) * 100).toFixed(1) : 0;
            return (
              <div key={asset.symbol} className="p-4 flex items-center gap-3 hover:bg-[#151c2e]/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#1a2340] flex items-center justify-center text-xs font-bold text-[#00d4aa] flex-shrink-0">
                  {asset.symbol.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                    <span className="text-[9px] text-slate-500">{asset.name}</span>
                  </div>
                  <div className="w-full bg-[#05070d] rounded-full h-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {showBalances ? asset.balance.toFixed(4) : '••••'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {showBalances ? `$${asset.value.toFixed(2)} (${percentage}%)` : '••••'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {assets.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-400">No holdings on Solana network</p>
            <Link to={createPageUrl('Swap')} className="mt-3 inline-block">
              <button className="text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 font-semibold">Start Trading →</button>
            </Link>
          </div>
        )}
      </div>

      {/* Asset Prices Reference */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Market Prices</p>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {[
            { symbol: 'SOL', price: prices.SOL, name: 'Solana' },
            { symbol: 'USDC', price: prices.USDC, name: 'USD Coin' },
            { symbol: 'USDT', price: prices.USDT, name: 'Tether' },
          ].map((item) => (
            <div key={item.symbol} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{item.symbol}</p>
                <p className="text-[10px] text-slate-500">{item.name}</p>
              </div>
              <p className="text-xs font-semibold text-[#00d4aa]">${item.price > 0 ? item.price.toFixed(2) : 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl('Wallet')}>
            <button className="w-full glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#00d4aa]/30 transition-all">
              <ArrowDownLeft className="w-5 h-5 text-[#00d4aa]" />
              <span className="text-xs font-semibold text-white">Receive</span>
            </button>
          </Link>
          <Link to={createPageUrl('Wallet')}>
            <button className="w-full glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#00d4aa]/30 transition-all">
              <ArrowUpRight className="w-5 h-5 text-[#00d4aa]" />
              <span className="text-xs font-semibold text-white">Send</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Network Info (future multi-network) */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Status</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Solana</span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-green-400">Active</span>
            </span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">Ethereum</span>
            <span className="text-xs font-semibold text-slate-500">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">Tron</span>
            <span className="text-xs font-semibold text-slate-500">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">BNB Chain</span>
            <span className="text-xs font-semibold text-slate-500">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}