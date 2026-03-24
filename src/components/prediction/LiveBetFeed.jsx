/**
 * LiveBetFeed — simulated real-time feed of recent bets.
 * Shows recent activity, big bet highlights, and copy-bet functionality.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Zap, TrendingUp, Copy } from 'lucide-react';

const NAMES = ['whale_42', 'crypto_ki', 'prediction_pro', 'sol_trader', 'bet_master', 'alpha_chad', 'degen_8', 'moon_bet', 'gg_wagmi', 'hodlr99'];
const OUTCOMES = ['YES', 'NO', 'OVER', 'UNDER', 'Team A', 'Team B'];

function generateBet(markets) {
  if (!markets?.length) return null;
  const market = markets[Math.floor(Math.random() * markets.length)];
  const outcome = market.outcomes?.[Math.floor(Math.random() * market.outcomes.length)];
  const amount = Math.round([25, 50, 100, 250, 500, 1000, 5000][Math.floor(Math.random() * 7)]);
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const payout = outcome ? (1 / Math.max(outcome.prob, 0.01)).toFixed(2) : '2.00';
  return {
    id: Math.random().toString(36).slice(2),
    name,
    market,
    outcomeLabel: outcome?.label ?? 'YES',
    amount,
    payout,
    isBig: amount >= 500,
    ts: new Date(),
  };
}

function timeAgo(ts) {
  const s = Math.floor((new Date() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function LiveBetFeed({ markets = [], onCopyBet }) {
  const [feed, setFeed] = useState([]);
  const timerRef = useRef(null);

  // Seed initial feed
  useEffect(() => {
    if (!markets.length) return;
    const initial = Array.from({ length: 5 }, () => generateBet(markets)).filter(Boolean);
    setFeed(initial);
  }, [markets.length]);

  // Drip new bets
  useEffect(() => {
    if (!markets.length) return;
    timerRef.current = setInterval(() => {
      const bet = generateBet(markets);
      if (!bet) return;
      setFeed(prev => [bet, ...prev].slice(0, 20));
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(timerRef.current);
  }, [markets.length]);

  if (!feed.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'rgba(10,14,26,0.9)', borderColor: 'rgba(148,163,184,0.07)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'rgba(148,163,184,0.05)' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
        <span className="text-[9px] font-black text-white">Live Bets</span>
        <span className="text-[8px] text-slate-500 ml-auto">real-time activity</span>
      </div>

      {/* Feed items */}
      <div className="divide-y" style={{ divideColor: 'rgba(148,163,184,0.04)' }}>
        {feed.slice(0, 8).map((bet, i) => (
          <div key={bet.id}
            className="flex items-center gap-2 px-3 py-2 transition-all"
            style={{
              background: bet.isBig ? 'rgba(251,191,36,0.04)' : 'transparent',
              borderLeft: bet.isBig ? '2px solid rgba(251,191,36,0.4)' : '2px solid transparent',
              animation: i === 0 ? 'fadeIn 0.4s ease' : undefined,
            }}>

            {/* User avatar */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black"
              style={{ background: bet.isBig ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.1)', color: bet.isBig ? '#fbbf24' : '#94a3b8' }}>
              {bet.isBig ? '🐋' : bet.name[0].toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-white truncate">{bet.name}</span>
                {bet.isBig && <span className="text-[7px] font-black px-1 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>🐋 BIG</span>}
                <span className="text-[7px] text-slate-600 ml-auto flex-shrink-0">{timeAgo(bet.ts)}</span>
              </div>
              <p className="text-[8px] text-slate-500 truncate">{bet.market.question}</p>
            </div>

            {/* Amount + outcome */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-[9px] font-black font-mono" style={{ color: bet.isBig ? '#fbbf24' : '#00d4aa' }}>
                ${bet.amount}
              </span>
              <span className="text-[7px] font-bold px-1 py-0.5 rounded"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>
                {bet.outcomeLabel}
              </span>
            </div>

            {/* Copy bet */}
            <button
              onClick={() => onCopyBet?.(bet)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-[#00d4aa]/10"
              title="Copy this bet">
              <Copy className="w-3 h-3 text-slate-600 hover:text-[#00d4aa]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}