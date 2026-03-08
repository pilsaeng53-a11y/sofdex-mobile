import React from 'react';
import { TrendingUp, Activity, DollarSign, Users } from 'lucide-react';

const stats = [
  { label: 'Total Volume', value: '$4.2B', icon: Activity, color: 'from-[#00d4aa] to-[#06b6d4]' },
  { label: 'Open Interest', value: '$892M', icon: DollarSign, color: 'from-[#3b82f6] to-[#8b5cf6]' },
  { label: '24h Trades', value: '2.4M', icon: TrendingUp, color: 'from-[#f59e0b] to-[#ef4444]' },
  { label: 'Active Traders', value: '184K', icon: Users, color: 'from-[#ec4899] to-[#8b5cf6]' },
];

export default function MarketOverview() {
  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-4 glow-border">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2.5 shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}