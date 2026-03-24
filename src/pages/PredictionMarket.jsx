import React, { useState, useMemo } from 'react';
import LiveBetFeed from '../components/prediction/LiveBetFeed';
import PersonalStats from '../components/prediction/PersonalStats';
import {
  TrendingUp, Trophy, MessageSquare, CalendarDays, Briefcase,
  History, Compass, BarChart2, Filter, Search, Sparkles, Loader2,
  ChevronDown, Wifi, WifiOff, RefreshCw, Zap
} from 'lucide-react';
import CategorySidebar from '../components/prediction/CategorySidebar';
import MarketCard from '../components/prediction/MarketCard';
import MarketRow from '../components/prediction/MarketRow';
import MarketDetailPanel from '../components/prediction/MarketDetailPanel';
import LeaderboardTab from '../components/prediction/LeaderboardTab';
import SocialFeedTab from '../components/prediction/SocialFeedTab';
import EventsTab from '../components/prediction/EventsTab';
import {
  useAPIHealth, useCategories, useTopMarkets, useMarkets
} from '../components/prediction/usePredictionAPI';
import CryptoShortMarkets from '../components/prediction/CryptoShortMarkets';

// ─── Tab config ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'explore',    label: 'Explore',   icon: Compass },
  { id: 'crypto',     label: '₿ Crypto',  icon: Zap },
  { id: 'markets',    label: 'Markets',   icon: BarChart2 },
  { id: 'portfolio',  label: 'Portfolio', icon: Briefcase },
  { id: 'history',    label: 'History',   icon: History },
  { id: 'leaderboard',label: 'Leaders',   icon: Trophy },
  { id: 'social',     label: 'Social',    icon: MessageSquare },
  { id: 'events',     label: 'Events',    icon: CalendarDays },
];

const SOURCE_FILTERS = [
  { id: '',           label: 'All Sources' },
  { id: 'polymarket', label: 'Polymarket' },
  { id: 'kalshi',     label: 'Kalshi' },
  { id: 'internal',   label: 'SolFort' },
];

const TOP_SECTIONS = [
  { key: 'aiPick',   label: '🤖 AI Picks' },
  { key: 'trending', label: '🔥 Trending' },
  { key: 'popular',  label: '📊 Most Popular' },
  { key: 'payout',   label: '💰 Highest Payout' },
  { key: 'ending',   label: '⏰ Ending Soon' },
];

function fmtVol(n) {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────
function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl skeleton" />
      ))}
    </div>
  );
}

const SECTION_ACCENT = {
  aiPick:   { gradient: 'rgba(0,212,170,0.08)',   border: 'rgba(0,212,170,0.15)',   icon: '🤖' },
  trending: { gradient: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.15)',  icon: '🔥' },
  popular:  { gradient: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.15)',  icon: '📊' },
  payout:   { gradient: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.15)',  icon: '💰' },
  ending:   { gradient: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.15)',   icon: '⏰' },
};

// ─── Explore tab ──────────────────────────────────────────────────────────
function ExploreTab({ onBet, participatedIds, onViewAll }) {
  const { top, loading } = useTopMarkets();

  const allEmpty = !loading && TOP_SECTIONS.every(s => !(top[s.key]?.length));

  if (loading) return <Skeleton rows={6} />;
  if (allEmpty) return (
    <div className="flex flex-col items-center py-16 gap-3">
      <RefreshCw className="w-8 h-8 text-slate-700" />
      <p className="text-sm text-slate-500">No top markets available right now.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {TOP_SECTIONS.map(sec => {
        const markets = top[sec.key] ?? [];
        if (!markets.length) return null;
        const accent = SECTION_ACCENT[sec.key] ?? {};
        return (
          <div key={sec.key}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[13px]"
                  style={{ background: accent.gradient, border: `1px solid ${accent.border}` }}>
                  {accent.icon}
                </div>
                <span className="text-[12px] font-black text-white">
                  {sec.label.replace(/^[^\s]+ /, '')}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: accent.gradient, color: '#94a3b8', border: `1px solid ${accent.border}` }}>
                  {markets.length}
                </span>
              </div>
              <button onClick={() => onViewAll(sec.key)}
                className="text-[9px] font-bold text-slate-500 hover:text-[#00d4aa] transition-colors">
                View all →
              </button>
            </div>
            {/* Market list */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${accent.border ?? 'rgba(148,163,184,0.07)'}` }}>
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

// ─── Markets tab ──────────────────────────────────────────────────────────
const PAGE_SIZE = 30;

function MarketsTab({ category, sub, source, onBet, participatedIds, watchlist, onWatchlist }) {
  const [view,         setView]    = useState('row');
  const [search,       setSearch]  = useState('');
  const [visibleCount, setVisible] = useState(PAGE_SIZE);
  const { markets, loading, total } = useMarkets({ category, sub, source, limit: 500 });

  React.useEffect(() => { setVisible(PAGE_SIZE); setSearch(''); }, [category, sub, source]);

  const filtered = useMemo(() => {
    if (!search.trim()) return markets;
    const q = search.toLowerCase();
    return markets.filter(m =>
      m.question.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q) ||
      m.sub?.toLowerCase().includes(q)
    );
  }, [markets, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-[#1a2340] rounded-xl px-3 py-2 border border-[rgba(148,163,184,0.07)]">
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search markets..."
            className="bg-transparent text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none flex-1" />
        </div>
        <button onClick={() => setView(v => v === 'row' ? 'card' : 'row')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${view === 'card' ? 'bg-[#00d4aa]/15 border-[#00d4aa]/25 text-[#00d4aa]' : 'bg-[#1a2340] border-[rgba(148,163,184,0.07)] text-slate-500'}`}>
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-[9px] text-slate-600 mb-2">
          Showing {visible.length} of {filtered.length} markets{total > filtered.length ? ` (${total} total)` : ''}{search ? ` matching “${search}”` : ''}
        </p>
      )}

      {loading ? <Skeleton rows={6} />
       : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BarChart2 className="w-8 h-8 text-slate-700" />
            <p className="text-sm text-slate-500">{search ? `No markets matching “${search}”` : 'No markets in this category yet.'}</p>
          </div>
       ) : view === 'card' ? (
          <div className="space-y-3">
            {visible.map(m => <MarketCard key={m.id} market={m} participated={participatedIds.has(m.id)} onBet={onBet} watchlist={watchlist} onWatchlist={onWatchlist} />)}
          </div>
       ) : (
          <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.07)]">
            {visible.map(m => <MarketRow key={m.id} market={m} participated={participatedIds.has(m.id)} onBet={onBet} watchlist={watchlist} onWatchlist={onWatchlist} />)}
          </div>
       )}

      {!loading && hasMore && (
        <button onClick={() => setVisible(v => v + PAGE_SIZE)}
          className="w-full mt-4 py-3 rounded-2xl text-[11px] font-bold border transition-all"
          style={{ background: 'rgba(0,212,170,0.06)', borderColor: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}>
          Load More — {filtered.length - visibleCount} remaining
        </button>
      )}
    </div>
  );
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
  const totalIn  = bets.reduce((s,b) => s + b.amount, 0);
  const totalOut = bets.reduce((s,b) => s + b.amount * b.payout, 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Staked',     value: `$${totalIn.toFixed(0)}`,  color: 'text-slate-300' },
          { label: 'Max Payout', value: `$${totalOut.toFixed(0)}`, color: 'text-emerald-400' },
          { label: 'Positions',  value: bets.length,               color: 'text-[#00d4aa]' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-2 py-2 text-center border border-[rgba(148,163,184,0.07)]"
            style={{ background: 'rgba(15,21,37,0.8)' }}>
            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      {bets.map((b, i) => (
        <div key={i} className="rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]"
          style={{ background: 'rgba(13,18,32,0.9)' }}>
          <div className="flex items-start justify-between mb-2 gap-2">
            <p className="text-[11px] font-bold text-white flex-1 leading-snug">{b.question ?? b.marketId}</p>
            <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
              {b.outcomeLabel}
            </span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-slate-500">Stake: <span className="text-slate-300 font-mono">{b.amount} {b.asset}</span></span>
            <span className="text-slate-500">Max: <span className="font-mono text-emerald-400">{(b.amount*b.payout).toFixed(0)} {b.asset}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── History tab ───────────────────────────────────────────────────────────
function HistoryTab() {
  const mock = [
    { question: 'Will ETH ETF be approved by Q3?',     outcome: 'YES', amount: 200, result: 'WON',  pnl: 114,  date: '2026-03-20' },
    { question: 'Will McLaren win F1 Championship?',   outcome: 'NO',  amount: 500, result: 'LOST', pnl: -500, date: '2026-03-18' },
    { question: 'Will BTC reach $90K in March?',       outcome: 'YES', amount: 1000,result: 'WON',  pnl: 390,  date: '2026-03-15' },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 mb-1">
        {[{ label: 'P&L', value: '+$4.0K', color: 'text-emerald-400' }, { label: 'Win Rate', value: '67%', color: 'text-[#00d4aa]' }, { label: 'Trades', value: '18', color: 'text-slate-300' }].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2 text-center border border-[rgba(148,163,184,0.07)]"
            style={{ background: 'rgba(15,21,37,0.8)' }}>
            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      {mock.map((h, i) => (
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

// ─── Main page ─────────────────────────────────────────────────────────────
export default function PredictionMarket() {
  const [tab,          setTab]          = useState('explore');
  const [category,     setCategory]     = useState('explore');
  const [activeSub,    setActiveSub]    = useState('');
  const [source,       setSource]       = useState('');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [bets,         setBets]         = useState([]);
  const [activeMkt,    setActiveMkt]    = useState(null);
  const [watchlist,    setWatchlist]    = useState(() => new Set());

  const handleWatchlist = (id) => setWatchlist(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const apiStatus                       = useAPIHealth();
  const { categories, loading: catLoading } = useCategories();

  // Total count for stats header
  const { markets: allForFeed, total } = useMarkets({ limit: 50 });
  const participatedIds = useMemo(() => new Set(bets.map(b => b.marketId)), [bets]);

  const handleCategorySelect = (cat, sub) => {
    setCategory(cat);
    setActiveSub(sub);
    setTab('markets');
    setSidebarOpen(false);
  };

  const handleBet = (market) => {
    setActiveMkt({ market, existingBet: bets.find(b => b.marketId === market.id) ?? null });
  };

  const handlePlace = (bet) => {
    const mkt = activeMkt?.market;
    setBets(prev => prev.find(b => b.marketId === bet.marketId) ? prev : [...prev, { ...bet, question: mkt?.question }]);
    setActiveMkt(null);
  };

  const showSidebar = tab === 'explore' || tab === 'markets';

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
          <div className="ml-auto flex items-center gap-1.5">
            {apiStatus === 'ok'      && <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-[8px] text-emerald-400">Live</span></>}
            {apiStatus === 'offline' && <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-[8px] text-red-400">Offline</span></>}
            {apiStatus === 'checking'&& <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />}
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mb-3">Polymarket · Kalshi · SolFort — unified.</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Markets',     value: total || '…',  color: 'text-purple-400' },
            { label: 'Sources',     value: '3',            color: 'text-[#00d4aa]' },
            { label: 'Categories',  value: categories.length || '…', color: 'text-blue-400' },
            { label: 'My Bets',     value: bets.length,   color: 'text-amber-400' },
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
            const Icon  = t.icon;
            const active = tab === t.id;
            const badge  = t.id === 'portfolio' && bets.length ? bets.length : null;
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

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Category sidebar */}
        {showSidebar && (
          <>
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60" onClick={() => setSidebarOpen(false)} />}
            <div className={`flex-shrink-0 ${sidebarOpen ? 'fixed left-0 top-0 bottom-0 z-40 w-52' : 'hidden'} md:relative md:flex md:w-44`}
              style={{ height: sidebarOpen ? '100vh' : undefined }}>
              <CategorySidebar
                active={category} activeSub={activeSub}
                onSelect={handleCategorySelect}
                dynamicCategories={categories}
                loading={catLoading}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto min-w-0">

          {/* Markets toolbar strip */}
          {showSidebar && (
            <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 border-b border-[rgba(148,163,184,0.05)] flex-shrink-0">
              <button onClick={() => setSidebarOpen(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-[#1a2340] px-2.5 py-1.5 rounded-lg border border-[rgba(148,163,184,0.07)] md:hidden flex-shrink-0">
                <Filter className="w-3 h-3" />Categories
              </button>

              {/* Breadcrumb */}
              {(category !== 'explore' || activeSub) && (
                <div className="flex items-center gap-1 text-[10px]">
                  <button onClick={() => handleCategorySelect('explore', '')} className="text-slate-500 hover:text-slate-300">Explore</button>
                  {category !== 'explore' && <>
                    <ChevronDown className="w-3 h-3 text-slate-700 -rotate-90" />
                    <button onClick={() => handleCategorySelect(category, '')} className={activeSub ? 'text-slate-500 hover:text-slate-300' : 'text-[#00d4aa] font-bold'}>{category}</button>
                  </>}
                  {activeSub && <>
                    <ChevronDown className="w-3 h-3 text-slate-700 -rotate-90" />
                    <span className="text-[#00d4aa] font-bold">{activeSub}</span>
                  </>}
                </div>
              )}

              {/* Source filter */}
              <div className="flex gap-1 ml-auto">
                {SOURCE_FILTERS.map(sf => (
                  <button key={sf.id} onClick={() => setSource(sf.id)}
                    className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${source === sf.id ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'text-slate-600 hover:text-slate-400'}`}>
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-4">
            {tab === 'explore'     && (
              <div className="space-y-4">
                {bets.length > 0 && <PersonalStats bets={bets} />}
                <ExploreTab onBet={handleBet} participatedIds={participatedIds} onViewAll={() => setTab('markets')} />
                <LiveBetFeed markets={allForFeed}
                  onCopyBet={(bet) => bet.market && handleBet(bet.market)} />
              </div>
            )}
            {tab === 'crypto'      && (
              <CryptoShortMarkets
                participatedIds={participatedIds}
                onPlaceBet={(bet) => setBets(prev => prev.find(b => b.marketId === bet.marketId) ? prev : [...prev, bet])}
              />
            )}
            {tab === 'markets'     && <MarketsTab category={category} sub={activeSub} source={source} onBet={handleBet} participatedIds={participatedIds} watchlist={watchlist} onWatchlist={handleWatchlist} />}
            {tab === 'portfolio'   && <PortfolioTab bets={bets} />}
            {tab === 'history'     && <HistoryTab />}
            {tab === 'leaderboard' && <LeaderboardTab />}
            {tab === 'social'      && <SocialFeedTab />}
            {tab === 'events'      && <EventsTab />}
          </div>
        </div>
      </div>

      {/* ── Market detail + betting panel ── */}
      {activeMkt && (
        <MarketDetailPanel
          preloaded={activeMkt.market}
          existingBet={activeMkt.existingBet}
          onClose={() => setActiveMkt(null)}
          onPlace={handlePlace}
        />
      )}
    </div>
  );
}