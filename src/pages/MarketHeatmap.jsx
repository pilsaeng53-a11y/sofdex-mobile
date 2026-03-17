import React, { useState, useMemo } from 'react';
import { BarChart3, Zap, TrendingUp, TrendingDown, Flame, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS } from '../components/shared/MarketData';

// ── AI-generated reason snippets (deterministic per symbol) ──────────────────
const AI_REASONS = {
  BTC:    'Whale accumulation + ETF inflows spiking',
  ETH:    'Layer-2 activity surge, staking yield up',
  SOL:    'DeFi TVL breakout, memecoin frenzy',
  BNB:    'BNB Chain activity rising on new DEX launch',
  XRP:    'SEC clarity catalyst, cross-border demand',
  ADA:    'Cardano DeFi ecosystem expansion',
  DOGE:   'Social sentiment spike, high retail volume',
  AVAX:   'Institutional subnet deal announced',
  DOT:    'Parachain auction driving demand',
  LINK:   'Oracle revenue up 40% month-over-month',
  MATIC:  'Polygon zkEVM adoption accelerating',
  LTC:    'Halving cycle momentum building',
  ATOM:   'IBC cross-chain volume hit all-time high',
  UNI:    'DEX market share gains vs CEX',
  APT:    'Aptos DeFi TVL growing rapidly',
  OP:     'Optimism Superchain expansion driving fees',
  ARB:    'Arbitrum daily transactions all-time high',
  SUI:    'Unusual volatility spike + breakout signal',
  SEI:    'Native order-book DEX surging in volume',
  INJ:    'Derivatives volume up 3x this week',
  PEPE:   'Memecoin season in full swing',
  TIA:    'Data availability layer demand surging',
  NEAR:   'AI + blockchain narrative gaining traction',
  FTM:    'Sonic upgrade completion priced in',
  AAVE:   'Lending TVL up, borrowing demand high',
  JUP:    'Jupiter aggregator dominance on Solana',
  RAY:    'Raydium liquidity migration in progress',
  RNDR:   'AI rendering demand breakout',
  BONK:   'Solana memecoin rotation underway',
  HNT:    'Helium Mobile subscriber growth surge',
  'GOLD-T':   'Safe-haven demand spike + inflation fears',
  'SILVER-T': 'Silver industrial demand + gold correlation',
  'CRUDE-T':  'Supply cut news driving oil upward',
  'SP500-T':  'Broad equity rally, soft landing narrative',
  'TBILL':    'Rate cut expectations boosting treasuries',
  'RE-NYC':  'NYC real estate stabilizing after correction',
  'RE-DXB':  'Dubai property market hitting new highs',
  'TSLA-T':  'Tesla delivery beat + EV demand rebound',
  'EURO-B':  'ECB rate decision driving bond yields',
  'AAPLx':   'iPhone cycle + AI integration narrative',
  'MSFTx':   'Azure AI revenue beat, cloud demand strong',
  'GOOGLx':  'Gemini AI gaining enterprise traction',
  'AMZNx':   'AWS re-acceleration, margins expanding',
  'METAx':   'Meta AI studio engagement exploding',
  'NVDAx':   'AI chip demand outpacing all forecasts',
  'TSLAx':   'FSD milestone + Robotaxi launch nearing',
  'NFLXx':   'Ad-supported tier growth accelerating',
  'AMDx':    'AI accelerator share gains vs NVIDIA',
  'INTCx':   'Foundry deal rumors lifting sentiment',
  'TSMx':    'TSMC advanced node yield improvements',
  'JPMx':    'Net interest margin expansion continues',
  'BACx':    'Rate sensitivity play, loan growth solid',
  'GSx':     'M&A revival driving investment banking',
  'BRKx':    'Buffett cash deployment signals expected',
  'DISx':    'Streaming profitability turnaround story',
  'NIKEx':   'China recovery driving sneaker demand',
  'SBUXx':   'New menu driving traffic recovery',
  'MCDx':    'Global expansion + value menu resilience',
  'CATx':    'Infrastructure spending supercycle',
  'BAx':     'Defense backlog at record highs',
  'GEx':     'Jet engine demand post-travel boom',
  'JNJx':    'Pharmaceutical pipeline catalysts ahead',
  'PFEx':    'Post-COVID normalization, RSV vaccine lift',
  'MRKx':    'Keytruda oncology data catalyst upcoming',
  'XOMx':    'Energy price stabilization, buyback boost',
  'CVXx':    'Dividend yield attractive vs bonds',
  'SPYx':    'Broad market ETF inflow surge',
  'QQQx':    'Tech mega-cap earnings beat driving rally',
  'VTIx':    'Total market ETF steady accumulation',
  'DIAx':    'Blue-chip dividend income demand',
  'IWMx':    'Small-cap rotation on rate cut hopes',
  'GLDx':    'Gold ETF inflows at 2-year high',
  'SLVx':    'Silver industrial demand + gold ratio play',
};

function getAIReason(symbol) {
  return AI_REASONS[symbol] || 'Unusual market activity detected by AI';
}

// ── Derive AI score (0–100) from live data — deterministic seeded by symbol ──
function getAIScore(symbol, change, price, baseAsset) {
  const absChange = Math.abs(change || 0);
  // seed a pseudo-random "momentum" component so each symbol has a personality
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const noise = ((seed * 1234567) % 100) / 100; // 0..1
  const volScore   = Math.min(absChange * 4, 40);   // up to 40pts from volatility
  const momentumScore = (change > 0 ? change * 2 : 0); // up to ~20pts for positive momentum
  const noiseScore = noise * 20;                     // personality score 0–20
  return Math.min(100, Math.round(volScore + momentumScore + noiseScore + 20));
}

// ── Tile color intensity based on live % change ──────────────────────────────
function getTileClass(change) {
  const v = change ?? 0;
  if (v >= 8)  return 'bg-emerald-400 text-white';
  if (v >= 4)  return 'bg-emerald-500/70 text-white';
  if (v >= 1)  return 'bg-emerald-700/60 text-emerald-200';
  if (v >= 0)  return 'bg-emerald-900/40 text-emerald-400';
  if (v >= -2) return 'bg-red-900/40 text-red-400';
  if (v >= -5) return 'bg-red-700/60 text-red-200';
  return 'bg-red-500/70 text-white';
}

// ── Badge for AI pick / hot / trending ──────────────────────────────────────
function AiBadge({ score, change }) {
  if (score >= 80)  return <span className="text-[7px] bg-[#00d4aa]/20 text-[#00d4aa] px-1 rounded font-bold">AI Pick</span>;
  if (score >= 65)  return <span className="text-[7px] bg-orange-500/20 text-orange-400 px-1 rounded font-bold">Hot</span>;
  if (Math.abs(change || 0) >= 5) return <span className="text-[7px] bg-purple-500/20 text-purple-300 px-1 rounded font-bold">Trending</span>;
  return null;
}

// ── Parse volume string → number for sorting ─────────────────────────────────
function parseVolume(vol) {
  if (!vol || vol === '—') return 0;
  const s = vol.replace('$', '').replace(',', '');
  if (s.endsWith('T')) return parseFloat(s) * 1e12;
  if (s.endsWith('B')) return parseFloat(s) * 1e9;
  if (s.endsWith('M')) return parseFloat(s) * 1e6;
  if (s.endsWith('K')) return parseFloat(s) * 1e3;
  return parseFloat(s) || 0;
}

function parseMcap(mc) { return parseVolume(mc); }

// ── Per-tab asset list configs ────────────────────────────────────────────────
const ASSETS_BY_TAB = {
  Crypto:  CRYPTO_MARKETS.filter(a => a.symbol !== 'SOF').slice(0, 24),
  xStocks: TRADFI_MARKETS,
  RWA:     RWA_MARKETS,
};

const SORT_OPTIONS = [
  { key: 'ai',         label: 'AI Pick',    icon: Brain },
  { key: 'gainers',    label: 'Gainers',    icon: TrendingUp },
  { key: 'losers',     label: 'Losers',     icon: TrendingDown },
  { key: 'volatility', label: 'Volatility', icon: Zap },
  { key: 'volume',     label: 'Volume',     icon: BarChart3 },
  { key: 'mcap',       label: 'Mkt Cap',    icon: Flame },
];

// ── Individual tile ───────────────────────────────────────────────────────────
function HeatTile({ asset, liveChange, livePrice, aiScore, onTap }) {
  const change = liveChange ?? asset.change;
  const price  = livePrice  ?? asset.price;
  const badge  = <AiBadge score={aiScore} change={change} />;

  return (
    <button
      onClick={() => onTap(asset)}
      className={`${getTileClass(change)} rounded-xl p-2.5 text-center transition-all active:scale-95 hover:scale-105 cursor-pointer w-full`}
    >
      <div className="flex items-center justify-center gap-0.5 mb-0.5">
        <p className="text-[11px] font-black truncate max-w-[56px]">{asset.symbol}</p>
      </div>
      {badge && <div className="flex justify-center mb-0.5">{badge}</div>}
      <p className="text-[10px] font-bold">
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </p>
      <p className="text-[9px] opacity-60 mt-0.5">{asset.volume}</p>
    </button>
  );
}

// ── Expanded detail drawer (shown at bottom when tile tapped) ────────────────
function TileDetail({ asset, liveChange, livePrice, aiScore, onTrade, onClose }) {
  const change = liveChange ?? asset.change;
  const price  = livePrice  ?? asset.price;
  const reason = getAIReason(asset.symbol);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto">
      <div className="bg-[#151c2e] border-t border-[rgba(0,212,170,0.15)] rounded-t-2xl p-4 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">{asset.symbol}</span>
              <AiBadge score={aiScore} change={change} />
            </div>
            <p className="text-xs text-slate-400">{asset.name}</p>
          </div>
          <div className="text-right">
            <p className={`text-base font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
            <p className="text-sm text-slate-300">
              ${price >= 1000
                ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : price >= 1 ? price.toFixed(2)
                : price >= 0.01 ? price.toFixed(4)
                : price.toFixed(8)}
            </p>
          </div>
        </div>

        {/* AI reason */}
        <div className="flex items-start gap-2 bg-[#0a0e1a] rounded-xl p-3 mb-3 border border-[rgba(0,212,170,0.08)]">
          <Brain className="w-3.5 h-3.5 text-[#00d4aa] mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] text-[#00d4aa] font-semibold mb-0.5">AI Insight</p>
            <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[rgba(148,163,184,0.1)] text-slate-400 text-sm font-semibold"
          >
            Close
          </button>
          <button
            onClick={onTrade}
            className="flex-1 py-2.5 rounded-xl bg-[#00d4aa] text-[#0a0e1a] text-sm font-bold hover:bg-[#00d4aa]/90 transition-all"
          >
            Trade {asset.symbol}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MarketHeatmap() {
  const [tab, setTab]         = useState('Crypto');
  const [sort, setSort]       = useState('ai');
  const [selected, setSelected] = useState(null);
  const navigate              = useNavigate();
  const { liveData }          = useMarketData();

  // Merge live prices into each asset
  const enriched = useMemo(() => {
    const baseAssets = ASSETS_BY_TAB[tab] || [];
    return baseAssets.map(a => {
      const live = liveData[a.symbol];
      const liveChange = live?.available ? live.change : null;
      const livePrice  = live?.available ? live.price  : null;
      const change     = liveChange ?? a.change;
      const price      = livePrice  ?? a.price;
      const aiScore    = getAIScore(a.symbol, change, price, a);
      return { ...a, liveChange, livePrice, change, price, aiScore };
    });
  }, [tab, liveData]);

  // Sort by selected mode
  const sorted = useMemo(() => {
    const arr = [...enriched];
    switch (sort) {
      case 'gainers':    return arr.sort((a, b) => b.change - a.change);
      case 'losers':     return arr.sort((a, b) => a.change - b.change);
      case 'volatility': return arr.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      case 'volume':     return arr.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
      case 'mcap':       return arr.sort((a, b) => parseMcap(b.mcap) - parseMcap(a.mcap));
      case 'ai':         return arr.sort((a, b) => b.aiScore - a.aiScore);
      default:           return arr;
    }
  }, [enriched, sort]);

  function handleTileClick(asset) {
    setSelected(asset);
  }

  function handleTrade(asset) {
    setSelected(null);
    const sym = asset.symbol;
    // RWA → AssetRegistryDetail
    if (asset.category === 'rwa') {
      navigate(`/AssetRegistryDetail?symbol=${sym}`);
    } else {
      // Crypto & xStocks → Trade page
      navigate(`/Trade?symbol=${sym}`);
    }
  }

  // Enrich selected with latest live data
  const selectedEnriched = useMemo(() => {
    if (!selected) return null;
    const live = liveData[selected.symbol];
    const liveChange = live?.available ? live.change : null;
    const livePrice  = live?.available ? live.price  : null;
    const change     = liveChange ?? selected.change;
    const aiScore    = getAIScore(selected.symbol, change, selected.price, selected);
    return { ...selected, liveChange, livePrice, change, aiScore };
  }, [selected, liveData]);

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Market Heatmap</h1>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> Live
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Color intensity = performance · Tap any tile to trade</p>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {[
          { label: '+8%+', cls: 'bg-emerald-400' },
          { label: '+4%',  cls: 'bg-emerald-600' },
          { label: '0%',   cls: 'bg-slate-700' },
          { label: '-2%',  cls: 'bg-red-700' },
          { label: '-5%+', cls: 'bg-red-500' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${l.cls}`} />
            <span className="text-[9px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-3">
        {['Crypto', 'xStocks', 'RWA'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5 no-scrollbar">
        {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all shrink-0 ${
              sort === key
                ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                : 'bg-[#151c2e] text-slate-500 border border-transparent'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {sorted.map((a) => (
          <HeatTile
            key={a.symbol}
            asset={a}
            liveChange={a.liveChange}
            livePrice={a.livePrice}
            aiScore={a.aiScore}
            onTap={handleTileClick}
          />
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)]">
        <p className="text-[10px] text-slate-500 text-center">
          Live prices · Binance WS + CoinGecko · Updates every 500ms · Tap tile to trade
        </p>
      </div>

      {/* Tile detail drawer */}
      {selectedEnriched && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelected(null)}
          />
          <TileDetail
            asset={selectedEnriched}
            liveChange={selectedEnriched.liveChange}
            livePrice={selectedEnriched.livePrice}
            aiScore={selectedEnriched.aiScore}
            onTrade={() => handleTrade(selectedEnriched)}
            onClose={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}