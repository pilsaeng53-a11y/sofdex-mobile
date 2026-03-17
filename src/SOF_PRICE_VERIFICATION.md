# SOF Price Verification Guide

## Quick Test Plan

### Test 1: Initial Load
**What to check**: SOF price visible immediately when page loads

**Steps**:
1. Open app
2. Go to Home dashboard
3. Look at "Hot Assets" card
4. SOF should show price immediately (no "Fetching..." text)

**Expected Result**: `$0.0245` or higher (real live price from Dexscreener)

---

### Test 2: Hot Assets Card
**What to check**: SOF displays real-time price in Hot Assets

**Steps**:
1. Find "Hot Assets" component on Home
2. SOF should be first item
3. Click to expand SOF item

**Expected Result**:
```
SOF        $0.0245    (real price)
Platform Token    +2.50%    (real change)
Live: ● $0.0245              (live indicator + price)
```

**NOT Expected**:
- "Fetching price..."
- "—" (dash symbol)
- Blank price field

---

### Test 3: Swap Page
**What to check**: SOF price works correctly in swap calculation

**Steps**:
1. Open Swap page
2. Select "SOF" in "From" dropdown
3. Select "USDT" in "To" dropdown
4. Enter amount: 100

**Expected Result**:
```
From: 100 SOF
Rate: 1 SOF ≈ 0.0245 USDT  (or current price)
To: 2.45 USDT (or calculated from current price)
```

**NOT Expected**:
- "Price unavailable" error
- Blank "To" amount field
- Rate showing as "—"

---

### Test 4: SOF Chart
**What to check**: SOF chart loads (never blank, never shows TradingView)

**Steps**:
1. Go to page with SOF chart (if exists)
2. Wait for chart to load

**Expected Result**:
- Dexscreener embedded chart loads
- Shows SOF/USD trading pair
- Interactive candlestick chart visible

**NOT Expected**:
- TradingView widget/watermark
- "Loading chart..." indefinitely
- Blank chart area
- "No liquidity data" error

---

### Test 5: API Failure Resilience
**What to check**: Price still shows even if API fails

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Throttle network to "Offline"
4. Reload page
5. Check SOF price display

**Expected Result**:
- SOF price still visible: `$0.0245` (fallback)
- All components still work
- No error messages in UI

**NOT Expected**:
- Blank/missing SOF price
- "Failed to load price" error
- "—" symbol instead of price

---

### Test 6: Price Updates
**What to check**: SOF price updates every 3 seconds

**Steps**:
1. Open DevTools → Console
2. Look for `[SOF Hook] Auto-refresh` messages (every 3s)
3. Observe price changes if market moves
4. Check timestamp updates

**Expected Result**:
- Console shows refresh every ~3 seconds
- Price updates if market price changes
- Timestamp updates in hook data

---

### Test 7: Multi-Page Sync
**What to check**: All pages show same SOF price

**Steps**:
1. Open Home → note SOF price
2. Go to Swap → check SOF price
3. Go to Portfolio → check SOF price
4. All should match (within 3-second refresh window)

**Expected Result**:
- All pages show same price
- Prices synchronized via shared hook
- No inconsistencies

---

### Test 8: Mobile Responsive
**What to check**: SOF price displays correctly on mobile

**Steps**:
1. Open DevTools → Device Emulation (iPhone)
2. Open Home dashboard
3. Check Hot Assets
4. Check Swap page

**Expected Result**:
- Price fully visible (no truncation)
- Numbers not cut off
- Layout responsive

---

### Test 9: API Latency Handling
**What to check**: Slow API doesn't block display

**Steps**:
1. Open DevTools → Network tab
2. Set throttle to "Slow 3G"
3. Reload page
4. Immediately check HOT Assets

**Expected Result**:
- SOF price visible immediately (fallback: $0.0245)
- No loading spinner
- Real price loads in background
- UI stays responsive

---

## Console Logs to Check

### Success Logs
```
[SOF] Dexscreener API fetch succeeded
[SOF Hook] Auto-refresh
[SOF] Using last-known price due to API failure
```

### Warning Logs (OK)
```
[SOF] Retrying fetch...
[SOF Hook] Background fetch failed (using fallback)
[SOF] Auto-refresh failed (cached price still visible)
```

### Error Logs (Should NOT see)
```
Cannot read property 'price' of null
ReferenceError: sofPrice is undefined
TypeError: displayPrice is not a number
```

---

## URL Verification

### Dexscreener Pool
- **Pool Address**: `4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS`
- **API URL**: `https://api.dexscreener.com/latest/dex/pairs/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS`
- **Embed URL**: `https://dexscreener.com/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS?embed=1`

**Test API manually**:
```bash
curl https://api.dexscreener.com/latest/dex/pairs/solana/4EXEQGBHukoZxKadSabQ7tYiABYRiBGpMWtC3edhMZsS
```

Should return:
```json
{
  "pair": {
    "priceUsd": "0.0245",
    "priceChange": {"h24": 2.5},
    "volume": {"h24": 4850000},
    ...
  }
}
```

---

## Debugging Commands

### Check Global SOF Price (DevTools Console)
```javascript
// Check current global state
window.__sofPrice  // (if exposed for debugging)

// Or use hook from any component:
const { sofPrice } = useSOFPrice();
console.log(sofPrice);
```

### Check Service Directly
```javascript
import { fetchSOFPrice } from '@/services/SOFPriceService';
const price = await fetchSOFPrice();
console.log('SOF Price:', price);
```

### Monitor Auto-Refresh
```javascript
// Add to console
setInterval(() => {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] SOF Hook monitoring...`);
}, 3000);
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Shows "Fetching..." | Old hook behavior | Updated `useSOFPrice.js` |
| Shows "—" for price | No fallback values | Initialize global with defaults |
| Shows "No liquidity data" | Chart API error | Use Dexscreener embed fallback |
| TradingView watermark | Generic chart | Use SOFChartDEX only |
| Price null/undefined | Generic token logic | Use `useSOFPrice()` hook only |
| Slow API blocks UI | Sync fetch | Fetch is async, fallback used |

---

## Success Criteria

✅ SOF price visible on load
✅ Price updates every 3 seconds
✅ Mobile responsive
✅ Works offline (fallback)
✅ API slow doesn't block UI
✅ All pages show same price
✅ No "Fetching..." or "—" states
✅ No TradingView integration
✅ Console no errors
✅ Chart loads (Dexscreener embed)

---

## Rollback Plan (If Needed)

If new system has issues, revert these files:
1. `src/hooks/useSOFPrice.js` - revert to previous version
2. `src/components/shared/HotAssets.jsx` - remove SOF-specific logic
3. `src/pages/Swap.jsx` - remove SOF fallback price
4. Delete new components:
   - `src/components/shared/SOFPriceCard.jsx`
   - `src/components/home/SOFTradingAnalytics.jsx`

Old system will work but may show "Fetching..." or "—" during slow API.

---

## Production Checklist

Before going live:

- [ ] All 9 tests above pass
- [ ] Console shows no errors
- [ ] Performance acceptable (API responses < 2s)
- [ ] Mobile devices tested
- [ ] Offline mode tested (fallback works)
- [ ] All pages using `useSOFPrice()` hook
- [ ] No TradingView references in code
- [ ] Dexscreener pool address confirmed (4EXE...)
- [ ] Documentation updated
- [ ] Monitoring setup (if applicable)