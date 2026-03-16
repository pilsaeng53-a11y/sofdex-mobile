import React, { useState, useEffect, useRef } from 'react';
import { Flame, TrendingUp, TrendingDown, Play, Pause, RotateCcw, Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function LiqHeatmap({ asset, price }) {
  if (!price) return null;
  // Generate 8 price levels above and below current price
  const levels = Array.from({ length: 16 }, (_, i) => {
    const offset = (i - 8) * price * 0.005; // 0.5% steps
    const lvlPrice = price + offset;
    const seed = Math.abs(Math.round(offset * 100)) % 100;
    const longs = seed * 1.2 + 20;
    const shorts = (100 - seed) * 0.8 + 10;
    return { price: lvlPrice, longs, shorts, total: longs + shorts };
  });
  const maxTotal = Math.max(...levels.map(l => l.total));

  return (
    <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-bold text-white">{asset} Liquidation Heatmap</span>
        <span className="text-[10px] text-slate-500 ml-auto">by price level</span>
      </div>
      <div className="space-y-0.5">
        {levels.map((lvl, i) => {
          const isCurrent = i === 7 || i === 8;
          const barPct = (lvl.total / maxTotal) * 100;
          const longPct = (lvl.longs / lvl.total) * barPct;
          const shortPct = barPct - longPct;
          return (
            <div key={i} className={`flex items-center gap-2 px-1 py-0.5 rounded ${isCurrent ? 'bg-[#00d4aa]/5 border border-[#00d4aa]/15' : ''}`}>
              <span className={`text-[9px] font-mono w-20 flex-shrink-0 ${isCurrent ? 'text-[#00d4aa]' : 'text-slate-600'}`}>
                ${lvl.price >= 1 ? lvl.price.toFixed(2) : lvl.price.toFixed(6)}
                {isCurrent ? ' ◀' : ''}
              </span>
              <div className="flex-1 h-3 bg-[#0a0e1a] rounded overflow-hidden flex">
                <div className="bg-red-500/70 rounded-l" style={{ width: `${longPct}%` }} />
                <div className="bg-emerald-500/70 rounded-r" style={{ width: `${shortPct}%` }} />
              </div>
              <span className="text-[9px] text-slate-600 w-10 text-right flex-shrink-0">${(lvl.total * (PRICES[asset] || 100) * 0.001).toFixed(0)}K</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500/70" /><span className="text-[9px] text-slate-500">Long Liq</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500/70" /><span className="text-[9px] text-slate-500">Short Liq</span></div>
      </div>
    </div>
  );
}

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'LTC', 'ARB', 'OP', 'SUI', 'INJ', 'PEPE', 'NEAR', 'AAVE', 'JUP'];
const EXCHANGES = ['Binance', 'OKX', 'Bybit', 'dYdX', 'Hyperliquid', 'BitMEX'];
const PRICES = {
  BTC: 98425, ETH: 3842, SOL: 187, BNB: 412, XRP: 0.592, ADA: 0.612, DOGE: 0.182,
  AVAX: 38.5, DOT: 9.84, LINK: 18.72, MATIC: 0.894, LTC: 112.4, ARB: 1.12, OP: 2.34,
  SUI: 3.82, INJ: 28.4, PEPE: 0.0000124, NEAR: 7.82, AAVE: 142.3, JUP: 1.24,
};

const REPLAY_PERIODS = ['24h', '7d', '30d'];

let _id = 0;
function genLiq(asset) {
  const price = PRICES[asset] || 100;
  const side = Math.random() > 0.5 ? 'Long' : 'Short';
  const amount = Math.floor(Math.random() * 600 + 20);
  return {
    id: ++_id,
    asset,
    side,
    amount,
    usdValue: amount * price,
    exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
    markPrice: (price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(price >= 1 ? 2 : 8),
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}

function genLiqAny() {
  return genLiq(ASSETS[Math.floor(Math.random() * ASSETS.length)]);
}

function genHistoricalData(asset, period) {
  const price = PRICES[asset] || 100;
  const points = period === '24h' ? 24 : period === '7d' ? 28 : 30;
  return Array.from({ length: points }, (_, i) => {
    const longs = Math.random() * 200 + 20;
    const shorts = Math.random() * 200 + 20;
    return {
      label: period === '24h' ? `${i}h` : period === '7d' ? `D${Math.floor(i / 4) + 1}` : `D${i + 1}`,
      longs: Math.round(longs * price / 1000),
      shorts: Math.round(shorts * price / 1000),
    };
  });
}

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function LiquidationFeed() {
  const [selectedAsset, setSelectedAsset] = useState('ALL');
  const [items, setItems] = useState(() => Array.from({ length: 30 }, genLiqAny));
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState('live'); // live | replay
  const [replayPeriod, setReplayPeriod] = useState('24h');
  const [replayData, setReplayData] = useState(() => genHistoricalData('BTC', '24h'));
  const [replayAsset, setReplayAsset] = useState('BTC');
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const replayRef = useRef(null);

  // Live feed
  useEffect(() => {
    if (paused || tab !== 'live') return;
    const id = setInterval(() => {
      setItems(prev => [genLiqAny(), ...prev.slice(0, 59)]);
    }, 900 + Math.random() * 600);
    return () => clearInterval(id);
  }, [paused, tab]);

  // Replay per asset+period
  useEffect(() => {
    setReplayData(genHistoricalData(replayAsset, replayPeriod));
    setReplayIndex(0);
    setReplayPlaying(false);
    if (replayRef.current) { clearInterval(replayRef.current); replayRef.current = null; }
  }, [replayAsset, replayPeriod]);

  useEffect(() => {
    if (!replayPlaying) {
      if (replayRef.current) { clearInterval(replayRef.current); replayRef.current = null; }
      return;
    }
    replayRef.current = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= replayData.length - 1) {
          setReplayPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => { if (replayRef.current) clearInterval(replayRef.current); };
  }, [replayPlaying, replayData.length]);

  const displayItems = selectedAsset === 'ALL' ? items : items.filter(l => l.asset === selectedAsset);
  const total = displayItems.reduce((a, l) => a + l.usdValue, 0);
  const longLiqs = displayItems.filter(l => l.side === 'Long').reduce((a, l) => a + l.usdValue, 0);
  const shortLiqs = displayItems.filter(l => l.side === 'Short').reduce((a, l) => a + l.usdValue, 0);
  const largest = displayItems.length > 0 ? Math.max(...displayItems.map(l => l.usdValue)) : 0;

  const visibleReplayData = replayData.slice(0, replayIndex + 1);

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-bold text-white">Liquidation Feed</h1>
          {tab === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot ml-1" />}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setTab('live')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${tab === 'live' ? 'bg-orange-400/15 text-orange-400 border-orange-400/30' : 'bg-[#151c2e] text-slate-400 border-[rgba(148,163,184,0.08)]'}`}>Live</button>
          <button onClick={() => setTab('replay')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${tab === 'replay' ? 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-400 border-[rgba(148,163,184,0.08)]'}`}>
            <RotateCcw className="w-3 h-3 inline mr-1" />Replay
          </button>
        </div>
      </div>

      {tab === 'live' && (
        <>
          {/* Asset Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
            {['ALL', ...ASSETS].map(a => (
              <button key={a} onClick={() => setSelectedAsset(a)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${selectedAsset === a ? 'bg-orange-400/15 text-orange-400 border-orange-400/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}>
                {a}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <div className="glass-card rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 mb-1">Total Liquidated</p>
              <p className="text-base font-bold text-white">{fmt(total)}</p>
            </div>
            <div className="glass-card rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 mb-1">Largest Single</p>
              <p className="text-base font-bold text-orange-400">{largest > 0 ? fmt(largest) : '-'}</p>
            </div>
            <div className="glass-card rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 mb-1">Long Liquidations</p>
              <p className="text-sm font-bold text-red-400">{fmt(longLiqs)}</p>
            </div>
            <div className="glass-card rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 mb-1">Short Liquidations</p>
              <p className="text-sm font-bold text-emerald-400">{fmt(shortLiqs)}</p>
            </div>
          </div>

          {/* Price-level heatmap for selected asset */}
          {selectedAsset !== 'ALL' && (
            <div className="mb-4">
              <LiqHeatmap asset={selectedAsset} price={PRICES[selectedAsset]} />
            </div>
          )}

          <button onClick={() => setPaused(v => !v)}
            className={`w-full mb-4 py-2 rounded-xl text-xs font-semibold border transition-all ${paused ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'bg-[#151c2e] text-slate-400 border-[rgba(148,163,184,0.08)]'}`}>
            {paused ? '▶ Resume Feed' : '⏸ Pause Feed'}
          </button>

          {/* Feed */}
          <div className="space-y-2">
            {displayItems.map((liq, i) => (
              <div key={liq.id} className={`glass-card rounded-xl px-3.5 py-3 flex items-center justify-between ${i === 0 ? 'border border-orange-400/25' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${liq.side === 'Long' ? 'bg-red-400/10' : 'bg-emerald-400/10'}`}>
                    {liq.side === 'Long' ? <TrendingDown className="w-4 h-4 text-red-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{liq.asset}-PERP</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${liq.side === 'Long' ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>{liq.side} Liq</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{liq.exchange} · {liq.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${liq.usdValue >= 100_000 ? 'text-orange-400' : 'text-white'}`}>{fmt(liq.usdValue)}</p>
                  <p className="text-[10px] text-slate-500">{liq.amount} {liq.asset}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'replay' && (
        <div className="space-y-4">
          {/* Replay Asset Selector */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold">Asset</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {ASSETS.map(a => (
                <button key={a} onClick={() => setReplayAsset(a)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${replayAsset === a ? 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Replay Period */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold">Period</p>
            <div className="flex gap-2">
              {REPLAY_PERIODS.map(p => (
                <button key={p} onClick={() => setReplayPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${replayPeriod === p ? 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}>
                  Last {p}
                </button>
              ))}
            </div>
          </div>

          {/* Replay Controls */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">{replayAsset} Liquidation Replay</span>
              <span className="text-xs text-slate-500">Frame {replayIndex + 1}/{replayData.length}</span>
            </div>
            <div className="w-full bg-[#0a0e1a] rounded-full h-1.5 mb-3">
              <div className="h-1.5 rounded-full bg-[#00d4aa] transition-all" style={{ width: `${((replayIndex + 1) / replayData.length) * 100}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setReplayIndex(0); setReplayPlaying(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0a0e1a] text-slate-400 border border-[rgba(148,163,184,0.08)] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={() => setReplayPlaying(v => !v)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${replayPlaying ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'}`}>
                {replayPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Play Replay</>}
              </button>
            </div>
          </div>

          {/* Replay Chart */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <p className="text-xs text-slate-400 mb-3">Liquidation Volume (in $K) — {replayAsset} · {replayPeriod}</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={visibleReplayData} barGap={2}>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
                <Tooltip formatter={(v, name) => [`$${v}K`, name]} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="longs" name="Long Liq" fill="#ef4444" radius={[2,2,0,0]} maxBarSize={16} />
                <Bar dataKey="shorts" name="Short Liq" fill="#22c55e" radius={[2,2,0,0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-400" /><span className="text-[10px] text-slate-500">Long Liq</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-400" /><span className="text-[10px] text-slate-500">Short Liq</span></div>
            </div>
          </div>

          {/* Replay Stats */}
          {visibleReplayData.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card rounded-xl p-3.5">
                <p className="text-[10px] text-slate-500 mb-1">Total Long Liq</p>
                <p className="text-sm font-bold text-red-400">${visibleReplayData.reduce((s, d) => s + d.longs, 0).toLocaleString()}K</p>
              </div>
              <div className="glass-card rounded-xl p-3.5">
                <p className="text-[10px] text-slate-500 mb-1">Total Short Liq</p>
                <p className="text-sm font-bold text-emerald-400">${visibleReplayData.reduce((s, d) => s + d.shorts, 0).toLocaleString()}K</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}