/**
 * SOFQuantityCalc.js
 * Pure calculation logic for SOF Sales Partner submissions.
 *
 * Formula (multiplier-based):
 *   sofQuantity = (purchaseAmount / sofUnitPrice) * (promotionPercent / 100)
 *
 * 100% = 1x, 200% = 2x, 300% = 3x, etc.
 */

/**
 * Calculate the final SOF quantity using multiplier logic.
 * @param {number} purchaseAmount   - USDT amount paid by customer
 * @param {number} sofUnitPrice     - SOF price in USD (per token)
 * @param {number} promotionPercent - promotion multiplier as percent (100 = 1x, 200 = 2x)
 * @returns {{ multiplier: number, sofQuantity: number, isValid: boolean, errorMsg: string|null }}
 */
export function calcSOFQuantity(purchaseAmount, sofUnitPrice, promotionPercent) {
  const pa = parseFloat(purchaseAmount);
  const sp = parseFloat(sofUnitPrice);
  const pp = parseFloat(promotionPercent);

  if (isNaN(pa) || pa <= 0) return { sofQuantity: 0, multiplier: 0, isValid: false, errorMsg: '매출 금액을 입력하세요.' };
  if (isNaN(sp) || sp <= 0) return { sofQuantity: 0, multiplier: 0, isValid: false, errorMsg: 'SOF 단가를 입력하세요.' };
  if (isNaN(pp) || pp <= 0) return { sofQuantity: 0, multiplier: 0, isValid: false, errorMsg: '프로모션 비율은 0보다 커야 합니다.' };

  const multiplier = pp / 100;
  const sofQuantity = (pa / sp) * multiplier;

  return {
    multiplier,
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