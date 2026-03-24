/**
 * MarketEngagement — shared engagement widgets for prediction markets.
 * Liquidity, Risk, AI Confidence, Odds Movement, Timer, Profit Multiplier.
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle, Flame, Brain, Clock, Bookmark, BookmarkCheck } from 'lucide-react';

// ─── Liquidity Bar ─────────────────────────────────────────────────────────
export function LiquidityBar({ volume, max = 1000000 }) {
  const pct = Math.min((volume / max) * 100, 100);
  const level = pct > 60 ? 'high' : pct > 25 ? 'medium' : 'low';
  const colors = { high: '#22c55e', medium: '#f59e0b', low: '#94a3b8' };
  const labels = { high: 'High Liquidity', medium: 'Medium', low: 'Low' };
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[level] }} />
      </div>
      <span className="text-[8px] font-bold flex-shrink-0" style={{ color: colors[level] }}>{labels[level]}</span>
    </div>
  );
}

// ─── Risk Badge ────────────────────────────────────────────────────────────
export function RiskBadge({ market }) {
  const maxProb = Math.max(...(market.outcomes?.map(o => o.prob) ?? [0.5]));
  const risk = maxProb > 0.75 ? 'low' : maxProb > 0.5 ? 'medium' : 'high';
  const cfg = {
    low:    { icon: ShieldCheck,    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)',    label: 'Low Risk' },
    medium: { icon: AlertTriangle,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)',   label: 'Med Risk' },
    high:   { icon: Flame,          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)',    label: 'High Risk' },
  }[risk];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-0.5 text-[7px] font-black px-1.5 py-0.5 rounded border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

// ─── AI Confidence ─────────────────────────────────────────────────────────
export function AIConfidence({ market }) {
  // Derive from top outcome probability
  const topProb = Math.max(...(market.outcomes?.map(o => o.prob) ?? [0.5]));
  const bullish = topProb >= 0.5;
  const confidence = Math.round(topProb * 100);
  return (
    <div className="flex items-center gap-1">
      <Brain className="w-3 h-3" style={{ color: bullish ? '#00d4aa' : '#f87171' }} />
      <span className="text-[8px] font-bold" style={{ color: bullish ? '#00d4aa' : '#f87171' }}>
        AI {bullish ? '▲' : '▼'} {confidence}%
      </span>
    </div>
  );
}

// ─── Odds Movement ─────────────────────────────────────────────────────────
export function OddsMovement({ delta = 0 }) {
  if (Math.abs(delta) < 0.005) return null;
  const up = delta > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-0.5 text-[8px] font-black"
      style={{ color: up ? '#22c55e' : '#ef4444' }}>
      <Icon className="w-3 h-3" />
      {up ? '+' : ''}{(delta * 100).toFixed(1)}%
    </span>
  );
}

// ─── Market Timer ──────────────────────────────────────────────────────────
export function MarketTimer({ endDate }) {
  const [left, setLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const ms = new Date(endDate) - new Date();
      if (ms <= 0) { setLeft('Ended'); setUrgent(true); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      if (h === 0 && m < 5) {
        setUrgent(true);
        if (m === 0 && s <= 20) {
          setLeft(`🔒 ${s}s`);
        } else {
          setLeft(m === 0 ? `${s}s` : `${m}m ${s}s`);
        }
      } else {
        setUrgent(false);
        setLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  return (
    <span className="inline-flex items-center gap-0.5 text-[8px] font-black"
      style={{ color: urgent ? '#ef4444' : '#94a3b8' }}>
      <Clock className="w-2.5 h-2.5" />
      {left}
    </span>
  );
}

// ─── Profit Multiplier ─────────────────────────────────────────────────────
export function ProfitMultiplier({ outcomes }) {
  const minProb = Math.min(...(outcomes?.map(o => o.prob) ?? [0.5]), 1);
  const mult = (1 / Math.max(minProb, 0.01)).toFixed(1);
  const isHigh = parseFloat(mult) >= 5;
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
      style={{ background: isHigh ? 'rgba(251,191,36,0.12)' : 'rgba(148,163,184,0.06)', border: `1px solid ${isHigh ? 'rgba(251,191,36,0.25)' : 'rgba(148,163,184,0.1)'}` }}>
      <span className="text-[9px] font-black" style={{ color: isHigh ? '#fbbf24' : '#94a3b8' }}>
        ⚡ {mult}x
      </span>
    </div>
  );
}

// ─── Watchlist Button ──────────────────────────────────────────────────────
export function WatchlistButton({ marketId, watchlist, onToggle }) {
  const saved = watchlist?.has(marketId);
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(marketId); }}
      className="flex items-center justify-center w-6 h-6 rounded-lg transition-all"
      style={{ background: saved ? 'rgba(251,191,36,0.12)' : 'transparent' }}>
      {saved
        ? <BookmarkCheck className="w-3.5 h-3.5 text-yellow-400" />
        : <Bookmark className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400" />}
    </button>
  );
}