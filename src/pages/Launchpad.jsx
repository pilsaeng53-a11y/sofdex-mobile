import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket, Clock, CheckCircle2, TrendingUp, Users, Search, ChevronRight, Zap, BarChart3 } from 'lucide-react';
import { LAUNCHPAD_PROJECTS, CATEGORY_COLORS, STATUS_CONFIG } from '../components/launchpad/launchpadData';

const CATEGORIES = ['All', 'Infrastructure', 'AI', 'RWA', 'DeFi', 'Gaming', 'Social', 'Solana Ecosystem'];
const STATUS_FILTERS = ['all', 'live', 'upcoming', 'completed'];

const STATS = [
  { label: 'Total Raised',   value: '$15.3M' },
  { label: 'Projects',       value: '5' },
  { label: 'Participants',   value: '14.7K+' },
  { label: 'Avg ROI',        value: '+240%' },
  { label: 'Upcoming',       value: '2' },
];

function ProjectCard({ project }) {
  const status = STATUS_CONFIG[project.status];
  const catCfg = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.DeFi;
  return (
    <Link to={`${createPageUrl('LaunchpadDetail')}?id=${project.id}`}>
      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)] hover:border-[#00d4aa]/20 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center border border-[#00d4aa]/10 flex-shrink-0">
              <span className="text-sm font-black text-[#00d4aa]">{project.ticker.slice(0,2)}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{project.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catCfg.bg} ${catCfg.text} ${catCfg.border}`}>{project.category}</span>
                <span className="text-[9px] text-slate-600">{project.network}</span>
              </div>
            </div>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg border ${status.color}`}>{status.label}</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{project.description}</p>

        {/* Progress */}
        {project.status !== 'upcoming' && (
          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">Raised <span className="text-white font-semibold">{project.raise}</span></span>
              <span className="text-slate-500">Target <span className="text-white font-semibold">{project.target}</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] rounded-full transition-all" style={{ width: `${Math.min(project.progress, 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{project.progress}% funded</p>
          </div>
        )}
        {project.status === 'upcoming' && (
          <div className="mb-3 glass-card rounded-xl p-2.5 border border-blue-400/10">
            <p className="text-[10px] text-blue-400 font-semibold">Opens {project.launchDate}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Target raise: {project.target}</p>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-500">Token: <span className="text-[#00d4aa] font-semibold">{project.ticker}</span></span>
            <span className="text-slate-500">{project.price}</span>
            {project.participants > 0 && (
              <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />{project.participants.toLocaleString()}</span>
            )}
            {project.roi && (
              <span className="text-emerald-400 font-semibold">{project.roi}</span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </Link>
  );
}

export default function Launchpad() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = LAUNCHPAD_PROJECTS.filter(p => {
    const matchStatus   = statusFilter === 'all' || p.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch   = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.ticker.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const live      = LAUNCHPAD_PROJECTS.filter(p => p.status === 'live');
  const upcoming  = LAUNCHPAD_PROJECTS.filter(p => p.status === 'upcoming');

  return (
    <div className="min-h-screen pb-8">
      {/* Hero */}
      <div className="relative px-4 pt-5 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4aa]/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center">
            <Rocket className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Launchpad</h1>
        </div>
        <p className="text-sm font-semibold text-[#00d4aa] mb-1.5">Discover and participate in upcoming token launches</p>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-sm">
          SOFDex Launchpad curates high-potential projects across Web3, RWA, and infrastructure — giving you early access to tomorrow's leading protocols.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black text-xs font-bold"
          >
            Explore Projects
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className="px-4 py-2 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-semibold hover:border-[#00d4aa]/20 transition-all"
          >
            View Upcoming
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {STATS.map((s, i) => (
            <div key={i} className="flex-shrink-0 glass-card rounded-xl px-3 py-2.5 text-center border border-[rgba(148,163,184,0.05)] min-w-[80px]">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live highlight */}
      {live.length > 0 && statusFilter === 'all' && !search && (
        <div className="px-4 mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Live Now</p>
          </div>
          <div className="space-y-3">
            {live.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects or tokens…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30 transition-colors"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="px-4 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                categoryFilter === c
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-slate-500 border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="px-4 mb-4 flex gap-1.5">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all ${
              statusFilter === f
                ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Project list */}
      <div className="px-4 space-y-3">
        {(statusFilter === 'all' && !search && !CATEGORIES.slice(1).includes(categoryFilter) ? filtered.filter(p => p.status !== 'live') : filtered).map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Rocket className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}