import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Wallet, Check, ExternalLink, Shield, Zap, Building2, Vote, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const wallets = [
  { name: 'Phantom',       icon: '👻', desc: 'Most popular Solana wallet', color: 'from-[#AB9FF2] to-[#7B61FF]' },
  { name: 'Backpack',      icon: '🎒', desc: 'Multi-chain xNFT wallet',    color: 'from-[#E33D46] to-[#F06449]' },
  { name: 'Solflare',      icon: '🔥', desc: 'Advanced Solana wallet',     color: 'from-[#FC6E21] to-[#FCA311]' },
  { name: 'MetaMask',      icon: '🦊', desc: 'EVM & multichain wallet',    color: 'from-[#F5841F] to-[#E2761B]' },
  { name: 'Ledger',        icon: '🔒', desc: 'Hardware wallet',            color: 'from-slate-600 to-slate-700' },
  { name: 'WalletConnect', icon: '🔗', desc: 'Connect any wallet',         color: 'from-[#3B99FC] to-[#2D7DD2]' },
];

export default function WalletConnect() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(null);

  const handleConnect = (wallet) => {
    setConnecting(wallet.name);
    setTimeout(() => {
      setConnecting(null);
      setConnected(true);
      try { localStorage.setItem('sofdex_wallet_connected', '1'); } catch {}
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Connect Wallet</h1>
      </div>

      <AnimatePresence mode="wait">
        {!connected ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Icon */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center border border-[#00d4aa]/20">
                  <Wallet className="w-9 h-9 text-[#00d4aa]" />
                </div>
                <div className="absolute -inset-3 rounded-3xl border border-[#00d4aa]/10 animate-pulse" />
              </div>
            </div>

            <div className="px-4 text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Choose Your Wallet</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your Solana wallet to start trading perpetuals, RWAs, and global assets.
              </p>
            </div>

            {/* Wallet list */}
            <div className="px-4 space-y-2.5 mb-8">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet)}
                  disabled={!!connecting}
                  className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1a2340] transition-all group disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-xl shadow-lg`}>
                    {wallet.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white group-hover:text-[#00d4aa] transition-colors">{wallet.name}</p>
                    <p className="text-[11px] text-slate-500">{wallet.desc}</p>
                  </div>
                  {connecting === wallet.name ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  )}
                </button>
              ))}
            </div>

            {/* Security note */}
            <div className="px-4 pb-8">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1220]">
                <Shield className="w-4 h-4 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  SOFDex never has access to your private keys. All transactions are signed locally in your wallet.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4"
          >
            {/* Success */}
            <div className="flex justify-center py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Wallet Connected</h2>
              <p className="text-xs text-slate-500">You're ready to trade on SOFDex</p>
            </div>

            {/* Wallet info */}
            <div className="glass-card rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-slate-500 font-medium">Connected Wallet</p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> Active
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 bg-[#0d1220] rounded-xl px-3 py-2">
                <p className="text-sm font-mono text-slate-300 flex-1">7xKXtg...9mN4pQ</p>
                <button className="text-slate-500 hover:text-[#00d4aa] transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Token balances */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#0d1220] rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">SOL Balance</p>
                  <p className="text-lg font-bold text-white">24.82</p>
                  <p className="text-[10px] text-slate-500">≈ $4,648</p>
                </div>
                <div className="bg-[#0d1220] rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">USDC Balance</p>
                  <p className="text-lg font-bold text-white">12,450</p>
                  <p className="text-[10px] text-slate-500">≈ $12,450</p>
                </div>
              </div>

              {/* RWA Holdings */}
              <div className="bg-[#0d1220] rounded-xl p-3 mb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <p className="text-[10px] text-slate-500 font-semibold">RWA Holdings</p>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Manhattan Tower', symbol: 'RE-MHT-1', value: '$29,700', yield: '6.8%' },
                    { name: 'US T-Bill Token', symbol: 'TBILL',     value: '$2,506',  yield: '5.12%' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-300">{r.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400">{r.yield}</span>
                        <span className="text-[10px] text-white font-semibold">{r.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance power */}
              <div className="bg-[#0d1220] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5 text-[#00d4aa]" />
                    <p className="text-[10px] text-slate-500">Governance Power</p>
                  </div>
                  <p className="text-xs font-bold text-[#00d4aa]">1,248 SOFD</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => navigate(createPageUrl('Trade'))}
                className="flex-1 py-3.5 rounded-xl gradient-teal text-white font-bold text-sm shadow-lg shadow-[#00d4aa]/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Start Trading
              </button>
              <button
                onClick={() => navigate(createPageUrl('Portfolio'))}
                className="flex-1 py-3.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-white font-bold text-sm"
              >
                Portfolio
              </button>
            </div>
            {/* Deposit prompt */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0d1220] border border-[#00d4aa]/10">
              <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-[#00d4aa]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Deposit to start trading</p>
                <p className="text-[10px] text-slate-500">Transfer USDC or SOL to your trading account</p>
              </div>
              <button className="text-[11px] font-bold text-[#00d4aa] bg-[#00d4aa]/10 px-3 py-1.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors whitespace-nowrap">
                Deposit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}