import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Trophy, MessageSquare, CalendarDays, Briefcase,
  Zap, Star, Clock, Users, History, Compass, ChevronDown,
  BarChart2, Filter, SortAsc, Search, Sparkles
} from 'lucide-react';
import CategorySidebar from '../components/prediction/CategorySidebar';
import MarketCard from '../components/prediction/MarketCard';
import MarketRow from '../components/prediction/MarketRow';
import BettingPanel from '../components/prediction/BettingPanel';
import LeaderboardTab from '../components/prediction/LeaderboardTab';
import SocialFeedTab from '../components/prediction/SocialFeedTab';
import EventsTab from '../components/prediction/EventsTab';
import { useMarkets, useTopMarkets } from '../components/prediction/usePredictionAPI';
import { MARKETS } from '../components/prediction/mockData';

// ─── Tab config ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'explore',    label: 'Explore',    icon: Compass },
  { id: 'markets',    label: 'Markets',    icon: BarChart2 },
  { id: 'portfolio',  label: 'Portfolio',  icon: Briefcase },
  { id: 'history',    label: 'History',    icon: History },
  { id: 'leaderboard',label: 'Leaders',    icon: Trophy },
  { id: 'social',     label: 'Social',     icon: MessageSquare },
  { id: 'events',     label: 'Events',     icon: CalendarDays },
];

const TOP_SECTIONS = [
  { id: 'aiPick',   label: '🤖 AI Picks',      color: '#00d4aa' },
  { id: 'trending', label: '🔥 Trending',       color: '#f97316' },
  { id: 'popular',  label: '📊 Most Popular',   color: '#8b5cf6' },
  { id: 'payout',   label: '💰 Highest Payout', color: '#fbbf24' },
  { id: 'ending',   label: '⏰ Ending Soon',    color: '#ef4444' },
];

function fmtVol(n) {
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ─── Portfolio tab ─────────────────────────────────────────────────────────
function PortfolioTab({ bets }) {
  if (!bets.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Briefcase className="w-10 h-10 text-slate-700" />
      <p className="text-sm font-bold text-slate-500">No active positions</p>
      <p className="text-[11px] text-slate-600">Place a bet to see your portfolio</p>
    </div>
  );
  const totalIn   = bets.reduce((s,b) => s + b.amount, 0);
  const totalOut  = bets.reduce((s,b) => s + b.amount * b.payout, 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total In',   value: `$${totalIn.toFixed(0)}`,  color: 'text-slate-300' },
          { label: 'Max Payout', value: `$${totalOut.toFixed(0)}`, color: 'text-emerald-400' },
          { label: 'Positions',  value: bets.length,               color: 'text-[#00d4aa]' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2 text-center border border-[rgba(148,163,184,0.07)]"
            style={{ background: 'rgba(15,21,37,0.8)' }}>
            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {bets.map((b, i) => {
        const market = MARKETS.find(m => m.id === b.marketId);
        if (!market) return null;
        return (
          <div key={i} className="rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]"
            style={{ background: 'rgba(13,18,32,0.9)' }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold text-white flex-1 pr-3 leading-snug">{market.question}</p>
              <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
                {b.outcomeLabel}
              </span>
            </div>
            <div className="flex justify-between text-[9px] mb-1">
              <span className="text-slate-500">Stake: <span className="text-slate-300 font-mono">{b.amount} {b.asset}</span></span>
              <span className="text-slate-500">Max: <span className="font-mono text-emerald-400">{(b.amount*b.payout).toFixed(0)} {b.asset}</span></span>
            </div>
            {b.boosts?.length > 0 && (
              <div className="flex gap-1 mt-1">
                {b.boosts.map(boost => (
                  <span key={boost} className="text-[7px] font-black px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>{boost}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── History tab ───────────────────────────────────────────────────────────
function HistoryTab() {
  const MOCK_HISTORY = [
    { question: 'Will ETH ETF be approved by Q3?', outcome: 'YES', amount: 200, result: 'WON', pnl: 114, date: '2026-03-20' },
    { question: 'Will McLaren win F1 Championship?', outcome: 'NO', amount: 500, result: 'LOST', pnl: -500, date: '2026-03-18' },
    { question: 'Will BTC reach $90K in March?', outcome: 'YES', amount: 1000, result: 'WON', pnl: 390, date: '2026-03-15' },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 mb-1">
        {[{ label: 'P&L', value: '+$4.0K', color: 'text-emerald-400' }, { label: 'Win Rate', value: '67%', color: 'text-[#00d4aa]' }, { label: 'Trades', value: '18', color: 'text-slate-300' }].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2 text-center border border-[rgba(148,163,184,0.07)]" style={{ background: 'rgba(15,21,37,0.8)' }}>
            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      {MOCK_HISTORY.map((h, i) => (
        <div key={i} className="rounded-xl px-4 py-3 border border-[rgba(148,163,184,0.07)] flex items-center gap-3"
          style={{ background: 'rgba(13,18,32,0.9)' }}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0 ${h.result==='WON' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {h.result==='WON' ? '✓' : '✗'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white truncate">{h.question}</p>
            <p className="text-[9px] text-slate-500">{h.outcome} · {h.date}</p>
          </div>
          <span className={`text-[11px] font-black font-mono flex-shrink-0 ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {h.pnl >= 0 ? '+' : ''}${h.pnl}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Explore tab ──────────────────────────────────────────────────────────
function ExploreTab({ onBet, participatedIds }) {
  const top = useTopMarkets();

  return (
    <div className="space-y-6">
      {TOP_SECTIONS.map(sec => {
        const markets = top[sec.id] ?? [];
        if (!markets.length) return null;
        return (
          <div key={sec.id}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-white">{sec.label}</p>
              <button className="text-[9px] text-slate-500 hover:text-slate-300">See all →</button>
            </div>
            <div className="space-y-2">
              {markets.slice(0, 4).map(m => (
                <MarketRow key={m.id} market={m}
                  participated={participatedIds.has(m.id)}
                  onBet={onBet} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Markets list tab ──────────────────────────────────────────────────────
function MarketsTab({ category, sub, onBet, participatedIds }) {
  const [view, setView]     = useState('row');
  const [search, setSearch] = useState('');
  const { markets, loading } = useMarkets({ category, sub });

  const filtered = useMemo(() => {
    if (!search) return markets;
    return markets.filter(m => m.question.toLowerCase().includes(search.toLowerCase()));
  }, [markets, search]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-[#1a2340] rounded-xl px-3 py-2 border border-[rgba(148,163,184,0.07)]">
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="bg-transparent text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none flex-1" />
        </div>
        <button onClick={() => setView(v => v==='row'?'card':'row')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${view==='card' ? 'bg-[#00d4aa]/15 border-[#00d4aa]/25 text-[#00d4aa]' : 'bg-[#1a2340] border-[rgba(148,163,184,0.07)] text-slate-500'}`}>
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">No markets found</div>
      ) : view === 'card' ? (
        <div className="space-y-3">
          {filtered.map(m => <MarketCard key={m.id} market={m} participated={participatedIds.has(m.id)} onBet={onBet} />)}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.07)]">
          {filtered.map(m => <MarketRow key={m.id} market={m} participated={participatedIds.has(m.id)} onBet={onBet} />)}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function PredictionMarket() {
  const [tab,        setTab]        = useState('explore');
  const [category,   setCategory]   = useState('explore');
  const [activeSub,  setActiveSub]  = useState('');
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [bets,       setBets]       = useState([]);
  const [activeMkt,  setActiveMkt]  = useState(null);

  const participatedIds = useMemo(() => new Set(bets.map(b => b.marketId)), [bets]);

  const handleCategorySelect = (cat, sub) => {
    setCategory(cat);
    setActiveSub(sub);
    setTab('markets');
    setSidebarOpen(false);
  };

  const handleBet = (market) => setActiveMkt(market);

  const handlePlace = (bet) => {
    setBets(prev => prev.find(b => b.marketId === bet.marketId) ? prev : [...prev, bet]);
    setActiveMkt(null);
  };

  const totalVol = MARKETS.reduce((s, m) => s + m.volume, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#05070d', color: '#f1f5f9' }}>

      {/* ── Hero ── */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h1 className="text-base font-black text-white">SolFort Predict</h1>
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>EXCHANGE</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-3">Polymarket · Kalshi · Social · All in one.</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: '24h Vol',   value: fmtVol(totalVol), color: 'text-[#00d4aa]' },
            { label: 'Markets',   value: MARKETS.length,   color: 'text-purple-400' },
            { label: 'Traders',   value: '48.2K',          color: 'text-blue-400' },
            { label: 'My Bets',   value: bets.length,      color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-2 py-1.5 text-center border border-[rgba(148,163,184,0.07)]"
              style={{ background: 'rgba(15,21,37,0.7)' }}>
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[8px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex-shrink-0 border-b overflow-x-auto scrollbar-none sticky top-0 z-20"
        style={{ background: 'rgba(5,7,13,0.97)', borderColor: 'rgba(148,163,184,0.07)', backdropFilter: 'blur(16px)' }}>
        <div className="flex">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            const badge = t.id==='portfolio' && bets.length ? bets.length : null;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-3 text-[9px] font-bold border-b-2 transition-all whitespace-nowrap ${active ? 'text-[#00d4aa] border-[#00d4aa]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                <Icon className="w-3 h-3" />
                {t.label}
                {badge && <span className="bg-[#00d4aa]/20 text-[#00d4aa] text-[7px] font-black px-1 rounded">{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — desktop always visible, mobile overlay */}
        {(tab === 'explore' || tab === 'markets') && (
          <>
            {/* Mobile overlay bg */}
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />}
            <div className={`flex-shrink-0 transition-all duration-200 ${sidebarOpen ? 'fixed left-0 top-0 bottom-0 z-40 w-48' : 'hidden'} md:relative md:flex md:w-44`}
              style={{ height: sidebarOpen ? '100vh' : undefined }}>
              <CategorySidebar active={category} activeSub={activeSub} onSelect={handleCategorySelect} />
            </div>
          </>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Category bar (mobile) */}
          {(tab === 'explore' || tab === 'markets') && (
            <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[rgba(148,163,184,0.05)]">
              <button onClick={() => setSidebarOpen(v=>!v)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-[#1a2340] px-2.5 py-1.5 rounded-lg border border-[rgba(148,163,184,0.07)] md:hidden">
                <Filter className="w-3 h-3" />Categories
              </button>
              {activeSub && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="text-slate-600">{category}</span>
                  <ChevronDown className="w-3 h-3 rotate-[-90deg] text-slate-600" />
                  <span className="text-[#00d4aa] font-bold">{activeSub}</span>
                </div>
              )}
            </div>
          )}

          <div className="px-4 py-4">
            {tab === 'explore'     && <ExploreTab onBet={handleBet} participatedIds={participatedIds} />}
            {tab === 'markets'     && <MarketsTab category={category} sub={activeSub} onBet={handleBet} participatedIds={participatedIds} />}
            {tab === 'portfolio'   && <PortfolioTab bets={bets} />}
            {tab === 'history'     && <HistoryTab />}
            {tab === 'leaderboard' && <LeaderboardTab />}
            {tab === 'social'      && <SocialFeedTab />}
            {tab === 'events'      && <EventsTab />}
          </div>
        </div>
      </div>

      {/* ── Betting panel ── */}
      {activeMkt && (
        <BettingPanel
          market={activeMkt}
          existingBet={bets.find(b => b.marketId === activeMkt.id) ?? null}
          onClose={() => setActiveMkt(null)}
          onPlace={handlePlace}
        />
      )}
    </div>
  );
}