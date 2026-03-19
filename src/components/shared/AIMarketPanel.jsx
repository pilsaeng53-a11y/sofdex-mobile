import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Newspaper, Zap } from 'lucide-react';
import { useLang } from './LanguageContext';

const AI_DATA = {
  BTC: {
    direction: 'long',
    confidence: 82,
    volatility: 6.4,
    volatilityLabel: 'Moderate',
    summary: 'Institutional accumulation detected. ETF inflow data shows strong buying pressure. Support holding at $94K. Bullish structure intact above $95K.',
    reasons: ['ETF inflows +$480M (3-week high)', 'Whale accumulation pattern detected', 'Funding rate neutral — no overcrowding', 'CME futures premium widening'],
    news: [
      { title: 'BlackRock BTC ETF sees record single-day inflow', impact: 'Bullish', time: '2h ago' },
      { title: 'Fed signals no rate cuts in Q1 — crypto reacts', impact: 'Neutral', time: '4h ago' },
    ],
  },
  ETH: {
    direction: 'neutral',
    confidence: 61,
    volatility: 8.2,
    volatilityLabel: 'High',
    summary: 'Mixed signals. Liquidation cascade cleared overhead resistance but staking yield remains supportive. Watch $3,800 support closely.',
    reasons: ['$180M long liquidations cleared', 'Staking yield 3.8% acts as floor bid', 'Layer 2 TVL growing +12% monthly', 'Options skew slightly bearish short-term'],
    news: [
      { title: 'Ethereum Layer 2 TVL hits all-time high $42B', impact: 'Bullish', time: '1h ago' },
      { title: 'Large ETH unlocks expected next week — watch supply', impact: 'Bearish', time: '6h ago' },
    ],
  },
  SOL: {
    direction: 'long',
    confidence: 74,
    volatility: 12.1,
    volatilityLabel: 'Very High',
    summary: 'High volatility detected with increased trading volume and recent institutional accumulation. Solana ecosystem momentum accelerating.',
    reasons: ['3x normal trading volume inflow', 'Whale wallet accumulation on-chain', 'DeFi TVL up +22% in 7 days', 'Breakout above key $182 resistance'],
    news: [
      { title: 'Solana surpasses Ethereum in daily DEX volume', impact: 'Bullish', time: '30m ago' },
      { title: 'New Solana validator node count reaches ATH', impact: 'Bullish', time: '3h ago' },
    ],
  },
  JUP: {
    direction: 'long',
    confidence: 68,
    volatility: 18.4,
    volatilityLabel: 'Extreme',
    summary: 'Strong momentum play. DEX partnership news driving sudden volume surge. High volatility — use conservative leverage.',
    reasons: ['Partnership announcement catalyst', 'Volume 5x above 30-day average', 'Thin order book — prone to gaps', 'Momentum signal from AI scanner'],
    news: [
      { title: 'Jupiter announces major CEX integration partnership', impact: 'Bullish', time: '1h ago' },
    ],
  },
  RNDR: {
    direction: 'long',
    confidence: 71,
    volatility: 14.2,
    volatilityLabel: 'High',
    summary: 'AI narrative momentum. NVIDIA news and GPU compute demand driving sustainable interest. Healthy volume profile.',
    reasons: ['NVIDIA partnership catalyst active', 'AI/GPU narrative sector rotation', 'Institutional interest growing', 'Technical breakout confirmed'],
    news: [
      { title: 'NVIDIA expands GPU render network partnership with Render', impact: 'Bullish', time: '5h ago' },
    ],
  },
  DEFAULT: {
    direction: 'neutral',
    confidence: 55,
    volatility: 8.0,
    volatilityLabel: 'Moderate',
    summary: 'Market conditions are mixed. Monitor key support and resistance levels. No strong directional signal at this time.',
    reasons: ['Mixed macro environment', 'No unusual on-chain activity', 'Average volume levels', 'Sideways price action'],
    news: [
      { title: 'Global markets await Fed decision this week', impact: 'Neutral', time: '2h ago' },
    ],
  },
};

const IMPACT_COLOR = { Bullish: 'text-emerald-400 bg-emerald-400/10', Bearish: 'text-red-400 bg-red-400/10', Neutral: 'text-amber-400 bg-amber-400/10', bullish: 'text-emerald-400 bg-emerald-400/10', bearish: 'text-red-400 bg-red-400/10', neutral: 'text-amber-400 bg-amber-400/10' };

export default function AIMarketPanel({ symbol = 'BTC' }) {
  const { t } = useLang();
  const [open, setOpen] = useState(true);
  const data = AI_DATA[symbol] || AI_DATA.DEFAULT;

  const dirIcon = data.direction === 'long'
    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
    : data.direction === 'short'
    ? <TrendingDown className="w-4 h-4 text-red-400" />
    : <Minus className="w-4 h-4 text-amber-400" />;

  const dirColor = data.direction === 'long' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    : data.direction === 'short' ? 'text-red-400 bg-red-400/10 border-red-400/20'
    : 'text-amber-400 bg-amber-400/10 border-amber-400/20';

  const dirLabel = data.direction === 'long' ? t('sentiment_bullish') : data.direction === 'short' ? t('sentiment_bearish') : t('ai_neutral_signal');

  const volColor = data.volatility >= 15 ? 'text-red-400' : data.volatility >= 10 ? 'text-orange-400' : data.volatility >= 6 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">{t('ai_market_panel') || 'AI Market Insight'} · {symbol}</p>
            <p className="text-xs text-slate-500">{t('ai_confidence') || 'Confidence'}: <span className="text-[#00d4aa] font-semibold">{data.confidence}%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${dirColor}`}>
            {dirIcon} {dirLabel}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[rgba(148,163,184,0.06)]">
          {/* Volatility */}
          <div className="pt-3 flex items-center gap-3">
            <div className="flex-1 bg-[#0a0e1a] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">{t('ai_volatility') || 'Volatility Score'}</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-black ${volColor}`}>{data.volatility}</p>
                <span className={`text-xs font-semibold ${volColor}`}>/ 20 · {data.volatilityLabel}</span>
              </div>
              <div className="w-full bg-[#151c2e] rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(data.volatility / 20) * 100}%`, background: data.volatility >= 15 ? '#ef4444' : data.volatility >= 10 ? '#f97316' : data.volatility >= 6 ? '#f59e0b' : '#22c55e' }} />
              </div>
            </div>
            <div className="flex-1 bg-[#0a0e1a] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">{t('ai_direction') || 'AI Direction'}</p>
              <div className={`flex items-center gap-1.5 text-sm font-black ${dirColor.split(' ')[0]}`}>
                {dirIcon} {dirLabel.toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">{data.confidence}% {t('ai_confidence') || 'confidence'}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{data.summary}</p>
            </div>
          </div>

          {/* Key reasons */}
          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{t('ai_key_reasons') || 'Key Signals'}</p>
            <div className="space-y-1.5">
              {data.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-[#00d4aa] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related news */}
          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{t('ai_related_news') || 'Related News'}</p>
            <div className="space-y-2">
              {data.news.map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Newspaper className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 leading-snug">{n.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${IMPACT_COLOR[n.impact]}`}>{n.impact === 'Bullish' ? t('sentiment_bullish') : n.impact === 'Bearish' ? t('sentiment_bearish') : t('ai_neutral_signal')}</span>
                      <span className="text-[10px] text-slate-600">{n.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}