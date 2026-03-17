# Display Currency System Guide

## Overview

The Display Currency System allows users to view prices across the entire app in their preferred currency with real-time exchange-rate conversion. The system is **non-invasive** to the app's baseline functionality and keeps "Default" as the safe, native display mode.

## Architecture

### Core Components

1. **CurrencyContext** (`components/shared/CurrencyContext.jsx`)
   - Global state management for display currency selection
   - Exchange rate fetching and caching
   - Persistent storage via localStorage

2. **Currency Utilities** (`lib/currencyUtils.js`)
   - Price formatting with proper currency symbols
   - Conversion logic
   - Support for compact display (B, M, K abbreviations)

3. **Display Currency Selector** (`components/settings/DisplayCurrencySelector.jsx`)
   - Settings UI component for currency selection
   - Integrated into Account page

4. **Custom Hooks**
   - `useCurrency()` - Access currency context
   - `useFormattedPrice()` - Easy price formatting in components

## Supported Currencies

| Currency | Symbol | Format | Decimals |
|----------|--------|--------|----------|
| Default | — | Native | 2-4 |
| USD | $ | $1,234.56 | 2 |
| KRW | ₩ | ₩1,234,567 | 0 |
| JPY | ¥ | ¥123,456 | 0 |
| EUR | € | €1,234.56 | 2 |
| Crypto Native | — | Native | 4 |

## How It Works

### 1. Exchange Rate Fetching

- **Source**: exchangerate-api.com (free tier)
- **Refresh**: Every 5 minutes
- **Fallback**: Default rates if API unavailable
  - USD: 1.0
  - KRW: 1300
  - JPY: 150
  - EUR: 0.92

### 2. Default Mode Behavior

When "Default" is selected:
- No conversion happens
- App displays prices in their original format
- This is the safe baseline mode

### 3. Active Conversion

When a currency is selected (USD, KRW, JPY, EUR, Crypto Native):
- All USD prices are multiplied by the exchange rate
- Proper currency symbols and formatting are applied
- Updated in real-time as prices change

### 4. Persistent Storage

- Currency selection is saved to localStorage
- Persists across sessions
- Defaults to "Default" on first visit

## Implementation Examples

### Basic Usage in Components

```jsx
import { useCurrency } from '@/components/shared/CurrencyContext';
import { formatPrice } from '@/lib/currencyUtils';

function MyComponent() {
  const { displayCurrency, exchangeRates } = useCurrency();
  const price = 100; // USD

  return (
    <div>
      <p>{formatPrice(price, displayCurrency, exchangeRates)}</p>
    </div>
  );
}
```

### Using the Hook

```jsx
import { useFormattedPrice } from '@/hooks/useFormattedPrice';

function PriceDisplay({ usdPrice }) {
  const formatted = useFormattedPrice(usdPrice);
  const compact = useFormattedPrice(usdPrice * 1000000, true);

  return (
    <div>
      <p>Price: {formatted}</p>
      <p>Market Cap: {compact}</p>
    </div>
  );
}
```

## Updated Pages

The following pages have been updated to support display currency conversion:

1. **Account Page** (`pages/Account.jsx`)
   - Portfolio total value
   - Individual asset values
   - Display Currency Selector

2. **Portfolio Page** (`pages/Portfolio.jsx`)
   - Total portfolio value
   - Asset values and percentages
   - Market price references

3. **Wallet Page** (`pages/Wallet.jsx`)
   - Wallet balance tiles
   - Total USD value display

## Adding Currency Support to New Components

To add currency support to any component:

```jsx
import { useCurrency } from '@/components/shared/CurrencyContext';
import { formatPrice } from '@/lib/currencyUtils';

export default function MyPriceComponent({ usdPrice }) {
  const { displayCurrency, exchangeRates } = useCurrency();

  return (
    <p>{formatPrice(usdPrice, displayCurrency, exchangeRates)}</p>
  );
}
```

## Exchange Rate Format

Exchange rates object structure:
```javascript
{
  USD: 1,        // Base currency
  KRW: 1300,     // Korean Won
  JPY: 150,      // Japanese Yen
  EUR: 0.92,     // Euro
}
```

## Formatting Rules

### Price Formatting

```javascript
formatPrice(100, 'USD', rates)    // "$100.00"
formatPrice(100, 'KRW', rates)    // "₩130,000"
formatPrice(100, 'JPY', rates)    // "¥15,000"
formatPrice(100, 'EUR', rates)    // "€92.00"
formatPrice(100, 'Default', rates) // "100.00"
```

### Compact Formatting

```javascript
formatPriceCompact(1500000, 'USD', rates) // "$1.50M"
formatPriceCompact(5000000, 'KRW', rates) // "₩6.50B"
```

## Decimal Precision

- USD: 2 decimals ($1,234.56)
- KRW: 0 decimals (₩1,234,567)
- JPY: 0 decimals (¥123,456)
- EUR: 2 decimals (€1,234.56)
- Crypto Native: 4 decimals

## Error Handling

### API Failure

If exchange rate API fails:
1. Default rates are used as fallback
2. Page continues to function normally
3. Loading indicator shows "Exchange rates updating..."
4. No errors thrown to user

### Invalid Prices

If a price is null, undefined, or NaN:
- Returns "—" (em dash)
- Prevents rendering of invalid values

## Best Practices

1. **Always import useCurrency inside components that use prices**
   ```jsx
   const { displayCurrency, exchangeRates } = useCurrency();
   ```

2. **Use formatPrice for all user-facing prices**
   ```jsx
   // Good
   <p>{formatPrice(value, displayCurrency, exchangeRates)}</p>

   // Avoid
   <p>${value.toFixed(2)}</p>
   ```

3. **Keep Default as the safe baseline**
   - Never force conversion in Default mode
   - Always check if displayCurrency !== 'Default'

4. **Handle loading states**
   ```jsx
   if (ratesLoading) return <p>Loading rates...</p>;
   ```

5. **Don't convert non-price data**
   - Only convert asset prices, not counts or percentages
   - Keep symbols and identifiers unchanged

## Testing

### Test Scenarios

1. **Currency Selection**
   - Select each currency option
   - Verify prices update correctly

2. **Persistence**
   - Select a currency
   - Refresh page
   - Verify currency remains selected

3. **Conversion Accuracy**
   - Manual calculation: Price × Rate
   - Compare with displayed value

4. **Default Behavior**
   - Select "Default"
   - Verify no conversion applied
   - Verify original format shown

5. **Real-Time Updates**
   - Change asset price via market data
   - Verify converted price updates

## Future Enhancements

1. Additional currencies (GBP, AUD, CAD, etc.)
2. User-defined exchange rates
3. Historical rate tracking
4. Offline exchange rate caching
5. Cryptocurrency conversion (BTC, ETH as base)

## Troubleshooting

### Prices not updating

1. Check if displayCurrency is passed correctly
2. Verify exchangeRates object has required keys
3. Check browser console for errors
4. Confirm CurrencyProvider wraps entire app

### Exchange rates not fetching

1. Check network tab for API calls
2. Verify exchangerate-api.com is accessible
3. Check fallback rates are being used
4. Look for CORS issues in browser console

### Inconsistent formatting

1. Verify formatPrice is used everywhere
2. Check CURRENCY_DECIMALS object
3. Ensure exchangeRates object is up-to-date

## API Integration Points

### Exchange Rate API

```
GET https://api.exchangerate-api.com/v4/latest/USD
```

Response:
```json
{
  "rates": {
    "KRW": 1300,
    "JPY": 150,
    "EUR": 0.92,
    "USD": 1
  }
}
```

## LocalStorage Keys

- `displayCurrency` - Selected currency option (Default, USD, KRW, JPY, EUR, Crypto Native)

## Component Tree

```
App
├── CurrencyProvider
│   ├── LanguageProvider
│   ├── UserTypeProvider
│   ├── WalletProvider
│   └── Layout
│       ├── AppMenu
│       ├── TickerStrip
│       ├── BottomNav
│       └── Pages
│           ├── Account (with DisplayCurrencySelector)
│           ├── Portfolio (uses formatPrice)
│           └── Wallet (uses formatPrice)
```

## Summary

The Display Currency System provides:
✅ Non-invasive currency support
✅ Real-time exchange rate conversion
✅ Persistent user preferences
✅ Graceful error handling
✅ Easy-to-use API for component developers
✅ Default mode as safe baseline
✅ Consistent formatting across app