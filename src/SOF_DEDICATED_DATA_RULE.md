# SOF DEDICATED DATA SOURCE RULE

**Status**: ✅ IMPLEMENTED  
**Effective**: 2026-03-17  
**Scope**: PERMANENT - All current & future SOF features

---

## CORE RULE

**SOF must ALWAYS use dedicated DEX-based data sources (Raydium/Dexscreener).**

**SOF must NEVER use:**
- ❌ TradingView
- ❌ Generic market data feeds
- ❌ Regular crypto data APIs
- ❌ Fallback to non-DEX sources

---

## Why This Rule Exists

SOF is the app's native token with specific requirements:
1. **DEX liquidity** is the true source of price
2. **Real-time accuracy** required for swaps
3. **Portfolio valuation** must match swap calculations
4. **Single source of truth** prevents sync issues
5. **Independence** from market data aggregators

---

## Single Source of Truth Architecture

```
                    ┌─────────────────────┐
                    │  useSOFPrice Hook   │
                    │  (Shared Global)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ SOFPriceService.js  │
                    │ (DEX Data Fetch)    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ Raydium  │ OR │Dexscreen │ OR │ Jupiter  │
        │ (Primary)│    │(Fallback)│    │(Optional)│
        └──────────┘    └──────────┘    └──────────┘

All SOF price/swap/portfolio/chart components:
├─ Home Page (SOF price)
├─ Swap Page (swap calculation)
├─ Portfolio (valuation)
├─ SolFort Hub (SOF card)
├─ SOF Detail (SOF chart)
└─ All cards/widgets
   ↓
   Uses useSOFPrice() hook
   ↓
   Gets data from SOFPriceService
   ↓
   DEX source (Raydium first, then Dexscreener)
```

---

## Implementation Files

### 1. Core Service
**File**: `src/services/SOFPriceService.js`

**Functions**:
- `fetchSOFPrice()` - Get current price (Raydium → Dexscreener)
- `getSOFPriceFromRaydium()` - Primary source
- `getSOFPriceFromDexscreener()` - Fallback source
- `calculateSwapOutput()` - Swap math using DEX price
- `calculateSOFPortfolioValue()` - Portfolio valuation

**Returns**:
```javascript
{
  price: 0.0042,              // Current price USD
  change24h: 2.5,             // 24h change %
  volume24h: 150000,          // 24h volume
  liquidity: 2500000,         // Pool liquidity USD
  source: 'raydium',          // Which DEX provided
  timestamp: 1710690617000,   // Data age
}
```

### 2. React Hook
**File**: `src/hooks/useSOFPrice.js`

**Usage**:
```javascript
const { sofPrice, change24h, calculateOutput, refresh } = useSOFPrice();

// Use SOF price
const value = holding * sofPrice;

// Calculate swap
const outputSOF = useSOFPrice().calculateOutput(100, 'USDC', 'SOF');

// Manual refresh
useSOFPrice().refresh();
```

**Features**:
- Global shared state (all components see same price)
- Auto-refresh every 10 seconds
- Fallback to cached value if API fails
- Manual refresh available
- Swap/portfolio calculation helpers

### 3. SOF Chart
**File**: `src/components/shared/SOFChartDEX.jsx`

**Rule**: Never use TradingView for SOF.

**Instead**:
- Fetch price history from Dexscreener
- Generate chart from DEX candle data
- Fallback: generate synthetic history from current price
- No external chart library required

**Usage**:
```javascript
import SOFChartDEX from '@/components/shared/SOFChartDEX';

<SOFChartDEX timeframe="1h" height={300} showVolume={true} />
```

---

## Apply This Rule To

### ✅ Required Implementations

#### 1. Home Page SOF Price
```javascript
import { useSOFPrice } from '@/hooks/useSOFPrice';

export default function Home() {
  const { sofPrice, change24h } = useSOFPrice();
  return <div>${sofPrice.toFixed(4)}</div>;
}
```

#### 2. Swap Page
```javascript
const { sofPrice, calculateOutput } = useSOFPrice();

// When user enters amount to swap
const outputSOF = calculateOutput(inputAmount, 'USDC', 'SOF');
```

#### 3. Portfolio Valuation
```javascript
const { sofPrice, calculatePortfolio } = useSOFPrice();

// Show total SOF value
const sofValue = calculatePortfolio(sofHolding);
```

#### 4. SolFort Hub SOF Card
```javascript
import { useSOFPrice } from '@/hooks/useSOFPrice';

function SOFCard() {
  const { sofPrice, change24h } = useSOFPrice();
  return (
    <div>
      <h3>SOF</h3>
      <p>${sofPrice.toFixed(4)}</p>
      <p className={change24h > 0 ? 'text-green' : 'text-red'}>
        {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
      </p>
    </div>
  );
}
```

#### 5. SOF Detail/Chart Page
```javascript
import SOFChartDEX from '@/components/shared/SOFChartDEX';
import { useSOFPrice } from '@/hooks/useSOFPrice';

function SOFDetail() {
  const { sofPrice, change24h } = useSOFPrice();
  return (
    <>
      <div>SOF: ${sofPrice.toFixed(4)}</div>
      <SOFChartDEX timeframe="1h" />
    </>
  );
}
```

#### 6. SOF Market Card
```javascript
// If SOF appears in any market card/list
const { sofPrice } = useSOFPrice();

// Always show price from hook, not from MarketDataProvider
```

---

## Integration Checklist

### Before Adding SOF Feature

- [ ] **Does it need SOF price?** → Use `useSOFPrice()` hook
- [ ] **Does it show SOF chart?** → Use `SOFChartDEX` component
- [ ] **Does it swap SOF?** → Use `calculateOutput()` from hook
- [ ] **Does it value SOF?** → Use `calculatePortfolio()` from hook
- [ ] **Does it show SOF in list?** → Do NOT mix with MarketDataProvider

### Never

- [ ] Use TradingView for SOF charts
- [ ] Use `useMarketData()` for SOF price
- [ ] Mix SOF with generic market data
- [ ] Fetch SOF price from any API except Raydium/Dexscreener
- [ ] Show different SOF prices in different places

---

## Sync Guarantee

**All SOF values across the app are synchronized because they share one source:**

```
Home: SOF = $0.0042
↓
Swap Input: Amount of SOF = uses $0.0042 to calculate output
↓
Portfolio: SOF holdings valued at $0.0042
↓
SolFort Hub: SOF card shows $0.0042
↓
All prices update together every 10 seconds
```

**Why?**
- Single `useSOFPrice()` hook with global state
- All consumers subscribe to same data stream
- Price change notifies all components instantly
- No data duplication or stale values

---

## Fallback Strategy

### Primary: Raydium API
```
1. Fetch from Raydium /v2/main/pairs
2. Extract price, change24h, volume, liquidity
3. Return on success
```

### Fallback 1: Dexscreener API
```
If Raydium fails:
1. Fetch from Dexscreener /latest/dex/pairs
2. Extract price, change24h, volume, liquidity
3. Return on success
```

### Fallback 2: Cached Value
```
If both APIs fail:
1. Use last known good price (from memory cache)
2. Show loading indicator to user
3. Retry automatically every 10 seconds
```

### Fallback 3: Synthetic (Last Resort)
```
If no cache available:
1. Return price: 0
2. Log error
3. Show error to user
(Should rarely happen - both DEX APIs very reliable)
```

---

## Testing SOF Data Sources

### Test 1: Service Direct Call
```javascript
import { fetchSOFPrice } from '@/services/SOFPriceService';

const price = await fetchSOFPrice();
console.log('SOF Price:', price.price); // Should be > 0
console.log('Source:', price.source);   // Should be 'raydium' or 'dexscreener'
```

### Test 2: Hook Usage
```javascript
function TestComponent() {
  const { sofPrice, change24h, loading } = useSOFPrice();
  return <div>${sofPrice.toFixed(4)} ({change24h}%)</div>;
}
```

### Test 3: Sync Check
```javascript
// In two different components
const price1 = useSOFPrice();
const price2 = useSOFPrice();

// Both should have exact same sofPrice value
console.assert(price1.sofPrice === price2.sofPrice, 'Prices should match!');
```

### Test 4: Chart Component
```javascript
import SOFChartDEX from '@/components/shared/SOFChartDEX';

<SOFChartDEX timeframe="1h" height={300} />
// Should display DEX price history, no TradingView involved
```

---

## Future Proofing

### Adding New SOF Features

When creating ANY new feature that involves SOF:

1. **Import the hook**:
   ```javascript
   import { useSOFPrice } from '@/hooks/useSOFPrice';
   ```

2. **Use it**:
   ```javascript
   const { sofPrice } = useSOFPrice();
   ```

3. **Never import MarketDataProvider for SOF**:
   ```javascript
   // ❌ Wrong
   const { getLiveAsset } = useMarketData();
   const sofData = getLiveAsset('SOF');
   
   // ✅ Right
   const { sofPrice } = useSOFPrice();
   ```

4. **For charts**: Use `SOFChartDEX`, not TradingView

---

## Permanent Enforcement

### Why This Rule is Permanent

1. **DEX Price is Truth**: SOF's real value comes from DEX pools
2. **Accuracy Critical**: Swap amounts must match portfolio values
3. **User Trust**: Can't show different prices in different places
4. **Business Logic**: Swap math depends on consistent price source
5. **No Aggregators**: SOF is too specialized for generic market data

### Developer Responsibility

When updating SOF features:
- ✅ Always use `useSOFPrice()` hook
- ✅ Never mix with `useMarketData()`
- ✅ Always use `SOFChartDEX` for charts
- ✅ Default to Raydium/Dexscreener APIs
- ✅ Maintain single source of truth

---

## Support & Troubleshooting

### Issue: SOF price showing as 0
```
Check:
1. Are you using useSOFPrice() hook? ✓
2. Is the hook being called (not conditionally)?
3. Are Raydium/Dexscreener APIs accessible?
4. Check browser console for fetch errors
5. Try manual refresh: refresh() function
```

### Issue: SOF prices different in different places
```
Cause: Not using useSOFPrice() hook
Solution:
1. Ensure ALL SOF features use useSOFPrice()
2. Never mix with MarketDataProvider
3. Check for hardcoded prices
4. Verify components are remounting
```

### Issue: SOF chart not loading
```
Check:
1. Using SOFChartDEX component? ✓
2. Is Dexscreener API accessible?
3. Is fallback history generation working?
4. Check network tab for API responses
```

---

## Summary

✅ **SOF is on its own dedicated data path**
- Separate service: `SOFPriceService.js`
- Separate hook: `useSOFPrice()`
- Separate chart: `SOFChartDEX` (no TradingView)
- Single global state (all components sync)

✅ **All SOF features must use this path**
- Home page price
- Swap calculations
- Portfolio valuation
- SolFort Hub card
- SOF detail page
- Any future SOF feature

✅ **Never fallback to generic market data**
- No TradingView for SOF
- No MarketDataProvider for SOF
- No other APIs for SOF price
- Raydium/Dexscreener only

✅ **Permanent rule for all time**
- Code will be maintained
- New features must follow
- Refactors must preserve
- Team must understand

**SOF is special. It deserves its own isolated, reliable, synchronized data system.**