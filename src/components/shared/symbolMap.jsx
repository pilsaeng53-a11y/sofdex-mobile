// ── SOFDex display symbol → TradingView ticker (for chart) ───────────────────
export const SYMBOL_MAP = {
  // Crypto — Large cap
  'BTC':        'BINANCE:BTCUSDT',
  'ETH':        'BINANCE:ETHUSDT',
  'SOL':        'BINANCE:SOLUSDT',
  // Medium cap
  'BNB':        'BINANCE:BNBUSDT',
  'XRP':        'BINANCE:XRPUSDT',
  'ADA':        'BINANCE:ADAUSDT',
  'DOGE':       'BINANCE:DOGEUSDT',
  'AVAX':       'BINANCE:AVAXUSDT',
  'DOT':        'BINANCE:DOTUSDT',
  'LINK':       'BINANCE:LINKUSDT',
  'POL':        'BINANCE:POLUSDT',
  'LTC':        'BINANCE:LTCUSDT',
  'ATOM':       'BINANCE:ATOMUSDT',
  'UNI':        'BINANCE:UNIUSDT',
  'APT':        'BINANCE:APTUSDT',
  // Smaller assets
  'OP':         'BINANCE:OPUSDT',
  'ARB':        'BINANCE:ARBUSDT',
  'SUI':        'BINANCE:SUIUSDT',
  'SEI':        'BINANCE:SEIUSDT',
  'INJ':        'BINANCE:INJUSDT',
  'PEPE':       'BINANCE:PEPEUSDT',
  'TIA':        'BINANCE:TIAUSDT',
  'NEAR':       'BINANCE:NEARUSDT',
  'FTM':        'BINANCE:FTMUSDT',
  'AAVE':       'BINANCE:AAVEUSDT',
  // Solana ecosystem
  'JUP':        'BINANCE:JUPUSDT',
  'RAY':        'BINANCE:RAYUSDT',
  'BONK':       'BINANCE:BONKUSDT',
  'HNT':        'BINANCE:HNTUSDT',
  // SOF token — DEX-only on Raydium, no TradingView-supported exchange feed
  // Returning null shows the "View on Raydium" valuation notice in TradingViewChart
  'SOF':        null,
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
  // RWA Equities
  'RE-NYC':     'TVC:CSUSHPINSA',
  'RE-DXB':     'TVC:CSUSHPINSA',
  // Liquid commodity-style RWA — TradingView symbols that match Yahoo Finance prices exactly
  // Yahoo Finance feed: GC=F, SI=F, CL=F, ^GSPC, ^TNX, EURUSD=X
  'GOLD-T':     'TVC:GOLD',          // Spot gold XAU/USD — matches GC=F (COMEX)
  'SILVER-T':   'TVC:SILVER',        // Spot silver XAG/USD — matches SI=F (COMEX)
  'CRUDE-T':    'TVC:USOIL',         // WTI crude oil — matches CL=F
  'SP500-T':    'SP:SPX',            // S&P 500 index — matches ^GSPC
  'TBILL':      'TVC:US10Y',         // US 10Y Treasury yield — matches ^TNX
  'EURO-B':     'TVC:EURUSD',        // EUR/USD FX rate — matches EURUSD=X
  // Landmark Real Estate — use benchmark index proxies
  'RE-MHT-1':   'TVC:CSUSHPINSA',   // Case-Shiller US Home Price Index (closest public RE bench)
  'RE-DXB-1':   null,                // No public TV symbol for Dubai; chart uses internal series
  'RE-LDN-1':   null,                // MSCI/IPD — no public TV feed; uses internal series
  'RE-SGP-1':   null,
  'RE-TYO-1':   null,
};

// ── SOFDex symbol → Binance spot ticker (for WS + REST price feed) ────────────
export const BINANCE_TICKER = {
  'BTC':   'BTCUSDT',
  'ETH':   'ETHUSDT',
  'SOL':   'SOLUSDT',
  'BNB':   'BNBUSDT',
  'XRP':   'XRPUSDT',
  'ADA':   'ADAUSDT',
  'DOGE':  'DOGEUSDT',
  'AVAX':  'AVAXUSDT',
  'DOT':   'DOTUSDT',
  'LINK':  'LINKUSDT',
  'POL':   'POLUSDT',
  'LTC':   'LTCUSDT',
  'ATOM':  'ATOMUSDT',
  'UNI':   'UNIUSDT',
  'APT':   'APTUSDT',
  'OP':    'OPUSDT',
  'ARB':   'ARBUSDT',
  'SUI':   'SUIUSDT',
  'SEI':   'SEIUSDT',
  'INJ':   'INJUSDT',
  'PEPE':  'PEPEUSDT',
  'TIA':   'TIAUSDT',
  'NEAR':  'NEARUSDT',
  'FTM':   'FTMUSDT',
  'AAVE':  'AAVEUSDT',
  'JUP':   'JUPUSDT',
  'RAY':   'RAYUSDT',
  'BONK':  'BONKUSDT',
  'HNT':   'HNTUSDT',
};

// ── SOFDex symbol → CoinGecko coin ID (fallback REST feed) ────────────────────
export const COINGECKO_ID = {
  'BTC':   'bitcoin',
  'ETH':   'ethereum',
  'SOL':   'solana',
  'BNB':   'binancecoin',
  'XRP':   'ripple',
  'ADA':   'cardano',
  'DOGE':  'dogecoin',
  'AVAX':  'avalanche-2',
  'DOT':   'polkadot',
  'LINK':  'chainlink',
  'MATIC': 'matic-network',
  'LTC':   'litecoin',
  'ATOM':  'cosmos',
  'UNI':   'uniswap',
  'APT':   'aptos',
  'OP':    'optimism',
  'ARB':   'arbitrum',
  'SUI':   'sui',
  'SEI':   'sei-network',
  'INJ':   'injective-protocol',
  'PEPE':  'pepe',
  'TIA':   'celestia',
  'NEAR':  'near',
  'FTM':   'fantom',
  'AAVE':  'aave',
  'JUP':   'jupiter-exchange-solana',
  'RAY':   'raydium',
  'RNDR':  'render-token',
  'BONK':  'bonk',
  'HNT':   'helium',
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