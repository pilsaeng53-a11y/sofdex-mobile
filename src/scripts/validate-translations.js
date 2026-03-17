#!/usr/bin/env node

/**
 * Translation Validation Script
 * Runs before commit/build to catch untranslated content
 * 
 * Usage: node scripts/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

const TRANSLATION_ISSUES = {
  hardcoded: [],
  missingKeys: [],
  missingHook: [],
  mixedLanguage: []
};

// Load translations
let translations = {};
try {
  const i18nPath = path.join(__dirname, '../src/components/shared/i18n.js');
  const i18nContent = fs.readFileSync(i18nPath, 'utf-8');
  
  // Simple extraction of keys from i18n.js
  const enMatch = i18nContent.match(/en:\s*\{([^}]+)\}/s);
  if (enMatch) {
    const keys = enMatch[1].match(/(\w+):/g) || [];
    keys.forEach(key => {
      translations[key.replace(':', '')] = true;
    });
  }
  console.log(`✓ Loaded ${Object.keys(translations).length} translation keys\n`);
} catch (e) {
  console.error('❌ Failed to load translations:', e.message);
  process.exit(1);
}

// Scan component files
function scanDirectory(dir, extensions = ['.jsx', '.js']) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, dist, build
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        return;
      }
      
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, extensions));
      } else if (extensions.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    });
  } catch (e) {
    // Silent fail for unreadable directories
  }
  
  return files;
}

// Check file for translation issues
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip if not a React component
    if (!content.includes('return') || !content.includes('<')) {
      return;
    }
    
    // Check 1: Hardcoded strings (very basic)
    const suspiciousPatterns = [
      { pattern: />Welcome</, desc: 'Hardcoded "Welcome"' },
      { pattern: />Loading</, desc: 'Hardcoded "Loading"' },
      { pattern: />Error</, desc: 'Hardcoded "Error"' },
      { pattern: />Cancel</, desc: 'Hardcoded "Cancel"' },
      { pattern: /"[A-Z][a-z]+"/, desc: 'Possible hardcoded capitalized string' }
    ];
    
    suspiciousPatterns.forEach(({ pattern, desc }) => {
      if (pattern.test(content)) {
        // Don't flag if it's inside a comment or string literal
        const cleanedContent = content
          .replace(/\/\/.*$/gm, '') // Remove comments
          .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
        
        if (pattern.test(cleanedContent)) {
          TRANSLATION_ISSUES.hardcoded.push({
            file: relativePath,
            issue: desc
          });
        }
      }
    });
    
    // Check 2: Missing useLang hook
    const hasJSX = content.includes('return') && content.includes('<');
    const hasUseLang = content.includes('useLang');
    const hasT = content.includes("t('") || content.includes('t("');
    
    if (hasJSX && !hasUseLang && hasT) {
      TRANSLATION_ISSUES.missingHook.push({
        file: relativePath,
        issue: 'Uses t() but missing useLang import'
      });
    }
    
    // Check 3: Check for t() calls with missing keys
    const tCallPattern = /t\(['"]([a-z_]+)['"]\)/g;
    let match;
    while ((match = tCallPattern.exec(content)) !== null) {
      const keyName = match[1];
      // Only check if key looks valid (lowercase with underscores)
      if (!/^[a-z_]+$/.test(keyName) && !translations[keyName]) {
        TRANSLATION_ISSUES.missingKeys.push({
          file: relativePath,
          key: keyName,
          issue: `Missing translation key: ${keyName}`
        });
      }
    }
    
  } catch (e) {
    // Silent fail for unreadable files
  }
}

// Run validation
console.log('🔍 Scanning React components for translation issues...\n');

const srcPath = path.join(__dirname, '../src');
const files = scanDirectory(srcPath);

console.log(`📁 Found ${files.length} React component files\n`);

files.forEach(file => validateFile(file));

// Report results
console.log('\n📋 VALIDATION REPORT\n');
console.log('═'.repeat(50));

let issueCount = 0;

if (TRANSLATION_ISSUES.hardcoded.length > 0) {
  console.log(`\n⚠️  HARDCODED STRINGS (${TRANSLATION_ISSUES.hardcoded.length})`);
  TRANSLATION_ISSUES.hardcoded.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.file}: ${issue.issue}`);
  });
  if (TRANSLATION_ISSUES.hardcoded.length > 5) {
    console.log(`   ... and ${TRANSLATION_ISSUES.hardcoded.length - 5} more`);
  }
  issueCount += TRANSLATION_ISSUES.hardcoded.length;
}

if (TRANSLATION_ISSUES.missingHook.length > 0) {
  console.log(`\n⚠️  MISSING useLang HOOK (${TRANSLATION_ISSUES.missingHook.length})`);
  TRANSLATION_ISSUES.missingHook.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.file}: ${issue.issue}`);
  });
  if (TRANSLATION_ISSUES.missingHook.length > 5) {
    console.log(`   ... and ${TRANSLATION_ISSUES.missingHook.length - 5} more`);
  }
  issueCount += TRANSLATION_ISSUES.missingHook.length;
}

if (TRANSLATION_ISSUES.missingKeys.length > 0) {
  console.log(`\n❌ MISSING TRANSLATION KEYS (${TRANSLATION_ISSUES.missingKeys.length})`);
  const uniqueKeys = [...new Set(TRANSLATION_ISSUES.missingKeys.map(i => i.key))];
  uniqueKeys.slice(0, 5).forEach(key => {
    console.log(`   Key: "${key}"`);
  });
  if (uniqueKeys.length > 5) {
    console.log(`   ... and ${uniqueKeys.length - 5} more`);
  }
  issueCount += TRANSLATION_ISSUES.missingKeys.length;
}

if (issueCount === 0) {
  console.log('\n✅ NO ISSUES FOUND');
  console.log('\nAll components appear to use proper translation keys!');
  console.log('═'.repeat(50));
  process.exit(0);
} else {
  console.log(`\n═`.repeat(50));
  console.log(`\n❌ Found ${issueCount} potential translation issues`);
  console.log('\nTo fix:');
  console.log('1. Replace hardcoded text with t("key") calls');
  console.log('2. Import useLang hook if using t()');
  console.log('3. Add missing keys to components/shared/i18n.js');
  console.log('\nFix blocking: Enable strict mode to fail on missing translations\n');
  
  // Return non-zero exit code for CI/CD
  process.exit(1);
}