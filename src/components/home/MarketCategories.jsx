import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart3, Building2, Landmark, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Perpetual Futures', desc: '50+ pairs · Up to 100x', icon: BarChart3, color: 'from-[#00d4aa] to-[#06b6d4]', page: 'Markets', params: '?tab=perpetuals' },
  { name: 'RWA Markets', desc: 'Real estate, commodities, equities', icon: Building2, color: 'from-[#8b5cf6] to-[#3b82f6]', page: 'RWAExplore', params: '' },
  { name: 'TradFi Markets', desc: 'Tokenized stocks & indices', icon: Landmark, color: 'from-[#f59e0b] to-[#ef4444]', page: 'Markets', params: '?tab=tradfi' },
];

export default function MarketCategories() {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-sm font-bold text-white mb-3">Market Categories</h2>
      <div className="space-y-2.5">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Link key={i} to={createPageUrl(cat.page) + cat.params}>
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-[#1a2340] transition-all group">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    <p className="text-[11px] text-slate-500">{cat.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00d4aa] transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}