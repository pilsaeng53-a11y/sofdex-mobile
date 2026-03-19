/**
 * SOFDex RWA Data — Expanded Premium Asset Registry
 * Landmark Real Estate, Commodities, Stocks/ETFs, Yield, Art/Collectibles, Alternative Assets
 */

function mkSeries(seed, startPrice, endPrice) {
  let s = Math.abs(seed) || 12345;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const N = 36;
  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const trend = startPrice + (endPrice - startPrice) * t;
    const noise = (rand() - 0.5) * startPrice * 0.032;
    const d = new Date(2023, 2, 1);
    d.setMonth(d.getMonth() + i);
    points.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      price: Math.max(Math.round((trend + noise) * 100) / 100, startPrice * 0.78),
    });
  }
  points[N].price = endPrice;
  return points;
}

// ─── REAL ESTATE ─────────────────────────────────────────────────────────────
export const LANDMARK_RE = [
  {
    symbol: 'RE-MHT-1',
    name: 'Manhattan Office Tower',
    shortName: 'Manhattan Office',
    city: 'New York', country: 'United States', flag: '🇺🇸',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800&q=80',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    tokenPrice: 247.50, tokenSupply: '10,000,000',
    change24h: 1.24, yield: 6.8, totalValue: 2480000000, volume24h: 4200000,
    description: 'Fractional ownership in a 1.2M sq ft Class A office tower in Midtown Manhattan. Near-100% occupancy with Fortune 500 tenants on long-term leases. Monthly distributions paid to token holders proportional to net rental income.',
    location: 'Midtown Manhattan between Fifth and Sixth Avenue near 50th Street. Adjacent to Rockefeller Center and Grand Central Terminal.',
    merits: ['Midtown Manhattan Trophy Asset', '15-year weighted average lease term', 'Fortune 500 anchor tenants', 'LEED Platinum Certified', 'Annual rental escalations 2–3%'],
    highlights: ['$2.5B total asset valuation', '6.8% estimated annual yield', '100% occupancy rate', 'Monthly yield distributions', 'Institutional grade custodian'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: NCREIF NPI New York Office Price Index.',
    region: 'Americas',
    series: mkSeries(1001, 210.00, 247.50),
  },
  {
    symbol: 'RE-DXB-1',
    name: 'Dubai Marina Tower',
    shortName: 'Dubai Marina Tower',
    city: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    coordinates: { lat: 25.0819, lng: 55.1367 },
    tokenPrice: 183.20, tokenSupply: '8,000,000',
    change24h: 2.15, yield: 9.2, totalValue: 1464000000, volume24h: 2800000,
    description: 'Premium mixed-use tower in Dubai Marina with luxury residential units and commercial space. Zero capital gains and income tax jurisdiction.',
    location: 'Dubai Marina waterfront district. Direct access to The Walk promenade. 15 minutes from Dubai International Airport.',
    merits: ['Tax-free waterfront jurisdiction', 'High-yield residential & commercial mix', 'UAE Golden Visa eligible', '95% occupancy rate', 'Tourism-driven rental premium'],
    highlights: ['9.2% estimated annual yield', 'Tax-free jurisdiction', 'Waterfront prime location', 'Quarterly yield distributions'],
    verified: true, audited: true, institutional: false,
    benchmarkNote: 'Benchmark: CBRE Dubai Residential & Commercial Price Index.',
    region: 'Middle East',
    series: mkSeries(2002, 145.00, 183.20),
  },
  {
    symbol: 'RE-LDN-1',
    name: 'London Mayfair Building',
    shortName: 'Mayfair Premium',
    city: 'London', country: 'United Kingdom', flag: '🇬🇧',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    coordinates: { lat: 51.5074, lng: -0.1515 },
    tokenPrice: 312.80, tokenSupply: '6,000,000',
    change24h: 0.87, yield: 4.6, totalValue: 1876800000, volume24h: 1900000,
    description: 'Grade A commercial building in London\'s Mayfair district. Tenanted by global financial institutions and luxury brands on long-term leases.',
    location: 'Mayfair, London W1. Bordered by Hyde Park, Berkeley Square, and Park Lane.',
    merits: ['Mayfair Grade A trophy asset', 'Global financial sector tenants', 'Historic scarcity value', 'GBP-denominated yield hedge', 'BREEAM Excellent rated'],
    highlights: ['£1.5B total asset valuation', '4.6% annual yield in GBP', 'Grade A certified', 'Bi-annual yield distributions', 'FCA regulated structure'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: MSCI/IPD UK Annual Property Index — London West End offices.',
    region: 'Europe',
    series: mkSeries(3003, 285.00, 312.80),
  },
  {
    symbol: 'RE-TYO-1',
    name: 'Tokyo Ginza Retail',
    shortName: 'Ginza Premium',
    city: 'Tokyo', country: 'Japan', flag: '🇯🇵',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    coordinates: { lat: 35.6717, lng: 139.7640 },
    tokenPrice: 156.40, tokenSupply: '9,000,000',
    change24h: 3.45, yield: 3.8, totalValue: 1407600000, volume24h: 1600000,
    description: 'Premium retail and office tower on Ginza\'s Chuo-dori Avenue — one of the world\'s most expensive commercial streets, tenanted by global luxury brands.',
    location: 'Chuo-dori Avenue, Ginza, Tokyo. Steps from Ginza Station. Highest land values in Japan.',
    merits: ['Ginza Chuo-dori flagship location', 'Global luxury brand tenants', 'Highest land value in Japan', 'Earthquake-resistant certified', 'JPY stable yield'],
    highlights: ['¥210B total valuation', '3.8% annual yield (JPY)', 'World luxury retail street', 'Annual yield distributions', 'J-REIT compatible'],
    verified: true, audited: false, institutional: true,
    benchmarkNote: 'Benchmark: CBRE Japan Retail Cap Rate Index.',
    region: 'Asia Pacific',
    series: mkSeries(5005, 130.00, 156.40),
  },
  {
    symbol: 'RE-SGP-1',
    name: 'Singapore Marina Bay Tower',
    shortName: 'Marina Bay Tower',
    city: 'Singapore', country: 'Singapore', flag: '🇸🇬',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    coordinates: { lat: 1.2847, lng: 103.8610 },
    tokenPrice: 198.60, tokenSupply: '7,500,000',
    change24h: 1.67, yield: 5.4, totalValue: 1489500000, volume24h: 2300000,
    description: 'Grade AAA commercial tower within Singapore\'s Marina Bay Financial Centre — premier financial district of Southeast Asia.',
    location: 'Marina Bay Financial Centre, Singapore CBD. Adjacent to Marina Bay Sands. MRT connected.',
    merits: ['Singapore AAA financial district', 'Regional HQ anchor tenants', 'AAA sovereign political stability', 'Asia-Pacific gateway', 'MAS regulated structure'],
    highlights: ['SGD $2B total valuation', '5.4% annual yield', 'Waterfront CBD trophy', 'Quarterly distributions', 'MAS compliant'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: JLL Singapore Grade A CBD Office Index.',
    region: 'Asia Pacific',
    series: mkSeries(4004, 172.00, 198.60),
  },
  {
    symbol: 'RE-SEL-1',
    name: 'Seoul Gangnam Office',
    shortName: 'Gangnam Premium',
    city: 'Seoul', country: 'South Korea', flag: '🇰🇷',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80',
    coordinates: { lat: 37.4979, lng: 127.0276 },
    tokenPrice: 142.80, tokenSupply: '8,500,000',
    change24h: 2.34, yield: 5.1, totalValue: 1213800000, volume24h: 1800000,
    description: 'Premium Grade A office tower in Seoul\'s Gangnam district — the most prestigious commercial address in Korea. Home to major chaebols, tech firms, and financial institutions.',
    location: 'Teheran-ro, Gangnam-gu, Seoul. Korea\'s Silicon Valley strip with highest commercial rents in the nation.',
    merits: ['Gangnam Teheran-ro prestige address', 'Chaebol and tech anchor tenants', 'South Korea AAA sovereign backing', 'Grade A certified', 'KRW yield hedge'],
    highlights: ['KRW 1.6T total valuation', '5.1% annual yield', 'Gangnam prime district', 'Quarterly distributions', 'FSC regulated'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: JLL South Korea Grade A Office Index.',
    region: 'Asia Pacific',
    series: mkSeries(6006, 118.00, 142.80),
  },
  {
    symbol: 'RE-PAR-1',
    name: 'Paris Champs-Élysées Retail',
    shortName: 'Champs-Élysées',
    city: 'Paris', country: 'France', flag: '🇫🇷',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    coordinates: { lat: 48.8698, lng: 2.3079 },
    tokenPrice: 289.40, tokenSupply: '5,500,000',
    change24h: 1.12, yield: 3.9, totalValue: 1591700000, volume24h: 1400000,
    description: 'Premium retail flagship on the Champs-Élysées — the world\'s most recognized luxury shopping avenue. Long-term leases with flagship luxury and lifestyle brands.',
    location: 'Avenue des Champs-Élysées, 8th Arrondissement, Paris. One of the highest retail rents in the world.',
    merits: ['World\'s most iconic retail avenue', 'Global luxury brand flagship tenants', 'EUR-denominated yield', 'Historic scarcity — no new supply possible', 'AMF regulated structure'],
    highlights: ['€1.4B total valuation', '3.9% annual yield (EUR)', 'Champs-Élysées flagship location', 'Bi-annual distributions', 'French SCPI structure'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: CBRE France Retail Cap Rate Index — Paris Prime.',
    region: 'Europe',
    series: mkSeries(7007, 252.00, 289.40),
  },
  {
    symbol: 'RE-BVH-1',
    name: 'Beverly Hills Property',
    shortName: 'Beverly Hills Estate',
    city: 'Beverly Hills', country: 'United States', flag: '🇺🇸',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    coordinates: { lat: 34.0736, lng: -118.4004 },
    tokenPrice: 524.60, tokenSupply: '2,000,000',
    change24h: 0.94, yield: 2.8, totalValue: 1049200000, volume24h: 980000,
    description: 'Ultra-luxury residential and mixed-use estate in Beverly Hills — the world\'s most exclusive residential address. Rare tokenized fractional ownership of prime California trophy real estate.',
    location: 'North Beverly Hills, Los Angeles. Adjacent to Rodeo Drive and the Golden Triangle. One of the highest per-square-foot land values in the USA.',
    merits: ['Beverly Hills trophy address', 'California Prop 13 tax protection', 'Luxury rental premium', 'Global UHNW demand', 'Scarcest residential micro-market globally'],
    highlights: ['$1.05B total valuation', '2.8% annual yield', 'Beverly Hills 90210 prestige', 'Annual distributions', 'SEC compliant structure'],
    verified: true, audited: true, institutional: false,
    benchmarkNote: 'Benchmark: Case-Shiller LA County HPI — Beverly Hills premium submarket.',
    region: 'Americas',
    series: mkSeries(8008, 468.00, 524.60),
  },
];

// ─── COMMODITIES ─────────────────────────────────────────────────────────────
export const COMMODITY_MARKETS = [
  { symbol: 'GOLD-T',    name: 'Tokenized Gold',       price: 3300.00, change:  0.87, volume: '124M',  mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'OANDA:XAUUSD', icon: '🥇', tag: 'Safe Haven' },
  { symbol: 'SILVER-T',  name: 'Tokenized Silver',     price:   33.00, change:  0.52, volume: '45M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'OANDA:XAGUSD', icon: '🥈', tag: 'Commodity' },
  { symbol: 'CRUDE-T',   name: 'WTI Crude Oil',        price:   67.00, change: -1.23, volume: '67M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'NYMEX:CL1!',  icon: '🛢️', tag: 'Energy' },
  { symbol: 'BRENT-T',   name: 'Brent Crude Oil',      price:   71.20, change: -0.94, volume: '52M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'NYMEX:BB1!',  icon: '🛢️', tag: 'Energy' },
  { symbol: 'NATGAS-T',  name: 'Natural Gas',           price:    2.84, change:  3.21, volume: '38M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'NYMEX:NG1!',  icon: '⚡', tag: 'Energy' },
  { symbol: 'COPPER-T',  name: 'Copper Futures',        price:    4.42, change:  1.45, volume: '29M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'COMEX:HG1!',  icon: '🔶', tag: 'Industrial' },
  { symbol: 'LITHIUM-T', name: 'Lithium Token',         price:   14.80, change: -2.34, volume: '18M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: '',            icon: '🔋', tag: 'Critical Metals' },
  { symbol: 'URANIUM-T', name: 'Uranium Token',         price:   87.50, change:  4.12, volume: '12M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: '',            icon: '☢️', tag: 'Critical Metals' },
  { symbol: 'WHEAT-T',   name: 'Chicago Wheat',         price:    5.84, change:  0.67, volume: '21M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'CBOT:ZW1!',  icon: '🌾', tag: 'Agriculture' },
  { symbol: 'PLAT-T',   name: 'Platinum Token',        price: 1024.00, change:  0.34, volume: '16M',   mcap: '—',    category: 'rwa', yield: '0.0%', type: 'Commodity', tvSymbol: 'TVC:PLATINUM',icon: '💍', tag: 'Precious Metal' },
];

// ─── STOCKS & ETFs ────────────────────────────────────────────────────────────
export const STOCK_MARKETS = [
  // Blue-chip Tech
  { symbol: 'AAPLx',  name: 'Apple Inc.',           price: 227.50, change:  1.23, volume: '156M', mcap: '3.5T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:AAPL',  tag: 'Mega Cap' },
  { symbol: 'NVDAx',  name: 'NVIDIA Corp.',          price: 892.40, change:  4.56, volume: '189M', mcap: '2.2T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:NVDA',  tag: 'AI Leader' },
  { symbol: 'TSLAx',  name: 'Tesla Inc.',            price: 248.90, change:  3.45, volume: '234M', mcap: '792B',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:TSLA',  tag: 'EV Leader' },
  { symbol: 'AMZNx',  name: 'Amazon.com',            price: 198.40, change:  0.67, volume: '89M',  mcap: '2.1T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:AMZN',  tag: 'Mega Cap' },
  { symbol: 'MSFTx',  name: 'Microsoft Corp.',       price: 445.20, change:  0.89, volume: '112M', mcap: '3.3T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:MSFT',  tag: 'AI Leader' },
  { symbol: 'METAx',  name: 'Meta Platforms',        price: 582.30, change:  2.14, volume: '98M',  mcap: '1.5T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:META',  tag: 'Social' },
  { symbol: 'GOOGLx', name: 'Alphabet Inc.',         price: 175.20, change: -0.45, volume: '78M',  mcap: '2.2T',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:GOOGL', tag: 'Mega Cap' },
  { symbol: 'NFLXx',  name: 'Netflix Inc.',          price: 985.60, change:  1.78, volume: '67M',  mcap: '424B',  category: 'tradfi', type: 'xStock', sector: 'Tech',     tvSymbol: 'NASDAQ:NFLX',  tag: 'Streaming' },
  { symbol: 'BLKx',   name: 'BlackRock Inc.',        price: 980.40, change:  0.56, volume: '34M',  mcap: '148B',  category: 'tradfi', type: 'xStock', sector: 'Finance',  tvSymbol: 'NYSE:BLK',     tag: 'Asset Mgmt' },
  // Finance
  { symbol: 'JPMx',   name: 'JPMorgan Chase',        price: 218.40, change:  0.34, volume: '56M',  mcap: '628B',  category: 'tradfi', type: 'xStock', sector: 'Finance',  tvSymbol: 'NYSE:JPM',     tag: 'Banking' },
  { symbol: 'GSx',    name: 'Goldman Sachs',         price: 512.30, change:  1.12, volume: '34M',  mcap: '171B',  category: 'tradfi', type: 'xStock', sector: 'Finance',  tvSymbol: 'NYSE:GS',      tag: 'Banking' },
  { symbol: 'BRKx',   name: 'Berkshire Hathaway',   price: 449.80, change:  0.45, volume: '28M',  mcap: '984B',  category: 'tradfi', type: 'xStock', sector: 'Finance',  tvSymbol: 'NYSE:BRK.B',   tag: 'Conglomerate' },
];

// ─── ETFs ─────────────────────────────────────────────────────────────────────
export const ETF_MARKETS = [
  { symbol: 'SPYx',  name: 'SPDR S&P 500 ETF',     price: 584.20, change:  0.45, volume: '456M', mcap: '18.4B', category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:SPY',    tag: 'Broad Market' },
  { symbol: 'QQQx',  name: 'Invesco Nasdaq-100',    price: 495.80, change:  0.78, volume: '312M', mcap: '14.2B', category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'NASDAQ:QQQ',  tag: 'Tech Heavy' },
  { symbol: 'ARKKx', name: 'ARK Innovation ETF',    price:  52.40, change:  3.21, volume: '89M',  mcap: '6.4B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:ARKK',   tag: 'Disruptive' },
  { symbol: 'VTIx',  name: 'Vanguard Total Market', price: 275.60, change:  0.56, volume: '178M', mcap: '8.4B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:VTI',    tag: 'Diversified' },
  { symbol: 'DIAx',  name: 'Dow Jones ETF',         price: 432.40, change:  0.34, volume: '134M', mcap: '7.2B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:DIA',    tag: 'Blue Chip' },
  { symbol: 'GLDx',  name: 'SPDR Gold Shares',      price: 232.40, change:  0.34, volume: '234M', mcap: '9.8B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:GLD',    tag: 'Commodity' },
  { symbol: 'SLVx',  name: 'iShares Silver Trust',  price:  27.80, change:  0.56, volume: '112M', mcap: '3.4B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:SLV',    tag: 'Commodity' },
  { symbol: 'IWMx',  name: 'Russell 2000 ETF',      price: 218.40, change: -0.23, volume: '89M',  mcap: '4.2B',  category: 'tradfi', type: 'xETF', sector: 'ETF', tvSymbol: 'AMEX:IWM',    tag: 'Small Cap' },
];

// ─── YIELD INSTRUMENTS ────────────────────────────────────────────────────────
export const YIELD_MARKETS = [
  { symbol: 'TBILL-US',  name: 'US Treasury Bill (3M)',      yield: '5.28%', price: 99.68,  change:  0.01, volume: '892M', type: 'Yield', subcategory: 'Government Bond',   risk: 'Very Low',   icon: '🏛️', currency: 'USD', rating: 'AAA', tag: 'Safe Haven' },
  { symbol: 'TNOTE-10',  name: 'US 10Y Treasury Note',       yield: '4.25%', price: 96.40,  change:  0.02, volume: '678M', type: 'Yield', subcategory: 'Government Bond',   risk: 'Very Low',   icon: '🏛️', currency: 'USD', rating: 'AAA', tag: 'Safe Haven' },
  { symbol: 'CORP-IG',   name: 'Investment Grade Corp Bond', yield: '5.85%', price: 98.20,  change:  0.03, volume: '345M', type: 'Yield', subcategory: 'Corporate Bond',    risk: 'Low',        icon: '🏢', currency: 'USD', rating: 'A',   tag: 'Income' },
  { symbol: 'CORP-HY',   name: 'High Yield Corp Bond',       yield: '8.40%', price: 94.60,  change: -0.08, volume: '234M', type: 'Yield', subcategory: 'Corporate Bond',    risk: 'Medium',     icon: '📈', currency: 'USD', rating: 'BB',  tag: 'High Yield' },
  { symbol: 'REPOOL-US', name: 'US Real Estate Rental Pool', yield: '7.80%', price: 52.40,  change:  1.24, volume: '34M',  type: 'Yield', subcategory: 'RE Rental Pool',    risk: 'Medium',     icon: '🏘️', currency: 'USD', rating: '—',   tag: 'Real Estate' },
  { symbol: 'REPOOL-DX', name: 'Dubai RE Rental Pool',       yield: '9.20%', price: 124.50, change:  2.15, volume: '18M',  type: 'Yield', subcategory: 'RE Rental Pool',    risk: 'Medium',     icon: '🏙️', currency: 'AED', rating: '—',   tag: 'Real Estate' },
  { symbol: 'USDY-T',    name: 'Stablecoin Yield Pool (USDC)',yield: '6.12%', price: 1.00,  change:  0.00, volume: '1.2B', type: 'Yield', subcategory: 'Stablecoin Yield',  risk: 'Low',        icon: '💰', currency: 'USD', rating: '—',   tag: 'DeFi Yield' },
  { symbol: 'USDT-YLD',  name: 'Stablecoin Yield Pool (USDT)',yield: '5.94%', price: 1.00,  change:  0.00, volume: '980M', type: 'Yield', subcategory: 'Stablecoin Yield',  risk: 'Low',        icon: '💵', currency: 'USD', rating: '—',   tag: 'DeFi Yield' },
  { symbol: 'MUNI-T',    name: 'Municipal Bond Token',       yield: '3.80%', price: 101.20, change:  0.01, volume: '89M',  type: 'Yield', subcategory: 'Municipal Bond',    risk: 'Very Low',   icon: '🌆', currency: 'USD', rating: 'AA',  tag: 'Tax-Exempt' },
  { symbol: 'EURO-B',    name: 'EUR Government Bond',        yield: '3.20%', price: 98.80,  change:  0.02, volume: '156M', type: 'Yield', subcategory: 'Government Bond',   risk: 'Very Low',   icon: '🇪🇺', currency: 'EUR', rating: 'AA+', tag: 'Safe Haven' },
];

// ─── ART & COLLECTIBLES ───────────────────────────────────────────────────────
export const ART_MARKETS = [
  { symbol: 'ART-PICA',  name: 'Picasso — Blue Period Masterwork',  price: 8400.00,  change:  1.24, volume: '18M',  mcap: '840M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Pablo Picasso',       image: 'https://images.unsplash.com/photo-1578926078693-24a4ed21b699?w=400&q=80', tag: 'Blue Chip Art', verified: true },
  { symbol: 'ART-BANK',  name: 'Banksy — Original Canvas',          price: 2840.00,  change:  3.45, volume: '12M',  mcap: '284M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Banksy',              image: 'https://images.unsplash.com/photo-1569783721474-b20a8c648f22?w=400&q=80', tag: 'Street Art',   verified: true },
  { symbol: 'ART-BEEP',  name: 'Beeple — Digital NFT Masterwork',   price: 6900.00,  change:  8.21, volume: '45M',  mcap: '690M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Beeple (Mike Winkelmann)', image: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=400&q=80', tag: 'Digital Art', verified: false },
  { symbol: 'ART-WAR',   name: 'Warhol Portfolio Token',            price: 2850.00,  change:  1.87, volume: '8M',   mcap: '142M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Andy Warhol',         image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=400&q=80', tag: 'Pop Art',      verified: true },
  { symbol: 'ART-BASQ',  name: 'Basquiat Collection Token',         price: 4280.00,  change:  2.14, volume: '12M',  mcap: '214M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Jean-Michel Basquiat', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', tag: 'Neo-Expressionism', verified: true },
  { symbol: 'WATCH-PP',  name: 'Patek Philippe Vault',              price: 34500.00, change:  0.23, volume: '6M',   mcap: '345M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Fine Timepieces',     image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80', tag: 'Luxury Watch', verified: true },
  { symbol: 'WATCH-RM',  name: 'Richard Mille Collection',          price: 89000.00, change:  0.56, volume: '4M',   mcap: '890M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Fine Timepieces',     image: 'https://images.unsplash.com/photo-1548171568-b1c4af48a10e?w=400&q=80', tag: 'Luxury Watch', verified: true },
  { symbol: 'CAR-FERR',  name: 'Ferrari 250 GTO Token',             price: 124000.00,change:  1.34, volume: '3M',   mcap: '248M', category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Classic Cars',        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80', tag: 'Classic Car',  verified: true },
  { symbol: 'WINE-BDX',  name: 'Bordeaux Grand Cru Fund',           price: 1240.00,  change:  0.67, volume: '3M',   mcap: '62M',  category: 'rwa', yield: '0.0%', type: 'Art / Collectibles', artist: 'Fine Wine',           image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', tag: 'Fine Wine',    verified: false },
];

// ─── ALTERNATIVE ASSETS ───────────────────────────────────────────────────────
export const ALT_MARKETS = [
  { symbol: 'MUSIC-EMI', name: 'EMI Catalog Royalties',       price:  840.00, change:  2.34, volume: '12M',  mcap: '84M',  category: 'rwa', yield: '8.4%', type: 'Alternative', subcategory: 'Music Royalties', icon: '🎵', tag: 'Royalty Income',  description: 'Fractional ownership in EMI Music publishing catalog — 1.4M+ songs with evergreen royalty streams.' },
  { symbol: 'MUSIC-HIT', name: 'Hip-Hop Hits Royalty Pool',   price:  420.00, change:  4.12, volume: '8M',   mcap: '42M',  category: 'rwa', yield: '7.2%', type: 'Alternative', subcategory: 'Music Royalties', icon: '🎤', tag: 'Royalty Income',  description: 'Curated portfolio of top-charting hip-hop and R&B streaming royalties with growing digital revenue.' },
  { symbol: 'SPORT-NBA', name: 'NBA Player Contract Pool',    price: 1200.00, change:  1.45, volume: '18M',  mcap: '120M', category: 'rwa', yield: '9.8%', type: 'Alternative', subcategory: 'Sports Contracts',icon: '🏀', tag: 'Sports Income',   description: 'Tokenized pool of NBA player contract receivables with structured yield payments and performance bonuses.' },
  { symbol: 'SPORT-EPL', name: 'Premier League Revenue Share', price:  680.00, change:  0.89, volume: '9M',   mcap: '68M',  category: 'rwa', yield: '6.5%', type: 'Alternative', subcategory: 'Sports Contracts',icon: '⚽', tag: 'Sports Income',   description: 'Revenue sharing tokens from EPL broadcasting rights and match-day income from top-tier clubs.' },
  { symbol: 'FILM-HOLL', name: 'Hollywood Film Revenue Pool', price:  560.00, change:  3.21, volume: '7M',   mcap: '56M',  category: 'rwa', yield: '12.4%',type: 'Alternative', subcategory: 'Film Revenue',    icon: '🎬', tag: 'Entertainment',   description: 'Pre-production and box office revenue participation in top-tier Hollywood franchise films.' },
  { symbol: 'GAME-EPIC', name: 'Gaming IP Revenue Token',     price:  340.00, change:  6.78, volume: '24M',  mcap: '34M',  category: 'rwa', yield: '14.2%',type: 'Alternative', subcategory: 'Gaming Assets',   icon: '🎮', tag: 'Digital Revenue',  description: 'Revenue participation in gaming IP licensing, in-game asset sales, and cross-media franchise deals.' },
  { symbol: 'DOMAIN-TK', name: 'Premium Domain Portfolio',    price:  890.00, change:  1.12, volume: '4M',   mcap: '89M',  category: 'rwa', yield: '5.6%', type: 'Alternative', subcategory: 'Domain Names',    icon: '🌐', tag: 'Digital Asset',   description: 'Portfolio of 50+ premium generic TLD domains with lease income, development options, and auction upside.' },
  { symbol: 'LUX-HERM',  name: 'Hermès Collectibles Fund',    price: 4200.00, change:  0.67, volume: '6M',   mcap: '420M', category: 'rwa', yield: '4.8%', type: 'Alternative', subcategory: 'Luxury Goods',    icon: '👜', tag: 'Luxury',           description: 'Authenticated Hermès Birkin and Kelly handbag vault with auction-verified valuations and resale upside.' },
  { symbol: 'LUX-DIMD',  name: 'Diamond & Gem Token',         price: 2800.00, change:  0.34, volume: '5M',   mcap: '280M', category: 'rwa', yield: '3.2%', type: 'Alternative', subcategory: 'Luxury Goods',    icon: '💎', tag: 'Luxury',           description: 'Certified D-IF grade diamonds held in Antwerp vault with GIA certification and insurance.' },
];

// ─── TRENDING RWA ─────────────────────────────────────────────────────────────
export const TRENDING_RWA = [
  { ...LANDMARK_RE.find(a => a.symbol === 'RE-DXB-1'), trendTag: '🔥 High Demand',   trendReason: 'Dubai golden visa demand surging' },
  { symbol: 'URANIUM-T',  name: 'Uranium Token',        price: 87.50,  change: 4.12, type: 'Commodity',   trendTag: '⚡ Nuclear Rally',   trendReason: 'Energy policy tailwind, AI power demand' },
  { symbol: 'NVDAx',      name: 'NVIDIA Corp.',         price: 892.40, change: 4.56, type: 'xStock',      trendTag: '🤖 AI Leader',       trendReason: 'H100 demand record, data center supercycle' },
  { symbol: 'ART-BEEP',   name: 'Beeple NFT Masterwork',price: 6900.00,change: 8.21, type: 'Art',         trendTag: '🎨 NFT Revival',     trendReason: 'Beeple auction record broken, collector FOMO' },
  { symbol: 'GAME-EPIC',  name: 'Gaming IP Token',      price: 340.00, change: 6.78, type: 'Alternative', trendTag: '🎮 Gaming Surge',    trendReason: 'Fortnite revenues exceed $5B milestone' },
  { ...LANDMARK_RE.find(a => a.symbol === 'RE-SEL-1'), trendTag: '📈 Strong Narrative', trendReason: 'K-economy expansion + tech corridor growth' },
  { symbol: 'LITHIUM-T',  name: 'Lithium Token',        price: 14.80,  change: -2.34,type: 'Commodity',   trendTag: '🔋 EV Critical',     trendReason: 'EV battery supply crunch intensifying' },
  { symbol: 'CORP-HY',    name: 'High Yield Bond',      price: 94.60,  change: -0.08,type: 'Yield',       trendTag: '💸 High Income',     trendReason: '8.4% yield attracting rotation from equity' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getPropertyBySymbol(symbol) {
  return LANDMARK_RE.find(p => p.symbol === symbol) || null;
}

export function formatAssetValue(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}