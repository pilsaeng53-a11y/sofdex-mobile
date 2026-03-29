/**
 * partnerGradeService.js
 * ─────────────────────────────────────────────────────────────
 * Wallet-based SOF Sales Partner grade lookup service.
 *
 * CURRENT STATE: Uses local mock data.
 * FUTURE STATE:  Replace `fetchGradeFromMock` with a real API call:
 *   GET /partner-grade?wallet=<address>
 *   Response: { walletAddress, grade, promotionPercent, centerFeePercent, updatedAt }
 *
 * To switch to live data, replace the body of `fetchPartnerGrade(wallet)`
 * below with a fetch call. The consumer (usePartnerGrade hook) will not need
 * any changes — it already handles loading / error states.
 * ─────────────────────────────────────────────────────────────
 */

// ─── Grade config ────────────────────────────────────────────────────────────
export const GRADE_CONFIG = {
  GREEN:    { label: 'GREEN',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.3)',    rank: 1 },
  PURPLE:   { label: 'PURPLE',   color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.3)',   rank: 2 },
  GOLD:     { label: 'GOLD',     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   border: 'rgba(251,191,36,0.3)',   rank: 3 },
  PLATINUM: { label: 'PLATINUM', color: '#e2e8f0', bg: 'rgba(226,232,240,0.12)', border: 'rgba(226,232,240,0.3)', rank: 4 },
};

// ─── Mock data (replace entries or add new ones as partners are registered) ───
const MOCK_GRADE_DATA = [
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
  // DEV: add your own test wallet here
  // { walletAddress: 'YOUR_WALLET', grade: 'GOLD', promotionPercent: 120, centerFeePercent: 10, updatedAt: '2026-01-01T00:00:00Z' },
];

// ─── Core lookup function ─────────────────────────────────────────────────────
// TO CONNECT BACKEND: replace this function body with:
//   const res = await fetch(`/partner-grade?wallet=${encodeURIComponent(wallet)}`);
//   if (!res.ok) return null;
//   return res.json();
export async function fetchPartnerGrade(wallet) {
  if (!wallet) return null;
  // Simulate async (remove this when switching to real API)
  await new Promise(r => setTimeout(r, 150));
  const match = MOCK_GRADE_DATA.find(
    d => d.walletAddress.toLowerCase() === wallet.toLowerCase()
  );
  return match ?? null;
}