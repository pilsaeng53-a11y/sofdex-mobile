import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DEFAULTS = {
  BTC: { bull: 1842, bear: 412 },
  ETH: { bull: 982, bear: 621 },
  SOL: { bull: 2140, bear: 380 },
  JUP: { bull: 743, bear: 198 },
  RNDR: { bull: 612, bear: 224 },
};

export default function AssetSentimentVote({ symbol = 'BTC', compact = false }) {
  const def = DEFAULTS[symbol] || { bull: 500, bear: 200 };
  const saved = (() => { try { return JSON.parse(localStorage.getItem(`sentiment_${symbol}`) || 'null'); } catch { return null; } })();

  const [votes, setVotes] = useState(saved || def);
  const [voted, setVoted] = useState(() => { try { return localStorage.getItem(`voted_${symbol}`) || null; } catch { return null; } });

  const total = votes.bull + votes.bear;
  const bullPct = Math.round((votes.bull / total) * 100);
  const bearPct = 100 - bullPct;

  const vote = (side) => {
    if (voted) return;
    const next = { ...votes, [side]: votes[side] + 1 };
    setVotes(next);
    setVoted(side);
    try {
      localStorage.setItem(`sentiment_${symbol}`, JSON.stringify(next));
      localStorage.setItem(`voted_${symbol}`, side);
    } catch {}
  };

  if (compact) return (
    <div className="flex items-center gap-2 bg-[#0a0e1a] rounded-xl px-3 py-2">
      <span className="text-xs text-slate-500 font-semibold">{symbol}</span>
      <div className="flex-1 h-1.5 bg-[#1a2340] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${bullPct}%` }} />
      </div>
      <span className="text-xs text-emerald-400 font-bold">{bullPct}%</span>
      <span className="text-xs text-red-400 font-bold">{bearPct}%</span>
    </div>
  );

  return (
    <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-white">{symbol} Community Sentiment</p>
          <p className="text-xs text-slate-500">{total.toLocaleString()} votes</p>
        </div>
        {voted && (
          <span className="text-xs text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/20 px-2 py-0.5 rounded-lg">
            Voted ✓
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="w-full h-3 bg-[#0a0e1a] rounded-full overflow-hidden mb-3 flex">
        <div className="h-full bg-emerald-400 rounded-l-full transition-all duration-500" style={{ width: `${bullPct}%` }} />
        <div className="h-full bg-red-400 rounded-r-full transition-all duration-500" style={{ width: `${bearPct}%` }} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-sm font-bold text-emerald-400">{bullPct}% Bullish</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-red-400">{bearPct}% Bearish</span>
          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        </div>
      </div>

      {!voted ? (
        <div className="flex gap-2">
          <button
            onClick={() => vote('bull')}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-bold hover:bg-emerald-400/20 transition-all"
          >
            <TrendingUp className="w-4 h-4" /> Bullish
          </button>
          <button
            onClick={() => vote('bear')}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-bold hover:bg-red-400/20 transition-all"
          >
            <TrendingDown className="w-4 h-4" /> Bearish
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-500">You voted <span className={voted === 'bull' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{voted === 'bull' ? '↑ Bullish' : '↓ Bearish'}</span></p>
      )}
    </div>
  );
}