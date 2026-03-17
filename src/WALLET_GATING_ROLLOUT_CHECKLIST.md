# Wallet Gating Rollout Checklist

**Status**: Ready for Implementation  
**Scope**: Action-level gating across all SOFDex features  
**Philosophy**: Browse free, execute gated

---

## Phase 1: Core System (DONE ✓)

- [x] `useWalletGate()` hook created
- [x] `WalletGatedButton` component created
- [x] `WalletContext` updated with `requireWallet` method
- [x] Modal handling in existing `ConnectWalletModal`
- [x] Documentation complete

---

## Phase 2: Pages to Update

### Trading & Swaps (HIGH PRIORITY)

#### Trade Page
- [ ] Browse: Page loads without wallet
- [ ] Action: Buy/Sell buttons require wallet
- [ ] Gate message: "Connect your wallet to place trades"
- [ ] Tested: Can browse info, button blocks execution

#### Swap Page
- [ ] Browse: Page loads without wallet
- [ ] Action: Swap button requires wallet
- [ ] Gate message: "Connect your wallet to swap tokens"
- [ ] Tested: Can see tokens, swap execution gated

#### Markets Page
- [ ] Browse: Opens without wallet
- [ ] Action: Trade links/buttons require wallet
- [ ] Gate message: "Connect to trade this asset"
- [ ] Tested: Market data visible, trade actions blocked

### Portfolio & Account (HIGH PRIORITY)

#### Portfolio Page
- [ ] Show empty state if not connected
- [ ] Empty message: "Connect wallet to view portfolio"
- [ ] Empty CTA: Connect button
- [ ] Connected: Show real data
- [ ] Tested: No fake balances shown

#### Wallet Page
- [ ] Show empty state if not connected
- [ ] Empty message: "Connect wallet to view your wallet"
- [ ] Actions (send/receive/withdraw): All require wallet
- [ ] Tested: Account data hidden until connected

#### Activity Page
- [ ] Show empty state if not connected
- [ ] Empty message: "Connect wallet to view activity"
- [ ] Tested: No personal data shown

#### Account Page
- [ ] Show empty state if not connected
- [ ] Display disconnect button if connected
- [ ] Tested: Personal data only when connected

### Copy Trading (MEDIUM PRIORITY)

#### Copy Trading List
- [ ] Browse: View traders without wallet
- [ ] View: Trader profiles open without wallet
- [ ] Action: "Start Copy" button requires wallet
- [ ] Gate message: "Connect to start copy trading"
- [ ] Tested: Can see trader info, copy action blocked

#### Trader Profile
- [ ] Browse: Profile loads without wallet
- [ ] Stats: ROI, win rate, etc. visible
- [ ] Action: Copy/follow buttons require wallet
- [ ] Gate message: "Connect to copy trade"
- [ ] Tested: Info visible, action gated

### Strategies & Vaults (MEDIUM PRIORITY)

#### Strategy Marketplace
- [ ] Browse: View strategies without wallet
- [ ] Details: Strategy info opens without wallet
- [ ] Action: "Subscribe" button requires wallet
- [ ] Gate message: "Connect to subscribe"
- [ ] Tested: Can browse, subscribe blocked

#### Strategy Detail
- [ ] Browse: Full details load without wallet
- [ ] Charts: Charts visible
- [ ] Action: "Subscribe/Invest" requires wallet
- [ ] Gate message: "Connect to subscribe"
- [ ] Tested: Info visible, action gated

#### Strategy Vault
- [ ] Browse: Vault overview loads without wallet
- [ ] Action: "Invest" button requires wallet
- [ ] Gate message: "Connect to invest"
- [ ] Tested: Info visible, investment blocked

#### Strategy ETF
- [ ] Browse: ETF info loads without wallet
- [ ] Action: "Invest" button requires wallet
- [ ] Gate message: "Connect to invest"
- [ ] Tested: Info visible, investment blocked

#### My Investments
- [ ] Show empty state if not connected
- [ ] Empty message: "Connect wallet to view investments"
- [ ] Tested: No personal data shown

### Earning & Rewards (MEDIUM PRIORITY)

#### Rewards Page
- [ ] Browse: Rewards info loads without wallet
- [ ] Action: "Claim" button requires wallet
- [ ] Gate message: "Connect to claim rewards"
- [ ] Tested: Info visible, claim blocked

#### Earn/Staking Page
- [ ] Browse: Page loads without wallet
- [ ] Action: Stake button requires wallet
- [ ] Gate message: "Connect to stake tokens"
- [ ] Tested: Info visible, staking blocked

### Community & Social (LOW PRIORITY)

#### Trading Feed
- [ ] Browse: Posts visible without wallet
- [ ] Action: "Like/Comment" may require wallet (decide)
- [ ] Gate message: "Connect to engage"
- [ ] Tested: Can read posts, engagement gated

#### Discussions
- [ ] Browse: Threads visible without wallet
- [ ] Action: Create/reply may require wallet (decide)
- [ ] Gate message: "Connect to participate"
- [ ] Tested: Can read, creation gated

### Governance (MEDIUM PRIORITY)

#### Governance Page
- [ ] Browse: Proposals visible without wallet
- [ ] Details: Proposal info opens without wallet
- [ ] Action: "Vote" button requires wallet
- [ ] Gate message: "Connect to vote"
- [ ] Tested: Info visible, voting blocked

#### Proposal Submission
- [ ] Browse: Submissions visible without wallet
- [ ] Action: "Submit" button requires wallet
- [ ] Gate message: "Connect to submit proposal"
- [ ] Tested: Info visible, submission blocked

### Other Features (STANDARD)

#### Launchpad
- [ ] Browse: Projects visible without wallet
- [ ] Action: "Invest" button requires wallet
- [ ] Gate message: "Connect to invest"

#### Prediction Market
- [ ] Browse: Markets visible without wallet
- [ ] Action: "Predict" button requires wallet
- [ ] Gate message: "Connect to predict"

#### RWA Market
- [ ] Browse: Assets visible without wallet
- [ ] Action: "Invest" button requires wallet
- [ ] Gate message: "Connect to invest"

#### Real Estate
- [ ] Browse: Properties visible without wallet
- [ ] Action: "Invest" button requires wallet
- [ ] Gate message: "Connect to invest"

#### Partner Hub
- [ ] Browse: Overview without wallet
- [ ] Private data: Shows empty state if not connected
- [ ] Action: Apply/KYC requires wallet

#### Institutional
- [ ] Browse: Overview without wallet
- [ ] Private data: Shows empty state if not connected

---

## Implementation Order

### Week 1: Core Pages
1. Trade Page
2. Swap Page
3. Portfolio Page
4. Wallet Page

### Week 2: Social & Community
1. Copy Trading List
2. Strategy Marketplace
3. Activity Page
4. Account Page

### Week 3: Advanced Features
1. Governance
2. Launchpad
3. Earn/Staking
4. RWA Market

### Week 4: Polish & Testing
1. All remaining pages
2. Cross-page testing
3. Performance verification
4. UX refinement

---

## Testing Template for Each Page

### Page: [NAME]

**Setup:**
- [ ] Browser cache cleared
- [ ] Wallet not connected
- [ ] Page visited fresh

**Browse Tests:**
- [ ] Page loads without wallet
- [ ] All information visible
- [ ] No blocked content
- [ ] Charts/data loads

**Action Tests:**
- [ ] Click action button
- [ ] Modal appears
- [ ] Correct message shown
- [ ] Wallet options visible

**Connect & Execute Tests:**
- [ ] Click "Connect" in modal
- [ ] Select wallet
- [ ] Connection successful
- [ ] Modal closes
- [ ] Action executes
- [ ] No page reload
- [ ] Result shows

**Already Connected Tests:**
- [ ] Connect wallet first
- [ ] Visit page
- [ ] Click action button
- [ ] No modal, executes immediately

**Sign Out Tests:**
- [ ] Disconnect wallet
- [ ] Click action button
- [ ] Modal appears again
- [ ] System works after reconnect

---

## Code Patterns by Category

### Browse-Only Pages (No Changes Needed)
```
Home, Markets, News, AI Intelligence, Governance (view only)
- These can stay as-is
- No gating required
- Already accessible
```

### Page + Action Pattern
```javascript
// Trade, Swap, Strategy Detail, etc.
const { gateAction } = useWalletGate();

<button onClick={() => gateAction(executeAction, 'Connect message')}>
  Execute
</button>
```

### Account-Only Pages
```javascript
// Portfolio, Wallet, Activity, etc.
const { isConnected } = useWallet();

if (!isConnected) return <EmptyState />;
return <PageContent />;
```

---

## Rollout Strategy

### Option A: Page by Page (Recommended)
- Deploy one page every 1-2 days
- Test thoroughly before next
- Easy to rollback if issues
- Users see progress

### Option B: Batch by Category
- Deploy all trading at once
- Then portfolio/account
- Then social/community
- Faster, slightly riskier

### Option C: Feature Flag (Advanced)
- Deploy all behind feature flag
- Enable gradually by page
- Can rollback entire system
- Most control

**Recommendation**: Option A - Deploy Trade → Swap → Portfolio → others

---

## Verification Checklist

Before marking page complete:

- [ ] Page loads without wallet
- [ ] Browseable content visible
- [ ] Action button triggers modal when not connected
- [ ] Modal has correct message
- [ ] Wallet connects successfully
- [ ] Action executes after connect
- [ ] No page reloads
- [ ] Can disconnect and re-gate works
- [ ] Already connected state works (no modal)
- [ ] Error states handled gracefully
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No performance regression

---

## Rollback Plan

If issues arise:

1. **Immediate**: Revert individual page changes
2. **Module**: Disable affected feature via feature flag
3. **Complete**: Revert entire PR if critical

This is low-risk because:
- Changes are isolated to button handling
- No data structure changes
- Existing redirect logic unaffected
- Can revert without side effects

---

## Success Metrics

Track these after rollout:

- User sessions without wallet (should stay high)
- Browse-only page views (should not decrease)
- Wallet connection rate (may increase slightly)
- Time to action after connect (should be <1s)
- Error rates on gated actions (should be near 0)
- User feedback on modal clarity

---

## Stakeholder Communication

### For Users
"We've made it easier to explore SOFDex without connecting your wallet. Browse markets, strategies, and more freely. Only connect when you're ready to trade or access your account."

### For Team
"Wallet gating is now action-based, not page-based. Pages remain open for browsing, but trading/account actions require wallet. No page-level redirects. See implementation guide for patterns."

---

## Documentation to Share

1. `WALLET_GATING_SYSTEM.md` - Full system spec
2. `WALLET_GATING_IMPLEMENTATION_GUIDE.md` - How to implement
3. This checklist - What to do

---

## Q&A

**Q: Do users need to connect wallet to view prices?**  
A: No. All market data, prices, charts stay open without wallet.

**Q: Can users browse strategy pages without wallet?**  
A: Yes. They can read full strategy details, but "Subscribe" button requires wallet.

**Q: Will this affect existing connected users?**  
A: No. Connected users see no changes. Everything works as before.

**Q: What if user cancels connection in modal?**  
A: Modal closes, page stays the same, they can try again later.

**Q: Do we need to change database or API?**  
A: No. This is pure frontend gating behavior.

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Core System | Done | ✓ |
| Trading Pages | 2-3 days | → |
| Portfolio Pages | 2-3 days | → |
| Copy Trading | 2-3 days | → |
| Other Pages | 3-4 days | → |
| Testing | 2-3 days | → |
| Polish & Launch | 1-2 days | → |
| **Total** | **~2 weeks** | → |

---

**Start with Trade → Swap → Portfolio. Test thoroughly. Then expand.**

This is a straightforward, low-risk refactor that improves UX significantly.