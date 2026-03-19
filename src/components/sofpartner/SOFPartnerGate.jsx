import React from 'react';
import { Shield, Wallet, Lock } from 'lucide-react';
import { useWallet } from '@/components/shared/WalletContext';
import { useLang } from '@/components/shared/LanguageContext';

export function DisconnectedState() {
  const { requireWallet } = useWallet();
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center border border-[rgba(148,163,184,0.1)]">
        <Wallet className="w-8 h-8 text-slate-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{t('sof_gate_connect_title')}</h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
          {t('sof_gate_connect_desc')}
        </p>
      </div>
      <button
        onClick={() => requireWallet()}
        className="btn-solana px-7 py-3 text-sm font-bold rounded-xl"
      >
        {t('sof_gate_connect_btn')}
      </button>
    </div>
  );
}

export function NotApprovedState() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1a2340] flex items-center justify-center border border-[rgba(239,68,68,0.2)]">
        <Lock className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{t('sof_gate_restricted_title')}</h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
          {t('sof_gate_restricted_desc')}
        </p>
      </div>
      <div className="glass-card rounded-xl p-4 text-left space-y-2 max-w-xs w-full">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('sof_gate_how_approved')}</p>
        <p className="text-[10px] text-slate-400">{t('sof_gate_step1')}</p>
        <p className="text-[10px] text-slate-400">{t('sof_gate_step2')}</p>
        <p className="text-[10px] text-slate-400">{t('sof_gate_step3')}</p>
      </div>
      <a href="/FuturesSalesPartner" className="btn-purple px-7 py-3 text-sm font-bold rounded-xl">
        {t('sof_gate_apply_btn')} →
      </a>
    </div>
  );
}

export function CheckingState() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
      <div className="w-8 h-8 spin-glow" />
      <p className="text-xs text-slate-400">{t('sof_gate_checking')}</p>
    </div>
  );
}