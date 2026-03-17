# SOF Permanent DEX-Based Implementation

**Status**: Complete. SOF is now permanently isolated as a dedicated DEX-based asset.

---

## Single Source of Truth

**Exact Dexscreener Pool Address**: `4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS`

This pool address is the ONLY source for all SOF prices, swaps, valuations, and charts.

---

## Architecture

### 1. **Dedicated Price Service**
- **File**: `src/services/SOFPriceService.js`
- **Function**: `getSOFPriceFromPool()` — fetches live price directly from Dexscreener pool
- **No fallbacks**: Returns error state if pool data unavailable (never 0 or placeholder)
- **Output**: `{ price, change24h, volume24h, liquidity, source, poolAddress, timestamp, error }`

### 2. **Centralized Hook**
- **File**: `src/hooks/useSOFPrice.js`
- **Hook**: `useSOFPrice(autoRefreshInterval = 10000)`
- **Features**:
  - Global state synchronization across all components
  - Auto-refresh every 10 seconds
  - Manual refresh on demand
  - Swap calculation helper: `calculateOutput(inputAmount, inputToken, outputToken)`
  - Portfolio valuation helper: `calculatePortfolio(sofHolding)`
- **Returns**: `{ sofPrice, change24h, volume24h, liquidity, loading, error, refresh, calculateOutput, calculatePortfolio, rawData }`

### 3. **Chart Component**
- **File**: `src/components/shared/SOFChartDEX.jsx`
- **Rule**: NO TradingView for SOF
- **Data**: Fetches OHLCV candles from Dexscreener pool API
- **Fallback**: Shows "No liquidity data" (never 0 or blank without explanation)

### 4. **Chart Price Integration**
- **File**: `src/components/shared/useChartPrice.js`
- **Rule**: SOF branch detects `symbol === 'SOF'` and uses `useSOFPrice()` hook
- **Never uses**: Generic MarketData or TradingView for SOF

### 5. **Swap Integration**
- **File**: `src/pages/Swap.jsx`
- **Rule**: SOF swaps use dedicated hook via `useSOFPrice()`
- **Price extraction**: `const sofPrice = sofData.sofPrice`
- **Swap calculation**: `inputAmount / sofPrice` or `inputAmount * sofPrice`

### 6. **SolFort Hub**
- **File**: `src/pages/SolFort.jsx`
- **Stats displayed**:
  - Token Price: `$${sofPrice.toFixed(...)}`
  - Pool Address: Shortened display
  - Total Supply: 1B SOF
  - 24h Volume: Formatted from `volume24h`
- **Changes**: Import from `@/hooks/useSOFPrice` (not old `useSOFPrice` with formatters)

---

## Global Coverage

### ✅ Pages Using SOF Live Price
- `SolFort.jsx` — Hub stats
- `Swap.jsx` — Swap calculations & rate display
- `GlobalMarkets.jsx` — Implicit (uses Swap component)
- `Portfolio.jsx` — Can use hook for SOF valuations

### ✅ Components Using SOF Live Price
- `SOFChartDEX.jsx` — Chart rendering from DEX pool OHLCV
- `useChartPrice.js` — Returns SOF price from hook
- `WalletGatedButton.jsx` — No price dependency (gating only)
- `Hot Assets` (if SOF shown) — Uses `useChartPrice('SOF')`

### ❌ Old SOF References Removed
- ~~Static placeholder price~~ → Live pool price only
- ~~Generic token symbol matching~~ → Exact pool address only
- ~~TradingView for SOF~~ → DEX pool OHLCV only
- ~~Market cap as price~~ → Real SOF price only

---

## Validation Checklist

- [x] `SOFPriceService.js` uses exact pool address
- [x] `useSOFPrice()` hook exports correct interface
- [x] `useChartPrice()` detects SOF and calls hook
- [x] `Swap.jsx` uses hook for SOF conversions
- [x] `SolFort.jsx` imports from `@/hooks/useSOFPrice`
- [x] `SOFChartDEX.jsx` fetches from exact pool only
- [x] No TradingView in SOF chart logic
- [x] Error states show "No liquidity data" (not 0 or blank)
- [x] Global price synchronization via subscriber system
- [x] Cache TTL = 10 seconds (auto-refresh)

---

## Visual Verification

### SolFort Hub
```
Token Price:   $X.XXXXXX (real live price)
Pool Address:  4EXEQQGB...
Total Supply:  1B SOF
24h Volume:    $X.XXM
```

### Swap Interface
```
From: SOL → To: SOF
Rate: 1 SOL ≈ X.XXX SOF (based on live pool price)
Output: Real conversion, never 0
```

### SOF Chart
```
DEX-based area chart from pool OHLCV
No TradingView symbols, no placeholders
Error: "No liquidity data" if unavailable
```

---

## If Pool Data Fails

**Error Handling**:
1. `getSOFPriceFromPool()` returns `null`
2. `fetchSOFPrice()` returns error object: `{ price: null, error: 'No liquidity data available...' }`
3. Components show:
   - SolFort Hub: `Token Price: "No liquidity data"`
   - Swap: `Price unavailable` (amber warning)
   - Chart: `No liquidity data` (red error)

**Never shows**:
- 0
- Blank/undefined without explanation
- Fallback from unrelated source

---

## Rules (Permanent)

1. **Single Source**: Only `src/services/SOFPriceService.js` fetches SOF price
2. **Only Hook**: Only `src/hooks/useSOFPrice.js` provides SOF price to components
3. **No Generic Logic**: SOF never uses `MarketDataProvider` or generic market feeds
4. **No TradingView**: SOF chart never uses TradingView
5. **Exact Pool**: Always use `4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS`
6. **No Fallbacks**: If pool fails, show error; never show 0 or placeholder
7. **Continuous Sync**: Global subscriber system keeps all components in sync
8. **Real Prices Only**: No market cap, no old cached values, no mint-based lookups

---

## Testing

```javascript
// Test: Open SolFort Hub → Token Price should be real value from pool
// Test: Swap SOL to SOF → Output = inputAmount / (pool price)
// Test: Check SOF chart → DEX candlestick chart, no TV symbols
// Test: Disconnect internet → All SOF UI shows "No liquidity data"
// Test: Multiple components → All show same SOF price (sync check)
```

---

## Implementation Date

**2026-03-17**

All SOF features now use dedicated DEX pool as single source of truth.