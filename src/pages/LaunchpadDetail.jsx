import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Users, CheckCircle2, Clock, TrendingUp, Star, ExternalLink, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import { LAUNCHPAD_PROJECTS, CATEGORY_COLORS, STATUS_CONFIG } from '../components/launchpad/launchpadData';

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'tokenomics',  label: 'Tokenomics' },
  { key: 'roadmap',     label: 'Roadmap' },
  { key: 'team',        label: 'Team' },
  { key: 'participate', label: 'Participate' },
];

export default function LaunchpadDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get('id') || '1');
  const project = LAUNCHPAD_PROJECTS.find(p => p.id === projectId) || LAUNCHPAD_PROJECTS[0];

  const [activeTab, setActiveTab] = useState('overview');
  const [watchlisted, setWatchlisted] = useState(false);

  const status = STATUS_CONFIG[project.status];
  const catCfg = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.DeFi;
  const pct = Math.min(project.progress, 100);

  return (
    <div className="min-h-screen pb-10">
      {/* Back header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{project.name}</p>
          <p className="text-[10px] text-slate-500">{project.ticker} · {project.network}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${status.color}`}>{status.label}</span>
      </div>

      {/* Hero */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center border border-[#00d4aa]/15 flex-shrink-0">
            <span className="text-xl font-black text-[#00d4aa]">{project.ticker.slice(0,2)}</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${catCfg.bg} ${catCfg.text} ${catCfg.border}`}>{project.category}</span>
              <span className="text-[9px] text-slate-600">{project.network}</span>
              {project.roi && <span className="text-[10px] font-bold text-emerald-400">ROI: {project.roi}</span>}
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
      </div>

      {/* Raise progress card */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-2xl p-4 glow-border">
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-slate-500">Raised <span className="text-white font-bold text-sm">{project.raise}</span></span>
            <span className="text-slate-500">Target <span className="text-white font-bold text-sm">{project.target}</span></span>
          </div>
          <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-3">
            <span>{pct}% funded</span>
            {project.participants > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.participants.toLocaleString()} participants</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              ['Token Price', project.price],
              ['Launch Date', project.launchDate],
              ['Min. Invest', project.minParticipation],
              ['Max. Invest', project.maxParticipation],
            ].map(([label, val]) => (
              <div key={label} className="bg-[#0d1220] rounded-xl px-3 py-2">
                <p className="text-slate-600 text-[9px]">{label}</p>
                <p className="text-white font-semibold mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mb-4 flex gap-2">
        {project.status === 'live' && (
          <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black text-sm font-bold hover:opacity-90 transition-opacity">
            Participate Now
          </button>
        )}
        {project.status === 'upcoming' && (
          <button className="flex-1 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">
            <Clock className="w-4 h-4 inline mr-1.5" />Opening Soon
          </button>
        )}
        {project.status === 'completed' && (
          <button className="flex-1 py-3 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400 text-sm font-semibold" disabled>
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />Sale Completed
          </button>
        )}
        <button
          onClick={() => setWatchlisted(w => !w)}
          className={`px-3.5 py-3 rounded-xl border text-sm transition-all ${watchlisted ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' : 'bg-[#151c2e] border-[rgba(148,163,184,0.1)] text-slate-400'}`}
        >
          <Star className={`w-4 h-4 ${watchlisted ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">

        {/* ── OVERVIEW ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(0,212,170,0.08)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Vision</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{project.vision}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="glass-card rounded-2xl p-4 border border-[rgba(239,68,68,0.08)]">
                <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-wider mb-1.5">Problem</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{project.problem}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-[rgba(34,197,94,0.08)]">
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider mb-1.5">Solution</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{project.solution}</p>
              </div>
            </div>
          </>
        )}

        {/* ── TOKENOMICS ────────────────────────────────────────── */}
        {activeTab === 'tokenomics' && (
          <>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Token Details</p>
              {[
                ['Token Symbol', project.ticker],
                ['Total Supply', project.totalSupply],
                ['Launch Allocation', project.launchAllocation],
                ['Token Price', project.price],
                ['Vesting', project.vesting],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[rgba(148,163,184,0.04)] last:border-0">
                  <span className="text-[11px] text-slate-500">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-300">{val}</span>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Token Utility</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{project.tokenUtility}</p>
            </div>
          </>
        )}

        {/* ── ROADMAP ───────────────────────────────────────────── */}
        {activeTab === 'roadmap' && (
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)] space-y-0">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-4">Project Roadmap</p>
            {project.roadmap.map((item, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    item.done ? 'bg-[#00d4aa] border-[#00d4aa]' : item.current ? 'bg-transparent border-[#00d4aa]' : 'bg-transparent border-[#1a2340]'
                  }`}>
                    {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                    {item.current && <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />}
                  </div>
                  {i < project.roadmap.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${item.done ? 'bg-[#00d4aa]/40' : 'bg-[#1a2340]'}`} style={{ minHeight: '20px' }} />
                  )}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-bold text-white">{item.phase}</p>
                    {item.current && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20">Current</span>}
                  </div>
                  <p className="text-[10px] text-slate-600 mb-1">{item.date}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TEAM ─────────────────────────────────────────────── */}
        {activeTab === 'team' && (
          <>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Core Team</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{project.team}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(0,212,170,0.08)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Investors & Backers</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{project.backers}</p>
            </div>
          </>
        )}

        {/* ── PARTICIPATE ──────────────────────────────────────── */}
        {activeTab === 'participate' && (
          <>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">How to Participate</p>
              {[
                ['1. Connect Wallet', 'Connect your Solana wallet (Phantom, Backpack, etc.) to SOFDex.'],
                ['2. Complete KYC', 'Verify your identity to meet compliance requirements for this launch.'],
                ['3. Enter Amount', `Invest between ${project.minParticipation} and ${project.maxParticipation} worth of USDC.`],
                ['4. Confirm & Receive', `Tokens distributed at ${project.vesting}.`],
              ].map(([step, desc]) => (
                <div key={step} className="flex items-start gap-3 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0">
                  <ChevronRight className="w-4 h-4 text-[#00d4aa] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-bold text-white">{step}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk note */}
            <div className="glass-card rounded-2xl p-4 border border-[rgba(239,68,68,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">Risk Disclosure</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This is an early-stage token launch. Token investments carry significant risk including potential total loss. This is not financial advice. Participation is subject to local regulations. Past performance of other launches does not guarantee future results. Only invest what you can afford to lose.
              </p>
            </div>

            {/* CTA */}
            {project.status === 'live' && (
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black font-bold text-sm hover:opacity-90 transition-opacity">
                Participate Now
              </button>
            )}
            {project.status === 'upcoming' && (
              <button className="w-full py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm">
                <Clock className="w-4 h-4 inline mr-2" />Launch opens {project.launchDate}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}