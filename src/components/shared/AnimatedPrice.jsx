import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedPrice — smoothly animates number changes with directional color flash.
 * Usage: <AnimatedPrice value={price} prefix="$" formatter={fn} className="..." />
 */
export default function AnimatedPrice({ value, prefix = '', suffix = '', formatter, className = '', flashOnly = false }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null
  const [slide, setSlide] = useState(null); // 'up' | 'down' | null
  const prevRef = useRef(value);
  const timerRef = useRef(null);

  useEffect(() => {
    if (value === prevRef.current) return;
    const dir = value > prevRef.current ? 'up' : 'down';
    prevRef.current = value;

    setFlash(dir);
    if (!flashOnly) setSlide(dir);
    setDisplay(value);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFlash(null);
      setSlide(null);
    }, 700);
  }, [value, flashOnly]);

  const formatted = formatter ? formatter(display) : display;

  const flashColor = flash === 'up'
    ? 'text-emerald-400'
    : flash === 'down'
    ? 'text-red-400'
    : '';

  const slideAnim = slide === 'up'
    ? 'animate-price-up'
    : slide === 'down'
    ? 'animate-price-down'
    : '';

  return (
    <span
      className={`inline-block tabular-nums transition-colors duration-300 ${flashColor} ${slideAnim} ${className}`}
      style={{
        textShadow: flash === 'up'
          ? '0 0 12px rgba(52,211,153,0.7)'
          : flash === 'down'
          ? '0 0 12px rgba(248,113,113,0.7)'
          : 'none',
        transition: 'color 0.35s ease, text-shadow 0.35s ease',
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}