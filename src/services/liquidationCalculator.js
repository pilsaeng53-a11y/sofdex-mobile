/**
 * services/liquidationCalculator.js
 *
 * Single source of truth for liquidation price calculations.
 * Re-exports the liquidation functions from lib/trading/orderCalc.js.
 *
 * Used by: OrderPanel, useOrderForm, ChartContainer (liq overlay),
 *          FuturesPositions, TradingBottomPanel
 *
 * Available exports:
 *   calcLiqPrice(entryPrice, leverage, side)
 *     → number | null
 *     Formula (isolated margin):
 *       Long:  entry × (1 − 1/leverage + mmRate)
 *       Short: entry × (1 + 1/leverage − mmRate)
 *
 *   calcLiqDistance(entryPrice, liqPrice, side)
 *     → { diff: number, pct: number } | null
 *
 *   getLiqRiskState(liqDistPct)
 *     → 'safe' | 'warning' | 'danger' | 'none'
 *
 *   getLeverageRisk(leverage, maxLeverage)
 *     → 'Low' | 'Med' | 'High'
 *
 *   MAINTENANCE_MARGIN_RATE → 0.005 (0.5%)
 */

export {
  calcLiqPrice,
  calcLiqDistance,
  getLiqRiskState,
  getLeverageRisk,
  MAINTENANCE_MARGIN_RATE,
} from '../lib/trading/orderCalc';