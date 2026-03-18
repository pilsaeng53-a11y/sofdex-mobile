/**
 * SOFQuantityCalc.js
 * Pure calculation logic for SOF Sales Partner submissions.
 * Completely separate from FeeEngine / referral logic.
 *
 * Formula:
 *   effective_price = sof_unit_price * (1 - promotion_percent / 100)
 *   sof_quantity    = purchase_amount / effective_price
 *
 * If promotion_percent = 0, effective_price = sof_unit_price (no discount).
 */

/**
 * Calculate the final SOF quantity for a customer purchase.
 * @param {number} purchaseAmount  - USDT amount paid by customer
 * @param {number} sofUnitPrice    - SOF price in USD (per token)
 * @param {number} promotionPercent - promotion/discount percent (0–100)
 * @returns {{ effectivePrice: number, sofQuantity: number, isValid: boolean, errorMsg: string|null }}
 */
export function calcSOFQuantity(purchaseAmount, sofUnitPrice, promotionPercent) {
  const pa = parseFloat(purchaseAmount);
  const sp = parseFloat(sofUnitPrice);
  const pp = parseFloat(promotionPercent);

  if (isNaN(pa) || pa <= 0) return { sofQuantity: 0, effectivePrice: 0, isValid: false, errorMsg: 'Purchase amount must be positive.' };
  if (isNaN(sp) || sp <= 0) return { sofQuantity: 0, effectivePrice: 0, isValid: false, errorMsg: 'SOF unit price must be positive.' };
  if (isNaN(pp) || pp < 0 || pp > 100) return { sofQuantity: 0, effectivePrice: 0, isValid: false, errorMsg: 'Promotion must be between 0 and 100%.' };

  const effectivePrice = sp * (1 - pp / 100);
  if (effectivePrice <= 0) return { sofQuantity: 0, effectivePrice: 0, isValid: false, errorMsg: 'Effective price cannot be zero.' };

  const sofQuantity = pa / effectivePrice;

  return {
    effectivePrice,
    sofQuantity,
    isValid: true,
    errorMsg: null,
  };
}

/**
 * Validate a Solana-format wallet address (base58, 32–44 chars).
 */
export function isValidSolanaAddress(addr) {
  if (!addr || typeof addr !== 'string') return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(addr.trim());
}

/**
 * Format a number with locale-aware thousand separators.
 */
export function formatNumber(num, decimals = 4) {
  if (isNaN(num)) return '—';
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}