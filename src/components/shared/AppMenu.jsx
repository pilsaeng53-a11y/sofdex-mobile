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
  Trophy, Copy, Layers, GitBranch, DollarSign, Award, Lock, UserCheck, User, Globe,
  TrendingDown, Briefcase, Plus, UserPlus, Package, Truck
} from 'lucide-react';
import { useLang } from './LanguageContext';
import { useUserType } from './UserTypeContext';
import { useUserMode } from './UserModeContext';
import UserModeToggle from './UserModeToggle';
import SolFortLogo from './SolFortLogo';
import { getUserTierLabel, getTierBadgeClass } from '@/lib/roleVisibility';

// Priority-ordered navigation — grouped by real user intent
const NAV_SECTIONS = [
  {
    labelKey: 'menu_futures',
    items: [
      { labelKey: 'menu_futuresDashboard',  page: 'FuturesDashboard',  icon: TrendingDown },
      { labelKey: 'menu_futuresTrade',      page: 'FuturesTrade',      icon: Briefcase },
      { labelKey: 'menu_futuresMarketWatch',page: 'FuturesMarketWatch',icon: BarChart3 },
      { labelKey: 'menu_futuresPositions',  page: 'FuturesPositions',  icon: Activity },
    ],
  },
  {
    labelKey: 'menu_trading',
    items: [
      { labelKey: 'menu_trade',        page: 'Trade',        icon: TrendingUp },
      { labelKey: 'menu_globalMarkets',page: 'GlobalMarkets',icon: Globe },
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
    ],
  },
  {
    label: 'RWA',
    items: [
      { label: 'RWA 마켓',         page: 'RealEstate',        icon: Building2 },
      { label: '타 플랫폼 매물에 투자하기', page: 'RWAExplore', icon: Globe },
      { label: 'RWA 선물거래',      page: 'RWAFuturesList',   icon: TrendingDown, highlight: true },
      { label: '내 자산 등록 신청', page: 'AssetOnboarding',  icon: Plus },
      { label: '내 신청 내역',      page: 'MySubmissions',    icon: FileText },
      { label: 'RWA 인사이트',      page: 'RWAInsights',      icon: BarChart2 },
      { label: '내 RWA 자산',       page: 'MyRWAPortfolio',   icon: Star },
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
  { label: '파트너 신청 & 승급', page: 'PartnerApplication', icon: UserPlus },
  { labelKey: 'menu_downlineTree',    page: 'DownlineTree',       icon: GitBranch },
  { labelKey: 'menu_commissionDist',  page: 'CommissionDist',     icon: DollarSign },
  { labelKey: 'menu_rankProgress',    page: 'RankProgress',       icon: Award },
  { labelKey: 'menu_teamLeaderboard', page: 'TeamLeaderboard',    icon: BarChart3 },
  { labelKey: 'menu_regionalDist',    page: 'RegionalDistributor',icon: MapPin },
  { labelKey: 'menu_myTeam',          page: 'MyTeam',             icon: Users },
];

// SOF Sales Partner — separate nav entry (not in PARTNER_FULL_ITEMS)
const SOF_SALES_PARTNER_ITEM = { label: 'SOF Sales Partner', page: 'SOFSalesPartnerDashboard', icon: Briefcase };

// Lite mode: only these page keys are visible
const LITE_ALLOWED_PAGES = new Set([
  'Home','GlobalMarkets','Markets','MarketHeatmap','CopyTrading','Trade',
  'Wallet','Portfolio','SOFSalesPartnerDashboard','PartnerHub','Announcements','Account','Profile',
]);

// Lite mode: sections to show (by labelKey)
const LITE_ALLOWED_SECTIONS = new Set([
  'menu_trading','menu_portfolio_hub',
]);

// Lite: simplified labels for certain pages
const LITE_LABELS = { Trade: '트레이드 (매수/매도)', Markets: '마켓', GlobalMarkets: '글로벌 마켓' };

const ACCOUNT_LINK_KEYS = [
  { labelKey: 'menu_account',       page: 'Account',       icon: User },
  { labelKey: 'menu_activity',      page: 'Activity',      icon: Activity },
  { labelKey: 'menu_notifications', page: 'Notifications', icon: Bell },
  { labelKey: 'menu_settings',      page: 'Profile',       icon: Settings },
  { labelKey: 'menu_support',       page: 'Home',          icon: HelpCircle },
];

export default function AppMenu({ isOpen, onClose, currentPage }) {
  const [govExpanded, setGovExpanded] = useState(false);
  const [partnerExpanded, setPartnerExpanded] = useState(false);
  const [otcExpanded, setOtcExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useLang();
  const { isPartnerApproved, isPartnerPending, userType } = useUserType();
  const { mode, isLite, isSalesPartner } = useUserMode();

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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-[#00d4aa]/10 text-[#00d4aa]'
            : 'text-slate-300 hover:text-white hover:bg-[#151c2e]'
        }`}
        style={isActive ? { boxShadow: '0 0 0 1px rgba(0,212,170,0.15), inset 0 0 20px rgba(0,212,170,0.04)' } : {}}
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
        className="relative w-72 max-w-[85vw] h-full bg-[#0d1220] border-r border-[rgba(148,163,184,0.07)] flex flex-col overflow-y-auto transition-transform duration-300"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: visible ? '4px 0 40px rgba(0,0,0,0.6), 4px 0 80px rgba(0,0,0,0.3)' : 'none',
        }}
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

        {/* Mode toggle in header */}
        <div className="px-3 pt-3 pb-1">
          <UserModeToggle compact />
        </div>

        {/* Home quick link */}
        <div className="px-3 pt-1">
          <Link to={createPageUrl('Home')} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${currentPage === 'Home' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-300 hover:text-white hover:bg-[#151c2e]'}`}>
            <Home className={`w-4 h-4 flex-shrink-0 transition-colors ${currentPage === 'Home' ? 'text-[#00d4aa]' : 'text-slate-500 group-hover:text-[#00d4aa]'}`} />
            <span className="text-sm font-medium">{t('menu_home')}</span>
          </Link>
        </div>

        {/* Nav sections */}
        <div className="flex-1 px-3 py-2 space-y-4">
          {/* Sales Partner mode: focused operational menu */}
          {isSalesPartner && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">영업 파트너 메뉴</p>
              <div className="space-y-0.5">
                {[
                  { label: '홈 (영업 요약)', page: 'Home', icon: Home },
                  { label: 'SOF Sales Partner', page: 'SOFSalesPartnerDashboard', icon: Briefcase },
                  { label: '파트너 대시보드', page: 'PartnerHub', icon: Star },
                  { label: '제출 내역', page: 'MySubmissions', icon: FileText },
                  { label: '하부 관리', page: 'DownlineTree', icon: GitBranch },
                  { label: '추천인 관리', page: 'FuturesReferral', icon: Users },
                  { label: '지갑', page: 'Wallet', icon: Wallet },
                  { label: '공지사항', page: 'Announcements', icon: Bell },
                  { label: '계정', page: 'Account', icon: User },
                ].map(item => <NavLink key={item.page} item={item} />)}
              </div>
            </div>
          )}

          {/* Lite mode: quick links */}
          {isLite && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">빠른 메뉴</p>
              <div className="space-y-0.5">
                {[
                  { label: '글로벌 마켓', page: 'GlobalMarkets', icon: Globe },
                  { label: '마켓', page: 'Markets', icon: BarChart3 },
                  { label: '시장 히트맵', page: 'MarketHeatmap', icon: Flame },
                  { label: '카피 트레이딩', page: 'CopyTrading', icon: Copy },
                  { label: '트레이드 (매수/매도)', page: 'Trade', icon: TrendingUp },
                  { label: '지갑', page: 'Wallet', icon: Wallet },
                  { label: '내 투자', page: 'Portfolio', icon: Layers },
                  { label: '공지사항', page: 'Announcements', icon: Bell },
                  { label: '계정', page: 'Account', icon: User },
                ].map(item => <NavLink key={item.page} item={item} />)}
              </div>
            </div>
          )}

          {/* Pro mode: full nav sections */}
          {!isLite && !isSalesPartner && NAV_SECTIONS.map(section => (
            <div key={section.label || section.labelKey}>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{section.label || t(section.labelKey)}</p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  if (item.highlight) {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' : 'bg-[#8b5cf6]/8 border border-[#8b5cf6]/15 text-[#a78bfa] hover:bg-[#8b5cf6]/15 hover:text-[#c4b5fd]'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0 text-[#8b5cf6]" />
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/25">NEW</span>
                      </Link>
                    );
                  }
                  return <NavLink key={(item.labelKey || '') + item.page} item={item} />;
                })}
              </div>
            </div>
          ))}

          {/* OTC — Pro mode only */}
          {!isLite && !isSalesPartner && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">OTC</p>
              <button onClick={() => setOtcExpanded(v => !v)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group">
                <Layers className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
                <span className="text-sm font-medium flex-1 text-left">OTC Overview</span>
                <span className="text-[9px] text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded-lg border border-[#00d4aa]/20 mr-1">NEW</span>
                {otcExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              </button>
              {otcExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                  {[
                    { label: 'OTC Overview',      page: 'OTCOverview',         icon: Layers },
                    { label: 'P2P Exchange',       page: 'P2PRWAExchange',      icon: ArrowDownUp },
                    { label: 'Real Estate OTC',    page: 'RealEstateP2P',       icon: Building2 },
                    { label: 'Gold OTC',           page: 'GoldP2PMarket',       icon: DollarSign },
                    { label: 'Block Trade Desk',   page: 'OTCBlockTrade',       icon: Package },
                    { label: 'Physical Delivery',  page: 'MyDeliveryRequests',  icon: Truck },
                    { label: 'My OTC Orders',      page: 'MyP2POrders',         icon: Archive },
                    { label: 'My OTC Listings',    page: 'MyOTCListings',       icon: FileText },
                    { label: 'Support & Dispute',  page: 'OTCSupportDispute',   icon: HelpCircle },
                  ].map(item => { const Icon = item.icon; const isActive = currentPage === item.page; return (
                    <Link key={item.page} to={createPageUrl(item.page)} onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group ${
                        isActive ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-[#00d4aa]' : 'text-slate-600 group-hover:text-[#00d4aa]'}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );})}
                </div>
              )}
            </div>
          )}

          {/* Partner Hub — access controlled */}
          {!isSalesPartner && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_partnerHub')}</p>
            {isPartnerApproved ? (
              <>
                <button onClick={() => setPartnerExpanded(v => !v)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group">
                  <UserCheck className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 text-left">{t('menu_partnerHubMain')}</span>
                  <span className="text-[9px] text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded-lg border border-[#00d4aa]/20 mr-1">Approved</span>
                  {partnerExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                </button>
                {partnerExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                    {PARTNER_FULL_ITEMS.map(item => { const Icon = item.icon; return (
                      <Link key={item.labelKey} to={createPageUrl(item.page)} onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all group">
                        <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
                        <span className="text-xs font-medium">{t(item.labelKey)}</span>
                      </Link>
                    );})}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-0.5">
                <Link to={createPageUrl('PartnerHub')} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group">
                  <Rocket className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{t('menu_applyDistributor') || 'Apply as Distributor'}</span>
                </Link>
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
          )}

          {/* SOF Sales Partner — fully separate from Partner Hub */}
          {!isSalesPartner && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_sof_sales') || 'SOF Sales'}</p>
              <NavLink item={SOF_SALES_PARTNER_ITEM} />
            </div>
          )}

          {!isSalesPartner && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_dao')}</p>
            <button onClick={() => setGovExpanded(v => !v)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all group">
              <Vote className="w-4 h-4 text-slate-500 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">{t('menu_governance')}</span>
              {govExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </button>
            {govExpanded && (
              <div className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l border-[rgba(148,163,184,0.08)]">
                {GOVERNANCE_ITEM_KEYS.map(item => { const Icon = item.icon; return (
                  <Link key={item.labelKey} to={createPageUrl(item.page)} onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all group">
                    <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00d4aa] transition-colors flex-shrink-0" />
                    <span className="text-xs font-medium">{t(item.labelKey)}</span>
                  </Link>
                );})}
              </div>
            )}
          </div>
          )}

          {!isSalesPartner && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('menu_account')}</p>
            <div className="space-y-0.5">
              {ACCOUNT_LINK_KEYS.map(item => <NavLink key={item.labelKey} item={item} />)}
            </div>
          </div>
          )}

          {isSalesPartner && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">계정</p>
              <div className="space-y-0.5">
                {ACCOUNT_LINK_KEYS.map(item => <NavLink key={item.labelKey} item={item} />)}
              </div>
            </div>
          )}
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