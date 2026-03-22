/**
 * pages/OverseasFutures.jsx
 *
 * Overseas Futures / CFD market section — powered by Vantage as broker/data concept.
 * Structurally SEPARATE from the Orderly crypto orderbook section.
 *
 * This page does NOT use Orderly data, order books, or crypto perpetuals.
 * It represents a broker-connected CFD/futures trading environment.
 */

import React, { useState } from 'react';
import {
  Globe, TrendingUp, TrendingDown, BarChart2, Briefcase,
  ExternalLink, ChevronRight, Activity, Shield, Zap,
  Info, Building2, AlertTriangle, ArrowRight, Link2,
} from 'lucide-react';
import CoinIcon from '../components/shared/CoinIcon';

// ─── Instrument categories ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'indices',    label: 'Indices',         icon: BarChart2,   color: '#3b82f6', count: 14 },
  { id: 'forex',      label: 'Forex',            icon: Globe,       color: '#00d4aa', count: 60 },
  { id: 'commodities',label: 'Commodities',      icon: Activity,    color: '#f59e0b', count: 12 },
  { id: 'stocks',     label: 'US Stocks CFD',    icon: TrendingUp,  color: '#8b5cf6', count: 80 },
  { id: 'bonds',      label: 'Bonds & Rates',    icon: Shield,      color: '#06b6d4', count: 8  },
  { id: 'energy',     label: 'Energy',           icon: Zap,         color: '#f97316', count: 6  },
];

// ─── Market watch instruments ─────────────────────────────────────────────────
const INSTRUMENTS = {
  indices: [
    { symbol: 'US30',   name: 'Dow Jones 30',   bid: '42,185.0', ask: '42,189.0', change: '+0.34%', dir: 'up',   session: 'US Open'   },
    { symbol: 'NAS100', name: 'Nasdaq 100',      bid: '18,724.5', ask: '18,727.0', change: '+0.51%', dir: 'up',   session: 'US Open'   },
    { symbol: 'SPX500', name: 'S&P 500',         bid: '5,612.4',  ask: '5,613.0',  change: '+0.28%', dir: 'up',   session: 'US Open'   },
    { symbol: 'GER40',  name: 'DAX 40',          bid: '17,841.0', ask: '17,845.0', change: '-0.12%', dir: 'down', session: 'EU Open'   },
    { symbol: 'UK100',  name: 'FTSE 100',        bid: '8,156.5',  ask: '8,158.0',  change: '+0.07%', dir: 'up',   session: 'EU Open'   },
    { symbol: 'JP225',  name: 'Nikkei 225',      bid: '38,420.0', ask: '38,425.0', change: '-0.44%', dir: 'down', session: 'Asia Closed'},
  ],
  forex: [
    { symbol: 'EURUSD', name: 'Euro / US Dollar',     bid: '1.08245', ask: '1.08248', change: '+0.12%', dir: 'up',   session: 'EU/US' },
    { symbol: 'GBPUSD', name: 'Pound / US Dollar',    bid: '1.26184', ask: '1.26188', change: '-0.08%', dir: 'down', session: 'EU/US' },
    { symbol: 'USDJPY', name: 'USD / Japanese Yen',   bid: '151.424', ask: '151.428', change: '+0.31%', dir: 'up',   session: 'Active' },
    { symbol: 'AUDUSD', name: 'Aussie / US Dollar',   bid: '0.65120', ask: '0.65124', change: '-0.15%', dir: 'down', session: 'Active' },
    { symbol: 'XAUUSD', name: 'Gold / US Dollar',     bid: '2,312.45',ask: '2,312.85',change: '+0.42%', dir: 'up',   session: 'Active' },
    { symbol: 'USDCAD', name: 'USD / Canadian Dollar',bid: '1.36154', ask: '1.36158', change: '+0.06%', dir: 'up',   session: 'Active' },
  ],
  commodities: [
    { symbol: 'XAUUSD', name: 'Gold Spot',        bid: '2,312.45',ask: '2,312.85',change: '+0.42%', dir: 'up',   session: 'Active' },
    { symbol: 'XAGUSD', name: 'Silver Spot',      bid: '27.142',  ask: '27.162',  change: '+0.58%', dir: 'up',   session: 'Active' },
    { symbol: 'USOIL',  name: 'WTI Crude Oil',    bid: '82.14',   ask: '82.17',   change: '-0.92%', dir: 'down', session: 'Active' },
    { symbol: 'UKOIL',  name: 'Brent Crude',      bid: '86.42',   ask: '86.46',   change: '-0.74%', dir: 'down', session: 'Active' },
    { symbol: 'NATGAS', name: 'Natural Gas',      bid: '1.824',   ask: '1.827',   change: '+1.15%', dir: 'up',   session: 'Active' },
    { symbol: 'COPPER', name: 'Copper',            bid: '4.142',   ask: '4.145',   change: '+0.22%', dir: 'up',   session: 'Active' },
  ],
  stocks: [
    { symbol: 'AAPL',   name: 'Apple Inc.',        bid: '178.24',  ask: '178.27',  change: '+0.62%', dir: 'up',   session: 'US Open' },
    { symbol: 'NVDA',   name: 'Nvidia Corp.',      bid: '875.60',  ask: '876.10',  change: '+1.24%', dir: 'up',   session: 'US Open' },
    { symbol: 'TSLA',   name: 'Tesla Inc.',        bid: '174.18',  ask: '174.24',  change: '-1.08%', dir: 'down', session: 'US Open' },
    { symbol: 'MSFT',   name: 'Microsoft Corp.',   bid: '415.72',  ask: '415.80',  change: '+0.34%', dir: 'up',   session: 'US Open' },
    { symbol: 'AMZN',   name: 'Amazon.com Inc.',   bid: '185.41',  ask: '185.48',  change: '+0.88%', dir: 'up',   session: 'US Open' },
    { symbol: 'META',   name: 'Meta Platforms',    bid: '504.12',  ask: '504.24',  change: '+0.44%', dir: 'up',   session: 'US Open' },
  ],
  bonds: [
    { symbol: 'US10Y',  name: 'US 10Y Treasury',   bid: '4.284%',  ask: '4.287%',  change: '+0.02%', dir: 'up',   session: 'Active' },
    { symbol: 'US2Y',   name: 'US 2Y Treasury',    bid: '4.912%',  ask: '4.914%',  change: '-0.01%', dir: 'down', session: 'Active' },
    { symbol: 'BUND',   name: 'German 10Y Bund',   bid: '2.384%',  ask: '2.386%',  change: '+0.03%', dir: 'up',   session: 'EU Open' },
  ],
  energy: [
    { symbol: 'USOIL',  name: 'WTI Crude Oil',     bid: '82.14',   ask: '82.17',   change: '-0.92%', dir: 'down', session: 'Active' },
    { symbol: 'UKOIL',  name: 'Brent Crude',       bid: '86.42',   ask: '86.46',   change: '-0.74%', dir: 'down', session: 'Active' },
    { symbol: 'NATGAS', name: 'Natural Gas',        bid: '1.824',   ask: '1.827',   change: '+1.15%', dir: 'up',   session: 'Active' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrokerBadge() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{
        background: 'rgba(59,130,246,0.07)',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <Building2 className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
      <span className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: '#3b82f6' }}>
        Via Vantage
      </span>
    </div>
  );
}

function SeparationBanner() {
  return (
    <div
      className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
      style={{
        background: 'rgba(59,130,246,0.04)',
        border: '1px solid rgba(59,130,246,0.12)',
      }}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
      <div>
        <p className="text-[9.5px] font-bold" style={{ color: '#3b82f6' }}>
          Overseas Futures & CFD — Broker-Connected Section
        </p>
        <p className="text-[8.5px] mt-0.5 leading-relaxed" style={{ color: '#3d4f6b' }}>
          This section connects to Vantage as broker/execution layer. It is structurally
          separate from the crypto perpetuals orderbook. Prices shown are indicative broker
          quotes, not on-chain open-interest data.
        </p>
      </div>
    </div>
  );
}

function SessionDot({ session }) {
  const active = session === 'Active' || session.includes('Open');
  return (
    <span
      className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        background: active ? 'rgba(34,197,94,0.08)' : 'rgba(148,163,184,0.06)',
        color: active ? '#4ade80' : '#475569',
      }}
    >
      {session}
    </span>
  );
}

function InstrumentRow({ item, onSelect, isActive }) {
  const isUp = item.dir === 'up';
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-150"
      style={{
        background: isActive
          ? 'rgba(59,130,246,0.06)'
          : 'rgba(4,6,14,0.5)',
        border: isActive
          ? '1px solid rgba(59,130,246,0.18)'
          : '1px solid rgba(148,163,184,0.06)',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <CoinIcon symbol={item.symbol.split(/[/-]/)[0]} size={32} debugLabel="OverseasFutures" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{item.symbol}</p>
          <p className="text-[8.5px] truncate" style={{ color: '#3d4f6b' }}>{item.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <SessionDot session={item.session} />
        <div className="text-right">
          <p className="text-[10px] font-black font-mono text-white">{item.bid}</p>
          <p
            className="text-[9px] font-bold font-mono"
            style={{ color: isUp ? '#4ade80' : '#f87171' }}
          >
            {item.change}
          </p>
        </div>
        {isUp
          ? <TrendingUp  className="w-3 h-3 flex-shrink-0" style={{ color: '#4ade80' }} />
          : <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: '#f87171' }} />
        }
      </div>
    </button>
  );
}

function PricePanelPlaceholder({ instrument }) {
  if (!instrument) return null;
  const isUp = instrument.dir === 'up';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(4,6,14,0.95)',
        border: '1px solid rgba(59,130,246,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(10,14,26,0.7)' }}
      >
        <div>
          <p className="text-sm font-black text-white">{instrument.symbol}</p>
          <p className="text-[10px]" style={{ color: '#3d4f6b' }}>{instrument.name}</p>
        </div>
        <SessionDot session={instrument.session} />
      </div>

      {/* Bid / Ask */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {[
          { label: 'BID', value: instrument.bid, color: '#f87171', bg: 'rgba(248,113,113,0.06)' },
          { label: 'ASK', value: instrument.ask, color: '#4ade80', bg: 'rgba(74,222,128,0.06)'  },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ background: bg, border: `1px solid ${color}22` }}
          >
            <p className="text-[8.5px] font-black uppercase tracking-widest mb-1" style={{ color }}>
              {label}
            </p>
            <p className="text-xl font-black font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Change */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {isUp
          ? <TrendingUp  className="w-4 h-4" style={{ color: '#4ade80' }} />
          : <TrendingDown className="w-4 h-4" style={{ color: '#f87171' }} />
        }
        <span className="text-sm font-black" style={{ color: isUp ? '#4ade80' : '#f87171' }}>
          {instrument.change}
        </span>
        <span className="text-[9px]" style={{ color: '#3d4f6b' }}>24h change (indicative)</span>
      </div>

      {/* Chart placeholder */}
      <div
        className="mx-3 mb-3 h-20 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}
      >
        <div className="flex flex-col items-center gap-1">
          <BarChart2 className="w-5 h-5" style={{ color: '#1e3a5f' }} />
          <p className="text-[9px]" style={{ color: '#2a3348' }}>
            Chart via broker feed
          </p>
        </div>
      </div>

      {/* Connect button */}
      <div className="px-3 pb-3">
        <BrokerConnectButton />
      </div>

      {/* Indicative notice */}
      <div
        className="mx-3 mb-3 flex items-center gap-1.5 px-2.5 py-2 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}
      >
        <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f59e0b' }} />
        <p className="text-[8.5px] leading-snug" style={{ color: '#64748b' }}>
          Prices are indicative broker quotes. Not live exchange data.
          Trading requires a connected Vantage account.
        </p>
      </div>
    </div>
  );
}

function BrokerConnectButton() {
  const [state, setState] = useState('idle');
  return (
    <button
      onClick={() => setState(s => s === 'idle' ? 'connecting' : 'idle')}
      className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-200"
      style={{
        background: state === 'connecting'
          ? 'rgba(59,130,246,0.18)'
          : 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.08))',
        color: '#3b82f6',
        border: '1px solid rgba(59,130,246,0.25)',
      }}
    >
      <Link2 className="w-4 h-4" />
      {state === 'connecting' ? 'Connecting to Vantage…' : 'Connect Vantage Account'}
    </button>
  );
}

function CategoryCard({ cat, isActive, onClick }) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl transition-all duration-150 flex-shrink-0"
      style={{
        background: isActive ? `${cat.color}12` : 'rgba(4,6,14,0.8)',
        border: isActive ? `1px solid ${cat.color}30` : '1px solid rgba(148,163,184,0.07)',
        minWidth: '72px',
      }}
    >
      <Icon className="w-4 h-4" style={{ color: isActive ? cat.color : '#3d4f6b' }} />
      <span
        className="text-[8.5px] font-black uppercase tracking-wide whitespace-nowrap"
        style={{ color: isActive ? cat.color : '#475569' }}
      >
        {cat.label}
      </span>
      <span className="text-[7.5px]" style={{ color: '#2a3348' }}>{cat.count} pairs</span>
    </button>
  );
}

function AccountTierCard({ tier, min, spread, leverage, note, recommended }) {
  return (
    <div
      className="rounded-xl p-3 flex-shrink-0"
      style={{
        background: recommended ? 'rgba(59,130,246,0.06)' : 'rgba(4,6,14,0.7)',
        border: recommended ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(148,163,184,0.06)',
        minWidth: '160px',
      }}
    >
      {recommended && (
        <span
          className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md mb-2 inline-block"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
        >
          Recommended
        </span>
      )}
      <p className="text-xs font-black text-white mb-0.5">{tier}</p>
      <p className="text-[9px] mb-2" style={{ color: '#3d4f6b' }}>{note}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[8.5px]">
          <span style={{ color: '#3d4f6b' }}>Min deposit</span>
          <span className="font-bold text-white">{min}</span>
        </div>
        <div className="flex justify-between text-[8.5px]">
          <span style={{ color: '#3d4f6b' }}>Spread from</span>
          <span className="font-bold" style={{ color: '#00d4aa' }}>{spread}</span>
        </div>
        <div className="flex justify-between text-[8.5px]">
          <span style={{ color: '#3d4f6b' }}>Max leverage</span>
          <span className="font-bold text-white">{leverage}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OverseasFutures() {
  const [activeCat,    setActiveCat]    = useState('indices');
  const [selected,     setSelected]     = useState(INSTRUMENTS.indices[0]);
  const [showConnect,  setShowConnect]  = useState(false);

  const instruments = INSTRUMENTS[activeCat] ?? [];

  return (
    <div className="min-h-screen pb-8" style={{ background: '#05070d', color: '#f1f5f9' }}>

      {/* ── Page header ── */}
      <div
        className="sticky top-0 z-20 px-4 py-3 border-b flex items-center justify-between"
        style={{
          background: 'rgba(5,7,13,0.97)',
          borderColor: 'rgba(148,163,184,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4" style={{ color: '#3b82f6' }} />
          <div>
            <p className="text-[13px] font-black text-white">Overseas Futures</p>
            <p className="text-[9px]" style={{ color: '#3d4f6b' }}>CFD Markets via Vantage</p>
          </div>
        </div>
        <BrokerBadge />
      </div>

      {/* ── Structural separation notice ── */}
      <SeparationBanner />

      {/* ── Category tabs ── */}
      <div
        className="flex gap-2 px-3 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            isActive={activeCat === cat.id}
            onClick={() => {
              setActiveCat(cat.id);
              setSelected(INSTRUMENTS[cat.id]?.[0] ?? null);
            }}
          />
        ))}
      </div>

      {/* ── Main content: instrument list + price panel ── */}
      <div className="px-3 space-y-2">

        {/* Selected instrument price panel */}
        {selected && (
          <PricePanelPlaceholder instrument={selected} />
        )}

        {/* Instrument list */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(4,6,14,0.6)' }}
          >
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
              Market Watch — {CATEGORIES.find(c => c.id === activeCat)?.label}
            </span>
            <span className="text-[8.5px]" style={{ color: '#2a3348' }}>
              {instruments.length} instruments
            </span>
          </div>
          <div className="p-2 space-y-1.5">
            {instruments.map((item) => (
              <InstrumentRow
                key={item.symbol + item.name}
                item={item}
                isActive={selected?.symbol === item.symbol && selected?.name === item.name}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        {/* ── Account tiers ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(4,6,14,0.7)', border: '1px solid rgba(148,163,184,0.07)' }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-2 border-b"
            style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(4,6,14,0.6)' }}
          >
            <Briefcase className="w-3 h-3" style={{ color: '#3b82f6' }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
              Vantage Account Types
            </span>
          </div>
          <div
            className="flex gap-2.5 p-3 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            <AccountTierCard tier="Standard" min="$50"   spread="1.0 pips" leverage="500:1" note="Best for beginners" recommended={false} />
            <AccountTierCard tier="Raw ECN"  min="$500"  spread="0.0 pips" leverage="500:1" note="+ $3/lot commission" recommended={true}  />
            <AccountTierCard tier="Pro ECN"  min="$10K"  spread="0.0 pips" leverage="500:1" note="Priority execution"  recommended={false} />
          </div>
        </div>

        {/* ── Broker connect flow ── */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))',
            border: '1px solid rgba(59,130,246,0.14)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4" style={{ color: '#3b82f6' }} />
            <p className="text-xs font-black text-white">Connect Your Vantage Account</p>
          </div>
          <p className="text-[10px] leading-relaxed mb-3" style={{ color: '#475569' }}>
            Link your Vantage brokerage account to access live CFD prices, execution,
            and your overseas futures portfolio directly within this platform.
          </p>
          <div className="space-y-2 mb-4">
            {[
              'Real-time broker quotes (not simulated)',
              'Direct order execution via Vantage MT4/MT5',
              'Margin, swap and commission calculations',
              'Portfolio sync: positions, history, balance',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.12)' }}
                >
                  <span className="text-[7px] font-black" style={{ color: '#3b82f6' }}>✓</span>
                </div>
                <span className="text-[10px]" style={{ color: '#64748b' }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1))',
                color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
            >
              <Link2 className="w-3.5 h-3.5" />
              Connect
            </button>
            <button
              className="py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: 'rgba(148,163,184,0.05)',
                color: '#64748b',
                border: '1px solid rgba(148,163,184,0.08)',
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Account
            </button>
          </div>
        </div>

        {/* ── Regulatory / disclaimer ── */}
        <div
          className="rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.08)' }}
        >
          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <p className="text-[8.5px] leading-relaxed" style={{ color: '#44556b' }}>
            CFD trading involves significant risk of loss. Overseas futures and CFDs are complex
            instruments. Vantage Markets is a regulated broker (ASIC, FCA, CIMA). Past performance
            is not indicative of future results. This section is for execution via Vantage — it does
            not involve on-chain settlement or crypto orderbooks.
          </p>
        </div>
      </div>
    </div>
  );
}