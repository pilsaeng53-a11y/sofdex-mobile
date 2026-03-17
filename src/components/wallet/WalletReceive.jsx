import React, { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NETWORKS } from '@/lib/walletNetworks';

export default function WalletReceive({ walletAddress }) {
  const [selectedNetwork, setSelectedNetwork] = useState('solana');
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyQR = async () => {
    // QR code generation would happen here with qrcode.react library
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const network = NETWORKS[selectedNetwork];

  return (
    <div className="space-y-4">
      {/* Network Selection */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Select Network</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(NETWORKS).map(([netId, net]) => (
            <button
              key={netId}
              onClick={() => setSelectedNetwork(netId)}
              disabled={!net.active}
              className={`p-3 rounded-xl transition-all text-sm font-semibold ${
                selectedNetwork === netId
                  ? 'bg-teal-500/20 border-2 border-teal-500 text-white'
                  : net.active
                  ? 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:border-teal-500/30'
                  : 'bg-slate-900/20 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              {net.icon} {net.name}
              {!net.active && <span className="text-xs block mt-0.5">Coming Soon</span>}
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Area */}
      <div className="glass-card p-6 rounded-2xl text-center">
        <div className="w-40 h-40 mx-auto bg-white rounded-xl p-2 flex items-center justify-center mb-4">
          <div className="text-slate-800 text-center">
            <QrCode className="w-20 h-20 mx-auto mb-2 opacity-30" />
            <p className="text-xs text-slate-600">QR Code</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">Scan to receive {network.name}</p>
      </div>

      {/* Wallet Address */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Wallet Address</p>
        <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl">
          <code className="text-xs font-mono text-teal-400 flex-1 truncate">{walletAddress}</code>
          <button
            onClick={handleCopyAddress}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Network Info */}
      <div className="glass-card p-4 rounded-2xl">
        <h3 className="font-semibold text-white mb-3">Network Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Network:</span>
            <span className="text-white font-semibold">{network.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Deposit Fee:</span>
            <span className="text-white font-semibold">Free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-green-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>Active
            </span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <p className="text-xs text-amber-200">
          ⚠️ Only send {network.name} on the {network.name} network. Sending other assets may result in loss of funds.
        </p>
      </div>
    </div>
  );
}