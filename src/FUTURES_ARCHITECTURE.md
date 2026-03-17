# SolFort Futures - Architecture Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOLFORT HOME                               │
│                    (Global Dashboard)                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                         Open Menu
                              ↓
         ┌────────────────────────────────────────┐
         │      FUTURES (New Section)             │
         ├────────────────────────────────────────┤
         │  • Futures Dashboard                   │
         │  • Futures Trade                       │
         │  • Futures Market Watch                │
         │  • Futures Positions                   │
         └────────────────────────────────────────┘
                        ↙  ↓  ↘
                    /    |    \
        Dashboard  /     |     \  Trade
            ↓      /      |      \  ↓
      ┌────────────┐  ┌────────────┐  ┌────────────────────┐
      │  Overview  │  │  Account   │  │   MT5 Interface    │
      │  & Promos  │  │   Types    │  │                    │
      │            │  │  Standard  │  │ Left: Market Watch │
      │ • Hot Instr│  │  Pro       │  │ Center: Chart      │
      │ • Bonuses  │  │  Raw       │  │ Right: Order Panel │
      │ • Account  │  │            │  │ Bottom: Positions  │
      │   Comparison   │            │  │                    │
      └────────────┘  └────────────┘  └────────────────────┘
             ↓               ↓                    ↓
          Dashboard      Selection         Order Execution
                              ↓
                    ┌──────────────────┐
                    │  Trading Account │
                    │   CRUD Created   │
                    └──────────────────┘
                              ↓
           ┌──────────────────────────────────────┐
           │    Partner & Referral Systems        │
           ├──────────────────────────────────────┤
           │                                      │
           │  Sales Partner (Approval)            │
           │  └─ Application Form                 │
           │  └─ Manual Review (3-5 days)        │
           │  └─ Commission: 25-30% Volume       │
           │  └─ Tools, Support, Marketing       │
           │                                      │
           │  Referral (Instant)                  │
           │  └─ Link-Based (@username)          │
           │  └─ No Approval                     │
           │  └─ Commission: 25-30% Tiered      │
           │  └─ Weekly Payouts                  │
           │                                      │
           └──────────────────────────────────────┘
```

## Application Flow

### Dashboard → Trade

```
FuturesDashboard
  ↓
[Quick Actions Grid]
  ├─ Trade → FuturesTrade
  ├─ Account Types → FuturesAccountTypes
  ├─ Sales Partner → FuturesSalesPartner
  └─ Referral → FuturesReferral
```

### Trade Execution Flow

```
FuturesTrade (MT5 Interface)
  │
  ├─ Market Watch (Left Panel)
  │   ├─ Select Asset
  │   └─ Update Chart
  │
  ├─ Chart (Center)
  │   ├─ Display Price
  │   └─ Technical Analysis (TradingView)
  │
  ├─ Order Panel (Right)
  │   ├─ Set Direction (Buy/Sell)
  │   ├─ Enter Volume (0.01 - ∞)
  │   ├─ Set Leverage (1 - 100)
  │   ├─ Optional SL/TP
  │   └─ Submit Order
  │
  └─ Positions (Bottom)
      ├─ Live PnL Calculation
      ├─ Margin Usage
      └─ Close/Modify Position
```

## Database Schema

```
┌──────────────────────────────────────────────────────────┐
│                   FUTURES MODULE                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐      ┌──────────────────┐           │
│  │ TradingAccount │      │ TradingPosition  │           │
│  ├────────────────┤      ├──────────────────┤           │
│  │ user_id        │◄──┬──│ account_id       │           │
│  │ account_type   │   │  │ symbol           │           │
│  │ balance        │   │  │ type (buy/sell)  │           │
│  │ equity         │   │  │ volume           │           │
│  │ used_margin    │   │  │ entry_price      │           │
│  │ available_marg │   │  │ current_price    │           │
│  │ leverage       │   │  │ pnl              │           │
│  │ trading_volume │   │  │ margin_used      │           │
│  │ bonus_balance  │   │  │ swap_accumulated │           │
│  │ realized_pnl   │   │  └──────────────────┘           │
│  └────────────────┘   │                                  │
│                       │   ┌────────────────────┐        │
│                       └──┬│ TradingHistory     │        │
│                          ├────────────────────┤        │
│                          │ account_id         │        │
│                          │ symbol             │        │
│                          │ type               │        │
│                          │ entry/exit_price   │        │
│                          │ realized_pnl       │        │
│                          │ trading_fee        │        │
│                          │ spread_cost        │        │
│                          │ swap_fee           │        │
│                          │ commission         │        │
│                          │ duration_hours     │        │
│                          └────────────────────┘        │
│                                                          │
│  ┌────────────────────────┐  ┌─────────────────────┐   │
│  │ SalesPartnerApplication│  │  FuturesReferral    │   │
│  ├────────────────────────┤  ├─────────────────────┤   │
│  │ user_id                │  │ referrer_id         │   │
│  │ name, email, telegram  │  │ referral_code       │   │
│  │ wallet_address         │  │ referred_users[]    │   │
│  │ region, experience     │  │ total_referred      │   │
│  │ status (pending/appr)  │  │ active_traders      │   │
│  │ reviewed_at            │  │ total_volume        │   │
│  │ notes (admin)          │  │ commission_rate     │   │
│  └────────────────────────┘  │ total_earned        │   │
│                              │ available_balance   │   │
│                              │ withdrawn           │   │
│                              └─────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Revenue Flow

```
TRADER A deposits $1000
    ↓
Chooses PRO account
    ↓
Starts trading (1 lot EURUSD-T)
    ├─ Entry: 1.0850
    └─ Exit: 1.0892
    
    Cost Breakdown:
    ├─ Spread: 0.9 pips = $9
    ├─ Trading Fee: $0.75/lot = $0.75
    ├─ Swap: 0.015% overnight = varies
    └─ Net Cost: ~$10
    
    ↓
    
    SOLFORT INCOME:
    ├─ Spread Revenue: $9
    ├─ Fee Revenue: $0.75
    └─ Total Revenue: $9.75
    
    ↓
    
    IF REFERRED BY SALES PARTNER:
    ├─ Total fees: $10
    ├─ Partner Commission (30%): $3.00
    └─ SolFort Net: $6.75
    
    ↓
    
    IF REFERRED BY REFERRAL:
    ├─ Total fees: $10
    ├─ Referrer Commission (25%): $2.50
    └─ SolFort Net: $7.25
```

## Commission Tiers

### Sales Partner (Approval-Based)

```
Monthly Volume         Commission      Estimated Income
├─ $1M               → 25-30%         → $2,500-$3,000
├─ $5M               → 27.5-30%       → $12,500-$15,000
├─ $10M+             → 30%            → $25,000+
└─ Tools, Support, Marketing Provided
```

### Referral (Link-Based)

```
Cumulative Volume      Rate      Tier Bonus
├─ $0-$100K         → 20%       → standard
├─ $100K-$500K      → 25%       → increased  
├─ $500K+           → 30%       → premium
└─ Weekly Payouts, No Manager Needed
```

## Page Navigation Map

```
                    FuturesDashboard
                    (Index/Landing)
                    
    ┌───────────────┬────────────────┬───────────────┐
    ↓               ↓                ↓               ↓
FuturesTrade    FuturesAccount    FuturesSales    FuturesReferral
(MT5 Interface) Types             Partner         (Dashboard)
                (Comparison)      (Application)
    │
    ├─ Trade
    ├─ Monitor
    ├─ Close
    ├─ View History
    │
    └─→ FuturesPositions
        (Active Positions)
```

## State Management

```
Global States:
├─ WalletContext (connection, address)
├─ UserTypeContext (user tier, partner status)
├─ LanguageContext (localization)
├─ CurrencyContext (USD → local conversion)
└─ MarketDataProvider (live prices)

Component-Level States:
├─ FuturesTrade
│  ├─ selectedSymbol
│  ├─ orderType, direction
│  ├─ volume, leverage
│  ├─ slPrice, tpPrice
│  └─ positions[], openOrders[]
│
├─ FuturesSalesPartner
│  ├─ formData (name, email, telegram, etc.)
│  └─ submitted (confirmation state)
│
└─ FuturesReferral
   ├─ activeTab (overview/traders/history)
   ├─ copied (clipboard state)
   └─ stats (volume, earnings, etc.)
```

## Security & Authorization

```
┌──────────────────────────────────────────┐
│      USER AUTHENTICATION FLOW             │
├──────────────────────────────────────────┤
│                                          │
│ User Visits App                          │
│   ↓                                      │
│ AuthProvider checks isAuthenticated      │
│   ↓                                      │
│ If true: Show dashboard & menu           │
│ If false: Redirect to login              │
│   ↓                                      │
│ WalletContext checks wallet connection   │
│   ↓                                      │
│ For Futures pages:                       │
│   ├─ Dashboard: Public (no wallet req)  │
│   ├─ Trade: Wallet Required             │
│   ├─ Positions: Wallet Required         │
│   ├─ Account Types: Public              │
│   ├─ Sales Partner: Public (form only)  │
│   └─ Referral: Wallet Required          │
│       (to show earnings)                 │
│                                          │
└──────────────────────────────────────────┘
```

## Integration Points (Backend Ready)

```
Frontend Request → Backend Function → Database Operation

FuturesTrade:
  executeTrade() 
    ├─ Validate balance
    ├─ Check leverage
    ├─ Calculate margin
    ├─ Create TradingPosition
    └─ Emit success/error

closePosition():
    ├─ Calculate exit price
    ├─ Compute PnL
    ├─ Deduct fees
    ├─ Update TradingAccount
    ├─ Create TradingHistory
    └─ Return filled order

FuturesSalesPartner:
  submitApplication()
    ├─ Validate form
    ├─ Create SalesPartnerApplication
    ├─ Set status: pending
    ├─ Send admin notification
    └─ Return confirmation

approveSalesPartner() [Admin]
    ├─ Create TradingAccount (if approved)
    ├─ Update SalesPartnerApplication.status
    ├─ Send approval email
    └─ Activate partner portal

FuturesReferral:
  getReferralStats()
    ├─ Query FuturesReferral by user
    ├─ Count referred users
    ├─ Sum trading volume
    ├─ Calculate earned commission
    └─ Return dashboard data

withdrawCommission():
    ├─ Validate minimum ($100)
    ├─ Create withdrawal request
    ├─ Transfer to Solana wallet
    ├─ Update FuturesReferral.withdrawn
    └─ Send confirmation
```

## Summary

A complete Futures trading system with:
- MT5-style interface for professional trading
- Broker monetization (spreads, fees, swaps)
- Account tiers with different pricing
- Separate sales partner (approval) system
- Separate referral (link-based) system
- Backend integration points prepared
- Database schema finalized
- Security & authorization ready
- Responsive UI/UX implemented