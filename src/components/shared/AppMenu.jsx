import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  X, Home, BarChart3, TrendingUp, Wallet, Vote,
  ChevronRight, ChevronDown, Newspaper, Building2, MapPin,
  Settings, HelpCircle, FileText, Archive,
  BarChart2, Users, BookOpen, Rocket, Zap,
  Eye, Flame, Bell, PieChart, Activity
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Exchange',
    items: [
      { label: 'Home',      page: 'Home',      icon: Home },
      { label: 'Markets',   page: 'Markets',   icon: BarChart3 },
      { label: 'Trade',     page: 'Trade',     icon: TrendingUp },
      { label: 'Portfolio', page: 'Portfolio', icon: Wallet },
    ],
  },
  {
    label: 'Discover',
    items: [
      { label: 'News',             page: 'News',            icon: Newspaper },
      { label: 'RWA Markets',      page: 'RWAExplore',      icon: Building2 },
      { label: 'Real Estate',      page: 'RealEstate',      icon: MapPin },
      { label: 'Analytics',        page: 'Analytics',       icon: PieChart },
      { label: 'Launchpad',        page: 'Launchpad',       icon: Rocket },
    ],
  },
  {
    label: 'Earn & Social',
    items: [
      { label: 'Earn / Staking',  page: 'Earn',            icon: Zap },
      { label: 'Social Trading',  page: 'SocialTrading',   icon: Users },
    ],
  },
  {
    label: 'Live Feed',
    items: [
      { label: 'Liquidation Feed', page: 'LiquidationFeed', icon: Flame },
      { label: 'Whale Tracker',    page: 'WhaleTracker',    icon: Eye },
    ],
  },
];

const GOVERNANCE_ITEMS = [
  { label: 'Active Proposals',      page: 'Governance', icon: FileText },
  { label: 'Proposal Archive',      page: 'Governance', icon: Archive },
  { label: 'Voting Results',        page: 'Governance', icon: BarChart2 },
  { label: 'Participating Wallets', page: 'Governance', icon: Users },
  { label: 'Governance Principles', page: 'Governance', icon: BookOpen },
];

const ACCOUNT_LINKS = [
  { label: 'Notifications', page: 'Notifications', icon: Bell },
  { label: 'Settings',      page: 'Profile',       icon: Settings },
  { label: 'Support',       page: 'Home',          icon: HelpCircle },
];

export default function AppMenu({ isOpen, onClose, currentPage }) {
  const [govExpanded, setGovExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.page;
    return (
      <Link
        to={createPageUrl(item.page)}
        onClick={onClose}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
          isActive
            ? 'bg-[#00d4aa]/10 text-[#00d4aa]'
            : 'text-slate-300 hover:text-white hover:bg-[#151c2e]'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#00d4aa]' : 'text-slate-500 group-hover:text-[#00d4aa]'}`} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className="relative w-72 max-w-[85vw] h-full bg-[#0d1220] border-r border-[rgba(148,163,184,0.08)] flex flex-col overflow-y-auto transition-transform duration-300"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center">
              <span className="text-xs font-black text-white">SF</span>
            </div>
            <span className="text-base font-bold text-white">SOF<span className="gradient-text">Dex</span></span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-3 space-y-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(item => <NavLink key={item.label} item={item} />)}
              </div>
            </div>
          ))}

          {/* Governance expandable */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">DAO</p>
            <button
              onClick={() => setGovExpanded(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group"
            >
              <Vote className="w-4 h-4 text-slate-500 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">Governance</span>
              {govExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </button>
            {govExpanded && (
              <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                {GOVERNANCE_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={createPageUrl(item.page)}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all group"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Account</p>
            <div className="space-y-0.5">
              {ACCOUNT_LINKS.map(item => <NavLink key={item.label} item={item} />)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-slate-500">All systems operational</span>
          </div>
          <p className="text-[10px] text-slate-700">SOFDex v2.0 · Built on Solana · Institutional Grade</p>
        </div>
      </div>
    </div>
  );
}