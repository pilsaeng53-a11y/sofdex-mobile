import React, { useState } from 'react';
import { PieChart, TrendingUp, TrendingDown, Activity, BarChart2, Zap } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { CRYPTO_MARKETS } from '../components/shared/MarketData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const sentimentData = [
  { time: '6h', fear: 32, greed: 68 },
  { time: '12h', fear: 38, greed: 62 },
  { time: '1d', fear: 28, greed: 72 },
  { time: '2d', fear: 45, greed: 55 },
  { time: '3d', fear: 35, greed: 65 },
  { time: '7d', fear: 25, greed: 75 },
];

const volumeData = [
  { asset: 'BTC', volume: 38.2 },
  { asset: 'ETH', volume: 15.6 },
  { asset: 'SOL', volume: 8.4 },
  { asset: 'JUP', volume: 2.1 },
  { asset: 'RNDR', volume: 1.8 },
  { asset: 'RAY', volume: 1.2 },
];

const narratives = [
  { tag: 'AI Tokens', change: '+18.2%', sentiment: 'hot' },
  { tag: 'RWA', change: '+12.4%', sentiment: 'hot' },
  { tag: 'DePIN', change: '+9.1%', sentiment: 'rising' },
  { tag: 'Memecoins', change: '-8.4%', sentiment: 'cooling' },
  { tag: 'L1 Chains', change: '+4.2%', sentiment: 'rising' },
  { tag: 'GameFi', change: '-3.8%', sentiment: 'cooling' },
];

const sentimentColor = { hot: 'text-orange-400 bg-orange-400/10', rising: 'text-emerald-400 bg-emerald-400/10', cooling: 'text-blue-400 bg-blue-400/10' };

export default function Analytics() {
  const { getLiveAsset } = useMarketData();
  const { t } = useLang();
  const [tab, setTab] = useState('overview');

  const topVolume = [...CRYPTO_MARKETS]
    .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, 6);

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">{t('page_analytics')}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[['overview','analytics_overview'],['sentiment','analytics_sentiment'],['volume','analytics_volume'],['narratives','analytics_narratives']].map(([val, key]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === val ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Market sentiment meter */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-3">{t('analytics_sentimentIndex')}</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5 text-[11px]">
                  <span className="text-red-400">{t('analytics_fear')}</span>
                  <span className="text-emerald-400">{t('analytics_greed')}</span>
                </div>
                <div className="h-3 rounded-full bg-[#0d1220] overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 rounded-full" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-600">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">72</p>
                <p className="text-[10px] text-slate-500">{t('analytics_greed')}</p>
              </div>
            </div>
          </div>

          {/* Funding rates */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-3">{t('analytics_fundingHeatmap')}</p>
            <div className="grid grid-cols-4 gap-2">
              {CRYPTO_MARKETS.slice(0, 8).map(a => {
                const rate = ((Math.random() - 0.45) * 0.05).toFixed(4);
                const pos = parseFloat(rate) >= 0;
                return (
                  <div key={a.symbol} className={`rounded-xl p-2 text-center ${pos ? 'bg-emerald-500/8' : 'bg-red-500/8'}`}>
                    <p className="text-[10px] font-bold text-white">{a.symbol}</p>
                    <p className={`text-[10px] font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pos ? '+' : ''}{rate}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Narratives */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-3">{t('analytics_trendingNarratives')}</p>
            <div className="space-y-2">
              {narratives.map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sentimentColor[n.sentiment]}`}>{n.tag}</span>
                  </div>
                  <span className={`text-xs font-bold ${n.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{n.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'sentiment' && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-white mb-4">{t('analytics_fearGreedTime')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sentimentData}>
              <defs>
                <linearGradient id="greedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="greed" stroke="#00d4aa" fill="url(#greedGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="fear" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'volume' && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-white mb-4">{t('analytics_volumeByAsset')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="asset" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="volume" fill="#00d4aa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'narratives' && (
        <div className="space-y-3">
          {narratives.map((n, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{n.tag}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sentimentColor[n.sentiment]}`}>{n.sentiment}</span>
                </div>
              </div>
              <span className={`text-sm font-bold ${n.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{n.change}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}