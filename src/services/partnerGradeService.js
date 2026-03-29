/**
 * partnerGradeService.js
 * ─────────────────────────────────────────────────────────────
 * SOF Sales Partner service layer — mock data, ready for API replacement.
 *
 * TO CONNECT BACKEND, replace each mock function with:
 *   GET /partner-grade?wallet=...
 *   GET /partner-subordinates?wallet=...
 *   GET /partner-subordinate-history?wallet=...
 *   POST /sales/submit
 * ─────────────────────────────────────────────────────────────
 */

// ─── Grade config ─────────────────────────────────────────────────────────────
export const GRADE_CONFIG = {
  GREEN:    { label: 'GREEN',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.3)',    rank: 1 },
  PURPLE:   { label: 'PURPLE',   color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.3)',   rank: 2 },
  GOLD:     { label: 'GOLD',     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   border: 'rgba(251,191,36,0.3)',   rank: 3 },
  PLATINUM: { label: 'PLATINUM', color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)',  border: 'rgba(226,232,240,0.25)', rank: 4 },
};

// ─── Mock grade data ──────────────────────────────────────────────────────────
// Replace with DB/API source later. Add real wallets as partners register.
const MOCK_GRADES = [
  {
    walletAddress:    'GrEeN1111111111111111111111111111111111111',
    grade:            'GREEN',
    promotionPercent: 80,
    centerFeePercent: 5,
    updatedAt:        '2026-03-01T00:00:00Z',
  },
  {
    walletAddress:    'PuRpLe2222222222222222222222222222222222222',
    grade:            'PURPLE',
    promotionPercent: 100,
    centerFeePercent: 8,
    updatedAt:        '2026-03-10T00:00:00Z',
  },
  {
    walletAddress:    'GoLd3333333333333333333333333333333333333',
    grade:            'GOLD',
    promotionPercent: 120,
    centerFeePercent: 10,
    updatedAt:        '2026-03-15T00:00:00Z',
  },
  {
    walletAddress:    'PLatInUm444444444444444444444444444444444444',
    grade:            'PLATINUM',
    promotionPercent: 150,
    centerFeePercent: 12,
    updatedAt:        '2026-03-20T00:00:00Z',
  },
  // ↓ Add dev/test wallet below for testing
  // { walletAddress: 'YOUR_WALLET', grade: 'GOLD', promotionPercent: 120, centerFeePercent: 10, updatedAt: '2026-01-01T00:00:00Z' },
];

// ─── Mock subordinate data ────────────────────────────────────────────────────
const MOCK_SUBORDINATES = {
  // parentWallet -> subordinate list
  'PuRpLe2222222222222222222222222222222222222': [
    {
      name:              '김민준',
      walletAddress:     'Sub1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      grade:             'GREEN',
      accumulatedSalesKRW: 3000000,
      lastSubmitQuantity:  229,
      lastSubmitAt:      '2026-03-28T09:00:00Z',
      status:            'active', // active | promoted | removed
    },
    {
      name:              '이수진',
      walletAddress:     'Sub2bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      grade:             'GREEN',
      accumulatedSalesKRW: 1200000,
      lastSubmitQuantity:  120,
      lastSubmitAt:      '2026-03-25T14:30:00Z',
      status:            'active',
    },
    {
      name:              '박태양',
      walletAddress:     'Sub3cccccccccccccccccccccccccccccccccccccc',
      grade:             'PURPLE', // same grade as parent → should show 승급
      accumulatedSalesKRW: 8500000,
      lastSubmitQuantity:  890,
      lastSubmitAt:      '2026-03-27T11:00:00Z',
      status:            'promoted',
    },
  ],
  'GoLd3333333333333333333333333333333333333': [
    {
      name:              '최민호',
      walletAddress:     'Sub4dddddddddddddddddddddddddddddddddddddd',
      grade:             'GREEN',
      accumulatedSalesKRW: 500000,
      lastSubmitQuantity:  50,
      lastSubmitAt:      '2026-03-20T10:00:00Z',
      status:            'active',
    },
  ],
};

// ─── Service functions ─────────────────────────────────────────────────────────

/**
 * Get partner grade by wallet.
 * REPLACE with: GET /partner-grade?wallet=...
 */
export async function getPartnerGradeByWallet(wallet) {
  if (!wallet) return null;
  await delay(150);
  return MOCK_GRADES.find(d => d.walletAddress.toLowerCase() === wallet.toLowerCase()) ?? null;
}
// Keep alias for backward compat
export const fetchPartnerGrade = getPartnerGradeByWallet;

/**
 * Get subordinates for a parent wallet.
 * REPLACE with: GET /partner-subordinates?wallet=...
 */
export async function getSubordinatesByParentWallet(wallet) {
  if (!wallet) return [];
  await delay(200);
  return MOCK_SUBORDINATES[wallet] ?? [];
}

/**
 * Get subordinate sales history.
 * REPLACE with: GET /partner-subordinate-history?wallet=...
 */
export async function getSubordinateSalesHistory(wallet) {
  if (!wallet) return [];
  await delay(100);
  // Mock: build activity log from subordinate last submissions
  const subs = MOCK_SUBORDINATES[wallet] ?? [];
  return subs.map(s => ({
    subName: s.name,
    quantity: s.lastSubmitQuantity,
    salesKRW: s.accumulatedSalesKRW,
    submittedAt: s.lastSubmitAt,
  }));
}

/**
 * Submit sale to foundation.
 * REPLACE with: POST /sales/submit
 */
export async function submitSaleToFoundation(payload) {
  await delay(600);
  // MOCK: log to console, return success
  console.log('[partnerGradeService] submitSaleToFoundation payload:', payload);
  return { success: true, submissionId: `MOCK-${Date.now()}` };
}

// ─── Calculation helpers (pure, no async) ─────────────────────────────────────

export function calculateCustomerSOF({ salesKRW, usdtRate, sofPrice, promotionPercent }) {
  const usdtAmount     = salesKRW / usdtRate;
  const baseQuantity   = usdtAmount / sofPrice;
  const finalQuantity  = baseQuantity * (promotionPercent / 100);
  return { usdtAmount, baseQuantity, finalQuantity };
}

export function calculateRecommenderSOF({ baseQuantity, recommenderPercent }) {
  return baseQuantity * (recommenderPercent / 100);
}

export function calculateCenterFeeSOF({ baseQuantity, centerFeePercent, recommenderQuantity = 0 }) {
  const grossCenterFee = baseQuantity * (centerFeePercent / 100);
  const netCenterFee   = grossCenterFee - recommenderQuantity;
  return { grossCenterFee, netCenterFee };
}

/**
 * Auto-remove subordinates whose grade rank >= parent grade rank.
 * Returns { active, promoted }
 */
/**
 * classifySubordinates — true structural separation rule.
 * If a subordinate reaches the same or higher grade as parent:
 *   - removed from active list
 *   - removed from subordinate count & sales totals
 *   - returned in `promoted` array (treated as independent partner)
 * Callers MUST exclude `promoted` from all fee/hierarchy calculations.
 */
export function classifySubordinates(subordinates, parentGrade) {
  const parentRank = GRADE_CONFIG[parentGrade]?.rank ?? 0;
  const active   = [];
  const promoted = [];
  for (const s of subordinates) {
    const subRank = GRADE_CONFIG[s.grade]?.rank ?? 0;
    if (subRank >= parentRank) {
      // TRUE STRUCTURAL SEPARATION — not just UI hide
      const reason = subRank > parentRank ? 'higher_grade' : 'same_grade';
      promoted.push({ ...s, status: 'promoted', separationReason: reason });
    } else {
      active.push(s);
    }
  }
  return { active, promoted };
}

/**
 * Record a separation event to the DB.
 * Call this when a subordinate is detected as promoted during a sync.
 */
export async function recordSeparation(base44Client, { sub_wallet, sub_name, sub_grade, parent_wallet, parent_grade, reason }) {
  try {
    // Avoid duplicate records
    const existing = await base44Client.entities.SeparationHistory.filter({ sub_wallet, parent_wallet });
    if (existing.length > 0) return;
    await base44Client.entities.SeparationHistory.create({
      sub_wallet,
      sub_name,
      sub_grade,
      parent_wallet,
      parent_grade,
      reason,
      separation_date: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[partnerGradeService] recordSeparation error:', e);
  }
}

// ─── Util ──────────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }