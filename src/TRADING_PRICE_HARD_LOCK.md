# Trading Price Hard Lock — Critical Data Source Rule

**Status**: ✅ ENFORCED  
**Date**: 2026-03-22  
**Severity**: CRITICAL

---

## Overview

All trading prices are now **hard-locked** to Orderly market data exclusively.

**Market cap, token metadata, and fallback prices are completely blocked.**

---

## The Hard Lock

### Source Priority (ENFORCED)
1. **Mark Price** — Orderly live mark price
2. **Last Price** — 24h close / last trade
3. **Index Price** — Reference price
4. **DEAD END** — No fallback to metadata

### Components Protected
- ✅ Chart header price
- ✅ Chart current price label  
- ✅ Chart OHLC data
- ✅ Chart price axis
- ✅ Order panel price display
- ✅ Market order price
- ✅ Liquidation calculations
- ✅ Position mark price
- ✅ OrderBook center price

---

## Implementation

### Single Resolver Function
```javascript
// services/tradingPriceResolver.js
export function resolveTradingPrice(ticker) {
  if (ticker?.mark_price > 0) return { price: ticker.mark_price, source: 'mark' };
  if (ticker?.last_price > 0) return { price: ticker.last_price, source: 'last' };
  if (ticker?.index_price > 0) return { price: ticker.index_price, source: 'index' };
  // NO FALLBACK — returns null
  return { price: null, source: null };
}
```

### Applied Everywhere
- **ChartContainer**: Uses `resolveTradingPrice()` for all price displays
- **OrderPanel**: Receives `asset.price` (marked as MARK-only in TradingDesk)
- **OrderBook**: Uses `resolveTradingPrice()` for mid-price calculation
- **LiquidationCalculator**: Uses trading price for risk calculations

---

## What's Blocked

### ❌ NEVER Used
- Market cap (`marketCap`)
- Token metadata price (`price_usd`, `current_price`)
- Coin info values
- Fallback metadata prices
- Historical pricing
- External API pricing (CoinGecko, Binance for trading)

### 🔒 LOCKED (Will Override)
Any component still trying to use metadata will be force-overridden by `hardLockTradingPrice(rawValue, ticker)`.

---

## Debug Indicators

### Price Source Badge (UI)
Located on ChartContainer toolbar:
- 📊 MARK — Using Orderly mark price (✅ correct)
- 📈 LAST — Using last price (✅ fallback)
- 📉 INDEX — Using index price (✅ fallback)
- ❌ NO DATA — No price available (⚠️ critical)

### Console Logs
```javascript
[PRICE RESOLVER] BTC {
  source: 'mark',
  price: 68740.72,
  mark: 68740.72,
  last: undefined,
  index: undefined,
  hasValidPrice: true
}
```

---

## Verification Checklist

- [x] Chart uses `resolveTradingPrice(ticker)`
- [x] OrderPanel receives mark price only
- [x] OrderBook uses `resolveTradingPrice()`
- [x] No metadata fallbacks anywhere
- [x] Debug badge visible on chart
- [x] Console logs price source
- [x] All components log their source
- [x] Hard lock overrides in place

---

## If Issues Arise

### ❌ Chart shows metadata price
- Check: ChartContainer imports `resolveTradingPrice` not `resolvePrice`
- Check: Price is from `useTicker()` not from CoinGecko
- Fix: Verify `const { price } = resolveTradingPrice(ticker)`

### ❌ OrderPanel shows stale price
- Check: `asset.price` is from `useOrderlyPrice(symbol).markPrice`
- Check: Not from market cap or metadata
- Fix: TradingDesk must inject `useOrderlyPrice(symbol).markPrice` as `asset.price`

### ❌ OrderBook center price is wrong
- Check: `resolveTradingPrice(ticker)` returns valid price
- Check: Ticker has `mark_price`, `last_price`, or `index_price`
- Fix: Verify ticker object structure from hook

### ❌ Liquidation calculation is off
- Check: Entry price uses trading resolver
- Check: Current price uses trading resolver
- Check: No metadata prices in calculation
- Fix: `useOrderForm` must use trading price for all calculations

---

## Code Locations

| Component | File | Price Source |
|-----------|------|------|
| Chart | `components/trade/ChartContainer.jsx` | `resolveTradingPrice(ticker)` |
| OrderPanel | `components/trade/OrderPanel.jsx` | `asset.price` (from TradingDesk) |
| OrderBook | `components/trade/OrderBook.jsx` | `resolveTradingPrice(ticker)` |
| Liquidation | `lib/trading/orderCalc.js` | `markPrice` parameter |
| Orders | `hooks/useOrderForm.js` | `markPrice` prop |

---

## Testing

### Manual Verification
1. Open TradingDesk
2. Check chart header — should show price source badge
3. Click OrderBook price — should use MARK/LAST/INDEX
4. Check browser console — should log price source
5. Change symbol — price should update from Orderly only

### Expected Console Output
```
[PRICE RESOLVER] BTC {
  source: 'mark',
  price: 68740.72
}
[PRICE RESOLVER] ETH {
  source: 'mark',
  price: 3542.18
}
```

---

## Emergency Override

If any component is still using metadata:

```javascript
import { hardLockTradingPrice } from '../../services/tradingPriceResolver';

// Force override any raw price value
const { price, source } = hardLockTradingPrice(anyValue, ticker);
// Will return null if ticker is invalid (NO FALLBACK)
```

---

## Status

✅ **HARD LOCKED**
- All trading prices now come exclusively from Orderly
- No metadata, market cap, or fallback prices
- Debug badges and logs in place
- Ready for production

---

**Last Updated**: 2026-03-22  
**Enforced By**: Trading Price Resolver  
**Violation Response**: Hard override or null (no fallback)