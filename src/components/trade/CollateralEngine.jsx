/**
 * CollateralEngine — defines all eligible collateral assets,
 * their haircuts, risk weights, and effective margin calculation.
 */

export const COLLATERAL_ASSETS = [
  // ── Stablecoins (100% collateral value) ──────────────────────────────────
  {
    symbol: 'USDT',   name: 'Tether USD',           group: 'Stablecoins',
    icon: '₮',        iconBg: 'bg-emerald-500/20',   iconColor: 'text-emerald-400',
    haircut: 0,       riskLevel: 'Safe',             riskColor: 'text-emerald-400',
    balance: 2450.00, priceUSD: 1.00,
    locked: false,
    note: 'Full value — pegged stablecoin',
  },
  {
    symbol: 'USDC',   name: 'USD Coin',              group: 'Stablecoins',
    icon: '$',        iconBg: 'bg-blue-500/20',      iconColor: 'text-blue-400',
    haircut: 0,       riskLevel: 'Safe',             riskColor: 'text-emerald-400',
    balance: 1200.00, priceUSD: 1.00,
    locked: false,
    note: 'Full value — pegged stablecoin',
  },

  // ── Crypto (reduced collateral value due to volatility) ───────────────────
  {
    symbol: 'BTC',    name: 'Bitcoin',               group: 'Crypto',
    icon: '₿',        iconBg: 'bg-amber-500/20',     iconColor: 'text-amber-400',
    haircut: 0.10,    riskLevel: 'Medium',           riskColor: 'text-amber-400',
    balance: 0.045,   priceUSD: 98200,
    locked: false,
    note: '10% haircut — high-cap crypto, moderate volatility',
  },
  {
    symbol: 'ETH',    name: 'Ethereum',              group: 'Crypto',
    icon: 'Ξ',        iconBg: 'bg-violet-500/20',    iconColor: 'text-violet-400',
    haircut: 0.12,    riskLevel: 'Medium',           riskColor: 'text-amber-400',
    balance: 1.2,     priceUSD: 3820,
    locked: false,
    note: '12% haircut — high-cap crypto, moderate volatility',
  },
  {
    symbol: 'SOL',    name: 'Solana',                group: 'Crypto',
    icon: '◎',        iconBg: 'bg-purple-500/20',    iconColor: 'text-purple-400',
    haircut: 0.15,    riskLevel: 'Medium',           riskColor: 'text-amber-400',
    balance: 24.82,   priceUSD: 186,
    locked: false,
    note: '15% haircut — mid-cap crypto, higher volatility',
  },

  // ── SOF Token ─────────────────────────────────────────────────────────────
  {
    symbol: 'SOF',    name: 'SolFort Token',         group: 'SOF',
    icon: '⬡',        iconBg: 'bg-[#00d4aa]/20',    iconColor: 'text-[#00d4aa]',
    haircut: 0.20,    riskLevel: 'Medium-High',      riskColor: 'text-orange-400',
    balance: 15000,   priceUSD: 0.082,
    locked: false,
    note: '20% haircut — native token, platform liquidity incentive',
  },

  // ── RWA — Liquid (moderate haircut) ──────────────────────────────────────
  {
    symbol: 'GOLD-T', name: 'Tokenized Gold',        group: 'RWA',
    icon: '⬛',        iconBg: 'bg-yellow-500/20',   iconColor: 'text-yellow-400',
    haircut: 0.10,    riskLevel: 'Low',              riskColor: 'text-emerald-400',
    balance: 1.2,     priceUSD: 2341,
    locked: false,
    note: '10% haircut — physically-backed, highly liquid commodity',
  },
  {
    symbol: 'TBILL',  name: 'US Treasury Bill',      group: 'RWA',
    icon: '🏛',        iconBg: 'bg-blue-500/20',     iconColor: 'text-blue-300',
    haircut: 0.02,    riskLevel: 'Safe',             riskColor: 'text-emerald-400',
    balance: 25,      priceUSD: 100.24,
    locked: false,
    note: '2% haircut — US gov. backed, near-zero credit risk',
  },
  {
    symbol: 'CRUDE-T',name: 'Tokenized Crude Oil',   group: 'RWA',
    icon: '🛢',        iconBg: 'bg-orange-500/20',   iconColor: 'text-orange-400',
    haircut: 0.20,    riskLevel: 'Medium',           riskColor: 'text-amber-400',
    balance: 5,       priceUSD: 82,
    locked: false,
    note: '20% haircut — commodity price volatility applies',
  },

  // ── RWA — Illiquid (high haircut or locked) ───────────────────────────────
  {
    symbol: 'RE-MHT-1', name: 'Manhattan Prime Tower', group: 'RWA',
    icon: '🏙',          iconBg: 'bg-purple-500/20',   iconColor: 'text-purple-300',
    haircut: 0.40,      riskLevel: 'High',             riskColor: 'text-red-400',
    balance: 120,       priceUSD: 247.5,
    locked: true,
    note: 'Locked — illiquid real estate, cannot be used as active collateral',
  },
  {
    symbol: 'RE-SGP-1', name: 'Marina Bay Tower',      group: 'RWA',
    icon: '🏗',          iconBg: 'bg-teal-500/20',     iconColor: 'text-teal-400',
    haircut: 0.40,      riskLevel: 'High',             riskColor: 'text-red-400',
    balance: 50,        priceUSD: 198.6,
    locked: true,
    note: 'Locked — illiquid real estate, cannot be used as active collateral',
  },
];

/** Compute effective collateral value after haircut */
export function getCollateralValue(asset, amount) {
  const nominalUSD = amount * asset.priceUSD;
  const effectiveUSD = nominalUSD * (1 - asset.haircut);
  return { nominalUSD, effectiveUSD, haircutUSD: nominalUSD - effectiveUSD };
}

/** Group collateral assets for the selector UI */
export function getGroupedCollateral() {
  const groups = {};
  COLLATERAL_ASSETS.forEach(a => {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  });
  return groups;
}

/** Get a single collateral asset by symbol */
export function getCollateralAsset(symbol) {
  return COLLATERAL_ASSETS.find(a => a.symbol === symbol) || COLLATERAL_ASSETS[0];
}