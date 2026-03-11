import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrendingUp, Vote, Newspaper, Building2, Zap, Rocket } from 'lucide-react';

const QUICK_ITEMS = [
  { label: 'Trade', page: 'Trade', icon: TrendingUp, color: 'from-[#00d4aa]/20 to-[#06b6d4]/10', iconColor: 'text-[#00d4aa]' },
  { label: 'Governance', page: 'Governance', icon: Vote, color: 'from-blue-500/15 to-blue-600/5', iconColor: 'text-blue-400' },
  { label: 'News', page: 'News', icon: Newspaper, color: 'from-amber-500/15 to-amber-600/5', iconColor: 'text-amber-400' },
  { label: 'RWA', page: 'RWAExplore', icon: Building2, color: 'from-purple-500/15 to-purple-600/5', iconColor: 'text-purple-400' },
  { label: 'Earn', page: 'Earn', icon: Zap, color: 'from-emerald-500/15 to-emerald-600/5', iconColor: 'text-emerald-400' },
  { label: 'Launch', page: 'Launchpad', icon: Rocket, color: 'from-orange-500/15 to-orange-600/5', iconColor: 'text-orange-400' },
];

export default function QuickAccess() {
  return (
    <div className="px-4 mb-5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Access</p>
      <div className="grid grid-cols-3 gap-2.5">
        {QUICK_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={createPageUrl(item.page)}>
              <div className={`bg-gradient-to-br ${item.color} border border-[rgba(148,163,184,0.06)] rounded-2xl p-3.5 flex flex-col items-center gap-2 hover:border-[rgba(148,163,184,0.12)] transition-all`}>
                <div className="w-9 h-9 rounded-xl bg-[#0d1220] flex items-center justify-center">
                  <Icon className={`w-4.5 h-4.5 ${item.iconColor}`} style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}