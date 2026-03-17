import React, { useEffect, useRef } from 'react';

/**
 * AnimatedBackground — subtle animated gradient orbs that drift slowly.
 * Positioned fixed behind everything. Market-sentiment aware via `direction` prop.
 * direction: 'bullish' | 'bearish' | 'neutral'
 */
export default function AnimatedBackground({ direction = 'neutral' }) {
  const orbColors = {
    bullish: {
      orb1: 'rgba(0,212,170,0.06)',
      orb2: 'rgba(34,197,94,0.04)',
      orb3: 'rgba(6,182,212,0.04)',
    },
    bearish: {
      orb1: 'rgba(239,68,68,0.06)',
      orb2: 'rgba(139,92,246,0.04)',
      orb3: 'rgba(239,68,68,0.03)',
    },
    neutral: {
      orb1: 'rgba(139,92,246,0.05)',
      orb2: 'rgba(0,212,170,0.04)',
      orb3: 'rgba(59,130,246,0.04)',
    },
  }[direction] || {};

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Orb 1 — top center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: '-15%',
          left: '30%',
          background: `radial-gradient(circle, ${orbColors.orb1} 0%, transparent 70%)`,
          animation: 'orbDrift1 18s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      {/* Orb 2 — bottom left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: '10%',
          left: '-10%',
          background: `radial-gradient(circle, ${orbColors.orb2} 0%, transparent 70%)`,
          animation: 'orbDrift2 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      {/* Orb 3 — mid right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          top: '40%',
          right: '-5%',
          background: `radial-gradient(circle, ${orbColors.orb3} 0%, transparent 70%)`,
          animation: 'orbDrift3 26s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}