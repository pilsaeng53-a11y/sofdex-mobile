/**
 * SOF DEDICATED DATA SERVICE
 * 
 * PERMANENT RULE: All SOF-related data MUST use this service.
 * SOF must never use TradingView or generic market data feeds.
 * 
 * SINGLE SOURCE OF TRUTH: Exact Dexscreener Pool Address
 * Pool: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
 * All SOF features sync from this ONE pool
 */

// EXACT POOL ADDRESS - PRIMARY AND ONLY SOURCE
const SOF_POOL_ADDRESS = "4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS";
const DEXSCREENER_API = "https://api.dexscreener.com/latest";

/**
 * Fetch SOF price directly from pool liquidity data via Dexscreener
 * Uses exact pool address as the single source of truth
 * Returns: { price, change24h, volume24h, liquidity, timestamp, poolAddress }
 */
export async function getSOFPriceFromPool() {
  try {
    // Fetch pool data directly using pool address
    const response = await fetch(
      `${DEXSCREENER_API}/dex/pairs/solana/${SOF_POOL_ADDRESS}`
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.pair) throw new Error('No pool data found');

    const pair = data.pair;
    
    // Extract price from pool liquidity data
    const price = parseFloat(pair.priceUsd);
    
    // Validate we have a real price
    if (!price || price <= 0 || isNaN(price)) {
      throw new Error(`Invalid price from pool: ${price}`);
    }

    const change24h = parseFloat(pair.priceChange?.h24) || 0;
    const volume24h = parseFloat(pair.volume?.h24) || 0;
    const liquidity = parseFloat(pair.liquidity?.usd) || 0;

    return {
      price,
      change24h,
      volume24h,
      liquidity,
      source: 'dexscreener_pool',
      poolAddress: SOF_POOL_ADDRESS,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('[SOF] Pool fetch failed:', err.message);
    return null;
  }
}

/**
 * Get SOF price from pool (ONLY SOURCE - no fallbacks)
 * If pool data unavailable: show "No liquidity data" error
 * Never show 0 or placeholder values
 */
export async function fetchSOFPrice() {
  // Fetch from exact pool address
  const result = await getSOFPriceFromPool();
  
  if (result) {
    return result;
  }

  // If pool data fails: return error state (not 0)
  return {
    price: null,
    change24h: 0,
    volume24h: 0,
    liquidity: 0,
    source: 'pool_failed',
    poolAddress: SOF_POOL_ADDRESS,
    timestamp: Date.now(),
    error: 'No liquidity data available for SOF pool',
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
 * Uses exact Dexscreener pool address as primary (and only) source
 */
export const SOF_DATA_SOURCE = {
  name: 'SOF Pool-Based DEX Service',
  primarySource: 'Dexscreener Pool',
  poolAddress: SOF_POOL_ADDRESS,
  note: 'SOF MUST ALWAYS use this exact pool. Never use mint-based lookup, TradingView, or generic market data.',
};

export default {
  getSOFPriceFromPool,
  fetchSOFPrice,
  calculateSwapOutput,
  calculateSOFPortfolioValue,
  SOF_DATA_SOURCE,
};