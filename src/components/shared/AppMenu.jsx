import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  X, Home, BarChart3, TrendingUp, Wallet, Vote,
  ChevronRight, ChevronDown, Newspaper, Building2, MapPin,
  Settings, HelpCircle, FileText, Archive, Shield,
  BarChart2, Users, BookOpen, Rocket, Zap,
  Eye, Flame, Bell, PieChart, Activity, ArrowDownUp, Star,
  Wrench, Compass, Sparkles, Brain, MessageSquare, Gift,
  Trophy, Copy, Layers, GitBranch, DollarSign, Award, Lock, UserCheck
} from 'lucide-react';
import { useLang } from './LanguageContext';
import { useUserType } from './UserTypeContext';
import SolFortLogo from './SolFortLogo';
import { getUserTierLabel, getTierBadgeClass } from '@/lib/roleVisibility';

// Priority-ordered navigation — grouped by real user intent
const NAV_SECTIONS = [
  {
    labelKey: 'menu_trading',
    items: [
      { labelKey: 'menu_trade',        page: 'Trade',        icon: TrendingUp },
      { labelKey: 'menu_copyTrading',  page: 'CopyTrading',  icon: Copy },
      { labelKey: 'menu_markets',      page: 'Markets',      icon: BarChart3 },
      { labelKey: 'menu_marketHeatmap',page: 'MarketHeatmap',icon: Flame },
      { labelKey: 'menu_swap',         page: 'Swap',         icon: ArrowDownUp },
    ],
  },
  {
    labelKey: 'menu_aiTools',
    items: [
      { labelKey: 'menu_aiIntelligence',  page: 'AIIntelligence',      icon: Brain },
      { labelKey: 'menu_aiWealthManager', page: 'AIWealthManager',     icon: Sparkles },
      { labelKey: 'menu_strategyMkt',     page: 'StrategyMarketplace', icon: BookOpen },
      { labelKey: 'menu_strategyVaults',  page: 'StrategyVaults',      icon: Layers },
      { labelKey: 'menu_strategyFunds',   page: 'StrategyIndexFunds',  icon: PieChart },
      { labelKey: 'menu_assetDiscovery',  page: 'AssetDiscovery',      icon: Compass },
      { labelKey: 'menu_tradingTools',    page: 'TradingTools',        icon: Wrench },
    ],
  },
  {
    labelKey: 'menu_community',
    items: [
      { labelKey: 'menu_tradingFeed',   page: 'TradingFeed',   icon: Activity },
      { labelKey: 'menu_discussions',   page: 'Discussions',   icon: MessageSquare },
      { labelKey: 'menu_traders',       page: 'Traders',       icon: Users },
      { labelKey: 'menu_leaderboard',   page: 'Leaderboard',   icon: Trophy },
      { labelKey: 'menu_rewards',       page: 'Rewards',       icon: Gift },
    ],
  },
  {
    labelKey: 'menu_portfolio_hub',
    items: [
      { labelKey: 'menu_portfolio',      page: 'Portfolio',          icon: Layers },
      { labelKey: 'menu_wallet',         page: 'Wallet',             icon: Wallet },
      { labelKey: 'menu_uniPortfolio',   page: 'UniversalPortfolio', icon: PieChart },
      { labelKey: 'menu_myStrategyInv',  page: 'MyStrategyInvestments', icon: Star },
      { labelKey: 'menu_earnStaking',    page: 'Earn',               icon: Zap },
      { labelKey: 'menu_referralHub',    page: 'Referral',           icon: Gift },
    ],
  },
  {
    labelKey: 'menu_news_section',
    items: [
      { labelKey: 'menu_news',        page: 'News',                  icon: Newspaper },
      { labelKey: 'menu_analytics',   page: 'Analytics',             icon: PieChart },
      { labelKey: 'menu_aiIntelHub',  page: 'AnalyticsIntelligence', icon: Brain },
      { labelKey: 'menu_whatsNew',    page: 'WhatsNew',              icon: Sparkles },
      { labelKey: 'menu_alerts',      page: 'Alerts',                icon: Bell },
    ],
  },
  {
    labelKey: 'menu_launchpad_section',
    items: [
      { labelKey: 'menu_launchpad',        page: 'Launchpad',       icon: Rocket },
      { labelKey: 'menu_predictionMarket', page: 'PredictionMarket',icon: BarChart2 },
      { labelKey: 'menu_rwaMarkets',       page: 'RWAExplore',      icon: Building2 },
      { labelKey: 'menu_realEstate',       page: 'RealEstate',      icon: MapPin },
    ],
  },
  {
    labelKey: 'menu_liveFeed',
    items: [
      { labelKey: 'menu_liquidationFeed', page: 'LiquidationFeed', icon: Flame },
      { labelKey: 'menu_whaleTracker',    page: 'WhaleTracker',    icon: Eye },
      { labelKey: 'menu_fundingRates',    page: 'FundingRates',    icon: Zap },
      { labelKey: 'menu_openInterest',    page: 'OpenInterest',    icon: BarChart2 },
      { labelKey: 'menu_announcements',   page: 'Announcements',   icon: Bell },
    ],
  },
  {
    labelKey: 'menu_solfort',
    items: [
      { labelKey: 'menu_solfortPage',     page: 'SolFort',          icon: Star },
      { labelKey: 'menu_institutional',   page: 'Institutional',    icon: Shield },
      { labelKey: 'menu_reputationScore', page: 'ReputationScore',  icon: Award },
    ],
  },
];

const GOVERNANCE_ITEM_KEYS = [
  { labelKey: 'gov_activeProposals',      page: 'Governance', icon: FileText },
  { labelKey: 'gov_proposalArchive',      page: 'Governance', icon: Archive },
  { labelKey: 'gov_votingResults',        page: 'Governance', icon: BarChart2 },
  { labelKey: 'gov_participatingWallets', page: 'Governance', icon: Users },
  { labelKey: 'gov_principles',           page: 'Governance', icon: BookOpen },
];

const PARTNER_FULL_ITEMS = [
  { labelKey: 'menu_partnerHubMain',  page: 'PartnerHub',         icon: Star },
  { labelKey: 'menu_downlineTree',    page: 'DownlineTree',       icon: GitBranch },
  { labelKey: 'menu_commissionDist',  page: 'CommissionDist',     icon: DollarSign },
  { labelKey: 'menu_rankProgress',    page: 'RankProgress',       icon: Award },
  { labelKey: 'menu_teamLeaderboard', page: 'TeamLeaderboard',    icon: BarChart3 },
  { labelKey: 'menu_regionalDist',    page: 'RegionalDistributor',icon: MapPin },
  { labelKey: 'menu_myTeam',          page: 'MyTeam',             icon: Users },
];

const ACCOUNT_LINK_KEYS = [
  { labelKey: 'menu_notifications', page: 'Notifications', icon: Bell },
  { labelKey: 'menu_settings',      page: 'Profile',       icon: Settings },
  { labelKey: 'menu_support',       page: 'Home',          icon: HelpCircle },
];

export default function AppMenu({ isOpen, onClose, currentPage }) {
  const [govExpanded, setGovExpanded] = useState(false);
  const [partnerExpanded, setPartnerExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useLang();
  const { isPartnerApproved, isPartnerPending, userType } = useUserType();

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
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
          isActive ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-300 hover:text-white hover:bg-[#151c2e]'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#00d4aa]' : 'text-slate-500 group-hover:text-[#00d4aa]'}`} />
        <span className="text-sm font-medium">{item.label || t(item.labelKey)}</span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        className="relative w-72 max-w-[85vw] h-full bg-[#0d1220] border-r border-[rgba(148,163,184,0.08)] flex flex-col overflow-y-auto transition-transform duration-300"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center gap-2.5">
            <SolFortLogo size={32} className="rounded-lg" />
            <span className="text-base font-bold text-white">SOF<span className="gradient-text">Dex</span></span>
          </div>
          <div className="flex items-center gap-2">
            {/* User type badge */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border uppercase ${getTierBadgeClass(userType, isPartnerApproved ? 'approved' : isPartnerPending ? 'pending' : 'none')}`}>
              {getUserTierLabel(userType, isPartnerApproved ? 'approved' : isPartnerPending ? 'pending' : 'none')}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Home quick link */}
        <div className="px-3 pt-3">
          <Link to={createPageUrl('Home')} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${currentPage === 'Home' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-300 hover:text-white hover:bg-[#151c2e]'}`}>
            <Home className={`w-4 h-4 flex-shrink-0 transition-colors ${currentPage === 'Home' ? 'text-[#00d4aa]' : 'text-slate-500 group-hover:text-[#00d4aa]'}`} />
            <span className="text-sm font-medium">{t('menu_home')}</span>
          </Link>
        </div>

        {/* Nav sections */}
        <div className="flex-1 px-3 py-2 space-y-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.labelKey}>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t(section.labelKey)}</p>
              <div className="space-y-0.5">
                {section.items.map(item => <NavLink key={item.labelKey + item.page} item={item} />)}
              </div>
            </div>
          ))}

          {/* Partner Hub — access controlled */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_partnerHub')}</p>
            {isPartnerApproved ? (
              <>
                <button
                  onClick={() => setPartnerExpanded(v => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group"
                >
                  <UserCheck className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 text-left">{t('menu_partnerHubMain')}</span>
                  <span className="text-[9px] text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded-lg border border-[#00d4aa]/20 mr-1">Approved</span>
                  {partnerExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                </button>
                {partnerExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                    {PARTNER_FULL_ITEMS.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.labelKey} to={createPageUrl(item.page)} onClick={onClose}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all group">
                          <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
                          <span className="text-xs font-medium">{t(item.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-0.5">
                <Link to={createPageUrl('PartnerHub')} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group">
                  <Rocket className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{t('menu_applyDistributor') || 'Apply as Distributor'}</span>
                </Link>
                {/* Locked items indicator */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl opacity-40">
                  <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{t('menu_partnerLocked') || 'Partner features locked'}</span>
                </div>
                {isPartnerPending && (
                  <div className="mx-3 mt-1 px-3 py-2 bg-amber-400/5 border border-amber-400/20 rounded-xl">
                    <p className="text-xs text-amber-400">⏳ {t('menu_partnerPending') || 'Application pending review'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Governance expandable */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_dao')}</p>
            <button
              onClick={() => setGovExpanded(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group"
            >
              <Vote className="w-4 h-4 text-slate-500 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">{t('menu_governance')}</span>
              {govExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </button>
            {govExpanded && (
              <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                {GOVERNANCE_ITEM_KEYS.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.labelKey} to={createPageUrl(item.page)} onClick={onClose}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all group">
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
                      <span className="text-xs font-medium">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_account')}</p>
            <div className="space-y-0.5">
              {ACCOUNT_LINK_KEYS.map(item => <NavLink key={item.labelKey} item={item} />)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] text-slate-500">{t('common_allSystems')}</span>
            </div>
            <Link to="/Profile" onClick={onClose} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">{t('menu_settings')}</Link>
          </div>
          <p className="text-[10px] text-slate-700">SOFDex v2.1 · Solana · Institutional Grade</p>
        </div>
      </div>
    </div>
  );
}