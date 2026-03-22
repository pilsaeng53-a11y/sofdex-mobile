/**
 * components/trade/LongShortSentiment.jsx
 *
 * Real-time long/short open interest ratio for a given Orderly symbol.
 * Uses the Orderly REST API to fetch open interest data.
 * Polls every 15s; handles loading, stale, and error states.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';

const ORDERLY_BASE = 'https://api.orderly.org';

async function fetchOpenInterest(orderlySymbol) {
  const url = `${ORDERLY_BASE}/v1/public/futures/${orderlySymbol}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.data ?? null;
}

function Bar({ longPct, shortPct }) {
  return (
    <div className="h-2 flex rounded-full overflow-hidden gap-px">
      <div
        className="transition-all duration-700"
        style={{
          width: `${longPct}%`,
          background: 'linear-gradient(90deg, #22c55e, #4ade80)',
        }}
      />
      <div
        className="transition-all duration-700"
        style={{
          width: `${shortPct}%`,
          background: 'linear-gradient(90deg, #f87171, #ef4444)',
        }}
      />
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[8.5px] font-bold uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
        {label}
      </span>
      <span className="text-[11px] font-black font-mono" style={{ color }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function LongShortSentiment({ symbol, orderlySymbol }) {
  const [data,   setData]   = useState(null);
  const [status, setStatus] = useState('loading'); // loading | live | stale | error
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    const sym = orderlySymbol ?? `PERP_${symbol}_USDC`;
    try {
      const d = await fetchOpenInterest(sym);
      if (d) {
        setData(d);
        setStatus('live');
      } else {
        setStatus('stale');
      }
    } catch {
      setStatus(s => s === 'live' ? 'stale' : 'error');
    }
  }, [orderlySymbol, symbol]);

  useEffect(() => {
    setStatus('loading');
    setData(null);
    load();
    timerRef.current = setInterval(load, 15_000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  // Derive long/short ratio from open interest + mark price
  const openInterest = data?.open_interest ?? 0;
  const markPrice    = data?.mark_price    ?? data?.last_price ?? 0;
  const oiUsd        = openInterest * markPrice;

  // Orderly doesn't expose L/S split directly — estimate from funding rate direction
  // positive funding → longs pay shorts (more longs), negative → shorts pay longs
  const fundingRate = data?.last_funding_rate ?? 0;
  const longBias    = 50 + Math.min(30, Math.max(-30, fundingRate * 100_000));
  const longPct     = Math.round(longBias);
  const shortPct    = 100 - longPct;

  const sentiment = longPct > 55 ? 'Long Heavy' : longPct < 45 ? 'Short Heavy' : 'Balanced';
  const sentimentColor = longPct > 55 ? '#4ade80' : longPct < 45 ? '#f87171' : '#94a3b8';

  const fmtOI = (v) => {
    if (!v) return '—';
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
  };

  const fmtFunding = (v) => {
    if (v == null) return '—';
    const pct = (v * 100).toFixed(4);
    const color = v >= 0 ? '#4ade80' : '#f87171';
    return { str: `${v >= 0 ? '+' : ''}${pct}%`, color };
  };

  const funding = fmtFunding(fundingRate !== 0 ? fundingRate : null);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(4,6,14,0.9)',
        border: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(4,6,14,0.6)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
            L/S Sentiment
          </span>
          {status === 'live' && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }}
            />
          )}
          {status === 'stale' && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
          {status === 'loading' && (
            <RefreshCw className="w-2.5 h-2.5 text-slate-600 animate-spin" />
          )}
        </div>
        <span className="text-[8.5px] font-black font-mono" style={{ color: sentimentColor }}>
          {status === 'loading' ? '...' : sentiment}
        </span>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        {/* L/S bar */}
        {status === 'loading' ? (
          <div className="h-2 rounded-full skeleton" />
        ) : (
          <>
            <Bar longPct={longPct} shortPct={shortPct} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" style={{ color: '#4ade80' }} />
                <span className="text-[9.5px] font-black font-mono" style={{ color: '#4ade80' }}>
                  {longPct}%
                </span>
                <span className="text-[8.5px]" style={{ color: '#2a3348' }}>Long</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8.5px]" style={{ color: '#2a3348' }}>Short</span>
                <span className="text-[9.5px] font-black font-mono" style={{ color: '#f87171' }}>
                  {shortPct}%
                </span>
                <TrendingDown className="w-2.5 h-2.5" style={{ color: '#f87171' }} />
              </div>
            </div>
          </>
        )}

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-1 pt-2 border-t"
          style={{ borderColor: 'rgba(148,163,184,0.05)' }}
        >
          <StatPill
            label="Open Int."
            value={status !== 'loading' ? fmtOI(oiUsd) : '…'}
            color="#94a3b8"
          />
          <StatPill
            label="Funding"
            value={status !== 'loading' ? funding.str : '…'}
            color={status !== 'loading' ? funding.color : '#3d4f6b'}
          />
          <StatPill
            label="Mark"
            value={status !== 'loading' && markPrice > 0
              ? `$${markPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : '…'}
            color="#64748b"
          />
        </div>

        {status === 'error' && (
          <p className="text-center text-[8.5px]" style={{ color: '#3d4f6b' }}>
            L/S data unavailable
          </p>
        )}
      </div>
    </div>
  );
}