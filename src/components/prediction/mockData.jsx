// ─── Category Tree ────────────────────────────────────────────────────────
export const CATEGORY_TREE = [
  { id: 'explore',    label: '🔥 Explore',      subs: [] },
  { id: 'crypto',     label: '₿ Crypto',         subs: ['BTC Price','ETH Price','SOL Price','XRP Lawsuit','ETH ETF','Altcoin Season','Stablecoins','DeFi','NFTs','Layer 2'] },
  { id: 'sports',     label: '🏆 Sports',         subs: ['Soccer','Basketball','Baseball','Tennis','Golf','UFC/MMA','Hockey','Cricket','NFL','Formula 1','Boxing','Olympics'] },
  { id: 'elections',  label: '🗳️ Elections',      subs: ['US 2026','EU Elections','UK Politics','Asia Pacific','Latin America','Referendum'] },
  { id: 'politics',   label: '🏛️ Politics',       subs: ['US Policy','Foreign Policy','Trade Wars','Sanctions','NATO','UN','War & Conflict','Treaties'] },
  { id: 'economics',  label: '📊 Economics',      subs: ['Interest Rates','CPI / Inflation','GDP','Jobs Report','Oil','Gold','Stocks','Real Estate','Recession','Debt'] },
  { id: 'companies',  label: '🏢 Companies',      subs: ['Apple','Tesla','Nvidia','Meta','Amazon','Google','SpaceX','OpenAI','Startups','IPOs','M&A'] },
  { id: 'tech',       label: '🤖 Tech & Science', subs: ['AI','Space','Biotech','Climate Tech','Quantum','Nuclear','EVs','Semiconductors','Cybersecurity'] },
  { id: 'culture',    label: '🎬 Culture',        subs: ['Entertainment','Music','Movies','Awards','Gaming','Social Media','Viral','Celebrity'] },
  { id: 'climate',    label: '🌍 Climate',        subs: ['Carbon Targets','Extreme Weather','Renewables','Oil & Gas Policy','COP Outcomes','Sea Levels'] },
  { id: 'global',     label: '🌐 Global',         subs: ['Geopolitics','Pandemics','Demographics','Migration','Food Security','Water'] },
];

// ─── Market Type Schemas ─────────────────────────────────────────────────
// binary: YES/NO
// multi: multiple named outcomes
// range: numeric range brackets
// ladder: tiered levels

export const MARKETS = [
  // ── EXPLORE / TRENDING ────────────────────────────────────────────────
  { id: 'ex1', category: 'explore', sub: 'Trending',  type: 'binary',
    question: 'Will BTC reach $100K before April 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.72 }, { id: 'NO', label: 'NO', prob: 0.28 }],
    volume: 14820000, endDate: '2026-03-31', tags: ['HOT','AI PICK'], liquidity: 3200000, source: 'internal' },

  { id: 'ex2', category: 'explore', sub: 'Trending',  type: 'binary',
    question: 'Will the Fed cut rates in May 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.61 }, { id: 'NO', label: 'NO', prob: 0.39 }],
    volume: 28900000, endDate: '2026-05-15', tags: ['TRENDING'], liquidity: 8400000, source: 'kalshi' },

  // ── CRYPTO ────────────────────────────────────────────────────────────
  { id: 'cr1', category: 'crypto', sub: 'BTC Price',  type: 'ladder',
    question: 'Where will BTC close Q2 2026?',
    outcomes: [
      { id: 'below80k', label: 'Below $80K', prob: 0.08 },
      { id: '80-90k',   label: '$80K–$90K',  prob: 0.15 },
      { id: '90-100k',  label: '$90K–$100K', prob: 0.29 },
      { id: '100-120k', label: '$100K–$120K',prob: 0.33 },
      { id: 'above120k',label: 'Above $120K',prob: 0.15 },
    ],
    volume: 9400000, endDate: '2026-06-30', tags: ['AI PICK'], liquidity: 2100000, source: 'internal' },

  { id: 'cr2', category: 'crypto', sub: 'ETH ETF',   type: 'binary',
    question: 'Will SEC approve spot ETH ETF options by Q3?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.57 }, { id: 'NO', label: 'NO', prob: 0.43 }],
    volume: 6700000, endDate: '2026-09-30', tags: ['HIGH PAYOUT'], liquidity: 1800000, source: 'polymarket' },

  { id: 'cr3', category: 'crypto', sub: 'XRP Lawsuit',type: 'binary',
    question: 'Will Ripple fully resolve SEC case by 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.71 }, { id: 'NO', label: 'NO', prob: 0.29 }],
    volume: 4200000, endDate: '2026-12-31', tags: ['HOT'], liquidity: 950000, source: 'polymarket' },

  { id: 'cr4', category: 'crypto', sub: 'Altcoin Season', type: 'binary',
    question: 'Will Altcoin Season Index exceed 75 in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.44 }, { id: 'NO', label: 'NO', prob: 0.56 }],
    volume: 2100000, endDate: '2026-12-31', tags: ['TRENDING'], liquidity: 600000, source: 'internal' },

  { id: 'cr5', category: 'crypto', sub: 'SOL Price',  type: 'binary',
    question: 'Will SOL outperform ETH in Q2 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.53 }, { id: 'NO', label: 'NO', prob: 0.47 }],
    volume: 3400000, endDate: '2026-06-30', tags: ['HOT'], liquidity: 820000, source: 'internal' },

  { id: 'cr6', category: 'crypto', sub: 'DeFi',      type: 'binary',
    question: 'Will Ethereum DeFi TVL exceed $100B in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.38 }, { id: 'NO', label: 'NO', prob: 0.62 }],
    volume: 1800000, endDate: '2026-12-31', tags: ['HIGH PAYOUT'], liquidity: 420000, source: 'internal' },

  // ── SPORTS ─────────────────────────────────────────────────────────────
  { id: 'sp1', category: 'sports', sub: 'Soccer',     type: 'multi',
    question: 'Who will win the 2026 UEFA Champions League?',
    outcomes: [
      { id: 'real',     label: 'Real Madrid',  prob: 0.24 },
      { id: 'mancity',  label: 'Man City',      prob: 0.18 },
      { id: 'inter',    label: 'Inter Milan',   prob: 0.14 },
      { id: 'barca',    label: 'Barcelona',     prob: 0.13 },
      { id: 'other',    label: 'Other',         prob: 0.31 },
    ],
    volume: 18400000, endDate: '2026-05-30', tags: ['HOT','TRENDING'], liquidity: 5100000, source: 'polymarket' },

  { id: 'sp2', category: 'sports', sub: 'Basketball', type: 'binary',
    question: 'Will the Warriors win the 2026 NBA Championship?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.12 }, { id: 'NO', label: 'NO', prob: 0.88 }],
    volume: 7200000, endDate: '2026-06-15', tags: ['HIGH PAYOUT'], liquidity: 1900000, source: 'polymarket' },

  { id: 'sp3', category: 'sports', sub: 'Formula 1',  type: 'multi',
    question: 'Who wins the 2026 F1 Drivers Championship?',
    outcomes: [
      { id: 'verstappen',label: 'Verstappen', prob: 0.31 },
      { id: 'norris',    label: 'Norris',     prob: 0.22 },
      { id: 'leclerc',   label: 'Leclerc',    prob: 0.17 },
      { id: 'hamilton',  label: 'Hamilton',   prob: 0.12 },
      { id: 'other',     label: 'Other',      prob: 0.18 },
    ],
    volume: 5600000, endDate: '2026-11-30', tags: ['TRENDING'], liquidity: 1400000, source: 'internal' },

  { id: 'sp4', category: 'sports', sub: 'UFC/MMA',    type: 'binary',
    question: 'Will Jon Jones fight again in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.47 }, { id: 'NO', label: 'NO', prob: 0.53 }],
    volume: 3100000, endDate: '2026-12-31', tags: [], liquidity: 780000, source: 'polymarket' },

  { id: 'sp5', category: 'sports', sub: 'Tennis',     type: 'multi',
    question: 'Who wins Wimbledon 2026 (Men\'s)?',
    outcomes: [
      { id: 'sinner',   label: 'Sinner',   prob: 0.28 },
      { id: 'alcaraz',  label: 'Alcaraz',  prob: 0.26 },
      { id: 'djokovic', label: 'Djokovic', prob: 0.19 },
      { id: 'other',    label: 'Other',    prob: 0.27 },
    ],
    volume: 4300000, endDate: '2026-07-12', tags: ['TRENDING'], liquidity: 1100000, source: 'polymarket' },

  // ── ELECTIONS ─────────────────────────────────────────────────────────
  { id: 'el1', category: 'elections', sub: 'US 2026',  type: 'binary',
    question: 'Will Republicans hold the House in November 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.58 }, { id: 'NO', label: 'NO', prob: 0.42 }],
    volume: 32000000, endDate: '2026-11-03', tags: ['HOT','TRENDING'], liquidity: 9800000, source: 'kalshi' },

  { id: 'el2', category: 'elections', sub: 'EU Elections', type: 'binary',
    question: 'Will a far-right party win a major EU election in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.64 }, { id: 'NO', label: 'NO', prob: 0.36 }],
    volume: 8900000, endDate: '2026-12-31', tags: ['TRENDING'], liquidity: 2400000, source: 'kalshi' },

  // ── POLITICS ──────────────────────────────────────────────────────────
  { id: 'po1', category: 'politics', sub: 'Trade Wars',type: 'binary',
    question: 'Will US–China tariffs exceed 50% by end of 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.42 }, { id: 'NO', label: 'NO', prob: 0.58 }],
    volume: 11200000, endDate: '2026-12-31', tags: ['HOT'], liquidity: 3100000, source: 'kalshi' },

  { id: 'po2', category: 'politics', sub: 'War & Conflict', type: 'binary',
    question: 'Will Ukraine–Russia ceasefire occur before July 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.31 }, { id: 'NO', label: 'NO', prob: 0.69 }],
    volume: 22000000, endDate: '2026-07-01', tags: ['TRENDING','AI PICK'], liquidity: 6700000, source: 'kalshi' },

  // ── ECONOMICS ─────────────────────────────────────────────────────────
  { id: 'ec1', category: 'economics', sub: 'Interest Rates', type: 'ladder',
    question: 'What will US Fed Funds Rate be on Dec 31 2026?',
    outcomes: [
      { id: 'above5',  label: 'Above 5%',   prob: 0.03 },
      { id: '4to5',    label: '4%–5%',      prob: 0.18 },
      { id: '3to4',    label: '3%–4%',      prob: 0.42 },
      { id: '2to3',    label: '2%–3%',      prob: 0.28 },
      { id: 'below2',  label: 'Below 2%',   prob: 0.09 },
    ],
    volume: 41000000, endDate: '2026-12-31', tags: ['HOT','TRENDING'], liquidity: 12400000, source: 'kalshi' },

  { id: 'ec2', category: 'economics', sub: 'CPI / Inflation', type: 'binary',
    question: 'Will US CPI fall below 2.5% in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.55 }, { id: 'NO', label: 'NO', prob: 0.45 }],
    volume: 19400000, endDate: '2026-12-31', tags: ['TRENDING'], liquidity: 5600000, source: 'kalshi' },

  { id: 'ec3', category: 'economics', sub: 'Recession',   type: 'binary',
    question: 'Will the US enter a recession in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.29 }, { id: 'NO', label: 'NO', prob: 0.71 }],
    volume: 28700000, endDate: '2026-12-31', tags: ['AI PICK','HOT'], liquidity: 8900000, source: 'kalshi' },

  // ── COMPANIES ─────────────────────────────────────────────────────────
  { id: 'co1', category: 'companies', sub: 'Nvidia',    type: 'binary',
    question: 'Will Nvidia reach $4T market cap in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.48 }, { id: 'NO', label: 'NO', prob: 0.52 }],
    volume: 8900000, endDate: '2026-12-31', tags: ['HOT'], liquidity: 2400000, source: 'polymarket' },

  { id: 'co2', category: 'companies', sub: 'Apple',     type: 'binary',
    question: 'Will Apple launch Apple Intelligence hardware by WWDC 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.79 }, { id: 'NO', label: 'NO', prob: 0.21 }],
    volume: 5400000, endDate: '2026-06-15', tags: ['AI PICK'], liquidity: 1500000, source: 'internal' },

  { id: 'co3', category: 'companies', sub: 'SpaceX',    type: 'binary',
    question: 'Will SpaceX Starship reach orbit with payload in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.81 }, { id: 'NO', label: 'NO', prob: 0.19 }],
    volume: 12100000, endDate: '2026-12-31', tags: ['HOT','AI PICK'], liquidity: 3800000, source: 'polymarket' },

  { id: 'co4', category: 'companies', sub: 'OpenAI',    type: 'binary',
    question: 'Will OpenAI IPO in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.36 }, { id: 'NO', label: 'NO', prob: 0.64 }],
    volume: 9800000, endDate: '2026-12-31', tags: ['HIGH PAYOUT','TRENDING'], liquidity: 2700000, source: 'polymarket' },

  // ── TECH & SCIENCE ─────────────────────────────────────────────────────
  { id: 'te1', category: 'tech', sub: 'AI',            type: 'binary',
    question: 'Will any AI model pass AGI benchmark by end 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.22 }, { id: 'NO', label: 'NO', prob: 0.78 }],
    volume: 14600000, endDate: '2026-12-31', tags: ['HIGH PAYOUT','HOT'], liquidity: 4200000, source: 'polymarket' },

  { id: 'te2', category: 'tech', sub: 'Space',         type: 'binary',
    question: 'Will any human mission land on the Moon in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.44 }, { id: 'NO', label: 'NO', prob: 0.56 }],
    volume: 7200000, endDate: '2026-12-31', tags: ['AI PICK'], liquidity: 1900000, source: 'internal' },

  { id: 'te3', category: 'tech', sub: 'Biotech',       type: 'binary',
    question: 'Will a CRISPR-based therapy receive FDA approval in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.58 }, { id: 'NO', label: 'NO', prob: 0.42 }],
    volume: 4300000, endDate: '2026-12-31', tags: ['TRENDING'], liquidity: 1100000, source: 'kalshi' },

  // ── CULTURE ─────────────────────────────────────────────────────────
  { id: 'cu1', category: 'culture', sub: 'Awards',     type: 'multi',
    question: 'Who wins Best Picture at 2026 Oscars?',
    outcomes: [
      { id: 'film1', label: 'The Brutalist',  prob: 0.31 },
      { id: 'film2', label: 'Conclave',       prob: 0.22 },
      { id: 'film3', label: 'Anora',          prob: 0.19 },
      { id: 'other', label: 'Other',          prob: 0.28 },
    ],
    volume: 3200000, endDate: '2026-03-30', tags: ['ENDING SOON','HOT'], liquidity: 890000, source: 'polymarket' },

  // ── CLIMATE ─────────────────────────────────────────────────────────
  { id: 'cl1', category: 'climate', sub: 'Carbon Targets', type: 'binary',
    question: 'Will global CO2 emissions peak in 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.33 }, { id: 'NO', label: 'NO', prob: 0.67 }],
    volume: 5100000, endDate: '2026-12-31', tags: ['AI PICK'], liquidity: 1400000, source: 'kalshi' },

  // ── GLOBAL ──────────────────────────────────────────────────────────
  { id: 'gl1', category: 'global', sub: 'Geopolitics',  type: 'binary',
    question: 'Will China conduct military exercises near Taiwan in Q2 2026?',
    outcomes: [{ id: 'YES', label: 'YES', prob: 0.55 }, { id: 'NO', label: 'NO', prob: 0.45 }],
    volume: 17800000, endDate: '2026-06-30', tags: ['TRENDING','HOT'], liquidity: 5200000, source: 'kalshi' },
];

// ─── Leaderboard ─────────────────────────────────────────────────────────
export const LEADERBOARD = [
  { rank: 1,  name: 'CryptoWhale99', avatar: '🐳', profit: 142800, winRate: 74, streak: 12, trades: 89,  roi: 284 },
  { rank: 2,  name: 'PredictKing',   avatar: '👑', profit: 98400,  winRate: 68, streak: 7,  trades: 145, roi: 196 },
  { rank: 3,  name: 'AlphaOracle',   avatar: '🔮', profit: 87200,  winRate: 71, streak: 9,  trades: 62,  roi: 347 },
  { rank: 4,  name: 'BullRunner88',  avatar: '🐂', profit: 64500,  winRate: 65, streak: 4,  trades: 201, roi: 128 },
  { rank: 5,  name: 'NightTrader',   avatar: '🌙', profit: 52100,  winRate: 63, streak: 6,  trades: 178, roi: 104 },
  { rank: 6,  name: 'SolQueen',      avatar: '⚡', profit: 44800,  winRate: 61, streak: 3,  trades: 93,  roi: 179 },
  { rank: 7,  name: 'MacroMaster',   avatar: '📈', profit: 38200,  winRate: 69, streak: 5,  trades: 54,  roi: 229 },
  { rank: 8,  name: 'DegenGod',      avatar: '💎', profit: 31400,  winRate: 58, streak: 2,  trades: 312, roi: 62  },
  { rank: 9,  name: 'SatoshiSeer',   avatar: '₿',  profit: 28900,  winRate: 66, streak: 8,  trades: 41,  roi: 289 },
  { rank: 10, name: 'QuantumBets',   avatar: '🤖', profit: 24600,  winRate: 72, streak: 11, trades: 29,  roi: 307 },
];

// ─── Social posts ─────────────────────────────────────────────────────────
export const SOCIAL_POSTS = [
  { id: 's1', user: 'CryptoWhale99', avatar: '🐳', market: 'Will BTC reach $100K?',         side: 'YES', amount: 5000,  payout: 6950,  likes: 142, comments: 23, time: '2m ago',  verified: true,  boost: true },
  { id: 's2', user: 'AlphaOracle',   avatar: '🔮', market: 'Will Fed cut rates in May?',     side: 'YES', amount: 2000,  payout: 3280,  likes: 87,  comments: 11, time: '8m ago',  verified: true,  boost: false },
  { id: 's3', user: 'BullRunner88',  avatar: '🐂', market: 'Will SOL outperform ETH?',       side: 'NO',  amount: 800,   payout: 1704,  likes: 34,  comments: 5,  time: '15m ago', verified: false, boost: false },
  { id: 's4', user: 'NightTrader',   avatar: '🌙', market: 'Will DOGE reach $1?',            side: 'YES', amount: 1500,  payout: 5550,  likes: 56,  comments: 8,  time: '31m ago', verified: false, boost: false },
  { id: 's5', user: 'SolQueen',      avatar: '⚡', market: 'Ukraine ceasefire before July?', side: 'NO',  amount: 3000,  payout: 4350,  likes: 98,  comments: 17, time: '1h ago',  verified: true,  boost: true },
  { id: 's6', user: 'QuantumBets',   avatar: '🤖', market: 'Will AGI benchmark be passed?',  side: 'YES', amount: 10000, payout: 45000, likes: 234, comments: 41, time: '2h ago',  verified: true,  boost: true },
];

// ─── Events ──────────────────────────────────────────────────────────────
export const EVENTS = [
  { id: 'e1', type: 'tournament', title: 'March Madness Predictor',  emoji: '🏆', description: 'Top predictor wins 500 USDT. Rank by profit.', reward: '500 USDT', ends: '2026-03-31', participants: 1842, myRank: null, rules: ['Min 3 predictions','All categories','Ranked by net profit'] },
  { id: 'e2', type: 'daily',      title: 'Daily Crypto Challenge',   emoji: '⚡', description: 'Predict 3 crypto markets. Win 2x payout boost.', reward: '2x Boost', ends: '2026-03-23', participants: 4210, myRank: 87, rules: ['3 crypto markets','All must be correct','Bonus on settlement'] },
  { id: 'e3', type: 'weekly',     title: 'Win Rate Warriors',        emoji: '🎯', description: 'Highest win rate over 5+ trades this week.', reward: '250 USDT + Badge', ends: '2026-03-28', participants: 921, myRank: 34, rules: ['Min 5 trades','Win rate ranks','Ties by volume'] },
  { id: 'e4', type: 'special',    title: 'AI vs Human Showdown',     emoji: '🤖', description: 'Beat the AI Oracle on 10 specific markets.', reward: '1000 USDT Pool', ends: '2026-04-05', participants: 3301, myRank: null, rules: ['10 specific markets','AI baseline daily','Top 3 win prizes'] },
];