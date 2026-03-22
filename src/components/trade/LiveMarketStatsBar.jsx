import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight, ArrowDownRight, WifiOff, RefreshCw,
  TrendingUp, TrendingDown, BarChart2, Zap, Activity, Tag
} from 'lucide-react';
// ⛔ MarketDataProvider (Binance/CoinGecko) intentionally NOT imported here.
// All prices come exclusively from the Orderly ticker via resolveTradingPrice.
import { useTicker } from '../../hooks/useOrderlyMarket';
import CoinIcon from '../shared/CoinIcon';
import { resolveTradingPrice, priceSourceLabel } from '../../lib/trading/resolveTradingPrice';

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100) return v.toFixed(2);
  if (v >= 1)   return v.toFixed(4);
  return v.toFixed(6);
}
function fmtVolume(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${Number(v).toLocaleString()}`;
}
function fmtOI(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}
function fmtChange(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
}
function fmtFunding(v) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(4)}%`;
}

// ─── Flash hook — returns 'up' | 'down' | null ────────────────────────────────
function useFlash(rawValue) {
  const [flash, setFlash] = useState(null);
  const prev = useRef(null);
  useEffect(() => {
    const n = parseFloat(rawValue);
    const p = parseFloat(prev.current);
    if (!isNaN(n) && !isNaN(p) && n !== p) {
      setFlash(n > p ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 600);
      prev.current = rawValue;
      return () => clearTimeout(t);
    }
    if (prev.current === null) prev.current = rawValue;
  }, [rawValue]);
  return flash;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = 16 }) {
  return (
    <div
      className="rounded-md animate-pulse"
      style={{ width: w, height: 15, background: 'rgba(148,163,184,0.08)' }}
    />
  );
}

// ─── Live dot / status ────────────────────────────────────────────────────────
function StatusBadge({ state }) {
  const configs = {
    live:         { color: '#4ade80', dot: true,  label: 'Live' },
    reconnecting: { color: '#fbbf24', spin: true,  label: 'Reconnecting' },
    offline:      { color: '#475569', icon: true,  label: 'Offline' },
  };
  const cfg = configs[state] || configs.live;
  return (
    <div className="flex items-center gap-1.5">
      {cfg.dot && (
        <div className="relative w-1.5 h-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
        </div>
      )}
      {cfg.spin && <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ color: cfg.color }} />}
      {cfg.icon && <WifiOff className="w-2.5 h-2.5" style={{ color: cfg.color }} />}
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Individual stat cell ─────────────────────────────────────────────────────
function Stat({ label, Icon, iconColor, rawValue, displayValue, valueColor, subLabel, subColor, loading }) {
  const flash = useFlash(rawValue);

  const textColor = flash === 'up'
    ? '#4ade80'
    : flash === 'down'
    ? '#f87171'
    : (valueColor || '#e2e8f0');

  const glow = flash === 'up'
    ? '0 0 12px rgba(74,222,128,0.45)'
    : flash === 'down'
    ? '0 0 12px rgba(248,113,113,0.45)'
    : 'none';

  return (
    <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
      {/* Label */}
      <div className="flex items-center gap-1">
        <Icon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: iconColor }} />
        <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: '#3d4f6b' }}>
          {label}
        </span>
      </div>

      {/* Primary value */}
      {loading ? (
        <Skel w={52} />
      ) : (
        <span
          className="font-mono font-black leading-none transition-all duration-300"
          style={{
            fontSize: 13,
            color: textColor,
            textShadow: glow,
            letterSpacing: '-0.02em',
          }}
        >
          {displayValue}
        </span>
      )}

      {/* Sub label */}
      {subLabel && !loading && (
        <span className="font-mono text-[9px] font-semibold leading-none" style={{ color: subColor || '#475569' }}>
          {subLabel}
        </span>
      )}
    </div>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return (
    <div
      className="self-stretch flex-shrink-0"
      style={{ width: 1, background: 'rgba(148,163,184,0.06)', margin: '0 14px' }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LiveMarketStatsBar({ symbol = 'BTC' }) {
  // Orderly ticker — sole price source. No Binance/CoinGecko fallback allowed.
  const { ticker, loading: tickerLoading } = useTicker(symbol);

  // Resolve canonical trading price (mark → last → index)
  const { price, source: priceSource } = resolveTradingPrice(ticker);
  const resolvedPrice = price > 0 ? price : null;

  const lastPrice  = ticker?.lastPrice    ?? null;
  const change     = ticker?.change24h    ?? null;
  const volume     = ticker?.amount24h    ?? ticker?.volume24h ?? null;
  const high24h    = ticker?.high24h      ?? null;
  const low24h     = ticker?.low24h       ?? null;
  const oiValue    = ticker?.openInterest ?? null;
  const fundingRaw = ticker?.fundingRate  ?? null;
  const funding    = fundingRaw != null ? fundingRaw * 100 : null;

  // Debug log — remove after verification
  console.log('[LiveMarketStatsBar]', { symbol, priceSource, resolvedPrice, tickerLoaded: !!ticker });

  const status  = tickerLoading ? 'reconnecting' : ticker ? 'live' : 'offline';
  const loading = tickerLoading && resolvedPrice == null;

  const changeColor  = change == null ? '#94a3b8' : change >= 0 ? '#4ade80' : '#f87171';
  const fundingColor = funding == null ? '#94a3b8' : funding >= 0 ? '#4ade80' : '#f87171';
  const debugLabel   = priceSourceLabel(priceSource);

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: 'linear-gradient(160deg, rgba(10,14,26,0.98) 0%, rgba(6,9,18,0.99) 100%)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Top gradient accent line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, #00d4aa35 0%, #3b82f625 40%, #8b5cf615 70%, transparent 100%)' }}
      />

      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.055)' }}
      >
        <div className="flex items-center gap-2.5">
          <CoinIcon symbol={symbol} size={22} />
          {/* Symbol badge */}
          <div
            className="h-6 px-2 rounded-lg flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: 'rgba(0,212,170,0.08)',
              border: '1px solid rgba(0,212,170,0.14)',
            }}
          >
            <span className="text-[10px] font-black text-[#00d4aa] tracking-tight">{symbol}</span>
            <span className="text-[8px] text-slate-600">/USDT</span>
          </div>
          <span
            className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.14)' }}
          >
            Perp
          </span>
        </div>
        <StatusBadge state={status} />
      </div>

      {/* Stats row — horizontally scrollable on mobile */}
      <div
        className="flex items-stretch overflow-x-auto scrollbar-none px-4 py-3.5"
        style={{ gap: 0 }}
      >
        <Stat
          label="Mark Price"
          Icon={TrendingUp}
          iconColor="#00d4aa"
          rawValue={price}
          displayValue={price != null ? `$${fmtPrice(price)}` : '—'}
          subLabel={change != null ? fmtChange(change) : null}
          subColor={changeColor}
          loading={loading}
        />
        <Sep />
        <Stat
          label="Last Price"
          Icon={Tag}
          iconColor="#3b82f6"
          rawValue={lastPrice}
          displayValue={lastPrice != null ? `$${fmtPrice(lastPrice)}` : price != null ? `$${fmtPrice(price)}` : '—'}
          loading={loading}
        />
        <Sep />
        <Stat
          label="24h Change"
          Icon={change != null && change >= 0 ? ArrowUpRight : ArrowDownRight}
          iconColor={changeColor}
          rawValue={change}
          displayValue={fmtChange(change)}
          valueColor={changeColor}
          loading={loading}
        />
        <Sep />
        <Stat
          label="24h Volume"
          Icon={BarChart2}
          iconColor="#8b5cf6"
          rawValue={volume}
          displayValue={volume != null ? fmtVolume(volume) : '—'}
          loading={loading}
        />
        <Sep />
        <Stat
          label="24h High"
          Icon={TrendingUp}
          iconColor="#4ade80"
          rawValue={high24h}
          displayValue={high24h != null ? `$${fmtPrice(high24h)}` : '—'}
          valueColor="#4ade80"
          loading={loading}
        />
        <Sep />
        <Stat
          label="24h Low"
          Icon={TrendingDown}
          iconColor="#f87171"
          rawValue={low24h}
          displayValue={low24h != null ? `$${fmtPrice(low24h)}` : '—'}
          valueColor="#f87171"
          loading={loading}
        />
        <Sep />
        <Stat
          label="Funding 8h"
          Icon={Zap}
          iconColor={fundingColor}
          rawValue={funding}
          displayValue={funding != null ? fmtFunding(funding) : '—'}
          valueColor={fundingColor}
          subLabel={funding != null ? (funding >= 0 ? 'Longs pay' : 'Shorts pay') : null}
          subColor="#3d4f6b"
          loading={loading}
        />
        <Sep />
        <Stat
          label="Open Int."
          Icon={Activity}
          iconColor="#f59e0b"
          rawValue={oiValue}
          displayValue={oiValue != null ? fmtOI(oiValue) : '—'}
          loading={loading}
        />
      </div>
    </div>
  );
}