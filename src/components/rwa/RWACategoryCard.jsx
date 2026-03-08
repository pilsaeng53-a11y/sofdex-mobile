import React from 'react';
import { Building2, Gem, Landmark, TrendingUp, Banknote } from 'lucide-react';

const iconMap = {
  'Real Estate': Building2,
  'Commodity': Gem,
  'Treasury': Landmark,
  'Equity': TrendingUp,
};

const colorMap = {
  'Real Estate': 'from-[#8b5cf6] to-[#6d28d9]',
  'Commodity': 'from-[#f59e0b] to-[#d97706]',
  'Treasury': 'from-[#3b82f6] to-[#2563eb]',
  'Equity': 'from-[#00d4aa] to-[#059669]',
};

export default function RWACategoryCard({ type, count, totalValue }) {
  const Icon = iconMap[type] || Banknote;
  const gradient = colorMap[type] || 'from-slate-500 to-slate-600';

  return (
    <div className="glass-card rounded-2xl p-4 glow-border hover:bg-[#1a2340] transition-all cursor-pointer group">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm font-bold text-white mb-0.5">{type}</p>
      <p className="text-[11px] text-slate-500">{count} assets · {totalValue}</p>
    </div>
  );
}