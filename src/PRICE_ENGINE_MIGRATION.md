# Price Engine Migration Guide

**Status**: Centralized Price Engine implemented. All components must migrate to use it.

---

## What Changed

**Old (Removed)**:
- Distributed price fetching in components
- Market Cap fallbacks
- Placeholder values and "0" displays
- No synchronization between components

**New (Centralized)**:
- Single `PriceEngine` service (global state)
- Real-time prices from validated sources only
- "No price data" when unavailable (never 0)
- All components sync automatically

---

## How to Update Components

### Before (Old Way)

```jsx
import { CRYPTO_MARKETS } from '@/components/shared/MarketData';

export default function AssetCard({ symbol }) {
  const market = CRYPTO_MARKETS.find(m => m.symbol === symbol);
  const price = market?.price || market?.mcap; // ❌ WRONG: Using Market Cap

  return <div>${price}</div>;
}
```

### After (New Way)

```jsx
import { usePriceEngine } from '@/hooks/usePriceEngine';

export default function AssetCard({ symbol }) {
  const { formattedPrice, error } = usePriceEngine(symbol);

  if (error) return <div>No price data</div>;
  return <div>{formattedPrice}</div>;
}
```

---

## API Reference

### usePriceEngine(symbol)

Get real-time price for a single asset.

```jsx
const { price, change24h, volume24h, error, refresh, formattedPrice } = usePriceEngine('BTC');

// price: 98425.50 (number or null)
// change24h: 2.14 (percentage)
// volume24h: "38.2B" (formatted string)
// error: "No price data" (if unavailable)
// formattedPrice: "$98,425.50" (ready to display)
// refresh(): async function to manually refresh

return (
  <div>
    <p>{formattedPrice}</p>
    <p style={{ color: change24h >= 0 ? 'green' : 'red' }}>
      {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
    </p>
  </div>
);
```

### usePriceEngineMulti(symbols)

Get prices for multiple assets at once.

```jsx
const { prices, refresh } = usePriceEngineMulti(['BTC', 'ETH', 'SOL']);

// prices['BTC'] = { symbol, price, change24h, ... }
// prices['ETH'] = { symbol, price, change24h, ... }
// prices['SOL'] = { symbol, price, change24h, ... }

prices.forEach(symbol => {
  const { formattedPrice } = prices[symbol];
  console.log(`${symbol}: ${formattedPrice}`);
});
```

### usePriceAutoRefresh(symbols, interval)

Auto-refresh prices on an interval (useful for charts).

```jsx
// Auto-refresh BTC and ETH every 10 seconds
usePriceAutoRefresh(['BTC', 'ETH'], 10000);

// Now components using usePriceEngine('BTC') will automatically update
```

### PriceEngine.getPrice(symbol)

Get price from global state (synchronous, no hook).

```jsx
import PriceEngine from '@/services/PriceEngine';

const btcPrice = PriceEngine.getPrice('BTC');
console.log(btcPrice.price); // 98425.50 or null
```

### PriceEngine.updatePrice(symbol)

Manually fetch and update a price.

```jsx
import PriceEngine from '@/services/PriceEngine';

await PriceEngine.updatePrice('PEPE');
```

---

## Components to Update

### Priority 1 (High Traffic)
- [ ] Home.jsx
- [ ] SolFort.jsx
- [ ] Portfolio.jsx
- [ ] Swap.jsx
- [ ] GlobalMarkets.jsx
- [ ] MarketHeatmap.jsx
- [ ] TradingFeed.jsx

### Priority 2 (Medium Traffic)
- [ ] Markets.jsx
- [ ] MarketDetail.jsx
- [ ] TraderProfile.jsx
- [ ] StrategyMarketplace.jsx
- [ ] Portfolio components

### Priority 3 (Low Traffic)
- [ ] All other asset display components

---

## Data Source Mapping

**Crypto** (Binance API):
- BTC, ETH, SOL, BNB, XRP, ADA, DOGE, PEPE, etc.
- Format: `${symbol}USDT`
- Example: BTCUSDT, PEPEUSDT

**SOF** (Dexscreener Pool):
- Pool: `4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS`
- Always uses `useSOFPrice` internally

**TradFi** (Yahoo Finance):
- AAPLx, MSFTx, NVDAx, TSLAx, etc.
- Example: AAPL (Apple stock)

**RWA** (Internal Valuation):
- GOLD-T, SILVER-T, CRUDE-T, SP500-T, etc.
- Values managed in PriceEngine

---

## Error Handling

### Never Do This:
```jsx
❌ const price = market?.price || 0;
❌ const price = market?.mcap; // Market Cap fallback
❌ const price = market?.price || '—';
```

### Do This Instead:
```jsx
✅ const { price, error } = usePriceEngine('BTC');
✅ if (error) return <div>No price data</div>;
✅ return <div>${price}</div>;
```

---

## Testing

```jsx
// Test: Open any asset card
// Expected: Real price displayed, not Market Cap

// Test: Refresh page
// Expected: Price updates automatically from Price Engine

// Test: Disconnect network
// Expected: All assets show "No price data", not 0

// Test: Multiple components showing same asset
// Expected: All show same price (synchronized)
```

---

## Rules

1. **No Market Cap as Price**: Never use market cap as a fallback
2. **No 0 or Placeholders**: Show "No price data" instead
3. **Always Use Hooks**: Use `usePriceEngine` in components, not manual fetches
4. **Single Source**: All prices from PriceEngine, nowhere else
5. **Real-Time Sync**: Components update automatically via subscription

---

## Migration Checklist

- [ ] Replace all `CRYPTO_MARKETS.find()` with `usePriceEngine()`
- [ ] Replace all `getMarketBySymbol()` calls with `usePriceEngine()`
- [ ] Remove Market Cap fallbacks
- [ ] Update error handling (show "No price data")
- [ ] Test auto-refresh behavior
- [ ] Verify all assets display correctly
- [ ] Remove unused market data imports

---

## Implementation Date

**2026-03-17**

Centralized Price Engine now powers all asset prices in the app.