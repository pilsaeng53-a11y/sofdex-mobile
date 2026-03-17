/**
 * Global Markets Asset Configuration
 * MT5-style multi-asset trading structure
 * Chart source rules:
 * - Crypto → TradingView charts
 * - Forex/Commodities/Indices/Stocks → TradingView charts
 * - SOF and unsupported tokens → DEX data only
 */

export const GLOBAL_MARKETS_CATEGORIES = {
  FOREX: 'forex',
  COMMODITIES: 'commodities',
  INDICES: 'indices',
  STOCKS: 'stocks',
};

export const GLOBAL_MARKETS_ASSETS = {
  forex: [
    { symbol: 'EURUSD-T', name: 'Euro / US Dollar', tvSymbol: 'EURUSD', bid: 1.0852, ask: 1.0854, change24h: 0.42, volume: 1250000, spread: 0.0002 },
    { symbol: 'USDJPY-T', name: 'US Dollar / Japanese Yen', tvSymbol: 'USDJPY', bid: 149.35, ask: 149.37, change24h: -0.18, volume: 890000, spread: 0.02 },
    { symbol: 'GBPUSD-T', name: 'British Pound / US Dollar', tvSymbol: 'GBPUSD', bid: 1.2745, ask: 1.2747, change24h: 0.85, volume: 650000, spread: 0.0002 },
  ],
  commodities: [
    { symbol: 'GOLD-T', name: 'Gold (Spot)', tvSymbol: 'XAUUSD', bid: 2048.50, ask: 2048.80, change24h: 1.25, volume: 450000, spread: 0.30 },
    { symbol: 'SILVER-T', name: 'Silver (Spot)', tvSymbol: 'XAGUSD', bid: 24.35, ask: 24.37, change24h: 0.65, volume: 320000, spread: 0.02 },
    { symbol: 'OIL-T', name: 'Crude Oil WTI', tvSymbol: 'USOIL', bid: 78.45, ask: 78.50, change24h: -0.92, volume: 550000, spread: 0.05 },
  ],
  indices: [
    { symbol: 'SP500-T', name: 'S&P 500', tvSymbol: 'SPX', bid: 5248.15, ask: 5248.35, change24h: 1.85, volume: 2100000, spread: 0.20 },
    { symbol: 'NASDAQ-T', name: 'Nasdaq 100', tvSymbol: 'CCMP', bid: 18456.32, ask: 18456.82, change24h: 2.42, volume: 1800000, spread: 0.50 },
    { symbol: 'DOW-T', name: 'Dow Jones Industrial', tvSymbol: 'DJI', bid: 39125.45, ask: 39126.15, change24h: 0.65, volume: 1200000, spread: 0.70 },
  ],
  stocks: [
    { symbol: 'TSLA-T', name: 'Tesla Inc.', tvSymbol: 'TSLA', bid: 245.82, ask: 245.85, change24h: 3.25, volume: 5200000, spread: 0.03 },
    { symbol: 'NVDA-T', name: 'NVIDIA Corporation', tvSymbol: 'NVDA', bid: 928.45, ask: 928.50, change24h: 2.15, volume: 3100000, spread: 0.05 },
    { symbol: 'AAPL-T', name: 'Apple Inc.', tvSymbol: 'AAPL', bid: 192.35, ask: 192.38, change24h: 1.42, volume: 4800000, spread: 0.03 },
  ],
};

/**
 * Get asset by symbol
 */
export function getAssetBySymbol(symbol) {
  for (const category of Object.values(GLOBAL_MARKETS_CATEGORIES)) {
    const asset = GLOBAL_MARKETS_ASSETS[category]?.find(a => a.symbol === symbol);
    if (asset) return asset;
  }
  return null;
}

/**
 * Get all assets flattened
 */
export function getAllAssets() {
  return Object.values(GLOBAL_MARKETS_ASSETS).flat();
}

/**
 * Format price display
 */
export function formatPrice(price, symbol) {
  if (!symbol) return price.toFixed(2);
  
  // Forex pairs typically show 4 decimals
  if (symbol.includes('JPY')) return price.toFixed(2);
  if (symbol.includes('EURUSD') || symbol.includes('GBPUSD')) return price.toFixed(4);
  
  // Commodities
  if (symbol.includes('GOLD') || symbol.includes('OIL')) return price.toFixed(2);
  if (symbol.includes('SILVER')) return price.toFixed(2);
  
  // Indices & stocks
  return price.toFixed(2);
}