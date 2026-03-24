/**
 * usePredictionAPI — Live backend data layer for SolFort Prediction Exchange.
 *
 * Endpoints:
 *   GET /prediction/health
 *   GET /prediction/categories
 *   GET /prediction/top
 *   GET /prediction/markets?limit=&category=&source=
 *   GET /prediction/market/:source/:id
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'https://solfort-api.onrender.com';

// ─── Normalizer ────────────────────────────────────────────────────────────
// Accepts Polymarket, Kalshi, or internal shape and returns a unified object.
export function normalizeMarket(raw) {
  if (!raw) return null;

  // Outcomes: handle both arrays and binary yes/no fields
  let outcomes = raw.outcomes;
  if (!outcomes || !outcomes.length) {
    const yesP = parseFloat(raw.yes_probability ?? raw.yesPrice ?? raw.bestYes ?? 0.5) || 0.5;
    outcomes = [
      { id: 'YES', label: 'YES', prob: yesP },
      { id: 'NO',  label: 'NO',  prob: parseFloat((1 - yesP).toFixed(4)) },
    ];
  } else {
    outcomes = outcomes.map((o, idx) => ({
      id:    String(o.id ?? o.outcome_id ?? o.label ?? idx),
      label: String(o.label ?? o.name ?? o.title ?? o.id ?? 'Option'),
      prob:  Math.max(parseFloat(o.prob ?? o.probability ?? o.price ?? o.yes_probability ?? 0.5) || 0.001, 0.001),
    }));
    // Normalize probs so they sum to ~1
    const total = outcomes.reduce((s, o) => s + o.prob, 0);
    if (total > 0 && Math.abs(total - 1) > 0.05) {
      outcomes = outcomes.map(o => ({ ...o, prob: parseFloat((o.prob / total).toFixed(4)) }));
    }
  }

  const volume = parseFloat(
    raw.volume ?? raw.volume_24h ?? raw.volumeNum ?? raw.totalVolume ??
    raw.total_volume ?? raw.liquidity ?? 0
  ) || 0;

  const endDate =
    raw.endDate ?? raw.end_date ?? raw.expiration_date ??
    raw.end_datetime ?? raw.close_time ?? raw.resolution_time ?? '';

  const tags = [...(raw.tags ?? [])];
  if (raw.featured)     tags.push('HOT');
  if (raw.trending)     tags.push('TRENDING');
  if (raw.new)          tags.push('NEW');
  if (raw.closing_soon) tags.push('ENDING SOON');

  // Detect source from payload shape if not explicit
  let source = raw.source ?? raw.provider ?? '';
  if (!source) {
    if (raw.condition_id || raw.clob_token_ids) source = 'polymarket';
    else if (raw.ticker || raw.series_ticker)   source = 'kalshi';
    else source = 'solfort';
  }
  // Normalize legacy 'internal' alias
  if (source === 'internal') source = 'solfort';

  // SolFort-specific fields
  const metadata   = raw.metadata ?? {};
  const lockAt     = raw.lockAt ?? raw.lock_at ?? metadata.lockAt ?? null;
  const lockSeconds = raw.lockSeconds ?? raw.lock_seconds ?? metadata.lockSeconds ?? null;
  const marketStatus = raw.status ?? metadata.status ?? 'open';

  return {
    id:       String(raw.id ?? raw.condition_id ?? raw.market_id ?? raw.externalId ?? raw.ticker ?? Math.random()),
    category: raw.category ?? raw.group ?? raw.category_id ?? raw.event_category ?? 'explore',
    sub:      raw.sub ?? raw.subCategory ?? raw.sub_category ?? raw.event_category ?? '',
    type:     raw.type ?? raw.market_type ?? (outcomes.length === 2 ? 'binary' : 'multi'),
    question: String(raw.question ?? raw.title ?? raw.market_title ?? raw.name ?? 'Untitled'),
    outcomes,
    volume,
    endDate:  typeof endDate === 'number' ? new Date(endDate * 1000).toISOString() : String(endDate),
    tags:     [...new Set(tags)],
    liquidity: parseFloat(raw.liquidity ?? raw.open_interest ?? 0) || 0,
    source,
    slug:     raw.slug ?? raw.id ?? '',
    image:    raw.image ?? raw.icon ?? null,
    // SolFort-specific
    status:       marketStatus,
    lockAt:       lockAt,
    lockSeconds:  lockSeconds,
    timeframe:    metadata.timeframe ?? null,
    resolutionType: metadata.resolutionType ?? null,
    targetPrice:  metadata.targetPrice ?? null,
    lockRule:     metadata.lockRule ?? null,
  };
}

function parseList(data) {
  const arr = Array.isArray(data) ? data
    : data?.markets ?? data?.results ?? data?.data ?? data?.items ?? [];
  return arr.map(normalizeMarket).filter(Boolean);
}

// ─── Health check ─────────────────────────────────────────────────────────
export function useAPIHealth() {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    fetch(`${API_BASE}/prediction/health`)
      .then(r => r.ok ? setStatus('ok') : setStatus('degraded'))
      .catch(() => setStatus('offline'));
  }, []);
  return status;
}

// ─── Categories ───────────────────────────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/prediction/categories`)
      .then(r => r.json())
      .then(data => {
        // Backend returns { data: ["Crypto", "Sports", ...] } (array of strings)
        const raw = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : data?.categories ?? [];

        console.log('[categories] fetched raw:', raw);

        const normalized = raw.map(c => {
          const exactValue = typeof c === 'string' ? c : (c.name ?? c.label ?? c.id ?? String(c));
          return {
            id:    exactValue, // EXACT backend value — used in API requests
            label: exactValue,
            emoji: typeof c === 'object' ? (c.emoji ?? c.icon ?? '') : '',
            subs:  typeof c === 'object' ? (c.sub_categories ?? c.subcategories ?? c.subs ?? []).map(s =>
              typeof s === 'string' ? s : (s.name ?? s.label ?? '')
            ) : [],
            count: typeof c === 'object' ? (c.count ?? 0) : 0,
          };
        });

        console.log('[categories] normalized IDs:', normalized.map(c => c.id));
        setCategories(normalized);
      })
      .catch(e => { console.warn('[categories] fetch failed:', e); setCategories([]); })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

// ─── Top sections ─────────────────────────────────────────────────────────
export function useTopMarkets() {
  const [top, setTop] = useState({ trending: [], popular: [], payout: [], ending: [], aiPick: [], highestOdds: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/prediction/top`)
      .then(r => r.json())
      .then(data => {
        // Support multiple backend key shapes
        const raw = data?.data ?? data;
        setTop({
          trending:     parseList(raw.trending     ?? raw.Trending     ?? []),
          popular:      parseList(raw.popular      ?? raw.Popular      ?? raw.most_popular    ?? []),
          payout:       parseList(raw.payout       ?? raw.highest_payout ?? raw.highestPayout ?? raw.highestOdds ?? []),
          ending:       parseList(raw.ending       ?? raw.ending_soon  ?? raw.endingSoon     ?? []),
          aiPick:       parseList(raw.aiPick       ?? raw.ai_picks     ?? raw.featured       ?? []),
          highestOdds:  parseList(raw.highestOdds  ?? raw.highest_odds ?? raw.best_odds      ?? []),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { top, loading };
}

// ─── Market list ──────────────────────────────────────────────────────────
export function useMarkets({ category = '', sub = '', source = '', limit = 200 } = {}) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setMarkets([]);

    const params = new URLSearchParams({ limit });
    if (category && category !== 'explore') params.set('category', category);
    if (source)   params.set('source', source);

    const requestUrl = `${API_BASE}/prediction/markets?${params}`;
    console.log('[markets] selected category:', category, '| request URL:', requestUrl);

    fetch(requestUrl, { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(data => {
        const list = parseList(data);
        // client-side sub filter (backend may not support it)
        const filtered = sub ? list.filter(m => m.sub?.toLowerCase() === sub.toLowerCase()) : list;
        console.log('[markets] returned count:', filtered.length, '| category:', category);
        setMarkets(filtered);
        setTotal(data.total ?? data.count ?? filtered.length);
      })
      .catch(err => { if (err.name !== 'AbortError') setMarkets([]); })
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, [category, sub, source, limit]);

  return { markets, loading, total };
}

// ─── Single market detail ─────────────────────────────────────────────────
export function useArchivedMarkets({ limit = 1000 } = {}) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ limit });
    fetch(`${API_BASE}/prediction/archive?${params}`)
      .then(r => r.json())
      .then(data => {
        const list = parseList(data);
        const tagged = list.map(m => ({
          ...m,
          status: m.status === 'resolved' ? 'resolved' : m.status || 'archived',
        }));
        setMarkets(tagged);
        setTotal(data.total ?? data.count ?? tagged.length);
      })
      .catch(() => setMarkets([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return { markets, loading, total };
}

export function useMarketDetail(source, id) {
  const [market,  setMarket]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!source || !id) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/prediction/market/${source}/${id}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setMarket(normalizeMarket(data?.market ?? data)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source, id]);

  return { market, loading, error };
}