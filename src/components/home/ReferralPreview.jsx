import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Users, ChevronRight, Copy } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ReferralPreview() {
  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-emerald-400" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Growth</p>
        </div>
        <Link to={createPageUrl('Referral')}>
          <span className="text-[10px] text-[#00d4aa] font-semibold flex items-center gap-0.5">
            Dashboard <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <Link to={createPageUrl('Referral')}>
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-emerald-400/10 hover:border-emerald-400/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-lg font-black text-white">12</p>
                <p className="text-[9px] text-slate-500">Invited</p>
              </div>
              <div className="text-center border-x border-[rgba(148,163,184,0.06)]">
                <p className="text-lg font-black text-emerald-400">$1,248</p>
                <p className="text-[9px] text-slate-500">Rewards</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-amber-400">Gold</p>
                <p className="text-[9px] text-slate-500">Tier</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#0d1220] rounded-xl px-3 py-2 border border-[rgba(148,163,184,0.06)]">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 font-medium">Code: </span>
                <span className="text-[10px] font-black text-[#00d4aa] tracking-wider">SOFDEX-K9QR</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Copy className="w-3 h-3" /> Copy
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}