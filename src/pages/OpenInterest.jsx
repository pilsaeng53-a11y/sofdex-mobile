import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { CRYPTO_MARKETS, formatPrice } from '../components/shared/MarketData';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import LiveOpenInterest from '../components/shared/LiveOpenInterest';

// Deterministic OI and long/short seeded from symbol
function getOIData(m) {
  const seed = m.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const oi = m.price * ((seed % 8) + 4) * 12500;
  const longPct = ((seed % 40) + 30); // 30–70%
  const shortPct = 100 - longPct;
  const change24h = (((seed % 21) - 10) * 0.8).toFixed(2);
  return { oi, longPct, shortPct, change24h: parseFloat(change24h) };
}

function fmtOI(v) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}

const SORT_OPTIONS = [['oi','OI'],['longs','Long%'],['change','24h Chg']];

export default function OpenInterest() {
  const [sortBy, setSortBy] = useState('oi');
  const [view, setView] = useState('list'); // list | chart

  const rows = CRYPTO_MARKETS.map(m => ({ ...m, ...getOIData(m) }));
  const sorted = [...rows].sort((a, b) => {
    if (sortBy === 'oi') return b.oi - a.oi;
    if (sortBy === 'longs') return b.longPct - a.longPct;
    return Math.abs(b.change24h) - Math.abs(a.change24h);
  });

  const totalOI = rows.reduce((s, r) => s + r.oi, 0);
  const chartData = sorted.slice(0, 10).map(r => ({ symbol: r.symbol, oi: r.oi / 1e6 }));

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Open Interest</h1>
        </div>
        <div className="flex gap-1.5">
          {['list','chart'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                view === v ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
              }`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="glass-card rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">Total Open Interest</p>
          <p className="text-2xl font-black text-white">{fmtOI(totalOI)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 mb-0.5">Assets Tracked</p>
          <p className="text-xl font-bold text-[#00d4aa]">{rows.length}</p>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-1.5 mb-3">
        {SORT_OPTIONS.map(([v, l]) => (
          <button key={v} onClick={() => setSortBy(v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              sortBy === v ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/25' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'
            }`}>{l}</button>
        ))}
      </div>

      {view === 'chart' && (
        <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 mb-4">
          <p className="text-xs text-slate-400 mb-3">Top 10 by Open Interest ($M)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="symbol" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip formatter={v => [`$${v.toFixed(0)}M`, 'OI']} contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="oi" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#00d4aa' : '#3b82f6'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-4 px-3 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.04)]">
        <span>Asset</span>
        <span className="text-center">Open Int.</span>
        <span className="text-center">L/S Ratio</span>
        <span className="text-right">24h Δ</span>
      </div>

      <div className="divide-y divide-[rgba(148,163,184,0.04)]">
        {sorted.map(r => (
          <Link key={r.symbol} to={`/Trade?symbol=${r.symbol}`}
            className="grid grid-cols-4 px-3 py-3 hover:bg-[#151c2e]/60 transition-colors items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1a2340] flex items-center justify-center text-[9px] font-black text-[#00d4aa]">
                {r.symbol.slice(0, 2)}
              </div>
              <span className="text-xs font-bold text-white">{r.symbol}</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white">{fmtOI(r.oi)}</p>
            </div>
            <div className="text-center">
              <div className="flex rounded-full overflow-hidden h-1.5 w-full max-w-[52px] mx-auto">
                <div className="bg-emerald-500" style={{ width: `${r.longPct}%` }} />
                <div className="bg-red-500 flex-1" />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">{r.longPct}/{r.shortPct}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${r.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.change24h >= 0 ? '+' : ''}{r.change24h}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}