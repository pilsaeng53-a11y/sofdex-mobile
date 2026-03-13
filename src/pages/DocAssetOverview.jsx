import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, MapPin, TrendingUp, Building2, Layers } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="glass-card rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-blue-400" />
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

export default function DocAssetOverview() {
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
          <p className="text-sm font-bold text-white">Asset Overview</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-400/10 text-blue-400 font-semibold border border-blue-400/20">PDF</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Doc title banner */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-[#0d1220] border border-blue-400/15 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-400/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Asset Overview</p>
              <p className="text-[11px] text-slate-500">{name} · {symbol}</p>
            </div>
          </div>
        </div>

        {/* Property Overview */}
        <Section icon={Building2} title="Property Overview">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            This tokenized real estate asset represents fractional ownership in a premium institutional-grade property.
            The asset has been thoroughly vetted, audited, and verified through our on-chain verification process.
            Each token represents a proportional share of the underlying physical asset and its associated cash flows.
          </p>
          <div className="space-y-0">
            <Row label="Asset Symbol" value={symbol} />
            <Row label="Asset Class" value="Tokenized Real Estate" />
            <Row label="Token Standard" value="SPL Token (Solana)" />
            <Row label="Asset Status" value="Active & Verified" />
            <Row label="Custodian" value="SOFDex Institutional Custody" />
          </div>
        </Section>

        {/* Location */}
        <Section icon={MapPin} title="Location">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The property is situated in a prime location within a major financial or commercial district.
            Geographic positioning has been assessed for long-term capital appreciation, accessibility, and surrounding
            infrastructure development, providing a stable and growing investment environment.
          </p>
          <div className="space-y-0">
            <Row label="Region" value="Prime District" />
            <Row label="Zoning" value="Commercial / Mixed-Use" />
            <Row label="Transport Links" value="Major Transit Hubs Nearby" />
            <Row label="Surrounding Developments" value="High-Growth Zone" />
          </div>
        </Section>

        {/* Investment Summary */}
        <Section icon={TrendingUp} title="Investment Summary">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The investment structure is designed to provide stable, yield-generating returns through rental income
            and long-term capital appreciation. Proceeds from token sales are used to fund property operations,
            maintenance, and reserve capital, with net income distributed to token holders quarterly.
          </p>
          <div className="space-y-0">
            <Row label="Investment Type" value="Yield-Generating RWA" />
            <Row label="Distribution Frequency" value="Quarterly" />
            <Row label="Distribution Method" value="On-chain (USDC)" />
            <Row label="Lock-up Period" value="None (Liquid)" />
            <Row label="Minimum Investment" value="1 Token" />
          </div>
        </Section>

        {/* Expected Yield */}
        <Section icon={TrendingUp} title="Expected Yield">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Expected yield is derived from net rental income after expenses, management fees, and reserve contributions.
            Yields are projected based on current occupancy rates, market rental rates, and comparable property benchmarks.
            Past performance does not guarantee future returns.
          </p>
          <div className="space-y-0">
            <Row label="Projected Net Yield" value="7–10% p.a." />
            <Row label="Gross Rental Yield" value="9–12% p.a." />
            <Row label="Occupancy Rate" value="94% (trailing 12M)" />
            <Row label="Benchmark Index" value="NCREIF Property Index" />
            <Row label="Capital Appreciation" value="3–5% p.a. (historical avg)" />
          </div>
        </Section>

        {/* Asset Structure */}
        <Section icon={Layers} title="Asset Structure">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The asset is held within a Special Purpose Vehicle (SPV) structure, providing legal separation between the
            underlying real estate and token holders. The SPV holds direct title to the property, and token holders
            have proportional economic rights through smart contract-enforced distributions.
          </p>
          <div className="space-y-0">
            <Row label="Holding Structure" value="SPV (Special Purpose Vehicle)" />
            <Row label="Legal Jurisdiction" value="Cayman Islands / Local" />
            <Row label="Title Holder" value="SOFDex RE Holdings Ltd." />
            <Row label="Smart Contract" value="Solana SPL (Audited)" />
            <Row label="Governance" value="DAO Integrated" />
          </div>
        </Section>

        <p className="text-[10px] text-slate-600 leading-relaxed px-1 pb-4">
          This document is for informational purposes only and does not constitute financial advice. All projections are estimates and subject to change. Please review the full prospectus before investing.
        </p>
      </div>
    </div>
  );
}