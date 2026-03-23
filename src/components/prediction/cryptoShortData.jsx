/**
 * Generates live crypto short-term prediction markets.
 * Resolution times are computed relative to NOW so markets are always fresh.
 */

const SYMBOLS = [
  { symbol: 'BTCUSDT', base: 'BTC', name: 'Bitcoin',  refPrice: 87400 },
  { symbol: 'ETHUSDT', base: 'ETH', name: 'Ethereum', refPrice: 3420 },
  { symbol: 'SOLUSDT', base: 'SOL', name: 'Solana',   refPrice: 176 },
  { symbol: 'XRPUSDT', base: 'XRP', name: 'Ripple',   refPrice: 0.618 },
  { symbol: 'BNBUSDT', base: 'BNB', name: 'BNB',      refPrice: 598 },
];

// Resolution model types
const MODELS = {
  UP_DOWN: 'up_down',      // will close candle higher or lower than open?
  ABOVE_BELOW: 'above_below', // will price be above or below a target?
  RANGE: 'range',           // will price stay in range?
};

function nextBoundary(intervalSeconds) {
  const now = Math.floor(Date.now() / 1000);
  return (Math.floor(now / intervalSeconds) + 1) * intervalSeconds;
}

function priceTarget(refPrice, offsetPct) {
  return Math.round(refPrice * (1 + offsetPct) * 100) / 100;
}

export const SEGMENTS = [
  { id: 'ultra',   label: 'Ultra Short', emoji: '⚡', intervalSec: 300,   durLabel: '5m' },
  { id: '15m',     label: '15 Min',      emoji: '🕐', intervalSec: 900,   durLabel: '15m' },
  { id: 'hourly',  label: 'Hourly',      emoji: '⏱️', intervalSec: 3600,  durLabel: '1H' },
  { id: '4h',      label: '4 Hour',      emoji: '📊', intervalSec: 14400, durLabel: '4H' },
  { id: 'daily',   label: 'Daily',       emoji: '📅', intervalSec: 86400, durLabel: '1D' },
  { id: 'weekly',  label: 'Weekly',      emoji: '📆', intervalSec: 604800,durLabel: '1W' },
];

export function generateMarkets() {
  const markets = [];
  let idCounter = 1;

  SEGMENTS.forEach(seg => {
    const resolvesAt = nextBoundary(seg.intervalSec); // Unix seconds

    SYMBOLS.forEach(sym => {
      // UP/DOWN market
      markets.push({
        id:          `cs_${seg.id}_${sym.base}_ud_${idCounter++}`,
        segment:     seg.id,
        segLabel:    seg.label,
        durLabel:    seg.durLabel,
        symbol:      sym.symbol,
        base:        sym.base,
        name:        sym.name,
        model:       MODELS.UP_DOWN,
        question:    `Will ${sym.base} close HIGHER in the next ${seg.durLabel}?`,
        refPrice:    sym.refPrice,
        target:      null,
        outcomes: [
          { id: 'UP',   label: '▲ UP',   prob: 0.50 },
          { id: 'DOWN', label: '▼ DOWN', prob: 0.50 },
        ],
        resolvesAt,
        volume: Math.floor(Math.random() * 80000 + 5000),
        tags: seg.intervalSec <= 900 ? ['HOT'] : [],
        source: 'internal',
        category: 'crypto',
      });

      // ABOVE/BELOW for 15m+ only (not ultra 5m)
      if (seg.intervalSec >= 900) {
        const tgt = priceTarget(sym.refPrice, 0.005); // +0.5% target
        markets.push({
          id:          `cs_${seg.id}_${sym.base}_ab_${idCounter++}`,
          segment:     seg.id,
          segLabel:    seg.label,
          durLabel:    seg.durLabel,
          symbol:      sym.symbol,
          base:        sym.base,
          name:        sym.name,
          model:       MODELS.ABOVE_BELOW,
          question:    `Will ${sym.base} be ABOVE $${tgt.toLocaleString()} at ${seg.durLabel} close?`,
          refPrice:    sym.refPrice,
          target:      tgt,
          outcomes: [
            { id: 'ABOVE', label: `▲ Above $${tgt.toLocaleString()}`, prob: 0.48 },
            { id: 'BELOW', label: `▼ Below $${tgt.toLocaleString()}`, prob: 0.52 },
          ],
          resolvesAt,
          volume: Math.floor(Math.random() * 40000 + 2000),
          tags: [],
          source: 'internal',
          category: 'crypto',
        });
      }
    });
  });

  return markets;
}

export const LOCK_SECONDS = 20; // betting disabled this many seconds before resolution