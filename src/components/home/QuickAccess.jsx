import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrendingUp, Vote, Newspaper, Building2, Zap, Rocket, MapPin, Target, Gift, Wallet, Brain, Users } from 'lucide-react';

const QUICK_ITEMS = [
  { label: 'Trade',        page: 'Trade',           icon: TrendingUp, color: 'from-[#00d4aa]/20 to-[#06b6d4]/10', iconColor: 'text-[#00d4aa]' },
  { label: 'Portfolio',    page: 'Portfolio',        icon: Wallet,     color: 'from-blue-500/15 to-blue-600/5',    iconColor: 'text-blue-400' },
  { label: 'Real Estate',  page: 'RealEstate',       icon: MapPin,     color: 'from-purple-500/15 to-purple-600/5',iconColor: 'text-purple-400' },
  { label: 'Governance',   page: 'Governance',       icon: Vote,       color: 'from-[#00d4aa]/15 to-[#06b6d4]/5', iconColor: 'text-[#00d4aa]' },
  { label: 'Predict',      page: 'PredictionMarket', icon: Target,     color: 'from-violet-500/15 to-violet-600/5',iconColor: 'text-violet-400' },
  { label: 'Copy Trade',   page: 'CopyTrading',      icon: Users,      color: 'from-cyan-500/15 to-cyan-600/5',    iconColor: 'text-cyan-400' },
  { label: 'Referral',     page: 'Referral',         icon: Gift,       color: 'from-emerald-500/15 to-emerald-600/5', iconColor: 'text-emerald-400' },
  { label: 'AI Intel',     page: 'AIIntelligence',   icon: Brain,      color: 'from-sky-500/15 to-sky-600/5',      iconColor: 'text-sky-400' },
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