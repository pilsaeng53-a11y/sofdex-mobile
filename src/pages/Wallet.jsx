import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Wallet, Send, Download, Clock, Copy, Check, ChevronDown,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Lock, Eye, EyeOff,
  QrCode, AlertCircle, Zap, Shield, RotateCw
} from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useCurrency } from '../components/shared/CurrencyContext';
import { formatPriceRealtime } from '@/lib/realtimeCurrencyUtils';
import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from '../hooks/useSolanaBalances';
import WalletTabs from '../components/wallet/WalletTabs';

// ── Supported networks ──────────────────────────────────────────────────
const NETWORKS = [
  { id: 'sol',  label: 'Solana (SPL)',        fee: '0.000005 SOL',   feeUsd: '~$0.001', time: '< 1s' },
  { id: 'erc20',label: 'Ethereum (ERC20)',     fee: '0.0018 ETH',     feeUsd: '~$6.40',  time: '~2 min' },
  { id: 'trc20',label: 'Tron (TRC20)',         fee: '1 USDT',         feeUsd: '~$1.00',  time: '~1 min' },
  { id: 'bep20',label: 'BNB Smart Chain (BEP20)', fee: '0.0003 BNB', feeUsd: '~$0.18',  time: '~30s' },
];

// ── Simple QR-code-style display (CSS grid, no external lib) ─────────────
function FakeQR({ data }) {
  const hash = data.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: 11 }, (_, r) =>
    Array.from({ length: 11 }, (_, c) => (((hash * (r + 1) * (c + 2)) % 7) < 3))
  );
  const corners = [[0,0],[0,1],[1,0],[0,9],[0,10],[1,10],[9,0],[10,0],[10,1],[9,10],[10,9],[10,10]];
  const isCorner = (r, c) => corners.some(([cr, cc]) => cr === r && cc === c);

  return (
    <div className="p-4 bg-white rounded-2xl inline-block">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(11, 1fr)', width: 110 }}>
        {grid.map((row, r) =>
          row.map((on, c) => (
            <div key={`${r}-${c}`}
              className={`w-[9px] h-[9px] rounded-sm ${on || isCorner(r,c) ? 'bg-[#0a0e1a]' : 'bg-white'}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { displayCurrency, exchangeRates } = useCurrency();
  const { isConnected, address, disconnect, requireWallet } = useWallet();
  const [showBal, setShowBal] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch real Solana balances only if connected
  const { balances, prices, loading, error } = useSolanaBalances(isConnected ? address : null);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 border border-[#00d4aa]/20 flex items-center justify-center mb-6">
          <Wallet className="w-9 h-9 text-[#00d4aa]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
          Connect your wallet to view balances, send and receive assets across multiple networks.
        </p>
        <button
          onClick={() => requireWallet()}
          className="w-full max-w-xs py-4 rounded-2xl gradient-teal text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20">
          <Wallet className="w-4 h-4" /> Connect Wallet
        </button>
        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] w-full max-w-xs">
          <Shield className="w-4 h-4 text-[#00d4aa] mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">SOFDex never stores private keys. All transactions are signed locally in your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Wallet</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Auto-refresh happens every 30s, but manual refresh forces immediate reload
              window.location.reload();
            }}
            disabled={loading}
            title="Refresh balances"
            className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 disabled:opacity-50 transition-all">
            <RotateCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowBal(!showBal)}
            className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            {showBal ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Address bar */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot flex-shrink-0" />
          <p className="text-xs font-mono text-slate-300 flex-1 truncate">{walletAddress}</p>
          <button onClick={() => copyAddress(walletAddress)}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-2.5 py-1.5 rounded-lg hover:bg-[#00d4aa]/20 transition-all flex-shrink-0">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* New Transaction System */}
      <div className="px-4">
        <WalletTabs walletAddress={walletAddress} balances={preparedBalances} />
      </div>

      {/* Overview with new transaction system below */}
      <div className="px-4 space-y-4 mb-4">
        {/* Balance tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {loading ? (
            <div className="col-span-2 glass-card rounded-2xl p-4 flex items-center gap-2 text-slate-500 text-xs">
              <RotateCw className="w-4 h-4 animate-spin" /> Loading balances...
            </div>
          ) : error ? (
            <div className="col-span-2 glass-card rounded-2xl p-4 bg-amber-400/5 border border-amber-400/20">
              <p className="text-[10px] text-amber-300">{error}</p>
            </div>
          ) : (
            <>
              {balances && [
                 { label: 'SOL',   bal: balances.SOL.balance, color: 'text-[#00d4aa]' },
                 { label: 'USDC',  bal: balances.USDC.balance, color: 'text-blue-400' },
                 { label: 'USDT',  bal: balances.USDT.balance, color: 'text-purple-400' },
                 { label: 'Total (USD)', val: (balances.SOL.value + balances.USDC.value + balances.USDT.value), color: 'text-[#00d4aa]' },
               ].map((tile, i) => (
                 <div key={i} className="glass-card rounded-2xl p-4">
                   <p className="text-[10px] text-slate-500 mb-1">{tile.label}</p>
                   <p className={`text-lg font-bold ${tile.color}`}>
                     {showBal ? (tile.val !== undefined ? formatPriceRealtime(tile.val, displayCurrency, exchangeRates) : `${tile.bal.toFixed(4)} ${tile.label}`) : '••••'}
                   </p>
                 </div>
               ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}