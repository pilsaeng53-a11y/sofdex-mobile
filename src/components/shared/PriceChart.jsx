import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const timeframes = ['1H', '4H', '1D', '1W', '1M', '3M'];

export default function PriceChart({ basePrice = 100, positive = true }) {
  const [activeTimeframe, setActiveTimeframe] = useState('1D');

  const data = useMemo(() => {
    const points = 48;
    const result = [];
    let price = basePrice * (1 - (positive ? 0.05 : -0.05));
    for (let i = 0; i < points; i++) {
      price += (Math.random() - (positive ? 0.42 : 0.58)) * basePrice * 0.008;
      result.push({
        time: `${i}`,
        price: Math.max(price, basePrice * 0.8),
        label: i % 8 === 0 ? `${(i / 2).toFixed(0)}:00` : ''
      });
    }
    return result;
  }, [basePrice, positive, activeTimeframe]);

  const color = positive ? '#22c55e' : '#ef4444';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg px-3 py-2 text-xs">
          <span className="text-white font-semibold">${payload[0].value.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex gap-1.5 mb-4 px-1">
        {timeframes.map(tf => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTimeframe === tf
                ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#chartGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}