# Quick Translation Implementation Checklist

## For Each Page - Follow This Exact Sequence

### Step 1: Add Hook (30 seconds)
```jsx
// At top of file, add:
import { useLang } from '@/components/shared/LanguageContext';

// In component, add:
const { t } = useLang();
```

### Step 2: Find All Hardcoded Strings (2 minutes)
Look for:
- Text inside JSX: `<h1>Welcome</h1>`
- Attributes: `placeholder="Search"`, `title="Click"`, `aria-label="Menu"`
- Variable strings: `const message = "Hello"`
- Array labels: `{ label: "Option 1" }`

### Step 3: Replace with Translation Keys (3-5 minutes)
Pattern:
```jsx
// BEFORE
<h1>My Title</h1>
<button>Submit</button>
<p>Description text</p>

// AFTER
<h1>{t('page_title')}</h1>
<button>{t('common_submit')}</button>
<p>{t('page_description')}</p>
```

### Step 4: Add Missing Keys to i18n.js (2-3 minutes)
Find section in i18n.js, add both EN and KO:

```javascript
// In 'en' section:
page_title: 'My Title',
page_description: 'Description text',
common_submit: 'Submit',

// In 'ko' section:
page_title: '내 제목',
page_description: '설명 텍스트',
common_submit: '제출',
```

### Step 5: Validate (30 seconds)
```bash
node scripts/validate-translations.js
```

Expected output:
```
✅ NO ISSUES FOUND
All components appear to use proper translation keys!
```

### Step 6: Commit (1 minute)
```bash
git add pages/MyPage.jsx components/shared/i18n.js
git commit -m "Translate MyPage.jsx - 100% coverage"
```

**Total per page: ~10-12 minutes**

---

## Critical Items - Do NOT Skip

### ❌ Never Do This:
```jsx
// Bad - hardcoded
<h1>Welcome</h1>

// Bad - using raw key
<h1>my_page_title</h1>

// Bad - missing hook
export default function Page() {
  return <h1>{t('key')}</h1>; // ERROR: t is not defined
}

// Bad - key doesn't exist in i18n.js
<h1>{t('undefined_key')}</h1>
```

### ✅ Always Do This:
```jsx
// Good - imported hook
import { useLang } from '@/components/shared/LanguageContext';

export default function Page() {
  const { t } = useLang(); // ← Hook added
  
  return <h1>{t('page_title')}</h1>; // ← Key exists
}

// In i18n.js - both languages:
en: { page_title: 'Welcome' }
ko: { page_title: '환영합니다' }
```

---

## Pre-Flight Checks

Before running validator:
- [ ] All imports added
- [ ] All `t()` calls have matching keys
- [ ] All keys exist in i18n.js
- [ ] Both EN and KO translations added
- [ ] No hardcoded strings remain

Run: `node scripts/validate-translations.js`
- [ ] Returns exit code 0 (success)
- [ ] Shows "NO ISSUES FOUND"

---

## High-Priority Pages (Do These First)

### Batch 1 (5 pages) - ~1 hour
- [ ] Home.jsx
- [ ] Portfolio.jsx  
- [ ] Wallet.jsx
- [ ] Markets.jsx
- [ ] Trade.jsx

### Batch 2 (8 pages) - ~1.5 hours
- [ ] AIWealthManager.jsx
- [ ] AIIntelligence.jsx
- [ ] Governance.jsx
- [ ] StrategyMarketplace.jsx
- [ ] StrategyDetail.jsx
- [ ] PartnerHub.jsx
- [ ] Institutional.jsx
- [ ] TradingFeed.jsx

### Batch 3 (15+ pages) - ~2 hours
- [ ] All remaining pages
- [ ] All components

---

## Sample Translation Keys

### Use Existing Keys (Check Before Creating New)
```javascript
// These already exist - use them:
common_submit: 'Submit'
common_cancel: 'Cancel'
common_connect: 'Connect'
common_copy: 'Copy'
common_copied: 'Copied'
common_viewAll: 'View All'

status_active: 'Active'
status_pending: 'Pending'
status_completed: 'Completed'
status_loading: 'Loading...'
status_error: 'Error'

error_something_went_wrong: 'Something went wrong'
error_connection_failed: 'Connection failed'
error_try_again: 'Please try again'

wallet_balance: 'Total Balance'
wallet_connect: 'Connect Wallet'
wallet_connected: 'Connected'

menu_settings: 'Settings'
profile_title: 'Profile'
```

### Create New Keys Only If Needed
```javascript
// If these don't exist, add them:
my_feature_title: '...'
my_feature_description: '...'
my_button_action: '...'
```

---

## Quick Reference: Key Naming

| Pattern | Example | Use For |
|---------|---------|---------|
| `page_title` | `home_title` | Page headings |
| `page_description` | `home_description` | Page body text |
| `section_title` | `wallet_section_title` | Section headers |
| `button_action` | `button_submit` | Button labels |
| `label_field` | `label_amount` | Form labels |
| `placeholder_input` | `placeholder_search` | Input hints |
| `error_message` | `error_connection` | Error text |
| `status_state` | `status_active` | Status badges |
| `card_title` | `strategy_card_title` | Card headers |
| `tooltip_text` | `tooltip_help` | Tooltips |

---

## Validation Loop

```
Start
  ↓
Edit page (add hook, replace text)
  ↓
Run: node scripts/validate-translations.js
  ↓
Issues found? ──YES→ Fix issues
  ↓ NO
Commit
  ↓
Next page
```

---

## Time Estimation

| Phase | Pages | Time |
|-------|-------|------|
| 1 | 5 core pages | 1 hour |
| 2 | 8 feature pages | 1.5 hours |
| 3 | 15+ remaining | 2 hours |
| **Total** | **28+ pages** | **~4.5 hours** |

With parallelization (multiple people): **2-3 hours**

---

## If Stuck

### Issue: "t is not defined"
```
Solution: Add hook at top of component
import { useLang } from '@/components/shared/LanguageContext';
const { t } = useLang();
```

### Issue: "Missing translation key: xyz"
```
Solution: Add to i18n.js
en: { xyz: 'English text' }
ko: { xyz: '한국어 텍스트' }
```

### Issue: Validator keeps failing
```
Solution: 
1. Fix all error messages shown
2. Search for hardcoded strings: grep -r ">[A-Z][a-z]" src/
3. Replace with t() calls
4. Re-run: node scripts/validate-translations.js
```

### Issue: Not sure if key exists
```
Solution: Search i18n.js
grep "my_key:" components/shared/i18n.js

If found → use it
If not found → add it to both en and ko
```

---

## Golden Rules

✅ **MUST DO**
1. Import useLang hook
2. Add hook to component
3. Replace ALL hardcoded text with t()
4. Add keys to i18n.js (both EN and KO)
5. Run validator and fix all issues
6. Check English → all English
7. Check Korean → all Korean

❌ **NEVER DO**
1. Leave hardcoded strings
2. Use undefined keys
3. Forget to add Korean translation
4. Show raw key names to users
5. Mix English and Korean
6. Skip the validator

---

## Commit Message Template

```
Translate [PageName].jsx - [Number] strings localized

- Added useLang hook
- Replaced [N] hardcoded strings with translation keys
- Added [N] new translation keys (EN + KO)
- All keys validated ✅

Validator output:
✅ NO ISSUES FOUND
```

---

## Done When

✅ All pages translated
✅ All components translated
✅ Validator returns 0 issues
✅ Korean UI is 100% Korean
✅ English UI is 100% English
✅ No hardcoded text visible
✅ All detail content localized
✅ Ready for production

---

**ESTIMATED COMPLETION: ~4-5 hours of work**

**QUALITY GUARANTEE: 100% translation coverage with automatic detection**