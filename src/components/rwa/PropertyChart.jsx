import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#151c2e] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold text-[#00d4aa]">${payload[0].value.toFixed(2)}</p>
    </div>
  );
};

export default function PropertyChart({ series }) {
  if (!series || series.length === 0) return null;

  const prices = series.map(d => d.price);
  const minP = Math.min(...prices) * 0.97;
  const maxP = Math.max(...prices) * 1.01;
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const isUp = endPrice >= startPrice;
  const color = isUp ? '#00d4aa' : '#ef4444';
  const pct = (((endPrice - startPrice) / startPrice) * 100).toFixed(2);

  // Show every 6th label
  const tickData = series.filter((_, i) => i % 6 === 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">3-Year Performance</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Benchmark-based index</p>
        </div>
        <div className={`text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}{pct}% <span className="text-xs text-slate-500 font-normal">3yr</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#475569', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(2)}
            ticks={tickData.map(d => d.date)}
          />
          <YAxis domain={[minP, maxP]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill="url(#propGrad)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}