import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';

const TAG_STYLES = {
  'HOT':         { bg: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.25)' },
  'TRENDING':    { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  'HIGH PAYOUT': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  'AI PICK':     { bg: 'rgba(0,212,170,0.12)',  text: '#00d4aa', border: 'rgba(0,212,170,0.25)' },
  'ENDING SOON': { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)' },
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
  if (d < 30)  return `${d}d`;
  return `${Math.round(d/30)}mo`;
}

export default function MarketCard({ market, participated, onBet }) {
  const topOutcome = market.outcomes.reduce((b, o) => o.prob > b.prob ? o : b, market.outcomes[0]);
  const maxPayout  = (1 / market.outcomes.reduce((m, o) => Math.min(m, o.prob), 1)).toFixed(1);
  const isBinary   = market.outcomes.length === 2;

  return (
    <div onClick={() => onBet(market)}
      className={`rounded-2xl border p-4 transition-all cursor-pointer ${participated ? 'opacity-60' : 'hover:border-[rgba(0,212,170,0.15)] hover:bg-[#111827]'}`}
      style={{ background: 'rgba(13,18,32,0.9)', borderColor: 'rgba(148,163,184,0.08)' }}>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {market.tags.slice(0,3).map(tag => {
          const s = TAG_STYLES[tag];
          return s ? <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 rounded border"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}>{tag}</span> : null;
        })}
        {participated && <span className="text-[8px] font-black px-1.5 py-0.5 rounded border"
          style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.2)' }}>✓ IN</span>}
      </div>

      {/* Question */}
      <p className="text-[12px] font-bold text-white leading-snug mb-3">{market.question}</p>

      {/* Outcome visual */}
      {isBinary ? (
        <div className="mb-3">
          <div className="flex rounded-lg overflow-hidden h-5 mb-1.5">
            {market.outcomes.map(o => (
              <div key={o.id} className="flex items-center justify-center text-[9px] font-black text-white transition-all"
                style={{ width: `${Math.round(o.prob*100)}%`, background: o.id==='YES'||o.id===market.outcomes[0].id ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)' }}>
                {Math.round(o.prob*100) > 18 ? `${o.label} ${Math.round(o.prob*100)}%` : ''}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px]">
            {market.outcomes.map(o => (
              <span key={o.id} className="font-mono font-bold"
                style={{ color: o.id==='YES'||o.id===market.outcomes[0].id ? '#22c55e' : '#ef4444' }}>
                {o.label}: {(1/o.prob).toFixed(2)}x
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-1 mb-3">
          {market.outcomes.slice(0,3).map(o => (
            <div key={o.id} className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 w-20 truncate">{o.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(o.prob*100)}%`, background: '#00d4aa' }} />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 w-10 text-right">{Math.round(o.prob*100)}%</span>
              <span className="text-[9px] font-mono text-yellow-400 font-bold w-10 text-right">{(1/o.prob).toFixed(1)}x</span>
            </div>
          ))}
          {market.outcomes.length > 3 && <p className="text-[8px] text-slate-600">+{market.outcomes.length-3} more</p>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-[rgba(148,163,184,0.05)]">
        <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{fmtVol(market.volume)}</div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 font-black">Max {maxPayout}x</span>
        </div>
        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{daysLeft(market.endDate)}</div>
      </div>
    </div>
  );
}