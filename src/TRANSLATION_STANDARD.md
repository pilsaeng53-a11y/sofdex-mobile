# Translation Standard - Permanent Rule

**Effective Date**: 2026-03-17  
**Applies To**: All new pages, features, components, and UI elements  
**Status**: MANDATORY - Non-negotiable requirement for all future updates

---

## Core Principle

**No feature is complete without full translation support.**

Translation is not a post-launch step. It is part of the feature delivery.

---

## Rule 1: Mandatory Translation Audit

For every new page, feature, component:

### Step 1: Check Existing Keys
```javascript
// Before adding UI text, check if translation key exists
const { t } = useLang();

// In i18n.js:
// Does 'my_new_feature_title' exist?
// YES → use it
// NO → create it
```

### Step 2: Create Missing Keys
If a translation key does not exist:
1. Add to `components/shared/i18n.js`
2. Define entries for all supported languages (English, Korean, etc.)
3. Use the key in the component

### Example: Adding a New Feature

**❌ WRONG** - Hardcoded English:
```jsx
<h1>New Feature Title</h1>
<p>This is the description</p>
```

**✅ CORRECT** - Translated:
```jsx
const { t } = useLang();
<h1>{t('new_feature_title')}</h1>
<p>{t('new_feature_description')}</p>

// In i18n.js:
// new_feature_title: 'New Feature Title' (English)
// new_feature_title: '새로운 기능 제목' (Korean)
```

---

## Rule 2: Translation Applies to ALL UI Levels

Translation must cover ALL visible text:

### ✅ Must Be Translated

- **Page titles** - `<h1>`, `<h2>` headings
- **Section headers** - subsection titles
- **Buttons** - all button labels
- **Labels** - form labels, data labels
- **Form fields** - placeholder text, validation messages
- **Descriptions** - explanatory text, helper text
- **Warnings & Errors** - error messages, alert text
- **Tooltips** - hover text, info tooltips
- **AI/Signal text** - AI explanations, signal descriptions
- **Card content** - card titles, card descriptions
- **Detail page text** - all page-specific content
- **Partner hub content** - all partnership text
- **Wallet/Trading UI** - all wallet and trading labels
- **Community content** - discussion titles, post text
- **Governance pages** - proposal text, voting options
- **Status messages** - "loading", "success", "error" states
- **Navigation text** - menu items, breadcrumbs
- **Empty states** - "no data" messages
- **Confirmation dialogs** - yes/no/cancel labels
- **Input hints** - field hints, examples

### ❌ Must NOT Be Left Untranslated

- No hardcoded English in Korean UI
- No placeholder text in English
- No example data in English when localized
- No debug text visible to users
- No mixed language within same screen

---

## Rule 3: No Mixed Language UI

**Rule**: If user selected Korean → all UI must be Korean  
**Rule**: If user selected English → all UI must be English

### ✅ CORRECT - Full Korean
```
제목: 새로운 기능
버튼: 시작하기
설명: 이것은 설명입니다
```

### ❌ WRONG - Mixed Languages
```
제목: New Feature Title (English mixed with Korean UI)
버튼: 시작하기
설명: This is the description (English mixed with Korean UI)
```

### Implementation Check

Before shipping:
1. Switch language to Korean
2. Verify NO English text visible
3. Switch to English
4. Verify NO Korean text visible
5. Check all detail pages and modals

---

## Rule 4: Default Language Consistency

The app must respect the language setting globally:

- ✅ User selects Korean → all pages show Korean
- ✅ User selects English → all pages show English
- ❌ Some pages ignore language setting
- ❌ Some features always show English

**Check**: Every page must import and use `useLang()`:
```jsx
import { useLang } from '@/components/shared/LanguageContext';

export default function MyNewPage() {
  const { t } = useLang();
  // Now use t('key_name') for all UI text
}
```

---

## Rule 5: Translation is Part of Feature Completion

A feature is **NOT complete** unless:

- [ ] All UI text uses translation keys
- [ ] All keys exist in i18n.js
- [ ] All supported languages have translations
- [ ] No hardcoded strings remain visible to users
- [ ] No mixed-language screens exist
- [ ] Detail-level content is translated (not just main UI)
- [ ] Error messages are translated
- [ ] Placeholder text is translated
- [ ] Help text is translated

**Definition**: Feature completion = Code + Design + Functionality + **Translation**

---

## Rule 6: Pre-Completion Self-Check

Before marking any update as complete:

### Visual Audit
- [ ] Switch to Korean language
- [ ] Visually scan for ANY English text
- [ ] Check all modals, dropdowns, tooltips
- [ ] Switch back to English
- [ ] Verify no Korean text appears

### Code Audit
```bash
# Search for hardcoded strings in new files
# Should find NONE of these patterns:
# - '...' (hardcoded English)
# - "..." (hardcoded English)
# - Template literals with untranslated text
```

### Translation Audit
```javascript
// In i18n.js
// Verify all new keys exist:
// ✅ new_feature_title: '...' (English)
// ✅ new_feature_title: '...' (Korean)
// ❌ new_feature_title: undefined (MISSING)
```

### Completeness Audit
Ask yourself:
1. Does this page have a title? → Is it translated?
2. Does this page have buttons? → Are they translated?
3. Does this page have descriptions? → Are they translated?
4. Does this page have error states? → Are they translated?
5. Does this page have empty states? → Are they translated?
6. Does this page have tooltips? → Are they translated?
7. Does this page have detail content? → Is it translated?

If ANY answer is "no", the feature is incomplete.

---

## Translation Key Naming Convention

All new keys must follow this pattern:

```
[feature_name]_[element_type]_[context]
```

### Examples

**Home Page**
- `home_welcome_title`
- `home_welcome_subtitle`
- `home_button_start`

**Wallet Feature**
- `wallet_title`
- `wallet_balance_label`
- `wallet_button_send`
- `wallet_button_receive`
- `wallet_error_connection`

**Portfolio Page**
- `portfolio_title`
- `portfolio_total_value_label`
- `portfolio_empty_state`
- `portfolio_button_addAsset`

**AI Feature**
- `ai_sentiment_title`
- `ai_signal_buy`
- `ai_signal_sell`
- `ai_confidence_label`
- `ai_explanation_text`

**Governance**
- `governance_proposal_title`
- `governance_vote_yes`
- `governance_vote_no`
- `governance_status_active`
- `governance_status_closed`

---

## Language File Structure

**File**: `components/shared/i18n.js`

All translations centralized in one place:

```javascript
export const translations = {
  en: {
    // Home Page
    home_welcome_title: 'Welcome to SOFDex',
    home_welcome_subtitle: 'Trade Crypto, RWA, and Stocks',
    
    // Wallet
    wallet_title: 'My Wallet',
    wallet_balance_label: 'Total Balance',
    wallet_button_send: 'Send',
    wallet_button_receive: 'Receive',
    wallet_error_connection: 'Connection failed',
    
    // ... all keys here
  },
  ko: {
    // Home Page
    home_welcome_title: 'SOFDex에 오신 것을 환영합니다',
    home_welcome_subtitle: '암호화폐, RWA 및 주식 거래',
    
    // Wallet
    wallet_title: '내 지갑',
    wallet_balance_label: '전체 잔액',
    wallet_button_send: '보내기',
    wallet_button_receive: '받기',
    wallet_error_connection: '연결 실패',
    
    // ... all keys here
  },
};
```

---

## Implementation Checklist for New Features

### Before Writing Component Code

- [ ] List all visible text in the feature
- [ ] Check if translation keys exist in i18n.js
- [ ] Create missing keys in i18n.js (both English and Korean)
- [ ] Document key names for reference

### While Writing Component Code

- [ ] Import `useLang()` hook
- [ ] Replace ALL hardcoded strings with `t('key_name')`
- [ ] Use keys from i18n.js (never invent new keys without adding them)
- [ ] Test with English language selected
- [ ] Test with Korean language selected

### Before Marking Complete

- [ ] Visually verify no English in Korean UI
- [ ] Visually verify no Korean in English UI
- [ ] Verify all detail-level text is translated
- [ ] Verify error messages are translated
- [ ] Verify placeholder text is translated
- [ ] Verify all new i18n keys are documented
- [ ] Submit PR with translation entries included

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting Detail Content
```jsx
// Wrong - dialog has untranslated content
<Dialog>
  <h2>{t('dialog_title')}</h2>
  <p>Are you sure you want to delete this?</p> {/* UNTRANSLATED */}
</Dialog>

// Correct
<Dialog>
  <h2>{t('dialog_title')}</h2>
  <p>{t('dialog_confirm_delete')}</p>
</Dialog>
```

### ❌ Mistake 2: Forgetting Error States
```jsx
// Wrong - error message not translated
if (error) return <div>Something went wrong</div>;

// Correct
if (error) return <div>{t('error_something_went_wrong')}</div>;
```

### ❌ Mistake 3: Placeholder Text
```jsx
// Wrong
<input placeholder="Enter amount" />

// Correct
<input placeholder={t('input_enter_amount')} />
```

### ❌ Mistake 4: Using Hardcoded Numbers/Status
```jsx
// Wrong - status not translated
<span>{status}</span> {/* Shows "pending" or "completed" */}

// Correct
<span>{t(`status_${status}`)}</span> {/* Shows translated status */}
```

### ❌ Mistake 5: Forgetting API Response Text
```jsx
// Wrong - API text not translated
<p>{apiResponse.description}</p>

// Correct - map API data to translation keys
<p>{t(`api_${apiResponse.type}_description`)}</p>
```

---

## When to Update i18n.js

### Update Required For:
- ✅ New page UI text
- ✅ New component UI text
- ✅ New button labels
- ✅ New form fields
- ✅ New error messages
- ✅ New status displays
- ✅ New navigation items
- ✅ New modal content
- ✅ New tooltip text
- ✅ New placeholder text
- ✅ New empty states

### Update NOT Required For:
- ❌ User-generated content (post text, comments)
- ❌ External API responses that already include translations
- ❌ Dynamic data that cannot be predefined
- ❌ Debug/developer-only text (not visible to users)

---

## Enforcement

### Code Review Check

Every PR must include:
1. Component code with `useLang()` usage
2. i18n.js updates with new keys
3. Both English and Korean translations
4. Screenshot proof (Korean and English language versions)

### Automated Check (Future)

Once CI/CD is set up:
- [ ] Scan for hardcoded strings in new components
- [ ] Verify all `t('...')` keys exist in i18n.js
- [ ] Verify both language versions exist for every key

---

## Summary of Permanent Rule

| Aspect | Rule |
|--------|------|
| **Scope** | ALL new pages, features, components |
| **Coverage** | Every visible text element |
| **Completeness** | Translation is part of feature definition |
| **Consistency** | No mixed-language UI |
| **Enforcement** | Code review + visual testing |
| **Timeline** | Effective immediately and permanently |

---

## Final Commitment

**By enforcing this rule:**
- ✅ Users always see UI in their selected language
- ✅ No mixed English/Korean screens
- ✅ All detail content is localized
- ✅ Translation is never forgotten
- ✅ Feature quality increases
- ✅ User experience is professional

**This rule applies to:**
- All current features
- All new features
- All future updates
- All components
- All pages
- All detail-level content

**No exceptions. No shortcuts. No hardcoded English.**

---

**Last Updated**: 2026-03-17  
**Enforced By**: Development Team  
**Approval**: Permanent Standard