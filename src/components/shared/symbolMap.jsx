// ── SOFDex display symbol → TradingView ticker (for chart) ───────────────────
export const SYMBOL_MAP = {
  // Crypto
  'BTC':        'BINANCE:BTCUSDT',
  'ETH':        'BINANCE:ETHUSDT',
  'SOL':        'BINANCE:SOLUSDT',
  'JUP':        'BINANCE:JUPUSDT',
  'RAY':        'BINANCE:RAYUSDT',
  'RNDR':       'BINANCE:RENDERUSDT',
  'BONK':       'BINANCE:BONKUSDT',
  'HNT':        'BINANCE:HNTUSDT',
  // SOF token — Raydium pool pair (closest public TV representation)
  'SOF':        'RAYDIUM:SOFUSDT',
  // Tokenized equities (legacy)
  'AAPL-T':     'NASDAQ:AAPL',
  'MSFT-T':     'NASDAQ:MSFT',
  'NVDA-T':     'NASDAQ:NVDA',
  'TSLA-T':     'NASDAQ:TSLA',
  'SP500-T':    'SP:SPX',
  // xStocks — Tech
  'AAPLx':      'NASDAQ:AAPL',
  'MSFTx':      'NASDAQ:MSFT',
  'GOOGLx':     'NASDAQ:GOOGL',
  'AMZNx':      'NASDAQ:AMZN',
  'METAx':      'NASDAQ:META',
  'NVDAx':      'NASDAQ:NVDA',
  'TSLAx':      'NASDAQ:TSLA',
  'NFLXx':      'NASDAQ:NFLX',
  'AMDx':       'NASDAQ:AMD',
  'INTCx':      'NASDAQ:INTC',
  'TSMx':       'NYSE:TSM',
  // xStocks — Finance
  'JPMx':       'NYSE:JPM',
  'BACx':       'NYSE:BAC',
  'GSx':        'NYSE:GS',
  'BRKx':       'NYSE:BRK.B',
  // xStocks — Consumer
  'DISx':       'NYSE:DIS',
  'NIKEx':      'NYSE:NKE',
  'SBUXx':      'NASDAQ:SBUX',
  'MCDx':       'NYSE:MCD',
  // xStocks — Industrial
  'CATx':       'NYSE:CAT',
  'BAx':        'NYSE:BA',
  'GEx':        'NYSE:GE',
  // xStocks — Healthcare
  'JNJx':       'NYSE:JNJ',
  'PFEx':       'NYSE:PFE',
  'MRKx':       'NYSE:MRK',
  // xStocks — Energy
  'XOMx':       'NYSE:XOM',
  'CVXx':       'NYSE:CVX',
  // xETFs
  'SPYx':       'AMEX:SPY',
  'QQQx':       'NASDAQ:QQQ',
  'VTIx':       'AMEX:VTI',
  'DIAx':       'AMEX:DIA',
  'IWMx':       'AMEX:IWM',
  'GLDx':       'AMEX:GLD',
  'SLVx':       'AMEX:SLV',
  // Commodities & macro
  'GOLD-T':     'OANDA:XAUUSD',
  'CRUDE-T':    'NYMEX:CL1!',
  'TBILL':      'TVC:US10Y',
  'EURO-B':     'TVC:EURUSD',
  // Legacy RE symbols (kept for backwards compat)
  'RE-NYC':     null,
  'RE-DXB':     null,
  // Landmark Real Estate — use benchmark index proxies
  'RE-MHT-1':   'TVC:CSUSHPINSA',   // Case-Shiller US Home Price Index (closest public RE bench)
  'RE-DXB-1':   null,                // No public TV symbol for Dubai; chart uses internal series
  'RE-LDN-1':   null,                // MSCI/IPD — no public TV feed; uses internal series
  'RE-SGP-1':   null,
  'RE-TYO-1':   null,
};

// ── SOFDex symbol → Binance spot ticker (for WS + REST price feed) ────────────
export const BINANCE_TICKER = {
  'BTC':  'BTCUSDT',
  'ETH':  'ETHUSDT',
  'SOL':  'SOLUSDT',
  'JUP':  'JUPUSDT',
  'RAY':  'RAYUSDT',
  'RNDR': 'RENDERUSDT',
  'BONK': 'BONKUSDT',
  'HNT':  'HNTUSDT',
  'RAY':  'RAYUSDT',
};

// ── SOFDex symbol → CoinGecko coin ID (fallback REST feed) ────────────────────
export const COINGECKO_ID = {
  'BTC':  'bitcoin',
  'ETH':  'ethereum',
  'SOL':  'solana',
  'JUP':  'jupiter-exchange-solana',
  'RAY':  'raydium',
  'RNDR': 'render-token',
  'BONK': 'bonk',
  'HNT':  'helium',
};

/** Returns the Binance spot ticker or null (used by the data provider). */
export function getBinanceSymbol(sofSymbol) {
  return BINANCE_TICKER[sofSymbol] ?? null;
}

/** Returns the CoinGecko ID or null. */
export function getCoinGeckoId(sofSymbol) {
  return COINGECKO_ID[sofSymbol] ?? null;
}

/**
 * Returns the TradingView chart symbol for any SOFDex asset symbol.
 * - If the symbol already has a colon (e.g. "NASDAQ:AAPL"), returns it directly.
 * - Checks SYMBOL_MAP first, then falls back to Binance USDT pair for crypto.
 * - Returns null for assets without a known chart source (illiquid RWA).
 */
export function getTVSymbol(sofSymbol) {
  if (!sofSymbol) return null;
  if (sofSymbol.includes(':')) return sofSymbol; // already qualified
  const mapped = SYMBOL_MAP[sofSymbol];
  if (mapped !== undefined) return mapped; // null is intentional (illiquid RWA)
  // Unknown crypto — attempt Binance pair
  const bn = BINANCE_TICKER[sofSymbol];
  if (bn) return `BINANCE:${bn}`;
  return null;
}