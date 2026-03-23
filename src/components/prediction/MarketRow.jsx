/**
 * MarketRow — dense exchange-style market row for list views.
 * Shows key data: question, top outcome bars, volume, payout, tags.
 */
import React from 'react';
import { Clock, TrendingUp, Zap, Star, AlertCircle } from 'lucide-react';

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

export default function MarketRow({ market, participated, onBet, compact = false }) {
  const topOutcome = market.outcomes.reduce((best, o) => o.prob > best.prob ? o : best, market.outcomes[0]);
  const maxPayout  = (1 / (market.outcomes.reduce((min, o) => o.prob < min ? o.prob : min, 1))).toFixed(2);

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
        <span className="text-[8px] text-slate-600 ml-auto flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span className={daysLeft(market.endDate).includes('Ended') ? 'text-red-400' : daysLeft(market.endDate).replace('d','').length <= 2 && parseInt(daysLeft(market.endDate)) <= 3 ? 'text-orange-400' : ''}>
            {daysLeft(market.endDate)}
          </span>
        </span>
      </div>

      {/* Row 2: question */}
      <p className="text-[12px] font-bold text-white leading-snug group-hover:text-[#00d4aa]/90 transition-colors line-clamp-2">
        {market.question}
      </p>

      {/* Row 3: outcome bars + stats */}
      <div className="flex items-center justify-between gap-2">
        <OutcomeBar outcomes={market.outcomes} />
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-[8px] text-slate-600">Vol</p>
            <p className="text-[9px] font-mono text-slate-400">{fmtVol(market.volume)}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-600">Max</p>
            <p className="text-[9px] font-black font-mono text-yellow-400">{maxPayout}x</p>
          </div>
        </div>
      </div>
    </div>
  );
}