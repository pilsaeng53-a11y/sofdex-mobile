import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Shield, Cpu, Vote, Lock, Coins } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="glass-card rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-[#00d4aa]" />
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

export default function DocTokenStructure() {
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
          <p className="text-sm font-bold text-white">Token Structure</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] font-semibold border border-[#00d4aa]/20">PDF</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Doc title banner */}
        <div className="rounded-2xl bg-gradient-to-br from-[#00d4aa]/10 to-[#0d1220] border border-[#00d4aa]/15 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00d4aa]/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Token Structure</p>
              <p className="text-[11px] text-slate-500">{name} · {symbol}</p>
            </div>
          </div>
          {/* Mini token flow */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            {['Asset SPV', '→', 'Smart Contract', '→', 'Token Mint', '→', 'Holder Wallet'].map((s, i) => (
              <span key={i} className={`text-[10px] flex-shrink-0 font-semibold ${s === '→' ? 'text-slate-600' : 'px-2 py-1 rounded-lg bg-[#151c2e] text-[#00d4aa]'}`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Token Supply */}
        <Section icon={Coins} title="Token Supply">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Tokens are issued as a fixed supply upon asset tokenization, representing 100% of the underlying property value.
            No additional tokens can be minted beyond the initial supply, ensuring that token holders' fractional
            ownership percentage remains constant unless they transfer or trade their holdings.
          </p>
          <div className="space-y-0">
            <Row label="Total Supply" value="1,000,000 Tokens" />
            <Row label="Circulating Supply" value="850,000 Tokens" />
            <Row label="Reserved (Management)" value="150,000 Tokens (15%)" />
            <Row label="Token Decimals" value="6 (Divisible)" />
            <Row label="Minting Policy" value="Fixed Supply — No New Minting" />
            <Row label="Burn Mechanism" value="None (Permanent Supply)" />
          </div>
        </Section>

        {/* Smart Contract Structure */}
        <Section icon={Cpu} title="Smart Contract Structure">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            The token is deployed as a Solana SPL Token governed by an audited smart contract program. The contract
            automates income distribution, manages on-chain cap table, and enforces transfer restrictions or compliance
            logic as required by the legal framework. All contract code is publicly verifiable on-chain.
          </p>
          <div className="space-y-0">
            <Row label="Blockchain" value="Solana Mainnet" />
            <Row label="Token Standard" value="SPL Token v2" />
            <Row label="Program Framework" value="Anchor (Solana)" />
            <Row label="Contract Audit" value="CertiK + OtterSec Audited" />
            <Row label="Distribution Logic" value="Automated On-Chain" />
            <Row label="Upgrade Authority" value="DAO Multisig (5/9)" />
            <Row label="Verifiable Code" value="Open Source (GitHub)" />
          </div>
        </Section>

        {/* DAO Governance */}
        <Section icon={Vote} title="DAO Governance Integration">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Token holders have governance rights proportional to their token holdings. Major decisions including
            property management contracts, capital improvements, and asset disposition require on-chain DAO voting.
            Proposals can be submitted by any holder with a minimum threshold of 10,000 tokens.
          </p>
          <div className="space-y-0">
            <Row label="Governance Model" value="1 Token = 1 Vote" />
            <Row label="Proposal Threshold" value="10,000 Tokens" />
            <Row label="Voting Period" value="7 Days" />
            <Row label="Quorum Requirement" value="15% of Circulating Supply" />
            <Row label="Execution" value="Automatic (Smart Contract)" />
            <Row label="DAO Platform" value="SOFDex DAO" />
          </div>
        </Section>

        {/* Custody & Security */}
        <Section icon={Lock} title="Custody & Security Structure">
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Digital assets held within the platform are secured through institutional-grade multi-signature custody
            arrangements. The underlying physical asset title is held by a regulated custodian under strict operational
            security protocols, with regular third-party security audits conducted.
          </p>
          <div className="space-y-0">
            <Row label="Digital Custody" value="Multi-Sig Institutional Wallet" />
            <Row label="Custody Provider" value="Fireblocks / Anchorage" />
            <Row label="Insurance Coverage" value="$50M Digital Asset Policy" />
            <Row label="Key Management" value="HSM + MPC Architecture" />
            <Row label="Security Audits" value="Quarterly Third-Party" />
            <Row label="Recovery Protocol" value="Documented + Tested" />
          </div>
        </Section>

        <p className="text-[10px] text-slate-600 leading-relaxed px-1 pb-4">
          Smart contract addresses and full technical documentation are available on the SOFDex developer portal. This document summarizes key structural elements for investor reference.
        </p>
      </div>
    </div>
  );
}