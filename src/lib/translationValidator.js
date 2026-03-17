/**
 * Translation Validation System
 * Detects hardcoded strings, missing keys, mixed languages, and raw keys
 */

import { translations } from '@/components/shared/i18n';

/**
 * Check if a translation key exists in all required languages
 */
export const keyExists = (key, languages = ['en', 'ko']) => {
  return languages.every(lang => 
    translations[lang] && translations[lang].hasOwnProperty(key)
  );
};

/**
 * Get translation with fallback to English, then return key if missing
 */
export const safeTranslate = (t, key, fallbackLang = 'en') => {
  if (!key) return '';
  
  // Try to call t() if available
  if (t && typeof t === 'function') {
    const result = t(key);
    
    // Check if result is a raw key (untranslated)
    if (result === key || result.includes('_') && result === result.toLowerCase()) {
      console.warn(`Missing translation key: ${key}`);
      return result; // Still return the key, but warn
    }
    return result;
  }
  
  return key;
};

/**
 * Detect hardcoded strings in React components
 * Returns list of potential hardcoded text
 */
export const detectHardcodedStrings = (componentText) => {
  const issues = [];
  
  // Pattern 1: Direct string literals in JSX
  // <h1>Welcome</h1> but not <h1>{variable}</h1>
  const jsxStringPattern = />([^<{]*[A-Z][^<{]*?)</g;
  let match;
  while ((match = jsxStringPattern.exec(componentText)) !== null) {
    const text = match[1].trim();
    if (text && !text.startsWith('{') && text.length > 2) {
      issues.push({
        type: 'hardcoded_string',
        text: text,
        line: componentText.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Pattern 2: Strings in attributes (placeholder, title, aria-label, etc.)
  const attrPattern = /(placeholder|title|aria-label|label)="([^"]+)"/g;
  while ((match = attrPattern.exec(componentText)) !== null) {
    const text = match[2];
    if (!text.startsWith('{') && text.length > 2) {
      issues.push({
        type: 'hardcoded_attribute',
        attribute: match[1],
        text: text,
        line: componentText.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return issues;
};

/**
 * Detect missing translation keys
 */
export const detectMissingKeys = (usedKeys) => {
  const missing = [];
  
  usedKeys.forEach(key => {
    if (!keyExists(key)) {
      missing.push(key);
    }
  });
  
  return missing;
};

/**
 * Detect mixed-language UI (English text in Korean component or vice versa)
 * This is harder to automate, but we can flag components without useLang import
 */
export const detectMissingLangHook = (componentText) => {
  const hasUseLang = componentText.includes("useLang");
  const hasJSXContent = componentText.includes("return") && componentText.includes("<");
  
  if (hasJSXContent && !hasUseLang) {
    return true; // Likely missing useLang hook
  }
  
  return false;
};

/**
 * Detect raw translation keys being rendered (should be caught by fallback)
 */
export const detectRawKeys = (componentText) => {
  // Pattern: t('some_key_name') where the result might be a raw key
  const tPattern = /t\('([a-z_]+)'\)/g;
  const keys = [];
  let match;
  
  while ((match = tPattern.exec(componentText)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
};

/**
 * Full translation audit for a component
 */
export const auditComponent = (componentName, componentText) => {
  const audit = {
    component: componentName,
    timestamp: new Date().toISOString(),
    issues: [],
    warnings: [],
    score: 0
  };
  
  // Check 1: Hardcoded strings
  const hardcoded = detectHardcodedStrings(componentText);
  if (hardcoded.length > 0) {
    audit.issues.push({
      severity: 'high',
      type: 'hardcoded_text',
      count: hardcoded.length,
      examples: hardcoded.slice(0, 3).map(h => h.text)
    });
  }
  
  // Check 2: Missing useLang hook
  if (detectMissingLangHook(componentText)) {
    audit.warnings.push({
      severity: 'medium',
      type: 'missing_uselang_hook',
      message: 'Component has JSX but no useLang hook imported'
    });
  }
  
  // Check 3: Missing translation keys
  const usedKeys = detectRawKeys(componentText);
  const missingKeys = detectMissingKeys(usedKeys);
  if (missingKeys.length > 0) {
    audit.issues.push({
      severity: 'high',
      type: 'missing_translation_keys',
      keys: missingKeys
    });
  }
  
  // Calculate score (out of 100)
  let score = 100;
  score -= hardcoded.length * 5; // -5 per hardcoded string
  score -= (missingKeys.length * 10); // -10 per missing key
  audit.score = Math.max(0, score);
  
  return audit;
};

/**
 * Validate that all text rendering uses translation keys
 */
export const validateTranslationCompliance = (componentCode) => {
  const issues = [];
  
  // Check for t() usage in component
  const hasTUsage = componentCode.includes("t('") || componentCode.includes('t("');
  
  if (!hasTUsage) {
    // Check if component has JSX
    if (componentCode.includes('<') && componentCode.includes('>')) {
      issues.push({
        type: 'no_translation_usage',
        severity: 'high',
        message: 'Component contains JSX but does not use t() for text'
      });
    }
  }
  
  // Check for raw translation key rendering
  const rawKeyPattern = /\{t\('([a-z_]+)'\)\}/g;
  let match;
  const keysUsed = [];
  while ((match = rawKeyPattern.exec(componentCode)) !== null) {
    keysUsed.push(match[1]);
  }
  
  // Verify all keys exist
  const missingKeys = keysUsed.filter(key => !keyExists(key));
  if (missingKeys.length > 0) {
    issues.push({
      type: 'missing_translation_keys',
      severity: 'high',
      keys: missingKeys,
      message: `Missing translations for: ${missingKeys.join(', ')}`
    });
  }
  
  return {
    passed: issues.length === 0,
    issues: issues,
    keysUsed: keysUsed
  };
};

/**
 * Create missing translation keys with fallback English
 */
export const createMissingTranslationKeys = (keys, fallbackTexts = {}) => {
  const newEntries = {};
  
  keys.forEach(key => {
    if (!keyExists(key)) {
      const fallback = fallbackTexts[key] || key.replace(/_/g, ' ').toUpperCase();
      
      newEntries[key] = {
        en: fallback,
        ko: `[번역 필요: ${fallback}]` // Korean fallback indicating translation needed
      };
    }
  });
  
  return newEntries;
};

export default {
  keyExists,
  safeTranslate,
  detectHardcodedStrings,
  detectMissingKeys,
  detectMissingLangHook,
  detectRawKeys,
  auditComponent,
  validateTranslationCompliance,
  createMissingTranslationKeys
};