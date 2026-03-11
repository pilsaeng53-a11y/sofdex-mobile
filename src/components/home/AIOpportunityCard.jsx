import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';

const OPPS = [
  { asset: 'JUP',  type: 'Volume Spike',    metric: '8.4x vol', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { asset: 'SOL',  type: 'Whale Accum.',    metric: '3 wallets', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { asset: 'RNDR', type: 'Breakout',        metric: '+12.3%',   color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
];

const SECTORS = [
  { name: 'Solana', change: '+11.3%', trend: 'hot' },
  { name: 'RWA',    change: '+9.2%',  trend: 'hot' },
  { name: 'Crypto', change: '+6.4%',  trend: 'rising' },
];

export default function AIOpportunityCard() {
  return (
    <Link to={createPageUrl('AIIntelligence')}>
      <div className="mx-4 mb-5">
        <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.06)] hover:border-[#00d4aa]/15 transition-all">
          {/* Header */}
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[rgba(148,163,184,0.04)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Opportunity Scanner</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Opportunities */}
          <div className="px-4 pt-2.5 pb-3">
            <div className="space-y-2 mb-3">
              {OPPS.map((o, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${o.bg} flex items-center justify-center text-[9px] font-black ${o.color}`}>
                      {o.asset.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white">{o.asset}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">{o.type}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${o.color}`}>{o.metric}</span>
                </div>
              ))}
            </div>

            {/* Sector strip */}
            <div className="border-t border-[rgba(148,163,184,0.06)] pt-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Hot Sectors</span>
              </div>
              <div className="flex gap-2">
                {SECTORS.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0d1220]">
                    <span className="text-[10px] text-slate-300 font-medium">{s.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{s.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}