/**
 * lib/trading/symbols.js
 *
 * Single source of truth for all symbol-related conversions.
 * All components and hooks must use these helpers — never build
 * symbol strings manually.
 *
 * Domains:
 *   - display symbol   → shown in UI ("BTC")
 *   - trading symbol   → sent to Orderly API ("PERP_BTC_USDC")
 *   - icon symbol      → passed to CoinIcon ("BTC")
 *   - quote asset      → always "USDC" for perpetuals on Orderly
 */

/** Orderly perpetual symbol for each supported base asset */
export const ORDERLY_SYMBOL_MAP = {
  BTC:   'PERP_BTC_USDC',
  ETH:   'PERP_ETH_USDC',
  SOL:   'PERP_SOL_USDC',
  BNB:   'PERP_BNB_USDC',
  XRP:   'PERP_XRP_USDC',
  ARB:   'PERP_ARB_USDC',
  LINK:  'PERP_LINK_USDC',
  UNI:   'PERP_UNI_USDC',
  APT:   'PERP_APT_USDC',
  TON:   'PERP_TON_USDC',
};

/** Default symbol used on first load */
export const DEFAULT_SYMBOL = {
  base:           'BTC',
  quote:          'USDC',
  orderlySymbol:  'PERP_BTC_USDC',
  displayName:    'BTC-USDC',
};

/**
 * Convert any app symbol string to the canonical Orderly instrument string.
 * Handles: 'BTC', 'BTC-USDT', 'BTC/USDC', 'PERP_BTC_USDC'
 */
export function toOrderlySymbol(appSymbol) {
  if (!appSymbol) return DEFAULT_SYMBOL.orderlySymbol;
  if (appSymbol.startsWith('PERP_')) return appSymbol;
  const base = appSymbol.split(/[-/]/)[0].toUpperCase();
  return ORDERLY_SYMBOL_MAP[base] ?? `PERP_${base}_USDC`;
}

/**
 * Extract the base symbol from any symbol format.
 * 'PERP_BTC_USDC' → 'BTC'
 * 'BTC-USDT'      → 'BTC'
 * 'BTC'           → 'BTC'
 */
export function toBaseSymbol(sym) {
  if (!sym) return 'BTC';
  if (sym.startsWith('PERP_')) return sym.split('_')[1];
  return sym.split(/[-/]/)[0].toUpperCase();
}

/**
 * Build a full symbol descriptor object from a base string.
 * This is the canonical shape passed between TradingDesk, OrderPanel, etc.
 */
export function buildSymbolDescriptor(base) {
  const b = base.toUpperCase();
  return {
    base:          b,
    quote:         'USDC',
    orderlySymbol: toOrderlySymbol(b),
    displayName:   `${b}-USDC`,
  };
}

/** Icon symbol — currently same as base, isolated so it can diverge later */
export function toIconSymbol(base) {
  return base?.toUpperCase() ?? 'BTC';
}