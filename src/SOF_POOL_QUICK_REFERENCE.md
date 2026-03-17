# SOF Pool Address - Quick Reference

## The One Pool Address (Copy This)

```
4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

**Use this pool address for:**
- Price fetching
- Swap calculations
- Chart data
- All SOF features

---

## How to Use

### In Any Component

```javascript
import { useSOFPrice } from '@/hooks/useSOFPrice';

function MyComponent() {
  const { sofPrice, error, loading } = useSOFPrice();
  
  if (loading) return <div>Loading...</div>;
  if (error || sofPrice === null) return <div>No liquidity data</div>;
  
  return <div>SOF: ${sofPrice.toFixed(4)}</div>;
}
```

### Swap Calculation

```javascript
const { calculateOutput } = useSOFPrice();

// Swap 1000 USDC → SOF
const sofOutput = calculateOutput(1000, 'USDC', 'SOF');
console.log(`You get: ${sofOutput} SOF`);

// Price source: pool address 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

### Chart Display

```javascript
import SOFChartDEX from '@/components/shared/SOFChartDEX';

<SOFChartDEX 
  timeframe="1h"      // 1h, 4h, 1d, 1w
  height={300}        // pixel height
  showVolume={false}  // show volume bars
/>
// Uses pool address for price history
```

---

## What the System Does

1. **Fetches Price**
   - Uses: `https://api.dexscreener.com/latest/dex/pairs/solana/4EXE...`
   - Gets real liquidity data from exact pool

2. **Calculates Swaps**
   - Uses pool price for conversion
   - Validates output (never returns NaN)

3. **Displays Charts**
   - Uses pool OHLCV data
   - Shows real price history

4. **Updates Globally**
   - All components sync to same price
   - Every 10 seconds (auto-refresh)

---

## Error Handling

### If Pool Is Down

```javascript
const { sofPrice, error } = useSOFPrice();

sofPrice === null  // Price is null, not 0
error === "No liquidity data available for SOF pool"

// UI should show:
// "No liquidity data" (not "$0.00")
```

### Never Shows

```
❌ $0.00
❌ Fake prices
❌ Stale data
✅ null (when unavailable)
```

---

## Files to Remember

- `src/services/SOFPriceService.js` - Core service (pool address at line 13)
- `src/hooks/useSOFPrice.js` - Global hook for all components
- `src/components/shared/SOFChartDEX.jsx` - Chart component

---

## Pool Address Is Hardcoded

```javascript
// In SOFPriceService.js
const SOF_POOL_ADDRESS = "4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS";
```

If it ever changes, update this one line. All pages auto-update.

---

## Testing a Component

```javascript
// Quick test in browser console
await import('@/hooks/useSOFPrice').then(m => m.default);
// Should show price without error
```

---

## Don't Do This

```javascript
❌ Use token mint: JiP6JdVt7h5XnZBqFiBvXhk3vkCzBEjGqBZ4QrKr4TS
❌ Use TradingView
❌ Use generic market data
❌ Create your own swap calculation
❌ Show 0 when price unavailable

✅ Use: 4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
✅ Use: useSOFPrice() hook
✅ Show: error message ("No liquidity data")
```

---

## Dexscreener API

The system calls:

```
GET https://api.dexscreener.com/latest/dex/pairs/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

Response includes:
- `priceUsd` → sofPrice
- `liquidity.usd` → liquidity
- `volume.h24` → volume24h
- `bars` → chart data

---

## All Pages Using Pool

Every SOF price on the app comes from:

```
4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

Includes:
- Home (token card)
- SolFort Hub
- Swap page
- Portfolio
- Markets
- Charts
- Any `useSOFPrice()` call

---

## Summary

✅ **One pool address**  
✅ **Real-time price**  
✅ **All features sync**  
✅ **Error handling**  
✅ **No fallbacks**  

**When in doubt: use `useSOFPrice()`**