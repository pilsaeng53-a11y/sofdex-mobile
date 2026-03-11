import React from 'react';
import { FileText, Shield, Landmark, AlertTriangle, ShieldCheck, Building2, Star, ChevronRight } from 'lucide-react';

const DOCS = [
  { icon: FileText, label: 'Asset Overview', desc: 'Full property description, location analysis, and asset summary', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Landmark, label: 'Legal Docs', desc: 'Title deed, ownership structure, jurisdiction documentation', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: Shield, label: 'Token Structure', desc: 'Smart contract architecture, token economics, distribution model', color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10' },
  { icon: AlertTriangle, label: 'Risk Disclosure', desc: 'Full risk factors, liquidity risks, market conditions disclosure', color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified Asset', desc: 'On-chain verified ownership', color: '#00d4aa' },
  { icon: Building2,  label: 'Audited Property', desc: 'Third-party physical audit', color: '#3b82f6' },
  { icon: Star,       label: 'Institutional Grade', desc: 'Meets institutional standards', color: '#f59e0b' },
];

export default function AssetDocuments({ property }) {
  return (
    <div className="space-y-5">
      {/* Trust badges */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trust & Verification</p>
        <div className="grid grid-cols-3 gap-2">
          {TRUST_BADGES.map((badge, i) => {
            const Icon = badge.icon;
            const active = i === 0 ? property?.verified : i === 1 ? property?.audited : property?.institutional;
            return (
              <div key={i} className={`rounded-xl p-2.5 text-center border transition-all ${
                active
                  ? 'bg-[#0d1220] border-[rgba(148,163,184,0.12)]'
                  : 'bg-[#0d1220] border-[rgba(148,163,184,0.05)] opacity-40'
              }`}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: active ? badge.color : '#475569' }} />
                <p className="text-[9px] font-bold text-slate-300 leading-tight">{badge.label}</p>
                <p className="text-[8px] text-slate-600 mt-0.5 leading-tight">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document list */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asset Documents</p>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {DOCS.map((doc, i) => {
            const Icon = doc.icon;
            return (
              <button key={i} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#1a2340] transition-colors text-left">
                <div className={`w-8 h-8 rounded-xl ${doc.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${doc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{doc.label}</p>
                  <p className="text-[11px] text-slate-500 truncate">{doc.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] font-semibold">PDF</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-600 leading-relaxed px-1">
        All documents are available to verified token holders. Tokenized real estate assets are subject to jurisdictional regulations.
        Past performance of benchmark indices does not guarantee future results.
      </p>
    </div>
  );
}