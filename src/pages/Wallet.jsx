import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Wallet, Send, Download, Clock, Copy, Check, ChevronDown,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Lock, Eye, EyeOff,
  QrCode, AlertCircle, Zap, Shield
} from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useWallet } from '../components/shared/WalletContext';

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
  const { isConnected } = useWallet();
  const [walletAddress] = useState(DEMO_ADDRESS);
  const [tab, setTab] = useState('overview'); // overview | send | receive | history
  const [showBal, setShowBal] = useState(true);
  const [copied, setCopied] = useState(false);

  // Send form
  const [sendAsset, setSendAsset] = useState('USDC');
  const [sendNetwork, setSendNetwork] = useState('sol');
  const [sendAmount, setSendAmount] = useState('');
  const [sendDest, setSendDest] = useState('');
  const [sendConfirmed, setSendConfirmed] = useState(false);

  // Receive
  const [rcvAsset, setRcvAsset] = useState('USDC');
  const [rcvNetwork, setRcvNetwork] = useState('sol');

  // History filter
  const [histFilter, setHistFilter] = useState('all');

  const selectedAsset = ASSETS.find(a => a.symbol === sendAsset) || ASSETS[0];
  const selectedNetwork = NETWORKS.find(n => n.id === sendNetwork) || NETWORKS[0];
  const availableSend = selectedAsset.spot;
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
        <Link to={createPageUrl('WalletConnect')}
          className="w-full max-w-xs py-4 rounded-2xl gradient-teal text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20">
          <Wallet className="w-4 h-4" /> Connect Wallet
        </Link>
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
        <button onClick={() => setShowBal(!showBal)}
          className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          {showBal ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
        </button>
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

      {/* Tab selector */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'send',     label: 'Send',    icon: Send },
          { id: 'receive',  label: 'Receive', icon: Download },
          { id: 'history',  label: 'History', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === id ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}>
            {Icon && <Icon className="w-3.5 h-3.5" />} {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="px-4 space-y-4">
          {/* Balance tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Spot Wallet',    val: totalSpot,    color: 'text-[#00d4aa]',   prefix: '$' },
              { label: 'Futures Wallet', val: totalFutures, color: 'text-blue-400',     prefix: '$' },
              { label: 'RWA Wallet',     val: totalRWA,     color: 'text-purple-400',   prefix: '$' },
              { label: 'Locked Assets',  val: totalLocked,  color: 'text-amber-400',    prefix: '$' },
            ].map((tile, i) => (
              <div key={i} className="glass-card rounded-2xl p-4">
                <p className="text-[10px] text-slate-500 mb-1">{tile.label}</p>
                <p className={`text-lg font-bold ${tile.color}`}>
                  {showBal ? `${tile.prefix}${tile.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
                </p>
              </div>
            ))}
          </div>

          {/* Asset list */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Assets</p>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
              {ASSETS.map((asset, i) => {
                const total = asset.spot + asset.futures + asset.rwa;
                const isLocked = asset.locked > 0;
                return (
                  <div key={i} className="p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1a2340] flex items-center justify-center text-[10px] font-bold text-[#00d4aa] flex-shrink-0">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                        {isLocked && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-lg border border-amber-400/20">
                            <Lock className="w-2 h-2" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {showBal ? (total > 0 ? (total < 100 ? total.toFixed(4) : total.toLocaleString(undefined, { maximumFractionDigits: 2 })) : '—') : '••••'}
                      </p>
                      {asset.locked > 0 && showBal && (
                        <p className="text-[10px] text-amber-400">{asset.locked} locked</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button onClick={() => setTab('send')}
              className="py-3.5 rounded-2xl gradient-teal text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20">
              <Send className="w-4 h-4" /> Send
            </button>
            <button onClick={() => setTab('receive')}
              className="py-3.5 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-white font-bold text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Receive
            </button>
          </div>
        </div>
      )}

      {/* ── SEND ────────────────────────────────────────────────── */}
      {tab === 'send' && (
        <div className="px-4 space-y-3">
          {sendConfirmed ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center border border-emerald-400/20">
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-white mb-1">Transaction Submitted</p>
              <p className="text-xs text-slate-500">Your transaction has been broadcast to the network. It may take a few moments to confirm.</p>
            </div>
          ) : (
            <>
              {/* Asset selector */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASSETS.slice(0, 6).map(a => (
                    <button key={a.symbol} onClick={() => setSendAsset(a.symbol)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                        sendAsset === a.symbol
                          ? 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]'
                          : 'border-[rgba(148,163,184,0.06)] text-slate-400'
                      }`}>
                      {a.symbol}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Available (Spot)</span>
                  <span className="text-white font-semibold">
                    {availableSend < 100 ? availableSend.toFixed(4) : availableSend.toLocaleString(undefined, { maximumFractionDigits: 2 })} {sendAsset}
                  </span>
                </div>
                {selectedAsset.locked > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/5 border border-amber-400/20">
                    <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <p className="text-[10px] text-amber-400">{selectedAsset.locked} {sendAsset} is locked and cannot be transferred.</p>
                  </div>
                )}
              </div>

              {/* Network selector */}
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network</p>
                <div className="space-y-1.5">
                  {NETWORKS.map(n => (
                    <button key={n.id} onClick={() => setSendNetwork(n.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                        sendNetwork === n.id
                          ? 'border-[#00d4aa]/30 bg-[#00d4aa]/5'
                          : 'border-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.12)]'
                      }`}>
                      <div>
                        <p className={`text-xs font-semibold ${sendNetwork === n.id ? 'text-[#00d4aa]' : 'text-white'}`}>{n.label}</p>
                        <p className="text-[10px] text-slate-500">Fee: {n.fee} ({n.feeUsd})</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + destination */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transfer Details</p>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1.5">Amount</p>
                  <div className="flex items-center bg-[#0d1220] rounded-xl border border-[rgba(148,163,184,0.08)] px-3">
                    <input
                      type="number" placeholder="0.00"
                      value={sendAmount} onChange={e => setSendAmount(e.target.value)}
                      className="flex-1 bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"
                    />
                    <button onClick={() => setSendAmount(String(availableSend))}
                      className="text-[10px] font-bold text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-1 rounded-lg">MAX</button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1.5">Destination Address</p>
                  <input
                    type="text" placeholder="Wallet address"
                    value={sendDest} onChange={e => setSendDest(e.target.value)}
                    className="w-full bg-[#0d1220] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[#00d4aa]/30"
                  />
                </div>
              </div>

              {/* Fee summary */}
              {sendAmount && (
                <div className="glass-card rounded-2xl p-4 space-y-2 border border-[rgba(148,163,184,0.06)]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Summary</p>
                  {[
                    { label: 'You send',       val: `${sendAmount} ${sendAsset}` },
                    { label: 'Network fee',    val: `${selectedNetwork.fee} (${selectedNetwork.feeUsd})` },
                    { label: 'Platform fee',   val: 'Free' },
                    { label: 'Recipient gets', val: `${receiveEst} ${sendAsset}`, highlight: true },
                  ].map(({ label, val, highlight }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className={`text-[11px] font-semibold ${highlight ? 'text-[#00d4aa]' : 'text-white'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={!sendAmount || !sendDest}
                className="w-full py-4 rounded-2xl gradient-teal text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <Send className="w-4 h-4" /> Confirm & Send
              </button>
            </>
          )}
        </div>
      )}

      {/* ── RECEIVE ─────────────────────────────────────────────── */}
      {tab === 'receive' && (
        <div className="px-4 space-y-4">
          {/* Asset + Network selector */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Asset</p>
              <div className="grid grid-cols-3 gap-1.5">
                {['USDC', 'SOL', 'USDT', 'BTC', 'TBILL', 'GOLD-T'].map(sym => (
                  <button key={sym} onClick={() => setRcvAsset(sym)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      rcvAsset === sym
                        ? 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]'
                        : 'border-[rgba(148,163,184,0.06)] text-slate-400'
                    }`}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Network</p>
              <div className="grid grid-cols-2 gap-1.5">
                {NETWORKS.map(n => (
                  <button key={n.id} onClick={() => setRcvNetwork(n.id)}
                    className={`py-2 px-3 rounded-xl text-[10px] font-semibold border transition-all text-left ${
                      rcvNetwork === n.id
                        ? 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]'
                        : 'border-[rgba(148,163,184,0.06)] text-slate-400'
                    }`}>
                    {n.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* QR + address */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-[#00d4aa]">{rcvAsset}</span>
              <span>·</span>
              <span>{NETWORKS.find(n => n.id === rcvNetwork)?.label}</span>
            </div>
            <FakeQR data={walletAddress + rcvAsset + rcvNetwork} />
            <div className="w-full bg-[#0d1220] rounded-xl px-3 py-2.5 flex items-center gap-2">
              <p className="text-xs font-mono text-slate-300 flex-1 truncate">{walletAddress}</p>
              <button onClick={() => copyAddress(walletAddress)}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-2.5 py-1.5 rounded-lg hover:bg-[#00d4aa]/20 transition-all flex-shrink-0">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Only send <span className="text-white font-semibold">{rcvAsset}</span> on the <span className="text-white font-semibold">{NETWORKS.find(n=>n.id===rcvNetwork)?.label}</span> network to this address.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-400/5 border border-amber-400/20">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-300 leading-relaxed">
              Sending the wrong asset or using the wrong network may result in permanent loss of funds.
            </p>
          </div>
        </div>
      )}

      {/* ── HISTORY ─────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="px-4 space-y-3">
          <div className="flex gap-1.5">
            {[['all','All'],['send','Sent'],['receive','Received']].map(([v, l]) => (
              <button key={v} onClick={() => setHistFilter(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  histFilter === v ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'text-slate-500 border-transparent'
                }`}>{l}</button>
            ))}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
            {filteredHistory.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  tx.type === 'receive' ? 'bg-emerald-400/10' : 'bg-red-400/10'
                }`}>
                  {tx.type === 'receive'
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-white capitalize">{tx.type} {tx.asset}</p>
                    <span className={`text-xs font-bold ${tx.type === 'receive' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.amount}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1">{tx.network}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">{tx.date}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${
                      tx.status === 'completed'
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-amber-400/10 text-amber-400'
                    }`}>{tx.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">Fee: {tx.fee} · {tx.hash}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}