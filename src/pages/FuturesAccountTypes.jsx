import React, { useState } from 'react';
import { ACCOUNT_TYPES } from '@/data/futuresTradingAssets';
import { Check, X, Zap } from 'lucide-react';

export default function FuturesAccountTypes() {
  const [selectedAccount, setSelectedAccount] = useState('pro');

  const featureComparison = [
    { feature: 'Maximum Leverage', standard: '1:100', pro: '1:100', raw: '1:100' },
    { feature: 'Minimum Deposit', standard: '$100', pro: '$1,000', raw: '$5,000' },
    { feature: 'Spread Multiplier', standard: '100%', pro: '75%', raw: '50%' },
    { feature: 'Trading Fee', standard: '$1.0/lot', pro: '$0.75/lot', raw: '$3.5/lot (ECN)' },
    { feature: 'Daily Swap Rate', standard: '0.02%', pro: '0.015%', raw: '0.01%' },
    { feature: 'Minimum Lot Size', standard: '0.01', pro: '0.01', raw: '0.01' },
    { feature: 'Market Watch', standard: 'Yes', pro: 'Yes', raw: 'Yes' },
    { feature: 'One-Click Trading', standard: 'Yes', pro: 'Yes', raw: 'Yes' },
    { feature: 'Advanced Analytics', standard: 'Basic', pro: 'Full', raw: 'Full' },
    { feature: 'API Access', standard: 'No', pro: 'No', raw: 'Yes' },
    { feature: 'Dedicated Support', standard: 'Email', pro: 'Email/Chat', raw: '24/7 Phone' },
    { feature: 'Risk Management', standard: 'Standard', pro: 'Advanced', raw: 'Professional' },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Account Types</h1>
        <p className="text-sm text-slate-400">
          Choose the account that fits your trading style
        </p>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {Object.values(ACCOUNT_TYPES).map((account) => (
          <div
            key={account.id}
            onClick={() => setSelectedAccount(account.id)}
            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
              selectedAccount === account.id
                ? 'ring-2 ring-[#00d4aa] scale-[1.02]'
                : 'hover:ring-2 hover:ring-[#00d4aa]/30'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${account.color} opacity-10`} />

            {/* Border */}
            <div
              className={`absolute inset-0 rounded-2xl border ${
                selectedAccount === account.id
                  ? 'border-[#00d4aa]/50'
                  : 'border-[rgba(148,163,184,0.1)]'
              }`}
            />

            {/* Content */}
            <div className="relative p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{account.icon}</span>
                    <h3 className="text-xl font-bold text-white">{account.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{account.description}</p>
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Leverage */}
                <div className="bg-[rgba(0,212,170,0.1)] border border-[#00d4aa]/20 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 mb-0.5">Max Leverage</p>
                  <p className="text-sm font-bold text-[#00d4aa]">1:{account.features.max_leverage}</p>
                </div>

                {/* Min Deposit */}
                <div className="bg-[rgba(59,130,246,0.1)] border border-[#3b82f6]/20 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 mb-0.5">Minimum Deposit</p>
                  <p className="text-sm font-bold text-[#3b82f6]">${account.features.min_deposit}</p>
                </div>

                {/* Spread */}
                <div className="bg-[rgba(139,92,246,0.1)] border border-[#8b5cf6]/20 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 mb-0.5">Spread Multiplier</p>
                  <p className="text-sm font-bold text-[#8b5cf6]">{(account.features.spread_multiplier * 100).toFixed(0)}%</p>
                </div>

                {/* Fee */}
                <div className="bg-[rgba(236,72,153,0.1)] border border-[#ec4899]/20 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 mb-0.5">Fee per Lot</p>
                  <p className="text-sm font-bold text-[#ec4899]">${account.features.fee_per_lot}</p>
                </div>
              </div>

              {/* CTA Button */}
              <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                selectedAccount === account.id
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                  : 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)] hover:border-[#00d4aa]/20'
              }`}>
                {selectedAccount === account.id ? '✓ Selected' : 'Select Account'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Account Details */}
      {selectedAccount && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#00d4aa]">
            {ACCOUNT_TYPES[selectedAccount.toUpperCase()].name} Account Benefits
          </h3>

          <div className="space-y-2">
            {[
              'Lower spreads and fees',
              'Higher leverage available',
              'Advanced trading tools',
              'Dedicated support',
              'Priority order execution',
              'Access to premium signals',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 text-[#00d4aa] font-bold py-2.5 rounded-lg transition-all text-sm">
            Open {ACCOUNT_TYPES[selectedAccount.toUpperCase()].name} Account
          </button>
        </div>
      )}

      {/* Full Comparison Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 px-1">Full Comparison</h3>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#151c2e] border-b border-[rgba(148,163,184,0.1)]">
                <tr>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-400">Feature</th>
                  <th className="px-3 py-2.5 text-center font-bold text-slate-400">Standard</th>
                  <th className="px-3 py-2.5 text-center font-bold text-[#00d4aa]">Pro</th>
                  <th className="px-3 py-2.5 text-center font-bold text-slate-400">Raw</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.06)]">
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1a2340]/50 transition-all">
                    <td className="px-3 py-2.5 text-slate-400 font-semibold">{row.feature}</td>
                    <td className="px-3 py-2.5 text-center text-slate-300">{row.standard}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-[#00d4aa]">{row.pro}</td>
                    <td className="px-3 py-2.5 text-center text-slate-300">{row.raw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="space-y-2">
        <div className="glass-card rounded-xl p-4 border-l-4 border-[#00d4aa]">
          <p className="text-xs font-bold text-white mb-1">💡 Pro Tip</p>
          <p className="text-[9px] text-slate-400">
            Pro accounts offer the best balance between low costs and advanced features. Recommended for active traders.
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border-l-4 border-[#8b5cf6]">
          <p className="text-xs font-bold text-white mb-1">🚀 Raw ECN</p>
          <p className="text-[9px] text-slate-400">
            Raw accounts provide direct market access with professional-grade tools but require higher capital.
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border-l-4 border-[#3b82f6]">
          <p className="text-xs font-bold text-white mb-1">📊 Upgrade Anytime</p>
          <p className="text-[9px] text-slate-400">
            Start with Standard and upgrade to Pro or Raw as your trading grows. No penalties.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 px-1">Common Questions</h3>

        <div className="space-y-2">
          {[
            {
              q: 'What is spread multiplier?',
              a: 'Percentage of base spread charged on your trades. Lower is better.',
            },
            {
              q: 'Can I change account types?',
              a: 'Yes, upgrade or downgrade anytime with no penalty. Changes apply immediately.',
            },
            {
              q: 'What is swap rate?',
              a: 'Daily funding cost for holding positions overnight. Calculated per lot.',
            },
          ].map((item, idx) => (
            <details key={idx} className="glass-card rounded-lg p-3 cursor-pointer group">
              <summary className="font-semibold text-xs text-white flex items-center justify-between">
                {item.q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-[9px] text-slate-400 mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}