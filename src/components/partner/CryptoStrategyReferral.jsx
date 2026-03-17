import React, { useState } from 'react';
import { Copy, CheckCircle2, TrendingUp, BarChart3, GitBranch, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GRADE_CONFIG = {
  Green:    { commission: '10%', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', badge: '🟢' },
  Purple:   { commission: '30%', color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  badge: '🟣' },
  Gold:     { commission: '40%', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   badge: '🥇' },
  Platinum: { commission: '50%', color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/10',   border: 'border-[#00d4aa]/20',   badge: '💎' },
};

const MY_CODE = 'SOFDEX-K9QR';
const MY_LINK = 'https://sofdex.io/r/K9QR';

const SALES_METRICS = [
  { label: 'Crypto Trading Fees', vol: '$542K', comm: '$216', percent: '40%' },
  { label: 'Strategy Subscriptions', vol: '$245K', comm: '$102', percent: '42%' },
  { label: 'RWA Activity', vol: '$127K', comm: '$51', percent: '40%' },
];

const QUICK_LINKS = [
  { label: 'Downline Tree', icon: GitBranch, page: 'DownlineTree', color: '#9945ff' },
  { label: 'Commission', icon: TrendingUp, page: 'CommissionDist', color: '#00d4aa' },
  { label: 'Rank Progress', icon: 'Award', page: 'RankProgress', color: '#f59e0b' },
];

export default function CryptoStrategyReferral() {
  const [copied, setCopied] = useState(false);
  const grade = GRADE_CONFIG['Gold'];

  const handleCopy = () => {
    navigator.clipboard.writeText(MY_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Crypto / Strategy Referral</h2>
          <p className="text-xs text-slate-400 mt-0.5">Trading fees, strategy subscriptions & RWA activity</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${grade.bg} border ${grade.border}`}>
          <span className="text-base">{grade.badge}</span>
          <span className={`text-xs font-bold ${grade.color}`}>Gold</span>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
          <p className="text-sm font-bold text-white">Revenue by Source</p>
        </div>
        <div className="space-y-2">
          {SALES_METRICS.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.05)]">
              <div>
                <p className="text-xs font-semibold text-white">{m.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{m.vol} volume</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#00d4aa]">{m.comm}</p>
                <p className="text-[9px] text-slate-500">{m.percent} of volume</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-[9px] text-slate-600 mb-1">Total Volume</p>
          <p className="text-sm font-black text-white">$914K</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">This month</p>
        </div>
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-[9px] text-slate-600 mb-1">Commission</p>
          <p className="text-sm font-black text-[#00d4aa]">$369</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">40% avg rate</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-br from-[#00d4aa]/10 to-transparent rounded-2xl border border-[#00d4aa]/20 p-4">
        <p className="text-xs text-slate-400 mb-2 font-semibold">Your Crypto/Strategy Referral Code</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-[#0a0e1a] rounded-xl px-4 py-2.5 border border-[rgba(148,163,184,0.08)]">
            <p className="text-base font-black text-[#00d4aa] tracking-widest">{MY_CODE}</p>
          </div>
          <button onClick={handleCopy} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#00d4aa] text-black'}`}>
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.06)]">
          <span className="text-xs text-slate-500 truncate flex-1">{MY_LINK}</span>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] text-xs font-semibold text-slate-300 border border-[rgba(148,163,184,0.08)] flex-shrink-0">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tools</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map(item => (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all text-center space-y-2">
                <div className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center" style={{ background: `${item.color}18` }}>
                  {item.icon === 'Award' ? (
                    <span className="text-base">🏆</span>
                  ) : (
                    <div style={{ color: item.color }}>
                      {item.icon === GitBranch && <GitBranch className="w-4 h-4" />}
                      {item.icon === TrendingUp && <TrendingUp className="w-4 h-4" />}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-300">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}