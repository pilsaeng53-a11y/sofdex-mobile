# Runtime Debug System — Complete Setup

**Purpose**: Trace exact data sources, component binding, and identify price/icon rendering issues in real-time.

---

## What It Does

### PART 1: Price Source Logging
- **Component**: ChartContainer, OrderPanel, OrderBook
- **Logs**: Exact field name (mark/last/index/marketCap), source object, final value
- **Output**: Console + Debug Panel UI
- **Location**: `lib/debugRuntimeBinding.js` → `logPriceSource()`

### PART 2: Icon Rendering Logging
- **Component**: CoinIcon (global)
- **Logs**: Original symbol, extracted base, icon URL, fallback reason
- **Output**: Console + Debug Panel UI
- **Location**: `lib/debugRuntimeBinding.js` → `logIconRender()`

### PART 3: Component Identification
- **Captures**: Component name, props, render history
- **Logs**: Every critical component render
- **Output**: Console + Debug Panel
- **Location**: `lib/debugRuntimeBinding.js` → `logComponentRender()`

### PART 4: Cache Management
- **Clear**: LocalStorage, React Query, Service Worker caches
- **Verify**: Fresh data load after clear
- **Location**: `lib/debugRuntimeBinding.js` → `clearAllCaches()`

---

## How to Use

### 1. Open Debug Panel (In Development)
- Look for **🔧** button in bottom-right corner of TradingDesk or FuturesTrade
- Click to expand debug panel
- Shows real-time issues count

### 2. Console Commands (Browser DevTools)
```javascript
// Get all collected debug data
window.__DEBUG_TRADING.getData()

// Generate full report with issue counts
window.__DEBUG_TRADING.generateDebugReport()

// Clear all caches and reload data
window.__DEBUG_TRADING.clearAllCaches()

// Log individual price source
window.__DEBUG_TRADING.logPriceSource(
  'ChartContainer', 
  'BTC', 
  tickerObject, 
  'mark', 
  68740.72
)

// Log individual icon
window.__DEBUG_TRADING.logIconRender(
  'CoinIcon [FuturesTrade]',
  'EURUSD-T',
  'EURUSD',
  'https://...',
  null
)
```

### 3. Debug Panel Tabs

#### 📈 Prices Tab
- Lists all price sources collected
- **Red Issues**: Market cap or metadata fields used in trading (WRONG)
- **Green**: Mark prices (CORRECT)
- Shows: Component name, symbol, source type, value

#### 🎨 Icons Tab
- Lists all icon renders
- **Red Issues**: Components using fallback initials
- **Green**: Successfully loaded icons
- Shows: Component name, symbol extraction, URL status

#### ⚙️ Components Tab
- Lists all components that fired logs
- Shows: Component name, prop count
- Helps identify where the issues originate

#### 🛠️ Actions Tab
- **Clear All Caches** button: Removes LocalStorage, React Query, Service Worker caches
- **Generate Report** button: Logs full issue summary to console
- **Console Commands**: Quick reference for manual debugging

---

## What to Look For

### RED FLAGS (Issues Found)

#### ❌ Price Source Issues
```
PRICE SOURCE: MARKET CAP (WRONG)
PRICE SOURCE: METADATA/SUMMARY
```
These indicate hardcoded or metadata prices in trading components.

**Location**: Check console or Debug Panel → Prices tab

**Fix**: Ensure component uses `resolveTradingPrice(ticker)` or `useOrderlyPrice(symbol).markPrice`

#### ❌ Icon Issues
```
⚠️ Fallback used: no_url_from_map
⚠️ Fallback used: generic_fallback
```
These indicate components using text initials instead of real coin icons.

**Location**: Check console or Debug Panel → Icons tab

**Fix**: Ensure component uses `CoinIcon` with correct symbol format

### GREEN FLAGS (Correct)

#### ✅ Price Source
```
PRICE SOURCE: MARK
PRICE SOURCE: LAST
PRICE SOURCE: INDEX
```
These are correct — prices come from Orderly, not market cap.

#### ✅ Icon Source
```
✅ (no fallback message)
🖼️ Icon URL: ✅ LOADED
```
Icon successfully loaded from coin icon service.

---

## Debug Flow

### Initial Load
1. **TradingDesk/FuturesTrade mounts**
2. **ChartContainer initializes** → logs price source
3. **CoinIcon renders** → logs icon load attempt
4. **All data appears in window.__DEBUG_TRADING**

### User Action (e.g., symbol change)
1. **New symbol selected**
2. **Price hook re-runs** → logs new source
3. **Icon extraction recalculates** → logs new icon
4. **Debug panel updates** in real-time

### Cache Clear
1. **User clicks "Clear All Caches"**
2. **LocalStorage, React Query, SW caches cleared**
3. **Components re-fetch fresh data**
4. **All logs reset**
5. **Fresh data sources appear in debug panel**

---

## File Locations

### Debug System Core
- `lib/debugRuntimeBinding.js` — All logging functions
- `components/trade/DebugRuntimePanel.jsx` — UI panel component

### Integration Points
- `components/trade/ChartContainer.jsx` — Price source logs
- `components/shared/CoinIcon.jsx` — Icon render logs
- `pages/TradingDesk.jsx` — Panel render + import
- `pages/FuturesTrade.jsx` — Panel render + import

---

## Expected Output Example

### Console (in development)
```
🔍 [PRICE SOURCE] ChartContainer / BTC
📍 Field: mark
📊 Source Type: MARK
💰 Value: 68740.72
🔑 Available Keys: mark_price, last_price, index_price, ...

🎨 [ICON RENDER] CoinIcon [FuturesTrade] / EURUSD-T
📦 Base Symbol: EURUSD
🖼️  Icon URL: ✅ LOADED
   https://...
```

### Debug Panel UI
```
🔧 RUNTIME DEBUG

Prices (12) | Icons (8) | Components (5) | Actions

Prices Tab:
  Issues: 0 ✅
  ✅ MARK · ChartContainer / BTC: 68740.72
  ✅ MARK · OrderPanel / BTC: 68740.72
  ✅ MARK · OrderBook / BTC: 68740.72

Icons Tab:
  Issues: 0 ✅
  ✅ CoinIcon [FuturesTrade] / EURUSD-T
  ✅ CoinIcon [TradingDesk] / BTC
  ✅ CoinIcon (OrderBook) / BTC
```

---

## Troubleshooting

### Debug Panel Not Appearing
- Ensure `NODE_ENV === 'development'`
- Check browser console for errors
- Verify `DebugRuntimePanel` import in pages

### No Data Collected
- Ensure debug functions are called (check imports)
- Verify `logPriceSource()` in ChartContainer useEffect
- Verify `logIconRender()` in CoinIcon useEffect

### Cache Clear Not Working
- Check browser DevTools → Application → LocalStorage
- Verify Service Worker cache isn't persisting
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)

### Still Seeing Issues
- Take screenshot of Debug Panel
- Export console logs: Right-click console → Save as
- Share with development team

---

## Next Steps

1. **Start the app in development mode**
2. **Navigate to TradingDesk or FuturesTrade**
3. **Click 🔧 button in bottom-right**
4. **Check "Prices" tab for ❌ issues**
5. **Check "Icons" tab for ❌ fallbacks**
6. **If issues found**: Identify component → Check file → Fix source binding
7. **Click "Clear All Caches"** to reload
8. **Verify issues resolved**

---

## For Developers

### Adding Debug Logs to New Components
```javascript
import { logPriceSource, logComponentRender } from '../lib/debugRuntimeBinding';

// In component:
useEffect(() => {
  logPriceSource('MyComponent', symbol, ticker, 'mark', price);
  logComponentRender('MyComponent', { symbol, price });
}, [symbol, price, ticker]);
```

### Checking Issue Status
```javascript
const report = window.__DEBUG_TRADING.generateDebugReport();
console.log(report.badPriceSources); // List of price issues
console.log(report.missingIcons);    // List of icon issues
```

---

**Status**: ✅ Ready for runtime verification  
**Last Updated**: 2026-03-22