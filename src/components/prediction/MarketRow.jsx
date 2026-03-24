/**
 * MarketRow — dense exchange-style market row for list views.
 * Shows key data: question, top outcome bars, volume, payout, tags.
 */
import React from 'react';
import { Clock, TrendingUp, Zap, Star, AlertCircle } from 'lucide-react';
import { LiquidityBar, RiskBadge, AIConfidence, OddsMovement, MarketTimer, ProfitMultiplier, WatchlistButton } from './MarketEngagement';

const TAG_STYLES = {
  'HOT':          { bg: 'rgba(249,115,22,0.12)',  text: '#f97316', border: 'rgba(249,115,22,0.25)' },
  'TRENDING':     { bg: 'rgba(139,92,246,0.12)',  text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  'HIGH PAYOUT':  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  'AI PICK':      { bg: 'rgba(0,212,170,0.12)',   text: '#00d4aa', border: 'rgba(0,212,170,0.25)' },
  'ENDING SOON':  { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.25)' },
};

function fmtVol(n) {
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

function daysLeft(dateStr) {
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1d';
  if (d < 30) return `${d}d`;
  return `${Math.round(d/30)}mo`;
}

function OutcomeBar({ outcomes }) {
  // Show top 2 outcomes
  const top = outcomes.slice(0, 2);
  return (
    <div className="flex items-center gap-1.5">
      {top.map(o => (
        <div key={o.id} className="flex items-center gap-1">
          <div className="h-1.5 rounded-full w-16 overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
            <div className="h-full rounded-full"
              style={{ width: `${Math.round(o.prob * 100)}%`, background: o.prob >= 0.5 ? '#22c55e' : o.prob >= 0.35 ? '#f59e0b' : '#ef4444' }} />
          </div>
          <span className={`text-[9px] font-black font-mono ${o.prob >= 0.5 ? 'text-emerald-400' : o.prob >= 0.35 ? 'text-amber-400' : 'text-red-400'}`}>
            {o.label} {Math.round(o.prob*100)}¢
          </span>
        </div>
      ))}
      {outcomes.length > 2 && <span className="text-[8px] text-slate-600">+{outcomes.length-2}</span>}
    </div>
  );
}

export default function MarketRow({ market, participated, onBet, compact = false, watchlist, onWatchlist }) {
  const topOutcome = market.outcomes.reduce((best, o) => o.prob > best.prob ? o : best, market.outcomes[0]);

  return (
    <div
      onClick={() => onBet(market)}
      className={`group flex flex-col gap-2 px-4 py-3 border-b cursor-pointer transition-all hover:bg-[#111827]/60 ${participated ? 'opacity-60' : ''}`}
      style={{ borderColor: 'rgba(148,163,184,0.05)' }}>

      {/* Row 1: tags + meta */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {market.tags.slice(0, 2).map(tag => {
          const s = TAG_STYLES[tag];
          return s ? (
            <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 rounded border"
              style={{ background: s.bg, color: s.text, borderColor: s.border }}>{tag}</span>
          ) : null;
        })}
        {participated && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded border"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.2)' }}>✓ IN</span>
        )}
        <RiskBadge market={market} />
        <div className="ml-auto flex items-center gap-1.5">
          {market.endDate && <MarketTimer endDate={market.endDate} />}
          {onWatchlist && <WatchlistButton marketId={market.id} watchlist={watchlist} onToggle={onWatchlist} />}
        </div>
      </div>

      {/* Row 2: question */}
      <p className="text-[12px] font-bold text-white leading-snug group-hover:text-[#00d4aa]/90 transition-colors line-clamp-2">
        {market.question}
      </p>

      {/* Row 3: outcome bars */}
      <OutcomeBar outcomes={market.outcomes} />

      {/* Row 4: stats */}
      <div className="flex items-center justify-between gap-2">
        <LiquidityBar volume={market.volume} />
        <div className="flex items-center gap-2 flex-shrink-0">
          <AIConfidence market={market} />
          <ProfitMultiplier outcomes={market.outcomes} />
        </div>
      </div>
    </div>
  );
}