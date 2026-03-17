/**
 * SOF DEDICATED DATA SERVICE
 * 
 * PERMANENT RULE: All SOF-related data MUST use this service.
 * SOF must never use TradingView or generic market data feeds.
 * 
 * Single source of truth: Raydium/Dexscreener DEX data
 * All SOF features sync from this one data path
 */

const SOF_MINT = "JiP6JdVt7h5XnZBqFiBvXhk3vkCzBEjGqBZ4QrKr4TS"; // SOF token mint
const RAYDIUM_API = "https://api.raydium.io/v2";
const DEXSCREENER_API = "https://api.dexscreener.com/latest";

/**
 * Fetch SOF price from Raydium (primary source)
 * Returns: { price, change24h, volume24h, liquidity, timestamp }
 */
export async function getSOFPriceFromRaydium() {
  try {
    const response = await fetch(`${RAYDIUM_API}/main/pairs?mint=${SOF_MINT}`);
    if (!response.ok) throw new Error('Raydium API failed');
    
    const data = await response.json();
    if (!data.data?.length) throw new Error('No SOF pair found');

    const pair = data.data[0];
    const price = parseFloat(pair.price) || 0;
    const change24h = parseFloat(pair.priceChange?.h24) || 0;
    const volume24h = parseFloat(pair.volume?.h24) || 0;
    const liquidity = parseFloat(pair.liquidity?.usd) || 0;

    return {
      price,
      change24h,
      volume24h,
      liquidity,
      source: 'raydium',
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn('[SOF] Raydium fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch SOF price from Dexscreener (fallback source)
 * Returns: { price, change24h, volume24h, liquidity, timestamp }
 */
export async function getSOFPriceFromDexscreener() {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/dex/pairs/solana/${SOF_MINT}`
    );
    if (!response.ok) throw new Error('Dexscreener API failed');

    const data = await response.json();
    if (!data.pair) throw new Error('No SOF pair found');

    const pair = data.pair;
    const price = parseFloat(pair.priceUsd) || 0;
    const change24h = parseFloat(pair.priceChange?.h24) || 0;
    const volume24h = parseFloat(pair.volume?.h24) || 0;
    const liquidity = parseFloat(pair.liquidity?.usd) || 0;

    return {
      price,
      change24h,
      volume24h,
      liquidity,
      source: 'dexscreener',
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn('[SOF] Dexscreener fetch failed:', err.message);
    return null;
  }
}

/**
 * Get SOF price with fallback chain
 * Priority: Raydium → Dexscreener → cached fallback
 */
export async function fetchSOFPrice() {
  // Try Raydium first
  let result = await getSOFPriceFromRaydium();
  if (result) return result;

  // Fallback to Dexscreener
  result = await getSOFPriceFromDexscreener();
  if (result) return result;

  // Last resort: return default (should rarely happen)
  return {
    price: 0,
    change24h: 0,
    volume24h: 0,
    liquidity: 0,
    source: 'fallback',
    timestamp: Date.now(),
    error: 'Unable to fetch from any source',
  };
}

/**
 * Simulate swap output based on DEX math
 * (In production, call actual DEX contract or API)
 */
export function calculateSwapOutput(
  inputAmount,
  inputToken,
  outputToken,
  currentSOFPrice
) {
  // If swapping TO SOF, use current price
  if (outputToken === 'SOF') {
    const outputSOF = inputAmount / currentSOFPrice;
    return outputSOF;
  }

  // If swapping FROM SOF, use current price
  if (inputToken === 'SOF') {
    const outputValue = inputAmount * currentSOFPrice;
    return outputValue;
  }

  // Other swaps (should not reach here for SOF features)
  return inputAmount;
}

/**
 * Get SOF portfolio value
 * Multiplies holdings by current price
 */
export function calculateSOFPortfolioValue(sofHolding, currentPrice) {
  return sofHolding * currentPrice;
}

/**
 * Single source of truth for all SOF prices
 * All components should import and use this
 */
export const SOF_DATA_SOURCE = {
  name: 'SOF Dedicated DEX Service',
  primarySource: 'Raydium',
  fallbackSource: 'Dexscreener',
  mint: SOF_MINT,
  note: 'SOF MUST ALWAYS use this service. Never use TradingView or generic market data for SOF.',
};

export default {
  getSOFPriceFromRaydium,
  getSOFPriceFromDexscreener,
  fetchSOFPrice,
  calculateSwapOutput,
  calculateSOFPortfolioValue,
  SOF_DATA_SOURCE,
};