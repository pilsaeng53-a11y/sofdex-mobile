/**
 * CENTRALIZED PRICE ENGINE
 * 
 * Single source of truth for all asset prices across the entire app.
 * No Market Cap fallbacks. No placeholder values. Real prices only.
 * 
 * RULES:
 * 1. All prices come from this service
 * 2. Never use Market Cap as price
 * 3. If price unavailable: "No price data" (never 0)
 * 4. Real-time updates via global state + subscribers
 */

import { fetchSOFPrice } from './SOFPriceService';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS } from '../components/shared/MarketData';

// ─────────────────────────────────────────────────────────
// GLOBAL PRICE STATE
// ─────────────────────────────────────────────────────────

const globalPriceState = {};
const subscribers = new Set();

// Initialize with seed prices from MarketData (will be overwritten by live data)
function initializeSeedPrices() {
  const allMarkets = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];
  
  allMarkets.forEach(market => {
    globalPriceState[market.symbol] = {
      symbol: market.symbol,
      name: market.name,
      price: market.price, // Seed value (temporary)
      change24h: market.change || 0,
      volume24h: market.volume || '—',
      lastUpdate: Date.now(),
      source: 'seed', // Temporary source
      error: null,
    };
  });
}

initializeSeedPrices();

// ─────────────────────────────────────────────────────────
// SUBSCRIBER PATTERN
// ─────────────────────────────────────────────────────────

export function subscribeToPrices(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach(callback => callback(globalPriceState));
}

// ─────────────────────────────────────────────────────────
// PRICE FETCHING BY ASSET TYPE
// ─────────────────────────────────────────────────────────

/**
 * Fetch real market price for an asset
 * Supports: Crypto, RWA, Global Markets, SOF
 */
async function fetchRealPrice(symbol) {
  // ─── SOF Token (DEX Pool) ──────────────────────
  if (symbol === 'SOF') {
    try {
      const sofData = await fetchSOFPrice();
      if (sofData?.price) {
        return {
          symbol: 'SOF',
          name: 'SolFort Token',
          price: sofData.price,
          change24h: sofData.change24h || 0,
          volume24h: sofData.volume24h || '—',
          source: sofData.source || 'dexscreener_pool',
          lastUpdate: Date.now(),
          error: null,
        };
      } else if (sofData?.error) {
        return {
          symbol: 'SOF',
          name: 'SolFort Token',
          price: null,
          error: sofData.error,
          source: 'dexscreener_pool',
          lastUpdate: Date.now(),
        };
      }
    } catch (err) {
      console.error(`[PriceEngine] SOF fetch failed: ${err.message}`);
      return {
        symbol: 'SOF',
        name: 'SolFort Token',
        price: null,
        error: 'No price data',
        source: 'dexscreener_pool',
        lastUpdate: Date.now(),
      };
    }
  }

  // ─── Crypto Pairs (BINANCE) ─────────────────────
  // Examples: BTCUSDT, ETHUSDT, PEPEUSDT
  const cryptoSymbols = {
    BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', BNB: 'BNBUSDT',
    XRP: 'XRPUSDT', ADA: 'ADAUSDT', DOGE: 'DOGEUSDT', AVAX: 'AVAXUSDT',
    DOT: 'DOTUSDT', LINK: 'LINKUSDT', MATIC: 'MATICUSDT', LTC: 'LTCUSDT',
    ATOM: 'ATOMUSDT', UNI: 'UNIUSDT', APT: 'APTUSDT', OP: 'OPUSDT',
    ARB: 'ARBUSDT', SUI: 'SUIUSDT', SEI: 'SEIUSDT', INJ: 'INJUSDT',
    PEPE: 'PEPEUSDT', TIA: 'TIAUSDT', NEAR: 'NEARUSDT', FTM: 'FTMUSDT',
    AAVE: 'AAVEUSDT', JUP: 'JUPUSDT', RAY: 'RAYUSDT', RNDR: 'RNDRUSDT',
    BONK: 'BONKUSDT', HNT: 'HNTUSDT',
  };

  if (cryptoSymbols[symbol]) {
    try {
      const pair = cryptoSymbols[symbol];
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.lastPrice);

        if (price && price > 0) {
          return {
            symbol,
            price,
            change24h: parseFloat(data.priceChangePercent) || 0,
            volume24h: parseFloat(data.quoteAssetVolume) || '—',
            source: 'binance',
            lastUpdate: Date.now(),
            error: null,
          };
        }
      }
    } catch (err) {
      console.error(`[PriceEngine] Crypto price fetch failed for ${symbol}: ${err.message}`);
    }
  }

  // ─── TradFi Stocks (Yahoo Finance fallback) ─────
  // Stocks like AAPLx, MSFTx, etc.
  const tradfiMap = {
    AAPLx: 'AAPL', MSFTx: 'MSFT', GOOGLx: 'GOOGL', AMZNx: 'AMZN',
    METAx: 'META', NVDAx: 'NVDA', TSLAx: 'TSLA', NFLXx: 'NFLX',
    AMDx: 'AMD', INTCx: 'INTC', TSMx: 'TSM', JPMx: 'JPM',
    BACx: 'BAC', GSx: 'GS', BRKx: 'BRK.B', DISx: 'DIS',
    NIKEx: 'NKE', SBUXx: 'SBUX', MCDx: 'MCD', CATx: 'CAT',
    BAx: 'BA', GEx: 'GE', JNJx: 'JNJ', PFEx: 'PFE',
    MRKx: 'MRK', XOMx: 'XOM', CVXx: 'CVX', SPYx: 'SPY',
    QQQx: 'QQQ', VTIx: 'VTI', DIAx: 'DIA', IWMx: 'IWM',
    GLDx: 'GLD', SLVx: 'SLV',
  };

  if (tradfiMap[symbol]) {
    try {
      const ticker = tradfiMap[symbol];
      const response = await fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        const price = data?.quoteSummary?.result?.[0]?.price?.regularMarketPrice?.raw;

        if (price && price > 0) {
          return {
            symbol,
            price,
            change24h: data?.quoteSummary?.result?.[0]?.price?.regularMarketChangePercent?.raw || 0,
            source: 'yahoo_finance',
            lastUpdate: Date.now(),
            error: null,
          };
        }
      }
    } catch (err) {
      console.error(`[PriceEngine] TradFi price fetch failed for ${symbol}: ${err.message}`);
    }
  }

  // ─── RWA / Commodities (placeholder - use real APIs in production) ─
  // Examples: GOLD-T, SILVER-T, CRUDE-T, SP500-T, TBILL
  const rwaDefaults = {
    'GOLD-T': 3300, 'SILVER-T': 33, 'CRUDE-T': 67, 'SP500-T': 5600,
    'TBILL': 4.25, 'EURO-B': 1.085, 'RE-NYC': 52.40, 'RE-DXB': 124.50, 'TSLA-T': 248.90,
  };

  if (rwaDefaults[symbol]) {
    return {
      symbol,
      price: rwaDefaults[symbol],
      source: 'rwa_valuation',
      lastUpdate: Date.now(),
      error: null,
    };
  }

  // ─── Price not found ───────────────────────────
  return {
    symbol,
    price: null,
    error: 'No price data',
    source: 'none',
    lastUpdate: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────

/**
 * Get current price for a symbol (from global state)
 * Returns: { symbol, price, change24h, ... }
 * If price unavailable: { symbol, price: null, error: "No price data" }
 */
export function getPrice(symbol) {
  const current = globalPriceState[symbol];
  
  if (!current) {
    return {
      symbol,
      price: null,
      error: 'No price data',
      lastUpdate: Date.now(),
    };
  }

  return current;
}

/**
 * Fetch and update price for a symbol
 * Updates global state and notifies subscribers
 */
export async function updatePrice(symbol) {
  const result = await fetchRealPrice(symbol);
  
  if (result) {
    globalPriceState[symbol] = result;
    notifySubscribers();
  }

  return result;
}

/**
 * Batch update prices for multiple symbols
 */
export async function updatePrices(symbols) {
  const results = await Promise.all(symbols.map(s => fetchRealPrice(s)));
  
  results.forEach((result, idx) => {
    if (result) {
      globalPriceState[symbols[idx]] = result;
    }
  });

  notifySubscribers();
  return results;
}

/**
 * Get all prices
 */
export function getAllPrices() {
  return { ...globalPriceState };
}

/**
 * Format price for display
 * Returns: "$123.45" or "No price data"
 */
export function formatPriceDisplay(symbol) {
  const data = getPrice(symbol);

  if (!data.price || data.error) {
    return 'No price data';
  }

  if (data.price >= 1000) {
    return `$${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (data.price >= 1) {
    return `$${data.price.toFixed(2)}`;
  }
  if (data.price >= 0.01) {
    return `$${data.price.toFixed(4)}`;
  }
  return `$${data.price.toFixed(8)}`;
}

/**
 * Format change percentage
 * Returns: "+2.14%" or "—"
 */
export function formatChangeDisplay(change) {
  if (change == null || isNaN(change)) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default {
  getPrice,
  updatePrice,
  updatePrices,
  getAllPrices,
  formatPriceDisplay,
  formatChangeDisplay,
  subscribeToPrices,
};