/**
 * SOF TEMPORARY FIXED PRICE SERVICE (STABILIZATION PHASE)
 * 
 * TEMPORARY: SOF price is LOCKED at $4.00 USD
 * Live Dexscreener fetching is DISABLED during this stabilization phase
 * 
 * POOL ADDRESS (kept for reference):
 * 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
 * 
 * TO RE-ENABLE LIVE DEX PRICING:
 * 1. Restore fetch() logic in getSOFPriceFromPool()
 * 2. Re-add retry logic and error handling
 * 3. Remove fixed price override in fetchSOFPrice()
 * 4. Update useSOFPrice.js to remove fixed values
 * 5. Test with live Dexscreener API responses
 */

// EXACT POOL ADDRESS - For future DEX integration
const SOF_POOL_ADDRESS = "4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS";
const DEXSCREENER_API = "https://api.dexscreener.com/latest";

// Temporary fixed values (used during stabilization)
let lastValidPrice = null;
let failureCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// FIXED SOF PRICE - ALL REQUESTS RETURN THIS
const FIXED_SOF_PRICE = 4.00;
const FIXED_SOF_DATA = {
  price: FIXED_SOF_PRICE,
  priceNative: FIXED_SOF_PRICE,
  change24h: 0,
  volume24h: 8500000,
  liquidity: 5000000,
  transactions: {
    buy24h: 2500,
    sell24h: 1500,
  },
  source: 'fixed_temporary',
  poolAddress: SOF_POOL_ADDRESS,
  chainId: 'solana',
  timestamp: Date.now(),
  apiStatus: 'fixed',
};

/**
 * TEMPORARY: Return fixed SOF price
 * This function is disabled for live fetching during stabilization phase
 * 
 * Returns: { price: 4.00, change24h: 0, volume24h: 8500000, ... }
 */
export async function getSOFPriceFromPool(retryAttempt = 0) {
  // TEMPORARY: Return fixed $4 price (no DEX fetch)
  const result = { ...FIXED_SOF_DATA, timestamp: Date.now() };
  lastValidPrice = result;
  return result;
}

/**
 * TEMPORARY: Always return fixed $4 price
 * Live Dexscreener fetch is disabled
 * 
 * Returns: Fixed price object with $4 USD value
 */
export async function fetchSOFPrice() {
  // TEMPORARY: Return fixed price immediately
  const result = { ...FIXED_SOF_DATA, timestamp: Date.now() };
  return result;
}

/**
 * Simulate swap output based on fixed SOF price
 */
export function calculateSwapOutput(
  inputAmount,
  inputToken,
  outputToken,
  currentSOFPrice = FIXED_SOF_PRICE
) {
  // If swapping TO SOF, use fixed price
  if (outputToken === 'SOF') {
    const outputSOF = inputAmount / currentSOFPrice;
    return outputSOF;
  }

  // If swapping FROM SOF, use fixed price
  if (inputToken === 'SOF') {
    const outputValue = inputAmount * currentSOFPrice;
    return outputValue;
  }

  // Other swaps
  return inputAmount;
}

/**
 * Get SOF portfolio value using fixed price
 */
export function calculateSOFPortfolioValue(sofHolding, currentPrice = FIXED_SOF_PRICE) {
  return sofHolding * currentPrice;
}

/**
 * Single source of truth for all SOF prices
 * TEMPORARY: Returns fixed $4 price
 */
export const SOF_DATA_SOURCE = {
  name: 'SOF Fixed Price Service (Temporary)',
  primarySource: 'Fixed Value',
  poolAddress: SOF_POOL_ADDRESS,
  fixedPrice: FIXED_SOF_PRICE,
  status: 'TEMPORARY - DEX FETCHING DISABLED',
  note: 'Live DEX integration will be restored after stabilization phase.',
};

export default {
  getSOFPriceFromPool,
  fetchSOFPrice,
  calculateSwapOutput,
  calculateSOFPortfolioValue,
  SOF_DATA_SOURCE,
};