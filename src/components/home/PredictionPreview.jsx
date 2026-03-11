import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

const PREVIEW_MARKETS = [
  { question: 'Will BTC close above $100k today?', yesVol: 64, volume: '$2.4M', ends: '8h', yesOdds: 1.78, noOdds: 2.15 },
  { question: 'Will SOL hit $200 within 7 days?',  yesVol: 58, volume: '$890K', ends: '7d',  yesOdds: 1.95, noOdds: 1.95 },
];

export default function PredictionPreview() {
  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction Market</p>
        </div>
        <Link to={createPageUrl('PredictionMarket')}>
          <span className="text-[10px] text-[#00d4aa] font-semibold flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div className="space-y-2.5">
        {PREVIEW_MARKETS.map((m, i) => (
          <Link key={i} to={createPageUrl('PredictionMarket')}>
            <div className="glass-card rounded-2xl p-3.5 hover:border hover:border-violet-400/10 transition-all">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-bold text-white leading-snug flex-1 pr-2">{m.question}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />{m.ends}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden flex mb-2">
                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${m.yesVol}%` }} />
                <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${100 - m.yesVol}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-emerald-400">YES {m.yesOdds}x</span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] font-bold text-red-400">NO {m.noOdds}x</span>
                </div>
                <span className="text-[10px] text-slate-500">Vol: {m.volume}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}