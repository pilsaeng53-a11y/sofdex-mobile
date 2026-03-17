# SOF Pool-Based Price Implementation

**Status**: ✅ IMPLEMENTED  
**Date**: 2026-03-17  
**Single Source of Truth**: Exact Dexscreener Pool Address

---

## Pool Address (THE ONLY SOURCE)

```
Pool: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

This pool address is used for:
- ✅ Real-time price fetching
- ✅ Swap calculations
- ✅ Chart data
- ✅ Portfolio valuations
- ✅ All SOF features

---

## What Changed

### Before (WRONG)
```
- Used token mint: JiP6JdVt7h5XnZBqFiBvXhk3vkCzBEjGqBZ4QrKr4TS
- Relied on Raydium API then fallback to Dexscreener mint lookup
- Could miss exact pool liquidity data
- Swap links didn't guarantee actual trading pool
```

### After (CORRECT)
```
- Uses exact pool address: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
- Fetches directly from pool liquidity data
- Single source of truth for all price operations
- Accurate swap calculations based on real pool
- Shows "No liquidity data" if pool unavailable (never shows 0)
```

---

## Files Updated

### 1. `src/services/SOFPriceService.js`
- ✅ Changed to use pool address instead of token mint
- ✅ Removed Raydium API fallback
- ✅ Only uses Dexscreener pool endpoint
- ✅ Returns error state (not 0) if pool unavailable
- ✅ Exports: `getSOFPriceFromPool()`, `fetchSOFPrice()`

### 2. `src/hooks/useSOFPrice.js`
- ✅ Updated to handle `price: null` (not just 0)
- ✅ Improved validation in swap calculations
- ✅ Better error handling
- ✅ Exports pool address in response

### 3. `src/components/shared/SOFChartDEX.jsx`
- ✅ Uses exact pool address for chart data
- ✅ Removed fallback chart generation (was fake data)
- ✅ Shows "No liquidity data" on pool failure
- ✅ Better error states

---

## Implementation Checklist

### Price Fetching
- [x] Service uses pool address
- [x] API returns real pool liquidity data
- [x] No fallback to mint-based lookup
- [x] Error state returns null price, not 0

### Swap Calculations
- [x] Hook validates price before calculation
- [x] Returns 0 only when price is invalid
- [x] Uses `price * inputAmount` logic
- [x] Prevents NaN outputs

### Chart Display
- [x] Uses pool address for OHLCV data
- [x] No fallback chart generation
- [x] Shows error if data unavailable
- [x] Handles empty responses properly

### All SOF Pages
- [x] Home (SOF card)
- [x] SolFort Hub
- [x] Token pricing
- [x] Swap page
- [x] Portfolio
- [x] Market cards

---

## How It Works

### Step 1: Component Requests Price
```javascript
const { sofPrice, loading, error } = useSOFPrice();
```

### Step 2: Hook Fetches from Service
```javascript
const data = await fetchSOFPrice();
// Uses: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

### Step 3: Service Gets Pool Data
```javascript
const response = await fetch(
  `https://api.dexscreener.com/latest/dex/pairs/solana/${POOL_ADDRESS}`
);
const pair = response.json().pair;
return { price: pair.priceUsd, ... };
```

### Step 4: Price Used Globally
```javascript
// In any component
<div>SOF: ${sofPrice}</div>  // Real pool price
```

---

## Swap Example

```javascript
import { useSOFPrice } from '@/hooks/useSOFPrice';

function SwapComponent() {
  const { sofPrice, calculateOutput } = useSOFPrice();
  const [inputAmount, setInputAmount] = useState(1000);
  
  // Swap 1000 USDC → SOF
  const sofOutput = calculateOutput(inputAmount, 'USDC', 'SOF');
  // Uses pool price: 1000 / sofPrice
  
  return (
    <div>
      <input value={inputAmount} />
      <div>You get: {sofOutput.toFixed(4)} SOF</div>
      {/* Price is always from: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS */}
    </div>
  );
}
```

---

## Error Handling

### If Pool Unavailable
```javascript
// Service returns:
{
  price: null,  // NOT 0
  error: 'No liquidity data available for SOF pool'
}

// UI shows:
<div>No liquidity data</div>
```

### Never Shows
```
❌ $0.00 (fake price)
❌ Stale data
❌ Fallback sources
✅ "No liquidity data" (correct)
```

---

## Chart Data

### Before
```
- Tried mint lookup: /pairs/solana/JiP6JdVt7h5XnZBqFiBvXhk3vkCzBEjGqBZ4QrKr4TS
- Fallback: generated fake chart data
- Users see placeholder prices
```

### After
```
- Uses pool address: /pairs/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
- No fallback (shows error if unavailable)
- Users see real pool price history
```

---

## Validation

### Price Validation
```javascript
// Invalid prices are rejected:
if (!price || price <= 0 || isNaN(price)) {
  throw new Error(`Invalid price from pool: ${price}`);
}
```

### Calculation Validation
```javascript
// Swap output validated:
const output = inputAmount / sofData.price;
return isNaN(output) ? 0 : output;
```

---

## Dexscreener API

### Endpoint Used
```
GET https://api.dexscreener.com/latest/dex/pairs/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

### Response Structure
```json
{
  "pair": {
    "address": "4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS",
    "priceUsd": "0.045",        // ← Used as sofPrice
    "liquidity": { "usd": 1500000 },
    "volume": { "h24": 250000 },
    "priceChange": { "h24": 2.5 },
    "bars": [                   // ← Used for chart
      { "time": 1234567, "close": 0.045, "high": 0.046, "low": 0.044, ... }
    ]
  }
}
```

---

## Testing

### Test 1: Real Price
```javascript
const { sofPrice } = useSOFPrice();
expect(sofPrice).toBeGreaterThan(0);
expect(sofPrice).not.toBeNaN();
```

### Test 2: Swap Output
```javascript
const { calculateOutput } = useSOFPrice();
const output = calculateOutput(1000, 'USDC', 'SOF');
expect(output).toBeGreaterThan(0);
expect(output).toBe(1000 / sofPrice);
```

### Test 3: Chart Data
```javascript
// Chart component should:
// 1. Load from pool address
// 2. Show real prices
// 3. Not show fallback data
// 4. Show error if pool unavailable
```

---

## Pages Using Pool Price

All these pages now use the exact pool address:

- ✅ Home (SolFort token card)
- ✅ SolFort Hub (token display)
- ✅ Swap (price calculations)
- ✅ Portfolio (SOF valuation)
- ✅ Markets (SOF card)
- ✅ Trading Feed (price displays)
- ✅ Charts (SOFChartDEX)
- ✅ Any component using `useSOFPrice()`

---

## FAQ

**Q: What if pool address changes?**  
A: Update in `SOFPriceService.js` line 11. All pages auto-update.

**Q: Why not use token mint?**  
A: Mint doesn't guarantee which pool is used. Pool address is exact.

**Q: What if Dexscreener API fails?**  
A: Returns error state, UI shows "No liquidity data". Never shows 0.

**Q: How often does price update?**  
A: Every 10 seconds (configurable in `useSOFPrice(autoRefreshInterval)`).

**Q: Can I use TradingView for SOF?**  
A: No. Only the pool address (4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS).

---

## Summary

✅ **Single Source**: Exact pool address  
✅ **Real Data**: Direct from liquidity pool  
✅ **No Fallbacks**: Error handling, never fake data  
✅ **Global Use**: All pages/components use pool price  
✅ **Validated**: Price checks prevent NaN/0 issues  

**SOF price, swap, and chart now work correctly with the exact pool as the single source of truth.**