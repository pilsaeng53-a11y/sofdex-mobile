import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Newspaper, ArrowRight, Zap } from 'lucide-react';

const HEADLINES = [
  { cat: 'Bitcoin', title: 'BTC Breaks $100,000 — Institutional FOMO Fuels Historic Rally', time: '12m ago', hot: true },
  { cat: 'Regulation', title: 'SEC Approves Spot Ethereum ETF — Landmark Crypto Decision', time: '38m ago', hot: true },
  { cat: 'Solana', title: 'Solana DeFi TVL Hits $18B — SOL Ecosystem Overtakes Ethereum L2s', time: '1h ago', hot: false },
  { cat: 'RWA', title: 'BlackRock BUIDL Fund Crosses $5B in Tokenized Treasury AUM', time: '2h ago', hot: false },
];

export default function NewsPreview() {
  return (
    <div className="px-4 mb-6">
      {/* Breaking strip */}
      <div className="flex items-center gap-2 bg-orange-400/8 border border-orange-400/15 rounded-xl px-3 py-2 mb-3 overflow-hidden">
        <span className="flex-shrink-0 text-[9px] font-black text-orange-400 bg-orange-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Live</span>
        <p className="text-[11px] text-orange-300/80 truncate">BTC $100K · ETH ETF APPROVED · SOL DeFi $18B TVL</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-bold text-white">Breaking Headlines</span>
        </div>
        <Link to={createPageUrl('News')}>
          <span className="text-[11px] text-[#00d4aa] font-medium flex items-center gap-1">All News <ArrowRight className="w-3 h-3" /></span>
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.05)]">
        {HEADLINES.map((h, i) => (
          <Link key={i} to={createPageUrl('News')}>
            <div className="px-3.5 py-3 flex items-start gap-2.5 hover:bg-[#1a2340] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {h.hot && <Zap className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                  <span className="text-[10px] font-semibold text-[#00d4aa]">{h.cat}</span>
                  <span className="text-[10px] text-slate-600">· {h.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{h.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}