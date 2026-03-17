import React, { useState } from 'react';
import { Wallet, X, Shield, ExternalLink } from 'lucide-react';
import { useWallet } from './WalletContext';
import { AnimatePresence, motion } from 'framer-motion';

const WALLETS = [
  { name: 'Phantom',       icon: '👻', color: 'from-[#AB9FF2] to-[#7B61FF]' },
  { name: 'Backpack',      icon: '🎒', color: 'from-[#E33D46] to-[#F06449]' },
  { name: 'Solflare',      icon: '🔥', color: 'from-[#FC6E21] to-[#FCA311]' },
  { name: 'WalletConnect', icon: '🔗', color: 'from-[#3B99FC] to-[#2D7DD2]' },
];

export default function ConnectWalletModal() {
  const { showModal, setShowModal, connect } = useWallet();
  const [connecting, setConnecting] = useState(null);

  const handleConnect = (wallet) => {
    setConnecting(wallet.name);
    setTimeout(() => {
      connect(wallet.name);
      setConnecting(null);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            style={{
              background: 'rgba(10,14,26,0.98)',
              borderTop: '1px solid rgba(153,69,255,0.15)',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[rgba(148,163,184,0.2)]" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Connect Wallet</h2>
                    <p className="text-[11px] text-slate-500">Connect to access trading features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Wallet list */}
              <div className="space-y-2 mb-5">
                {WALLETS.map(wallet => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet)}
                    disabled={!!connecting}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(148,163,184,0.08)] bg-[#0f1525] hover:border-[rgba(0,212,170,0.2)] hover:bg-[#151c2e] transition-all disabled:opacity-60"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-lg flex-shrink-0`}>
                      {wallet.icon}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-white text-left">{wallet.name}</span>
                    {connecting === wallet.name ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d1220]">
                <Shield className="w-3.5 h-3.5 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  SOFDex never has access to your private keys. All transactions are signed locally in your wallet.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}