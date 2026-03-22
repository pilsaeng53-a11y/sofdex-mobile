/**
 * services/symbolResolver.js
 *
 * Single source of truth for ALL symbol conversion in UI components.
 * Re-exports the canonical functions from lib/trading/symbols.js.
 *
 * UI components MUST import symbol helpers from here — never directly
 * from lib/trading/symbols.js or anywhere else.
 *
 * Available exports:
 *   toOrderlySymbol(appSymbol)        → 'PERP_BTC_USDC'
 *   toBaseSymbol(anyFormat)           → 'BTC'
 *   normalizeBase(base)               → 'BTC' (handles renames like MATIC→POL)
 *   buildSymbolDescriptor(base)       → { base, quote, orderlySymbol, displayName }
 *   toIconSymbol(base)                → 'BTC'  (same as normalizeBase)
 *   ORDERLY_SYMBOL_MAP                → full base→orderly symbol map
 *   DEFAULT_SYMBOL                    → default trading pair descriptor
 */

export {
  toOrderlySymbol,
  toBaseSymbol,
  normalizeBase,
  buildSymbolDescriptor,
  toIconSymbol,
  ORDERLY_SYMBOL_MAP,
  DEFAULT_SYMBOL,
} from '../lib/trading/symbols';