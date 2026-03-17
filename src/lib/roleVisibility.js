/**
 * roleVisibility.js — Centralized role-based visibility logic for SOFDex.
 *
 * All feature-gating logic lives here so that:
 * 1. Components stay clean (no scattered role checks)
 * 2. Future server-side role integration has a single point to update
 * 3. Consistent behavior across all pages
 *
 * User types: 'beginner' | 'trader' | 'investor' | 'partner'
 * Partner status: 'none' | 'pending' | 'approved'
 */

/**
 * Feature flags keyed by feature name.
 * Each entry is an array of user types that have access,
 * or a function (userType, partnerStatus) => boolean for complex rules.
 */
const FEATURE_ACCESS = {
  // Trading features — available to all
  trade:            () => true,
  markets:          () => true,
  copyTrading:      () => true,
  heatmap:          () => true,
  swap:             () => true,

  // Portfolio features — all users
  portfolio:        () => true,
  wallet:           () => true,

  // AI features — all users (beginner gets simplified view)
  aiIntelligence:   () => true,
  aiWealthManager:  () => true,
  aiSignals:        () => true,

  // Strategy features — investors and traders see full detail
  strategyMarketplace:    () => true,
  strategyVaults:         () => true,
  strategyETF:            () => true,
  strategyCreate:         (type) => type === 'trader' || type === 'partner',
  strategyFullDetail:     (type) => type !== 'beginner',

  // Community — all
  community:        () => true,

  // Partner Hub — requires approved status
  partnerDashboard: (type, partnerStatus) => partnerStatus === 'approved',
  partnerDownline:  (type, partnerStatus) => partnerStatus === 'approved',
  partnerCommission:(type, partnerStatus) => partnerStatus === 'approved',
  partnerApply:     (type, partnerStatus) => partnerStatus !== 'approved',

  // Institutional — advanced users only (gated by institutional gate component)
  institutional:    () => true, // gate handled internally

  // Launchpad, governance — all
  launchpad:        () => true,
  governance:       () => true,

  // Advanced trader tools
  fundingRates:     (type) => type !== 'beginner',
  openInterest:     (type) => type !== 'beginner',
  liquidationFeed:  (type) => type !== 'beginner',
  whaleTracker:     (type) => type !== 'beginner',
  tradingTools:     (type) => type !== 'beginner',
};

/**
 * Check if a user has access to a specific feature.
 * @param {string} feature - Feature key from FEATURE_ACCESS
 * @param {string} userType - 'beginner' | 'trader' | 'investor' | 'partner'
 * @param {string} partnerStatus - 'none' | 'pending' | 'approved'
 * @returns {boolean}
 */
export function canAccess(feature, userType, partnerStatus = 'none') {
  const rule = FEATURE_ACCESS[feature];
  if (!rule) return true; // unknown feature = allow by default
  return rule(userType, partnerStatus);
}

/**
 * Returns the user-facing tier label for display.
 * @param {string} userType
 * @param {string} partnerStatus
 * @returns {string}
 */
export function getUserTierLabel(userType, partnerStatus) {
  if (partnerStatus === 'approved') return 'Partner';
  if (partnerStatus === 'pending') return 'Pending Partner';
  switch (userType) {
    case 'trader':   return 'Trader';
    case 'investor': return 'Investor';
    case 'beginner': return 'Explorer';
    default:         return 'Explorer';
  }
}

/**
 * Returns tier badge color classes.
 */
export function getTierBadgeClass(userType, partnerStatus) {
  if (partnerStatus === 'approved') return 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20';
  if (partnerStatus === 'pending') return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  switch (userType) {
    case 'trader':   return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'investor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:         return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

/**
 * Returns the home page layout priority for a user type.
 * Higher priority items show first on the home page.
 */
export function getHomePriority(userType) {
  switch (userType) {
    case 'trader':
      return ['hotAssets', 'aiSignals', 'positions', 'heatmap', 'feed', 'news'];
    case 'investor':
      return ['portfolio', 'aiIntelligence', 'strategies', 'hotAssets', 'news'];
    case 'partner':
      return ['partnerStats', 'hotAssets', 'aiIntelligence', 'portfolio', 'news'];
    default: // beginner
      return ['welcome', 'hotAssets', 'aiOpportunity', 'topTraders', 'news'];
  }
}

/**
 * Returns beginner-friendly explanations for features.
 */
export const FEATURE_DESCRIPTIONS = {
  trade: {
    en: 'Open long or short positions on crypto and tokenized assets with up to 50x leverage.',
    ko: '최대 50배 레버리지로 암호화폐 및 토큰화 자산의 롱 또는 숏 포지션을 개설합니다.',
  },
  copyTrading: {
    en: 'Automatically copy trades from top-performing traders. Set your budget and let experts do the work.',
    ko: '최고 성과 트레이더의 거래를 자동으로 복사합니다. 예산을 설정하고 전문가가 일하게 하세요.',
  },
  aiIntelligence: {
    en: 'AI-powered market analysis with real-time signals, sector tracking, and portfolio recommendations.',
    ko: 'AI 기반 시장 분석으로 실시간 신호, 섹터 추적, 포트폴리오 추천을 제공합니다.',
  },
  strategyMarketplace: {
    en: 'Browse and subscribe to proven trading strategies from expert creators.',
    ko: '전문 크리에이터의 검증된 트레이딩 전략을 검색하고 구독합니다.',
  },
};