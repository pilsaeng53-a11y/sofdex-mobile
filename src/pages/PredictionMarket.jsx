import React, { useState, useEffect } from 'react';
import { Target, Clock, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['All', 'Crypto', 'Sports', 'Politics', 'Economy', 'Global'];

const PREDICTIONS = [
  // Crypto
  { id: 1, cat: 'Crypto',   question: 'Will BTC close above $100k today?',       yesOdds: 1.78, noOdds: 2.15, volume: '$2.4M',  yesVol: 64, endHours: 8,  featured: true },
  { id: 2, cat: 'Crypto',   question: 'Will SOL hit $200 within 7 days?',         yesOdds: 1.95, noOdds: 1.95, volume: '$890K',  yesVol: 58, endHours: 168 },
  { id: 3, cat: 'Crypto',   question: 'Will ETH ETF inflows exceed $500M this week?', yesOdds: 2.10, noOdds: 1.85, volume: '$1.1M', yesVol: 42, endHours: 72 },
  { id: 4, cat: 'Crypto',   question: 'Will BTC dominance drop below 50% this month?', yesOdds: 2.35, noOdds: 1.68, volume: '$540K', yesVol: 38, endHours: 480 },
  { id: 5, cat: 'Crypto',   question: 'Will JUP outperform SOL in the next 48h?',  yesOdds: 1.90, noOdds: 1.95, volume: '$320K',  yesVol: 52, endHours: 48 },
  // Sports
  { id: 6, cat: 'Sports',   question: 'Will Real Madrid win the Champions League 2026?', yesOdds: 2.20, noOdds: 1.80, volume: '$3.1M', yesVol: 47, endHours: 1440 },
  { id: 7, cat: 'Sports',   question: 'Will Djokovic win the next Grand Slam?',    yesOdds: 1.85, noOdds: 2.05, volume: '$780K',  yesVol: 61, endHours: 720 },
  // Politics
  { id: 8, cat: 'Politics', question: 'Will the US Fed cut rates in Q2 2026?',      yesOdds: 1.72, noOdds: 2.30, volume: '$4.8M',  yesVol: 68, endHours: 2160 },
  { id: 9, cat: 'Politics', question: 'Will there be a G7 crypto regulatory framework this year?', yesOdds: 2.50, noOdds: 1.60, volume: '$1.2M', yesVol: 33, endHours: 4320 },
  // Economy
  { id: 10, cat: 'Economy', question: 'Will global RWA market cap exceed $20T by 2027?', yesOdds: 1.65, noOdds: 2.45, volume: '$2.2M', yesVol: 72, endHours: 8760 },
  { id: 11, cat: 'Economy', question: 'Will US CPI drop below 2% this quarter?',   yesOdds: 2.10, noOdds: 1.85, volume: '$980K',  yesVol: 44, endHours: 1440 },
  // Global
  { id: 12, cat: 'Global',  question: 'Will a major central bank launch a CBDC by end of 2026?', yesOdds: 1.55, noOdds: 2.70, volume: '$1.8M', yesVol: 78, endHours: 6480 },
  { id: 13, cat: 'Global',  question: 'Will gold hit $3000/oz this month?',        yesOdds: 1.90, noOdds: 1.95, volume: '$670K',  yesVol: 56, endHours: 480 },
];

function formatCountdown(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours}h`;
  if (hours < 168) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 168)}w`;
}

function PredictionCard({ market }) {
  const [choice, setChoice] = useState(null); // 'yes' | 'no' | null
  const [confirmed, setConfirmed] = useState(false);

  const handleVote = (side) => {
    if (confirmed) return;
    setChoice(side);
  };

  const handleConfirm = () => {
    if (!choice) return;
    setConfirmed(true);
  };

  return (
    <div className={`glass-card rounded-2xl p-4 ${market.featured ? 'border border-[#00d4aa]/15 glow-border' : ''}`}>
      {/* Category + timer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {market.featured && (
            <span className="px-2 py-0.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] text-[9px] font-bold border border-[#00d4aa]/20 uppercase tracking-wide">
              Featured
            </span>
          )}
          <span className="px-2 py-0.5 rounded-lg bg-[#151c2e] text-slate-400 text-[10px] font-medium">
            {market.cat}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{formatCountdown(market.endHours)}</span>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-bold text-white leading-snug mb-3">{market.question}</p>

      {/* Participation bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-emerald-400 font-semibold">YES {market.yesVol}%</span>
          <span className="text-red-400 font-semibold">NO {100 - market.yesVol}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden flex">
          <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${market.yesVol}%` }} />
          <div className="h-full bg-red-500 rounded-r-full transition-all" style={{ width: `${100 - market.yesVol}%` }} />
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-1 mb-3 text-[10px] text-slate-500">
        <Users className="w-3 h-3" />
        <span>Total Volume: <span className="text-slate-300 font-medium">{market.volume}</span></span>
      </div>

      {/* Confirmed state */}
      {confirmed ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-[#00d4aa]/5 border border-[#00d4aa]/20">
          <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-xs font-semibold text-[#00d4aa]">
            Position placed · {choice === 'yes' ? 'YES' : 'NO'} · {choice === 'yes' ? market.yesOdds : market.noOdds}x payout
          </span>
        </div>
      ) : (
        <>
          {/* YES / NO buttons */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => handleVote('yes')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                choice === 'yes'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              YES · {market.yesOdds}x
            </button>
            <button
              onClick={() => handleVote('no')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                choice === 'no'
                  ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              NO · {market.noOdds}x
            </button>
          </div>

          {/* Confirm button */}
          {choice && (
            <button
              onClick={handleConfirm}
              className="w-full py-2.5 rounded-xl bg-[#00d4aa] text-white text-xs font-bold hover:bg-[#00bfa3] transition-all shadow-lg shadow-[#00d4aa]/20"
            >
              Confirm {choice === 'yes' ? 'YES' : 'NO'} at {choice === 'yes' ? market.yesOdds : market.noOdds}x
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function PredictionMarket() {
  const [cat, setCat] = useState('All');

  const filtered = cat === 'All' ? PREDICTIONS : PREDICTIONS.filter(p => p.cat === cat);
  const totalVol = '$28.4M';
  const openMarkets = PREDICTIONS.length;

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Prediction Market</h1>
        </div>
        <p className="text-[11px] text-slate-500">Trade on real-world outcomes · Non-custodial</p>
      </div>

      {/* Stats bar */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-white">{totalVol}</p>
            <p className="text-[10px] text-slate-500">Total Volume</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-[#00d4aa]">{openMarkets}</p>
            <p className="text-[10px] text-slate-500">Open Markets</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-white">1.95x</p>
            <p className="text-[10px] text-slate-500">Avg Payout</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              cat === c
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="px-4 space-y-3">
        {filtered.map(market => (
          <PredictionCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}