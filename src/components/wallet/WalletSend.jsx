import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ChevronDown, Zap } from 'lucide-react';
import { NETWORKS, ASSETS_BY_NETWORK, getNetworkFee } from '@/lib/walletNetworks';

export default function WalletSend({ walletAddress, balances }) {
  const [network, setNetwork] = useState('solana');
  const [selectedAsset, setSelectedAsset] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState('form'); // form, confirm, success, error
  const [error, setError] = useState('');

  const networkConfig = NETWORKS[network];
  const assets = ASSETS_BY_NETWORK[network] || [];
  const assetData = balances[selectedAsset] || { balance: 0, usdValue: 0 };
  const fee = getNetworkFee(network, 'transfer');
  const totalAmount = parseFloat(amount || 0) + fee;

  const handleMaxClick = () => {
    const maxAmount = Math.max(0, (assetData.balance || 0) - fee);
    setAmount(maxAmount.toString());
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return false;
    }
    if (parseFloat(amount) > (assetData.balance || 0)) {
      setError('Insufficient balance');
      return false;
    }
    if (!recipient || recipient.length < 10) {
      setError('Enter a valid recipient address');
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  const handleSend = async () => {
    setStep('processing');
    // Simulate transaction
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="space-y-4">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Transfer Initiated</h3>
          <p className="text-slate-400 text-sm mb-4">
            Sending {amount} {selectedAsset} to {recipient.slice(0, 6)}...{recipient.slice(-4)}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Your transaction is being processed. Check activity for status.
          </p>
          <Button
            onClick={() => {
              setStep('form');
              setAmount('');
              setRecipient('');
            }}
            className="btn-solana w-full"
          >
            New Transfer
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="glass-card p-4 rounded-2xl">
          <h3 className="font-bold text-white mb-4">Confirm Transfer</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-semibold">{amount} {selectedAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network Fee:</span>
              <span className="text-white font-semibold">{fee} {selectedAsset}</span>
            </div>
            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total:</span>
                <span className="text-teal-400 font-bold">{totalAmount.toFixed(6)} {selectedAsset}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-400 text-xs mb-1">To:</p>
              <p className="text-white font-mono text-xs break-all bg-slate-900/40 p-2 rounded">{recipient}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setStep('form')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSend}
            className="btn-solana flex-1"
          >
            Confirm Transfer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Selection */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Network</p>
        <div className="relative">
          <select
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value);
              setSelectedAsset(ASSETS_BY_NETWORK[e.target.value]?.[0]?.symbol || 'SOL');
            }}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-white appearance-none cursor-pointer"
          >
            {Object.entries(NETWORKS).map(([netId, net]) => (
              <option key={netId} value={netId} disabled={!net.active}>
                {net.name} {!net.active ? '(Coming Soon)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Asset Selection */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Asset</p>
        <div className="relative">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-white appearance-none cursor-pointer"
          >
            {assets.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} - {asset.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Amount Input */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Amount</p>
          <p className="text-xs text-slate-400">
            Available: <span className="text-teal-400 font-semibold">{(assetData.balance || 0).toFixed(6)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-slate-900/60 border-slate-700/50"
          />
          <Button
            onClick={handleMaxClick}
            variant="outline"
            className="px-4"
          >
            MAX
          </Button>
        </div>
        {amount && (
          <p className="text-xs text-slate-400 mt-2">
            ≈ ${(parseFloat(amount) * (assetData.price || 0)).toFixed(2)}
          </p>
        )}
      </div>

      {/* Recipient Input */}
      <div className="glass-card p-4 rounded-2xl">
        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Recipient Address</p>
        <Input
          type="text"
          placeholder="Paste recipient address..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="bg-slate-900/60 border-slate-700/50"
        />
      </div>

      {/* Fee Info */}
      <div className="glass-card p-3 rounded-xl text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Network Fee:</span>
          <span className="text-white">{fee} {selectedAsset}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      <Button onClick={handleConfirm} className="btn-solana w-full">
        Review Transfer
      </Button>
    </div>
  );
}