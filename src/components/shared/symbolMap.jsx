// ── SOFDex display symbol → TradingView ticker (for chart) ───────────────────
export const SYMBOL_MAP = {
  'BTC':    'BINANCE:BTCUSDT',
  'ETH':    'BINANCE:ETHUSDT',
  'SOL':    'BINANCE:SOLUSDT',
  'JUP':    'BINANCE:JUPUSDT',
  'RAY':    'BINANCE:RAYUSDT',
  'RNDR':   'BINANCE:RENDERUSDT',   // renamed from RNDRUSDT after rebrand
  'BONK':   'BINANCE:BONKUSDT',
  'HNT':    'BINANCE:HNTUSDT',
  'AAPL-T': 'NASDAQ:AAPL',
  'MSFT-T': 'NASDAQ:MSFT',
  'NVDA-T': 'NASDAQ:NVDA',
  'GOLD-T': 'OANDA:XAUUSD',
  'CRUDE-T':'NYMEX:CL1!',
  'SP500-T':'SP:SPX',
  'TSLA-T': 'NASDAQ:TSLA',
  'TBILL':  'TVC:US10Y',
  'EURO-B': 'TVC:EURUSD',
  'RE-NYC': null,
  'RE-DXB': null,
  'EURO-B': 'TVC:EURUSD',
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