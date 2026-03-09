// Shared SOFDex symbol → TradingView symbol mapping
// Used by TradingViewChart AND useLivePrices to ensure consistency
export const SYMBOL_MAP = {
  'BTC':    'BINANCE:BTCUSDT',
  'ETH':    'BINANCE:ETHUSDT',
  'SOL':    'BINANCE:SOLUSDT',
  'JUP':    'BINANCE:JUPUSDT',
  'RAY':    'BINANCE:RAYUSDT',
  'RNDR':   'BINANCE:RNDRUSDT',
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
};

/**
 * Returns the Binance spot symbol (e.g. "BTCUSDT") if the TradingView symbol
 * is on Binance, otherwise null.  This is what we use for live REST API calls.
 */
export function getBinanceSymbol(sofSymbol) {
  const tv = SYMBOL_MAP[sofSymbol];
  if (tv && tv.startsWith('BINANCE:')) return tv.replace('BINANCE:', '');
  return null;
}