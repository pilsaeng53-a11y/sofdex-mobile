/**
 * partnerLocalStore.js
 * Local persistence layer for partner operating tool.
 * Replace each function with DB/API calls when backend is ready.
 */

const KEYS = {
  DRAFT:          'sofpartner_draft',
  LAST_VALUES:    'sofpartner_last_values',
  RECENT_CALCS:   'sofpartner_recent_calcs',
  RECENT_SUBMITS: 'sofpartner_recent_submits',
  DUP_CACHE:      'sofpartner_dup_cache',
};

// ─── Draft ────────────────────────────────────────────────────────────────────

export function saveDraft(formData) {
  try {
    localStorage.setItem(KEYS.DRAFT, JSON.stringify({ ...formData, savedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEYS.DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(KEYS.DRAFT); } catch {}
}

// ─── Last used input memory ────────────────────────────────────────────────────

export function saveLastValues({ usdtRate, sofPrice, promotionPercent, recommenderPercent }) {
  try {
    const current = loadLastValues();
    localStorage.setItem(KEYS.LAST_VALUES, JSON.stringify({
      ...current,
      usdtRate:          usdtRate          ?? current.usdtRate,
      sofPrice:          sofPrice          ?? current.sofPrice,
      promotionPercent:  promotionPercent  ?? current.promotionPercent,
      recommenderPercent:recommenderPercent?? current.recommenderPercent,
      updatedAt: new Date().toISOString(),
    }));
  } catch {}
}

export function loadLastValues() {
  try {
    const raw = localStorage.getItem(KEYS.LAST_VALUES);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ─── Recent calculations log ──────────────────────────────────────────────────

export function pushRecentCalc(entry) {
  try {
    const list = loadRecentCalcs();
    const updated = [{ ...entry, loggedAt: new Date().toISOString() }, ...list].slice(0, 10);
    localStorage.setItem(KEYS.RECENT_CALCS, JSON.stringify(updated));
  } catch {}
}

export function loadRecentCalcs() {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_CALCS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ─── Recent submissions log ────────────────────────────────────────────────────

export function pushRecentSubmit(entry) {
  try {
    const list = loadRecentSubmits();
    const updated = [{ ...entry, submittedAt: new Date().toISOString() }, ...list].slice(0, 20);
    localStorage.setItem(KEYS.RECENT_SUBMITS, JSON.stringify(updated));
  } catch {}
}

export function loadRecentSubmits() {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_SUBMITS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ─── Duplicate detection ──────────────────────────────────────────────────────

/**
 * Returns warning string if duplicate detected, null if clean.
 */
export function checkDuplicate(customerWallet, customerName, salesKRW) {
  try {
    const recent = loadRecentSubmits();
    const today = new Date().toISOString().slice(0, 10);

    // Same wallet + same day
    const sameWalletToday = recent.find(r =>
      r.customerWallet === customerWallet &&
      (r.submittedAt || '').startsWith(today)
    );
    if (sameWalletToday) return `같은 지갑이 오늘 이미 제출됨 (${sameWalletToday.customerName})`;

    // Same name + similar amount (within 5%)
    const amount = parseFloat(salesKRW);
    const sameName = recent.find(r => {
      if (!r.customerName || r.customerName !== customerName) return false;
      const diff = Math.abs((parseFloat(r.salesKRW) - amount) / amount);
      return diff < 0.05;
    });
    if (sameName) return `같은 이름·유사 금액 제출 이력 있음`;

    return null;
  } catch { return null; }
}