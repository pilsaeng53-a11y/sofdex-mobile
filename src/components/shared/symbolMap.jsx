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
  // Tokenized equities
  'AAPL-T':     'NASDAQ:AAPL',
  'MSFT-T':     'NASDAQ:MSFT',
  'NVDA-T':     'NASDAQ:NVDA',
  'TSLA-T':     'NASDAQ:TSLA',
  'SP500-T':    'SP:SPX',
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