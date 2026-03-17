import React from 'react';

/** Generic shimmer skeleton blocks */
export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-3 rounded-md ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-[#151c2e] rounded-2xl p-4 border border-[rgba(148,163,184,0.05)] space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-1/3 h-2" />
        </div>
        <div className="skeleton w-14 h-5 rounded-lg" />
      </div>
      <SkeletonLine className="w-full h-2" />
    </div>
  );
}

export function SkeletonPrice({ className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="skeleton h-7 w-32 rounded-lg" />
      <div className="skeleton h-3 w-16 rounded-md" />
    </div>
  );
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`skeleton-dark rounded-xl w-full ${className}`} style={{ height: 140 }} />
  );
}

/** Pulsing live indicator dot with ring animation */
export function LiveDot({ color = '#00d4aa', size = 6 }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <span
        className="absolute inline-flex rounded-full opacity-60 animate-ping"
        style={{ width: size * 2, height: size * 2, backgroundColor: color, animationDuration: '2s' }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}

/** Animated number value that flashes on change */
export function AnimatedValue({ value, className = '', prefix = '' }) {
  return (
    <span className={`transition-all duration-300 ${className}`}>
      {prefix}{value}
    </span>
  );
}