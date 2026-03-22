import React, { useState, useMemo, useCallback } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Bot, Sparkles, FileText, ShieldCheck, BarChart3, Target, PieChart, Info } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useMarketData, COMMODITY_SYMBOLS } from '../components/shared/MarketDataProvider';
import { CRYPTO_MARKETS, RWA_MARKETS } from '../components/shared/MarketData';
import { useOverallAISignal, useAssetAISignals, ASSET_CONTEXT, getSignalLabel, getConfidenceLabel, SIGNAL_ASSETS } from '../hooks/useAISignal';

// ── Signal tab asset list (imported from shared hook, kept for clarity) ──────

const SMART_MONEY = [
  { type: 'Whale Buy',       asset: 'BTC', amount: '142 BTC',    usd: '$13.9M', wallet: '1AaBb...9Cc3', dir: 'in',  time: '4m ago' },
  { type: 'Whale Buy',       asset: 'SOL', amount: '48,200 SOL', usd: '$9.0M',  wallet: 'Sol7x...nX4', dir: 'in',  time: '11m ago' },
  { type: 'Large Transfer',  asset: 'ETH', amount: '2,100 ETH',  usd: '$8.1M',  wallet: 'Binance Hot', dir: 'out', time: '19m ago' },
  { type: 'Whale Sell',      asset: 'BTC', amount: '89 BTC',     usd: '$8.8M',  wallet: '3Ffd2...7Kq9', dir: 'out', time: '25m ago' },
  { type: 'Whale Buy',       asset: 'JUP', amount: '6.2M JUP',   usd: '$7.7M',  wallet: 'Sol4r...Mn2', dir: 'in',  time: '38m ago' },
  { type: 'Exchange Inflow', asset: 'ETH', amount: '3,800 ETH',  usd: '$14.6M', wallet: 'OKX Cold',    dir: 'out', time: '52m ago' },
];

const SECTORS = [
  { name: 'Crypto',             change: '+6.4%',  trend: 'hot',     desc: 'BTC & SOL leading broad rally' },
  { name: 'RWA',                change: '+9.2%',  trend: 'hot',     desc: 'Tokenized treasury inflows surge' },
  { name: 'Real Estate',        change: '+3.1%',  trend: 'rising',  desc: 'Dubai & NYC properties gaining' },
  { name: 'Commodities',        change: '+1.8%',  trend: 'rising',  desc: 'Gold tokens tracking spot price' },
  { name: 'Art / Collectibles', change: '-2.4%',  trend: 'cooling', desc: 'Low volume, sideways action' },
  { name: 'Solana Ecosystem',   change: '+11.3%', trend: 'hot',     desc: 'JUP, RAY, RNDR all breakout' },
];

const VOLATILITY_ALERTS = [
  { asset: 'BONK',   level: 'Extreme', change: '+42%',   note: 'Volume 18x above 30d average',        color: 'text-red-400',     bg: 'bg-red-400/8',     border: 'border-red-400/20' },
  { asset: 'JUP',    level: 'High',    change: '+8.7%',  note: 'Options IV spiked to 210%',            color: 'text-orange-400',  bg: 'bg-orange-400/8',  border: 'border-orange-400/20' },
  { asset: 'RNDR',   level: 'High',    change: '+12.3%', note: 'Breakout from 3-week consolidation',   color: 'text-orange-400',  bg: 'bg-orange-400/8',  border: 'border-orange-400/20' },
  { asset: 'GOLD-T', level: 'Low',     change: '+0.9%',  note: 'Near historic support',                color: 'text-emerald-400', bg: 'bg-emerald-400/8', border: 'border-emerald-400/20' },
];

const trendStyle = {
  hot:     { badge: 'bg-orange-400/10 text-orange-400',  bar: 'bg-gradient-to-r from-orange-500 to-amber-400' },
  rising:  { badge: 'bg-emerald-400/10 text-emerald-400', bar: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
  cooling: { badge: 'bg-blue-400/10 text-blue-400',       bar: 'bg-blue-500/40' },
};

const signalStyle = {
  Bullish: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: TrendingUp },
  Neutral: { color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20',   icon: Minus },
  Bearish: { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: TrendingDown },
};

const PORTFOLIO_ADVISOR = {
  riskLevel: 'Medium', riskScore: 58,
  suggestions: [
    'Reduce BTC exposure from 32% → 25% to lower volatility drag',
    'Add 10–15% RWA bonds (TBILL) for yield stabilisation',
    'Consider diversifying into Solana DePIN sector (RNDR, HNT)',
  ],
  factors: ['Price momentum analysis', 'Sector correlation matrix', 'Volatility-adjusted Sharpe ratio', 'Macro rate environment'],
  rwa: { current: '18%', suggested: '28%', reason: 'RWA sector momentum + treasury yield opportunity' },
};



const AI_NEWS = [
  { headline: 'Fed holds rates — crypto markets rally 6% on risk-on sentiment', impact: 'Bullish', tag: 'text-emerald-400', bg: 'bg-emerald-400/10', summary: 'Dovish Fed signals reduce macro headwinds; BTC and SOL leading the move higher.', factors: ['Macro: Fed rate decision', 'Sentiment: Risk-on shift', 'Volume: +140% spike on news'] },
  { headline: 'BlackRock expands tokenized treasury fund to $18B AUM', impact: 'Bullish', tag: 'text-emerald-400', bg: 'bg-emerald-400/10', summary: 'Institutional RWA demand accelerating; TBILL and tokenized bonds seeing inflow surge.', factors: ['RWA sector strength', 'Institutional flows', 'Narrative: Real yield on-chain'] },
  { headline: 'SEC approves spot SOL ETF application — details pending', impact: 'Bullish', tag: 'text-emerald-400', bg: 'bg-emerald-400/10', summary: 'Historical pattern suggests 20–40% rally within 30 days of ETF approval announcements.', factors: ['Regulatory catalyst', 'Price momentum', 'Retail FOMO potential'] },
  { headline: 'Dubai launches tokenized real estate pilot for global investors', impact: 'Neutral', tag: 'text-slate-400', bg: 'bg-slate-400/10', summary: 'RWA expansion into MENA region. Long-term positive; near-term impact muted.', factors: ['RWA expansion', 'Geopolitical risk neutral', 'Long-term structural positive'] },
];

const LIQUIDATION_ZONES = [
  { asset: 'BTC', longCluster: '$92,000–$93,500', shortCluster: '$101,000–$103,000', risk: 'High', longSize: '$320M', shortSize: '$280M' },
  { asset: 'SOL', longCluster: '$168–$172',        shortCluster: '$198–$205',         risk: 'High', longSize: '$45M',  shortSize: '$38M' },
  { asset: 'ETH', longCluster: '$3,400–$3,500',    shortCluster: '$4,100–$4,300',     risk: 'Med',  longSize: '$180M', shortSize: '$210M' },
];

// RWA_VALUATIONS — current price is always derived from live market data at render time
// fair/status/pct are AI model outputs (informational), NOT used as the main price display
const RWA_VALUATIONS = [
  { symbol: 'GOLD-T',  name: 'Tokenized Gold',   fairRaw: null,  status: 'Fair Value',  pct: '0.0%', color: 'text-slate-400',  bg: 'bg-slate-400/10',  basis: 'Live spot gold parity — tracks TVC:GOLD / Yahoo GC=F in real time' },
  { symbol: 'CRUDE-T', name: 'WTI Crude Oil',    fairRaw: null,  status: 'Fair Value',  pct: '0.0%', color: 'text-slate-400',  bg: 'bg-slate-400/10',  basis: 'Live WTI futures parity — tracks TVC:USOIL / Yahoo CL=F in real time' },
  { symbol: 'SP500-T', name: 'S&P 500 Index',    fairRaw: null,  status: 'Fair Value',  pct: '0.0%', color: 'text-slate-400',  bg: 'bg-slate-400/10',  basis: 'Live S&P 500 index parity — tracks SP:SPX / Yahoo ^GSPC in real time' },
  { symbol: 'TBILL',   name: 'US 10Y Treasury',  fairRaw: null,  status: 'Fair Value',  pct: '0.0%', color: 'text-slate-400',  bg: 'bg-slate-400/10',  basis: 'Live 10Y yield — tracks TVC:US10Y / Yahoo ^TNX in real time' },
];

// Helper: format a number as a price string
function fmtLivePrice(p) {
  if (p == null) return '—';
  if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1)    return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

const OPPORTUNITY_SCANNER = [
  { asset: 'JUP',    type: 'Volume Spike',        detail: '8.4x above 30d avg',         signal: 'Watch for breakout',     color: 'text-violet-400',  bg: 'bg-violet-400/10',  factors: ['Volume spike', 'Price momentum', 'Narrative strength'] },
  { asset: 'SOL',    type: 'Whale Accumulation',  detail: '3 new wallets · +$27M',      signal: 'Bullish accumulation',   color: 'text-emerald-400', bg: 'bg-emerald-400/10', factors: ['Whale activity', 'Exchange outflows', 'DePIN sector'] },
  { asset: 'RNDR',   type: 'Sector Momentum',     detail: 'AI compute narrative +42%',  signal: 'Trend continuation',     color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    factors: ['Sector strength', 'AI macro theme', 'Breakout pattern'] },
  { asset: 'RE-DXB', type: 'Undervalued RWA',     detail: 'AI model: -18.9% to fair',   signal: 'Value opportunity',      color: 'text-amber-400',   bg: 'bg-amber-400/10',   factors: ['Valuation model', 'Yield spread', 'MENA property demand'] },
];

const AI_TAB_KEYS = ['ai_tab_signals','ai_tab_smartMoney','ai_tab_sectors','ai_tab_volatility','ai_tab_portfolio','ai_tab_risk','ai_tab_news','ai_tab_liqZones','ai_tab_rwa','ai_tab_scanner'];
const AI_TAB_VALUES = ['Signals','Smart Money','Sectors','Volatility','Portfolio','Risk','News','Liq.Zones','RWA','Scanner'];

function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-4">
      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] text-amber-400/80 font-semibold leading-snug">AI analysis is for informational purposes only and does not guarantee returns.</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Users remain responsible for all investment decisions.</p>
      </div>
    </div>
  );
}

function ReasoningCard({ factors, risk, basis, t }) {
   const [open, setOpen] = useState(false);
   return (
     <div className="mt-2">
       <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
         <Brain className="w-3 h-3" />
         {open ? t('ai_hideReasoning') : t('ai_viewReasoning')} {t('ai_reasoning')}
       </button>
      {open && (
        <div className="mt-2 p-2.5 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.06)] space-y-1.5">
          {basis && <p className="text-[10px] text-slate-500"><span className="text-slate-400 font-semibold">{t('ai_basis')}:</span> {basis}</p>}
          {factors?.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 font-semibold mb-1">{t('ai_marketFactors')}:</p>
              {factors.map((f, i) => <p key={i} className="text-[10px] text-slate-600">· {f}</p>)}
            </div>
          )}
          {risk && (
            <div className="flex items-start gap-1.5 pt-1 border-t border-[rgba(148,163,184,0.04)]">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400/70">{risk}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIIntelligence() {
  const { t } = useLang();
  const [tab, setTab]             = useState('Signals');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshed, setRefreshed] = useState(false);
  const { liveData }              = useMarketData();

  const ALL_MARKETS_FLAT = useMemo(() => [...CRYPTO_MARKETS, ...RWA_MARKETS], []);

  const handleRefresh = useCallback(() => {
    setRefreshed(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshed(false), 1200);
  }, []);

  // ── Shared signal sources — same hooks used by AISentimentCard on Home ───
  const overallSentiment = useOverallAISignal(refreshKey);
  const assetSignals     = useAssetAISignals(refreshKey);

  // ── Live-driven volatility alerts ─────────────────────────────────────────
  const volatilityAlerts = useMemo(() => {
    return ALL_MARKETS_FLAT
      .map(a => {
        const live = liveData[a.symbol];
        const ch   = live?.available ? live.change : a.change;
        const absC = Math.abs(ch);
        if (absC < 3) return null;
        const level  = absC >= 12 ? 'Extreme' : absC >= 7 ? 'High' : 'Moderate';
        const color  = absC >= 12 ? 'text-red-400' : absC >= 7 ? 'text-orange-400' : 'text-amber-400';
        const bg     = absC >= 12 ? 'bg-red-400/8'  : absC >= 7 ? 'bg-orange-400/8'  : 'bg-amber-400/8';
        const border = absC >= 12 ? 'border-red-400/20' : absC >= 7 ? 'border-orange-400/20' : 'border-amber-400/20';
        return { asset: a.symbol, level, change: `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`, note: `${level} activity · ${absC.toFixed(1)}% 24h move · ${live?.available ? 'Live data' : 'Static fallback'}`, color, bg, border };
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change)))
      .slice(0, 6);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveData, refreshKey]);

  // ── Live risk scores (abs volatility → risk level) ────────────────────────
  const liveRiskScores = useMemo(() => {
    const RISK_ASSETS = ['BTC', 'SOL', 'GOLD-T', 'TBILL', 'RE-NYC', 'BONK', 'JUP', 'ETH'];
    return RISK_ASSETS.map(sym => {
      const live  = liveData[sym];
      const base  = ALL_MARKETS_FLAT.find(m => m.symbol === sym);
      const ch    = live?.available ? live.change : (base?.change ?? 0);
      const absC  = Math.abs(ch);
      // Risk score: high volatility = high risk for crypto, low for RWA/stable
      const ctx = ASSET_CONTEXT[sym] || {};
      const isStable = ctx.sector?.includes('RWA') || sym === 'TBILL';
      const baseRisk = isStable ? 20 : 40;
      const riskScore = Math.min(99, Math.round(baseRisk + absC * (isStable ? 1.5 : 3.5)));
      const label = riskScore >= 80 ? 'Extreme Risk' : riskScore >= 65 ? 'High Volatility' : riskScore >= 45 ? 'Moderate' : riskScore >= 25 ? 'Low Risk' : 'Safe Haven';
      const color = riskScore >= 80 ? 'text-red-400' : riskScore >= 65 ? 'text-orange-400' : riskScore >= 45 ? 'text-amber-400' : riskScore >= 25 ? 'text-blue-400' : 'text-emerald-400';
      const bar   = riskScore >= 80 ? 'bg-red-400'   : riskScore >= 65 ? 'bg-orange-400'   : riskScore >= 45 ? 'bg-amber-400'   : riskScore >= 25 ? 'bg-blue-400'   : 'bg-emerald-400';
      return {
        asset: sym, score: riskScore, label, color, bar,
        factors: [
          `24h change: ${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`,
          `Volatility magnitude: ${absC.toFixed(2)}%`,
          ctx.narrative || 'Monitoring market activity',
          live?.available ? 'Live data confirmed' : 'Static fallback',
        ],
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveData, refreshKey]);

  const sentimentStyle = overallSentiment.label === 'Bullish'
    ? 'text-emerald-400' : overallSentiment.label === 'Bearish' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00d4aa]" />
            <h1 className="text-xl font-bold text-white">{t('page_ai')}</h1>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all">
            <Bot className={`w-3.5 h-3.5 text-[#00d4aa] ${refreshed ? 'animate-spin' : ''}`} />
            <span className="text-[11px] text-slate-400 font-medium">{refreshed ? t('ai_analyzing') : t('ai_refresh')}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">{t('ai_poweredBy')}</p>
      </div>

      {/* Overall Sentiment Banner — live dynamic */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] text-slate-500 font-medium mb-1">{t('ai_marketSentiment')}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${sentimentStyle}`}>{overallSentiment.label}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                    overallSentiment.label === 'Bullish' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                    : overallSentiment.label === 'Bearish' ? 'bg-red-400/10 text-red-400 border-red-400/20'
                    : 'bg-slate-400/10 text-slate-400 border-slate-400/20'}`}>
                    {overallSentiment.confidence} {t('ai_confidence')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{overallSentiment.score}</p>
                <p className="text-[10px] text-slate-500">/ 100</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400" style={{ width: `${overallSentiment.score}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{overallSentiment.explanation}</p>
            <ReasoningCard factors={overallSentiment.factors} risk={null} basis={overallSentiment.reasoning} t={t} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {AI_TAB_VALUES.map((tabVal, idx) => (
          <button key={tabVal} onClick={() => setTab(tabVal)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === tabVal ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}>
            {t(AI_TAB_KEYS[idx])}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        <AIDisclaimer />

        {/* AI Trade Signals — live dynamic */}
        {tab === 'Signals' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#00d4aa]" />
              <p className="text-xs font-bold text-white">{t('ai_tradeSignals')}</p>
              <span className="text-[10px] text-slate-600">· {t('ai_directionalBias')}</span>
            </div>
            {Object.entries(assetSignals).map(([asset, sig]) => {
              const style = signalStyle[sig.signal];
              const Icon  = style.icon;
              const chPos = sig.change >= 0;
              return (
                <div key={asset} className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa] flex-shrink-0">
                      {asset.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-white">{asset}</span>
                        <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${style.color} ${style.bg} ${style.border}`}>
                          <Icon className="w-2.5 h-2.5" />{sig.signal}
                        </span>
                        <span className={`text-[10px] font-bold ${chPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {chPos ? '+' : ''}{sig.change.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">Live basis: <span className="text-slate-400 font-semibold">{sig.basis}</span></p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-bold text-white">{sig.score}</div>
                      <div className="text-[10px] text-slate-600">/ 100</div>
                      <div className="w-12 h-1 rounded-full bg-[#0d1220] mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${style.bg.replace('/10', '/60')}`} style={{ width: `${sig.score}%` }} />
                      </div>
                    </div>
                  </div>
                  <ReasoningCard factors={sig.factors} risk={sig.risk} t={t} />
                </div>
              );
            })}
          </>
        )}

        {/* Smart Money */}
        {tab === 'Smart Money' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-violet-400" />
              <p className="text-xs font-bold text-white">{t('ai_smartMoneyTracker')}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            </div>
            <div className="glass-card rounded-2xl p-3 mb-1 border border-violet-400/10">
              <p className="text-[10px] text-slate-500">{t('ai_trackingLargeWallets')}</p>
            </div>
            {SMART_MONEY.map((tx, i) => (
              <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.dir === 'in' ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
                    {tx.dir === 'in' ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{tx.type}</span>
                      <span className="text-[10px] text-slate-500">· {tx.asset}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 truncate max-w-[140px]">{tx.wallet} · {tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{tx.usd}</p>
                  <p className="text-[10px] text-slate-500">{tx.amount}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Sectors */}
        {tab === 'Sectors' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-bold text-white">{t('ai_sectorTracker')}</p>
            </div>
            {SECTORS.map((s, i) => {
              const style = trendStyle[s.trend];
              const pct = Math.min(Math.abs(parseFloat(s.change)) * 5, 100);
              return (
                <div key={i} className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{s.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${style.badge}`}>{s.trend}</span>
                    </div>
                    <span className={`text-sm font-bold ${s.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{s.change}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </>
        )}

        {/* Volatility — live dynamic */}
        {tab === 'Volatility' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-bold text-white">{t('ai_volatilityRadar')}</p>
              <span className="text-[10px] text-slate-600">· {t('ai_unusualActivity')}</span>
            </div>
            {volatilityAlerts.length === 0 && (
               <div className="glass-card rounded-2xl p-4 text-center text-[11px] text-slate-500">{t('ai_noVolatilityDetected')}</div>
             )}
            {volatilityAlerts.map((a, i) => (
              <div key={i} className={`glass-card rounded-2xl p-4 border ${a.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center text-[10px] font-black ${a.color}`}>
                      {a.asset.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{a.asset}</p>
                      <span className={`text-[10px] font-bold ${a.color}`}>{a.level} Volatility</span>
                    </div>
                  </div>
                  <span className={`text-base font-black ${a.color}`}>{a.change}</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-0.5">{a.note}</p>
              </div>
            ))}
            <div className="glass-card rounded-2xl p-4 mt-1">
              <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">{t('ai_lowVolAssets')}</p>
              <div className="flex flex-wrap gap-2">
                {ALL_MARKETS_FLAT
                  .filter(a => { const live = liveData[a.symbol]; const ch = live?.available ? Math.abs(live.change) : Math.abs(a.change); return ch < 1.5; })
                  .slice(0, 6)
                  .map(a => (
                    <span key={a.symbol} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400 border border-[rgba(148,163,184,0.06)]">{a.symbol}</span>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Portfolio Advisor */}
        {tab === 'Portfolio' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-bold text-white">{t('ai_portfolioAdvisor')}</p>
            </div>
            <div className="glass-card rounded-2xl p-3 mb-1 border border-cyan-400/10">
              <p className="text-[10px] text-cyan-400/70 font-semibold mb-0.5">{t('ai_walletContextAnalysis')}</p>
              <p className="text-[10px] text-slate-500">{t('ai_connectWalletPersonalized')}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-amber-400/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-400">{t('ai_portfolioRisk')}</p>
                <span className="text-xs font-black text-amber-400">{PORTFOLIO_ADVISOR.riskLevel} · {PORTFOLIO_ADVISOR.riskScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" style={{ width: `${PORTFOLIO_ADVISOR.riskScore}%` }} />
              </div>
              <ReasoningCard factors={PORTFOLIO_ADVISOR.factors} risk={t('ai_portfolioRiskIndicative')} t={t} />
            </div>
            <div className="glass-card rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ai_aiSuggestions')}</p>
              <div className="space-y-2.5">
                {PORTFOLIO_ADVISOR.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[8px] font-black text-[#00d4aa]">{i + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-purple-400/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-xs font-semibold text-white">{t('ai_rwaAllocation')}</p>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">{t('ai_current')}</p>
                  <p className="text-lg font-black text-slate-300">{PORTFOLIO_ADVISOR.rwa.current}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-[#00d4aa] to-purple-400" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">{t('ai_target')}</p>
                  <p className="text-lg font-black text-purple-400">{PORTFOLIO_ADVISOR.rwa.suggested}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">{PORTFOLIO_ADVISOR.rwa.reason}</p>
            </div>
          </>
        )}

        {/* Risk Score — live dynamic */}
        {tab === 'Risk' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-bold text-white">{t('ai_riskScore')}</p>
              <span className="text-[10px] text-slate-600">· {t('ai_assetRisk')}</span>
            </div>
            {liveRiskScores.map((r, i) => (
              <div key={i} className="glass-card rounded-2xl p-3.5">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa] flex-shrink-0">
                    {r.asset.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-white">{r.asset}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${r.color}`}>{r.label}</span>
                        <span className={`text-sm font-black ${r.color}`}>{r.score}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${r.bar}`} style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                </div>
                <ReasoningCard factors={r.factors} risk={null} t={t} />
              </div>
            ))}
          </>
        )}

        {/* News */}
        {tab === 'News' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#00d4aa]" />
              <p className="text-xs font-bold text-white">{t('ai_newsInsight')}</p>
              <span className="text-[10px] text-slate-600">· {t('ai_autoSummarized')}</span>
            </div>
            {AI_NEWS.map((n, i) => (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${n.tag} ${n.bg} border-current/20`}>{n.impact}</span>
                  <span className="text-[10px] text-slate-600">{t('ai_impact')}</span>
                </div>
                <p className="text-xs font-semibold text-white mb-1.5 leading-snug">{n.headline}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-1">{n.summary}</p>
                <ReasoningCard factors={n.factors} risk={null} t={t} />
              </div>
            ))}
          </>
        )}

        {/* Liquidation Zones */}
        {tab === 'Liq.Zones' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs font-bold text-white">{t('ai_liqPredictor')}</p>
              <span className="text-[10px] text-slate-600">· {t('ai_keyPriceClusters')}</span>
            </div>
            {LIQUIDATION_ZONES.map((lz, i) => (
              <div key={i} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa]">
                      {lz.asset.slice(0, 2)}
                    </div>
                    <p className="text-sm font-bold text-white">{lz.asset}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${lz.risk === 'High' ? 'text-red-400 bg-red-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                    {lz.risk === 'High' ? t('ai_highLiqRisk') : t('ai_medLiqRisk')} {t('ai_liqRisk')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-500 mb-1">{t('ai_longCluster')}</p>
                    <p className="text-[10px] font-bold text-emerald-400">{lz.longCluster}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{lz.longSize} {t('ai_atRisk')}</p>
                  </div>
                  <div className="bg-red-400/5 border border-red-400/15 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-500 mb-1">{t('ai_shortCluster')}</p>
                    <p className="text-[10px] font-bold text-red-400">{lz.shortCluster}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{lz.shortSize} {t('ai_atRisk')}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* RWA Valuation — current price always from live market feed */}
        {tab === 'RWA' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-white">{t('ai_rwaValuation')}</p>
            </div>
            {RWA_VALUATIONS.map((r, i) => {
              // Live price is always master — same feed as TradingView chart.
              // Never fall back to static seed for commodity assets.
              const liveEntry = liveData[r.symbol];
              const livePrice = liveEntry?.available ? liveEntry.price : null;
              const currentStr = livePrice != null ? fmtLivePrice(livePrice) : '—';
              // These are live-market assets (chart price = app price), so fair value IS the live price
              const fairStr = livePrice ? fmtLivePrice(livePrice) : '—';
              const gapStr = '0.0%';
              const dynamicStatus = 'Live Market';
              const dynamicColor = 'text-[#00d4aa]';
              const dynamicBg    = 'bg-[#00d4aa]/10';
              return (
                <div key={i} className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${dynamicBg} flex items-center justify-center text-[10px] font-black ${dynamicColor}`}>
                        {r.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{r.symbol}</p>
                        <p className="text-[10px] text-slate-500">{r.name}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${dynamicBg} text-[10px] font-bold ${dynamicColor}`}>{dynamicStatus}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1 mb-2">
                    <div><span className="text-slate-500">Live Price: </span><span className="text-white font-semibold">{currentStr}</span></div>
                    <div><span className="text-slate-500">Chart Price: </span><span className={`font-bold ${dynamicColor}`}>{fairStr}</span></div>
                    <span className={`font-black text-sm ${dynamicColor}`}>✓ Synced</span>
                  </div>
                  <ReasoningCard factors={null} risk={null} basis={r.basis} t={t} />
                </div>
              );
            })}
          </>
        )}

        {/* Opportunity Scanner */}
        {tab === 'Scanner' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-bold text-white">{t('ai_opportunityScanner')}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
            </div>
            {OPPORTUNITY_SCANNER.map((o, i) => (
              <div key={i} className={`glass-card rounded-2xl p-4 border ${o.color.replace('text-', 'border-')}/10`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${o.bg} flex items-center justify-center text-[10px] font-black ${o.color}`}>
                      {o.asset.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{o.asset}</p>
                      <span className={`text-[10px] font-semibold ${o.color}`}>{o.type}</span>
                    </div>
                  </div>
                  <Zap className={`w-4 h-4 ${o.color}`} />
                </div>
                <p className="text-[11px] text-slate-400 mb-1">{o.detail}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${o.bg} mb-1`}>
                  <TrendingUp className={`w-2.5 h-2.5 ${o.color}`} />
                  <span className={`text-[10px] font-bold ${o.color}`}>{o.signal}</span>
                </div>
                <ReasoningCard factors={o.factors} risk={t('ai_priceMovement')} t={t} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}