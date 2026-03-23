/**
 * TradingStatusBar — pre-database operational status row.
 * Shows API, WebSocket, quote, and selected symbol health.
 */
import React from 'react';

function Dot({ status }) {
  const colors = {
    ok:          'bg-emerald-400',
    warn:        'bg-amber-400 animate-pulse',
    error:       'bg-red-400',
    connecting:  'bg-amber-400 animate-pulse',
    connected:   'bg-emerald-400',
    disconnected:'bg-red-400',
  };
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors[status] ?? 'bg-slate-600'}`} />;
}

function StatusItem({ label, status, value }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <Dot status={status} />
      <span className="text-[9px] text-slate-500">{label}</span>
      {value && <span className="text-[9px] font-mono text-slate-400">{value}</span>}
    </div>
  );
}

export default function TradingStatusBar({ wsStatus, hasQuote, symbol, price, priceSource = 'live' }) {
  const ws  = wsStatus ?? 'disconnected';
  const api = hasQuote ? 'ok' : ws === 'connected' ? 'warn' : 'error';

  return (
    <div className="flex items-center gap-4 px-3 py-1 border-b overflow-x-auto scrollbar-none flex-shrink-0"
      style={{ background: '#080b14', borderColor: 'rgba(148,163,184,0.05)' }}>
      <StatusItem label="WebSocket" status={ws} />
      <StatusItem label="Quotes" status={api} />
      <StatusItem label="Price" status={price ? 'ok' : 'warn'} value={price ? `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '—'} />
      <StatusItem label="Symbol" status="ok" value={symbol} />
      <div className="ml-auto flex-shrink-0">
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
          style={{ background: 'rgba(0,212,170,0.07)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}>
          {priceSource}
        </span>
      </div>
    </div>
  );
}