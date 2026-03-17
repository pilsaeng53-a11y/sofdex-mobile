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
import { formatPrice } from '@/lib/currencyUtils';
import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from '../hooks/useSolanaBalances';
import WalletTabs from '../components/wallet/WalletTabs';

// ── Simulated wallet state (mirrors WalletConnect page logic) ──────────────
const DEMO_ADDRESS = '7xKXtg2QzMLmE4ipAnZBmFQXE3v5bHaP9mN4pQ';

const NETWORKS = [
  { id: 'sol',  label: 'Solana (SPL)',        fee: '0.000005 SOL',   feeUsd: '~$0.001', time: '< 1s' },
  { id: 'erc20',label: 'Ethereum (ERC20)',     fee: '0.0018 ETH',     feeUsd: '~$6.40',  time: '~2 min' },
  { id: 'trc20',label: 'Tron (TRC20)',         fee: '1 USDT',         feeUsd: '~$1.00',  time: '~1 min' },
  { id: 'bep20',label: 'BNB Smart Chain (BEP20)', fee: '0.0003 BNB', feeUsd: '~$0.18',  time: '~30s' },
];

const ASSETS = [
  { symbol: 'USDC',  name: 'USD Coin',     spot: 12450.00, futures: 5000.00, rwa: 0,        locked: 0 },
  { symbol: 'SOL',   name: 'Solana',       spot: 24.82,    futures: 5.00,    rwa: 0,        locked: 2.00 },
  { symbol: 'USDT',  name: 'Tether',       spot: 3200.00,  futures: 1000.00, rwa: 0,        locked: 0 },
  { symbol: 'BTC',   name: 'Bitcoin',      spot: 0.045,    futures: 0.01,    rwa: 0,        locked: 0 },
  { symbol: 'TBILL', name: 'US T-Bill',    spot: 0,        futures: 0,       rwa: 2506.00,  locked: 2506.00 },
  { symbol: 'GOLD-T',name: 'Tokenized Gold',spot: 0,       futures: 0,       rwa: 2810.00,  locked: 0 },
];

const HISTORY = [
  { id: 1, type: 'receive', asset: 'USDC',  amount: '+5,000', network: 'Solana (SPL)',   date: '2026-03-13 14:22', status: 'completed', fee: '$0.001', hash: '4uJx…pQ8' },
  { id: 2, type: 'send',    asset: 'SOL',   amount: '-2.5',   network: 'Solana (SPL)',   date: '2026-03-12 09:05', status: 'completed', fee: '$0.001', hash: '9mAb…kL3' },
  { id: 3, type: 'send',    asset: 'USDT',  amount: '-500',   network: 'Tron (TRC20)',   date: '2026-03-10 18:44', status: 'completed', fee: '$1.00',  hash: 'TRX…92c' },
  { id: 4, type: 'receive', asset: 'BTC',   amount: '+0.045', network: 'Ethereum (ERC20)',date:'2026-03-08 11:30', status: 'completed', fee: '$6.40',  hash: '0xA1…77d' },
  { id: 5, type: 'send',    asset: 'USDC',  amount: '-1,200', network: 'BNB Chain (BEP20)',date:'2026-03-06 07:15',status: 'pending',   fee: '$0.18',  hash: '0xBB…33f' },
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
  const walletAddress = address || DEMO_ADDRESS;
  const [tab, setTab] = useState('overview');
  const [showBal, setShowBal] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch real Solana balances
  const { balances, prices, loading, error } = useSolanaBalances(isConnected ? address : null);

  // Send form
  const [sendAsset, setSendAsset] = useState('SOL');
  const [sendNetwork, setSendNetwork] = useState('sol');
  const [sendAmount, setSendAmount] = useState('');
  const [sendDest, setSendDest] = useState('');
  const [sendConfirmed, setSendConfirmed] = useState(false);

  // Receive
  const [rcvAsset, setRcvAsset] = useState('SOL');
  const [rcvNetwork, setRcvNetwork] = useState('sol');

  // Prepare balances for new transaction system
  const preparedBalances = useMemo(() => {
    if (!balances) return {};
    return Object.entries(balances).reduce((acc, [symbol, data]) => {
      acc[symbol] = {
        balance: data.balance,
        usdValue: data.value,
        price: data.price,
        change24h: Math.random() * 10 - 5, // Placeholder
      };
      return acc;
    }, {});
  }, [balances]);

  // Use real balances or fallback
  const realBalance = balances?.[sendAsset]?.balance || 0;
  const selectedAsset = ASSETS.find(a => a.symbol === sendAsset) || ASSETS[0];
  const selectedNetwork = NETWORKS.find(n => n.id === sendNetwork) || NETWORKS[0];
  const availableSend = realBalance;
  const receiveEst = parseFloat(sendAmount || 0) > 0
    ? Math.max(0, parseFloat(sendAmount) - parseFloat(selectedNetwork.feeUsd.replace('~$', ''))).toFixed(4)
    : '—';

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!sendAmount || !sendDest) return;
    setSendConfirmed(true);
    setTimeout(() => { setSendConfirmed(false); setSendAmount(''); setSendDest(''); }, 3000);
  };

  const totalSpot = ASSETS.reduce((s, a) => s + a.spot, 0);
  const totalFutures = ASSETS.reduce((s, a) => s + a.futures, 0);
  const totalRWA = ASSETS.reduce((s, a) => s + a.rwa, 0);
  const totalLocked = ASSETS.reduce((s, a) => s + a.locked, 0);

  const filteredHistory = HISTORY.filter(h =>
    histFilter === 'all' ? true : h.type === histFilter
  );

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
                { label: 'Total (USD)', val: (balances.SOL.value + balances.USDC.value + balances.USDT.value).toFixed(2), color: 'text-[#00d4aa]' },
              ].map((tile, i) => (
                <div key={i} className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] text-slate-500 mb-1">{tile.label}</p>
                  <p className={`text-lg font-bold ${tile.color}`}>
                    {showBal ? (tile.val !== undefined ? `$${parseFloat(tile.val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${tile.bal.toFixed(4)} ${tile.label}`) : '••••'}
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