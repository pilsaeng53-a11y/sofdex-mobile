# Wallet Gating System - Browse Open, Actions Gated

**Status**: ✅ IMPLEMENTED  
**Date**: 2026-03-17  
**Philosophy**: Keep browsing open, require wallet for actions only

---

## Core Principle

**Browse anything, act only when connected.**

Users can freely explore all informational pages without wallet. Actions requiring account access, trading, investments, or payouts trigger wallet connection modal.

---

## Pages: Browse Without Wallet ✓

These pages remain fully accessible without wallet connection:

### Market Browsing
- ✓ Home
- ✓ Markets
- ✓ Market Detail
- ✓ Market Heatmap
- ✓ News & Announcements
- ✓ Analysis & AI Intelligence
- ✓ Funding Rates
- ✓ Open Interest
- ✓ Liquidation Feed
- ✓ Whale Tracker

### Trading Information
- ✓ Trading Feed (view posts)
- ✓ Discussions
- ✓ Copy Trading Profiles (view only)
- ✓ Strategy Marketplace (browse)
- ✓ Strategy Vault (overview)
- ✓ Strategy Index Funds (overview)
- ✓ Prediction Market (overview)

### Ecosystem Information
- ✓ Launchpad (overview)
- ✓ RWA Market (browse)
- ✓ Real Estate (browse)
- ✓ Leaderboards (view)
- ✓ Governance (view proposals)
- ✓ Institutional (overview)
- ✓ SolFort Hub (browse)
- ✓ Partner Hub (overview)

### Support & Settings
- ✓ Announcements
- ✓ Settings
- ✓ Support / Help

---

## Actions: Require Wallet Connection ✗

These actions trigger wallet connection modal if user not connected:

### Trading & Swaps
- ✗ Place trade (buy/sell)
- ✗ Execute swap
- ✗ Set stop-loss / take-profit
- ✗ Place limit order
- ✗ Liquidate position

### Portfolio & Account
- ✗ View portfolio (personal account data)
- ✗ View wallet page
- ✗ View universal portfolio
- ✗ View account activity / history
- ✗ View transaction details
- ✗ Transfer / send tokens
- ✗ Deposit funds
- ✗ Withdraw funds

### Copy Trading & Strategies
- ✗ Start copy trading
- ✗ Stop copy trading
- ✗ Subscribe to strategy
- ✗ Purchase strategy access
- ✗ Invest in vault
- ✗ Invest in ETF
- ✗ Invest in index fund
- ✗ View my strategy investments

### Earn & Rewards
- ✗ Stake tokens
- ✗ Claim rewards
- ✗ Earn (any form of staking/earning)
- ✗ Participate in yield farming

### Governance & Partnerships
- ✗ Vote on proposals
- ✗ Submit proposal
- ✗ Apply as distributor
- ✗ Access partner hub private data
- ✗ Submit KYC / compliance

---

## Implementation Pattern

### Pattern 1: Simple Action Button

```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

function TradeButton() {
  const { gateAction, isConnected } = useWalletGate();

  const handleBuy = () => {
    gateAction(
      () => executeBuy(), 
      'Connect your wallet to place trades'
    );
  };

  return (
    <button 
      onClick={handleBuy}
      disabled={false}
    >
      Buy
    </button>
  );
}
```

### Pattern 2: Using WalletGatedButton Component

```javascript
import WalletGatedButton from '@/components/shared/WalletGatedButton';

function TradeSection() {
  return (
    <WalletGatedButton
      requiresWallet={true}
      onClick={handleBuy}
      walletMessage="Connect your wallet to place trades"
      className="btn-solana w-full"
    >
      Buy Now
    </WalletGatedButton>
  );
}
```

### Pattern 3: Conditional Rendering

```javascript
function PortfolioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="empty-state">
        <p>Connect your wallet to view your portfolio</p>
        <WalletGatedButton requiresWallet={true} onClick={() => {}}>
          Connect Wallet
        </WalletGatedButton>
      </div>
    );
  }

  return <PortfolioContent />;
}
```

---

## Wallet Connection Modal

When user clicks a gated action while disconnected:

### Modal Display
```
┌─────────────────────────────────────┐
│  Connect Wallet                     │
├─────────────────────────────────────┤
│                                     │
│ Connect your wallet to place        │
│ trades                              │
│                                     │
│ [Phantom] [Solflare] [Backpack]    │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
```

### After Connection
1. Modal closes
2. Wallet state updates
3. Original action executes automatically
4. User completes their task

---

## Empty States for Account Pages

For pages that are ONLY for connected users (Portfolio, Wallet, Activity, etc.):

```javascript
import { useWallet } from '@/components/shared/WalletContext';
import WalletGatedButton from '@/components/shared/WalletGatedButton';

function PortfolioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0f1525] rounded-xl border border-[rgba(148,163,184,0.08)]">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            View Your Portfolio
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Connect your wallet to see your holdings, balances, and portfolio performance.
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

  // Render portfolio content
  return <PortfolioContent />;
}
```

---

## Integration Checklist

### Trading Pages
- [ ] Trade page: Buy/Sell buttons require wallet
- [ ] Swap page: Swap button requires wallet
- [ ] Limit order: Submit button requires wallet
- [ ] Margin trading: All actions require wallet

### Portfolio Pages
- [ ] Portfolio: Show empty state if not connected
- [ ] Wallet page: Show empty state if not connected
- [ ] Universal Portfolio: Show empty state if not connected
- [ ] Activity page: Show empty state if not connected

### Copy Trading
- [ ] Copy Trading list: Can browse without wallet
- [ ] Trader profile: Can view without wallet
- [ ] Start Copy button: Requires wallet
- [ ] Stop Copy button: Requires wallet

### Strategy Pages
- [ ] Marketplace: Browse without wallet
- [ ] Strategy detail: Browse without wallet
- [ ] Subscribe button: Requires wallet
- [ ] My Investments: Show empty state if not connected

### Investment Pages
- [ ] Vault: Browse without wallet
- [ ] Invest button: Requires wallet
- [ ] ETF: Browse without wallet
- [ ] Index Fund: Browse without wallet

### Governance
- [ ] Governance: Browse proposals without wallet
- [ ] Vote button: Requires wallet
- [ ] Submit proposal: Requires wallet

### Partner Hub
- [ ] Overview: Browse without wallet
- [ ] Private account data: Show empty state if not connected
- [ ] Apply: Requires wallet

---

## Code Examples

### Example 1: Trade Page

```javascript
import { useWalletGate } from '@/hooks/useWalletGate';

function TradePage() {
  const { gateAction } = useWalletGate();
  const [amount, setAmount] = useState(0);

  const handleBuy = async () => {
    // Execute trade
    const result = await executeBuy(amount);
    // Handle result
  };

  return (
    <div>
      <h1>Trade SOL</h1>
      <input 
        type="number" 
        value={amount} 
        onChange={e => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button
        onClick={() => gateAction(handleBuy, 'Connect your wallet to place trades')}
      >
        Buy Now
      </button>
    </div>
  );
}
```

### Example 2: Copy Trading

```javascript
function TraderProfilePage({ traderId }) {
  const trader = fetchTraderData(traderId); // Works without wallet
  const { gateAction, isConnected } = useWalletGate();

  const handleStartCopy = async () => {
    // Start copying
    await startCopyTrading(traderId);
  };

  return (
    <div>
      <h1>{trader.name}</h1>
      <p>ROI: {trader.roi}%</p>
      <p>Win Rate: {trader.winRate}%</p>
      
      {isConnected ? (
        <button onClick={handleStartCopy} className="btn-solana">
          Start Copy Trading
        </button>
      ) : (
        <button 
          onClick={() => gateAction(handleStartCopy, 'Connect your wallet to start copy trading')}
          className="btn-solana"
        >
          Start Copy Trading
        </button>
      )}
    </div>
  );
}
```

### Example 3: Strategy Subscribe

```javascript
function StrategyDetailPage({ strategyId }) {
  const strategy = fetchStrategy(strategyId); // Works without wallet
  const { gateAction, isConnected } = useWalletGate();

  const handleSubscribe = async (plan) => {
    // Subscribe to strategy
    await subscribeToStrategy(strategyId, plan);
  };

  return (
    <div>
      <h1>{strategy.name}</h1>
      <p>ROI: {strategy.roi}%</p>
      
      <div className="pricing">
        {strategy.plans.map(plan => (
          <div key={plan.id} className="plan">
            <p>{plan.duration}: ${plan.price}</p>
            <button
              onClick={() => gateAction(
                () => handleSubscribe(plan.id),
                'Connect your wallet to subscribe to this strategy'
              )}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Hook: useWalletGate()

Quick reference for the wallet gating hook.

```javascript
const { gateAction, isConnected, requireWallet } = useWalletGate();

// gateAction(callback, message?) 
// - If wallet connected: executes callback immediately
// - If not connected: shows modal, executes callback after connect

// isConnected (boolean)
// - true if wallet is connected
// - false if wallet is not connected

// requireWallet(callback?)
// - Shows wallet modal
// - Optional callback executes after successful connect
// - Returns: true if already connected, false if modal shown
```

---

## Component: WalletGatedButton

Quick reference for the gated button component.

```javascript
<WalletGatedButton
  requiresWallet={true}           // This action requires wallet
  onClick={handleAction}           // Function to execute
  walletMessage="Custom message"   // Modal message (optional)
  className="btn-solana w-full"   // Styling
  disabled={false}                 // Disable button
>
  Action Text
</WalletGatedButton>
```

---

## Best Practices

### DO ✓

- ✓ Keep informational pages open for browsing
- ✓ Gate actions at button level, not page level
- ✓ Show clear modal when action requires wallet
- ✓ Execute action automatically after wallet connect
- ✓ Show empty state for account-only pages
- ✓ Use descriptive wallet messages ("Connect to place trades")
- ✓ Let users browse before asking for wallet

### DON'T ✗

- ✗ Block entire pages if user not connected
- ✗ Show fake data in account pages (no mock balances)
- ✗ Require wallet refresh/reload after connect
- ✗ Redirect to login page for browsing content
- ✗ Force wallet connection on app load
- ✗ Hide prices/data to unauthenticated users
- ✗ Make users connect wallet to see anything

---

## Testing Checklist

### Browsing Without Wallet
- [ ] Home page loads without wallet
- [ ] Markets page loads without wallet
- [ ] Market detail page loads without wallet
- [ ] Strategy pages load without wallet
- [ ] Trading feed shows posts without wallet
- [ ] Copy trader profiles visible without wallet
- [ ] All informational pages load normally

### Action Gating
- [ ] Buy button shows modal when clicked (not connected)
- [ ] Sell button shows modal when clicked (not connected)
- [ ] Swap button shows modal when clicked (not connected)
- [ ] Subscribe button shows modal (not connected)
- [ ] Copy button shows modal (not connected)
- [ ] All modals show wallet options

### After Connection
- [ ] Buy button executes immediately after connect
- [ ] Action completes without page reload
- [ ] User stays on same page
- [ ] Other buttons now work without modal
- [ ] Disconnect reverts gating behavior

### Empty States
- [ ] Portfolio shows empty state when not connected
- [ ] Wallet page shows empty state when not connected
- [ ] Activity page shows empty state when not connected
- [ ] Connect button on empty state works

---

## Architecture

```
User Click
│
▼
Check: Does action require wallet?
│
├─ No (browsing)
│  └─ Execute normally
│
└─ Yes (action)
   │
   ├─ Wallet connected?
   │  └─ Yes: Execute action
   │
   └─ Not connected?
      ├─ Show modal
      ├─ User connects
      └─ Execute action auto
```

---

## Summary

✅ **Browsing**: All pages remain open without wallet  
✅ **Actions**: All execution requires wallet connection  
✅ **Modal**: Clear prompt on restricted button click  
✅ **Seamless**: Action executes automatically after connect  
✅ **Professional**: No fake data, clean empty states  

Create a wallet-aware experience where users explore freely but execute securely.