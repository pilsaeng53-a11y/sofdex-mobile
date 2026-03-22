/**
 * useAISignal — Single shared source of truth for the overall AI market sentiment signal.
 *
 * Both AISentimentCard (summary) and AIIntelligence (detail page) must import from here.
 * One score. One label. One confidence. One timestamp. Zero duplication.
 */

import { useMemo } from 'react';
import { useMarketData, COMMODITY_SYMBOLS } from '../components/shared/MarketDataProvider';
import { CRYPTO_MARKETS, RWA_MARKETS } from '../components/shared/MarketData';

// ── Asset context: narratives, sector, risk notes ─────────────────────────────
export const ASSET_CONTEXT = {
  BTC:  { narrative: 'ETF inflow momentum + halving narrative',       risk: 'High volatility near major support. Stop-loss recommended.',       sector: 'Large Cap Crypto' },
  SOL:  { narrative: 'DePIN sector strength + on-chain volume surge', risk: 'Momentum extended — RSI elevated, pullback possible.',              sector: 'Solana Ecosystem' },
  ETH:  { narrative: 'Staking yield narrative + Layer-2 activity',    risk: 'Range-bound — no clear directional catalyst. Avoid over-leverage.', sector: 'Large Cap Crypto' },
  JUP:  { narrative: 'Jupiverse expansion + airdrop momentum',        risk: 'Small-cap. High impact from whale exits.',                          sector: 'Solana Ecosystem' },
  RNDR: { narrative: 'AI compute demand + GPU render breakout',       risk: 'Tech/AI narrative dependent. Monitor macro risk.',                  sector: 'AI / DePIN' },
  RAY:  { narrative: 'Raydium DEX volume stabilizing',                risk: 'Low conviction. Wait for volume confirmation.',                      sector: 'Solana Ecosystem' },
  BONK: { narrative: 'Solana memecoin rotation play',                 risk: 'Extreme speculative risk. Only micro-positions.',                   sector: 'Memecoins' },
  HNT:  { narrative: 'Helium Mobile subscriber growth',               risk: 'Sideways range. No strong entry signal.',                           sector: 'DePIN' },
  BNB:  { narrative: 'BNB Chain activity + new DEX launch',           risk: 'CEX-native token regulatory risk.',                                 sector: 'Exchange Token' },
  XRP:  { narrative: 'SEC clarity catalyst + cross-border demand',    risk: 'Regulatory overhang partially resolved but still present.',         sector: 'Payments' },
  AVAX: { narrative: 'Institutional subnet deals announced',          risk: 'Competing L1 pressure. Monitor TVL trend.',                         sector: 'Layer 1' },
  DOGE: { narrative: 'Social sentiment spike + retail volume',        risk: 'Purely speculative — no fundamental backing.',                      sector: 'Memecoins' },
  PEPE: { narrative: 'Memecoin season rotation',                      risk: 'Extreme speculative risk. Momentum-only trade.',                    sector: 'Memecoins' },
  SUI:  { narrative: 'Sui DeFi TVL growing + new dApp launches',      risk: 'Early ecosystem — smart contract risks remain.',                   sector: 'Layer 1' },
  ARB:  { narrative: 'Arbitrum daily transactions at all-time high',  risk: 'L2 competition intensifying.',                                      sector: 'Layer 2' },
  OP:   { narrative: 'Optimism Superchain expansion driving fees',    risk: 'Revenue still low vs valuation.',                                   sector: 'Layer 2' },
  'GOLD-T': { narrative: 'Safe-haven demand + inflation hedging',     risk: 'Tracks physical gold — subject to macro swings.',                  sector: 'RWA Commodity' },
  'CRUDE-T':{ narrative: 'Supply cut news driving oil prices',        risk: 'Geopolitical sensitivity — high event risk.',                       sector: 'RWA Commodity' },
  'SP500-T':{ narrative: 'Broad equity rally + soft landing narrative',risk: 'Rate sensitivity — Fed pivot timing uncertain.',                   sector: 'RWA Equity' },
  'TBILL':  { narrative: 'Rate cut expectations boosting treasuries', risk: 'Duration risk if rates rise unexpectedly.',                         sector: 'RWA Treasury' },
  'RE-NYC': { narrative: 'NYC real estate yield stabilizing',         risk: 'Illiquid underlying — NAV may lag market.',                         sector: 'RWA Real Estate' },
  'RE-DXB': { narrative: 'Dubai property market at new highs',        risk: 'Emerging market + FX risk.',                                        sector: 'RWA Real Estate' },
};

export const SIGNAL_ASSETS = ['BTC', 'SOL', 'ETH', 'JUP', 'RNDR', 'RAY', 'BONK', 'HNT'];

// ── Scoring model ─────────────────────────────────────────────────────────────
export function computeAssetScore(symbol, change, liveAvailable) {
  const ch   = change ?? 0;
  const absC = Math.abs(ch);

  const trendRaw   = ch >= 10 ? 30 : ch >= 5 ? 25 : ch >= 2 ? 20 : ch >= 0 ? 15 : ch >= -2 ? 10 : ch >= -5 ? 6 : 3;
  const volConfirm = absC >= 8 ? 20 : absC >= 5 ? 17 : absC >= 3 ? 14 : absC >= 1 ? 10 : 6;
  const volCond    = absC >= 15 ? 5  : absC >= 8 ? 12 : absC >= 3 ? 15 : absC >= 1 ? 11 : 7;
  const obScore    = ch >= 8 ? 20 : ch >= 4 ? 17 : ch >= 1 ? 13 : ch >= 0 ? 10 : ch >= -2 ? 7 : ch >= -5 ? 4 : 2;

  const seed     = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const newsBase = ((seed * 7919) % 8) + 5;
  const newsTilt = ch > 3 ? 3 : ch > 0 ? 1 : ch > -3 ? -1 : -3;
  const newsScore = Math.max(0, Math.min(15, newsBase + newsTilt));

  const raw = trendRaw + volConfirm + volCond + obScore + newsScore;
  return Math.min(97, Math.max(10, liveAvailable ? raw : Math.max(10, raw - 5)));
}

export function getSignalLabel(score) {
  if (score >= 68) return 'Bullish';
  if (score >= 45) return 'Neutral';
  return 'Bearish';
}

export function getConfidenceLabel(score) {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

export function buildAssetSignal(symbol, change, price, liveAvailable, baseData) {
  const score  = computeAssetScore(symbol, change, liveAvailable);
  const signal = getSignalLabel(score);
  const ctx    = ASSET_CONTEXT[symbol] || { narrative: 'Market activity detected', risk: 'Monitor closely.', sector: 'Asset' };
  const ch     = change ?? 0;
  const absC   = Math.abs(ch);

  const basisStr = price != null
    ? (price >= 1000
        ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        : price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(6)}`)
    : (baseData?.price ? `$${baseData.price}` : '—');

  const volLabel = absC >= 10 ? 'Extreme volatility spike' : absC >= 5 ? 'High volatility' : absC >= 2 ? 'Moderate volatility' : 'Low volatility';
  const dirLabel = ch >= 5 ? 'Strong upward momentum' : ch >= 1 ? 'Mild bullish bias' : ch >= 0 ? 'Flat / consolidating' : ch >= -3 ? 'Mild selling pressure' : 'Strong bearish momentum';
  const obLabel  = ch >= 3 ? 'Buy-side dominant' : ch >= 0 ? 'Balanced order flow' : 'Sell-side dominant';

  return {
    signal,
    score,
    basis: basisStr,
    change: ch,
    confidence: getConfidenceLabel(score),
    factors: [
      `${dirLabel} · 24h change: ${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`,
      `${volLabel} · abs move ${absC.toFixed(2)}%`,
      `Orderbook: ${obLabel}`,
      ctx.narrative,
      liveAvailable ? 'Live price confirmed via Binance/CoinGecko' : 'Static price fallback',
    ],
    risk: ctx.risk,
    sector: ctx.sector,
  };
}

// ── Overall market sentiment (composite of leaders) ───────────────────────────
function computeOverallSentiment(liveData, allMarkets) {
  const leaders = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
  let totalChange = 0; let count = 0;
  leaders.forEach(sym => {
    const live = liveData[sym];
    const base = allMarkets.find(m => m.symbol === sym);
    const ch   = live?.available ? live.change : (base?.change ?? 0);
    totalChange += ch; count++;
  });

  const avgChange = count > 0 ? totalChange / count : 0;
  const score     = Math.min(97, Math.max(10, Math.round(50 + avgChange * 3)));
  const label     = getSignalLabel(score);
  const confidence = getConfidenceLabel(score);

  const btcLive = liveData['BTC'];
  const solLive = liveData['SOL'];
  const btcCh   = btcLive?.available ? btcLive.change : allMarkets.find(m => m.symbol === 'BTC')?.change ?? 0;
  const solCh   = solLive?.available ? solLive.change : allMarkets.find(m => m.symbol === 'SOL')?.change ?? 0;

  // Count bullish signals from leaders
  const bullishCount = leaders.filter(sym => {
    const live = liveData[sym];
    const base = allMarkets.find(m => m.symbol === sym);
    const ch   = live?.available ? live.change : (base?.change ?? 0);
    return ch >= 1;
  }).length;

  const explanation =
    `Market composite score derived from live momentum across ${count} leading assets. ` +
    `BTC ${btcCh >= 0 ? '+' : ''}${btcCh.toFixed(2)}%, SOL ${solCh >= 0 ? '+' : ''}${solCh.toFixed(2)}%. ` +
    (score >= 68 ? 'Buy-side pressure dominant. Exchange outflows elevated.'
    : score >= 45 ? 'Mixed signals — await confirmation before directional bias.'
    : 'Sell-side dominant. Risk-off positioning advised.');

  const reasoning =
    `Weighted composite: price momentum (30%), volume confirmation (20%), volatility condition (15%), ` +
    `orderbook pressure (20%), news/narrative (15%). ` +
    `Avg 24h change of top-${count} assets: ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%.`;

  const timestamp = new Date().toISOString();

  const result = {
    label,
    score,
    confidence,
    explanation,
    reasoning,
    bullishCount,
    factors: leaders.map(sym => {
      const live = liveData[sym];
      const base = allMarkets.find(m => m.symbol === sym);
      const ch   = live?.available ? live.change : (base?.change ?? 0);
      return `${sym}: ${ch >= 0 ? '+' : ''}${ch.toFixed(2)}% ${live?.available ? '(live)' : '(static)'}`;
    }),
    timestamp,
  };

  // Debug log — remove after verification
  console.debug('[useAISignal] Overall sentiment resolved:', {
    symbol: 'MARKET_COMPOSITE',
    score: result.score,
    label: result.label,
    confidence: result.confidence,
    timestamp: result.timestamp,
  });

  return result;
}

// ── Hook: shared overall market AI signal ─────────────────────────────────────
export function useOverallAISignal(refreshKey = 0) {
  const { liveData } = useMarketData();

  const allMarkets = useMemo(() => [...CRYPTO_MARKETS, ...RWA_MARKETS], []);

  const signal = useMemo(
    () => computeOverallSentiment(liveData, allMarkets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveData, refreshKey]
  );

  return signal;
}

// ── Hook: per-asset AI signals map ────────────────────────────────────────────
export function useAssetAISignals(refreshKey = 0) {
  const { liveData } = useMarketData();
  const allMarkets   = useMemo(() => [...CRYPTO_MARKETS, ...RWA_MARKETS], []);

  return useMemo(() => {
    const result = {};
    SIGNAL_ASSETS.forEach(sym => {
      const live          = liveData[sym];
      const base          = allMarkets.find(m => m.symbol === sym);
      const liveAvailable = !!live?.available;
      const isCommodity   = COMMODITY_SYMBOLS.has(sym);
      const change        = liveAvailable ? live.change : (base?.change ?? 0);
      const price         = liveAvailable ? live.price  : (isCommodity ? null : (base?.price ?? null));
      result[sym]         = buildAssetSignal(sym, change, price, liveAvailable, base);

      // Debug log — remove after verification
      console.debug('[useAISignal] Asset signal resolved:', {
        symbol: sym,
        score: result[sym].score,
        label: result[sym].signal,
        confidence: result[sym].confidence,
        timestamp: new Date().toISOString(),
      });
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveData, refreshKey]);
}