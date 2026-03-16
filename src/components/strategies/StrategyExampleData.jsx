export const EXAMPLE_STRATEGIES = [
  {
    id: 'strat-1',
    name: 'AI Momentum Alpha',
    creator: 'Alex Chen',
    category: 'AI-Generated',
    roi30d: 42.8,
    winRate: 74,
    maxDrawdown: -8.2,
    followers: 3240,
    subscribers: 487,
    totalRevenue: 8750,
    risk: 'medium',
    rating: 4.7,
    reviews: 156,
    description: 'AI momentum strategy targeting breakout assets with volume confirmation. Focuses on DePIN, AI tokens, and high-velocity movers.',
    strategy: 'Analyzes momentum indicators and volume patterns. AI model identifies trend reversals and accumulation zones.',
    targetMarket: 'Growth-oriented investors seeking high alpha',
    style: 'Momentum + Machine Learning',
    pricing: [
      { duration: '1day', price: 9.99 },
      { duration: '1week', price: 34.99 },
      { duration: '1month', price: 89.99 }
    ],
    backtest: {
      '1month': { roi: 42.8, trades: 184, winRate: 74 },
      '3month': { roi: 108.5, trades: 512, winRate: 72 },
      '6month': { roi: 156.2, trades: 1024, winRate: 71 },
      '1year': { roi: 248.7, trades: 2048, winRate: 70 }
    },
    performanceData: {
      weekly: [8.2, -2.1, 15.4, 3.7, 21.8, -1.2, 18.5],
      monthly: [8.2, 15.4, 21.8, -5.3, 28.4],
      yearly: [42.8, 56.3, 72.1, 108.5, 156.2, 248.7, 312.4, 285.6, 295.2, 248.7, 267.3, 312.4]
    }
  },
  {
    id: 'strat-2',
    name: 'Quant Breakout Pro',
    creator: 'Sarah Patel',
    category: 'Quantitative',
    roi30d: 28.4,
    winRate: 81,
    maxDrawdown: -3.1,
    followers: 5120,
    subscribers: 892,
    totalRevenue: 16200,
    risk: 'low',
    rating: 4.9,
    reviews: 243,
    description: 'Delta-neutral pairs trading strategy using correlated asset spreads. Captures mean-reversion across major pairs.',
    strategy: 'Identifies statistical arbitrage opportunities through pair correlation analysis. Low volatility, consistent returns.',
    targetMarket: 'Risk-conscious investors seeking steady income',
    style: 'Statistical Arbitrage',
    pricing: [
      { duration: '1day', price: 14.99 },
      { duration: '1week', price: 49.99 },
      { duration: '1month', price: 129.99 }
    ],
    backtest: {
      '1month': { roi: 28.4, trades: 62, winRate: 81 },
      '3month': { roi: 72.3, trades: 178, winRate: 82 },
      '6month': { roi: 134.5, trades: 351, winRate: 81 },
      '1year': { roi: 218.7, trades: 728, winRate: 80 }
    },
    performanceData: {
      weekly: [5.2, 6.1, 4.8, 5.7, 4.3, 6.2, 5.1],
      monthly: [5.2, 6.1, 4.8, 5.7, 4.3],
      yearly: [28.4, 34.2, 38.5, 42.8, 48.3, 56.7, 72.3, 89.4, 108.5, 134.5, 156.2, 218.7]
    }
  },
  {
    id: 'strat-3',
    name: 'RWA Yield Rotation',
    creator: 'James Morrison',
    category: 'RWA',
    roi30d: 9.2,
    winRate: 88,
    maxDrawdown: -1.4,
    followers: 2840,
    subscribers: 612,
    totalRevenue: 9450,
    risk: 'low',
    rating: 4.8,
    reviews: 189,
    description: 'Long-only RWA yield strategy. Targets tokenized bonds, real estate, and gold for stable portfolio income.',
    strategy: 'Rotates across top-yield RWA assets. Rebalances monthly based on yield curve changes.',
    targetMarket: 'Conservative investors seeking stable yield',
    style: 'Yield Rotation',
    pricing: [
      { duration: '1day', price: 7.99 },
      { duration: '1week', price: 24.99 },
      { duration: '1month', price: 59.99 }
    ],
    backtest: {
      '1month': { roi: 9.2, trades: 28, winRate: 88 },
      '3month': { roi: 27.8, trades: 84, winRate: 87 },
      '6month': { roi: 48.4, trades: 168, winRate: 88 },
      '1year': { roi: 87.6, trades: 336, winRate: 87 }
    },
    performanceData: {
      weekly: [2.1, 2.3, 2.0, 2.4, 1.9, 2.2, 2.3],
      monthly: [2.1, 2.3, 2.0, 2.4, 1.9],
      yearly: [9.2, 11.2, 13.4, 15.8, 18.2, 21.5, 27.8, 34.2, 41.6, 48.4, 58.2, 87.6]
    }
  },
  {
    id: 'strat-4',
    name: 'Market Neutral Core',
    creator: 'Emma Wilson',
    category: 'Hedged',
    roi30d: 15.6,
    winRate: 85,
    maxDrawdown: -2.8,
    followers: 4120,
    subscribers: 721,
    totalRevenue: 12840,
    risk: 'low',
    rating: 4.6,
    reviews: 134,
    description: 'Market-neutral core strategy. Balances long/short positions to isolate alpha from beta.',
    strategy: 'Balances sector longs and shorts. Removes systematic market risk while capturing idiosyncratic alpha.',
    targetMarket: 'Sophisticated investors seeking market-independent returns',
    style: 'Long/Short Equity',
    pricing: [
      { duration: '1day', price: 12.99 },
      { duration: '1week', price: 39.99 },
      { duration: '1month', price: 99.99 }
    ],
    backtest: {
      '1month': { roi: 15.6, trades: 45, winRate: 85 },
      '3month': { roi: 42.3, trades: 132, winRate: 84 },
      '6month': { roi: 78.5, trades: 264, winRate: 85 },
      '1year': { roi: 142.8, trades: 528, winRate: 84 }
    },
    performanceData: {
      weekly: [3.2, 3.5, 3.1, 3.4, 2.9, 3.6, 3.3],
      monthly: [3.2, 3.5, 3.1, 3.4, 2.9],
      yearly: [15.6, 19.2, 23.4, 28.7, 34.2, 42.3, 51.8, 65.3, 78.5, 92.4, 108.3, 142.8]
    }
  },
  {
    id: 'strat-5',
    name: 'Scalper Pulse X',
    creator: 'Michael Chen',
    category: 'High-Frequency',
    roi30d: 67.2,
    winRate: 68,
    maxDrawdown: -18.4,
    followers: 2140,
    subscribers: 289,
    totalRevenue: 5280,
    risk: 'high',
    rating: 4.3,
    reviews: 78,
    description: 'High-frequency scalping strategy. Captures intraday volatility through rapid entry/exit cycles.',
    strategy: 'Uses technical indicators for quick scalps. Targets 0.5-2% per trade with high frequency.',
    targetMarket: 'Experienced traders comfortable with high volatility',
    style: 'Scalping',
    pricing: [
      { duration: '1day', price: 19.99 },
      { duration: '1week', price: 59.99 },
      { duration: '1month', price: 149.99 }
    ],
    backtest: {
      '1month': { roi: 67.2, trades: 312, winRate: 68 },
      '3month': { roi: 156.8, trades: 894, winRate: 66 },
      '6month': { roi: 267.3, trades: 1784, winRate: 65 },
      '1year': { roi: 428.5, trades: 3584, winRate: 63 }
    },
    performanceData: {
      weekly: [12.4, -3.2, 18.5, 8.3, 15.2, -2.1, 16.7],
      monthly: [12.4, 18.5, 15.2, -8.4, 28.5],
      yearly: [67.2, 89.3, 112.4, 156.8, 198.3, 267.3, 312.4, 285.6, 298.4, 328.5, 372.1, 428.5]
    }
  },
  {
    id: 'strat-6',
    name: 'Defensive Income',
    creator: 'Rachel Green',
    category: 'Conservative',
    roi30d: 6.8,
    winRate: 92,
    maxDrawdown: -0.8,
    followers: 3580,
    subscribers: 654,
    totalRevenue: 7920,
    risk: 'very-low',
    rating: 4.9,
    reviews: 321,
    description: 'Capital preservation strategy. Allocates to US T-Bill tokens and gold for portfolio stabilization.',
    strategy: 'Conservative allocation to safe-haven assets. Ideal for bear markets or risk-averse investors.',
    targetMarket: 'Conservative investors seeking capital preservation',
    style: 'Capital Preservation',
    pricing: [
      { duration: '1day', price: 4.99 },
      { duration: '1week', price: 14.99 },
      { duration: '1month', price: 34.99 }
    ],
    backtest: {
      '1month': { roi: 6.8, trades: 14, winRate: 92 },
      '3month': { roi: 19.2, trades: 42, winRate: 91 },
      '6month': { roi: 38.4, trades: 84, winRate: 92 },
      '1year': { roi: 74.2, trades: 168, winRate: 91 }
    },
    performanceData: {
      weekly: [1.2, 1.3, 1.1, 1.4, 1.2, 1.3, 1.3],
      monthly: [1.2, 1.3, 1.1, 1.4, 1.2],
      yearly: [6.8, 8.1, 10.2, 12.8, 15.3, 19.2, 23.4, 28.7, 34.2, 38.4, 48.3, 74.2]
    }
  }
];

export const EXAMPLE_VAULTS = [
  {
    id: 'vault-1',
    name: 'AlphaQuant Vault',
    tokenSymbol: 'AQV',
    strategies: ['strat-2', 'strat-4'],
    aum: 5240000,
    investors: 342,
    roi30d: 28.4,
    roi1y: 218.7,
    risk: 'low',
    minInvestment: 1000,
    tokenPrice: 1.24,
    creatorShare: 20,
    investorShare: 70,
    exchangeShare: 10,
    description: 'A vault of quantitative and market-neutral strategies for steady alpha generation.',
    targetStyle: 'Statistical arbitrage and long/short equity',
    expectedInvestors: 'Sophisticated investors seeking consistent alpha',
    overview: 'Combines delta-neutral and market-neutral strategies to provide consistent returns with minimal drawdown risk.',
    recentTrades: [
      { type: 'BTC/ETH Pair Trade', action: 'Long BTC, Short ETH', profit: 240, date: '2 hours ago' },
      { type: 'SOL/SUI Arbitrage', action: 'Captured spread', profit: 180, date: '4 hours ago' },
      { type: 'Sector Rotation', action: 'AI to Finance', profit: 320, date: '6 hours ago' }
    ],
    performanceData: {
      weekly: [5.2, 6.1, 4.8, 5.7, 4.3, 6.2, 5.1],
      monthly: [5.2, 6.1, 4.8, 5.7, 4.3],
      yearly: [28.4, 34.2, 38.5, 42.8, 48.3, 56.7, 72.3, 89.4, 108.5, 134.5, 156.2, 218.7]
    }
  },
  {
    id: 'vault-2',
    name: 'RWA Income Vault',
    tokenSymbol: 'RIV',
    strategies: ['strat-3'],
    aum: 3180000,
    investors: 228,
    roi30d: 9.2,
    roi1y: 87.6,
    risk: 'low',
    minInvestment: 500,
    tokenPrice: 1.08,
    creatorShare: 20,
    investorShare: 70,
    exchangeShare: 10,
    description: 'Yield-focused vault investing in tokenized real-world assets for stable income.',
    targetStyle: 'RWA yield rotation and income generation',
    expectedInvestors: 'Income-focused investors seeking consistent yield',
    overview: 'Rotates through top-yielding RWA assets including bonds, real estate, and commodities for stable passive income.',
    recentTrades: [
      { type: 'Bond Rebalance', action: 'Increased TBILL position', profit: 450, date: '1 day ago' },
      { type: 'Yield Capture', action: 'Real estate distributions', profit: 820, date: '2 days ago' },
      { type: 'Gold Rotation', action: 'Added GOLD-T', profit: 680, date: '3 days ago' }
    ],
    performanceData: {
      weekly: [2.1, 2.3, 2.0, 2.4, 1.9, 2.2, 2.3],
      monthly: [2.1, 2.3, 2.0, 2.4, 1.9],
      yearly: [9.2, 11.2, 13.4, 15.8, 18.2, 21.5, 27.8, 34.2, 41.6, 48.4, 58.2, 87.6]
    }
  },
  {
    id: 'vault-3',
    name: 'Momentum Growth Vault',
    tokenSymbol: 'MGV',
    strategies: ['strat-1'],
    aum: 4890000,
    investors: 412,
    roi30d: 42.8,
    roi1y: 312.4,
    risk: 'medium',
    minInvestment: 2000,
    tokenPrice: 2.18,
    creatorShare: 20,
    investorShare: 70,
    exchangeShare: 10,
    description: 'High-growth vault powered by AI momentum strategies targeting emerging tokens.',
    targetStyle: 'AI momentum and trend following',
    expectedInvestors: 'Growth-oriented investors willing to accept higher volatility',
    overview: 'Leverages machine learning to identify momentum in high-growth sectors like AI, DePIN, and emerging protocols.',
    recentTrades: [
      { type: 'AI Token Breakout', action: 'Long RNDR, JUP', profit: 1240, date: '3 hours ago' },
      { type: 'DePIN Momentum', action: 'Captured pump', profit: 2180, date: '8 hours ago' },
      { type: 'Trend Confirmation', action: 'Added to winning position', profit: 1680, date: '12 hours ago' }
    ],
    performanceData: {
      weekly: [8.2, -2.1, 15.4, 3.7, 21.8, -1.2, 18.5],
      monthly: [8.2, 15.4, 21.8, -5.3, 28.4],
      yearly: [42.8, 56.3, 72.1, 108.5, 156.2, 248.7, 312.4, 285.6, 295.2, 248.7, 267.3, 312.4]
    }
  },
  {
    id: 'vault-4',
    name: 'Defensive Hedge Vault',
    tokenSymbol: 'DHV',
    strategies: ['strat-6'],
    aum: 2450000,
    investors: 189,
    roi30d: 6.8,
    roi1y: 74.2,
    risk: 'very-low',
    minInvestment: 250,
    tokenPrice: 1.02,
    creatorShare: 20,
    investorShare: 70,
    exchangeShare: 10,
    description: 'Ultra-conservative vault for capital preservation during market downturns.',
    targetStyle: 'Capital preservation and defensive positioning',
    expectedInvestors: 'Conservative investors, retirees, risk-averse portfolio allocators',
    overview: 'Maintains allocation to safe-haven assets like TBILL, gold, and stablecoins. Ideal as a market hedge.',
    recentTrades: [
      { type: 'Safe Haven Rotation', action: 'Increased TBILL', profit: 240, date: '1 day ago' },
      { type: 'Gold Position', action: 'Steady accumulation', profit: 180, date: '3 days ago' },
      { type: 'Stablecoin Harvest', action: 'Captured yield', profit: 320, date: '5 days ago' }
    ],
    performanceData: {
      weekly: [1.2, 1.3, 1.1, 1.4, 1.2, 1.3, 1.3],
      monthly: [1.2, 1.3, 1.1, 1.4, 1.2],
      yearly: [6.8, 8.1, 10.2, 12.8, 15.3, 19.2, 23.4, 28.7, 34.2, 38.4, 48.3, 74.2]
    }
  }
];

export const EXAMPLE_INDEX_FUNDS = [
  {
    id: 'index-1',
    name: 'Top AI Strategies Index',
    tokenSymbol: 'AIND',
    included: ['strat-1', 'strat-5'],
    aum: 8900000,
    roi30d: 54.8,
    risk: 'medium',
    investors: 542,
    allocation: [
      { name: 'AI Momentum Alpha', pct: 60 },
      { name: 'Scalper Pulse X', pct: 40 }
    ],
    description: 'Index of top-performing AI and high-frequency strategies'
  },
  {
    id: 'index-2',
    name: 'Balanced Quant Index',
    tokenSymbol: 'BQND',
    included: ['strat-2', 'strat-4'],
    aum: 6240000,
    roi30d: 22.1,
    risk: 'low',
    investors: 398,
    allocation: [
      { name: 'Quant Breakout Pro', pct: 50 },
      { name: 'Market Neutral Core', pct: 50 }
    ],
    description: 'Balanced index of quantitative and market-neutral strategies'
  },
  {
    id: 'index-3',
    name: 'RWA Yield Index',
    tokenSymbol: 'RWAI',
    included: ['strat-3', 'strat-6'],
    aum: 4120000,
    roi30d: 8.0,
    risk: 'very-low',
    investors: 287,
    allocation: [
      { name: 'RWA Yield Rotation', pct: 70 },
      { name: 'Defensive Income', pct: 30 }
    ],
    description: 'Conservative index focused on RWA yield and income generation'
  }
];