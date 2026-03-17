// Futures Trading Assets Configuration
export const TRADING_ASSETS = {
  FOREX: [
    { symbol: 'EURUSD-T', name: 'EUR/USD', category: 'Forex', spread: 1.2, pip_value: 0.0001, lot_size: 100000 },
    { symbol: 'USDJPY-T', name: 'USD/JPY', category: 'Forex', spread: 1.8, pip_value: 0.01, lot_size: 100000 },
    { symbol: 'GBPUSD-T', name: 'GBP/USD', category: 'Forex', spread: 1.5, pip_value: 0.0001, lot_size: 100000 },
    { symbol: 'AUDUSD-T', name: 'AUD/USD', category: 'Forex', spread: 2.0, pip_value: 0.0001, lot_size: 100000 },
  ],
  COMMODITIES: [
    { symbol: 'GOLD-T', name: 'Gold', category: 'Commodities', spread: 0.50, pip_value: 0.01, lot_size: 100 },
    { symbol: 'OIL-T', name: 'Crude Oil', category: 'Commodities', spread: 0.05, pip_value: 0.01, lot_size: 100 },
    { symbol: 'SILVER-T', name: 'Silver', category: 'Commodities', spread: 3.0, pip_value: 0.01, lot_size: 5000 },
    { symbol: 'NATGAS-T', name: 'Natural Gas', category: 'Commodities', spread: 0.04, pip_value: 0.001, lot_size: 10000 },
  ],
  INDICES: [
    { symbol: 'SP500-T', name: 'S&P 500', category: 'Indices', spread: 1.0, pip_value: 0.1, lot_size: 1 },
    { symbol: 'NASDAQ-T', name: 'NASDAQ 100', category: 'Indices', spread: 1.5, pip_value: 0.1, lot_size: 1 },
    { symbol: 'DAX-T', name: 'DAX', category: 'Indices', spread: 2.0, pip_value: 0.1, lot_size: 1 },
    { symbol: 'FTSE-T', name: 'FTSE 100', category: 'Indices', spread: 1.0, pip_value: 0.1, lot_size: 1 },
  ],
  STOCKS: [
    { symbol: 'AAPL-T', name: 'Apple', category: 'Stocks', spread: 0.02, pip_value: 0.01, lot_size: 1 },
    { symbol: 'GOOGL-T', name: 'Google', category: 'Stocks', spread: 0.03, pip_value: 0.01, lot_size: 1 },
    { symbol: 'MSFT-T', name: 'Microsoft', category: 'Stocks', spread: 0.02, pip_value: 0.01, lot_size: 1 },
    { symbol: 'TSLA-T', name: 'Tesla', category: 'Stocks', spread: 0.04, pip_value: 0.01, lot_size: 1 },
    { symbol: 'NVDA-T', name: 'NVIDIA', category: 'Stocks', spread: 0.03, pip_value: 0.01, lot_size: 1 },
  ],
  CRYPTO_PERPS: [
    { symbol: 'BTC-PERP', name: 'Bitcoin Perp', category: 'Crypto Perps', spread: 5.0, pip_value: 1, lot_size: 0.001 },
    { symbol: 'ETH-PERP', name: 'Ethereum Perp', category: 'Crypto Perps', spread: 0.5, pip_value: 0.01, lot_size: 0.01 },
    { symbol: 'SOL-PERP', name: 'Solana Perp', category: 'Crypto Perps', spread: 0.05, pip_value: 0.01, lot_size: 0.1 },
  ],
};

export const ACCOUNT_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    description: 'For retail traders starting their journey',
    features: {
      max_leverage: 100,
      min_deposit: 100,
      spread_multiplier: 1.0,
      fee_per_lot: 1.0,
      swap_rate_daily: 0.02,
      min_lot_size: 0.01,
    },
    color: 'from-blue-500 to-blue-600',
    icon: '📊',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'For active traders with tighter spreads',
    features: {
      max_leverage: 100,
      min_deposit: 1000,
      spread_multiplier: 0.75,
      fee_per_lot: 0.75,
      swap_rate_daily: 0.015,
      min_lot_size: 0.01,
    },
    color: 'from-purple-500 to-pink-600',
    icon: '⭐',
  },
  RAW: {
    id: 'raw',
    name: 'Raw',
    description: 'For professionals with ECN access',
    features: {
      max_leverage: 100,
      min_deposit: 5000,
      spread_multiplier: 0.5,
      fee_per_lot: 3.5,
      swap_rate_daily: 0.01,
      min_lot_size: 0.01,
    },
    color: 'from-amber-500 to-red-600',
    icon: '🏆',
  },
};

export const LEVERAGE_TIERS = [
  { label: '1:1', value: 1 },
  { label: '1:10', value: 10 },
  { label: '1:25', value: 25 },
  { label: '1:50', value: 50 },
  { label: '1:100', value: 100 },
];

export const HOT_INSTRUMENTS = [
  { symbol: 'EURUSD-T', change: 0.45, volume: 2400000 },
  { symbol: 'GOLD-T', change: -1.23, volume: 1850000 },
  { symbol: 'SP500-T', change: 2.10, volume: 3200000 },
  { symbol: 'BTC-PERP', change: 5.67, volume: 980000 },
];

export const BONUS_PROMOTIONS = [
  {
    id: 1,
    title: 'Welcome Bonus',
    description: 'Get 50% bonus on your first deposit',
    type: 'deposit_bonus',
    max_bonus: 5000,
    requirement: 'Deposit min $100',
    validity: '30 days',
  },
  {
    id: 2,
    title: 'Trading Rewards',
    description: 'Earn rewards on every trade',
    type: 'trading_rewards',
    reward_rate: '0.01 per lot',
    requirement: 'Active trading',
    validity: 'Ongoing',
  },
  {
    id: 3,
    title: 'Referral Bonus',
    description: 'Earn 25% commission on referrals',
    type: 'referral_bonus',
    commission_rate: '25%',
    requirement: 'Refer active traders',
    validity: 'Ongoing',
  },
];