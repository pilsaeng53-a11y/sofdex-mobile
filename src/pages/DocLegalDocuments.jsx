import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Landmark, Users, Globe, FileCheck, ShieldCheck } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="glass-card rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-purple-400/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-purple-400" />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0 gap-4">
    <span className="text-[11px] text-slate-500 flex-shrink-0">{label}</span>
    <span className="text-[11px] text-white font-medium text-right">{value}</span>
  </div>
);

const Badge = ({ label, active = true }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border ${
    active ? 'bg-purple-400/10 text-purple-300 border-purple-400/20' : 'bg-[#0d1220] text-slate-500 border-[rgba(148,163,184,0.08)]'
  }`}>
    <ShieldCheck className="w-3 h-3" />
    {label}
  </div>
);

export default function DocLegalDocuments() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol') || 'RE-NYC';
  const name = urlParams.get('name') || 'Tokenized Real Estate Asset';
  const backTo = urlParams.get('back') || 'RealEstateDetail';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 sticky top-0 z-10 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)]">
        <Link to={`${createPageUrl(backTo)}?symbol=${symbol}`}>
          <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Asset Documents</p>
          <p className="text-sm font-bold text-white">Legal Documents</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-400/10 text-purple-400 font-semibold border border-purple-400/20">PDF</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Doc title banner */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-[#0d1220] border border-purple-400/15 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-400/15 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Legal Documents</p>
              <p className="text-[11px] text-slate-500">{name} · {symbol}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge label="Verified Ownership" />
            <Badge label="Regulatory Compliant" />
            <Badge label="Title Secured" />
          </div>
        </div>

        {/* Ownership Structure */}
        <Section icon={Users} title="Ownership Structure">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Legal ownership of the underlying property is held by a Special Purpose Vehicle (SPV) incorporated under
            applicable jurisdictional law. Token holders acquire economic rights to the asset's income and appreciation
            through a legally binding token subscription agreement, governed by the SPV's articles of association.
          </p>
          <div className="space-y-0">
            <Row label="SPV Entity" value="SOFDex RE Holdings Ltd." />
            <Row label="Incorporation" value="Cayman Islands (Class B)" />
            <Row label="Token Holder Rights" value="Economic Beneficiary" />
            <Row label="Voting Rights" value="DAO Governance via Token" />
            <Row label="Transfer Restrictions" value="None (Open Market)" />
            <Row label="Beneficial Owner Registry" value="On-chain (Immutable)" />
          </div>
        </Section>

        {/* Legal Framework */}
        <Section icon={Globe} title="Legal Framework">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The tokenization framework is structured under a combination of the asset's local jurisdiction law and
            international securities standards. The offering complies with applicable exemptions from securities
            registration, and all token issuance is conducted under a legally reviewed and audited smart contract framework.
          </p>
          <div className="space-y-0">
            <Row label="Primary Jurisdiction" value="Cayman Islands" />
            <Row label="Local Law Compliance" value="Yes (Asset Jurisdiction)" />
            <Row label="Token Classification" value="Utility / Security Hybrid" />
            <Row label="Offering Exemption" value="Regulation D / Reg S" />
            <Row label="Legal Counsel" value="Tier-1 International Firm" />
            <Row label="Audit Trail" value="Immutable Blockchain Record" />
          </div>
        </Section>

        {/* Title / Deed Information */}
        <Section icon={FileCheck} title="Title & Deed Information">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The physical title deed of the property is held and registered in the name of the SPV entity.
            Title insurance has been obtained to protect against any undisclosed encumbrances, liens, or ownership disputes.
            A copy of the registered title is available to verified token holders upon request.
          </p>
          <div className="space-y-0">
            <Row label="Title Type" value="Freehold / Fee Simple" />
            <Row label="Title Holder" value="SOFDex RE Holdings Ltd." />
            <Row label="Title Insurance" value="Lloyd's of London Policy" />
            <Row label="Encumbrances" value="None Registered" />
            <Row label="Last Title Search" value="Q4 2025" />
            <Row label="Land Registry" value="Officially Recorded" />
          </div>
        </Section>

        {/* Regulatory Compliance */}
        <Section icon={ShieldCheck} title="Regulatory Compliance">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            SOFDex operates within a comprehensive compliance framework aligned with global AML/KYC standards,
            FATF recommendations, and applicable local financial regulations. The platform undergoes regular
            third-party compliance audits to ensure continued regulatory adherence.
          </p>
          <div className="space-y-0">
            <Row label="KYC / AML" value="Full Compliance" />
            <Row label="FATF Alignment" value="Yes" />
            <Row label="Data Privacy" value="GDPR & Local Standards" />
            <Row label="Exchange License" value="Registered (Multi-Jurisdiction)" />
            <Row label="Last Compliance Audit" value="January 2026" />
            <Row label="Regulatory Body" value="Multi-Jurisdiction Oversight" />
          </div>
        </Section>

        <p className="text-[10px] text-slate-600 leading-relaxed px-1 pb-4">
          Legal documents are subject to change. Token holders will be notified of material amendments. This summary does not replace the full legal agreements available to verified holders.
        </p>
      </div>
    </div>
  );
}