import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = 'https://solfort-api.onrender.com/open-interest';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNumber(v) {
  if (v == null || isNaN(v)) return '—';
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(3)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  return `$${Number(v).toLocaleString('en-US')}`;
}

function fmtChange(v) {
  if (v == null || isNaN(v)) return null;
  const sign = v >= 0 ? '+' : '';
  return `${sign}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return null;
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
}

// ─── Animated number (count up/down + flash) ─────────────────────────────────
function AnimatedValue({ value, formatter, className, flashColor }) {
  const [display, setDisplay] = useState(value);
  const [flashing, setFlashing] = useState(false);
  const prevRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value == null || value === prevRef.current) return;

    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), 500);

    const from = prevRef.current ?? value;
    const to = value;
    const duration = 500;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(to);
    };
    rafRef.current = requestAnimationFrame(tick);
    prevRef.current = value;

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span
      className={`${className} transition-all duration-300`}
      style={{
        color: flashing ? flashColor : undefined,
        textShadow: flashing ? `0 0 18px ${flashColor}80` : 'none',
      }}
    >
      {formatter(display)}
    </span>
  );
}

// ─── Single OI Row card ───────────────────────────────────────────────────────
function OICard({ item, index }) {
  const change = item.change ?? item.change24h ?? item.openInterestChange ?? null;
  const changePct = item.changePct ?? item.changePercent ?? item.change24hPct ?? null;
  const oi = item.openInterest ?? item.oi ?? item.value ?? null;
  const symbol = item.symbol ?? item.asset ?? item.pair ?? `Asset ${index + 1}`;

  const isUp = change != null ? change >= 0 : changePct != null ? changePct >= 0 : null;
  const upColor = '#22c55e';
  const downColor = '#ef4444';
  const trendColor = isUp === true ? upColor : isUp === false ? downColor : '#94a3b8';
  const ArrowIcon = isUp === true ? ArrowUpRight : isUp === false ? ArrowDownRight : null;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(10,14,26,0.85)',
        border: `1px solid ${isUp === true ? 'rgba(34,197,94,0.18)' : isUp === false ? 'rgba(239,68,68,0.18)' : 'rgba(148,163,184,0.1)'}`,
        boxShadow: isUp === true
          ? '0 0 24px rgba(34,197,94,0.05)'
          : isUp === false
          ? '0 0 24px rgba(239,68,68,0.05)'
          : 'none',
      }}
    >
      {/* Top accent bar */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${trendColor}70, transparent)` }} />

      <div className="p-4">
        {/* Symbol row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black"
              style={{ background: 'rgba(148,163,184,0.07)', color: '#94a3b8' }}>
              {String(symbol).slice(0, 3)}
            </div>
            <span className="text-sm font-bold text-white">{symbol}</span>
          </div>
          {/* Live dot */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* OI label */}
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          Open Interest
        </p>

        {/* Big OI number */}
        {oi != null ? (
          <AnimatedValue
            value={oi}
            formatter={fmtNumber}
            className="block text-3xl font-black tracking-tight text-white"
            flashColor={trendColor}
          />
        ) : (
          <span className="block text-3xl font-black text-slate-700">—</span>
        )}

        {/* Change row */}
        <div className="flex items-center gap-2 mt-2.5">
          {(change != null || changePct != null) && (
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
              style={{
                background: isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isUp ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {ArrowIcon && <ArrowIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />}
              <span className="text-[11px] font-bold" style={{ color: trendColor }}>
                {changePct != null ? fmtPct(changePct) : fmtChange(change)}
              </span>
            </div>
          )}
          <span className="text-[10px] text-slate-600">24h change</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────
export default function LiveOpenInterest({ compact = false }) {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
      setData(json);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, []);

  // Normalise: API may return array or single object
  const items = Array.isArray(data) ? data : data ? [data] : [];

  // ── Loading state
  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-3"
        style={{ background: 'rgba(10,14,26,0.85)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <div className="w-5 h-5 border-2 border-slate-700 border-t-[#00d4aa] rounded-full animate-spin flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-slate-400">Open Interest</p>
          <p className="text-[10px] text-slate-600">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  // ── Error state
  if (error && items.length === 0) {
    return (
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(10,14,26,0.85)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-red-400">Open Interest feed unavailable</p>
          <p className="text-[10px] text-slate-600 truncate">{error}</p>
        </div>
        <button onClick={fetchData}
          className="w-7 h-7 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] flex items-center justify-center hover:border-[#00d4aa]/20 transition-all flex-shrink-0">
          <RefreshCw className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    );
  }

  // ── Data: single object with direct fields (not an array)
  if (items.length === 0 && data) {
    return <OICard item={data} index={0} />;
  }

  // ── Array of items
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <OICard key={item.symbol ?? item.id ?? i} item={item} index={i} />
      ))}
      {lastUpdate && (
        <p className="text-[9px] text-slate-700 text-right pr-1">
          Updated {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}