# Translation Implementation Guide

**For every hardcoded text issue, follow this exact pattern:**

---

## Pattern 1: Replace Hardcoded Strings

### ❌ WRONG
```jsx
<h1>Welcome to SOFDex</h1>
<p>Start trading today</p>
<button>Get Started</button>
```

### ✅ CORRECT
```jsx
import { useLang } from '@/components/shared/LanguageContext';

export default function MyComponent() {
  const { t } = useLang();
  
  return (
    <>
      <h1>{t('home_welcome_title')}</h1>
      <p>{t('home_welcome_subtitle')}</p>
      <button>{t('common_connect')}</button>
    </>
  );
}
```

---

## Pattern 2: When Key is Missing

If `home_welcome_title` doesn't exist in i18n.js:

1. Add to i18n.js BOTH languages:
```javascript
// EN
home_welcome_title: 'Welcome to SOFDex',

// KO
home_welcome_title: '솔포트에 오신 것을 환영합니다',
```

2. Use in component:
```jsx
<h1>{t('home_welcome_title')}</h1>
```

---

## Pattern 3: Detail-Level Content (Descriptions, Explanations)

### ❌ WRONG
```jsx
<div className="strategy-detail">
  <h2>Strategy Description</h2>
  <p>This strategy uses a combination of technical analysis and price action patterns.</p>
</div>
```

### ✅ CORRECT
```jsx
const { t } = useLang();

<div className="strategy-detail">
  <h2>{t('strategy_description')}</h2>
  <p>{t('strategy_detail_breakout_example')}</p>
</div>

// In i18n.js - TRANSLATE THESE:
// strategy_description: 'Strategy Description',
// strategy_detail_breakout_example: 'This strategy uses a combination of technical analysis and price action patterns.',
```

---

## Pattern 4: Error Messages & Status Text

### ❌ WRONG
```jsx
if (error) {
  return <div>Something went wrong. Please try again.</div>;
}
if (loading) {
  return <div>Loading data...</div>;
}
```

### ✅ CORRECT
```jsx
const { t } = useLang();

if (error) {
  return <div>{t('error_something_went_wrong')}</div>;
}
if (loading) {
  return <div>{t('status_loading_data')}</div>;
}

// In i18n.js:
// error_something_went_wrong: 'Something went wrong. Please try again.',
// status_loading_data: 'Loading data...',
```

---

## Quick Reference: Implementation Order

1. **Import useLang**: `import { useLang } from '@/components/shared/LanguageContext';`
2. **Get t function**: `const { t } = useLang();`
3. **Replace strings**: `<h1>{t('key_name')}</h1>`
4. **Add to i18n.js**: Both English and Korean (and other languages)
5. **Test**: Switch language and verify UI updates

---

## This applies to:
- Page titles & headers
- Button labels
- Form labels & placeholders
- Error messages
- Status messages
- Description text
- AI explanations
- Signal descriptions
- Strategy details
- Governance proposals
- Community content
- Partner descriptions
- Institutional messaging
- Tooltip text
- Empty state messages
- All visible UI text

**NO EXCEPTIONS. EVERY TEXT ELEMENT MUST BE TRANSLATED.**