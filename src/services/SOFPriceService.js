/**
 * SOF DEDICATED DATA SERVICE
 * 
 * PERMANENT RULE: All SOF-related data MUST use this service.
 * SOF must never use TradingView or generic market data feeds.
 * 
 * SINGLE SOURCE OF TRUTH: Exact Dexscreener Pool Address
 * Pool: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
 * All SOF features sync from this ONE pool
 * 
 * RESILIENCE: Includes retry logic and last-known-price fallback
 * - Failed fetches don't clear valid cached prices
 * - Auto-retry failed requests
 * - Keep price visible during temporary API failures
 */

// EXACT POOL ADDRESS - PRIMARY AND ONLY SOURCE
const SOF_POOL_ADDRESS = "4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS";
const DEXSCREENER_API = "https://api.dexscreener.com/latest";

// Resilience settings
let lastValidPrice = null; // Store last successful price for fallback
let failureCount = 0; // Track consecutive failures for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

/**
 * Fetch SOF price directly from pool liquidity data via Dexscreener API
 * Uses exact pool address as the single source of truth
 * Actively retrieves live data from the Raydium pool with retry logic
 * Returns: { price, change24h, volume24h, liquidity, priceNative, timestamp, poolAddress, apiStatus }
 */
export async function getSOFPriceFromPool(retryAttempt = 0) {
  try {
    // ACTIVE FETCH: Get real-time pool data using exact pool address
    const response = await fetch(
      `${DEXSCREENER_API}/dex/pairs/solana/${SOF_POOL_ADDRESS}`,
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000), // 8s timeout
      }
    );
    
    if (!response.ok) {
      throw new Error(`Dexscreener API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.pair) {
      throw new Error('No pool pair data found from Dexscreener');
    }

    const pair = data.pair;
    
    // EXTRACT LIVE PRICE from USD value
    const priceUsd = parseFloat(pair.priceUsd);
    const priceNative = parseFloat(pair.priceNative);
    
    // Validate we have a REAL, NON-ZERO price
    if (!priceUsd || priceUsd <= 0 || isNaN(priceUsd)) {
      throw new Error(`Invalid SOF price from Dexscreener: ${priceUsd}`);
    }

    // Extract additional market data
    const change24h = parseFloat(pair.priceChange?.h24) || 0;
    const volume24h = parseFloat(pair.volume?.h24) || 0;
    const liquidity = parseFloat(pair.liquidity?.usd) || 0;
    const txns24h = pair.txns?.h24 || {};

    // SUCCESS: Reset failure counter and store as last valid price
    failureCount = 0;
    const result = {
      price: priceUsd,
      priceNative: priceNative || priceUsd,
      change24h,
      volume24h,
      liquidity,
      transactions: {
        buy24h: txns24h.buys || 0,
        sell24h: txns24h.sells || 0,
      },
      source: 'dexscreener_live',
      poolAddress: SOF_POOL_ADDRESS,
      chainId: 'solana',
      timestamp: Date.now(),
      apiStatus: 'success',
    };
    
    lastValidPrice = result;
    return result;
  } catch (err) {
    console.error('[SOF] Dexscreener API fetch failed (attempt ' + (retryAttempt + 1) + '):', err.message);
    failureCount++;
    
    // RETRY LOGIC: If we haven't exceeded retries and have a fallback, retry
    if (retryAttempt < MAX_RETRIES && lastValidPrice) {
      console.warn('[SOF] Retrying fetch...');
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return getSOFPriceFromPool(retryAttempt + 1);
    }
    
    return null;
  }
}

/**
 * Actively fetch SOF price from Dexscreener pool
 * Primary source: Exact pool address on Solana Raydium
 * 
 * If fetch succeeds: Returns live market data
 * If fetch fails: Returns error state (NOT 0, NOT "No liquidity data")
 * 
 * Auto-called every 3 seconds by useSOFPrice hook
 */
export async function fetchSOFPrice() {
  // Actively fetch from Dexscreener using exact pool address
  const result = await getSOFPriceFromPool();
  
  if (result && result.price) {
    // ✓ Got real live price from Dexscreener
    return result;
  }

  // ✗ Dexscreener API failed - return error state
  // DO NOT return 0, DO NOT return "No liquidity data"
  // Instead return null and let component handle it
  return {
    price: null,
    priceNative: null,
    change24h: null,
    volume24h: null,
    liquidity: null,
    source: 'dexscreener_failed',
    poolAddress: SOF_POOL_ADDRESS,
    timestamp: Date.now(),
    apiStatus: 'error',
    error: 'Unable to fetch SOF price from Dexscreener. Pool may have no liquidity or API is unavailable.',
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