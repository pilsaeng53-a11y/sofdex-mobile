import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Compass, TrendingUp, Zap, Star, Clock, BarChart3, ChevronRight } from 'lucide-react';

const TRENDING = [
  { asset: 'RNDR', name: 'Render Network', reason: 'AI compute demand +42%', change: '+12.3%', type: 'Trending', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { asset: 'JUP',  name: 'Jupiter',        reason: 'Volume 8.4x above avg',  change: '+8.7%',  type: 'Volume Spike', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { asset: 'SOL',  name: 'Solana',         reason: 'Whale accumulation $27M', change: '+11.3%', type: 'Whale Buy', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

const HIGH_VOLUME = [
  { asset: 'BTC',  name: 'Bitcoin',   volume: '$42B',  change: '+6.4%',  pct: 85, color: 'bg-amber-400' },
  { asset: 'ETH',  name: 'Ethereum',  volume: '$18B',  change: '+2.1%',  pct: 62, color: 'bg-blue-400' },
  { asset: 'SOL',  name: 'Solana',    volume: '$9.1B', change: '+11.3%', pct: 44, color: 'bg-purple-400' },
];

const NEW_LISTINGS = [
  { asset: 'PYTH',  name: 'Pyth Network',  price: '$0.38',  launched: '2 days ago', change: '+24.8%' },
  { asset: 'DRIFT', name: 'Drift Protocol', price: '$1.82',  launched: '5 days ago', change: '+18.2%' },
  { asset: 'ZETA',  name: 'Zeta Markets',  price: '$0.12',  launched: '8 days ago', change: '+61.4%' },
];

const UNDERVALUED = [
  { asset: 'RE-DXB', name: 'Dubai Real Estate', fairVal: '$148.00', current: '$124.50', upside: '+18.9%', basis: 'AI DCF model' },
  { asset: 'RE-NYC', name: 'NYC Real Estate',    fairVal: '$58.20',  current: '$52.40',  upside: '+10.9%', basis: 'Cap rate analysis' },
];

const TABS = ['Trending', 'High Volume', 'New Listings', 'Undervalued'];

export default function AssetDiscovery() {
  const [tab, setTab] = useState('Trending');

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Compass className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Asset Discovery</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">AI-curated market opportunities</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
              tab === t ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent bg-[#151c2e]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Trending' && (
        <div className="space-y-3">
          {TRENDING.map((a, i) => (
            <div key={i} className={`glass-card rounded-2xl p-4 border ${a.color.replace('text-', 'border-')}/15`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center text-[11px] font-black ${a.color}`}>
                    {a.asset.slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{a.asset}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${a.bg} ${a.color}`}>{a.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{a.change}</p>
                  <p className="text-[10px] text-slate-500">24h</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{a.reason}</p>
              <Link to={createPageUrl('Trade')}>
                <button className="w-full py-2 rounded-xl gradient-teal text-white text-xs font-bold flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Quick Trade
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'High Volume' && (
        <div className="space-y-3">
          {HIGH_VOLUME.map((a, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa]">
                    {a.asset.slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{a.asset}</p>
                    <p className="text-[10px] text-slate-500">{a.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{a.volume}</p>
                  <p className={`text-[10px] font-bold ${a.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{a.change}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
                <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Volume share of top assets</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'New Listings' && (
        <div className="space-y-3">
          {NEW_LISTINGS.map((a, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center text-[11px] font-black text-[#00d4aa]">
                    {a.asset.slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{a.asset}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-600" />
                      <p className="text-[10px] text-slate-500">{a.launched}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{a.price}</p>
                  <p className="text-[10px] font-bold text-emerald-400">{a.change}</p>
                </div>
              </div>
              <Link to={createPageUrl('Trade')}>
                <button className="w-full py-2 mt-2 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/20 transition-all">
                  Trade {a.asset}
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'Undervalued' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-2">
            <p className="text-[10px] text-amber-400/80 font-semibold">AI Valuation Model</p>
            <p className="text-[10px] text-slate-600">Based on DCF, cap rates, and yield spread analysis. Not financial advice.</p>
          </div>
          {UNDERVALUED.map((a, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 border border-emerald-400/15">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{a.asset}</p>
                  <p className="text-[10px] text-slate-500">{a.name}</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 text-[10px] font-bold border border-emerald-400/20">
                  {a.upside} upside
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-[#0d1220] rounded-xl p-2.5">
                  <p className="text-[10px] text-slate-500">Current</p>
                  <p className="text-xs font-bold text-white">{a.current}</p>
                </div>
                <div className="bg-emerald-400/5 rounded-xl p-2.5">
                  <p className="text-[10px] text-slate-500">AI Fair Value</p>
                  <p className="text-xs font-bold text-emerald-400">{a.fairVal}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600">Basis: {a.basis}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}