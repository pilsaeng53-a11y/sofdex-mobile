import React, { useEffect } from 'react';
import { useLang } from './LanguageContext';
import { validateTranslationCompliance } from '@/lib/translationValidator';

/**
 * Translation Guard Component
 * Validates that all content is properly translated
 * Logs warnings in development for missing translations
 */
export const useTranslationGuard = (componentName, keysUsed = []) => {
  const { t } = useLang();

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Check if all keys have valid translations
      keysUsed.forEach(key => {
        const result = t(key);
        if (result === key) {
          console.warn(
            `[Translation Guard] Missing translation for key: "${key}" in component: ${componentName}`
          );
        }
      });
    }
  }, [componentName, keysUsed, t]);

  return { t };
};

/**
 * Safe Translation Component
 * Safely renders translated text with fallback protection
 */
export const SafeText = ({ k, fallback = '', children }) => {
  const { t } = useLang();
  
  if (!k) return <>{children}</>;
  
  const translated = t(k);
  
  // Detect if translation key is missing (returns raw key)
  if (translated === k) {
    console.warn(`Missing translation: ${k}`);
    return <span title={`Missing: ${k}`}>{fallback || translated}</span>;
  }
  
  return <>{translated}</>;
};

/**
 * Validates component has useLang and all strings use t()
 * Run in development to catch translation issues early
 */
export const validateComponentTranslations = (componentName, componentModule) => {
  if (!import.meta.env.DEV) return;

  try {
    const code = componentModule.toString();
    
    // Check 1: useLang import
    if (code.includes('return') && !code.includes('useLang')) {
      console.warn(
        `[Translation Validator] ${componentName}: Missing useLang hook import`
      );
    }
    
    // Check 2: Look for suspicious hardcoded strings (very basic)
    const suspiciousPatterns = [
      />Welcome</,
      />Loading</,
      />Error</,
      /placeholder="[A-Z]/,
      /title="[A-Z]/,
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        console.warn(
          `[Translation Validator] ${componentName}: Possible hardcoded string detected`
        );
      }
    });
  } catch (e) {
    // Silent fail if can't analyze
  }
};

/**
 * Translation compliance report (for QA/testing)
 */
export const generateTranslationReport = (components = []) => {
  const report = {
    timestamp: new Date().toISOString(),
    totalComponents: components.length,
    compliant: 0,
    issues: [],
  };

  components.forEach(({ name, code }) => {
    if (code.includes('useLang') && code.includes("t('")) {
      report.compliant++;
    } else {
      report.issues.push({
        component: name,
        reason: !code.includes('useLang')
          ? 'Missing useLang hook'
          : 'No t() calls found',
      });
    }
  });

  report.complianceRate = Math.round(
    (report.compliant / report.totalComponents) * 100
  );

  return report;
};

export default SafeText;