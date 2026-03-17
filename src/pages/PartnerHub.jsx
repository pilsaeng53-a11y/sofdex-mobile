import React, { useState, useEffect } from 'react';
import { useUserType } from '../components/shared/UserTypeContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, TrendingUp, Award, Gift, Map, GitBranch, BarChart3, ExternalLink, Copy, Share2, CheckCircle2, Crown, Star, Zap, Wallet, ChevronRight, Lock, Trophy, Globe } from 'lucide-react';
import SolFortLogo from '../components/shared/SolFortLogo';
import DistributorMap from '../components/partner/DistributorMap';
import DistributorLeaderboard from '../components/partner/DistributorLeaderboard';

const AFFILIATES_URL = 'https://www.solfort.foundation/affiliates';

const GRADE_CONFIG = {
  Green:    { commission: '10%', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', badge: '🟢' },
  Purple:   { commission: '30%', color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  badge: '🟣' },
  Gold:     { commission: '40%', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   badge: '🥇' },
  Platinum: { commission: '50%', color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/10',   border: 'border-[#00d4aa]/20',   badge: '💎' },
};

const MY_CODE = 'SOFDEX-K9QR';
const MY_LINK = 'https://sofdex.io/r/K9QR';

const QUICK_LINKS = [
  { label: 'Downline Tree', icon: GitBranch, page: 'DownlineTree', color: '#9945ff' },
  { label: 'Commission', icon: TrendingUp, page: 'CommissionDist', color: '#00d4aa' },
  { label: 'Rank Progress', icon: Award, page: 'RankProgress', color: '#f59e0b' },
  { label: 'Team Board', icon: BarChart3, page: 'TeamLeaderboard', color: '#3b82f6' },
  { label: 'Regional', icon: Map, page: 'RegionalDistributor', color: '#ef4444' },
  { label: 'My Team', icon: Users, page: 'MyTeam', color: '#06b6d4' },
];

// Role-based access helper
function usePartnerRole(isPartnerApproved) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role === 'admin') setIsAdmin(true);
    }).catch(() => {});
  }, []);

  const isDistributor = isPartnerApproved || isAdmin;
  return { isAdmin, isDistributor };
}

// ─── Apply View (Trader / User) ────────────────────────────────────────────
function ApplyView({ applyForPartner, isPartnerPending }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      <div className="text-center pt-8 pb-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Become a SolFort Distributor</h1>
        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">Join our global partner network and earn commissions from your team trading volume.</p>
      </div>

      <div className="space-y-3">
        {Object.entries(GRADE_CONFIG).map(([grade, cfg]) => (
          <div key={grade} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cfg.badge}</span>
              <div>
                <p className={`text-sm font-bold ${cfg.color}`}>{grade} Partner</p>
                <p className="text-xs text-slate-500">Earn {cfg.commission} commission</p>
              </div>
            </div>
            <span className={`text-lg font-black ${cfg.color}`}>{cfg.commission}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3">
        <h3 className="text-sm font-bold text-white">How it works</h3>
        {['Apply and get approved as a distributor', 'Share your referral link with your network', 'Earn commission from your team trading volume', 'Advance tiers for higher commission rates'].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
            <p className="text-xs text-slate-400">{step}</p>
          </div>
        ))}
      </div>

      {isPartnerPending ? (
        <div className="w-full py-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-center">
          <p className="text-sm font-bold text-amber-400">⏳ Application Under Review</p>
          <p className="text-xs text-slate-500 mt-1">Usually 1-2 business days.</p>
        </div>
      ) : (
        <button onClick={applyForPartner}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black font-bold text-sm flex items-center justify-center gap-2">
          <Star className="w-4 h-4" /> Apply as Distributor
        </button>
      )}
      <a href={AFFILIATES_URL} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-[rgba(148,163,184,0.1)] text-slate-400 font-semibold text-sm">
        <ExternalLink className="w-4 h-4" /> Learn More at solfort.foundation
      </a>
    </div>
  );
}

// ─── Full Distributor / Admin Dashboard ────────────────────────────────────
const SALES_METRICS = [
  { label: 'This Month', vol: '$842K', comm: '$336', change: '+18.4%', positive: true },
  { label: 'Last Month', vol: '$712K', comm: '$284', change: '+8.1%', positive: true },
  { label: 'All-Time', vol: '$2.4M', comm: '$1,248', change: '', positive: true },
];

const TEAM_STRUCTURE = [
  { level: 'Direct (L1)', count: 8, vol: '$1.2M', commission: '40%', color: '#00d4aa' },
  { level: 'Level 2', count: 18, vol: '$780K', commission: '20%', color: '#3b82f6' },
  { level: 'Level 3', count: 54, vol: '$420K', commission: '10%', color: '#8b5cf6' },
];

function DistributorDashboard({ isAdmin, applyForPartner, isPartnerPending }) {
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState('dashboard'); // dashboard | map | leaderboard
  const grade = GRADE_CONFIG['Gold'];

  const handleCopy = () => {
    navigator.clipboard.writeText(MY_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SolFortLogo size={36} className="rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-white">Partner Hub</h1>
            <p className="text-xs text-slate-400">{isAdmin ? 'Admin · Full Access' : 'SolFort Distributor Network'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${grade.bg} border ${grade.border}`}>
          <span className="text-base">🥇</span>
          <span className={`text-xs font-bold ${grade.color}`}>Gold</span>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-1 bg-[#0a0e1a] rounded-xl p-1">
        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'map', label: '🗺️ Map' },
          { key: 'leaderboard', label: '🏆 Leaders' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
              section === s.key ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]' : 'text-slate-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {section === 'dashboard' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)]">
              <p className="text-xs text-slate-500 mb-1">Team Vol.</p>
              <p className="text-sm font-black text-white">$2.4M</p>
            </div>
            <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)]">
              <p className="text-xs text-slate-500 mb-1">Commission</p>
              <p className="text-sm font-black text-[#00d4aa]">$1,248</p>
            </div>
            <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)]">
              <p className="text-xs text-slate-500 mb-1">Team Size</p>
              <p className="text-sm font-black text-white">34</p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-br from-[#00d4aa]/10 to-transparent rounded-2xl border border-[#00d4aa]/20 p-4">
            <p className="text-xs text-slate-400 mb-2 font-semibold">Your Referral Code</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-[#0a0e1a] rounded-xl px-4 py-2.5 border border-[rgba(148,163,184,0.08)]">
                <p className="text-base font-black text-[#00d4aa] tracking-widest">{MY_CODE}</p>
              </div>
              <button onClick={handleCopy} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#00d4aa] text-black'}`}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0a0e1a] border border-[rgba(148,163,184,0.06)]">
              <span className="text-xs text-slate-500 truncate flex-1">{MY_LINK}</span>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] text-xs font-semibold text-slate-300 border border-[rgba(148,163,184,0.08)] flex-shrink-0">
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Partner Tools</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LINKS.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all text-center space-y-2">
                      <div className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center" style={{ background: `${item.color}18` }}>
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grade Progress */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Tier Progress</span>
              <Link to={createPageUrl('RankProgress')} className="text-xs text-[#00d4aa]">Details →</Link>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1"><span>🥇</span><span className="text-xs text-amber-400 font-semibold">Gold</span></div>
              <span className="text-xs text-slate-500">→</span>
              <div className="flex items-center gap-1"><span>💎</span><span className="text-xs text-[#00d4aa] font-semibold">Platinum</span></div>
            </div>
            <div className="w-full bg-[#0a0e1a] rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-amber-400 to-[#00d4aa] h-2 rounded-full" style={{ width: '34%' }} />
            </div>
            <p className="text-xs text-slate-500">34 direct partners · need 100 for Platinum</p>
          </div>

          {/* Admin-only: Apply for Regional */}
          <a href={AFFILIATES_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-black font-bold text-sm">
            <ExternalLink className="w-4 h-4" />
            Apply for Regional Distributor
          </a>
        </>
      )}

      {/* ── Map ── */}
      {section === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00d4aa]" />
            <p className="text-sm font-bold text-white">Regional Distributor Map</p>
          </div>
          <p className="text-xs text-slate-500">Tap a pin to view region details, city distributors, wallet addresses and volumes.</p>
          <DistributorMap />
        </div>
      )}

      {/* ── Leaderboard ── */}
      {section === 'leaderboard' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-bold text-white">Distributor Leaderboard</p>
          </div>
          <DistributorLeaderboard />
        </div>
      )}
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────
export default function PartnerHub() {
  const { isPartnerApproved, applyForPartner, isPartnerPending } = useUserType();
  const { isAdmin, isDistributor } = usePartnerRole(isPartnerApproved);

  // Admin and approved distributors see full dashboard
  if (isDistributor) {
    return <DistributorDashboard isAdmin={isAdmin} applyForPartner={applyForPartner} isPartnerPending={isPartnerPending} />;
  }

  // Everyone else sees apply view
  return <ApplyView applyForPartner={applyForPartner} isPartnerPending={isPartnerPending} />;
}