import React from 'react';
import { Shield, Wallet, Lock } from 'lucide-react';
import { useWallet } from '@/components/shared/WalletContext';

// Gate: disconnected wallet
export function DisconnectedState() {
  const { requireWallet } = useWallet();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center border border-[rgba(148,163,184,0.1)]">
        <Wallet className="w-8 h-8 text-slate-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Connect Your Wallet</h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
          You must connect your approved SOF Sales Partner wallet to access this system.
        </p>
      </div>
      <button
        onClick={() => requireWallet()}
        className="btn-solana px-7 py-3 text-sm font-bold rounded-xl"
      >
        Connect Wallet
      </button>
    </div>
  );
}

// Gate: connected but not an approved partner
export function NotApprovedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center border border-[rgba(239,68,68,0.2)]">
        <Lock className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
          This wallet is not whitelisted as an approved SOF Sales Partner. Only verified sales partners can access this system.
        </p>
      </div>
      <div className="glass-card rounded-xl p-4 text-left space-y-2 max-w-xs w-full">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">How to get approved</p>
        <p className="text-[10px] text-slate-400">1. Submit a Sales Partner application</p>
        <p className="text-[10px] text-slate-400">2. Pass verification by the SolFort team</p>
        <p className="text-[10px] text-slate-400">3. Your wallet will be whitelisted upon approval</p>
      </div>
      <a
        href="/FuturesSalesPartner"
        className="btn-purple px-7 py-3 text-sm font-bold rounded-xl"
      >
        Apply for Sales Partner →
      </a>
    </div>
  );
}

// Gate: checking status
export function CheckingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
      <div className="w-8 h-8 spin-glow" />
      <p className="text-xs text-slate-400">Verifying partner access…</p>
    </div>
  );
}