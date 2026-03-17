import React, { useState } from 'react';
import { Lock, Shield, CheckCircle, ExternalLink, ChevronRight, Zap, Building2, BarChart2, Globe } from 'lucide-react';

const FEATURES = [
  { icon: BarChart2, label: 'Deep Liquidity Access', desc: 'Access $22M+ aggregated order book depth across 6 venues' },
  { icon: Zap, label: 'Smart Order Routing', desc: 'AI-powered routing minimizes slippage across CEX & DEX' },
  { icon: Building2, label: 'OTC Trading Desk', desc: 'Execute block trades from $100K with tight spreads and T+0 settlement' },
  { icon: Shield, label: 'Advanced Risk Management', desc: 'Real-time portfolio risk scoring, margin alerts & drawdown controls' },
  { icon: Globe, label: 'Asset Registry & Compliance', desc: 'Institutional-grade KYC, AML screening and custody reporting' },
  { icon: Lock, label: 'Institutional Market Depth', desc: 'Level 2 order book, dark pool access, and whale flow alerts' },
];

export default function InstitutionalGate({ onDemoApprove }) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => { setApplying(false); setApplied(true); }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col px-5 pt-8 pb-8">
      {/* Hero */}
      <div className="relative text-center mb-8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 bg-gradient-to-br from-[#00d4aa]/5 via-[#3b82f6]/5 to-[#8b5cf6]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-[#00d4aa]/20 via-[#3b82f6]/15 to-[#8b5cf6]/15 border border-[#00d4aa]/25 flex items-center justify-center mx-auto mb-5 w-20 h-20">
            <Shield className="w-9 h-9 text-[#00d4aa]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-[10px] text-[#00d4aa] font-black uppercase tracking-[0.2em]">Restricted Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 leading-tight">
            Institutional<br />
            <span className="bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] bg-clip-text text-transparent">Access</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            Access advanced trading infrastructure built for professional and institutional investors.
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
          <span className="w-4 h-px bg-slate-700" />
          What's Included
          <span className="flex-1 h-px bg-slate-700" />
        </p>
        <div className="space-y-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.06)] hover:border-[#00d4aa]/15 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00d4aa]/15 transition-all">
                  <Icon className="w-3.5 h-3.5 text-[#00d4aa]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{f.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUM stats preview */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'AUM Managed', value: '$284M' },
          { label: 'Venues', value: '6 CEX/DEX' },
          { label: 'Avg Latency', value: '1.4ms' },
        ].map((s, i) => (
          <div key={i} className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.06)] text-center">
            <p className="text-sm font-black text-white">{s.value}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        {applied ? (
          <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-400/10 border border-emerald-400/25 text-sm font-bold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Application Submitted — We'll contact you within 24h
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-sm font-bold text-white shadow-lg shadow-[#00d4aa]/20 hover:shadow-[#00d4aa]/30 transition-all disabled:opacity-70"
          >
            {applying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                Apply for Institutional Access
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        )}
        <button
          onClick={onDemoApprove}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(148,163,184,0.1)] text-sm text-slate-400 hover:text-slate-200 hover:border-[rgba(148,163,184,0.2)] transition-all"
        >
          Preview Demo Dashboard
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[10px] text-slate-700">Demo mode uses simulated data only. Not financial advice.</p>
      </div>
    </div>
  );
}