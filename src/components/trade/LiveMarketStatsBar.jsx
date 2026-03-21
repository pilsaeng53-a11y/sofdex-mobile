import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Wifi, WifiOff, RefreshCw, TrendingUp, BarChart2, Zap, Activity, DollarSign } from 'lucide-react';
import { useMarketData } from '../shared/MarketDataProvider';

const OI_API = 'https://solfort-api.onrender.com/open-interest';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100)   return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  return v.toFixed(6);
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
function fmtChange(v) {
  if (v == null || isNaN(v)) return null;
  const s = v >= 0 ? '+' : '';
  return `${s}${Number(v).toFixed(2)}%`;
}
function fmtFunding(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(4)}%`;
}

// ─── Animated flash value ─────────────────────────────────────────────────────
function AnimatedValue({ value, style, className }) {
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null
  const prev = useRef(value);

  useEffect(() => {
    const curr = parseFloat(value);
    const p = parseFloat(prev.current);
    if (!isNaN(curr) && !isNaN(p) && curr !== p) {
      setFlash(curr > p ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 500);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const flashStyle = flash === 'up'
    ? { color: '#4ade80', textShadow: '0 0 10px rgba(74,222,128,0.5)' }
    : flash === 'down'
    ? { color: '#f87171', textShadow: '0 0 10px rgba(248,113,113,0.5)' }
    : null;

  return (
    <span className={`transition-colors duration-300 ${className}`} style={flashStyle || style}>
      {value}
    </span>
  );
}

// ─── Skeleton pill ────────────────────────────────────────────────────────────
function Skeleton({ w = 'w-14' }) {
  return <div className={`h-4 ${w} rounded animate-pulse bg-slate-800`} />;
}

// ─── Status indicator ─────────────────────────────────────────────────────────
function LiveDot({ state }) {
  if (state === 'live')
    return (
      <div className="relative">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
      </div>
    );
  if (state === 'reconnecting')
    return <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />;
  return <WifiOff className="w-3 h-3 text-slate-600" />;
}

// ─── Stat block ───────────────────────────────────────────────────────────────
function StatBlock({ label, icon: IconEl, iconColor, primary, primaryStyle, secondary, secondaryColor, loading }) {
  const Icon = IconEl;
  return (
    <div className="flex flex-col gap-0.5 min-w-0 flex-shrink-0">
      <div className="flex items-center gap-1">
        <Icon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: iconColor }} />
        <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap">{label}</span>
      </div>
      {loading ? <Skeleton /> : (
        <AnimatedValue
          value={primary}
          className="font-mono text-[12px] font-black leading-tight truncate"
          style={{ color: '#e2e8f0' }}
        />
      )}
      {secondary != null && !loading && (
        <span className="font-mono text-[9px] font-semibold leading-tight" style={{ color: secondaryColor }}>
          {secondary}
        </span>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px self-stretch bg-[rgba(148,163,184,0.07)] flex-shrink-0" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LiveMarketStatsBar({ symbol = 'BTC' }) {
  const { getLiveAsset } = useMarketData();
  const asset = getLiveAsset(symbol);

  const [status, setStatus] = useState('live');
  const [oiValue, setOiValue] = useState(null);
  const [oiLoading, setOiLoading] = useState(true);

  // Funding rate simulation — update every 2s with tiny drift
  const [funding, setFunding] = useState(0.0043);
  useEffect(() => {
    const id = setInterval(() => {
      setFunding(f => parseFloat((f + (Math.random() - 0.5) * 0.0008).toFixed(4)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // OI from Solfort API
  useEffect(() => {
    let dead = false;
    let failCount = 0;
    const fetch_ = async () => {
      try {
        const res  = await fetch(OI_API);
        const json = await res.json();
        if (!dead && !json?.error) {
          const item = Array.isArray(json)
            ? (json.find(i => i.symbol?.toUpperCase().includes(symbol.toUpperCase())) || json[0])
            : json;
          const v = item?.openInterest ?? item?.oi ?? item?.value ?? null;
          setOiValue(v);
          setOiLoading(false);
          failCount = 0;
          setStatus('live');
        }
      } catch {
        failCount++;
        if (!dead) setStatus(failCount >= 3 ? 'offline' : 'reconnecting');
      }
    };
    fetch_();
    const id = setInterval(fetch_, 2000);
    return () => { dead = true; clearInterval(id); };
  }, [symbol]);

  const price   = asset?.price  ?? null;
  const change  = asset?.change ?? null;
  const volume  = asset?.volume ?? null;
  // Last price is mark price with tiny simulated spread
  const lastPrice = price != null ? price * (1 - 0.00008) : null;

  const changeColor  = change == null ? '#94a3b8' : change >= 0 ? '#4ade80' : '#f87171';
  const fundingColor = funding >= 0 ? '#4ade80' : '#f87171';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,11,20,0.97)',
        border: '1px solid rgba(148,163,184,0.09)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top accent */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(0,212,170,0.3), rgba(59,130,246,0.2), transparent)' }} />

      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 pt-2.5 pb-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(5,7,13,0.7)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            {symbol.slice(0, 2)}
          </div>
          <span className="text-xs font-black text-white">{symbol}/USDT</span>
          <span
            className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(153,69,255,0.1)', color: '#a78bfa', border: '1px solid rgba(153,69,255,0.15)' }}
          >
            PERP
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <LiveDot state={status} />
          <span
            className="text-[8.5px] font-bold uppercase tracking-widest"
            style={{ color: status === 'live' ? '#4ade80' : status === 'reconnecting' ? '#fbbf24' : '#64748b' }}
          >
            {status === 'live' ? 'Live' : status === 'reconnecting' ? 'Reconnecting' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats grid — scrollable on mobile */}
      <div className="flex items-start gap-0 overflow-x-auto scrollbar-none px-4 py-3">
        {/* Mark Price */}
        <div className="flex items-start gap-4 flex-shrink-0">
          <StatBlock
            label="Mark Price"
            icon={TrendingUp}
            iconColor="#00d4aa"
            primary={price != null ? `$${fmtPrice(price)}` : '—'}
            secondary={change != null ? fmtChange(change) : null}
            secondaryColor={changeColor}
            loading={!asset.available}
          />
        </div>

        <div className="mx-3.5"><Sep /></div>

        {/* Last Price */}
        <div className="flex-shrink-0">
          <StatBlock
            label="Last Price"
            icon={DollarSign}
            iconColor="#3b82f6"
            primary={lastPrice != null ? `$${fmtPrice(lastPrice)}` : '—'}
            loading={!asset.available}
          />
        </div>

        <div className="mx-3.5"><Sep /></div>

        {/* 24h Change */}
        <div className="flex-shrink-0">
          <StatBlock
            label="24h Change"
            icon={change != null && change >= 0 ? ArrowUpRight : ArrowDownRight}
            iconColor={changeColor}
            primary={change != null ? fmtChange(change) : '—'}
            primaryStyle={{ color: changeColor }}
            loading={!asset.available}
          />
        </div>

        <div className="mx-3.5"><Sep /></div>

        {/* 24h Volume */}
        <div className="flex-shrink-0">
          <StatBlock
            label="24h Volume"
            icon={BarChart2}
            iconColor="#8b5cf6"
            primary={volume != null ? fmtVolume(volume) : '—'}
            loading={!asset.available}
          />
        </div>

        <div className="mx-3.5"><Sep /></div>

        {/* Funding Rate */}
        <div className="flex-shrink-0">
          <StatBlock
            label="Funding 8h"
            icon={Zap}
            iconColor={fundingColor}
            primary={fmtFunding(funding)}
            primaryStyle={{ color: fundingColor }}
            secondary={funding >= 0 ? 'Longs pay' : 'Shorts pay'}
            secondaryColor="#64748b"
            loading={false}
          />
        </div>

        <div className="mx-3.5"><Sep /></div>

        {/* Open Interest */}
        <div className="flex-shrink-0">
          <StatBlock
            label="Open Int."
            icon={Activity}
            iconColor="#f59e0b"
            primary={oiValue != null ? fmtOI(oiValue) : '—'}
            loading={oiLoading}
          />
        </div>
      </div>
    </div>
  );
}