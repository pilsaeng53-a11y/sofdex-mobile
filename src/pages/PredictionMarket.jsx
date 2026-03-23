import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, Zap, Star, Users, BarChart2, Trophy, MessageSquare, CalendarDays, Briefcase } from 'lucide-react';
import MarketCard from '../components/prediction/MarketCard';
import BettingPanel from '../components/prediction/BettingPanel';
import LeaderboardTab from '../components/prediction/LeaderboardTab';
import SocialFeedTab from '../components/prediction/SocialFeedTab';
import EventsTab from '../components/prediction/EventsTab';
import { MARKETS } from '../components/prediction/mockData';

const TABS = [
  { id: 'markets',     label: 'Markets',     icon: BarChart2 },
  { id: 'portfolio',   label: 'Portfolio',   icon: Briefcase },
  { id: 'leaderboard', label: 'Leaders',     icon: Trophy },
  { id: 'social',      label: 'Social',      icon: MessageSquare },
  { id: 'events',      label: 'Events',      icon: CalendarDays },
];

const SECTIONS = [
  { id: 'hot',      label: 'HOT',         icon: Zap,        color: '#f97316', filter: m => m.tags.includes('HOT') },
  { id: 'popular',  label: 'Most Popular',icon: Users,      color: '#8b5cf6', filter: m => true, sort: (a,b) => b.volume - a.volume },
  { id: 'payout',   label: 'Highest Payout',icon: Star,     color: '#fbbf24', filter: m => m.tags.includes('HIGH PAYOUT') },
  { id: 'ending',   label: 'Ending Soon', icon: Clock,      color: '#ef4444', filter: m => m.tags.includes('ENDING SOON') || new Date(m.endDate) - new Date() < 7*86400000 },
];

function SectionLabel({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-black text-white">{label}</span>
    </div>
  );
}

function PortfolioTab({ bets }) {
  if (!bets.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Briefcase className="w-10 h-10 text-slate-700" />
      <p className="text-sm font-bold text-slate-500">No active positions</p>
      <p className="text-[11px] text-slate-600">Place a bet to see your portfolio</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {bets.map((b, i) => {
        const market = MARKETS.find(m => m.id === b.marketId);
        if (!market) return null;
        const currentProb = b.side === 'YES' ? market.yesProb : 1 - market.yesProb;
        const currentVal  = b.amount * (b.side === 'YES' ? market.payoutYes : market.payoutNo) * currentProb;
        const pnl         = currentVal - b.amount;
        const pos         = pnl >= 0;
        return (
          <div key={i} className="rounded-2xl p-4 border"
            style={{ background: 'rgba(15,21,37,0.9)', borderColor: 'rgba(148,163,184,0.09)' }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold text-white flex-1 pr-3 leading-snug">{market.question}</p>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${b.side === 'YES' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{b.side}</span>
            </div>
            <div className="flex justify-between text-[10px] mb-2">
              <span className="text-slate-500">Bet: <span className="text-slate-300 font-mono">{b.amount} {b.asset}</span></span>
              <span className="text-slate-500">Max payout: <span className="font-mono text-emerald-400">{(b.amount * b.payout).toFixed(0)} {b.asset}</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-600">{market.category}</span>
              <span className={`text-[11px] font-black font-mono ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                {pos ? '+' : ''}${pnl.toFixed(2)} est.
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PredictionMarket() {
  const [tab, setTab]           = useState('markets');
  const [bets, setBets]         = useState([]); // { marketId, side, amount, asset, payout }
  const [activeMkt, setActiveMkt] = useState(null);

  const participatedIds = useMemo(() => new Set(bets.map(b => b.marketId)), [bets]);
  const existingBetFor  = (id) => bets.find(b => b.marketId === id) ?? null;

  const handleBet = (market) => {
    setActiveMkt(market);
  };

  const handlePlace = (bet) => {
    setBets(prev => {
      const existing = prev.find(b => b.marketId === bet.marketId);
      if (existing) return prev; // no duplicate
      return [...prev, bet];
    });
    setActiveMkt(null);
  };

  const totalBetValue = bets.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen" style={{ background: '#05070d', color: '#f1f5f9' }}>

      {/* ── Hero header ── */}
      <div className="px-4 pt-4 pb-3" style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-black text-white">Prediction Market</h1>
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>BETA</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">Trade predictions. Compete. Win.</p>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Volume 24h', value: '$48.2M',   color: 'text-[#00d4aa]' },
            { label: 'Markets',    value: MARKETS.length, color: 'text-purple-400' },
            { label: 'My Bets',    value: bets.length,    color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-2 text-center"
              style={{ background: 'rgba(15,21,37,0.7)', border: '1px solid rgba(148,163,184,0.08)' }}>
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 flex border-b overflow-x-auto scrollbar-none"
        style={{ background: 'rgba(5,7,13,0.97)', borderColor: 'rgba(148,163,184,0.07)', backdropFilter: 'blur(16px)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          const badge = t.id === 'portfolio' && bets.length ? bets.length : null;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold transition-all whitespace-nowrap border-b-2 ${active ? 'text-[#00d4aa] border-[#00d4aa]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {badge && <span className="bg-[#00d4aa]/20 text-[#00d4aa] text-[8px] font-black px-1 rounded">{badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4">

        {/* MARKETS */}
        {tab === 'markets' && (
          <div className="space-y-6">
            {SECTIONS.map(sec => {
              const markets = MARKETS
                .filter(sec.filter)
                .sort(sec.sort ?? ((a, b) => 0))
                .slice(0, 4);
              if (!markets.length) return null;
              const Icon = sec.icon;
              return (
                <div key={sec.id}>
                  <SectionLabel icon={Icon} label={sec.label} color={sec.color} />
                  <div className="space-y-3">
                    {markets.map(m => (
                      <MarketCard
                        key={m.id}
                        market={m}
                        participated={participatedIds.has(m.id)}
                        onBet={(mkt) => handleBet({ ...mkt, existingBet: existingBetFor(mkt.id) })}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PORTFOLIO */}
        {tab === 'portfolio' && <PortfolioTab bets={bets} />}

        {/* LEADERBOARD */}
        {tab === 'leaderboard' && <LeaderboardTab />}

        {/* SOCIAL */}
        {tab === 'social' && <SocialFeedTab />}

        {/* EVENTS */}
        {tab === 'events' && <EventsTab />}
      </div>

      {/* ── Betting panel modal ── */}
      {activeMkt && (
        <BettingPanel
          market={activeMkt}
          existingBet={existingBetFor(activeMkt.id)}
          onClose={() => setActiveMkt(null)}
          onPlace={handlePlace}
        />
      )}
    </div>
  );
}