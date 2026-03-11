import React from 'react';
import { TrendingUp, Globe, Percent, BarChart2 } from 'lucide-react';
import { LANDMARK_RE, ART_MARKETS } from '../shared/RWAData';
import { RWA_MARKETS } from '../shared/MarketData';

const TOTAL_MCAP = '$186.4B';
const TOTAL_VOL  = '$2.84B';
const AVG_YIELD  = '5.87%';

export default function RWAOverviewDashboard() {
  const totalAssets = LANDMARK_RE.length + RWA_MARKETS.length + ART_MARKETS.length;

  const topPerformers = [...LANDMARK_RE]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);

  const stats = [
    { label: 'Total Market Cap', value: TOTAL_MCAP, icon: Globe,     color: 'text-[#00d4aa]' },
    { label: 'Listed Assets',    value: totalAssets, icon: BarChart2, color: 'text-blue-400'  },
    { label: 'Avg Yield',        value: AVG_YIELD,   icon: Percent,   color: 'text-emerald-400' },
    { label: '24h Volume',       value: TOTAL_VOL,   icon: TrendingUp, color: 'text-amber-400' },
  ];

  return (
    <div className="px-4 mb-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-slate-500 font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Top Performers */}
      <div className="glass-card rounded-2xl p-3.5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Performing RWA</p>
        <div className="space-y-2.5">
          {topPerformers.map((p, i) => (
            <div key={p.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#0d1220] flex items-center justify-center text-[9px] font-bold text-[#00d4aa]">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{p.shortName}</p>
                  <p className="text-[10px] text-slate-500">{p.flag} {p.city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">${p.tokenPrice.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-emerald-400">+{p.change24h.toFixed(2)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}