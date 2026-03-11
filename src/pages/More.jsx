import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Vote, Newspaper, Building2, PieChart, Rocket, Zap,
  Users, Flame, Eye, Settings, HelpCircle, MapPin, Bell,
  Brain, Target, Gift, Trophy
} from 'lucide-react';

const SECTIONS = [
  {
    label: 'AI & Intelligence',
    items: [
      { label: 'AI Intelligence',   page: 'AIIntelligence',  icon: Brain,  color: 'from-[#00d4aa]/20 to-[#06b6d4]/5',    iconColor: 'text-[#00d4aa]' },
      { label: 'Prediction Market', page: 'PredictionMarket',icon: Target, color: 'from-violet-500/20 to-violet-600/5',   iconColor: 'text-violet-400' },
      { label: 'Leaderboards',      page: 'Leaderboard',     icon: Trophy, color: 'from-amber-500/20 to-amber-600/5',     iconColor: 'text-amber-400' },
      { label: 'Alert Center',      page: 'Alerts',          icon: Bell,   color: 'from-red-500/20 to-red-600/5',         iconColor: 'text-red-400' },
    ],
  },
  {
    label: 'Market Intelligence',
    items: [
      { label: 'News',          page: 'News',            icon: Newspaper, color: 'from-amber-500/20 to-amber-600/5',  iconColor: 'text-amber-400' },
      { label: 'Analytics',     page: 'Analytics',       icon: PieChart,  color: 'from-blue-500/20 to-blue-600/5',   iconColor: 'text-blue-400' },
      { label: 'Whale Tracker', page: 'WhaleTracker',    icon: Eye,       color: 'from-violet-500/20 to-violet-600/5',iconColor: 'text-violet-400' },
      { label: 'Liquidations',  page: 'LiquidationFeed', icon: Flame,     color: 'from-orange-500/20 to-orange-600/5',iconColor: 'text-orange-400' },
    ],
  },
  {
    label: 'RWA Assets',
    items: [
      { label: 'RWA Markets', page: 'RWAExplore', icon: Building2, color: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400' },
      { label: 'Real Estate', page: 'RealEstate',  icon: MapPin,    color: 'from-pink-500/20 to-pink-600/5',    iconColor: 'text-pink-400' },
    ],
  },
  {
    label: 'Earn & Social',
    items: [
      { label: 'Earn / Staking',  page: 'Earn',          icon: Zap,    color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400' },
      { label: 'Copy Trading',    page: 'CopyTrading',   icon: Users,  color: 'from-cyan-500/20 to-cyan-600/5',       iconColor: 'text-cyan-400' },
      { label: 'Social Trading',  page: 'SocialTrading', icon: Users,  color: 'from-sky-500/20 to-sky-600/5',         iconColor: 'text-sky-400' },
      { label: 'Launchpad',       page: 'Launchpad',     icon: Rocket, color: 'from-rose-500/20 to-rose-600/5',       iconColor: 'text-rose-400' },
      { label: 'Referral Hub',    page: 'Referral',      icon: Gift,   color: 'from-green-500/20 to-green-600/5',     iconColor: 'text-green-400' },
    ],
  },
  {
    label: 'Governance',
    items: [
      { label: 'Governance', page: 'Governance', icon: Vote, color: 'from-[#00d4aa]/20 to-[#06b6d4]/5', iconColor: 'text-[#00d4aa]' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Notifications', page: 'Notifications', icon: Bell,       color: 'from-slate-600/20 to-slate-700/5', iconColor: 'text-slate-400' },
      { label: 'Settings',      page: 'Profile',       icon: Settings,   color: 'from-slate-600/20 to-slate-700/5', iconColor: 'text-slate-400' },
      { label: 'Support',       page: 'Home',          icon: HelpCircle, color: 'from-slate-600/20 to-slate-700/5', iconColor: 'text-slate-400' },
    ],
  },
];

export default function More() {
  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <h1 className="text-xl font-bold text-white mb-5">More</h1>

      <div className="space-y-5">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              {section.label}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={createPageUrl(item.page)}>
                    <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${item.color} border border-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.14)] transition-all active:scale-[0.97]`}>
                      <Icon className={`w-5 h-5 ${item.iconColor} mb-3`} />
                      <p className="text-sm font-semibold text-white leading-tight">{item.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}