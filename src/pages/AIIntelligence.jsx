import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Bot, Sparkles, FileText, ShieldCheck, BarChart3, Target, PieChart } from 'lucide-react';
import { CRYPTO_MARKETS } from '../components/shared/MarketData';

// --- Static AI Data ---
const AI_SENTIMENT = {
  label: 'Bullish',
  score: 74,
  confidence: 'High',
  explanation: 'On-chain accumulation by large wallets accelerated over the past 48h. Exchange outflows hit a 30-day high, signaling reduced sell pressure. Derivatives funding remains mildly positive.',
};

const SMART_MONEY = [
  { type: 'Whale Buy',     asset: 'BTC',  amount: '142 BTC',    usd: '$13.9M', wallet: '1AaBb...9Cc3', dir: 'in',  time: '4m ago' },
  { type: 'Whale Buy',     asset: 'SOL',  amount: '48,200 SOL', usd: '$9.0M',  wallet: 'Sol7x...nX4', dir: 'in',  time: '11m ago' },
  { type: 'Large Transfer',asset: 'ETH',  amount: '2,100 ETH',  usd: '$8.1M',  wallet: 'Binance Hot', dir: 'out', time: '19m ago' },
  { type: 'Whale Sell',    asset: 'BTC',  amount: '89 BTC',     usd: '$8.8M',  wallet: '3Ffd2...7Kq9', dir: 'out', time: '25m ago' },
  { type: 'Whale Buy',     asset: 'JUP',  amount: '6.2M JUP',   usd: '$7.7M',  wallet: 'Sol4r...Mn2', dir: 'in',  time: '38m ago' },
  { type: 'Exchange Inflow', asset: 'ETH', amount: '3,800 ETH', usd: '$14.6M', wallet: 'OKX Cold',    dir: 'out', time: '52m ago' },
];

const SECTORS = [
  { name: 'Crypto',          change: '+6.4%',  trend: 'hot',     desc: 'BTC & SOL leading broad rally' },
  { name: 'RWA',             change: '+9.2%',  trend: 'hot',     desc: 'Tokenized treasury inflows surge' },
  { name: 'Real Estate',     change: '+3.1%',  trend: 'rising',  desc: 'Dubai & NYC properties gaining' },
  { name: 'Commodities',     change: '+1.8%',  trend: 'rising',  desc: 'Gold tokens tracking spot price' },
  { name: 'Art / Collectibles', change: '-2.4%', trend: 'cooling', desc: 'Low volume, sideways action' },
  { name: 'Solana Ecosystem',change: '+11.3%', trend: 'hot',     desc: 'JUP, RAY, RNDR all breakout' },
];

const AI_SIGNALS = [
  { asset: 'BTC',   signal: 'Bullish',  conf: 81, reason: 'ETF inflows + halving narrative strengthening' },
  { asset: 'SOL',   signal: 'Bullish',  conf: 88, reason: 'DePIN growth + memecoin volume surge on-chain' },
  { asset: 'ETH',   signal: 'Neutral',  conf: 62, reason: 'Spot ETF uncertainty, low staking APR narrative' },
  { asset: 'JUP',   signal: 'Bullish',  conf: 76, reason: 'Jupiverse expansion + airdrop momentum' },
  { asset: 'RNDR',  signal: 'Bullish',  conf: 72, reason: 'AI compute demand rising, Apple Vision catalyst' },
  { asset: 'RAY',   signal: 'Neutral',  conf: 55, reason: 'DEX volumes stabilizing after meme season' },
  { asset: 'BONK',  signal: 'Bearish',  conf: 67, reason: 'Retail FOMO fading, RSI overbought signals' },
  { asset: 'HNT',   signal: 'Neutral',  conf: 58, reason: 'Network growth steady, lacking near-term catalyst' },
];

const VOLATILITY_ALERTS = [
  { asset: 'BONK',  level: 'Extreme', change: '+42%',  note: 'Volume 18x above 30d average',   color: 'text-red-400',    bg: 'bg-red-400/8',    border: 'border-red-400/20' },
  { asset: 'JUP',   level: 'High',    change: '+8.7%', note: 'Options IV spiked to 210%',       color: 'text-orange-400', bg: 'bg-orange-400/8', border: 'border-orange-400/20' },
  { asset: 'RNDR',  level: 'High',    change: '+12.3%',note: 'Breakout from 3-week consolidation', color: 'text-orange-400', bg: 'bg-orange-400/8', border: 'border-orange-400/20' },
  { asset: 'GOLD-T',level: 'Low',     change: '+0.9%', note: 'Near historic support',            color: 'text-emerald-400',bg: 'bg-emerald-400/8',border: 'border-emerald-400/20' },
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

const TABS = ['Signals', 'Smart Money', 'Sectors', 'Volatility'];

export default function AIIntelligence() {
  const [tab, setTab] = useState('Signals');
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1200);
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00d4aa]" />
            <h1 className="text-xl font-bold text-white">AI Intelligence</h1>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
          >
            <Bot className={`w-3.5 h-3.5 text-[#00d4aa] ${refreshed ? 'animate-spin' : ''}`} />
            <span className="text-[11px] text-slate-400 font-medium">{refreshed ? 'Analyzing…' : 'AI Refresh'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">Powered by SOFDex AI Engine · Updated every 5 minutes</p>
      </div>

      {/* Overall Sentiment Banner */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] text-slate-500 font-medium mb-1">AI Market Sentiment</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-400">{AI_SENTIMENT.label}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-400/10 text-emerald-400 text-[10px] font-bold border border-emerald-400/20">
                    {AI_SENTIMENT.confidence} Confidence
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{AI_SENTIMENT.score}</p>
                <p className="text-[10px] text-slate-500">/ 100</p>
              </div>
            </div>
            {/* Score bar */}
            <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all"
                style={{ width: `${AI_SENTIMENT.score}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{AI_SENTIMENT.explanation}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {/* AI Trade Signals */}
        {tab === 'Signals' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#00d4aa]" />
              <p className="text-xs font-bold text-white">AI Trade Signals</p>
              <span className="text-[10px] text-slate-600">· Directional bias</span>
            </div>
            {AI_SIGNALS.map((sig, i) => {
              const style = signalStyle[sig.signal];
              const Icon = style.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa] flex-shrink-0">
                    {sig.asset.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{sig.asset}</span>
                      <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${style.color} ${style.bg} ${style.border}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {sig.signal}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{sig.reason}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-bold text-white">{sig.conf}%</div>
                    <div className="text-[10px] text-slate-600">conf.</div>
                    <div className="w-12 h-1 rounded-full bg-[#0d1220] mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${style.bg.replace('/10', '/60')}`} style={{ width: `${sig.conf}%` }} />
                    </div>
                  </div>
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
              <p className="text-xs font-bold text-white">Smart Money Tracker</p>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            </div>
            {SMART_MONEY.map((tx, i) => (
              <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.dir === 'in' ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
                    {tx.dir === 'in'
                      ? <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />}
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
              <p className="text-xs font-bold text-white">Sector & Narrative Tracker</p>
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

        {/* Volatility */}
        {tab === 'Volatility' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-bold text-white">Volatility Radar</p>
              <span className="text-[10px] text-slate-600">· Unusual activity alerts</span>
            </div>
            {VOLATILITY_ALERTS.map((a, i) => (
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

            {/* Calm assets */}
            <div className="glass-card rounded-2xl p-4 mt-1">
              <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">Low Volatility Assets</p>
              <div className="flex flex-wrap gap-2">
                {['BTC', 'ETH', 'TBILL', 'GOLD-T', 'EURO-B'].map(a => (
                  <span key={a} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400 border border-[rgba(148,163,184,0.06)]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}