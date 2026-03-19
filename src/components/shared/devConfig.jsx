/**
 * DEV CONFIG — Global development override flags.
 *
 * Set DEV_MODE = true to bypass ALL access gates, approval checks,
 * whitelist logic, and permission-locked UI across the entire app.
 *
 * Set DEV_MODE = false to re-enable proper permission architecture.
 *
 * ⚠️  TEMPORARY — for development/testing only. Do NOT ship to production with DEV_MODE = true.
 */

export const DEV_MODE = true;

/**
 * Mock wallet address used when no real wallet is connected in dev mode.
 */
export const DEV_WALLET = '8bbTbzLqMa1czQ8ruCz9kCVuGR3aFKppQUBV2vMNRC98';

/**
 * Mock partner node used in dev mode when no real PartnerNode exists.
 */
export const DEV_PARTNER_NODE = {
  id: 'dev-node-001',
  user_id: DEV_WALLET,
  wallet_address: DEV_WALLET,
  display_name: 'Dev Partner [PLATINUM]',
  parent_id: null,
  rate: 0.6,
  max_child_rate: 0.6,
  status: 'active',
  tier: 'platinum',
  accrued_balance: 1250.00,
  total_earned: 8420.50,
  total_withdrawn: 7170.50,
  total_volume: 540000,
  sub_volume: 210000,
  is_sales_partner: true,
};

/**
 * Mock approved sales partner info used in dev mode.
 */
export const DEV_SALES_PARTNER = {
  id: 'dev-sales-001',
  wallet_address: DEV_WALLET,
  display_name: 'Dev Sales Partner',
  status: 'active',
  approved_at: new Date().toISOString(),
  notes: 'Dev override — full access',
};