/**
 * CryptoShortMarkets — SolFort custom short-duration crypto prediction markets.
 * Fetches backend data from /prediction/markets?source=solfort&category=crypto
 * Enforces lock rule: betting disabled 20s before resolution.
 */
import React, { useState, useMemo } from 'react';
import { Zap, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useMarkets } from './usePredictionAPI';
import CryptoMarketTimer, { useMarketStatus, StatusBadge } from './CryptoMarketTimer';

const SEGMENT_MAP = {
  ultra:  { label: '⚡ Ultra Short', minDuration: 0,      maxDuration: 300 },
  hourly: { label: '🕐 Hourly',      minDuration: 900,    maxDuration: 3600 },
  four:   { label: '🕰️ 4-Hour',      minDuration: 3600,   maxDuration: 14400 },
  daily:  { label: '📅 Daily',       minDuration: 14400,  maxDuration: 86400 },
};

const ASSETS   = ['USDT', 'SOL', 'ETH'];
const BALANCES = { USDT: 10000, SOL: 24.5, ETH: 3.2 };
const PRESETS  = [10, 50, 100, 500];

// ─── Single market row with live timer ────────────────────────────────────
function CryptoMarketRow({ market, participated, onBet, locked }) {
  const { secsLeft, status } = useMarketStatus(market.endDate || market.resolvesAt);
  // Use reactive secsLeft (not a static Date.now() snapshot) for lock detection
  const isLocked = locked || status === 'locked' || status === 'resolved' || secsLeft <= 20;
  const urgent   = status === 'closing_soon' || secsLeft <= 60;

  const maxPayout = (1 / Math.max(...market.outcomes.map(o => o.prob), 0.001)).toFixed(2);
  const symbol = market.question.match(/([A-Z]{2,})/)?.[1] || '??';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b transition-all ${isLocked || locked ? 'opacity-60' : 'hover:bg-[#111827]/60 cursor-pointer'} ${urgent ? 'bg-amber-500/03' : ''}`}
      style={{ borderColor: 'rgba(148,163,184,0.05)', borderLeft: urgent ? `2px solid ${isLocked ? '#ef4444' : '#fbbf24'}` : '2px solid transparent' }}
      onClick={() => !isLocked && !locked && onBet(market, status)}>

      {/* Symbol badge */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] flex-shrink-0"
        style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.15)', color: '#00d4aa' }}>
        {symbol}
      </div>

      {/* Question + outcomes */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white leading-snug truncate mb-1">{market.question}</p>
        <div className="flex items-center gap-2">
          {market.outcomes.map(o => (
            <span key={o.id} className="text-[8px] font-bold font-mono"
              style={{ color: o.prob >= 0.5 ? '#22c55e' : '#ef4444' }}>
              {o.label} {(1/Math.max(o.prob,0.001)).toFixed(2)}x
            </span>
          ))}
          <span className="text-[8px] text-slate-600 font-mono">${(market.volume/1000).toFixed(0)}K vol</span>
        </div>
      </div>

      {/* Timer + status */}
      <div className="flex-shrink-0 text-right">
        <CryptoMarketTimer resolvesAt={market.endDate || market.resolvesAt} status={status} secsLeft={secsLeft} compact />
        {participated && (
          <span className="text-[7px] font-black text-[#00d4aa] block mt-0.5">✓ IN</span>
        )}
        {(isLocked || locked) && !participated && (
          <span className="text-[7px] font-black text-red-400 flex items-center gap-0.5 justify-end mt-0.5">
            <Lock className="w-2.5 h-2.5" />Locked
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Betting sheet ─────────────────────────────────────────────────────────
function CryptoBettingSheet({ market, existingBet, onClose, onPlace }) {
  const [selected, setSelected] = useState(existingBet?.outcomeId ?? null);
  const [amount,   setAmount]   = useState('50');
  const [asset,    setAsset]    = useState('USDT');

  // Use reactive hook — not a static Date.now() snapshot
  const { secsLeft, status } = useMarketStatus(market.endDate || market.resolvesAt);
  const locked = status === 'locked' || status === 'resolved' || secsLeft <= 20;
  const blocked = existingBet && existingBet.outcomeId !== selected;
  const outcome = market.outcomes.find(o => o.id === selected);
  const amt     = parseFloat(amount) || 0;
  const payout  = outcome ? 1 / Math.max(outcome.prob, 0.001) : 0;
  const profit  = amt * payout - amt;

  const handlePlace = () => {
    if (!outcome || locked || blocked || !amt) return;
    onPlace({ marketId: market.id, outcomeId: selected, outcomeLabel: outcome.label, side: outcome.label, amount: amt, asset, payout, question: market.question, source: market.source });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-t-3xl pb-8 fade-in overflow-y-auto max-h-[92vh]"
        style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.1)', borderBottom: 'none' }}>

        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-8 h-1 rounded-full bg-slate-700" /></div>

        <div className="px-5 pt-2 pb-4 border-b border-[rgba(148,163,184,0.06)] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-[8px] px-1.5 py-0.5 rounded border"
                  style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.2)' }}>SolFort</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm font-bold text-white leading-snug">{market.question}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1a2340] flex items-center justify-center text-slate-400 text-xs ml-3 flex-shrink-0">✕</button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Lock rule notice */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[10px]"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a78bfa' }}>
            <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">Betting closes 20 seconds before resolution</span>
          </div>

          {/* Locked warning */}
          {locked && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <Lock className="w-3.5 h-3.5" />
              Betting locked. Market resolves in {secsLeft}s.
            </div>
          )}

          {/* Live countdown */}
          {!locked && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border"
              style={{ background: secsLeft <= 60 ? 'rgba(251,191,36,0.06)' : 'rgba(26,35,64,0.4)', borderColor: secsLeft <= 60 ? 'rgba(251,191,36,0.2)' : 'rgba(148,163,184,0.07)' }}>
              <span className="text-[10px] text-slate-400">Locks in</span>
              <span className={`text-base font-black font-mono ${secsLeft <= 20 ? 'text-red-400' : secsLeft <= 60 ? 'text-amber-400' : 'text-white'}`}>
                {String(Math.floor(secsLeft/60)).padStart(2,'0')}:{String(Math.floor(secsLeft%60)).padStart(2,'0')}
              </span>
            </div>
          )}

          {/* Outcomes */}
          <div className={`grid gap-2 ${market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {market.outcomes.map(o => {
              const isUp    = o.prob >= 0.5;
              const clr     = isUp ? '#22c55e' : '#ef4444';
              const glw     = isUp ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
              const isSel   = selected === o.id;
              const isBlk   = !!(existingBet && existingBet.outcomeId !== o.id);
              return (
                <button key={o.id}
                  onClick={() => !isBlk && !locked && setSelected(o.id)}
                  disabled={isBlk || locked}
                  className="py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={isSel ? { background: `${clr}12`, border: `1px solid ${clr}40`, boxShadow: `0 0 16px ${glw}` }
                    : { background: 'rgba(26,35,64,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={isSel ? { color: clr } : { color: '#94a3b8' }}>{o.label}</span>
                    <span className="text-[10px] font-black font-mono" style={isSel ? { color: clr } : { color: '#64748b' }}>
                      {(1/Math.max(o.prob,0.001)).toFixed(2)}x
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round(o.prob*100)}%`, background: clr }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Asset */}
          <div className="flex gap-2">
            {ASSETS.map(a => (
              <button key={a} onClick={() => setAsset(a)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${asset===a ? 'bg-[#00d4aa]/12 text-[#00d4aa] border border-[#00d4aa]/25' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.07)]'}`}>
                {a}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} disabled={locked}
              className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00d4aa]/40 mb-2 disabled:opacity-50" />
            <div className="flex gap-1.5">
              {PRESETS.map(p => (
                <button key={p} onClick={() => setAmount(String(p))} disabled={locked}
                  className={`flex-1 py-1 rounded text-[9px] font-bold transition-all disabled:opacity-30 ${Number(amount)===p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>{p}</button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {outcome && amt > 0 && (
            <div className="rounded-xl p-3 space-y-1.5 border border-[rgba(148,163,184,0.06)]"
              style={{ background: 'rgba(26,35,64,0.4)' }}>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Payout</span>
                <span className="font-mono font-black text-[#00d4aa]">{payout.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-[10px] border-t border-[rgba(148,163,184,0.06)] pt-1.5">
                <span className="text-slate-300 font-bold">If correct</span>
                <span className="font-mono text-emerald-400 font-black">+{profit.toFixed(2)} {asset}</span>
              </div>
            </div>
          )}

          <button onClick={handlePlace}
            disabled={!outcome || locked || blocked || !amt}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: locked ? '#1e293b' : 'linear-gradient(135deg, #00d4aa, #06b6d4)', color: locked ? '#64748b' : '#fff', boxShadow: locked ? 'none' : '0 4px 24px rgba(0,212,170,0.25)' }}>
            {locked ? '🔒 Betting Locked' : !outcome ? 'Select outcome' : `Bet ${outcome.label} · ${amt} ${asset}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function CryptoShortMarkets({ participatedIds = new Set(), onPlaceBet }) {
  const [activeSeg, setActiveSeg] = useState('ultra');
  const [activeSheet, setActiveSheet] = useState(null); // { market, status, secsLeft }

  // Fetch SolFort custom crypto markets from backend
  const { markets: allBackendMarkets, loading, error } = useMarkets({
    category: 'crypto',
    source: 'solfort',
    limit: 100
  });

  // Filter by active timeframe segment; also match backend timeframe field
  const segMarkets = useMemo(() => {
    const seg = SEGMENT_MAP[activeSeg];
    if (!seg || !allBackendMarkets.length) return [];

    // Timeframe keyword mapping for SolFort backend
    const TF_MAP = { ultra: ['5m','15m'], hourly: ['1h'], four: ['4h'], daily: ['1d'] };
    const tfKeys = TF_MAP[activeSeg] ?? [];

    return allBackendMarkets.filter(m => {
      // Match by explicit timeframe field if available
      if (m.timeframe && tfKeys.length) return tfKeys.includes(m.timeframe);
      // Fallback: filter by time remaining
      if (!m.endDate) return false;
      const now = Date.now();
      const endMs = new Date(m.endDate).getTime();
      const durationSecs = (endMs - now) / 1000;
      return durationSecs >= seg.minDuration && durationSecs <= seg.maxDuration;
    });
  }, [allBackendMarkets, activeSeg]);

  return (
    <div>
      {/* Segment tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-3">
        {Object.entries(SEGMENT_MAP).map(([segId, segCfg]) => (
          <button key={segId} onClick={() => setActiveSeg(segId)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${activeSeg === segId
              ? 'bg-[#00d4aa]/12 text-[#00d4aa] border-[#00d4aa]/25'
              : 'bg-[#1a2340] text-slate-500 border-[rgba(148,163,184,0.07)] hover:text-slate-300'}`}>
            <span>{segCfg.label}</span>
            {segCfg.maxDuration <= 900 && <span className="text-[7px] font-black px-1 py-0.5 rounded"
              style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>FAST</span>}
          </button>
        ))}
      </div>

      {/* Header info */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-black text-white">
            {SEGMENT_MAP[activeSeg]?.label || 'Crypto'} Markets
          </span>
        </div>
        <span className="text-[9px] text-slate-600">{segMarkets.length} markets</span>
      </div>

      {/* Loading state */}
      {loading && !allBackendMarkets.length && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          <span className="text-[11px] text-slate-500">Loading SolFort markets...</span>
        </div>
      )}

      {/* Market list */}
      {!loading && segMarkets.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.07)]">
          {segMarkets.map(m => (
            <CryptoMarketRow key={m.id} market={m}
              participated={participatedIds.has(m.id)}
              locked={false}
              onBet={(market) => setActiveSheet({ market })} />
          ))}
        </div>
      )}

      {/* No markets for this segment */}
      {!loading && !error && allBackendMarkets.length > 0 && segMarkets.length === 0 && (
        <div className="text-center py-10 text-slate-600 text-[11px]">
          <Zap className="w-6 h-6 mx-auto mb-2 text-slate-700" />
          No active markets for this timeframe
        </div>
      )}

      {/* Empty from backend */}
      {!loading && !error && allBackendMarkets.length === 0 && (
        <div className="text-center py-10 text-slate-600 text-[11px]">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-700" />
          No SolFort crypto markets available right now
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px]" 
          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
          <AlertCircle className="w-3.5 h-3.5" />
          Failed to load crypto markets
        </div>
      )}

      {/* Betting sheet */}
      {activeSheet && (
        <CryptoBettingSheet
          market={activeSheet.market}
          existingBet={[...participatedIds].includes(activeSheet.market.id) ? { outcomeId: null } : null}
          onClose={() => setActiveSheet(null)}
          onPlace={(bet) => {
            onPlaceBet?.(bet);
            setActiveSheet(null);
          }}
        />
      )}
    </div>
  );
}