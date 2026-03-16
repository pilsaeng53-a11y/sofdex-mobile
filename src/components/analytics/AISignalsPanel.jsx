import React, { useState } from 'react';
import { Brain, BarChart2, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronDown } from 'lucide-react';

const SIGNALS = [
  {
    asset: 'BTC', direction: 'long', confidence: 87,
    reasoning: 'Institutional accumulation above $97K support. RSI oversold on 4H. Whale wallets added 2,400 BTC in 24h.',
    entry: '$97,200', target: '$104,500', stop: '$94,800',
  },
  {
    asset: 'SOL', direction: 'long', confidence: 74,
    reasoning: 'DeFi TVL breakout on Solana. Network activity up 40% WoW. Price consolidating above key EMA.',
    entry: '$184', target: '$210', stop: '$172',
  },
  {
    asset: 'ETH', direction: 'neutral', confidence: 52,
    reasoning: 'Mixed signals. ETF inflows positive but gas fees rising. Wait for clear break above $3,900.',
    entry: '-', target: '-', stop: '-',
  },
  {
    asset: 'BNB', direction: 'short', confidence: 68,
    reasoning: 'Exchange outflows declining. RSI divergence on daily. Watch for rejection at $580 resistance.',
    entry: '$577', target: '$540', stop: '$592',
  },
];

const INDICATORS = [
  { name: 'RSI', asset: 'BTC', value: '42.3', signal: 'Oversold → Buy', color: 'text-emerald-400', trend: 'long' },
  { name: 'MACD', asset: 'BTC', value: '+0.84', signal: 'Bullish cross', color: 'text-emerald-400', trend: 'long' },
  { name: 'Bollinger Bands', asset: 'SOL', value: 'Lower Band', signal: 'Bounce zone', color: 'text-amber-400', trend: 'long' },
  { name: 'Supertrend', asset: 'ETH', value: 'Bearish', signal: 'Below ST line', color: 'text-red-400', trend: 'short' },
  { name: 'RSI', asset: 'SOL', value: '55.1', signal: 'Neutral', color: 'text-slate-400', trend: 'neutral' },
  { name: 'MACD', asset: 'ETH', value: '-0.23', signal: 'Bearish cross', color: 'text-red-400', trend: 'short' },
];

const INDICATOR_RANKING = [
  { rank: 1, name: 'Supertrend', roi: '+34.2%', accuracy: '71%', color: 'text-[#00d4aa]' },
  { rank: 2, name: 'Bollinger Bands', roi: '+28.6%', accuracy: '67%', color: 'text-amber-400' },
  { rank: 3, name: 'MACD', roi: '+22.1%', accuracy: '63%', color: 'text-blue-400' },
  { rank: 4, name: 'RSI', roi: '+18.4%', accuracy: '61%', color: 'text-purple-400' },
];

function DirectionBadge({ direction }) {
  if (direction === 'long') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-2.5 h-2.5" /> LONG
    </span>
  );
  if (direction === 'short') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-2.5 h-2.5" /> SHORT
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-400/10 border border-slate-400/20 px-2 py-0.5 rounded-full">
      <Minus className="w-2.5 h-2.5" /> NEUTRAL
    </span>
  );
}

export default function AISignalsPanel() {
  const [tab, setTab] = useState('signals');
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#0a0e1a] rounded-xl p-1">
        {[
          { key: 'signals', label: '🤖 AI Signals' },
          { key: 'indicators', label: '📊 Indicators' },
          { key: 'ranking', label: '🏆 Ranking' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
              tab === t.key ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* AI Signals */}
      {tab === 'signals' && (
        <div className="space-y-2">
          {SIGNALS.map((sig, i) => (
            <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
              <button
                className="w-full p-3 flex items-center justify-between"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[#00d4aa]" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{sig.asset}</p>
                      <DirectionBadge direction={sig.direction} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Confidence: {sig.confidence}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-[#0a0e1a] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${sig.confidence >= 75 ? 'bg-emerald-400' : sig.confidence >= 55 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${sig.confidence}%` }}
                    />
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {expanded === i && (
                <div className="px-3 pb-3 space-y-2.5 border-t border-[rgba(148,163,184,0.06)]">
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-2">{sig.reasoning}</p>
                  {sig.direction !== 'neutral' && (
                    <div className="grid grid-cols-3 gap-2">
                      {[['Entry', sig.entry, 'text-white'], ['Target', sig.target, 'text-emerald-400'], ['Stop', sig.stop, 'text-red-400']].map(([l, v, c]) => (
                        <div key={l} className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                          <p className={`text-xs font-bold ${c}`}>{v}</p>
                          <p className="text-[10px] text-slate-500">{l}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Indicators */}
      {tab === 'indicators' && (
        <div className="space-y-2">
          {INDICATORS.map((ind, i) => (
            <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a2340] flex items-center justify-center">
                  <BarChart2 className={`w-4 h-4 ${ind.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{ind.name}</p>
                  <p className="text-[10px] text-slate-500">{ind.asset}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${ind.color}`}>{ind.value}</p>
                <p className="text-[10px] text-slate-400">{ind.signal}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indicator Ranking */}
      {tab === 'ranking' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 px-1">Performance ranking by backtested ROI (90 days)</p>
          {INDICATOR_RANKING.map((ind, i) => (
            <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] p-3">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                  i === 0 ? 'bg-amber-400/20 text-amber-400' :
                  i === 1 ? 'bg-slate-300/10 text-slate-300' :
                  i === 2 ? 'bg-orange-400/10 text-orange-400' :
                  'bg-[#1a2340] text-slate-500'
                }`}>#{ind.rank}</div>
                <div className="flex-1">
                  <p className={`text-xs font-bold ${ind.color}`}>{ind.name}</p>
                  <div className="w-full bg-[#0a0e1a] rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full bg-current ${ind.color}`} style={{ width: ind.accuracy }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{ind.roi}</p>
                  <p className="text-[10px] text-slate-500">{ind.accuracy} acc.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}