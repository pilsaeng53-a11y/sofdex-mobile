import React from 'react';

export default function StrategyChart({ data }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 80;
  const width = 100;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 10);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = data[data.length - 1] >= data[0];
  const color = isPositive ? '#22c55e' : '#ef4444';

  return (
    <svg width="100%" height="80" viewBox="0 0 100 80" className="w-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={points + ` 100,80 0,80`}
        fill={color}
        fillOpacity="0.1"
      />
    </svg>
  );
}