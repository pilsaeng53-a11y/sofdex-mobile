import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AISentimentCard() {
  return (
    <Link to={createPageUrl('AIIntelligence')}>
      <div className="mx-4 mb-5">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10 hover:border-[#00d4aa]/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00d4aa]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Market Sentiment</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xl font-black text-emerald-400">Bullish</p>
                <p className="text-[10px] text-slate-500 mt-0.5">High Confidence · Score 74/100</p>
              </div>
              <div className="text-right">
                <div className="flex gap-1.5">
                  <span className="px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 text-[9px] font-bold border border-emerald-400/20">AI Signals: 6 Bullish</span>
                </div>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
              <div className="h-full w-[74%] bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}