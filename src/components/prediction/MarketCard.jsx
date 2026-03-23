import React from 'react';
import { Clock, TrendingUp, Users } from 'lucide-react';

const TAG_STYLES = {
  'HOT':          'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'TRENDING':     'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'HIGH PAYOUT':  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'AI PICK':      'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/20',
  'ENDING SOON':  'bg-red-500/15 text-red-400 border-red-500/20',
};

function daysLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  const d = Math.ceil(diff / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1 day';
  return `${d}d`;
}

function fmtVol(n) {
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

export default function MarketCard({ market, participated, onBet }) {
  const { question, yesProb, payoutYes, payoutNo, volume, endDate, tags, category } = market;
  const noProb = 1 - yesProb;
  const yesW = Math.round(yesProb * 100);
  const noW  = 100 - yesW;

  return (
    <div
      onClick={() => !participated && onBet(market)}
      className={`rounded-2xl border p-4 transition-all cursor-pointer hover-scale ${participated ? 'opacity-75 cursor-default' : ''}`}
      style={{ background: 'rgba(15,21,37,0.9)', borderColor: 'rgba(148,163,184,0.09)', boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border text-slate-600 border-slate-700">{category}</span>
        {tags.map(tag => (
          <span key={tag} className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${TAG_STYLES[tag] ?? 'bg-slate-700 text-slate-400'}`}>{tag}</span>
        ))}
        {participated && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded border bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20">✓ JOINED</span>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-bold text-white leading-snug mb-3">{question}</p>

      {/* Probability bar */}
      <div className="flex rounded-lg overflow-hidden h-6 mb-2">
        <div className="flex items-center justify-center text-[10px] font-black text-white bg-emerald-500/80 transition-all"
          style={{ width: `${yesW}%` }}>{yesW >= 15 ? `YES ${yesW}%` : ''}</div>
        <div className="flex items-center justify-center text-[10px] font-black text-white bg-red-500/80 transition-all"
          style={{ width: `${noW}%` }}>{noW >= 15 ? `NO ${noW}%` : ''}</div>
      </div>

      {/* Payouts */}
      <div className="flex justify-between text-[10px] mb-3">
        <span className="text-emerald-400 font-mono font-bold">YES: {payoutYes.toFixed(2)}x</span>
        <span className="text-red-400 font-mono font-bold">NO: {payoutNo.toFixed(2)}x</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{fmtVol(volume)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className={daysLeft(endDate) === 'Ended' ? 'text-red-400' : daysLeft(endDate).includes('1 day') || daysLeft(endDate).includes('2d') ? 'text-orange-400' : ''}>{daysLeft(endDate)}</span>
        </div>
      </div>
    </div>
  );
}