import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtOI(v) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(3)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}

function fmtPct(v) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

// Simulates a realistic live OI feed — replace with real API/WS call
function useLiveOI(baseValue = 4_820_000_000, symbol = 'BTC') {
  const [value, setValue] = useState(baseValue);
  const [prev, setPrev]   = useState(baseValue);
  const [history, setHistory] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (30 - i) * 2000,
      v: baseValue + (Math.random() - 0.5) * baseValue * 0.004,
    }))
  );
  const seedRef = useRef(baseValue);

  useEffect(() => {
    // In production: replace this interval with a real fetch / WebSocket stream
    // e.g. ws.onmessage = (msg) => { const d = JSON.parse(msg.data); update(d.openInterest); }
    const id = setInterval(() => {
      seedRef.current += (Math.random() - 0.48) * seedRef.current * 0.002;
      const next = Math.max(seedRef.current, baseValue * 0.7);
      setPrev(v => v);
      setValue(curr => {
        setPrev(curr);
        return next;
      });
      setHistory(h => {
        const slice = h.length >= 90 ? h.slice(1) : h;
        return [...slice, { t: Date.now(), v: next }];
      });
    }, 1500);
    return () => clearInterval(id);
  }, [baseValue]);

  return { value, prev, history };
}

// ─── Animated number counter ──────────────────────────────────────────────────
function AnimatedNumber({ value, formatter, className }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash]     = useState(null); // 'up' | 'down' | null
  const prevRef = useRef(value);
  const rafRef  = useRef(null);

  useEffect(() => {
    if (value === prevRef.current) return;
    const dir = value > prevRef.current ? 'up' : 'down';
    setFlash(dir);
    const timeout = setTimeout(() => setFlash(null), 600);

    // Count animation
    const start = prevRef.current;
    const end   = value;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(end);
    };

    rafRef.current = requestAnimationFrame(tick);
    prevRef.current = value;

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const flashClass =
    flash === 'up'   ? 'text-emerald-300' :
    flash === 'down' ? 'text-red-300'     : '';

  return (
    <span
      className={`${className} transition-colors duration-300 ${flashClass}`}
      style={{
        textShadow: flash === 'up'
          ? '0 0 20px rgba(52,211,153,0.5)'
          : flash === 'down'
          ? '0 0 20px rgba(248,113,113,0.5)'
          : 'none',
      }}
    >
      {formatter(display)}
    </span>
  );
}

// ─── Mini sparkline tooltip ───────────────────────────────────────────────────
function SparkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-2 py-1 rounded-lg text-[9px] font-mono text-white"
      style={{ background: 'rgba(5,7,13,0.9)', border: '1px solid rgba(148,163,184,0.12)' }}>
      {fmtOI(payload[0].value)}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LiveOpenInterest({ baseValue = 4_820_000_000, symbol = 'BTC', compact = false }) {
  const { value, prev, history } = useLiveOI(baseValue, symbol);

  const change    = value - prev;
  const changePct = prev !== 0 ? (change / prev) * 100 : 0;
  const isUp      = change >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? '#22c55e' : '#ef4444';
  const trendBg    = isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
  const trendBorder = isUp ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';

  // Chart gradient colors
  const gradientId = `oi-grad-${symbol}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <AnimatedNumber value={value} formatter={fmtOI} className="text-sm font-black text-white num-large" />
        <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {fmtPct(changePct)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(10,14,26,0.85)',
        border: `1px solid ${trendBorder}`,
        boxShadow: `0 0 30px ${isUp ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'}`,
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Live pulse indicator */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
        <div className="relative flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/20 animate-ping" />
        </div>
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
      </div>

      {/* Top section */}
      <div className="px-5 pt-5 pb-4">
        {/* Label */}
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Interest · {symbol}</span>
        </div>

        {/* Big number */}
        <AnimatedNumber
          value={value}
          formatter={fmtOI}
          className="block text-4xl font-black tracking-tight num-large text-white"
        />

        {/* Change badge */}
        <div className="flex items-center gap-2 mt-2.5">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: trendBg, border: `1px solid ${trendBorder}` }}
          >
            <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
            <span className="text-[11px] font-bold" style={{ color: trendColor }}>
              {fmtPct(changePct)}
            </span>
          </div>
          <span className="text-[10px] text-slate-600">vs. prev tick</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-20 px-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={trendColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Tooltip content={<SparkTooltip />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={trendColor}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 3, fill: trendColor, stroke: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom meta row */}
      <div className="px-5 py-3 border-t border-[rgba(148,163,184,0.05)] flex items-center justify-between">
        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider">24h Range</p>
          <p className="text-[10px] font-bold text-slate-400">
            {fmtOI(Math.min(...history.map(h => h.v)))}
            <span className="text-slate-700 mx-1">—</span>
            {fmtOI(Math.max(...history.map(h => h.v)))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider">Updates</p>
          <p className="text-[10px] font-bold text-slate-400">每 1.5s</p>
        </div>
      </div>
    </div>
  );
}