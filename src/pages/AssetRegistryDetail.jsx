import React from 'react';
import { ChevronLeft, CheckCircle, Clock, Shield, FileText, Database, ExternalLink, Building2 } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';

const STATUS_CONFIG = {
  verified: { icon: CheckCircle, color: 'text-[#00d4aa]', bgColor: 'bg-[#00d4aa]/10', borderColor: 'border-[#00d4aa]/20', label: 'reg_status_verified' },
  pending: { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', label: 'reg_status_pending' },
};

const assetNotes = {
  'Real Estate': 'inst_note_realestate',
  'Art / Collectibles': 'inst_note_art',
  'Gold': 'inst_note_gold',
  'Commodities': 'inst_note_commodities',
  'Tokenized Stocks / ETFs': 'inst_note_stocks',
};

export default function AssetRegistryDetail({ asset, onBack }) {
  const { t } = useLang();
  const status = STATUS_CONFIG[asset.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const noteKey = assetNotes[asset.assetClass] || 'inst_note_generic';

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-3">
          <ChevronLeft className="w-4 h-4" />
          {t('reg_back_registry')}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-black text-white">{t(asset.nameKey)}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{asset.id} · {asset.assetClass}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${status.bgColor} border ${status.borderColor}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
            <span className={`text-[10px] font-bold ${status.color}`}>{t(status.label)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Key Details */}
        <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-sm font-bold text-white">{t('reg_key_details')}</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'reg_asset_class', value: asset.assetClass },
              { label: 'reg_registry_id', value: asset.id },
              { label: 'reg_token_structure', value: asset.tokenStructure },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t(row.label)}</span>
                <span className="text-xs font-medium text-white text-right max-w-[55%]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custody / Structure */}
        <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-sm font-bold text-white">{t('reg_custody_structure')}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{asset.custody}</p>
          <div className="mt-3 p-3 rounded-xl bg-[#1a2340] border border-[rgba(148,163,184,0.06)]">
            <p className="text-[10px] text-slate-500 leading-relaxed">{t('reg_custody_note')}</p>
          </div>
        </div>

        {/* Institutional Note */}
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-2xl border border-[#00d4aa]/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">{t('reg_inst_note_title')}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{t(noteKey)}</p>
        </div>

        {/* Document References */}
        <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-white">{t('reg_docs_title')}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'reg_doc_token', path: '/DocTokenStructure' },
              { label: 'reg_doc_legal', path: '/DocLegalDocuments' },
              { label: 'reg_doc_risk', path: '/DocRiskDisclosure' },
            ].map(doc => (
              <a key={doc.label} href={doc.path} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2340] hover:border-[#00d4aa]/20 border border-transparent transition-all">
                <span className="text-xs text-slate-400">{t(doc.label)}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              </a>
            ))}
          </div>
        </div>

        {/* Inquiry CTA */}
        <a
          href="https://solfort.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-sm font-bold text-[#0a0e1a]"
        >
          {t('reg_contact_team')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}