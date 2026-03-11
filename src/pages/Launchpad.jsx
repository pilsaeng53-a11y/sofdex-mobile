import React, { useState } from 'react';
import { Rocket, Clock, CheckCircle2, Star, Users, TrendingUp } from 'lucide-react';

const PROJECTS = [
  {
    name: 'SolFort Protocol', ticker: 'SFLP', status: 'live',
    description: 'Next-gen DeFi protocol built on Solana for institutional-grade yield optimization.',
    raise: '$4.2M', target: '$5M', progress: 84, participants: 2341,
    price: '$0.042', date: 'Mar 20, 2026', category: 'DeFi',
  },
  {
    name: 'RealChain', ticker: 'RLCH', status: 'upcoming',
    description: 'Tokenized real-world assets marketplace with KYC-gated access and on-chain settlement.',
    raise: '-', target: '$8M', progress: 0, participants: 0,
    price: '$0.12', date: 'Apr 5, 2026', category: 'RWA',
  },
  {
    name: 'NovaDEX', ticker: 'NOVA', status: 'upcoming',
    description: 'Decentralized perpetuals exchange with dynamic AMM and on-chain risk engine.',
    raise: '-', target: '$3.5M', progress: 0, participants: 0,
    price: '$0.08', date: 'Apr 18, 2026', category: 'Exchange',
  },
  {
    name: 'MetaGrid AI', ticker: 'MGAI', status: 'completed',
    description: 'AI-powered analytics layer for DeFi protocols providing predictive intelligence.',
    raise: '$6.8M', target: '$6.8M', progress: 100, participants: 5820,
    price: '$0.025', date: 'Feb 14, 2026', category: 'AI',
  },
  {
    name: 'GreenYield', ticker: 'GRNY', status: 'completed',
    description: 'Sustainable yield farming protocol linking green energy credits with DeFi incentives.',
    raise: '$2.1M', target: '$2M', progress: 100, participants: 1890,
    price: '$0.055', date: 'Jan 30, 2026', category: 'RWA',
  },
];

const statusConfig = {
  live: { label: 'Live', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: TrendingUp },
  upcoming: { label: 'Upcoming', color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: Clock },
  completed: { label: 'Completed', color: 'bg-slate-400/10 text-slate-400 border-slate-400/20', icon: CheckCircle2 },
};

const categoryColors = {
  DeFi: 'text-purple-400 bg-purple-400/10',
  RWA: 'text-amber-400 bg-amber-400/10',
  Exchange: 'text-blue-400 bg-blue-400/10',
  AI: 'text-cyan-400 bg-cyan-400/10',
};

function ProjectCard({ p }) {
  const cfg = statusConfig[p.status];
  const Icon = cfg.icon;
  return (
    <div className="glass-card rounded-2xl p-4 glow-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center">
            <span className="text-xs font-black text-[#00d4aa]">{p.ticker.slice(0, 2)}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{p.name}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryColors[p.category] || 'text-slate-400 bg-slate-400/10'}`}>
              {p.category}
            </span>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${cfg.color}`}>
          <Icon className="w-3 h-3" />{cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{p.description}</p>

      {p.status !== 'upcoming' && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-slate-500">Raised: <span className="text-white font-medium">{p.raise}</span></span>
            <span className="text-slate-500">Target: <span className="text-white font-medium">{p.target}</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] rounded-full" style={{ width: `${p.progress}%` }} />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">{p.progress}% funded</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Price: <span className="text-[#00d4aa] font-medium">{p.price}</span></span>
          {p.participants > 0 && (
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3" />{p.participants.toLocaleString()}
            </span>
          )}
        </div>
        <span className="text-slate-500">{p.date}</span>
      </div>

      {p.status === 'live' && (
        <button className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black text-xs font-bold hover:opacity-90 transition-opacity">
          Participate Now
        </button>
      )}
      {p.status === 'upcoming' && (
        <button className="mt-3 w-full py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-semibold hover:border-[#00d4aa]/20 transition-all flex items-center justify-center gap-1.5">
          <Star className="w-3.5 h-3.5" />Notify Me
        </button>
      )}
    </div>
  );
}

export default function Launchpad() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.status === filter);

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Launchpad</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">Curated token launches on SolFort</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Raised', value: '$13.1M' },
          { label: 'Projects', value: String(PROJECTS.length) },
          { label: 'Participants', value: '10.0K+' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className="text-base font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {['all', 'live', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((p, i) => <ProjectCard key={i} p={p} />)}
      </div>
    </div>
  );
}