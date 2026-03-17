import React, { useState } from 'react';
import { Wallet, X, Shield, ExternalLink, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { useWallet } from './WalletContext';
import { AnimatePresence, motion } from 'framer-motion';

const WALLETS = [
  {
    name: 'Phantom',
    key: 'phantom',
    icon: '/phantom-icon.png',
    fallbackEmoji: '👻',
    color: 'from-[#AB9FF2] to-[#7B61FF]',
    borderColor: 'rgba(171,159,242,0.25)',
    glowColor: 'rgba(171,159,242,0.12)',
    installUrl: 'https://phantom.app',
    description: 'The most popular Solana wallet',
  },
  {
    name: 'Solflare',
    key: 'solflare',
    icon: '/solflare-icon.png',
    fallbackEmoji: '🔥',
    color: 'from-[#FC6E21] to-[#FCA311]',
    borderColor: 'rgba(252,110,33,0.25)',
    glowColor: 'rgba(252,110,33,0.10)',
    installUrl: 'https://solflare.com',
    description: 'Solflare — native Solana wallet',
  },
  {
    name: 'Backpack',
    key: 'backpack',
    icon: '/backpack-icon.png',
    fallbackEmoji: '🎒',
    color: 'from-[#E33D46] to-[#F06449]',
    borderColor: 'rgba(227,61,70,0.25)',
    glowColor: 'rgba(227,61,70,0.10)',
    installUrl: 'https://backpack.app',
    description: 'Multi-chain wallet by Coral',
  },
];

export default function ConnectWalletModal() {
  const { showModal, setShowModal, connect, installedWallets } = useWallet();
  const [connecting, setConnecting] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async (wallet) => {
    setConnecting(wallet.name);
    setError(null);
    try {
      const addr = await connect(wallet.name);
      setSuccess(wallet.name);
      setTimeout(() => {
        setSuccess(null);
        setConnecting(null);
        setShowModal(false);
      }, 1000);
    } catch (err) {
      setConnecting(null);
      if (err.message?.includes('not installed')) {
        // Opened install page, show install hint
        setError(`${wallet.name} not detected. Install it and try again.`);
      } else if (err.message?.includes('rejected')) {
        setError('Connection cancelled.');
      } else {
        setError(err.message || 'Connection failed. Please try again.');
      }
    }
  };

  const handleClose = () => {
    if (connecting) return;
    setShowModal(false);
    setError(null);
    setSuccess(null);
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
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(12,16,30,0.99) 0%, rgba(8,11,22,1) 100%)',
              borderTop: '1px solid rgba(153,69,255,0.18)',
              borderLeft: '1px solid rgba(153,69,255,0.08)',
              borderRight: '1px solid rgba(153,69,255,0.08)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -24px 80px rgba(0,0,0,0.7), 0 -1px 0 rgba(153,69,255,0.1)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3.5 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(148,163,184,0.18)' }} />
            </div>

            <div className="px-5 pb-10 pt-3">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', boxShadow: '0 0 20px rgba(0,212,170,0.08)' }}>
                    <Wallet className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">Connect Wallet</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Access trading, portfolio & account features</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={!!connecting}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: 'rgba(21,28,46,0.8)', border: '1px solid rgba(148,163,184,0.08)' }}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl mb-4"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-[11px] text-red-300 leading-snug">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 opacity-60 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wallet list */}
              <div className="space-y-2.5 mb-5">
                {WALLETS.map(wallet => {
                  const isInstalled = !!installedWallets?.[wallet.key];
                  const isConnecting = connecting === wallet.name;
                  const isSuccess = success === wallet.name;

                  return (
                    <motion.button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet)}
                      disabled={!!connecting}
                      whileTap={!connecting ? { scale: 0.98 } : {}}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all disabled:cursor-not-allowed group"
                      style={{
                        background: isSuccess
                          ? 'rgba(34,197,94,0.06)'
                          : isConnecting
                          ? `rgba(0,0,0,0.3)`
                          : 'rgba(15,21,37,0.9)',
                        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.3)' : isConnecting ? wallet.borderColor : 'rgba(148,163,184,0.08)'}`,
                        boxShadow: isConnecting ? `0 0 20px ${wallet.glowColor}` : isSuccess ? '0 0 16px rgba(34,197,94,0.12)' : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-xl flex-shrink-0`}
                        style={{ boxShadow: isConnecting ? `0 0 16px ${wallet.glowColor}` : 'none' }}>
                        {wallet.fallbackEmoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{wallet.name}</span>
                          {isInstalled && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
                              Detected
                            </span>
                          )}
                          {!isInstalled && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                              style={{ background: 'rgba(148,163,184,0.06)', color: '#64748b', border: '1px solid rgba(148,163,184,0.08)' }}>
                              <Download className="w-2 h-2" /> Install
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{wallet.description}</p>
                      </div>

                      {/* Status icon */}
                      {isSuccess ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      ) : isConnecting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
                style={{ background: 'rgba(8,11,20,0.8)', border: '1px solid rgba(148,163,184,0.06)' }}>
                <Shield className="w-3.5 h-3.5 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  SOFDex never has access to your private keys. All transactions are signed locally in your wallet. Your keys, your crypto.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}