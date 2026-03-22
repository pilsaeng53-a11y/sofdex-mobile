/**
 * lib/trading/orderCalc.js
 *
 * Pure order calculation functions.
 * All inputs are plain numbers — no React state, no API calls.
 *
 * This is the single place where:
 *   - base/quote/percent quantities are derived
 *   - margin is calculated
 *   - liquidation price is estimated
 *   - liquidation distance is computed
 *   - risk state is classified
 *   - leverage risk level is labelled
 *
 * Formula sources:
 *   - Orderly standard isolated margin perpetual futures
 *   - Maintenance margin rate: 0.5% (Orderly default)
 */

export const TAKER_FEE_RATE = 0.0005; // 0.05%
export const MAKER_FEE_RATE = 0.0002; // 0.02%
export const MAINTENANCE_MARGIN_RATE = 0.005; // 0.5%

// ─── Quantity derivation ──────────────────────────────────────────────────────

/**
 * Derive { baseQty, quoteQty } from user inputs.
 *
 * @param {object} p
 * @param {'base'|'quote'|'percent'} p.denom - amount denomination mode
 * @param {number} p.amount   - user-entered amount (in the denom's unit)
 * @param {number} p.price    - entry price (mark or limit)
 * @param {number} p.leverage - selected leverage multiplier
 * @param {number} p.balance  - available quote balance (for percent mode)
 *
 * @returns {{ baseQty: number, quoteQty: number }}
 *   baseQty  = position size in base asset
 *   quoteQty = notional position value in USDC (= baseQty × price)
 */
export function deriveQuantities({ denom, amount, price, leverage, balance }) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0 || price <= 0 || leverage <= 0) return { baseQty: 0, quoteQty: 0 };

  if (denom === 'base') {
    return { baseQty: amt, quoteQty: amt * price };
  }

  if (denom === 'quote') {
    // User enters margin amount in USDC; position is leveraged
    const positionUSD = amt * leverage;
    return { baseQty: positionUSD / price, quoteQty: positionUSD };
  }

  if (denom === 'percent') {
    const pct = Math.min(100, Math.max(0, amt));
    const marginUSD   = balance * (pct / 100);
    const positionUSD = marginUSD * leverage;
    return { baseQty: positionUSD / price, quoteQty: positionUSD };
  }

  return { baseQty: 0, quoteQty: 0 };
}

/**
 * Calculate the required initial margin.
 * margin = positionValue / leverage
 */
export function calcMargin(quoteQty, leverage) {
  if (quoteQty <= 0 || leverage <= 0) return 0;
  return quoteQty / leverage;
}

/**
 * Calculate the trading fee for an order.
 * @param {number} quoteQty   - notional position value
 * @param {'limit'|'market'}  mode
 */
export function calcFee(quoteQty, mode) {
  const rate = mode === 'limit' ? MAKER_FEE_RATE : TAKER_FEE_RATE;
  return quoteQty * rate;
}

// ─── Percentage-derived amount ────────────────────────────────────────────────

/**
 * Derive the amount field value for a given percentage button press.
 * Returns the appropriate string for the current denom mode.
 *
 * @param {{ pct, balance, price, leverage, denom }}
 * @returns {string|null}
 */
export function pctToAmount({ pct, balance, price, leverage, denom }) {
  if (!pct || price <= 0 || balance <= 0) return null;
  const marginUSD   = balance * (pct / 100);
  const positionUSD = marginUSD * leverage;

  if (denom === 'quote')   return marginUSD.toFixed(2);
  if (denom === 'base')    return (positionUSD / price).toFixed(6);
  if (denom === 'percent') return String(pct);
  return null;
}

// ─── Liquidation ──────────────────────────────────────────────────────────────

/**
 * Estimate liquidation price (isolated margin, standard formula).
 *
 * Long:  liqPrice = entry × (1 − 1/leverage + mmRate)
 * Short: liqPrice = entry × (1 + 1/leverage − mmRate)
 *
 * @param {number} entryPrice
 * @param {number} leverage
 * @param {'buy'|'sell'} side
 * @returns {number|null}
 */
export function calcLiqPrice(entryPrice, leverage, side) {
  if (!entryPrice || entryPrice <= 0 || !leverage || leverage <= 0) return null;
  if (side === 'buy') {
    return entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN_RATE);
  }
  return entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN_RATE);
}

/**
 * Calculate distance from entry price to liquidation price.
 *
 * @param {number} entryPrice
 * @param {number} liqPrice
 * @param {'buy'|'sell'} side
 * @returns {{ diff: number, pct: number }|null}
 *   diff = absolute price difference (always positive)
 *   pct  = distance as % of entry (always positive)
 */
export function calcLiqDistance(entryPrice, liqPrice, side) {
  if (!entryPrice || !liqPrice || liqPrice <= 0) return null;
  const diff = side === 'buy'
    ? entryPrice - liqPrice
    : liqPrice - entryPrice;
  const pct = (diff / entryPrice) * 100;
  return { diff: Math.abs(diff), pct: Math.abs(pct) };
}

// ─── Risk classification ──────────────────────────────────────────────────────

/**
 * Classify liquidation risk state from liq distance %.
 * @param {number|null} liqDistPct
 * @returns {'safe'|'warning'|'danger'|'none'}
 */
export function getLiqRiskState(liqDistPct) {
  if (liqDistPct == null) return 'none';
  if (liqDistPct > 20) return 'safe';
  if (liqDistPct > 8)  return 'warning';
  return 'danger';
}

/**
 * Classify leverage risk level from leverage / maxLeverage.
 * @returns {'Low'|'Med'|'High'}
 */
export function getLeverageRisk(leverage, maxLeverage) {
  const pct = leverage / (maxLeverage || 100);
  if (pct <= 0.2) return 'Low';
  if (pct <= 0.5) return 'Med';
  return 'High';
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate order inputs and return an errors object.
 * Empty object = no errors = order is valid.
 *
 * @param {{ mode, price, denom, parsedAmt, margin, balance, entryPrice }}
 * @returns {Record<string, string>}
 */
export function validateOrder({ mode, price, denom, parsedAmt, margin, balance, entryPrice }) {
  const e = {};

  if (mode === 'limit' && (!price || parseFloat(price) <= 0)) {
    e.price = 'Enter a valid limit price';
  }
  if (!parsedAmt || parsedAmt <= 0) {
    e.amount = 'Enter an amount';
  }
  if (denom === 'percent' && parsedAmt > 100) {
    e.amount = 'Percentage cannot exceed 100%';
  }
  if (margin > balance) {
    e.amount = 'Insufficient balance';
  }
  if (entryPrice <= 0 && mode === 'market') {
    e.price = 'Market price unavailable — data may be stale';
  }

  return e;
}

/**
 * Determine if an order is ready to submit.
 */
export function isOrderReady({ mode, price, parsedAmt, quoteQty, margin, balance, errors, entryPrice }) {
  if (Object.values(errors).some(Boolean)) return false;
  if (mode === 'limit' && (!price || parseFloat(price) <= 0)) return false;
  if (mode === 'market' && entryPrice <= 0) return false;
  if (parsedAmt <= 0 || quoteQty <= 0) return false;
  if (margin > balance) return false;
  return true;
}