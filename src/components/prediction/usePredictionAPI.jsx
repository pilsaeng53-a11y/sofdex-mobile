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
    const yesP = raw.yes_probability ?? raw.yesPrice ?? raw.bestYes ?? 0.5;
    const noP  = 1 - yesP;
    outcomes = [
      { id: 'YES', label: 'YES', prob: parseFloat(yesP) || 0.5 },
      { id: 'NO',  label: 'NO',  prob: parseFloat(noP)  || 0.5 },
    ];
  } else {
    outcomes = outcomes.map(o => ({
      id:    o.id    ?? o.outcome_id    ?? o.label ?? String(o.index ?? 0),
      label: o.label ?? o.name          ?? o.title ?? o.id ?? 'Option',
      prob:  parseFloat(o.prob ?? o.probability ?? o.price ?? o.yes_probability ?? 0.5) || 0.001,
    }));
  }

  const volume = parseFloat(
    raw.volume ?? raw.volume_24h ?? raw.volumeNum ?? raw.totalVolume ??
    raw.total_volume ?? raw.liquidity ?? 0
  ) || 0;

  const endDate =
    raw.endDate ?? raw.end_date ?? raw.expiration_date ??
    raw.end_datetime ?? raw.close_time ?? raw.resolution_time ?? '';

  const tags = raw.tags ?? [];
  if (raw.featured)     tags.push('HOT');
  if (raw.trending)     tags.push('TRENDING');
  if (raw.new)          tags.push('NEW');
  if (raw.closing_soon) tags.push('ENDING SOON');

  return {
    id:       raw.id         ?? raw.condition_id  ?? raw.market_id    ?? raw.slug ?? String(Math.random()),
    category: (raw.category  ?? raw.group         ?? raw.category_id  ?? 'explore').toLowerCase(),
    sub:      raw.sub        ?? raw.subCategory   ?? raw.sub_category ?? raw.event_category ?? '',
    type:     raw.type       ?? raw.market_type   ?? (outcomes.length === 2 ? 'binary' : 'multi'),
    question: raw.question   ?? raw.title         ?? raw.market_title ?? raw.name ?? 'Untitled',
    outcomes,
    volume,
    endDate:  typeof endDate === 'number' ? new Date(endDate * 1000).toISOString() : String(endDate),
    tags:     [...new Set(tags)],
    liquidity: parseFloat(raw.liquidity ?? raw.open_interest ?? 0) || 0,
    source:   raw.source     ?? raw.provider      ?? 'internal',
    slug:     raw.slug       ?? raw.id            ?? '',
    image:    raw.image      ?? raw.icon          ?? null,
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
        const raw = Array.isArray(data) ? data : data?.categories ?? [];
        const normalized = raw.map(c => ({
          id:    (c.id ?? c.slug ?? c.name ?? '').toLowerCase().replace(/\s+/g,'-'),
          label: c.label ?? c.name ?? c.title ?? c.id ?? 'Category',
          emoji: c.emoji ?? c.icon ?? '',
          subs:  (c.sub_categories ?? c.subcategories ?? c.subs ?? c.children ?? []).map(s =>
            typeof s === 'string' ? s : (s.name ?? s.label ?? s.title ?? '')
          ),
          count: c.count ?? c.market_count ?? 0,
        }));
        setCategories(normalized);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

// ─── Top sections ─────────────────────────────────────────────────────────
export function useTopMarkets() {
  const [top, setTop] = useState({ trending: [], popular: [], payout: [], ending: [], aiPick: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/prediction/top`)
      .then(r => r.json())
      .then(data => {
        setTop({
          trending: parseList(data.trending ?? data.Trending ?? []),
          popular:  parseList(data.popular  ?? data.Popular  ?? data.most_popular ?? []),
          payout:   parseList(data.payout   ?? data.highest_payout ?? data.highestPayout ?? []),
          ending:   parseList(data.ending   ?? data.ending_soon    ?? data.endingSoon    ?? []),
          aiPick:   parseList(data.aiPick   ?? data.ai_picks       ?? data.featured      ?? []),
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

    fetch(`${API_BASE}/prediction/markets?${params}`, { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(data => {
        const list = parseList(data);
        // client-side sub filter (backend may not support it)
        const filtered = sub ? list.filter(m => m.sub?.toLowerCase() === sub.toLowerCase()) : list;
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