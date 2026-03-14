import React from 'react';
import { Layers, Zap, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const liquidityData = [
  { t: '00:00', depth: 12.4 }, { t: '04:00', depth: 14.1 }, { t: '08:00', depth: 18.7 },
  { t: '12:00', depth: 22.3 }, { t: '16:00', depth: 19.8 }, { t: '20:00', depth: 16.2 }, { t: '24:00', depth: 15.1 },
];

const venues = [
  { name: 'Binance', share: '34%', latency: '1.2ms', status: 'active' },
  { name: 'OKX', share: '22%', latency: '1.8ms', status: 'active' },
  { name: 'Bybit', share: '18%', latency: '2.1ms', status: 'active' },
  { name: 'Coinbase', share: '14%', latency: '3.4ms', status: 'active' },
  { name: 'dYdX', share: '7%', latency: '4.1ms', status: 'active' },
  { name: 'Jupiter', share: '5%', latency: '0.8ms', status: 'active' },
];

const routingRules = [
  { label: 'liq_rule_best_price', value: 'Enabled' },
  { label: 'liq_rule_split_order', value: 'Enabled' },
  { label: 'liq_rule_slippage_cap', value: '0.15%' },
  { label: 'liq_rule_fee_routing', value: 'Minimize' },
];

export default function LiquidityView() {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      {/* Aggregated depth */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-bold text-white">{t('liq_depth_title')}</span>
        </div>
        <div className="flex gap-4 mb-3">
          <div><p className="text-[10px] text-slate-600">{t('liq_total_depth')}</p><p className="text-base font-black text-white">$22.3M</p></div>
          <div><p className="text-[10px] text-slate-600">{t('liq_venues')}</p><p className="text-base font-black text-white">6</p></div>
          <div><p className="text-[10px] text-slate-600">{t('liq_avg_fill')}</p><p className="text-base font-black text-[#00d4aa]">99.7%</p></div>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liquidityData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8 }} labelStyle={{ color: '#94a3b8', fontSize: 10 }} itemStyle={{ color: '#00d4aa', fontSize: 10 }} />
              <Area type="monotone" dataKey="depth" stroke="#00d4aa" strokeWidth={1.5} fill="url(#liqGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Venue Breakdown */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-sm font-bold text-white">{t('liq_venues_title')}</span>
        </div>
        <div className="space-y-2">
          {venues.map(v => (
            <div key={v.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2340]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
                <span className="text-xs text-white font-medium">{v.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">{v.latency}</span>
                <span className="text-xs font-bold text-white w-10 text-right">{v.share}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Routing Rules */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">{t('liq_routing_title')}</span>
        </div>
        <div className="space-y-2">
          {routingRules.map(r => (
            <div key={r.label} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2340]">
              <span className="text-xs text-slate-400">{t(r.label)}</span>
              <span className="text-xs font-bold text-[#00d4aa]">{r.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-700 mt-2">{t('liq_routing_note')}</p>
      </div>
    </div>
  );
}