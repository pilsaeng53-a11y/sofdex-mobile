import React from 'react';
import { Lock, Shield, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';

const FEATURES = [
  'inst_feat_liquidity',
  'inst_feat_routing',
  'inst_feat_otc',
  'inst_feat_risk',
  'inst_feat_registry',
  'inst_feat_depth',
];

export default function InstitutionalGate({ onDemoApprove }) {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col px-5 pt-10 pb-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4aa]/15 to-[#3b82f6]/15 border border-[#00d4aa]/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-[#00d4aa]" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="text-[10px] text-[#00d4aa] font-black uppercase tracking-widest">{t('inst_restricted')}</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">{t('inst_gate_title')}</h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{t('inst_gate_desc')}</p>
      </div>

      {/* Feature list */}
      <div className="mb-8">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-3">{t('inst_gate_includes')}</p>
        <div className="space-y-2">
          {FEATURES.map(key => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.06)]">
              <CheckCircle className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
              <span className="text-sm text-slate-300">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <a
          href="https://solfort.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-sm font-bold text-[#0a0e1a]"
        >
          {t('inst_apply_access')}
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onDemoApprove}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[rgba(148,163,184,0.1)] text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          {t('inst_demo_preview')}
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[10px] text-slate-700">{t('inst_demo_note')}</p>
      </div>
    </div>
  );
}