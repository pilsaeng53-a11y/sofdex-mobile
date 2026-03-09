import React, { useMemo } from 'react';

/**
 * MiniChart — renders a sparkline.
 * Pass `data` (array of numbers) for real price points,
 * or `positive` (bool) to render a random trend fallback.
 */
export default function MiniChart({ data, positive = true, height = 24, width = 60, className = '' }) {
  const path = useMemo(() => {
    let pts = data && data.length >= 2 ? data : null;

    if (!pts) {
      // Fallback: generate random trend
      let value = 50;
      pts = [];
      for (let i = 0; i < 20; i++) {
        value += (Math.random() - (positive ? 0.4 : 0.6)) * 8;
        value = Math.max(10, Math.min(90, value));
        pts.push(value);
      }
    }

    const min    = Math.min(...pts);
    const max    = Math.max(...pts);
    const range  = max - min || 1;
    const stepX  = width / (pts.length - 1);
    return pts
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * height * 0.85 - height * 0.075;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, positive, height, width]);

  const isPos  = data && data.length >= 2
    ? data[data.length - 1] >= data[0]
    : positive;
  const color  = isPos ? '#22c55e' : '#ef4444';
  const gradId = `mg-${isPos ? 'g' : 'r'}-${width}`;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}