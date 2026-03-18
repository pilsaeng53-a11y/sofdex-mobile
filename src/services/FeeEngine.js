/**
 * FeeEngine.js
 * Core fee distribution & accrual engine.
 * All fee math lives here — UI never calculates independently.
 */

// ─── Policy Table ──────────────────────────────────────────────────────────
export const FEE_POLICY = {
  // Base fee taken from each trade (as % of notional)
  BASE_TRADING_FEE_RATE: 0.001, // 0.1%

  // Case 1: Normal user (no partner)
  NORMAL: {
    exchange: 0.70,   // 70% → exchange treasury
    referral: 0.30,   // 30% → referrer
  },

  // Case 2: Registered partner user
  PARTNER: {
    partner: 0.60,    // 60% → partner chain (cascades down)
    exchange: 0.40,   // 40% → exchange treasury
  },

  // SOF Sales reward split (Gold tier example)
  SALES_REWARD: {
    total: 0.40,      // 40% of sale value
    usdt_share: 0.50, // 50% of reward in USDT
    sof_share: 0.50,  // 50% of reward in SOF
  },

  // Minimum payout threshold
  MIN_PAYOUT_USD: 100,
};

// ─── Fee Calculation ────────────────────────────────────────────────────────

/**
 * Calculate the base trading fee for a given notional
 */
export function calcTradingFee(notional) {
  return notional * FEE_POLICY.BASE_TRADING_FEE_RATE;
}

/**
 * Distribute fee among stakeholders.
 * @param {number} fee - total fee collected (USD)
 * @param {boolean} hasPartner - user has an approved partner
 * @param {PartnerNode[]} partnerChain - ordered chain [root→...→direct_partner]
 * @returns {DistributionResult}
 */
export function distributeFee(fee, hasPartner, partnerChain = []) {
  if (!hasPartner || partnerChain.length === 0) {
    // Normal: 70 exchange / 30 referral
    return {
      exchange: fee * FEE_POLICY.NORMAL.exchange,
      referral: fee * FEE_POLICY.NORMAL.referral,
      partners: [],
    };
  }

  // Partner mode: 60 partner chain / 40 exchange
  const partnerPool = fee * FEE_POLICY.PARTNER.partner;
  const exchangeAmount = fee * FEE_POLICY.PARTNER.exchange;

  // Cascade commission through partner chain
  const partnerPayouts = cascadePartnerCommission(partnerPool, partnerChain);

  return {
    exchange: exchangeAmount,
    referral: 0, // no separate referral when partner present
    partners: partnerPayouts,
  };
}

/**
 * Cascade partner commission down the chain.
 * Each parent keeps (parent_rate - child_rate), child gets child_rate.
 * Chain: [root, level1, level2, ...directPartner]
 * 
 * @param {number} pool - total amount available for the partner chain
 * @param {PartnerNode[]} chain - [{id, wallet, rate: 0-1}, ...]
 *   rate = fraction of pool this node is entitled to
 * @returns {{id, wallet, amount}[]}
 */
export function cascadePartnerCommission(pool, chain) {
  const payouts = [];
  let remaining = pool;

  // Validate: no node can exceed its parent's rate
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    const parentRate = i === 0 ? 1.0 : chain[i - 1].rate;
    const effectiveRate = Math.min(node.rate, parentRate);

    const nodeAmount = pool * effectiveRate;
    // Parent keeps (parentPool - childPool)
    if (i > 0) {
      const parentPayout = payouts[i - 1];
      const parentKeeps = pool * (chain[i - 1].rate - effectiveRate);
      parentPayout.amount = parentKeeps;
    }

    payouts.push({
      id: node.id,
      wallet: node.wallet,
      rate: effectiveRate,
      amount: nodeAmount, // may be adjusted above
    });

    remaining -= nodeAmount;
  }

  // Any remainder from rounding → exchange
  return payouts;
}

/**
 * Validate that no child rate exceeds parent allocation.
 * Returns { valid: bool, error: string }
 */
export function validatePartnerRates(chain) {
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].rate > chain[i - 1].rate) {
      return {
        valid: false,
        error: `Level ${i + 1} rate (${(chain[i].rate * 100).toFixed(1)}%) exceeds parent rate (${(chain[i - 1].rate * 100).toFixed(1)}%)`,
      };
    }
  }
  const totalCheck = chain.reduce((s, n) => Math.max(s, n.rate), 0);
  if (totalCheck > 1) {
    return { valid: false, error: 'Partner rates exceed 100%' };
  }
  return { valid: true, error: null };
}

// ─── SOF Sales Commission ───────────────────────────────────────────────────

/**
 * Calculate SOF sales partner reward split.
 * @param {number} usdtAmount - amount customer paid in USDT
 * @param {number} sofPrice - current SOF price in USD
 * @returns {{ totalRewardUSD, usdt, sof_amount, sof_usd_value }}
 */
export function calcSalesReward(usdtAmount, sofPrice) {
  const policy = FEE_POLICY.SALES_REWARD;
  const totalRewardUSD = usdtAmount * policy.total;
  const usdt = totalRewardUSD * policy.usdt_share;
  const sof_usd_value = totalRewardUSD * policy.sof_share;
  const sof_amount = sofPrice > 0 ? sof_usd_value / sofPrice : 0;

  return {
    totalRewardUSD,
    usdt,
    sof_usd_value,
    sof_amount,
    sofPrice,
  };
}

/**
 * Calculate SOF quantity from USDT amount.
 * @param {number} usdt 
 * @param {number} sofPrice 
 * @returns {number} SOF tokens
 */
export function calcSOFFromUSDT(usdt, sofPrice) {
  if (!sofPrice || sofPrice <= 0) return 0;
  return usdt / sofPrice;
}

// ─── Pre-Trade Approval Model ───────────────────────────────────────────────

/**
 * Calculate all pre-trade data to show user before confirmation.
 * @param {object} params
 * @param {number} params.notional - position size in USD
 * @param {number} params.leverage
 * @param {'buy'|'sell'} params.direction
 * @param {number} params.entryPrice
 * @param {string} params.accountType - 'standard'|'pro'|'raw'
 * @returns {PreTradeApproval}
 */
export function calcPreTradeApproval({ notional, leverage, direction, entryPrice, accountType }) {
  const margin = notional / leverage;
  const fee = calcTradingFee(notional);

  // Liquidation: simplified — margin exhausted + fee
  const liquidationOffset = (margin / notional) * entryPrice;
  const liquidationPrice = direction === 'buy'
    ? entryPrice - liquidationOffset
    : entryPrice + liquidationOffset;

  // Spread cost (account-type dependent)
  const spreadBps = accountType === 'raw' ? 0.5 : accountType === 'pro' ? 1.5 : 3.0;
  const spreadCost = notional * (spreadBps / 10000);

  const totalRequired = margin + fee + spreadCost;

  return {
    notional,
    leverage,
    margin,
    fee,
    spreadCost,
    totalRequired,
    liquidationPrice: parseFloat(liquidationPrice.toFixed(5)),
    entryPrice,
    direction,
  };
}