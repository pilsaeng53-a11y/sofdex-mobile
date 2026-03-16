import React from 'react';
import { TrendingUp, DollarSign, Users, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BREAKDOWN = [
  { label: 'Direct referral (L1)', vol: '$892,100', commission: '$17,842', share: '42%', color: '#00d4aa' },
  { label: 'Level 2 team', vol: '$840,000', commission: '$12,600', share: '30%', color: '#9945ff' },
  { label: 'Level 3 team', vol: '$440,000', commission: '$6,600', share: '16%', color: '#3b82f6' },
  { label: 'Level 4+', vol: '$227,900', commission: '$4,958', share: '12%', color: '#f59e0b' },
];

const PIE_DATA = BREAKDOWN.map(b => ({ name: b.label, value: parseFloat(b.share) }));

export default function CommissionDist() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Commission Distribution</h1>
        <p className="text-xs text-slate-400">Team volume and commission breakdown</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#00d4aa]/15 to-transparent rounded-2xl border border-[#00d4aa]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs text-slate-400">Team Volume</span>
          </div>
          <p className="text-2xl font-black text-white">$2.4M</p>
          <p className="text-xs text-green-400 mt-1">+18% this month</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400/15 to-transparent rounded-2xl border border-amber-400/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Generated</span>
          </div>
          <p className="text-2xl font-black text-white">$42K</p>
          <p className="text-xs text-amber-400 mt-1">Total commission</p>
        </div>
      </div>

      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 text-center">
        <p className="text-xs text-slate-400 mb-1">Your Commission Share</p>
        <p className="text-4xl font-black text-[#00d4aa]">30%</p>
        <p className="text-sm text-slate-400 mt-1">= <span className="text-white font-bold">$12,600 USDT</span> earned</p>
      </div>

      {/* Pie */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Distribution by Level</h2>
        <div className="flex items-center gap-3">
          <ResponsiveContainer width={120} height={120}>
            <RePieChart>
              <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                {BREAKDOWN.map((b, i) => <Cell key={i} fill={b.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {BREAKDOWN.map((b, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-xs text-slate-400">{b.label.split(' (')[0]}</span>
                </div>
                <span className="text-xs font-bold text-white">{b.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Detailed Breakdown</h2>
        <div className="space-y-2">
          {BREAKDOWN.map((b, i) => (
            <div key={i} className="bg-[#0a0e1a] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-xs font-semibold text-white">{b.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: b.color }}>{b.share}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Volume: {b.vol}</span>
                <span className="text-green-400 font-semibold">{b.commission}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}