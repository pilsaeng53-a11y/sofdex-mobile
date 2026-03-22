/**
 * services/orderCalculator.js
 *
 * Single source of truth for order math in UI components.
 * Re-exports all pure calculation functions from lib/trading/orderCalc.js.
 *
 * UI components (OrderPanel, useOrderForm, etc.) MUST import from here.
 *
 * Available exports:
 *   deriveQuantities({ denom, amount, price, leverage, balance })
 *     → { baseQty, quoteQty }
 *
 *   calcMargin(quoteQty, leverage)
 *     → number (USD margin required)
 *
 *   calcFee(quoteQty, mode)
 *     → number (USD fee)
 *
 *   pctToAmount({ pct, balance, price, leverage, denom })
 *     → string | null
 *
 *   validateOrder({ mode, price, denom, parsedAmt, margin, balance, entryPrice })
 *     → Record<string, string>  (empty = valid)
 *
 *   isOrderReady({ mode, price, parsedAmt, quoteQty, margin, balance, errors, entryPrice })
 *     → boolean
 *
 *   TAKER_FEE_RATE     → 0.0005
 *   MAKER_FEE_RATE     → 0.0002
 *   MAINTENANCE_MARGIN_RATE → 0.005
 */

export {
  deriveQuantities,
  calcMargin,
  calcFee,
  pctToAmount,
  validateOrder,
  isOrderReady,
  TAKER_FEE_RATE,
  MAKER_FEE_RATE,
  MAINTENANCE_MARGIN_RATE,
} from '../lib/trading/orderCalc';