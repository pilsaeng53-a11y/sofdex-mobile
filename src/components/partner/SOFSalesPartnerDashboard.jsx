import React, { useState } from 'react';
import { Lock, ExternalLink, TrendingUp, Users, Gift, CheckCircle2 } from 'lucide-react';
import { useWallet } from '../shared/WalletContext';

const APPROVED_WALLETS = [
  'GkPq7Xm2nR8kPxQ1vB2yC3zD4aE5fG6hI7jK8lM9nO0pR1s',
  'So14nR8kPxQ1vB2yC3zD4aE5fG6hI7jK8lM9nO0pR1sTuVwXy',
];

const AFFILIATES_URL = 'https://www.solfort.foundation/affiliates';

function RestrictedView() {
  return (
    <div className="px-4 py-8 space-y-4 text-center pb-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-amber-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Sales Partner Access Required</h2>
        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
          This section is available only for approved SOF Sales Partners. Apply to join our exclusive partner program.
        </p>
      </div>

      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3 text-left">
        <h3 className="text-sm font-bold text-white mb-2">Sales Partner Benefits</h3>
        {[
          'Dedicated partner dashboard',
          'Real-time sales analytics',
          'Premium commission structure',
          'Marketing materials & support',
          'Direct sales team contact',
        ].map((benefit, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">{benefit}</p>
          </div>
        ))}
      </div>

      <a
        href={AFFILIATES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm hover:opacity-90 transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Apply for Sales Partner
      </a>

      <p className="text-[10px] text-slate-600">
        Applications typically reviewed within 2-3 business days. You'll need a KYC-verified account.
      </p>
    </div>
  );
}

function ApprovedDashboard() {
  const grade = { color: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10', border: 'border-[#00d4aa]/20', badge: '💎' };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">SOF Sales Partner Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Exclusive partner program</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${grade.bg} border ${grade.border}`}>
          <span className="text-base">{grade.badge}</span>
          <span className={`text-xs font-bold ${grade.color}`}>Approved</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-[9px] text-slate-600 mb-1">Total Referrals</p>
          <p className="text-sm font-black text-white">127</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">+12 this month</p>
        </div>
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-[9px] text-slate-600 mb-1">Revenue Shared</p>
          <p className="text-sm font-black text-[#00d4aa]">$4,280</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">All-time</p>
        </div>
        <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-[9px] text-slate-600 mb-1">Commission Rate</p>
          <p className="text-sm font-black text-white">35%</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Premium</p>
        </div>
      </div>

      {/* Sales Performance */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-sm font-bold text-white">Sales Performance</p>
        </div>
        <div className="space-y-2">
          {[
            { period: 'This Month', amount: '$1,248', change: '+18.4%' },
            { period: 'Last Month', amount: '$1,054', change: '+12.3%' },
            { period: '3-Month Avg', amount: '$1,161', change: '+15.2%' },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.05)]">
              <p className="text-xs font-semibold text-white">{m.period}</p>
              <div className="text-right">
                <p className="text-xs font-bold text-[#00d4aa]">{m.amount}</p>
                <p className="text-[9px] text-emerald-400">{m.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Stats */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#06b6d4]" />
          <p className="text-sm font-bold text-white">Your Network</p>
        </div>
        <div className="space-y-2">
          {[
            { level: 'Direct Referrals', count: '18 users', volume: '$542K' },
            { level: 'Secondary Network', count: '43 users', volume: '$1.2M' },
            { level: 'Inactive (30+ days)', count: '66 users', volume: '—' },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.05)]">
              <p className="text-xs font-semibold text-white">{n.level}</p>
              <div className="text-right">
                <p className="text-xs text-slate-400">{n.count}</p>
                <p className="text-[9px] text-slate-600">{n.volume}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-bold text-white">Partner Resources</p>
        </div>
        <div className="space-y-2">
          {['Marketing Materials', 'Sales Playbook', 'Demo Account Access', 'Dedicated Support'].map((resource, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.05)] hover:border-[#00d4aa]/20 transition-all"
            >
              <p className="text-xs font-semibold text-slate-300">{resource}</p>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-[#0a0e1a] rounded-2xl border border-[rgba(148,163,184,0.08)] p-3 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Separate from Referral System</p>
        <p className="text-[10px] text-slate-400">
          SOF Sales Partner commissions, tracking, and payouts operate independently from the standard referral program. Check your balance in Account → Payouts.
        </p>
      </div>
    </div>
  );
}

export default function SOFSalesPartnerDashboard() {
  const { address } = useWallet();
  const isApproved = address && APPROVED_WALLETS.includes(address);

  if (!isApproved) {
    return <RestrictedView />;
  }

  return <ApprovedDashboard />;
}