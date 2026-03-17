import React from 'react';

/**
 * AnimatedBackground — Premium Solana-style ambient background.
 * z-index: -1, pointer-events: none — never blocks UI.
 *
 * Layers (back → front):
 *   1. Deep dark base
 *   2. Static Solana gradient wash (purple top-left, green bottom-right, blue center)
 *   3. Slow-drifting ambient orbs (sentiment-aware tint)
 *   4. Diagonal gradient whisper
 *   5. Micro dot-grid texture
 *   6. Edge vignette
 */
export default function AnimatedBackground({ direction = 'neutral' }) {
  const orbs = {
    bullish: {
      o1: 'rgba(20,241,149,0.07)',
      o2: 'rgba(0,212,170,0.05)',
      o3: 'rgba(153,69,255,0.05)',
      o4: 'rgba(59,130,246,0.04)',
    },
    bearish: {
      o1: 'rgba(153,69,255,0.07)',
      o2: 'rgba(239,68,68,0.04)',
      o3: 'rgba(59,130,246,0.05)',
      o4: 'rgba(139,92,246,0.04)',
    },
    neutral: {
      o1: 'rgba(153,69,255,0.08)',
      o2: 'rgba(20,241,149,0.05)',
      o3: 'rgba(59,130,246,0.06)',
      o4: 'rgba(0,212,170,0.04)',
    },
  }[direction] ?? {
    o1: 'rgba(153,69,255,0.08)',
    o2: 'rgba(20,241,149,0.05)',
    o3: 'rgba(59,130,246,0.06)',
    o4: 'rgba(0,212,170,0.04)',
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. Dark base ─────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, background: '#05070d' }} />

      {/* ── 2. Static Solana wash ─────────────────────────── */}
      {/* Purple bloom — top-left */}
      <div style={{
        position: 'absolute',
        width: '75%', height: '65%',
        top: '-18%', left: '-12%',
        background: 'radial-gradient(ellipse at center, rgba(153,69,255,0.09) 0%, rgba(153,69,255,0.03) 50%, transparent 70%)',
        filter: 'blur(48px)',
      }} />
      {/* Green bloom — bottom-right */}
      <div style={{
        position: 'absolute',
        width: '65%', height: '55%',
        bottom: '-8%', right: '-8%',
        background: 'radial-gradient(ellipse at center, rgba(20,241,149,0.06) 0%, rgba(20,241,149,0.02) 50%, transparent 70%)',
        filter: 'blur(56px)',
      }} />
      {/* Blue mid-wash — center */}
      <div style={{
        position: 'absolute',
        width: '55%', height: '45%',
        top: '28%', left: '22%',
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.01) 55%, transparent 72%)',
        filter: 'blur(64px)',
      }} />

      {/* ── 3. Drifting ambient orbs (slow, sentiment-aware) ── */}
      {/* Orb A — large, top-center, purple/green */}
      <div style={{
        position: 'absolute',
        width: 680, height: 680,
        top: '-22%', left: '22%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${orbs.o1} 0%, transparent 62%)`,
        filter: 'blur(24px)',
        animation: 'ambientDrift1 28s ease-in-out infinite',
        willChange: 'transform',
      }} />
      {/* Orb B — medium, bottom-left, green/teal */}
      <div style={{
        position: 'absolute',
        width: 480, height: 480,
        bottom: '2%', left: '-10%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${orbs.o2} 0%, transparent 62%)`,
        filter: 'blur(32px)',
        animation: 'ambientDrift2 34s ease-in-out infinite',
        willChange: 'transform',
      }} />
      {/* Orb C — medium, mid-right, blue */}
      <div style={{
        position: 'absolute',
        width: 420, height: 420,
        top: '32%', right: '-6%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${orbs.o3} 0%, transparent 62%)`,
        filter: 'blur(28px)',
        animation: 'ambientDrift3 38s ease-in-out infinite',
        willChange: 'transform',
      }} />
      {/* Orb D — small, lower-center, teal accent */}
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        bottom: '22%', left: '38%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${orbs.o4} 0%, transparent 62%)`,
        filter: 'blur(36px)',
        animation: 'ambientDrift1 44s ease-in-out infinite reverse',
        willChange: 'transform',
      }} />
      {/* Orb E — extra slow, very large, purple sweep top-right */}
      <div style={{
        position: 'absolute',
        width: 560, height: 560,
        top: '-5%', right: '-15%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(153,69,255,0.05) 0%, transparent 60%)',
        filter: 'blur(40px)',
        animation: 'ambientDrift2 50s ease-in-out infinite reverse',
        willChange: 'transform',
      }} />

      {/* ── 4. Diagonal gradient whisper ─────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(153,69,255,0.03) 0%, transparent 38%, rgba(20,241,149,0.025) 68%, transparent 100%)',
      }} />

      {/* ── 5. Micro dot-grid texture ─────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        opacity: 0.3,
      }} />

      {/* ── 6. Edge vignette ──────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 45%, transparent 38%, rgba(5,7,13,0.72) 100%)',
      }} />
    </div>
  );
}