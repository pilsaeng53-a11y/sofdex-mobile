import React, { useState } from 'react';
import { Copy, CheckCircle2, TrendingUp, BarChart3, Share2, Globe, Zap } from 'lucide-react';

const COMMISSION_RATES = {
  base: '15%',
  volume: '20%',
  vip: '25%',
};

const MY_CODE_GM = 'SOFDEX-MT5-K9QR';
const MY_LINK_GM = 'https://sofdex.io/mt5/r/K9QR';

const SALES_METRICS_GM = [
  { label: 'Trading Fees', vol: '$412K', comm: '$62', percent: '15%' },
  { label: 'Spread Revenue', vol: '$238K', comm: '$36', percent: '15%' },
  { label: 'Funding Fees', vol: '$89K', comm: '$13', percent: '15%' },
];

export default function GlobalMarketsReferral() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MY_LINK_GM).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Global Markets Referral</h2>
          <p className="text-xs text-slate-400 mt-0.5">Forex, Commodities, Indices & Stocks (MT5-style)</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <Globe className="w-4 h-4 text-[#06b6d4]" />
          <span className="text-xs font-bold text-[#06b6d4]">Active</span>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-[#0f1a2e] rounded-2xl border border-[#06b6d4]/20 p-4">
        <p className="text-xs text-slate-400 mb-3 font-semibold">Commission Structure</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xl font-black text-white">{COMMISSION_RATES.base}</p>
            <p className="text-[9px] text-slate-500 mt-1">Base Rate</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-[#06b6d4]">{COMMISSION_RATES.volume}</p>
            <p className="text-[9px] text-slate-500 mt-1">High Volume</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-[#06b6d4]">{COMMISSION_RATES.vip}</p>
            <p className="text-[9px] text-slate-500 mt-1">VIP Partner</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#06b6d4]" />
          <p className="text-sm font-bold text-white">Revenue by Source</p>
        </div>
        <div className="space-y-2">
          {SALES_METRICS_GM.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.05)]">
              <div>
                <p className="text-xs font-semibold text-white">{m.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{m.vol} volume</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#06b6d4]">{m.comm}</p>
                <p className="text-[9px] text-slate-500">{m.percent} of volume</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-[#0f1a2e] to-[#141f3a] rounded-xl p-3 border border-[#06b6d4]/20 text-center">
          <p className="text-[9px] text-slate-600 mb-1">Total Volume</p>
          <p className="text-sm font-black text-white">$739K</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">This month</p>
        </div>
        <div className="bg-gradient-to-br from-[#0f1a2e] to-[#141f3a] rounded-xl p-3 border border-[#06b6d4]/20 text-center">
          <p className="text-[9px] text-slate-600 mb-1">Commission</p>
          <p className="text-sm font-black text-[#06b6d4]">$111</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">15% base rate</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-br from-[#06b6d4]/10 to-transparent rounded-2xl border border-[#06b6d4]/20 p-4">
        <p className="text-xs text-slate-400 mb-2 font-semibold">Your Global Markets Referral Code</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-[#0a0e1a] rounded-xl px-4 py-2.5 border border-[rgba(148,163,184,0.08)]">
            <p className="text-sm font-black text-[#06b6d4] tracking-widest">{MY_CODE_GM}</p>
          </div>
          <button onClick={handleCopy} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#06b6d4] text-black'}`}>
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.06)]">
          <span className="text-xs text-slate-500 truncate flex-1">{MY_LINK_GM}</span>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] text-xs font-semibold text-slate-300 border border-[rgba(148,163,184,0.08)] flex-shrink-0">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Available Assets</p>
        <div className="flex flex-wrap gap-1.5">
          {['Forex', 'Commodities', 'Indices', 'Stocks'].map(asset => (
            <span key={asset} className="px-2.5 py-1 rounded-lg bg-[#0a0e1a] border border-[#06b6d4]/20 text-[10px] font-semibold text-[#06b6d4]">
              {asset}
            </span>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#0a0e1a] rounded-2xl border border-[rgba(148,163,184,0.08)] p-3 flex items-start gap-2">
        <Zap className="w-4 h-4 text-[#06b6d4] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-white">Separate from Crypto/Strategy</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Global Markets tracks volume, fees, and commissions independently. Different payment terms and reporting.</p>
        </div>
      </div>
    </div>
  );
}