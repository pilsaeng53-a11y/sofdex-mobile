/**
 * CryptoMarketTimer — live countdown + status badge for a short-term market.
 * Status transitions: open → closing_soon (< 60s) → locked (< 20s) → resolved
 */
import React, { useState, useEffect } from 'react';
import { LOCK_SECONDS } from './cryptoShortData';

export function useMarketStatus(resolvesAt) {
  const [secsLeft, setSecsLeft] = useState(() => resolvesAt - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const iv = setInterval(() => {
      setSecsLeft(resolvesAt - Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [resolvesAt]);

  let status = 'open';
  if (secsLeft <= 0)             status = 'resolved';
  else if (secsLeft <= LOCK_SECONDS) status = 'locked';
  else if (secsLeft <= 60)       status = 'closing_soon';

  return { secsLeft: Math.max(secsLeft, 0), status };
}

function fmt(secs) {
  if (secs <= 0) return '00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

const STATUS_CONFIG = {
  open:         { label: 'OPEN',         bg: 'rgba(34,197,94,0.12)',  text: '#22c55e',  border: 'rgba(34,197,94,0.25)',  dot: 'bg-emerald-400' },
  closing_soon: { label: 'CLOSING SOON', bg: 'rgba(251,191,36,0.12)', text: '#fbbf24',  border: 'rgba(251,191,36,0.3)',  dot: 'bg-amber-400 animate-pulse' },
  locked:       { label: 'LOCKED',       bg: 'rgba(239,68,68,0.12)',  text: '#f87171',  border: 'rgba(239,68,68,0.3)',   dot: 'bg-red-400 animate-pulse' },
  resolved:     { label: 'RESOLVED',     bg: 'rgba(148,163,184,0.08)',text: '#64748b',  border: 'rgba(148,163,184,0.12)', dot: 'bg-slate-500' },
};

export function StatusBadge({ status, small = false }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1 font-black rounded-lg border ${small ? 'text-[7px] px-1.5 py-0.5' : 'text-[8px] px-2 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function CryptoMarketTimer({ resolvesAt, status, secsLeft, compact = false }) {
  const urgent = status === 'locked' || status === 'closing_soon';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={status} small />
        {status !== 'resolved' && (
          <span className={`text-[9px] font-black font-mono ${urgent ? 'text-red-400' : 'text-slate-400'}`}>
            {fmt(secsLeft)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <StatusBadge status={status} />
      {status !== 'resolved' && (
        <span className={`text-[11px] font-black font-mono ${
          status === 'locked'       ? 'text-red-400' :
          status === 'closing_soon' ? 'text-amber-400' :
          'text-slate-400'
        }`}>
          {fmt(secsLeft)}
        </span>
      )}
    </div>
  );
}