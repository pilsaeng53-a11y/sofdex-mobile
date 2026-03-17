import React from 'react';
import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from '../hooks/useSolanaBalances';
import { User, Wallet, LogOut, Copy, Check, RotateCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useState } from 'react';
import DisplayCurrencySelector from '../components/settings/DisplayCurrencySelector';
import { useCurrency } from '../components/shared/CurrencyContext';
import { formatPrice } from '@/lib/currencyUtils';

export default function Account() {
  const { isConnected, address, shortAddress, disconnect, walletName } = useWallet();
  const { balances, prices, loading } = useSolanaBalances(isConnected ? address : null);
  const { displayCurrency, exchangeRates } = useCurrency();
  const [copied, setCopied] = useState(false);

  if (!isConnected) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Account</h2>
        <p className="text-sm text-slate-400 mb-6">Connect your wallet to manage your account.</p>
        <Link to={createPageUrl('Wallet')}>
          <button className="btn-solana px-6 py-2 text-sm rounded-xl">Connect Wallet</button>
        </Link>
      </div>
    );
  }

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalValue = balances
    ? balances.SOL.value + balances.USDC.value + balances.USDT.value + (balances.SOF?.value || 0)
    : 0;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Account</h1>
        <button 
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-all border border-red-400/20">
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>

      {/* Wallet Info */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Connected Wallet</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Provider</span>
              <span className="text-xs font-semibold text-white capitalize">{walletName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Network</span>
              <span className="text-xs font-semibold text-[#00d4aa]">Solana (Mainnet)</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Wallet Address</p>
          <div className="bg-[#05070d] rounded-lg px-3 py-2.5 flex items-center gap-2">
            <code className="text-[11px] font-mono text-slate-300 flex-1 truncate">{shortAddress}</code>
            <button
              onClick={() => copyAddress(address)}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-1 rounded-lg hover:bg-[#00d4aa]/20 transition-all flex-shrink-0">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Portfolio Summary</p>
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[11px] text-slate-500 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-[#00d4aa] num-large">
              {loading ? '...' : formatPrice(totalValue, displayCurrency, exchangeRates)}
            </p>
          </div>

          {balances && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { symbol: 'SOL', balance: balances.SOL.balance, value: balances.SOL.value },
                { symbol: 'USDC', balance: balances.USDC.balance, value: balances.USDC.value },
                { symbol: 'USDT', balance: balances.USDT.balance, value: balances.USDT.value },
              ].map(asset => (
                <div key={asset.symbol} className="bg-[#05070d] rounded-lg p-2">
                  <p className="text-[9px] text-slate-500 mb-0.5">{asset.symbol}</p>
                  <p className="text-xs font-bold text-white">{asset.balance.toFixed(4)}</p>
                  <p className="text-[9px] text-[#00d4aa]">{formatPrice(asset.value, displayCurrency, exchangeRates)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Display Currency Settings */}
       <div className="space-y-2">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Settings</p>
         <DisplayCurrencySelector />
       </div>

      {/* Quick Actions */}
       <div className="space-y-2">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Quick Links</p>
        <div className="space-y-2">
          <Link to={createPageUrl('Wallet')} className="block">
            <button className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 hover:border-[#00d4aa]/30 transition-all">
              <Wallet className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Wallet</p>
                <p className="text-[10px] text-slate-500">Send, receive & manage assets</p>
              </div>
            </button>
          </Link>

          <Link to={createPageUrl('Portfolio')} className="block">
            <button className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 hover:border-[#00d4aa]/30 transition-all">
              <Wallet className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Portfolio</p>
                <p className="text-[10px] text-slate-500">View holdings & balances</p>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Security Info */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-[rgba(148,163,184,0.06)]">
        <AlertCircle className="w-4 h-4 text-[#00d4aa] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-semibold text-white mb-1">Security Notice</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            SOFDex never stores or has access to your private keys. All transactions are signed locally in your wallet.
          </p>
        </div>
      </div>

      {/* Network Info */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Status</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Solana (Active)</span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-green-400">Connected</span>
            </span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">Ethereum</span>
            <span className="text-[10px] font-semibold text-slate-500">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">Tron</span>
            <span className="text-[10px] font-semibold text-slate-500">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-xs text-slate-400">BNB Chain</span>
            <span className="text-[10px] font-semibold text-slate-500">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}