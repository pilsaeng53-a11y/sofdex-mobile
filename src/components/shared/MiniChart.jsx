import React, { useMemo } from 'react';

export default function MiniChart({ positive = true, height = 40, width = 120, className = '' }) {
  const path = useMemo(() => {
    const points = 20;
    const data = [];
    let value = 50;
    for (let i = 0; i < points; i++) {
      value += (Math.random() - (positive ? 0.4 : 0.6)) * 8;
      value = Math.max(10, Math.min(90, value));
      data.push(value);
    }
    const stepX = width / (points - 1);
    const scale = height / 100;
    const pathPoints = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - v * scale}`);
    return pathPoints.join(' ');
  }, [positive, height, width]);

  const color = positive ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}