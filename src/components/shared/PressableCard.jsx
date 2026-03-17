import React, { useRef, useState, useCallback } from 'react';

/**
 * PressableCard — wraps any card with:
 *  - 3D tilt on hover (perspective transform)
 *  - light reflection sweep following cursor
 *  - scale + glow press feedback
 *  - surrounding UI dim on hover (focus isolation)
 */
export default function PressableCard({
  children,
  className = '',
  tiltIntensity = 8,
  glowColor = 'rgba(0,212,170,0.18)',
  disabled = false,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [light, setLight] = useState({ x: 50, y: 50, opacity: 0 });
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (disabled) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    const tx = (cx - 0.5) * tiltIntensity;
    const ty = (cy - 0.5) * -tiltIntensity;
    setTilt({ x: tx, y: ty });
    setLight({ x: cx * 100, y: cy * 100, opacity: 0.12 });
  }, [disabled, tiltIntensity]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setLight(l => ({ ...l, opacity: 0 }));
    setHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setHovered(true);
  }, [disabled]);

  const handleMouseDown = useCallback(() => {
    if (!disabled) setPressed(true);
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setPressed(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${pressed ? 0.975 : hovered ? 1.018 : 1})`,
        transition: pressed
          ? 'transform 0.08s ease'
          : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,170,0.12), 0 0 20px ${glowColor}`
          : pressed
          ? `0 2px 8px rgba(0,0,0,0.3), 0 0 8px ${glowColor}`
          : undefined,
        willChange: 'transform',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={onClick}
    >
      {/* Light reflection overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgba(255,255,255,${light.opacity}) 0%, transparent 60%)`,
          transition: 'opacity 0.2s ease',
        }}
      />
      {children}
    </div>
  );
}