/**
 * Region Detection Service
 * Determines user's region from: language preference, browser locale, timezone
 * Maps region to personalization defaults (currency, assets, news priorities)
 */

// Region definitions
export const REGIONS = {
  KO: {
    code: 'KO',
    name: 'Korea',
    nativeName: '한국',
    languages: ['ko'],
    defaultCurrency: 'KRW',
    timeZones: ['Asia/Seoul'],
    focusAssets: ['BTC', 'ETH', 'XRP', 'SOL', 'GOLD'],
    newsEmphasis: ['crypto', 'tech', 'macro'],
    cryptoFocus: 0.8, // crypto emphasis (0-1)
    macroFocus: 0.3,  // macro/FX emphasis
    aiStrategiesEmphasis: 0.7,
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    nativeName: '日本',
    languages: ['ja'],
    defaultCurrency: 'JPY',
    timeZones: ['Asia/Tokyo'],
    focusAssets: ['BTC', 'GOLD', 'JPY', 'ETH', 'SOL'],
    newsEmphasis: ['macro', 'fxsensitive', 'crypto'],
    cryptoFocus: 0.6,
    macroFocus: 0.8,  // strong macro/FX focus
    aiStrategiesEmphasis: 0.6,
  },
  US: {
    code: 'US',
    name: 'United States',
    nativeName: 'United States',
    languages: ['en'],
    defaultCurrency: 'USD',
    timeZones: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
    ],
    focusAssets: ['BTC', 'ETH', 'SPY', 'GOLD', 'SOL'],
    newsEmphasis: ['macro', 'institutional', 'crypto'],
    cryptoFocus: 0.65,
    macroFocus: 0.85, // strong macro/institutional focus
    aiStrategiesEmphasis: 0.75,
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global',
    nativeName: 'Global',
    languages: ['en', 'fr', 'de', 'es', 'pt', 'tr', 'ru', 'ar', 'hi', 'id', 'vi', 'th', 'zh', 'zhTW'],
    defaultCurrency: 'USD',
    timeZones: [],
    focusAssets: ['BTC', 'ETH', 'SOL', 'GOLD', 'SPY'],
    newsEmphasis: ['macro', 'crypto', 'institutional'],
    cryptoFocus: 0.7,
    macroFocus: 0.75,
    aiStrategiesEmphasis: 0.7,
  },
};

// Language to region mapping
const LANGUAGE_TO_REGION = {
  ko: 'KO',
  ja: 'JP',
  en: 'US',
  zh: 'GLOBAL',
  zhTW: 'GLOBAL',
  es: 'GLOBAL',
  fr: 'GLOBAL',
  de: 'GLOBAL',
  pt: 'GLOBAL',
  ar: 'GLOBAL',
  ru: 'GLOBAL',
  tr: 'GLOBAL',
  hi: 'GLOBAL',
  id: 'GLOBAL',
  vi: 'GLOBAL',
  th: 'GLOBAL',
};

// Browser locale to region mapping
const LOCALE_TO_REGION = {
  'ko-KR': 'KO',
  'ja-JP': 'JP',
  'en-US': 'US',
  'en-GB': 'US',
  'en-AU': 'US',
  'zh-CN': 'GLOBAL',
  'zh-TW': 'GLOBAL',
};

// Timezone to region mapping
const TIMEZONE_TO_REGION = {
  'Asia/Seoul': 'KO',
  'Asia/Tokyo': 'JP',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
};

/**
 * Detect user's region from multiple signals
 * Priority: saved preference > language > browser locale > timezone > fallback
 */
export function detectRegion(savedRegion, language, browserLocale, timezone) {
  // 1. Saved region preference (highest priority)
  if (savedRegion && REGIONS[savedRegion]) {
    return savedRegion;
  }

  // 2. From selected language
  if (language && LANGUAGE_TO_REGION[language]) {
    return LANGUAGE_TO_REGION[language];
  }

  // 3. From browser locale
  if (browserLocale && LOCALE_TO_REGION[browserLocale]) {
    return LOCALE_TO_REGION[browserLocale];
  }

  // 4. From timezone
  if (timezone && TIMEZONE_TO_REGION[timezone]) {
    return TIMEZONE_TO_REGION[timezone];
  }

  // 5. Fallback to global
  return 'GLOBAL';
}

/**
 * Get browser's navigator locale
 */
export function getBrowserLocale() {
  try {
    return navigator.language || navigator.userLanguage || 'en-US';
  } catch {
    return 'en-US';
  }
}

/**
 * Get user's timezone
 */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Get region configuration
 */
export function getRegionConfig(regionCode) {
  return REGIONS[regionCode] || REGIONS.GLOBAL;
}

/**
 * Get region's default currency
 */
export function getRegionDefaultCurrency(regionCode) {
  return getRegionConfig(regionCode).defaultCurrency;
}

/**
 * Get region's asset focus list
 * Returns assets in priority order for this region
 */
export function getRegionAssetFocus(regionCode) {
  return getRegionConfig(regionCode).focusAssets;
}

/**
 * Get region's news emphasis (what topics to prioritize)
 */
export function getRegionNewsEmphasis(regionCode) {
  return getRegionConfig(regionCode).newsEmphasis;
}

/**
 * Get personalization weights for region
 * Useful for adjusting UI emphasis and content ranking
 */
export function getRegionPersonalization(regionCode) {
  const config = getRegionConfig(regionCode);
  return {
    cryptoFocus: config.cryptoFocus,
    macroFocus: config.macroFocus,
    aiStrategiesEmphasis: config.aiStrategiesEmphasis,
  };
}

/**
 * Rank assets by region preference
 * Returns asset list sorted by regional relevance
 */
export function rankAssetsByRegion(assets, regionCode) {
  const focusAssets = getRegionAssetFocus(regionCode);
  
  return [...assets].sort((a, b) => {
    const aIndex = focusAssets.indexOf(a.symbol || a);
    const bIndex = focusAssets.indexOf(b.symbol || b);
    
    // Assets in focus list come first, in priority order
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return 0;
  });
}

/**
 * Rank news items by region relevance
 * Higher-relevance items come first
 */
export function rankNewsByRegion(newsItems, regionCode) {
  const emphasis = getRegionNewsEmphasis(regionCode);
  
  return [...newsItems].sort((a, b) => {
    // Score each news item by emphasis match
    const aScore = calculateNewsRelevance(a, emphasis);
    const bScore = calculateNewsRelevance(b, emphasis);
    
    return bScore - aScore; // Higher scores first
  });
}

function calculateNewsRelevance(newsItem, emphasis) {
  let score = 0;
  const content = (newsItem.title + ' ' + (newsItem.summary || '')).toLowerCase();
  
  // Keywords for each emphasis area
  const keywordMap = {
    crypto: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'token', 'sol', 'xrp'],
    macro: ['fed', 'interest', 'inflation', 'gdp', 'economic', 'rate', 'yield'],
    fxsensitive: ['yen', 'forex', 'fx', 'currency', 'jpy', 'exchange'],
    tech: ['tech', 'ai', 'gpu', 'semiconductor', 'startup'],
    institutional: ['institutional', 'etf', 'fund', 'sec', 'regulation'],
  };
  
  // Score based on emphasis weights
  emphasis.forEach((topic) => {
    if (keywordMap[topic]) {
      keywordMap[topic].forEach((keyword) => {
        if (content.includes(keyword)) {
          score += 10;
        }
      });
    }
  });
  
  return score;
}