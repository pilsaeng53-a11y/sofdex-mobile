# Real Solana Wallet Integration Guide

## Overview
This document describes the integrated real Solana wallet system for SOFDex trading platform.

---

## Architecture

### 1. **Wallet Connection Layer** (`components/shared/WalletContext`)
- Detects installed Solana wallets: Phantom, Solflare, Backpack
- Manages real wallet connection lifecycle
- Stores connected wallet address and name in sessionStorage
- Provides `useWallet()` hook for global access

**Key exports:**
- `isConnected` - Boolean indicating connection status
- `address` - Real wallet public key
- `shortAddress` - Shortened display format (7xKX...9mN4)
- `walletName` - Connected wallet name (Phantom/Solflare/Backpack)
- `connect(name)` - Initiate connection to wallet
- `disconnect()` - Disconnect wallet
- `requireWallet(callback?)` - Gating function for wallet-required actions

---

### 2. **Real Balance Fetching** (`hooks/useSolanaBalances.js`)
Fetches live SPL token balances directly from Solana mainnet RPC.

**Supported tokens:**
- SOL (native Solana)
- USDC (SPL) - Mint: EPjFWaJgt5XujHYrLmq6TPB3UjCChZ735W5PD7jneperry
- USDT (SPL) - Mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenErt
- SOF (future support)

**Hook signature:**
```js
const { balances, prices, loading, error } = useSolanaBalances(walletAddress);

// balances structure:
{
  SOL: { balance: 5.25, value: 945.00 },
  USDC: { balance: 1000.50, value: 1000.50 },
  USDT: { balance: 500.00, value: 500.00 },
  SOF: { balance: 0, value: 0 }
}
```

**Features:**
- Auto-refresh every 30 seconds
- CoinGecko price feeds
- Fallback error states (no fake data)
- Parallel RPC queries for speed

---

### 3. **Wallet Page** (`pages/Wallet.jsx`)
Premium interface for managing wallet balances, sending, and receiving.

**Tabs:**
1. **Overview** - Real balances from connected wallet
2. **Send** - Transfer tokens across networks (Solana priority)
3. **Receive** - Display wallet address + QR code for deposits
4. **History** - Transaction log (can be populated with real data)

**Connected state:**
- Shows real SOL/USDC/USDT/SOF balances
- Displays balance values in USD
- Manual refresh button
- Balance visibility toggle

**Disconnected state:**
- Shows "Connect Wallet" CTA
- No fake placeholder data
- Clean empty state

---

### 4. **Portfolio Integration** (`pages/Portfolio.jsx`)
Portfolio now reads from connected wallet as single source of truth.

**Features:**
- Total balance calculated from Solana holdings
- Real-time updates linked to wallet connection
- Consistent identity across Wallet ↔ Portfolio
- "Connect wallet to see holdings" when disconnected

---

### 5. **Profile / Account Page** (`pages/Profile.jsx`)
Displays connected wallet info with copy and explorer link.

**Features:**
- Shows wallet address and name
- Solscan.io link to view on-chain data
- Copy address to clipboard
- Disconnect button
- Guest state when not connected

---

### 6. **Balance Display Component** (`components/wallet/BalanceSummary.jsx`)
Reusable component for showing Solana holdings across app.

**Variants:**
- `compact=true` - Minimal card (total balance only)
- `compact=false` - Full breakdown with individual assets

**Usage:**
```jsx
<BalanceSummary compact={false} showRefresh={true} />
```

---

## Data Flow

```
User connects wallet via ConnectWalletModal
         ↓
WalletContext stores address in sessionStorage
         ↓
useSolanaBalances queries RPC with address
         ↓
Fetch SPL token balances + CoinGecko prices
         ↓
Return balances object to UI components
         ↓
Wallet/Portfolio/Profile display real data
```

---

## Fail-Safe Behavior

### Balance Loading Fails:
- Shows loading spinner
- Displays error message (not fake data)
- Retry button available
- App continues functioning

### Wallet Disconnects:
- All pages show "not connected" state
- No balances displayed
- Connect CTA always available
- Session cleared from storage

### RPC Timeout:
- Falls back to secondary endpoint
- Shows "temporary unavailable" message
- Auto-retries after 30s delay

---

## Network Support (Roadmap)

Currently **Solana mainnet** only.

**Future networks** (prepared in structure):
- Ethereum (ERC20 tokens)
- Tron (TRC20 tokens)
- BNB Chain (BEP20 tokens)

Each network will have separate token mint lists and RPC endpoints.

---

## Security Notes

✅ **No private keys stored** - Wallets manage signing
✅ **Real RPC queries** - Direct to Solana mainnet
✅ **No fake data** - Always shows real or error state
✅ **Session-based** - Storage cleared on logout
✅ **CORS protected** - Solana RPC is public endpoint

---

## API References

### useSolanaBalances Hook
```js
import { useSolanaBalances } from '@/hooks/useSolanaBalances';

function MyComponent() {
  const { balances, prices, loading, error } = useSolanaBalances(address);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!balances) return <div>No data</div>;
  
  return (
    <div>
      SOL: {balances.SOL.balance}
      USDC: {balances.USDC.balance}
    </div>
  );
}
```

### useWallet Hook
```js
import { useWallet } from '@/components/shared/WalletContext';

function MyComponent() {
  const { isConnected, address, walletName, requireWallet, disconnect } = useWallet();
  
  const handleAction = () => {
    if (!requireWallet()) return; // Opens modal if not connected
    // User is guaranteed connected here
  };
  
  return <div>{isConnected ? address : 'Not connected'}</div>;
}
```

---

## File Structure

```
src/
├── hooks/
│   └── useSolanaBalances.js          # Balance fetching hook
├── components/
│   └── wallet/
│       └── BalanceSummary.jsx        # Reusable balance component
│   └── shared/
│       ├── WalletContext.jsx         # Connection provider
│       ├── ConnectWalletModal.jsx    # Connection UI
│       └── TickerStrip.jsx           # Price ticker
├── pages/
│   ├── Wallet.jsx                    # Main wallet page
│   ├── Portfolio.jsx                 # Portfolio with real balances
│   ├── Profile.jsx                   # Account settings + wallet info
│   └── WalletConnect.jsx             # Connection status page
└── layout.jsx                        # App layout with header chip
```

---

## Testing Checklist

- [ ] Connect Phantom wallet
- [ ] Check SOL/USDC/USDT balances display correctly
- [ ] Verify balances match on Solscan
- [ ] Toggle balance visibility
- [ ] Send tab shows real available balance
- [ ] Receive tab shows connected address
- [ ] Portfolio total matches wallet holdings
- [ ] Profile shows connected wallet address
- [ ] Copy address button works
- [ ] Solscan link opens explorer
- [ ] Disconnect clears all data
- [ ] App works without connected wallet
- [ ] Network refresh (cmd+r) maintains connection
- [ ] Mobile: all features accessible

---

## Future Enhancements

1. **Transaction history** - Query Solana RPC for user's tx history
2. **Price charts** - Add historical price data per token
3. **Send flow** - Execute real transactions (requires signing)
4. **Streaming updates** - WebSocket for live balance updates
5. **Multi-network** - Ethereum/Tron/BNB Chain support
6. **Token swaps** - DEX integration for token exchanges
7. **Staking** - Solana stake pool integration

---

## Troubleshooting

### "Wallet not detected"
- Ensure browser extension is installed
- Refresh page and try again
- Check extension permissions

### Balances showing 0
- Verify wallet has actual holdings
- Check Solscan to confirm balances on-chain
- Ensure using mainnet (not devnet)

### Slow balance load
- RPC endpoint may be busy
- Auto-refresh happens every 30s
- Manual refresh button available

### Session not persisting
- Check if sessionStorage is enabled
- Check browser console for errors
- Clear browser cache and retry

---

For questions or issues, refer to the Solana documentation:
- https://docs.solana.com/
- https://solscan.io/ (explorer)
- https://phantom.app/ (wallet docs)