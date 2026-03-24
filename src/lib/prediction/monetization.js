/**
 * SolFort Prediction Market — Monetization Engine
 * Fee layer, spread injection, cash-out, insurance, pool model, parlay.
 */

// ─── Config ────────────────────────────────────────────────────────────────
export const PLATFORM_FEE_RATE   = 0.02;   // 2% entry fee
export const SETTLEMENT_FEE_RATE = 0.01;   // 1% settlement fee on winnings
export const CASHOUT_FEE_RATE    = 0.10;   // 10% early exit fee
export const INSURANCE_RATE      = 0.08;   // 8% of stake for 50% refund
export const BOOST_COST          = 5;      // $5 flat for +15% payout boost
export const SPREAD_VIG          = 1.03;   // Makes YES+NO = 1.03 (hidden margin)
export const HIGH_ROLLER_MINIMUM = 1000;   // $1000+ = high roller

// ─── Spread Application ────────────────────────────────────────────────────
// Apply platform vig to outcomes — reduces effective payout
export function applySpread(outcomes) {
  if (!outcomes?.length) return outcomes;
  return outcomes.map(o => ({
    ...o,
    prob: Math.min(o.prob * SPREAD_VIG, 0.999),
  }));
}

// ─── Fee Calculation ───────────────────────────────────────────────────────
export function calcFees({ stake, outcome, boosts = [], isHighRoller = false }) {
  const entryFee      = stake * PLATFORM_FEE_RATE;
  const netStake      = stake - entryFee;
  const basePayout    = outcome ? 1 / Math.max(outcome.prob, 0.001) : 0;
  const boostMult     = boosts.includes('boost') ? 1.15 : 1.0;
  const grossWin      = netStake * basePayout * boostMult;
  const settleFee     = grossWin * SETTLEMENT_FEE_RATE;
  const netWin        = grossWin - settleFee;
  const profit        = netWin - stake;
  const insuranceCost = boosts.includes('insurance') ? stake * INSURANCE_RATE : 0;
  const boostCost     = boosts.includes('boost') ? BOOST_COST : 0;
  const totalCost     = stake + insuranceCost + boostCost;
  const hrBonus       = isHighRoller ? 1.05 : 1.0; // 5% extra for high rollers

  return {
    entryFee:      parseFloat(entryFee.toFixed(4)),
    netStake:      parseFloat(netStake.toFixed(4)),
    basePayout,
    boostMult,
    grossWin:      parseFloat(grossWin.toFixed(4)),
    settleFee:     parseFloat(settleFee.toFixed(4)),
    netWin:        parseFloat((netWin * hrBonus).toFixed(4)),
    profit:        parseFloat((profit * hrBonus).toFixed(4)),
    insuranceCost: parseFloat(insuranceCost.toFixed(4)),
    boostCost,
    totalCost:     parseFloat(totalCost.toFixed(4)),
    finalMultiplier: parseFloat(((netWin * hrBonus) / stake).toFixed(3)),
    isHighRoller,
    hrBonus,
  };
}

// ─── Cash Out Value ─────────────────────────────────────────────────────────
// Simulates current market value — as if selling the position now
export function calcCashOut({ stake, outcome, currentProb }) {
  if (!outcome || !currentProb) return 0;
  const impliedValue = stake * (currentProb / outcome.prob);
  const afterFee = impliedValue * (1 - CASHOUT_FEE_RATE);
  return Math.max(parseFloat(afterFee.toFixed(2)), 0);
}

// ─── Insurance Refund ──────────────────────────────────────────────────────
export function calcInsuranceRefund(stake) {
  return parseFloat((stake * 0.5).toFixed(2));
}

// ─── Parlay Calculator ─────────────────────────────────────────────────────
export function calcParlay(legs) {
  // legs: [{ outcome, stake }]
  if (!legs.length) return { multiplier: 0, grossPayout: 0, netPayout: 0, entryFee: 0 };
  const multiplier = legs.reduce((m, leg) => {
    return m * (1 / Math.max(leg.outcome?.prob ?? 0.5, 0.001));
  }, 1);
  const stake = legs[0]?.stake ?? 0;
  const entryFee = stake * PLATFORM_FEE_RATE;
  const netStake = stake - entryFee;
  const grossPayout = netStake * multiplier;
  const settleFee = grossPayout * SETTLEMENT_FEE_RATE;
  return {
    multiplier: parseFloat(multiplier.toFixed(2)),
    grossPayout: parseFloat(grossPayout.toFixed(2)),
    netPayout:   parseFloat((grossPayout - settleFee).toFixed(2)),
    entryFee:    parseFloat(entryFee.toFixed(2)),
  };
}

// ─── Pool Model ────────────────────────────────────────────────────────────
// Simulate pooled betting: winners share pool minus platform fee
export function calcPoolPayout({ totalPool, winningPool, stake }) {
  if (!totalPool || !winningPool) return 0;
  const platformCut = totalPool * PLATFORM_FEE_RATE;
  const distributable = totalPool - platformCut;
  const share = stake / winningPool;
  return parseFloat((distributable * share).toFixed(2));
}

// ─── High Roller Check ─────────────────────────────────────────────────────
export function isHighRoller(amount) {
  return parseFloat(amount) >= HIGH_ROLLER_MINIMUM;
}