# SOF Data Source - Quick Reference

**TL;DR**: All SOF features must use `useSOFPrice()` hook. Never use TradingView or generic market data for SOF.

---

## One-Minute Guides

### Show SOF Price
```javascript
import { useSOFPrice } from '@/hooks/useSOFPrice';

export default function MySofFeature() {
  const { sofPrice } = useSOFPrice();
  return <div>${sofPrice.toFixed(4)}</div>;
}
```

### Calculate Swap Output
```javascript
const { calculateOutput } = useSOFPrice();

const outputSOF = calculateOutput(100, 'USDC', 'SOF');
```

### Show SOF Portfolio Value
```javascript
const { calculatePortfolio } = useSOFPrice();

const sofValue = calculatePortfolio(sofHolding);
```

### Display SOF Chart
```javascript
import SOFChartDEX from '@/components/shared/SOFChartDEX';

<SOFChartDEX timeframe="1h" height={300} showVolume={true} />
```

### Manual Refresh
```javascript
const { refresh } = useSOFPrice();

await refresh(); // Fetch latest price
```

---

## Hook Return Values

```javascript
const {
  sofPrice,           // number: Current price in USD
  change24h,          // number: 24h change percentage
  volume24h,          // number: 24h volume in USD
  liquidity,          // number: Pool liquidity in USD
  source,             // string: 'raydium' | 'dexscreener'
  loading,            // boolean: Fetching in progress
  error,              // string: Error message if any
  refresh,            // function: Manual refresh
  calculateOutput,    // function: Swap calculation
  calculatePortfolio, // function: Valuation helper
  rawData,            // object: Full price data
} = useSOFPrice();
```

---

## Service Functions

**Direct service calls** (rarely needed):

```javascript
import { 
  fetchSOFPrice,           // Get current price
  getSOFPriceFromRaydium,  // Raydium only
  getSOFPriceFromDexscreener, // Dexscreener only
  calculateSwapOutput,     // Math helper
  calculateSOFPortfolioValue, // Valuation helper
  SOF_DATA_SOURCE          // Constant info
} from '@/services/SOFPriceService';

const price = await fetchSOFPrice();
```

---

## The Rule

| Feature | ✅ Use | ❌ Don't Use |
|---------|--------|------------|
| SOF Price | `useSOFPrice()` | `useMarketData()` |
| SOF Swap | `calculateOutput()` | Market feed |
| SOF Chart | `SOFChartDEX` | TradingView |
| SOF Value | `calculatePortfolio()` | Manual calc |
| SOF Refresh | `refresh()` | Manual fetch |

---

## Common Patterns

### Pattern 1: Display with Auto-Refresh
```javascript
const { sofPrice, change24h } = useSOFPrice(10000); // Refresh every 10s
return (
  <div>
    <p>${sofPrice.toFixed(4)}</p>
    <p>{change24h > 0 ? '📈' : '📉'} {change24h.toFixed(2)}%</p>
  </div>
);
```

### Pattern 2: Swap Calculator
```javascript
const [amount, setAmount] = useState(100);
const { sofPrice } = useSOFPrice();

const output = sofPrice > 0 ? amount / sofPrice : 0;
return (
  <div>
    <input value={amount} onChange={e => setAmount(+e.target.value)} />
    <p>You get: {output.toFixed(4)} SOF</p>
  </div>
);
```

### Pattern 3: Portfolio Dashboard
```javascript
const { calculatePortfolio } = useSOFPrice();
const sofValue = calculatePortfolio(userSOFHolding);

return <p>SOF Holdings Worth: ${sofValue.toFixed(2)}</p>;
```

### Pattern 4: Disable on Error
```javascript
const { sofPrice, loading, error } = useSOFPrice();

if (error) return <p>Unable to load SOF price</p>;
if (loading) return <p>Loading...</p>;

return <p>${sofPrice.toFixed(4)}</p>;
```

---

## Files Map

```
src/
├── services/
│   └── SOFPriceService.js          ← Core service (DEX fetch)
├── hooks/
│   └── useSOFPrice.js              ← React hook (shared state)
└── components/shared/
    └── SOFChartDEX.jsx             ← Chart component (no TradingView)
```

---

## What NOT to Do

❌ **Never do this:**

```javascript
// ❌ Don't use MarketDataProvider for SOF
const { getLiveAsset } = useMarketData();
const sof = getLiveAsset('SOF'); // Wrong!

// ❌ Don't hardcode SOF price
const sofPrice = 0.0042; // Wrong!

// ❌ Don't use TradingView for SOF
<TradingView symbol="SOFUSDT" /> // Wrong!

// ❌ Don't fetch from other APIs
fetch('https://coingecko.com/api/v3/coins/solana'); // Wrong!

// ❌ Don't mix sources
const price1 = useMarketData().getLiveAsset('SOF');
const price2 = useSOFPrice();
// Now you have two different values!
```

✅ **Always do this:**

```javascript
// ✅ Use useSOFPrice() hook
const { sofPrice } = useSOFPrice();

// ✅ Calculate with hook's calculateOutput()
const output = sofPrice > 0 ? amount / sofPrice : 0;

// ✅ Use SOFChartDEX for charts
<SOFChartDEX timeframe="1h" />

// ✅ Valuation with hook helper
const sofValue = calculatePortfolio(holding);
```

---

## Auto-Refresh Behavior

By default, `useSOFPrice()` auto-refreshes every 10 seconds:

```javascript
const { sofPrice } = useSOFPrice();
// Price updates automatically every 10s

// Or disable auto-refresh
const { sofPrice } = useSOFPrice(0);
// No auto-refresh

// Or custom interval
const { sofPrice } = useSOFPrice(5000);
// Refresh every 5 seconds
```

---

## Sync Guarantee

All components using `useSOFPrice()` see the same price:

```javascript
function Component1() {
  const { sofPrice } = useSOFPrice();
  // sofPrice = $0.0042
}

function Component2() {
  const { sofPrice } = useSOFPrice();
  // sofPrice = $0.0042 (same!)
}

// Update one:
// Both update instantly!
```

---

## Error Handling

```javascript
const { sofPrice, error, loading, refresh } = useSOFPrice();

if (loading) {
  return <Spinner />;
}

if (error) {
  return (
    <div>
      <p>Error loading price: {error}</p>
      <button onClick={refresh}>Retry</button>
    </div>
  );
}

return <div>${sofPrice.toFixed(4)}</div>;
```

---

## Performance Tips

- ✅ Call `useSOFPrice()` once per component (at top level)
- ✅ Use the returned values directly
- ✅ Let auto-refresh handle updates
- ❌ Don't call hook conditionally
- ❌ Don't create multiple hook instances for same feature

---

## Migration Guide

**If your component currently uses `useMarketData()` for SOF:**

```javascript
// Before (wrong)
const { getLiveAsset } = useMarketData();
const sof = getLiveAsset('SOF');

// After (right)
const { sofPrice } = useSOFPrice();
```

**If your component fetches SOF price manually:**

```javascript
// Before (wrong)
const [price, setPrice] = useState(0);
useEffect(() => {
  fetch('/api/sof-price').then(r => setPrice(r.price));
}, []);

// After (right)
const { sofPrice } = useSOFPrice();
```

---

## Checklist for SOF Features

- [ ] Uses `useSOFPrice()` hook?
- [ ] Does NOT use `useMarketData()` for SOF?
- [ ] Chart uses `SOFChartDEX` (not TradingView)?
- [ ] Shows loading state?
- [ ] Shows error state?
- [ ] Prices stay synchronized?
- [ ] No hardcoded prices?

---

**Reference**: See `SOF_DEDICATED_DATA_RULE.md` for full specification.