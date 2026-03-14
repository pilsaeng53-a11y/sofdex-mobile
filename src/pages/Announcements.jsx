import React, { useState } from 'react';
import { Megaphone, ChevronDown, ChevronUp, TrendingUp, Settings, Star, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';

const CATEGORY_CONFIG = {
  revenue:     { icon: TrendingUp,  color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Revenue' },
  update:      { icon: Settings,    color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    label: 'Update' },
  listing:     { icon: Star,        color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   label: 'Listing' },
  governance:  { icon: Shield,      color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  label: 'Governance' },
  maintenance: { icon: RefreshCw,   color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  label: 'Maintenance' },
  notice:      { icon: AlertTriangle,color: 'text-red-400',    bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Notice' },
};

const ANNOUNCEMENTS = [
  {
    id: 1,
    category: 'revenue',
    title: 'Monthly Trading Fee Revenue — February 2026',
    date: 'Mar 1, 2026',
    pinned: true,
    summary: 'SOFDex February 2026 monthly fee revenue report and distribution summary.',
    content: {
      type: 'revenue_report',
      period: 'February 2026',
      grossRevenue: '$842,400',
      operatingCosts: '$168,480',
      operatingCostPct: '20%',
      affiliateShare: '$421,200',
      affiliateSharePct: '50%',
      distributableAmount: '$252,720',
      breakdown: [
        { label: 'Gross Exchange Fee Revenue', value: '$842,400', note: 'All trading, swap, and settlement fees' },
        { label: 'Operating Cost Deduction (20%)', value: '− $168,480', note: 'Infrastructure, team, audits, operations' },
        { label: 'Net Revenue After Costs', value: '$673,920', note: '' },
        { label: 'Sales Partner / Affiliate Share (50%)', value: '− $421,200', note: 'Distributed to qualified affiliate partners' },
        { label: 'Final Distributable Amount', value: '$252,720', note: 'Distributed to SOF stakers and treasury', highlight: true },
      ],
      stakers: '$126,360',
      treasury: '$101,088',
      buyback: '$25,272',
    },
  },
  {
    id: 2,
    category: 'revenue',
    title: 'Monthly Trading Fee Revenue — January 2026',
    date: 'Feb 1, 2026',
    pinned: false,
    summary: 'SOFDex January 2026 monthly fee revenue report and distribution summary.',
    content: {
      type: 'revenue_report',
      period: 'January 2026',
      grossRevenue: '$618,200',
      operatingCosts: '$123,640',
      affiliateShare: '$309,100',
      distributableAmount: '$185,460',
      breakdown: [
        { label: 'Gross Exchange Fee Revenue', value: '$618,200', note: 'All trading, swap, and settlement fees' },
        { label: 'Operating Cost Deduction (20%)', value: '− $123,640', note: 'Infrastructure, team, audits, operations' },
        { label: 'Net Revenue After Costs', value: '$494,560', note: '' },
        { label: 'Sales Partner / Affiliate Share (50%)', value: '− $309,100', note: 'Distributed to qualified affiliate partners' },
        { label: 'Final Distributable Amount', value: '$185,460', note: 'Distributed to SOF stakers and treasury', highlight: true },
      ],
      stakers: '$92,730',
      treasury: '$74,184',
      buyback: '$18,546',
    },
  },
  {
    id: 3,
    category: 'listing',
    title: 'New Listing: AAPLx & NVDAx Tokenized Equities Now Live',
    date: 'Mar 10, 2026',
    pinned: true,
    summary: 'SOFDex has listed tokenized Apple (AAPLx) and NVIDIA (NVDAx) equities. Trade fractional US stocks 24/7 on Solana.',
    content: {
      type: 'general',
      body: [
        'AAPLx and NVDAx are now live on SOFDex Markets under the RWA → Stocks section.',
        'Both assets are tokenized representations of underlying equity positions, tracked via real-time price oracles.',
        'Trading is available 24/7 with no minimum position size.',
        'Yield distribution applies when underlying dividends are declared.',
        'These assets comply with SOFDex tokenized equity standards under the SolFort RWA framework.',
      ],
    },
  },
  {
    id: 4,
    category: 'update',
    title: 'Platform Update v2.4 — AI Intelligence Engine & Referral Dashboard',
    date: 'Mar 14, 2026',
    pinned: true,
    summary: 'Version 2.4 introduces per-asset AI dynamic scoring, a full referral earnings dashboard, announcements center, and My Grade section.',
    content: {
      type: 'general',
      body: [
        'AI Intelligence: Per-asset dynamic scoring with reasoning summaries, market factor disclosure, and AI disclaimers added across all sections.',
        'Referral Dashboard: Full earnings history (daily/weekly/monthly/yearly), referred user activity tracking, pending vs. paid earnings, and Claim Rewards button.',
        'Announcements Center: Exchange notices, revenue reports, listing updates, and governance notices now visible in-app.',
        'My Grade: Users can view their current commission grade (Green/Purple/Gold/Platinum) inside the SolFort Hub.',
        'My Partners: Linked partner wallet addresses and grades displayed in the SolFort Hub.',
        'Launchpad Detail Pages: Full tabbed project detail pages with tokenomics, roadmap, team, and participation guides.',
      ],
    },
  },
  {
    id: 5,
    category: 'governance',
    title: 'Governance Vote: SOF Staking Yield Increase Proposal — GVP-008',
    date: 'Mar 8, 2026',
    pinned: false,
    summary: 'Community vote is open for GVP-008: Increase staking yield allocation from 40% to 50% of distributable fees. Voting closes Mar 22.',
    content: {
      type: 'general',
      body: [
        'Proposal GVP-008 proposes reallocating fee distribution: increase staker share from 40% to 50% of distributable amount.',
        'The change would reduce treasury allocation from 40% to 30%, with buyback unchanged at 10%.',
        'Voting period: March 8 – March 22, 2026.',
        'Eligible voters: All SOF holders with ≥1,000 SOF staked.',
        'Visit the Governance page to cast your vote.',
      ],
    },
  },
  {
    id: 6,
    category: 'maintenance',
    title: 'Scheduled Maintenance — March 18, 2026 02:00–04:00 UTC',
    date: 'Mar 12, 2026',
    pinned: false,
    summary: 'SOFDex will undergo scheduled infrastructure maintenance on March 18. Trading may be temporarily suspended during the window.',
    content: {
      type: 'general',
      body: [
        'Maintenance window: March 18, 2026, 02:00–04:00 UTC (2 hours).',
        'Services affected: Perpetual trading, RWA settlement, swap functionality.',
        'Spot wallet balances and positions will remain safe during maintenance.',
        'Open positions will not be affected. No new orders can be placed during the window.',
        'We recommend reducing leverage on open positions before the maintenance window as a precaution.',
      ],
    },
  },
];

function RevenueReportCard({ content }) {
  return (
    <div className="space-y-2 mt-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period: {content.period}</p>
      <div className="glass-card rounded-xl divide-y divide-[rgba(148,163,184,0.05)]">
        {content.breakdown.map((row, i) => (
          <div key={i} className={`px-3 py-2.5 flex items-center justify-between ${row.highlight ? 'bg-emerald-400/5' : ''}`}>
            <div>
              <p className={`text-[11px] font-semibold ${row.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>{row.label}</p>
              {row.note && <p className="text-[9px] text-slate-600">{row.note}</p>}
            </div>
            <p className={`text-[11px] font-bold ${row.value.startsWith('−') ? 'text-red-400' : row.highlight ? 'text-emerald-400' : 'text-white'}`}>{row.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['SOF Stakers', content.stakers, 'text-[#00d4aa]'], ['Treasury', content.treasury, 'text-blue-400'], ['Buyback & Burn', content.buyback, 'text-orange-400']].map(([label, val, color]) => (
          <div key={label} className="glass-card rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-slate-600">{label}</p>
            <p className={`text-[11px] font-bold mt-0.5 ${color}`}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementCard({ item }) {
  const [expanded, setExpanded] = useState(item.pinned && item.id === 1);
  const cfg = CATEGORY_CONFIG[item.category];
  const Icon = cfg.icon;
  return (
    <div className={`glass-card rounded-2xl border ${cfg.border} overflow-hidden`}>
      <button onClick={() => setExpanded(v => !v)} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
              {item.pinned && <span className="text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10">📌 Pinned</span>}
              <span className="text-[9px] text-slate-600 ml-auto">{item.date}</span>
            </div>
            <p className="text-[12px] font-bold text-white leading-snug">{item.title}</p>
            {!expanded && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.summary}</p>}
          </div>
          <div className="flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{item.summary}</p>
          {item.content.type === 'revenue_report' ? (
            <RevenueReportCard content={item.content} />
          ) : (
            <div className="space-y-2 mt-2">
              {item.content.body.map((para, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold ${cfg.color} flex-shrink-0 mt-0.5`}>·</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{para}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Announcements() {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'revenue', 'update', 'listing', 'governance', 'maintenance'];
  const filtered = filter === 'all' ? ANNOUNCEMENTS : ANNOUNCEMENTS.filter(a => a.category === filter);

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Announcements</h1>
        </div>
        <p className="text-[11px] text-slate-500">Exchange notices, revenue reports, listings, and governance updates</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {filters.map(f => {
          const cfg = f !== 'all' ? CATEGORY_CONFIG[f] : null;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
              }`}>{f === 'all' ? 'All' : cfg?.label}</button>
          );
        })}
      </div>

      <div className="px-4 space-y-3">
        {filtered.map(item => <AnnouncementCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Megaphone className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No announcements in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}