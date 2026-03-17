# Wallet Gating - Quick Start (5 Minutes)

---

## What's New?

**Before**: Users can't see anything without connecting wallet  
**After**: Users can browse everything, but need wallet to execute actions

---

## The Three Tools

### Tool 1: `useWalletGate()` Hook

```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

const { gateAction } = useWalletGate();

// When button clicked:
<button onClick={() => gateAction(executeAction, 'Connect to trade')}>
  Trade
</button>

// If wallet connected → executeAction() runs immediately
// If not → modal appears → user connects → executeAction() runs automatically
```

### Tool 2: `WalletGatedButton` Component

```javascript
import WalletGatedButton from '@/components/shared/WalletGatedButton';

<WalletGatedButton
  requiresWallet={true}
  onClick={executeAction}
  walletMessage="Connect to trade"
  className="btn-solana"
>
  Trade
</WalletGatedButton>
```

### Tool 3: Empty State (Account Pages Only)

```javascript
import { useWallet } from '@/components/shared/WalletContext';

const { isConnected } = useWallet();

if (!isConnected) {
  return (
    <div className="empty-state">
      <h2>Your Portfolio</h2>
      <p>Connect wallet to view your holdings</p>
      <WalletGatedButton>Connect Wallet</WalletGatedButton>
    </div>
  );
}

return <PortfolioContent />;
```

---

## Three Page Types

### Type A: Browse Page (No Changes)
Markets, News, Strategy List, Trader List  
→ Just works, no gating needed

### Type B: Browse + Action Page
Trade, Swap, Strategy Detail  
→ Gate the action button only

```javascript
const { gateAction } = useWalletGate();

return (
  <div>
    <StrategyInfo />  {/* No gating, visible to all */}
    <button onClick={() => gateAction(subscribe, 'Connect to subscribe')}>
      Subscribe
    </button>
  </div>
);
```

### Type C: Account-Only Page
Portfolio, Wallet, Activity  
→ Show empty state if not connected

```javascript
const { isConnected } = useWallet();

if (!isConnected) {
  return <EmptyState />;
}

return <AccountContent />;
```

---

## 5-Minute Implementation

### Step 1: Pick Your Button (2 min)

```javascript
// OPTION A: Manual with hook
const { gateAction } = useWalletGate();
<button onClick={() => gateAction(handleClick, 'Connect to trade')}>

// OPTION B: Use component
<WalletGatedButton requiresWallet onClick={handleClick}>
```

### Step 2: Add Message (1 min)

```javascript
'Connect your wallet to place trades'
'Connect your wallet to swap tokens'
'Connect your wallet to subscribe'
// Pick one that matches your action
```

### Step 3: Test (2 min)

1. Disconnect wallet (clear session storage)
2. Click button
3. Modal appears → ✓
4. Click Connect
5. Action executes → ✓

---

## Copy-Paste Examples

### Trade Button
```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

<button 
  onClick={() => gateAction(() => executeTrade(), 'Connect to place trades')}
>
  Buy
</button>
```

### Swap Button
```javascript
<button 
  onClick={() => gateAction(() => executeSwap(), 'Connect to swap tokens')}
>
  Swap
</button>
```

### Subscribe Button
```javascript
<button 
  onClick={() => gateAction(() => subscribe(), 'Connect to subscribe')}
>
  Subscribe
</button>
```

### Investment Button
```javascript
<button 
  onClick={() => gateAction(() => invest(), 'Connect to invest')}
>
  Invest Now
</button>
```

### Governance Vote
```javascript
<button 
  onClick={() => gateAction(() => vote(), 'Connect to vote')}
>
  Vote
</button>
```

### Copy Trading
```javascript
<button 
  onClick={() => gateAction(() => startCopy(), 'Connect to copy trade')}
>
  Start Copying
</button>
```

### Claim Rewards
```javascript
<button 
  onClick={() => gateAction(() => claim(), 'Connect to claim rewards')}
>
  Claim
</button>
```

---

## For Account Pages

```javascript
import { useWallet } from '@/components/shared/WalletContext';

function PortfolioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h2>Your Portfolio</h2>
          <p>Connect wallet to view your holdings</p>
          <WalletGatedButton>Connect</WalletGatedButton>
        </div>
      </div>
    );
  }

  return <Portfolio />;
}
```

---

## Common Messages

Use these pre-written messages:

```
'Connect your wallet to place trades'
'Connect your wallet to execute this trade'
'Connect your wallet to swap tokens'
'Connect your wallet to start copy trading'
'Connect your wallet to subscribe to this strategy'
'Connect your wallet to invest in this vault'
'Connect your wallet to vote on proposals'
'Connect your wallet to claim rewards'
'Connect your wallet to stake tokens'
'Connect your wallet to view your portfolio'
'Connect your wallet to view your account activity'
```

---

## What NOT to Do

```javascript
// ❌ Don't block entire page
if (!isConnected) return <Modal />;

// ❌ Don't show fake data
<Balance>{isConnected ? real : fake}</Balance>

// ❌ Don't redirect
if (!isConnected) navigate('/login');

// ❌ Don't use TradingView after we implemented SOFChartDEX
<TradingView /> // For SOF only!
```

---

## Questions?

**Q: Will this break anything?**  
A: No. It's pure frontend UI changes. No API or database changes.

**Q: What if user is already connected?**  
A: No modal appears, action executes immediately.

**Q: Can users still browse without wallet?**  
A: Yes! Entire app browseable. Only actions require wallet.

**Q: Does this affect mobile?**  
A: No. Works identically on mobile and desktop.

---

## Files Reference

- `src/hooks/useWalletGate.js` - The main hook
- `src/components/shared/WalletGatedButton.jsx` - Ready-made button
- `src/components/shared/WalletContext.jsx` - Existing wallet state
- `WALLET_GATING_SYSTEM.md` - Full documentation
- `WALLET_GATING_IMPLEMENTATION_GUIDE.md` - Detailed guide

---

## Deploy Order

1. Trade page (highest priority)
2. Swap page
3. Portfolio page
4. Everything else

Test each one before moving to next.

---

## That's It!

You now have everything to add wallet gating to any page in 5 minutes.

**Pick a button. Add gateAction(). Done.**