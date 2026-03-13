import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, AlertTriangle, Droplets, Globe, BarChart2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

const RiskCard = ({ icon: Icon, title, level, color, bgColor, children }) => {
  const [open, setOpen] = useState(false);
  const levelColors = { High: 'text-red-400 bg-red-400/10 border-red-400/20', Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20', Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 hover:bg-[#1a2340] transition-colors">
        <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${levelColors[level]}`}>{level} Risk</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[rgba(148,163,184,0.06)]">
          <div className="pt-3 space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const RiskPoint = ({ text }) => (
  <div className="flex items-start gap-2.5">
    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
    <p className="text-[12px] text-slate-400 leading-relaxed">{text}</p>
  </div>
);

export default function DocRiskDisclosure() {
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
          <p className="text-sm font-bold text-white">Risk Disclosure</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/20">PDF</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Warning banner */}
        <div className="rounded-2xl bg-amber-500/5 border border-amber-400/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300 mb-1">Risk Disclosure Statement</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Investing in tokenized real world assets involves significant risks. You may lose some or all of your investment.
                Read all risk factors carefully before investing. Tap each section to expand.
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-white">
            <p className="font-bold text-white mb-1">Asset: {name} ({symbol})</p>
            <p className="text-slate-500">Document Version: v2.1 · Last Updated: Q1 2026</p>
          </div>
        </div>

        {/* Risk Summary Bar */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Summary</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Liquidity', level: 'Med', color: 'text-amber-400' },
              { label: 'Regulatory', level: 'Med', color: 'text-amber-400' },
              { label: 'Market', level: 'Med', color: 'text-amber-400' },
              { label: 'Token', level: 'Low', color: 'text-emerald-400' },
            ].map(r => (
              <div key={r.label} className="bg-[#0d1220] rounded-xl p-2">
                <p className={`text-sm font-bold ${r.color}`}>{r.level}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidity Risks */}
        <RiskCard icon={Droplets} title="Liquidity Risks" level="Medium" color="text-blue-400" bgColor="bg-blue-400/10">
          <RiskPoint text="Tokenized real estate has significantly lower liquidity than traditional securities or cryptocurrencies. There may not always be a buyer for your tokens at your desired price." />
          <RiskPoint text="Secondary market trading volumes may be thin, particularly during periods of broader market stress, which could result in large bid-ask spreads." />
          <RiskPoint text="In extreme market conditions, the platform may temporarily suspend trading to protect all participants, creating periods where your assets cannot be sold." />
          <RiskPoint text="Physical real estate assets cannot be rapidly liquidated, which may affect token redemption timelines if the underlying asset needs to be sold." />
          <RiskPoint text="Concentration of ownership among a small number of large holders could create illiquid conditions when those holders choose to sell simultaneously." />
        </RiskCard>

        {/* Regulatory Risks */}
        <RiskCard icon={Globe} title="Regulatory Risks" level="Medium" color="text-purple-400" bgColor="bg-purple-400/10">
          <RiskPoint text="The regulatory landscape for tokenized real estate is evolving rapidly. New laws or regulations could restrict trading, require additional licensing, or impose new obligations on token holders." />
          <RiskPoint text="Different jurisdictions may classify RWA tokens differently (e.g., as securities). Adverse regulatory rulings could force platform restructuring or token migration." />
          <RiskPoint text="KYC/AML requirements may be strengthened, potentially restricting who can hold or transfer tokens and creating compliance costs for the issuer." />
          <RiskPoint text="Tax treatment of tokenized real estate varies by jurisdiction and may change. Token holders are responsible for understanding and complying with their local tax obligations." />
          <RiskPoint text="Regulatory actions against blockchain technology platforms or DeFi protocols could indirectly impact the token's trading infrastructure." />
        </RiskCard>

        {/* Market Volatility */}
        <RiskCard icon={BarChart2} title="Market Volatility Risks" level="Medium" color="text-amber-400" bgColor="bg-amber-400/10">
          <RiskPoint text="Real estate markets are subject to economic cycles. Property values may decline due to rising interest rates, economic downturns, or oversupply in the local market." />
          <RiskPoint text="Token prices on secondary markets may trade at a premium or discount to the underlying net asset value (NAV), reflecting sentiment rather than fundamentals." />
          <RiskPoint text="Currency fluctuations may affect the value of the asset if the property is denominated in a different currency from the investor's home currency." />
          <RiskPoint text="Changes in rental income due to tenant defaults, vacancies, or market rent declines could reduce expected yield distributions." />
          <RiskPoint text="Macro-economic events such as inflation, geopolitical instability, or pandemics can negatively impact both property values and rental income." />
        </RiskCard>

        {/* Token Structure Risks */}
        <RiskCard icon={ShieldAlert} title="Token Structure Risks" level="Low" color="text-emerald-400" bgColor="bg-emerald-400/10">
          <RiskPoint text="Smart contract bugs, even in audited code, could result in loss of funds or unexpected behavior. Multiple audits reduce but do not eliminate this risk." />
          <RiskPoint text="If the issuing SPV entity were to become insolvent, token holders' claims on the underlying asset would be subject to legal processes that could be time-consuming and costly." />
          <RiskPoint text="Private key loss or compromise of an investor's wallet could result in permanent, irrecoverable loss of tokens with no recourse from the platform." />
          <RiskPoint text="Blockchain network congestion or outages could temporarily prevent token transfers or distributions, impacting access to funds." />
          <RiskPoint text="Governance attacks through token accumulation could potentially result in DAO decisions that are unfavorable to minority token holders." />
        </RiskCard>

        {/* Disclaimer */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Important Disclaimer</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This risk disclosure is not exhaustive. Additional risks not listed here may affect your investment.
            Past performance does not guarantee future results. SOFDex does not provide investment advice.
            You should consult qualified financial, legal, and tax advisors before investing.
            Only invest amounts you can afford to lose entirely.
          </p>
        </div>

        <p className="text-[10px] text-slate-600 leading-relaxed px-1 pb-4">
          By holding tokens on this platform you acknowledge that you have read, understood, and accepted these risk disclosures in full.
        </p>
      </div>
    </div>
  );
}