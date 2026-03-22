/**
 * data/coinIconMap.js
 *
 * Single source of truth for all coin icon URLs.
 * Keys are exact base symbols used across the trading UI.
 *
 * CDN: spothq/cryptocurrency-icons via jsDelivr
 * Pattern: https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/{symbol}.png
 *
 * POL  → uses matic.png (same icon, renamed token)
 * RNDR → removed
 */

const CDN = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color';

export const COIN_ICON_MAP = {
  BTC:    `${CDN}/btc.png`,
  ETH:    `${CDN}/eth.png`,
  SOL:    `${CDN}/sol.png`,
  USDT:   `${CDN}/usdt.png`,
  XRP:    `${CDN}/xrp.png`,
  BNB:    `${CDN}/bnb.png`,
  USDC:   `${CDN}/usdc.png`,
  TRX:    `${CDN}/trx.png`,
  FIGURE: `${CDN}/generic.png`,       // not in spothq repo — fallback
  DOGE:   `${CDN}/doge.png`,
  USDS:   `${CDN}/usds.png`,
  WBT:    `${CDN}/generic.png`,       // not in spothq repo — fallback
  ADA:    `${CDN}/ada.png`,
  LINK:   `${CDN}/link.png`,
  USD1:   `${CDN}/generic.png`,       // not in spothq repo — fallback
  ZEC:    `${CDN}/zec.png`,
  PYUSD:  `${CDN}/generic.png`,       // not in spothq repo — fallback
  DAI:    `${CDN}/dai.png`,
  SHIB:   `${CDN}/shib.png`,
  TON:    `${CDN}/ton.png`,
  XAUT:   `${CDN}/generic.png`,       // not in spothq repo — fallback
  AVAX:   `${CDN}/avax.png`,
  DOT:    `${CDN}/dot.png`,
  POL:    `${CDN}/matic.png`,         // Polygon renamed: MATIC → POL
  LTC:    `${CDN}/ltc.png`,
  ATOM:   `${CDN}/atom.png`,
  UNI:    `${CDN}/uni.png`,
  APT:    `${CDN}/apt.png`,
  OP:     `${CDN}/op.png`,
  ARB:    `${CDN}/arb.png`,
  SUI:    `${CDN}/sui.png`,
  SEI:    `${CDN}/sei.png`,
  INJ:    `${CDN}/inj.png`,
  PEPE:   `${CDN}/pepe.png`,
  TIA:    `${CDN}/generic.png`,       // not in spothq repo — fallback
  NEAR:   `${CDN}/near.png`,
  FTM:    `${CDN}/ftm.png`,
  AAVE:   `${CDN}/aave.png`,
  JUP:    `${CDN}/generic.png`,       // not in spothq repo — fallback
  RAY:    `${CDN}/ray.png`,
  BONK:   `${CDN}/generic.png`,       // not in spothq repo — fallback
  HNT:    `${CDN}/hnt.png`,
  SOF:    `${CDN}/generic.png`,       // SOF token — use generic fallback
};

export const FALLBACK_ICON = `${CDN}/generic.png`;

/**
 * Extracts the plain base symbol from any trading-pair format.
 *   "BTC"           → "BTC"
 *   "BTC-USDT"      → "BTC"
 *   "BTC/USDC"      → "BTC"
 *   "PERP_BTC_USDC" → "BTC"
 *   "MATIC"         → "POL"  (legacy rename)
 */
export function extractBase(symbol) {
  if (!symbol) return '';
  const s = symbol.trim().toUpperCase();
  let base = s;
  if (s.startsWith('PERP_')) {
    base = s.split('_')[1] ?? s;
  } else if (s.includes('-') || s.includes('/')) {
    base = s.split(/[-/]/)[0];
  }
  // Legacy rename: MATIC → POL
  if (base === 'MATIC') return 'POL';
  return base;
}

/**
 * Returns the icon URL for any symbol format.
 * Always returns a valid URL string — never null/undefined.
 *
 * @param {string} symbol - any format: "BTC", "PERP_BTC_USDC", "BTC-USDT"
 * @returns {string}
 */
export function getIconUrl(symbol) {
  const base = extractBase(symbol);
  return COIN_ICON_MAP[base] ?? FALLBACK_ICON;
}