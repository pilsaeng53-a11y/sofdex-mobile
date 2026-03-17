# SOFDex Real Wallet System

## Overview
The wallet system is built around a **single source of truth**: the connected Solana wallet address. All wallet data, balances, and portfolio views use this unified identity.

## Architecture

### Core Components

#### 1. **WalletContext** (`components/shared/WalletContext.jsx`)
- Manages wallet connection lifecycle
- Stores connected wallet address, provider name, and connection state
- Handles wallet selection, connection, and disconnection
- Persists session in `sessionStorage`
- **No fake data**: Falls back to `requireWallet()` if not connected

#### 2. **useSolanaBalances Hook** (`hooks/useSolanaBalances.js`)
- Fetches **real** Solana mainnet balances via Solana RPC
- Supports: SOL, USDC (SPL), USDT (SPL), SOF
- Auto-refreshes every 30 seconds
- **Error Handling**: Returns `null` on failure (never fake data)
- **Price Fetching**: Uses CoinGecko API for live prices

#### 3. **useWalletAccount Hook** (`hooks/useWalletAccount.js`)
- Provides unified account context across the app
- Combines wallet identity + balances + prices
- Used by Portfolio and Account pages
- Single source of truth for account data

### Pages Using Real Wallet Data

#### **Wallet Page** (`pages/Wallet.jsx`)
- **Overview Tab**: Shows real SOL/USDC/USDT/SOF balances
- **Send Tab**: Allows token selection with real available balance
- **Receive Tab**: Shows connected wallet address + QR code
- **History Tab**: Displays transaction history

#### **Portfolio Page** (`pages/Portfolio.jsx`)
- Shows portfolio breakdown by asset
- Real-time balance % allocation
- Market prices from CoinGecko
- Network status (Solana active, others coming soon)
- No fake balances ever displayed

#### **Account Page** (`pages/Account.jsx`)
- Shows connected wallet info
- Quick links to Wallet and Portfolio
- Security notices
- Network status

#### **Layout Header** (`layout/index.jsx`)
- Shows connected wallet address (shortened)
- Copy address button
- Disconnect button
- Connected indicator (green dot with glow)

### Data Flow

```
WalletContext (wallet address)
  ↓
useSolanaBalances (fetches real balances + prices)
  ↓
useWalletAccount (unified account context)
  ↓
Portfolio/Wallet/Account Pages (display real data)
```

## Safety Rules

### ✅ DO:
- Use `isConnected` to check wallet state
- Call `requireWallet()` to prompt connection
- Use `useSolanaBalances()` for real balance data
- Handle `null` balances gracefully
- Show retry/error UI on fetch failure
- Hide balances when `showBal = false`

### ❌ DON'T:
- Show fake/placeholder balances
- Use mock data when connected
- Display balances without wallet connection
- Confuse Solana SPL tokens with other networks
- Store or access private keys (handled by wallet provider)

## Error Handling

### Balance Loading Fails
1. `loading = true` → Show spinner
2. `error != null` → Show error message + retry button
3. `balances = null` → Never show fake data
4. User clicks "Retry" → Calls `window.location.reload()`

### Wallet Disconnects
1. `isConnected = false`
2. All balance data clears
3. Pages show "Connect Wallet" CTA
4. No fake data ever shown

## Network Support (Current & Future)

### Active
- **Solana**: Full support with real balance fetching

### Coming Soon
- Ethereum (ERC20)
- Tron (TRC20)
- BNB Chain (BEP20)

Architecture is prepared for multi-network expansion:
- `network` field in account context
- Network selector in Wallet Receive tab
- Future hooks: `useEthereumBalances`, `useTronBalances`, etc.

## Real Balance Fetching

### Solana RPC Calls
```javascript
// Native SOL
getBalance(wallet_address) → lamports → convert to SOL

// SPL Tokens (USDC, USDT, SOF)
getTokenAccountsByOwner(wallet_address, mint_address) → balance
```

### Price Data
```javascript
// CoinGecko API
/api/v3/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd
```

## Security

1. **No Private Key Storage**: All transactions signed locally in user's wallet
2. **No Fake Data**: Real balances only
3. **HTTPS Only**: All API calls use HTTPS
4. **Session Persistence**: Uses secure sessionStorage (cleared on browser close)
5. **No User Data Stored**: Only wallet address is retained locally

## Testing the System

### Test Scenario 1: Connect Wallet
1. Click "Connect Wallet" button
2. Select Phantom/Solflare/Backpack
3. Approve connection
4. Page shows real address + balances
5. Header shows connected indicator

### Test Scenario 2: View Portfolio
1. Connected user navigates to Portfolio
2. See total balance + asset breakdown
3. Balances match Wallet page
4. All values in USD

### Test Scenario 3: Network Failure
1. Disconnect internet
2. Wallet page shows "Unable to Load Balances" error
3. Click "Retry" button
4. No fake balances shown
5. Internet restored → balances reload

### Test Scenario 4: Switch Assets
1. In Wallet Send tab
2. Select different asset (SOL → USDC)
3. Available balance updates in real-time
4. Matches Portfolio page

## File Structure

```
pages/
  ├── Wallet.jsx          # Send/Receive/History tabs
  ├── Portfolio.jsx       # Holdings breakdown
  ├── Account.jsx         # Account settings

components/
  ├── shared/
  │   ├── WalletContext.jsx      # Connection state
  │   ├── ConnectWalletModal.jsx # Modal UI

hooks/
  ├── useSolanaBalances.js  # Real balance fetching
  ├── useWalletAccount.js   # Unified account context

lib/
  └── AuthContext.jsx  # App-level auth
```

## Future Enhancements

1. **Transaction History**: Real on-chain tx history
2. **Multi-Sig Wallets**: Support for Gnosis Safe, etc.
3. **Ledger/Hardware Wallet**: Native support
4. **Token Swaps**: Built-in swap execution
5. **NFT Portfolio**: NFT holdings display
6. **Activity Notifications**: Real-time tx alerts