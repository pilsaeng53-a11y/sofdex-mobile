export const MARKETS = [
  { id: 'm1', category: 'Crypto', question: 'Will BTC reach $100K before April 2026?', yesProb: 0.72, volume: 4820000, endDate: '2026-03-31', tags: ['HOT','AI PICK'], payoutYes: 1.39, payoutNo: 3.57 },
  { id: 'm2', category: 'Crypto', question: 'Will ETH flip BTC market cap in 2026?', yesProb: 0.18, volume: 2100000, endDate: '2026-12-31', tags: ['HIGH PAYOUT'], payoutYes: 5.56, payoutNo: 1.22 },
  { id: 'm3', category: 'Finance', question: 'Will the Fed cut rates in May 2026?', yesProb: 0.61, volume: 8900000, endDate: '2026-05-15', tags: ['TRENDING'], payoutYes: 1.64, payoutNo: 2.56 },
  { id: 'm4', category: 'Crypto', question: 'Will SOL outperform ETH in Q2 2026?', yesProb: 0.53, volume: 1400000, endDate: '2026-06-30', tags: ['HOT'], payoutYes: 1.89, payoutNo: 2.13 },
  { id: 'm5', category: 'Politics', question: 'Will any G7 nation adopt BTC as reserve?', yesProb: 0.09, volume: 12000000, endDate: '2026-12-31', tags: ['HIGH PAYOUT'], payoutYes: 11.11, payoutNo: 1.10 },
  { id: 'm6', category: 'Sports', question: 'Will McLaren win the 2026 F1 Championship?', yesProb: 0.44, volume: 3300000, endDate: '2026-11-30', tags: ['TRENDING'], payoutYes: 2.27, payoutNo: 1.79 },
  { id: 'm7', category: 'Crypto', question: 'Will XRP be listed on Coinbase Futures?', yesProb: 0.81, volume: 980000, endDate: '2026-04-01', tags: ['ENDING SOON','HOT'], payoutYes: 1.23, payoutNo: 5.26 },
  { id: 'm8', category: 'Tech', question: 'Will Apple launch an AI chip in 2026?', yesProb: 0.88, volume: 5600000, endDate: '2026-09-30', tags: ['AI PICK'], payoutYes: 1.14, payoutNo: 8.33 },
  { id: 'm9', category: 'Finance', question: 'Will the S&P 500 hit 7000 in 2026?', yesProb: 0.49, volume: 15000000, endDate: '2026-12-31', tags: ['TRENDING','HOT'], payoutYes: 2.04, payoutNo: 1.96 },
  { id: 'm10', category: 'Crypto', question: 'Will DOGE reach $1 before 2027?', yesProb: 0.27, volume: 7200000, endDate: '2026-12-31', tags: ['HIGH PAYOUT'], payoutYes: 3.70, payoutNo: 1.37 },
];

export const LEADERBOARD = [
  { rank: 1,  name: 'CryptoWhale99',  avatar: '🐳', profit: 142800, winRate: 74, streak: 12, trades: 89 },
  { rank: 2,  name: 'PredictKing',    avatar: '👑', profit: 98400,  winRate: 68, streak: 7,  trades: 145 },
  { rank: 3,  name: 'AlphaOracle',    avatar: '🔮', profit: 87200,  winRate: 71, streak: 9,  trades: 62 },
  { rank: 4,  name: 'BullRunner88',   avatar: '🐂', profit: 64500,  winRate: 65, streak: 4,  trades: 201 },
  { rank: 5,  name: 'NightTrader',    avatar: '🌙', profit: 52100,  winRate: 63, streak: 6,  trades: 178 },
  { rank: 6,  name: 'SolQueen',       avatar: '⚡', profit: 44800,  winRate: 61, streak: 3,  trades: 93 },
  { rank: 7,  name: 'MacroMaster',    avatar: '📈', profit: 38200,  winRate: 69, streak: 5,  trades: 54 },
  { rank: 8,  name: 'DegenGod',       avatar: '💎', profit: 31400,  winRate: 58, streak: 2,  trades: 312 },
  { rank: 9,  name: 'SatoshiSeer',    avatar: '₿',  profit: 28900,  winRate: 66, streak: 8,  trades: 41 },
  { rank: 10, name: 'QuantumBets',    avatar: '🤖', profit: 24600,  winRate: 72, streak: 11, trades: 29 },
];

export const SOCIAL_POSTS = [
  { id: 's1', user: 'CryptoWhale99', avatar: '🐳', market: 'Will BTC reach $100K?', side: 'YES', amount: 5000, payout: 6950, likes: 142, comments: 23, time: '2m ago', verified: true },
  { id: 's2', user: 'AlphaOracle',   avatar: '🔮', market: 'Will Fed cut rates?',   side: 'YES', amount: 2000, payout: 3280, likes: 87,  comments: 11, time: '8m ago', verified: true },
  { id: 's3', user: 'BullRunner88',  avatar: '🐂', market: 'Will SOL outperform ETH?', side: 'NO', amount: 800, payout: 1704, likes: 34, comments: 5, time: '15m ago', verified: false },
  { id: 's4', user: 'NightTrader',   avatar: '🌙', market: 'Will DOGE reach $1?',   side: 'YES', amount: 1500, payout: 5550, likes: 56, comments: 8, time: '31m ago', verified: false },
  { id: 's5', user: 'SolQueen',      avatar: '⚡', market: 'Will S&P hit 7000?',    side: 'YES', amount: 3000, payout: 6120, likes: 98, comments: 17, time: '1h ago', verified: true },
];

export const EVENTS = [
  {
    id: 'e1', type: 'tournament', title: 'March Madness Predictor', emoji: '🏆',
    description: 'Top predictor of the week wins 500 USDT. Rank by profit.',
    reward: '500 USDT', ends: '2026-03-31', participants: 1842, myRank: null,
    rules: ['Minimum 3 predictions', 'All categories eligible', 'Ranked by net profit'],
  },
  {
    id: 'e2', type: 'daily', title: 'Daily Crypto Challenge', emoji: '⚡',
    description: 'Predict 3 crypto markets correctly today. Win a multiplier bonus.',
    reward: '2x Payout Boost', ends: '2026-03-23', participants: 4210, myRank: 87,
    rules: ['Pick 3 crypto markets', 'All must resolve YES', 'Bonus applied at settlement'],
  },
  {
    id: 'e3', type: 'weekly', title: 'Win Rate Warriors', emoji: '🎯',
    description: 'Highest win rate over 5+ trades this week. Minimum 5 markets.',
    reward: '250 USDT + Badge', ends: '2026-03-28', participants: 921, myRank: 34,
    rules: ['Minimum 5 trades', 'Win rate determines rank', 'Ties broken by volume'],
  },
  {
    id: 'e4', type: 'special', title: 'AI vs Human Showdown', emoji: '🤖',
    description: 'Beat the AI Oracle predictions across 10 markets. Special prize pool.',
    reward: '1000 USDT Pool', ends: '2026-04-05', participants: 3301, myRank: null,
    rules: ['10 specific markets', 'AI baseline published daily', 'Top 3 win prizes'],
  },
];