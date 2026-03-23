/**
 * Shared trading symbol normalization & TradingView mapping.
 * Single source of truth — used by chart, order panel, header, sidebar.
 */

/**
 * Normalize any raw instrument symbol to its base ticker.
 * e.g. EURUSD-T → EURUSD, BTC-PERP → BTC, PERP_ETH_USDC → ETH, ETH-USDT → ETH
 */
export function normalizeSymbol(raw = '') {
  if (!raw) return '';
  const s = raw.toUpperCase();
  // PERP_BASE_QUOTE format
  if (s.startsWith('PERP_')) {
    const parts = s.split('_');
    return parts[1] || s;
  }
  // Remove common suffixes
  return s
    .replace(/-PERP$/i, '')
    .replace(/-T$/i, '')
    .replace(/-USDT$/i, '')
    .replace(/-USDC$/i, '')
    .replace(/-USD$/i, '')
    .split('/')[0]
    .split(':').pop();
}

const TV_MAP = {
  // Forex
  EURUSD:   'FX:EURUSD',
  USDJPY:   'FX:USDJPY',
  GBPUSD:   'FX:GBPUSD',
  AUDUSD:   'FX:AUDUSD',
  USDCAD:   'FX:USDCAD',
  USDCHF:   'FX:USDCHF',
  NZDUSD:   'FX:NZDUSD',
  EURGBP:   'FX:EURGBP',
  EURJPY:   'FX:EURJPY',
  // Commodities
  GOLD:     'OANDA:XAUUSD',
  XAUUSD:   'OANDA:XAUUSD',
  SILVER:   'OANDA:XAGUSD',
  XAGUSD:   'OANDA:XAGUSD',
  OIL:      'TVC:USOIL',
  USOIL:    'TVC:USOIL',
  NATGAS:   'TVC:NATURALGAS',
  // Indices
  SP500:    'OANDA:SPX500USD',
  SPX:      'OANDA:SPX500USD',
  NASDAQ:   'OANDA:NAS100USD',
  NDX:      'OANDA:NAS100USD',
  NAS100:   'OANDA:NAS100USD',
  DAX:      'FOREXCOM:DEU40',
  DEU40:    'FOREXCOM:DEU40',
  FTSE:     'FOREXCOM:UK100',
  UK100:    'FOREXCOM:UK100',
  // Crypto
  BTC:      'BINANCE:BTCUSDT',
  ETH:      'BINANCE:ETHUSDT',
  SOL:      'BINANCE:SOLUSDT',
  XRP:      'BINANCE:XRPUSDT',
  BNB:      'BINANCE:BNBUSDT',
  ADA:      'BINANCE:ADAUSDT',
  DOGE:     'BINANCE:DOGEUSDT',
  AVAX:     'BINANCE:AVAXUSDT',
  MATIC:    'BINANCE:MATICUSDT',
  // Stocks
  AAPL:     'NASDAQ:AAPL',
  GOOGL:    'NASDAQ:GOOGL',
  MSFT:     'NASDAQ:MSFT',
  TSLA:     'NASDAQ:TSLA',
  NVDA:     'NASDAQ:NVDA',
  AMZN:     'NASDAQ:AMZN',
  META:     'NASDAQ:META',
};

/**
 * Convert a normalized base symbol to a TradingView exchange:symbol string.
 * If the input already contains ':', it is returned as-is.
 */
export function toTradingViewSymbol(normalized = '') {
  if (!normalized) return null;
  if (normalized.includes(':')) return normalized;
  const base = normalized.toUpperCase();
  return TV_MAP[base] || null;
}

/**
 * Full pipeline: raw instrument symbol → TradingView symbol.
 * e.g. 'BTC-PERP' → 'BINANCE:BTCUSDT'
 */
export function rawToTVSymbol(raw = '') {
  return toTradingViewSymbol(normalizeSymbol(raw));
}