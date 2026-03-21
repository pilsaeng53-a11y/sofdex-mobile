import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart2, TrendingUp, RefreshCw } from 'lucide-react';
import { useMarketData } from './MarketDataProvider';

const OI_API = 'https://solfort-api.onrender.com/open-interest';

// ─── Animated number flash ────────────────────────────────────────────────────
function FlashValue({ value, formatter, className }) {
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(value);
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value == null || value === prevRef.current) return;
    const dir = value > prevRef.current ? 'up' : 'down';
    setFlash(dir);
    setTimeout(() => setFlash(null), 500);

    // Smooth count animation
    const from = prevRef.current ?? value;
    const to = value;
    const startTime = performance.now();
    const duration = 450;
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(to);
    };
    rafRef.current = requestAnimationFrame(tick);
    prevRef.current = value;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const flashColor = flash === 'up' ? '#22c55e' : flash === 'down' ? '#ef4444' : null;

  return (
    <span
      className={`${className} transition-colors duration-300`}
      style={flashColor ? { color: flashColor, textShadow: `0 0 12px ${flashColor}60` } : undefined}
    >
      {formatter(display ?? value)}
    </span>
  );
}

// ─── Single stat cell ─────────────────────────────────────────────────────────
function StatCell({ label, icon: Icon, iconColor, value, sub, subColor, loading, flash }) {
  return (
    <div className="flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-1 mb-1.5">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: iconColor }} />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 truncate">{label}</span>
      </div>
      {loading ? (
        <div className="h-5 w-16 rounded-lg skeleton" />
      ) : (
        <div className="font-black text-white text-sm num-large truncate">{value}</div>
      )}
      {sub != null && !loading && (
        <div className="text-[10px] font-bold mt-0.5 flex items-center gap-0.5" style={{ color: subColor }}>
          {subColor === '#22c55e' ? <ArrowUpRight className="w-3 h-3" /> : subColor === '#ef4444' ? <ArrowDownRight className="w-3 h-3" /> : null}
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px self-stretch bg-[rgba(148,163,184,0.07)] mx-1 flex-shrink-0" />;
}

// ─── Formatting ───────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1000) return `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return `$${Number(v).toFixed(4)}`;
}
function fmtVolume(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}
function fmtOI(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}
function fmtFunding(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(4)}%`;
}
function fmtChange(v) {
  if (v == null || isNaN(v)) return null;
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TradingStatsBar({ symbol = 'BTC' }) {
  const { getLiveAsset } = useMarketData();

  // OI from Solfort API
  const [oiData, setOiData]   = useState(null);
  const [oiLoading, setOiLoading] = useState(true);

  useEffect(() => {
    const fetchOI = async () => {
      try {
        const res  = await fetch(OI_API);
        const json = await res.json();
        if (!json?.error) {
          // Handle array or object
          const item = Array.isArray(json)
            ? (json.find(i => i.symbol?.toUpperCase().includes(symbol.toUpperCase())) || json[0])
            : json;
          setOiData(item);
        }
      } catch (_) {}
      finally { setOiLoading(false); }
    };
    fetchOI();
    const id = setInterval(fetchOI, 2000);
    return () => clearInterval(id);
  }, [symbol]);

  // Mark Price + 24h Change + Volume from live market feed
  const asset = getLiveAsset(symbol);
  const price   = asset?.price ?? null;
  const change  = asset?.change ?? null;       // % change
  const volume  = asset?.volume ?? null;

  // Simulated funding rate (replace with real feed if available)
  const [funding, setFunding] = useState(() => (Math.random() * 0.04 - 0.01));
  useEffect(() => {
    const id = setInterval(() => {
      setFunding(f => Math.max(-0.1, Math.min(0.1, f + (Math.random() - 0.5) * 0.002)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // OI value extraction
  const oiValue   = oiData?.openInterest ?? oiData?.oi ?? oiData?.value ?? null;
  const oiChange  = oiData?.changePct ?? oiData?.changePercent ?? oiData?.change24hPct ?? null;

  const changeColor = change == null ? '#94a3b8' : change >= 0 ? '#22c55e' : '#ef4444';
  const fundingColor = funding >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(10,14,26,0.9)',
        border: '1px solid rgba(148,163,184,0.09)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #00d4aa30, #3b82f620, transparent)' }} />

      {/* Symbol + live dot header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[rgba(148,163,184,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center text-[9px] font-black text-[#00d4aa]">
            {symbol.slice(0, 2)}
          </div>
          <span className="text-xs font-black text-white">{symbol}/USDT</span>
          <span className="text-[9px] text-slate-600">Perpetual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-0 px-4 py-3.5">

        {/* Mark Price */}
        <StatCell
          label="Mark Price"
          icon={TrendingUp}
          iconColor="#00d4aa"
          value={asset.available && price ? fmtPrice(price) : '—'}
          sub={change != null ? fmtChange(change) : null}
          subColor={changeColor}
          loading={false}
        />

        <Divider />

        {/* 24h Change */}
        <StatCell
          label="24h Change"
          icon={change != null && change >= 0 ? ArrowUpRight : ArrowDownRight}
          iconColor={changeColor}
          value={change != null ? fmtChange(change) : '—'}
          sub={null}
          subColor={changeColor}
          loading={false}
        />

        <Divider />

        {/* 24h Volume */}
        <StatCell
          label="24h Volume"
          icon={BarChart2}
          iconColor="#3b82f6"
          value={volume != null ? fmtVolume(volume) : '—'}
          sub={null}
          subColor={null}
          loading={false}
        />

        <Divider />

        {/* Open Interest */}
        <StatCell
          label="Open Int."
          icon={Activity}
          iconColor="#8b5cf6"
          value={oiValue != null ? fmtOI(oiValue) : '—'}
          sub={oiChange != null ? fmtChange(oiChange) : null}
          subColor={oiChange != null ? (oiChange >= 0 ? '#22c55e' : '#ef4444') : null}
          loading={oiLoading}
        />

        <Divider />

        {/* Funding Rate */}
        <StatCell
          label="Funding"
          icon={Zap}
          iconColor={fundingColor}
          value={fmtFunding(funding)}
          sub="8h rate"
          subColor="#64748b"
          loading={false}
        />
      </div>
    </div>
  );
}