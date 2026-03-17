# Wallet Gating Implementation Guide

**Quick Start**: Apply wallet gating to your pages in 3 minutes

---

## Three Approaches (Pick One)

### Approach 1: Hook + useCallback (Recommended)

```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

function MyPage() {
  const { gateAction } = useWalletGate();

  const handleAction = async () => {
    // Your action code
  };

  return (
    <button onClick={() => gateAction(handleAction, 'Custom message')}>
      Click Me
    </button>
  );
}
```

### Approach 2: WalletGatedButton Component

```javascript
import WalletGatedButton from '@/components/shared/WalletGatedButton';

function MyPage() {
  const handleAction = () => { /* action */ };

  return (
    <WalletGatedButton
      requiresWallet={true}
      onClick={handleAction}
      walletMessage="Connect to do this"
      className="btn-solana"
    >
      Click Me
    </WalletGatedButton>
  );
}
```

### Approach 3: Conditional Rendering for Account Pages

```javascript
import { useWallet } from '@/components/shared/WalletContext';

function MyPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <EmptyState />;
  }

  return <PageContent />;
}
```

---

## Common Patterns

### Pattern A: Action Button

```javascript
const { gateAction } = useWalletGate();

<button onClick={() => gateAction(executeTrade, 'Connect to trade')}>
  Trade
</button>
```

### Pattern B: Multiple Actions

```javascript
const { gateAction } = useWalletGate();

<div>
  <button onClick={() => gateAction(() => buy(), 'Connect to buy')}>
    Buy
  </button>
  <button onClick={() => gateAction(() => sell(), 'Connect to sell')}>
    Sell
  </button>
</div>
```

### Pattern C: Conditional Features

```javascript
const { isConnected, gateAction } = useWalletGate();

{isConnected ? (
  <PortfolioContent />
) : (
  <button onClick={() => gateAction(() => {})}>
    View Portfolio
  </button>
)}
```

### Pattern D: Form Submission

```javascript
const { gateAction } = useWalletGate();

const handleSubmit = (e) => {
  e.preventDefault();
  gateAction(async () => {
    await submitForm(formData);
  }, 'Connect to submit');
};

<form onSubmit={handleSubmit}>
  {/* fields */}
  <button type="submit">Submit</button>
</form>
```

---

## Page-by-Page Checklist

### Trade Page
```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

function TradePage() {
  const { gateAction } = useWalletGate();

  return (
    <div>
      <h1>Trade</h1>
      <TradeForm 
        onSubmit={(data) => gateAction(
          () => executeTrade(data),
          'Connect your wallet to place trades'
        )}
      />
    </div>
  );
}
```

### Swap Page
```javascript
function SwapPage() {
  const { gateAction } = useWalletGate();

  return (
    <button onClick={() => gateAction(
      () => executeSwap(),
      'Connect your wallet to swap tokens'
    )}>
      Swap
    </button>
  );
}
```

### Portfolio Page
```javascript
import { useWallet } from '@/components/shared/WalletContext';

function PortfolioPage() {
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
}
```

### Copy Trading
```javascript
function TraderProfile({ traderId }) {
  const { gateAction } = useWalletGate();

  return (
    <div>
      <TraderInfo traderId={traderId} />
      <button onClick={() => gateAction(
        () => startCopy(traderId),
        'Connect wallet to copy trade'
      )}>
        Start Copy Trading
      </button>
    </div>
  );
}
```

### Strategy Subscribe
```javascript
function StrategyDetail({ strategyId }) {
  const { gateAction } = useWalletGate();

  return (
    <div>
      <StrategyInfo strategyId={strategyId} />
      <button onClick={() => gateAction(
        () => subscribeStrategy(strategyId),
        'Connect wallet to subscribe'
      )}>
        Subscribe
      </button>
    </div>
  );
}
```

### Vault/ETF Invest
```javascript
function VaultPage({ vaultId }) {
  const { gateAction } = useWalletGate();

  return (
    <button onClick={() => gateAction(
      () => investVault(vaultId),
      'Connect wallet to invest'
    )}>
      Invest Now
    </button>
  );
}
```

### Governance Vote
```javascript
function GovernancePage() {
  const { gateAction } = useWalletGate();

  return (
    <button onClick={() => gateAction(
      () => voteProposal(proposalId),
      'Connect wallet to vote'
    )}>
      Vote
    </button>
  );
}
```

---

## Messages by Feature

Use action-specific messages to guide users:

```javascript
// Trading
'Connect your wallet to place trades'
'Connect your wallet to execute this trade'
'Connect your wallet to set take-profit'

// Swaps
'Connect your wallet to swap tokens'
'Connect your wallet to perform this swap'

// Copy Trading
'Connect your wallet to start copy trading'
'Connect your wallet to stop copying'

// Strategy
'Connect your wallet to subscribe to this strategy'
'Connect your wallet to view strategy details'

// Investing
'Connect your wallet to invest in this vault'
'Connect your wallet to invest in this ETF'
'Connect your wallet to participate in this fund'

// Earning
'Connect your wallet to stake tokens'
'Connect your wallet to claim rewards'
'Connect your wallet to participate in yield farming'

// Governance
'Connect your wallet to vote on proposals'
'Connect your wallet to submit proposals'

// Account
'Connect your wallet to view your portfolio'
'Connect your wallet to view your account activity'
'Connect your wallet to access this feature'
```

---

## Empty State Template

For account-only pages:

```javascript
function EmptyState({ title, message }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0f1525]">
      <div className="text-center max-w-md px-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-3">
          {title}
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          {message}
        </p>
        <WalletGatedButton
          requiresWallet={true}
          onClick={() => {}}
          className="btn-solana w-full"
        >
          Connect Wallet
        </WalletGatedButton>
      </div>
    </div>
  );
}

// Usage
if (!isConnected) {
  return (
    <EmptyState
      title="Your Portfolio"
      message="Connect your wallet to view your holdings and balances"
    />
  );
}
```

---

## Testing Your Integration

### Test 1: Browse Without Wallet
```
1. Clear session storage (wallet state)
2. Open your page
3. Verify page loads normally
4. Verify content is readable
```

### Test 2: Click Gated Action
```
1. While disconnected
2. Click the action button
3. Verify modal appears
4. Verify action message is clear
```

### Test 3: Connect and Execute
```
1. From modal, click Connect
2. Select wallet (or mock connect)
3. Verify modal closes
4. Verify action executes
5. Verify no page reload
```

### Test 4: Already Connected
```
1. Connect wallet first
2. Click action button
3. Verify action executes immediately
4. Verify no modal appears
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Blocking entire page

```javascript
function MyPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <ConnectWalletPrompt />;
  }

  // Page never shows if disconnected
  return <PageContent />;
}
```

### ✅ RIGHT: Blocking action only

```javascript
function MyPage() {
  const { gateAction } = useWalletGate();

  return (
    <div>
      <PageContent />
      <button onClick={() => gateAction(doAction)}>
        Execute Action
      </button>
    </div>
  );
}
```

### ❌ WRONG: Showing fake data

```javascript
function PortfolioPage() {
  const { isConnected } = useWallet();

  return (
    <div>
      <div>Balance: ${isConnected ? realBalance : 0}</div>
      <div>Holdings: {isConnected ? realHoldings : 'N/A'}</div>
    </div>
  );
}
```

### ✅ RIGHT: Empty state for account pages

```javascript
function PortfolioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <EmptyState />;
  }

  return <RealPortfolioContent />;
}
```

---

## Migration: Old to New

### Before (Page-Level Gate)
```javascript
function TradePage() {
  const { requireWallet } = useWallet();

  useEffect(() => {
    if (!requireWallet()) {
      // Blocked entire page
    }
  }, []);
}
```

### After (Action-Level Gate)
```javascript
function TradePage() {
  const { gateAction } = useWalletGate();

  return (
    <button onClick={() => gateAction(executeTrade)}>
      Trade
    </button>
  );
}
```

---

## Troubleshooting

### Issue: Modal doesn't appear when button clicked
**Check:**
- [ ] Is `gateAction` called correctly?
- [ ] Is callback parameter a function?
- [ ] Is wallet context provider in layout?

### Issue: Action doesn't execute after connecting
**Check:**
- [ ] Is callback passed to `gateAction`?
- [ ] Does callback complete without errors?
- [ ] Is wallet state updating after connect?

### Issue: Page reloads after wallet connect
**Check:**
- [ ] Is form submission preventing default?
- [ ] Is callback navigating somewhere?
- [ ] Is page in suspended state?

### Issue: Modal message not showing
**Check:**
- [ ] Is message passed as second param?
- [ ] Is message a string?
- [ ] Is modal component expecting this prop?

---

## Files Reference

- `src/hooks/useWalletGate.js` - Main hook
- `src/components/shared/WalletGatedButton.jsx` - Button component
- `src/components/shared/WalletContext.jsx` - Wallet state (existing)

---

## Minimal Example

Simplest possible implementation:

```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

function SimpleAction() {
  const { gateAction } = useWalletGate();

  return (
    <button onClick={() => gateAction(() => alert('Action executed!'))}>
      Click Me
    </button>
  );
}
```

That's it! When user clicks:
- If wallet connected: alert shows immediately
- If not connected: modal appears, user connects, alert shows after

---

**Ready to integrate? Pick an approach above and start with one page.**