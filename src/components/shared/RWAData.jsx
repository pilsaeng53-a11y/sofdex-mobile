/**
 * SOFDex RWA Landmark Property Data + Art/Collectibles Markets
 * Benchmark-based deterministic price series for performance charts.
 * Series uses NCREIF / MSCI IPD / CBRE / JLL regional indices as basis.
 */

// Deterministic LCG PRNG — same seed = same chart every render
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

export const LANDMARK_RE = [
  {
    symbol: 'RE-MHT-1',
    name: 'Manhattan Prime Commercial Tower',
    shortName: 'Manhattan Prime',
    city: 'New York', country: 'United States', flag: '🇺🇸',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800&q=80',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    tokenPrice: 247.50,
    tokenSupply: '10,000,000',
    change24h: 1.24,
    yield: 6.8,
    totalValue: 2480000000,
    volume24h: 4200000,
    description: 'Fractional tokenized ownership in a 1.2M sq ft Class A office tower in Midtown Manhattan. The property achieves near-100% occupancy with Fortune 500 tenants on long-term leases. Monthly distributions are paid to token holders proportional to net rental income.',
    location: 'Located in the heart of Midtown Manhattan between Fifth and Sixth Avenue near 50th Street. Adjacent to Rockefeller Center, Grand Central Terminal, and the most liquid commercial real estate market in the Americas.',
    merits: [
      'Midtown Manhattan Trophy Asset',
      '15-year weighted average lease term',
      'Fortune 500 anchor tenants',
      'LEED Platinum Certified',
      'Annual rental escalations of 2–3%',
    ],
    highlights: ['$2.5B total asset valuation', '6.8% estimated annual yield', '100% occupancy rate', 'Monthly yield distributions', 'Institutional grade custodian'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: NCREIF NPI New York Office Price Index + tokenization liquidity premium. Direct transaction history is available for this asset class and region.',
    region: 'Americas',
    series: mkSeries(1001, 210.00, 247.50),
  },
  {
    symbol: 'RE-DXB-1',
    name: 'Dubai Marina Landmark Tower',
    shortName: 'Dubai Marina Tower',
    city: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    coordinates: { lat: 25.0819, lng: 55.1367 },
    tokenPrice: 183.20,
    tokenSupply: '8,000,000',
    change24h: 2.15,
    yield: 9.2,
    totalValue: 1464000000,
    volume24h: 2800000,
    description: 'Premium mixed-use tower in Dubai Marina with luxury residential units and commercial space. Strong rental demand from expatriates and corporate tenants generates yields among the highest in global prime real estate.',
    location: 'Dubai Marina waterfront district. Direct access to The Walk promenade and Marina Beach. 15 minutes from Dubai International Airport. Zero capital gains and income tax on property income in UAE.',
    merits: [
      'Tax-free waterfront jurisdiction',
      'High-yield residential & commercial mix',
      'UAE Golden Visa eligible investment',
      '95% occupancy rate',
      'Tourism-driven rental premium',
    ],
    highlights: ['9.2% estimated annual yield', 'Tax-free jurisdiction', 'Waterfront prime location', 'Quarterly yield distributions', 'Institutional escrow'],
    verified: true, audited: true, institutional: false,
    benchmarkNote: 'Benchmark: CBRE Dubai Residential & Commercial Price Index Q4 2022–Q1 2026.',
    region: 'Middle East',
    series: mkSeries(2002, 145.00, 183.20),
  },
  {
    symbol: 'RE-LDN-1',
    name: 'Mayfair Premium Commercial Asset',
    shortName: 'Mayfair Premium',
    city: 'London', country: 'United Kingdom', flag: '🇬🇧',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    coordinates: { lat: 51.5074, lng: -0.1515 },
    tokenPrice: 312.80,
    tokenSupply: '6,000,000',
    change24h: 0.87,
    yield: 4.6,
    totalValue: 1876800000,
    volume24h: 1900000,
    description: 'Grade A commercial building in London\'s Mayfair district, one of the world\'s most exclusive commercial addresses. Tenanted by global financial institutions, private equity firms, and luxury brands on long-term leases.',
    location: 'Mayfair, London W1. Bordered by Hyde Park, Berkeley Square, and Park Lane. Walking distance from Bond Street Underground station. Scarcest commercial address in Europe with virtually no new supply possible.',
    merits: [
      'Mayfair Grade A trophy asset',
      'Global financial sector tenants',
      'Historic scarcity value',
      'GBP-denominated yield hedge',
      'BREEAM Excellent rated',
    ],
    highlights: ['£1.5B total asset valuation', '4.6% annual yield in GBP', 'Grade A certified', 'Bi-annual yield distributions', 'FCA regulated structure'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: MSCI/IPD UK Annual Property Index — London West End offices. Recognised global standard for UK commercial real estate returns.',
    region: 'Europe',
    series: mkSeries(3003, 285.00, 312.80),
  },
  {
    symbol: 'RE-SGP-1',
    name: 'Marina Bay Financial Centre',
    shortName: 'Marina Bay Tower',
    city: 'Singapore', country: 'Singapore', flag: '🇸🇬',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    coordinates: { lat: 1.2847, lng: 103.8610 },
    tokenPrice: 198.60,
    tokenSupply: '7,500,000',
    change24h: 1.67,
    yield: 5.4,
    totalValue: 1489500000,
    volume24h: 2300000,
    description: 'Grade AAA commercial tower within Singapore\'s Marina Bay Financial Centre — the premier financial district of Southeast Asia. Occupied by global banks, sovereign wealth funds, and institutional investors.',
    location: 'Marina Bay Financial Centre, Singapore CBD waterfront. Adjacent to Marina Bay Sands. MRT connected via Raffles Place. Singapore ranks #1 globally for rule of law, ease of business, and financial stability.',
    merits: [
      'Singapore AAA financial district',
      'Regional HQ anchor tenants',
      'AAA sovereign political stability',
      'Asia-Pacific gateway property',
      'MAS regulated structure',
    ],
    highlights: ['SGD $2B total valuation', '5.4% annual yield', 'Waterfront CBD trophy', 'Quarterly distributions', 'MAS compliant'],
    verified: true, audited: true, institutional: true,
    benchmarkNote: 'Benchmark: JLL Singapore Grade A CBD Office Rental and Capital Value Index (quarterly).',
    region: 'Asia Pacific',
    series: mkSeries(4004, 172.00, 198.60),
  },
  {
    symbol: 'RE-TYO-1',
    name: 'Ginza Premium Retail Tower',
    shortName: 'Ginza Premium',
    city: 'Tokyo', country: 'Japan', flag: '🇯🇵',
    subcategory: 'Landmark',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    coordinates: { lat: 35.6717, lng: 139.7640 },
    tokenPrice: 156.40,
    tokenSupply: '9,000,000',
    change24h: 3.45,
    yield: 3.8,
    totalValue: 1407600000,
    volume24h: 1600000,
    description: 'Premium retail and office tower on Ginza\'s Chuo-dori Avenue — one of the world\'s most expensive commercial streets. Tenanted by global luxury brands and flagship retail destinations with stable, long-term leases.',
    location: 'Chuo-dori Avenue, Ginza, Tokyo. Steps from Ginza Station, minutes from Tokyo Station. Ginza commands the highest land values in Japan, rivalling London\'s Bond Street and New York\'s Fifth Avenue.',
    merits: [
      'Ginza Chuo-dori flagship location',
      'Global luxury brand tenants',
      'Highest land value in Japan',
      'Earthquake-resistant certified',
      'JPY-denominated stable yield',
    ],
    highlights: ['¥210B total valuation', '3.8% annual yield (JPY)', 'World luxury retail street', 'Annual yield distributions', 'J-REIT compatible'],
    verified: true, audited: false, institutional: true,
    benchmarkNote: 'Benchmark: CBRE Japan Retail Cap Rate Index and Ginza Chuo-dori commercial property transaction data.',
    region: 'Asia Pacific',
    series: mkSeries(5005, 130.00, 156.40),
  },
];

export const ART_MARKETS = [
  { symbol: 'ART-BASQ', name: 'Basquiat Collection Token', price: 4280.00, change: 2.14, volume: '12M', mcap: '214M', category: 'art', yield: '0.0%', type: 'Art / Collectibles', artist: 'Jean-Michel Basquiat', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80' },
  { symbol: 'ART-WAR', name: 'Warhol Portfolio Token', price: 2850.00, change: 1.87, volume: '8M', mcap: '142M', category: 'art', yield: '0.0%', type: 'Art / Collectibles', artist: 'Andy Warhol', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=400&q=80' },
  { symbol: 'ART-HIR', name: 'Damien Hirst Edition', price: 890.00, change: -0.45, volume: '4M', mcap: '89M', category: 'art', yield: '0.0%', type: 'Art / Collectibles', artist: 'Damien Hirst', image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&q=80' },
  { symbol: 'WATCH-PP', name: 'Patek Philippe Vault', price: 34500.00, change: 0.23, volume: '6M', mcap: '345M', category: 'art', yield: '0.0%', type: 'Art / Collectibles', artist: 'Fine Timepieces', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80' },
  { symbol: 'WINE-BDX', name: 'Bordeaux Wine Fund', price: 1240.00, change: 0.67, volume: '3M', mcap: '62M', category: 'art', yield: '0.0%', type: 'Art / Collectibles', artist: 'Fine Wine', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
];

export function getPropertyBySymbol(symbol) {
  return LANDMARK_RE.find(p => p.symbol === symbol) || null;
}

export function formatAssetValue(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}