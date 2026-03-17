import React from 'react';
import { useWallet } from '@/components/shared/WalletContext';
import { Activity, Wallet, AlertCircle } from 'lucide-react';
import WalletActivity from '@/components/wallet/WalletActivity';

export default function ActivityPage() {
  const { isConnected, address, requireWallet } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 border border-[#00d4aa]/20 flex items-center justify-center mb-6">
          <Activity className="w-9 h-9 text-[#00d4aa]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Transaction Activity</h1>
        <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
          Connect your wallet to view your transaction history and activity.
        </p>
        <button
          onClick={() => requireWallet()}
          className="w-full max-w-xs py-4 rounded-2xl gradient-teal text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-[#00d4aa]/20">
          <Wallet className="w-4 h-4" /> Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Transaction Activity</h1>
      </div>

      {/* Activity Feed */}
      <div className="px-4">
        <WalletActivity walletAddress={address} />
      </div>
    </div>
  );
}