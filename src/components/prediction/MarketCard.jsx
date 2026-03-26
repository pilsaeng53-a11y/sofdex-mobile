import React, { useState, useEffect } from 'react';
import { Clock, Lock, Zap } from 'lucide-react';
import { LiquidityBar, RiskBadge, AIConfidence, ProfitMultiplier, WatchlistButton } from './MarketEngagement';

const SOURCE_BADGE = {
  polymarket: { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8', border: 'rgba(99,102,241,0.25)', label: 'Polymarket' },
  kalshi:     { bg: 'rgba(16,185,129,0.10)',  text: '#34d399', border: 'rgba(16,185,129,0.22)', label: 'Kalshi' },
  solfort:    { bg: 'rgba(0,212,170,0.10)',   text: '#00d4aa', border: 'rgba(0,212,170,0.22)', label: 'SolFort' },
  internal:   { bg: 'rgba(0,212,170,0.10)',   text: '#00d4aa', border: 'rgba(0,212,170,0.22)', label: 'SolFort' },
};

const TAG_STYLES = {
  'HOT':         { bg: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.25)' },
  'TRENDING':    { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  'HIGH PAYOUT': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  'AI PICK':     { bg: 'rgba(0,212,170,0.12)',  text: '#00d4aa', border: 'rgba(0,212,170,0.25)' },
  'ENDING SOON': { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)' },
};

function useCountdown(endDate) {
  const [secsLeft, setSecsLeft] = useState(0);
  useEffect(() => {
    if (!endDate) return;
    const tick = () => setSecsLeft(Math.max(0, Math.floor((new Date(endDate) - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return secsLeft;
}

function formatTime(secs) {
  if (secs <= 0) return 'Ended';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 48) return `${Math.ceil(secs / 86400)}d`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function daysLeft(dateStr) {
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1d';
  if (d < 30)  return `${d}d`;
  return `${Math.round(d/30)}mo`;
}

function StatusBadge({ market, secsLeft, hasEndDate }) {
  const status = market.status;
  if (status === 'resolved') return (
    <span className="text-[7px] font-black px-1.5 py-0.5 rounded border"
      style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.2)' }}>
      RESOLVED
    </span>
  );
  if (status === 'archived') return (
    <span className="text-[7px] font-black px-1.5 py-0.5 rounded border"
      style={{ background: 'rgba(148,163,184,0.08)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.15)' }}>
      ARCHIVED
    </span>
  );
  if (status === 'locked' || (hasEndDate && secsLeft <= 0)) return (
    <span className="text-[7px] font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
      <Lock className="w-2 h-2" />LOCKED
    </span>
  );
  if (hasEndDate && secsLeft > 0 && secsLeft <= 60) return (
    <span className="text-[7px] font-black px-1.5 py-0.5 rounded border animate-pulse"
      style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)' }}>
      ⚡ CLOSING SOON
    </span>
  );
  return (
    <span className="text-[7px] font-black px-1.5 py-0.5 rounded border"
      style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.15)' }}>
      OPEN
    </span>
  );
}

export default function MarketCard({ market, participated, onBet, watchlist, onWatchlist }) {
  const secsLeft   = useCountdown(market.endDate);
  const hasEndDate = !!(market.endDate && String(market.endDate).length > 5);
  const isLocked   = market.status === 'locked' || market.status === 'resolved' || market.status === 'archived' || (hasEndDate && secsLeft <= 0);
  const isSolFort  = market.source === 'solfort' || market.source === 'internal';
  const isUrgent   = hasEndDate && secsLeft > 0 && secsLeft <= 60;

  const isBinary = market.outcomes.length === 2;
  const src      = SOURCE_BADGE[market.source] ?? SOURCE_BADGE.internal;

  const borderStyle = isUrgent
    ? 'rgba(251,191,36,0.3)'
    : isSolFort && !isLocked
    ? 'rgba(0,212,170,0.15)'
    : 'rgba(148,163,184,0.08)';

  return (
    <div
      onClick={() => onBet(market)}
      className={`rounded-2xl border p-4 transition-all cursor-pointer ${isLocked ? 'opacity-60' : 'hover:bg-[#111827]'} ${isUrgent ? 'animate-pulse' : ''}`}
      style={{
        background: isUrgent ? 'rgba(13,18,32,0.98)' : 'rgba(13,18,32,0.95)',
        borderColor: borderStyle,
        boxShadow: isUrgent ? '0 0 20px rgba(251,191,36,0.08)' : isSolFort ? '0 0 20px rgba(0,212,170,0.03)' : 'none',
      }}>

      {/* Header: source + status + tags */}
      <div className="flex flex-wrap items-center gap-1 mb-2.5">
        <span className="text-[7px] font-black px-1.5 py-0.5 rounded border flex-shrink-0"
          style={{ background: src.bg, color: src.text, borderColor: src.border }}>{src.label}</span>

        <StatusBadge market={market} secsLeft={secsLeft} hasEndDate={hasEndDate} />

        {isSolFort && market.timeframe && (
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5"
            style={{ background: 'rgba(0,212,170,0.07)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.18)' }}>
            <Zap className="w-2 h-2" />{market.timeframe}
          </span>
        )}

        {market.tags.slice(0, 1).map(tag => {
          const s = TAG_STYLES[tag];
          return s ? <span key={tag} className="text-[7px] font-black px-1.5 py-0.5 rounded border"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}>{tag}</span> : null;
        })}

        {participated && (
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded border"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.2)' }}>✓ IN</span>
        )}
        <RiskBadge market={market} />
        <div className="ml-auto flex items-center gap-1">
          {onWatchlist && <WatchlistButton marketId={market.id} watchlist={watchlist} onToggle={onWatchlist} />}
        </div>
      </div>

      {/* Question */}
      <p className="text-[12px] font-bold text-white leading-snug mb-3">{market.question}</p>

      {/* Countdown for SolFort short markets */}
      {isSolFort && hasEndDate && secsLeft > 0 && secsLeft <= 3600 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-2.5 border"
          style={{
            background: secsLeft <= 30 ? 'rgba(239,68,68,0.08)' : isUrgent ? 'rgba(251,191,36,0.07)' : 'rgba(0,212,170,0.05)',
            borderColor: secsLeft <= 30 ? 'rgba(239,68,68,0.35)' : isUrgent ? 'rgba(251,191,36,0.3)' : 'rgba(0,212,170,0.18)',
            boxShadow: isUrgent ? `0 0 12px ${secsLeft <= 30 ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.08)'}` : 'none',
          }}>
          <span className="text-[8px] font-bold flex items-center gap-1"
            style={{ color: secsLeft <= 30 ? '#f87171' : isUrgent ? '#fbbf24' : '#00d4aa' }}>
            <Clock className="w-2.5 h-2.5" />Resolves in
          </span>
          <span className={`text-[16px] font-black font-mono leading-none ${
            secsLeft <= 30 ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[#00d4aa]'
          }`}>
            {formatTime(secsLeft)}
          </span>
        </div>
      )}

      {/* Outcome visual */}
      {isBinary ? (
        <div className="mb-3">
          <div className="flex rounded-xl overflow-hidden h-7 mb-1.5">
            {market.outcomes.map((o, i) => {
              const isFirst = i === 0;
              const isYes = o.label === 'YES' || isFirst;
              return (
                <div key={o.id}
                  className="flex items-center justify-center text-[9px] font-black text-white transition-all"
                  style={{
                    width: `${Math.round(o.prob * 100)}%`,
                    background: isYes ? 'rgba(34,197,94,0.65)' : 'rgba(239,68,68,0.65)',
                    borderRight: isFirst ? '2px solid rgba(0,0,0,0.4)' : 'none',
                  }}>
                  {Math.round(o.prob * 100) > 15 ? `${o.label} ${Math.round(o.prob * 100)}%` : ''}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between">
            {market.outcomes.map((o, i) => {
              const isYes = o.label === 'YES' || i === 0;
              return (
                <span key={o.id} className="font-mono font-black"
                  style={{ color: isYes ? '#22c55e' : '#ef4444' }}>
                  {o.label}: <span className="text-[13px] text-white">{(1 / o.prob).toFixed(2)}x</span>
                  <span className="text-slate-600 font-normal ml-1 text-[8px]">{Math.round(o.prob * 100)}¢</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 mb-3">
          {market.outcomes.slice(0, 3).map(o => (
            <div key={o.id} className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 w-20 truncate flex-shrink-0">{o.label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(o.prob * 100)}%`, background: '#00d4aa' }} />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 w-8 text-right flex-shrink-0">
                {Math.round(o.prob * 100)}%
              </span>
              <span className="text-[9px] font-mono text-amber-400 font-black w-9 text-right flex-shrink-0">
                {(1 / o.prob).toFixed(1)}x
              </span>
            </div>
          ))}
          {market.outcomes.length > 3 && (
            <p className="text-[8px] text-slate-700">+{market.outcomes.length - 3} more outcomes</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2.5 border-t space-y-2" style={{ borderColor: 'rgba(148,163,184,0.05)' }}>
        <LiquidityBar volume={market.volume} />
        <div className="flex items-center justify-between text-[9px]">
          <AIConfidence market={market} />
          <ProfitMultiplier outcomes={market.outcomes} />
          {market.endDate && !isSolFort && (
            <span className="text-[8px] text-slate-600 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />{daysLeft(market.endDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}