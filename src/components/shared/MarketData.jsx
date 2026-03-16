// Shared mock market data for the app
export const CRYPTO_MARKETS = [
  // Large cap — up to 100x
  { symbol: "BTC",  name: "Bitcoin",       price: 98425.50, change:  2.14, volume: "38.2B", mcap: "1.93T", category: "crypto", leverage: "100x", maxLeverage: 100 },
  { symbol: "ETH",  name: "Ethereum",      price: 3842.18,  change: -1.32, volume: "15.6B", mcap: "462B",  category: "crypto", leverage: "100x", maxLeverage: 100 },
  { symbol: "SOL",  name: "Solana",        price: 187.42,   change:  5.23, volume: "2.8B",  mcap: "82.1B", category: "crypto", leverage: "100x", maxLeverage: 100 },
  // Medium cap — up to 50x
  { symbol: "BNB",  name: "BNB",           price: 412.30,   change:  1.45, volume: "1.9B",  mcap: "62.4B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "XRP",  name: "XRP",           price: 0.592,    change:  3.21, volume: "3.1B",  mcap: "33.1B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "ADA",  name: "Cardano",       price: 0.612,    change: -0.87, volume: "780M",  mcap: "21.8B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "DOGE", name: "Dogecoin",      price: 0.182,    change:  4.11, volume: "2.2B",  mcap: "26.4B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "AVAX", name: "Avalanche",     price: 38.50,    change: -2.14, volume: "890M",  mcap: "15.9B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "DOT",  name: "Polkadot",      price: 9.84,     change:  1.22, volume: "345M",  mcap: "13.5B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "LINK", name: "Chainlink",     price: 18.72,    change:  2.89, volume: "678M",  mcap: "11.2B", category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "MATIC",name: "Polygon",       price: 0.894,    change: -1.56, volume: "456M",  mcap: "8.9B",  category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "LTC",  name: "Litecoin",      price: 112.40,   change:  0.78, volume: "567M",  mcap: "8.4B",  category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "ATOM", name: "Cosmos",        price: 10.23,    change: -0.34, volume: "234M",  mcap: "3.8B",  category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "UNI",  name: "Uniswap",       price: 12.45,    change:  3.67, volume: "312M",  mcap: "7.4B",  category: "crypto", leverage: "50x",  maxLeverage: 50  },
  { symbol: "APT",  name: "Aptos",         price: 14.82,    change:  5.43, volume: "423M",  mcap: "6.8B",  category: "crypto", leverage: "50x",  maxLeverage: 50  },
  // Smaller assets — up to 20–25x
  { symbol: "OP",   name: "Optimism",      price: 2.34,     change:  6.12, volume: "345M",  mcap: "3.1B",  category: "crypto", leverage: "25x",  maxLeverage: 25  },
  { symbol: "ARB",  name: "Arbitrum",      price: 1.12,     change:  4.78, volume: "289M",  mcap: "4.5B",  category: "crypto", leverage: "25x",  maxLeverage: 25  },
  { symbol: "SUI",  name: "Sui",           price: 3.82,     change:  8.92, volume: "567M",  mcap: "9.8B",  category: "crypto", leverage: "25x",  maxLeverage: 25  },
  { symbol: "SEI",  name: "Sei",           price: 0.612,    change:  3.45, volume: "189M",  mcap: "2.4B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "INJ",  name: "Injective",     price: 28.40,    change: -1.23, volume: "234M",  mcap: "2.9B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "PEPE", name: "Pepe",          price: 0.0000124,change:  9.87, volume: "1.2B",  mcap: "5.2B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "TIA",  name: "Celestia",      price: 8.92,     change:  2.34, volume: "145M",  mcap: "1.8B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "NEAR", name: "NEAR Protocol", price: 7.82,     change: -0.89, volume: "278M",  mcap: "8.4B",  category: "crypto", leverage: "25x",  maxLeverage: 25  },
  { symbol: "FTM",  name: "Fantom",        price: 0.892,    change:  5.67, volume: "234M",  mcap: "2.5B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "AAVE", name: "Aave",          price: 142.30,   change:  2.45, volume: "189M",  mcap: "2.1B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  // Solana ecosystem
  { symbol: "JUP",  name: "Jupiter",       price: 1.24,     change:  8.71, volume: "890M",  mcap: "1.7B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "RAY",  name: "Raydium",       price: 5.83,     change: -2.45, volume: "245M",  mcap: "1.1B",  category: "crypto", leverage: "20x",  maxLeverage: 20  },
  { symbol: "RNDR", name: "Render",        price: 8.92,     change: 12.34, volume: "412M",  mcap: "4.6B",  category: "crypto", leverage: "25x",  maxLeverage: 25  },
  { symbol: "BONK", name: "Bonk",          price: 0.0000234,change: -4.12, volume: "156M",  mcap: "1.5B",  category: "crypto", leverage: "10x",  maxLeverage: 10  },
  { symbol: "HNT",  name: "Helium",        price: 8.45,     change:  3.67, volume: "89M",   mcap: "1.4B",  category: "crypto", leverage: "15x",  maxLeverage: 15  },
  // SolFort native token — live price from useSOFPrice
  { symbol: "SOF",  name: "SolFort Token", price: 0.0001,   change:  0.00, volume: "—",     mcap: "—",     category: "crypto", leverage: "20x",  maxLeverage: 20  },
];

export const RWA_MARKETS = [
  { symbol: "GOLD-T", name: "Tokenized Gold", price: 2341.80, change: 0.87, volume: "124M", mcap: "18.2B", category: "rwa", yield: "0.0%", type: "Commodity" },
  { symbol: "TBILL", name: "US Treasury Bill", price: 100.24, change: 0.02, volume: "892M", mcap: "45.1B", category: "rwa", yield: "5.12%", type: "Treasury" },
  { symbol: "RE-NYC", name: "NYC Real Estate Fund", price: 52.40, change: 1.24, volume: "34M", mcap: "2.1B", category: "rwa", yield: "7.8%", type: "Real Estate" },
  { symbol: "SP500-T", name: "S&P 500 Tokenized", price: 5842.30, change: 0.45, volume: "234M", mcap: "12.4B", category: "rwa", yield: "1.2%", type: "Equity" },
  { symbol: "CRUDE-T", name: "Crude Oil Token", price: 78.92, change: -1.23, volume: "67M", mcap: "3.2B", category: "rwa", yield: "0.0%", type: "Commodity" },
  { symbol: "RE-DXB", name: "Dubai RE Portfolio", price: 124.50, change: 2.15, volume: "18M", mcap: "890M", category: "rwa", yield: "9.2%", type: "Real Estate" },
  { symbol: "EURO-B", name: "Euro Bond Token", price: 98.75, change: 0.11, volume: "156M", mcap: "8.4B", category: "rwa", yield: "3.8%", type: "Treasury" },
  { symbol: "TSLA-T", name: "Tesla Tokenized", price: 248.90, change: 3.45, volume: "89M", mcap: "5.6B", category: "rwa", yield: "0.0%", type: "Equity" },
];

export const TRADFI_MARKETS = [
  // ── Tech ──────────────────────────────────────────────────────────────
  { symbol: "AAPLx",  name: "Apple",          price: 227.50, change: 1.23,  volume: "156M", mcap: "8.2B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:AAPL"  },
  { symbol: "MSFTx",  name: "Microsoft",      price: 445.20, change: 0.89,  volume: "112M", mcap: "7.1B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:MSFT"  },
  { symbol: "GOOGLx", name: "Alphabet",       price: 175.20, change: -0.45, volume: "78M",  mcap: "5.1B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:GOOGL" },
  { symbol: "AMZNx",  name: "Amazon",         price: 198.40, change: 0.67,  volume: "89M",  mcap: "6.4B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:AMZN"  },
  { symbol: "METAx",  name: "Meta Platforms", price: 582.30, change: 2.14,  volume: "98M",  mcap: "6.8B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:META"  },
  { symbol: "NVDAx",  name: "NVIDIA",         price: 892.40, change: 4.56,  volume: "189M", mcap: "11.2B", category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:NVDA"  },
  { symbol: "TSLAx",  name: "Tesla",          price: 248.90, change: 3.45,  volume: "234M", mcap: "12.4B", category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:TSLA"  },
  { symbol: "NFLXx",  name: "Netflix",        price: 985.60, change: 1.78,  volume: "67M",  mcap: "5.4B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:NFLX"  },
  { symbol: "AMDx",   name: "AMD",            price: 162.40, change: 2.34,  volume: "89M",  mcap: "4.8B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:AMD"   },
  { symbol: "INTCx",  name: "Intel",          price: 31.80,  change: -1.45, volume: "112M", mcap: "3.2B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NASDAQ:INTC"  },
  { symbol: "TSMx",   name: "TSMC",           price: 175.60, change: 0.98,  volume: "78M",  mcap: "4.5B",  category: "tradfi", type: "xStock", sector: "Tech",       tvSymbol: "NYSE:TSM"     },
  // ── Finance ───────────────────────────────────────────────────────────
  { symbol: "JPMx",   name: "JPMorgan Chase", price: 218.40, change: 0.34,  volume: "56M",  mcap: "4.2B",  category: "tradfi", type: "xStock", sector: "Finance",    tvSymbol: "NYSE:JPM"     },
  { symbol: "BACx",   name: "Bank of America",price: 44.20,  change: 0.67,  volume: "89M",  mcap: "3.8B",  category: "tradfi", type: "xStock", sector: "Finance",    tvSymbol: "NYSE:BAC"     },
  { symbol: "GSx",    name: "Goldman Sachs",  price: 512.30, change: 1.12,  volume: "34M",  mcap: "5.1B",  category: "tradfi", type: "xStock", sector: "Finance",    tvSymbol: "NYSE:GS"      },
  { symbol: "BRKx",   name: "Berkshire Hath.",price: 449.80, change: 0.45,  volume: "28M",  mcap: "4.7B",  category: "tradfi", type: "xStock", sector: "Finance",    tvSymbol: "NYSE:BRK.B"   },
  // ── Consumer ──────────────────────────────────────────────────────────
  { symbol: "DISx",   name: "Walt Disney",    price: 112.40, change: -0.89, volume: "67M",  mcap: "3.4B",  category: "tradfi", type: "xStock", sector: "Consumer",   tvSymbol: "NYSE:DIS"     },
  { symbol: "NIKEx",  name: "Nike",           price: 78.60,  change: -1.23, volume: "78M",  mcap: "2.9B",  category: "tradfi", type: "xStock", sector: "Consumer",   tvSymbol: "NYSE:NKE"     },
  { symbol: "SBUXx",  name: "Starbucks",      price: 98.20,  change: 0.56,  volume: "56M",  mcap: "2.1B",  category: "tradfi", type: "xStock", sector: "Consumer",   tvSymbol: "NASDAQ:SBUX"  },
  { symbol: "MCDx",   name: "McDonald's",     price: 298.40, change: 0.34,  volume: "45M",  mcap: "3.6B",  category: "tradfi", type: "xStock", sector: "Consumer",   tvSymbol: "NYSE:MCD"     },
  // ── Industrial ────────────────────────────────────────────────────────
  { symbol: "CATx",   name: "Caterpillar",    price: 342.80, change: 1.02,  volume: "34M",  mcap: "3.2B",  category: "tradfi", type: "xStock", sector: "Industrial", tvSymbol: "NYSE:CAT"     },
  { symbol: "BAx",    name: "Boeing",         price: 178.40, change: -0.78, volume: "56M",  mcap: "2.8B",  category: "tradfi", type: "xStock", sector: "Industrial", tvSymbol: "NYSE:BA"      },
  { symbol: "GEx",    name: "GE Aerospace",   price: 192.60, change: 0.67,  volume: "45M",  mcap: "2.4B",  category: "tradfi", type: "xStock", sector: "Industrial", tvSymbol: "NYSE:GE"      },
  // ── Healthcare ────────────────────────────────────────────────────────
  { symbol: "JNJx",   name: "Johnson & Johnson",price: 156.80,change: 0.23,  volume: "56M",  mcap: "2.9B",  category: "tradfi", type: "xStock", sector: "Healthcare", tvSymbol: "NYSE:JNJ"     },
  { symbol: "PFEx",   name: "Pfizer",         price: 28.40,  change: -0.45, volume: "89M",  mcap: "1.8B",  category: "tradfi", type: "xStock", sector: "Healthcare", tvSymbol: "NYSE:PFE"     },
  { symbol: "MRKx",   name: "Merck",          price: 134.60, change: 0.89,  volume: "45M",  mcap: "2.3B",  category: "tradfi", type: "xStock", sector: "Healthcare", tvSymbol: "NYSE:MRK"     },
  // ── Energy ────────────────────────────────────────────────────────────
  { symbol: "XOMx",   name: "ExxonMobil",     price: 118.40, change: 1.34,  volume: "67M",  mcap: "3.1B",  category: "tradfi", type: "xStock", sector: "Energy",     tvSymbol: "NYSE:XOM"     },
  { symbol: "CVXx",   name: "Chevron",        price: 156.20, change: 0.78,  volume: "56M",  mcap: "2.8B",  category: "tradfi", type: "xStock", sector: "Energy",     tvSymbol: "NYSE:CVX"     },
  // ── xETFs — Tokenized ETFs ────────────────────────────────────────────
  { symbol: "SPYx",   name: "S&P 500 ETF",    price: 584.20, change: 0.45,  volume: "456M", mcap: "18.4B", category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:SPY"     },
  { symbol: "QQQx",   name: "Nasdaq-100 ETF", price: 495.80, change: 0.78,  volume: "312M", mcap: "14.2B", category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "NASDAQ:QQQ"   },
  { symbol: "VTIx",   name: "Total Market ETF",price: 275.60,change: 0.56,  volume: "178M", mcap: "8.4B",  category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:VTI"     },
  { symbol: "DIAx",   name: "Dow Jones ETF",  price: 432.40, change: 0.34,  volume: "134M", mcap: "7.2B",  category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:DIA"     },
  { symbol: "IWMx",   name: "Russell 2000 ETF",price: 218.40,change: -0.23, volume: "89M",  mcap: "4.2B",  category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:IWM"     },
  { symbol: "GLDx",   name: "Gold ETF",       price: 232.40, change: 0.34,  volume: "234M", mcap: "9.8B",  category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:GLD"     },
  { symbol: "SLVx",   name: "Silver ETF",     price: 27.80,  change: 0.56,  volume: "112M", mcap: "3.4B",  category: "tradfi", type: "xETF",   sector: "ETF",        tvSymbol: "AMEX:SLV"     },
];

export const ALL_MARKETS = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];

export const GOVERNANCE_PROPOSALS = [
  {
    id: 1,
    title: "Increase SOFD Staking Rewards to 12% APY",
    status: "active",
    yesPercent: 72, noPercent: 28, totalVotes: 1247892,
    startDate: "2026-03-01", endDate: "2026-03-15",
    description: "Proposal to increase staking rewards for SOFD token holders from 8% to 12% APY to incentivize long-term holding and reduce circulating supply.",
    benefits: ["Higher APY attracts long-term stakers", "Reduces sell pressure on circulating supply", "Strengthens DAO participation and token loyalty"],
    risks: ["Increased token emission rate", "Potential treasury strain if volume drops", "May attract mercenary capital"],
    notes: "Staking contract upgrade required. Estimated implementation 2 weeks post-approval.",
    treasury_impact: "~$2.1M / year",
    timeline_stage: "voting",
  },
  {
    id: 2,
    title: "Launch Tokenized Real Estate Market – Phase 2",
    status: "active",
    yesPercent: 89, noPercent: 11, totalVotes: 892341,
    startDate: "2026-03-05", endDate: "2026-03-20",
    description: "Expand RWA offerings to include European commercial real estate portfolios with institutional-grade custody and quarterly yield distributions.",
    benefits: ["Diversifies platform revenue streams", "Opens European market to RWA investors", "Increases protocol AUM significantly"],
    risks: ["Regulatory compliance complexity in EU", "Custody partner onboarding timeline", "Liquidity risk for illiquid RWA assets"],
    notes: "Custody agreement with licensed EU partner already in review.",
    treasury_impact: "~$500K setup cost",
    timeline_stage: "voting",
  },
  {
    id: 3,
    title: "Reduce Trading Fees for High Volume Traders",
    status: "passed",
    yesPercent: 94, noPercent: 6, totalVotes: 2341567,
    startDate: "2026-02-10", endDate: "2026-02-28",
    description: "Implement tiered fee structure reducing fees by up to 40% for institutional traders processing more than $500K monthly volume.",
    benefits: ["Attracts institutional volume", "Increases platform competitiveness", "Revenue increase from higher volume despite lower per-trade fee"],
    risks: ["Short-term fee revenue reduction", "Complexity in tier management"],
    notes: "Executed and live since March 1st 2026.",
    treasury_impact: "Revenue neutral at scale",
    timeline_stage: "executed",
  },
  {
    id: 4,
    title: "Treasury Diversification into RWA Bonds",
    status: "passed",
    yesPercent: 67, noPercent: 33, totalVotes: 567234,
    startDate: "2026-01-20", endDate: "2026-02-15",
    description: "Allocate 15% of DAO treasury into tokenized government bonds for yield generation and treasury stability.",
    benefits: ["Stable yield on idle treasury funds", "Reduces USD exposure risk", "Sets precedent for RWA-native treasury strategy"],
    risks: ["Lockup period reduces treasury liquidity", "Bond yield may not outpace inflation"],
    notes: "Treasury committee approved initial $800K allocation.",
    treasury_impact: "15% of treasury (~$4.2M)",
    timeline_stage: "executed",
  },
  {
    id: 5,
    title: "Add Cross-Chain Bridge Support",
    status: "rejected",
    yesPercent: 38, noPercent: 62, totalVotes: 1123456,
    startDate: "2026-01-05", endDate: "2026-02-01",
    description: "Enable cross-chain asset transfers from Ethereum and Arbitrum to SOFDex on Solana.",
    benefits: ["Access to Ethereum-native liquidity", "Broader user base from EVM chains"],
    risks: ["Bridge smart contract security risk", "Added complexity and attack surface", "Solana-native UX may degrade"],
    notes: "Proposal rejected due to security concerns. May be re-submitted with audited bridge provider.",
    treasury_impact: "None",
    timeline_stage: "rejected",
  },
  {
    id: 6,
    title: "Extend Token Lockup Period by 6 Months",
    status: "upcoming",
    yesPercent: 0, noPercent: 0, totalVotes: 0,
    startDate: "2026-03-24", endDate: "2026-04-07",
    description: "Proposal to extend the token lockup period by an additional 6 months to protect market stability and support long-term ecosystem growth.",
    benefits: [
      "Reduces supply shock risk",
      "Protects market price stability",
      "Aligns long-term incentives with ecosystem growth",
      "Supports healthier post-launch market structure",
    ],
    risks: ["May reduce short-term liquidity for early contributors", "Delayed vesting could impact team morale"],
    notes: "Voting will begin on March 24, 2026 (UTC).",
    treasury_impact: "None",
    timeline_stage: "discussion",
  },
  {
    id: 7,
    title: "Expand RWA Categories to Infrastructure and Energy",
    status: "active",
    yesPercent: 61, noPercent: 39, totalVotes: 445000,
    startDate: "2026-03-08", endDate: "2026-03-22",
    description: "Add infrastructure bonds and renewable energy project tokens as tradable RWA categories on SOFDex.",
    benefits: ["Broadens RWA investment universe", "Access to stable infrastructure yield", "First-mover advantage in energy RWA on Solana"],
    risks: ["Regulatory grey area in some jurisdictions", "Valuation complexity for infrastructure assets"],
    notes: "Pilot with two infrastructure token issuers already in negotiation.",
    treasury_impact: "~$250K integration cost",
    timeline_stage: "voting",
  },
  {
    id: 8,
    title: "Expand Prediction Market to More Global Events",
    status: "active",
    yesPercent: 78, noPercent: 22, totalVotes: 334200,
    startDate: "2026-03-10", endDate: "2026-03-25",
    description: "Extend the prediction market to cover geopolitical events, sports, and macroeconomic indicators beyond crypto price predictions.",
    benefits: ["Increases platform engagement", "New revenue stream from prediction fees", "Attracts mainstream users outside crypto"],
    risks: ["Regulatory risk in prediction market regulation", "Oracle reliability for non-price events"],
    notes: "Oracle partner for real-world event data identified.",
    treasury_impact: "~$100K oracle integration",
    timeline_stage: "voting",
  },
  {
    id: 9,
    title: "Treasury Allocation for Ecosystem Growth Fund",
    status: "upcoming",
    yesPercent: 0, noPercent: 0, totalVotes: 0,
    startDate: "2026-04-01", endDate: "2026-04-15",
    description: "Allocate 10% of protocol revenue to a new Ecosystem Growth Fund supporting developer grants, hackathons, and community building.",
    benefits: ["Accelerates ecosystem development", "Attracts builders to SOFDex platform", "Long-term protocol value creation"],
    risks: ["Reduced short-term staker distributions", "Fund management overhead"],
    notes: "Voting will open on April 1, 2026 (UTC). Grant committee structure TBD.",
    treasury_impact: "10% of monthly revenue",
    timeline_stage: "draft",
  },
];

export function getMarketBySymbol(symbol) {
  return ALL_MARKETS.find(m => m.symbol === symbol);
}

export function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

export function formatChange(change) {
  if (change == null || isNaN(change)) return '—';
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}