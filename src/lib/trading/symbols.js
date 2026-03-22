/**
 * lib/trading/symbols.js
 *
 * Single source of truth for all symbol-related conversions.
 *
 * Domains:
 *   - display symbol   → shown in UI ("BTC")
 *   - trading symbol   → sent to Orderly API ("PERP_BTC_USDC")
 *   - icon symbol      → passed to CoinIcon ("BTC")
 *   - quote asset      → always "USDC" for perpetuals on Orderly
 *
 * Canonical base keys (from coin_icon_map.json):
 *   BTC, ETH, SOL, USDT, XRP, BNB, USDC, TRX, FIGURE, DOGE, USDS, WBT,
 *   ADA, LINK, USD1, ZEC, PYUSD, DAI, SHIB, TON, XAUT, AVAX, DOT, POL,
 *   LTC, ATOM, UNI, APT, OP, ARB, SUI, SEI, INJ, PEPE, TIA, NEAR, FTM,
 *   AAVE, JUP, RAY, BONK, HNT, SOF
 *
 * Notes:
 *   - MATIC is renamed to POL (Polygon rebranding)
 *   - RNDR is removed
 */

/** Orderly perpetual symbol for each supported base asset */
export const ORDERLY_SYMBOL_MAP = {
  BTC:   'PERP_BTC_USDC',
  ETH:   'PERP_ETH_USDC',
  SOL:   'PERP_SOL_USDC',
  BNB:   'PERP_BNB_USDC',
  XRP:   'PERP_XRP_USDC',
  ADA:   'PERP_ADA_USDC',
  DOGE:  'PERP_DOGE_USDC',
  AVAX:  'PERP_AVAX_USDC',
  DOT:   'PERP_DOT_USDC',
  LINK:  'PERP_LINK_USDC',
  POL:   'PERP_POL_USDC',
  LTC:   'PERP_LTC_USDC',
  ATOM:  'PERP_ATOM_USDC',
  UNI:   'PERP_UNI_USDC',
  APT:   'PERP_APT_USDC',
  OP:    'PERP_OP_USDC',
  ARB:   'PERP_ARB_USDC',
  SUI:   'PERP_SUI_USDC',
  SEI:   'PERP_SEI_USDC',
  INJ:   'PERP_INJ_USDC',
  PEPE:  'PERP_PEPE_USDC',
  TIA:   'PERP_TIA_USDC',
  NEAR:  'PERP_NEAR_USDC',
  FTM:   'PERP_FTM_USDC',
  AAVE:  'PERP_AAVE_USDC',
  JUP:   'PERP_JUP_USDC',
  RAY:   'PERP_RAY_USDC',
  BONK:  'PERP_BONK_USDC',
  HNT:   'PERP_HNT_USDC',
  TON:   'PERP_TON_USDC',
  TRX:   'PERP_TRX_USDC',
  SHIB:  'PERP_SHIB_USDC',
  ZEC:   'PERP_ZEC_USDC',
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
 * Handles: 'BTC', 'BTC-USDT', 'BTC/USDC', 'PERP_BTC_USDC', 'MATIC' (→ POL)
 */
export function toOrderlySymbol(appSymbol) {
  if (!appSymbol) return DEFAULT_SYMBOL.orderlySymbol;
  if (appSymbol.startsWith('PERP_')) return appSymbol;
  const base = normalizeBase(appSymbol.split(/[-/]/)[0].toUpperCase());
  return ORDERLY_SYMBOL_MAP[base] ?? `PERP_${base}_USDC`;
}

/**
 * Extract the base symbol from any symbol format.
 * 'PERP_BTC_USDC' → 'BTC'
 * 'BTC-USDT'      → 'BTC'
 * 'MATIC'         → 'POL'
 */
export function toBaseSymbol(sym) {
  if (!sym) return 'BTC';
  let base;
  if (sym.startsWith('PERP_')) base = sym.split('_')[1];
  else base = sym.split(/[-/]/)[0].toUpperCase();
  return normalizeBase(base);
}

/**
 * Normalize legacy or renamed symbols.
 * MATIC → POL
 */
export function normalizeBase(base) {
  if (!base) return '';
  const b = base.toUpperCase();
  if (b === 'MATIC') return 'POL';
  return b;
}

/**
 * Build a full symbol descriptor object from a base string.
 * This is the canonical shape passed between TradingDesk, OrderPanel, etc.
 */
export function buildSymbolDescriptor(base) {
  const b = normalizeBase(base.toUpperCase());
  return {
    base:          b,
    quote:         'USDC',
    orderlySymbol: toOrderlySymbol(b),
    displayName:   `${b}-USDC`,
  };
}

/** Icon symbol — same as normalized base */
export function toIconSymbol(base) {
  return normalizeBase(base?.toUpperCase() ?? 'BTC');
}