import React from 'react';

/**
 * AnimatedBackground — Solana-style subtle gradient system.
 * Layers: deep dark base → static Solana gradient wash → animated drifting orbs → noise/grid texture
 * direction: 'bullish' | 'bearish' | 'neutral'
 */
export default function AnimatedBackground({ direction = 'neutral' }) {
  // Sentiment shifts the dominant orb tint slightly
  const sentimentOrbs = {
    bullish: {
      orb1: 'rgba(20,241,149,0.07)',   // solana green
      orb2: 'rgba(0,212,170,0.05)',
      orb3: 'rgba(153,69,255,0.06)',   // solana purple
      orb4: 'rgba(34,197,94,0.04)',
    },
    bearish: {
      orb1: 'rgba(153,69,255,0.07)',
      orb2: 'rgba(239,68,68,0.04)',
      orb3: 'rgba(59,130,246,0.05)',
      orb4: 'rgba(139,92,246,0.05)',
    },
    neutral: {
      orb1: 'rgba(153,69,255,0.08)',   // solana purple
      orb2: 'rgba(20,241,149,0.05)',   // solana green
      orb3: 'rgba(59,130,246,0.06)',   // blue
      orb4: 'rgba(0,212,170,0.04)',    // teal
    },
  }[direction] || {};

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">

      {/* ── Layer 1: Deep dark base ───────────────────────── */}
      <div className="absolute inset-0" style={{ background: '#05070d' }} />

      {/* ── Layer 2: Solana-style static gradient wash ────── */}
      {/* Top-left purple bloom */}
      <div
        className="absolute"
        style={{
          width: '80%',
          height: '70%',
          top: '-20%',
          left: '-15%',
          background: 'radial-gradient(ellipse at center, rgba(153,69,255,0.10) 0%, rgba(153,69,255,0.03) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Bottom-right green bloom */}
      <div
        className="absolute"
        style={{
          width: '70%',
          height: '60%',
          bottom: '-10%',
          right: '-10%',
          background: 'radial-gradient(ellipse at center, rgba(20,241,149,0.07) 0%, rgba(20,241,149,0.02) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Center blue mid-tone */}
      <div
        className="absolute"
        style={{
          width: '60%',
          height: '50%',
          top: '25%',
          left: '20%',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Layer 3: Animated drifting orbs (sentiment-aware) ── */}
      {/* Orb 1 — top center, primary */}
      <div
        className="absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          top: '-20%',
          left: '25%',
          background: `radial-gradient(circle, ${sentimentOrbs.orb1} 0%, transparent 65%)`,
          animation: 'orbDrift1 20s ease-in-out infinite',
          willChange: 'transform',
          filter: 'blur(20px)',
        }}
      />
      {/* Orb 2 — bottom left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: '5%',
          left: '-12%',
          background: `radial-gradient(circle, ${sentimentOrbs.orb2} 0%, transparent 65%)`,
          animation: 'orbDrift2 25s ease-in-out infinite',
          willChange: 'transform',
          filter: 'blur(25px)',
        }}
      />
      {/* Orb 3 — mid right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          top: '35%',
          right: '-8%',
          background: `radial-gradient(circle, ${sentimentOrbs.orb3} 0%, transparent 65%)`,
          animation: 'orbDrift3 28s ease-in-out infinite',
          willChange: 'transform',
          filter: 'blur(20px)',
        }}
      />
      {/* Orb 4 — lower center, accent */}
      <div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          bottom: '25%',
          left: '35%',
          background: `radial-gradient(circle, ${sentimentOrbs.orb4} 0%, transparent 65%)`,
          animation: 'orbDrift1 32s ease-in-out infinite reverse',
          willChange: 'transform',
          filter: 'blur(30px)',
        }}
      />

      {/* ── Layer 4: Subtle diagonal gradient tint ─────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(153,69,255,0.04) 0%, transparent 40%, rgba(20,241,149,0.03) 70%, transparent 100%)',
        }}
      />

      {/* ── Layer 5: Very subtle dot grid texture ───────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
        }}
      />

      {/* ── Layer 6: Vignette (edges darker) ────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,7,13,0.7) 100%)',
        }}
      />
    </div>
  );
}