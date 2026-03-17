/**
 * Translation Manager - Structured Key System with Auto-Detection
 * Implements:
 * - Hierarchical translation keys (section.subsection.element)
 * - Language auto-detection (localStorage → browser → fallback)
 * - Manual language switching with persistence
 * - Fallback to English for missing keys
 * - Type-safe key validation
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
];

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'sofdex_language';

/**
 * Get user's preferred language with intelligent fallback
 * Priority: localStorage → browser language → fallback to English
 */
export function detectLanguage() {
  // 1. Check localStorage for user preference
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
    return browserLang;
  }

  // 3. Fallback to English
  return DEFAULT_LANGUAGE;
}

/**
 * Save user's language preference
 */
export function setUserLanguage(langCode) {
  if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
    localStorage.setItem(STORAGE_KEY, langCode);
    // Apply to document
    document.documentElement.lang = langCode;
    // For RTL languages (if added in future)
    document.documentElement.dir = 'ltr';
  }
}

/**
 * Get translation with hierarchical fallback
 * Supports: common.submit, wallet.balance, trade.buy.signal, etc.
 */
export function getTranslation(key, language, translations) {
  // Validate key format
  if (!key || typeof key !== 'string') {
    console.warn('[Translation] Invalid key:', key);
    return key;
  }

  const keys = key.split('.');
  
  // Try to get translation in requested language
  let value = translations[language];
  for (const part of keys) {
    value = value?.[part];
  }

  // If found, return it
  if (value) {
    return value;
  }

  // Fallback to English if not found
  if (language !== DEFAULT_LANGUAGE) {
    let enValue = translations[DEFAULT_LANGUAGE];
    for (const part of keys) {
      enValue = enValue?.[part];
    }
    if (enValue) {
      console.warn(`[Translation] Missing key in ${language}: ${key}, falling back to English`);
      return enValue;
    }
  }

  // If still not found, return key with warning
  console.warn(`[Translation] Missing key: ${key}`);
  return key;
}

/**
 * Restructure flat translation keys into hierarchical object
 * Converts: { 'common.submit': 'Submit', 'wallet.balance': 'Balance' }
 * To: { common: { submit: 'Submit' }, wallet: { balance: 'Balance' } }
 */
export function structureTranslations(flatTranslations) {
  const structured = {};

  Object.entries(flatTranslations).forEach(([key, value]) => {
    const keys = key.split('.');
    let current = structured;

    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  });

  return structured;
}

/**
 * Validate that all translation keys exist in all languages
 * Returns missing keys per language
 */
export function validateTranslationCompleteness(translations) {
  const allKeys = new Set();
  const languages = Object.keys(translations);

  // Collect all keys from all languages
  languages.forEach(lang => {
    const flatKeys = flattenKeys(translations[lang]);
    flatKeys.forEach(key => allKeys.add(key));
  });

  // Check each language has all keys
  const missing = {};
  languages.forEach(lang => {
    const langKeys = new Set(flattenKeys(translations[lang]));
    const missingInLang = Array.from(allKeys).filter(key => !langKeys.has(key));
    if (missingInLang.length > 0) {
      missing[lang] = missingInLang;
    }
  });

  return missing;
}

/**
 * Helper: Flatten nested object keys
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else if (typeof value === 'string') {
      keys.push(fullKey);
    }
  });

  return keys;
}

/**
 * Create organized translation namespace
 * Ensures keys follow [section].[subsection].[element] pattern
 */
export const TranslationNamespaces = {
  // Common reusable keys
  COMMON: {
    CONNECT: 'common.connect',
    CONFIRM: 'common.confirm',
    CANCEL: 'common.cancel',
    LOADING: 'common.loading',
    ERROR: 'common.error',
    SUCCESS: 'common.success',
    SUBMIT: 'common.submit',
    BACK: 'common.back',
    CLOSE: 'common.close',
  },

  // Wallet
  WALLET: {
    TITLE: 'wallet.title',
    BALANCE: 'wallet.balance',
    CONNECT: 'wallet.connect',
    DISCONNECT: 'wallet.disconnect',
    ADDRESS: 'wallet.address',
    NETWORK: 'wallet.network',
  },

  // Trading
  TRADE: {
    BUY: 'trade.buy',
    SELL: 'trade.sell',
    MARKET: 'trade.market',
    LIMIT: 'trade.limit',
    SIGNAL: 'trade.signal',
    POSITIONS: 'trade.positions',
  },

  // AI
  AI: {
    SCORE: 'ai.score',
    CONFIDENCE: 'ai.confidence',
    BUY_SIGNAL: 'ai.buy_signal',
    SELL_SIGNAL: 'ai.sell_signal',
    REASONING: 'ai.reasoning',
  },

  // Strategy
  STRATEGY: {
    CREATE: 'strategy.create',
    EXPLORE: 'strategy.explore',
    SUBSCRIBE: 'strategy.subscribe',
    ROI: 'strategy.roi',
    DESCRIPTION: 'strategy.description',
  },

  // Governance
  GOVERNANCE: {
    PROPOSAL: 'governance.proposal',
    VOTE: 'governance.vote',
    VOTING_POWER: 'governance.voting_power',
  },

  // Status messages
  STATUS: {
    ACTIVE: 'status.active',
    PENDING: 'status.pending',
    COMPLETED: 'status.completed',
    FAILED: 'status.failed',
  },

  // Errors
  ERRORS: {
    NETWORK_ERROR: 'error.network',
    CONNECTION_FAILED: 'error.connection',
    SOMETHING_WENT_WRONG: 'error.general',
  },
};