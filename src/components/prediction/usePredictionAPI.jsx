/**
 * usePredictionAPI — Backend-ready data layer.
 * Falls back to mock data until /prediction/* endpoints are live.
 *
 * Endpoints consumed:
 *   GET /prediction/categories
 *   GET /prediction/markets?category=&sub=&limit=&offset=
 *   GET /prediction/top?type=trending|popular|ending|payout
 *   GET /prediction/market/:source/:id
 */
import { useState, useEffect, useRef } from 'react';
import { MARKETS, CATEGORY_TREE } from './mockData';

const API_BASE = 'https://solfort-api.onrender.com';
const USE_MOCK = true; // flip to false when backend is ready

function normalize(raw) {
  // Accept either our internal schema or Polymarket/Kalshi shape
  if (!raw) return null;
  return {
    id:       raw.id       ?? raw.conditionId ?? raw.market_id,
    category: raw.category ?? raw.group       ?? 'explore',
    sub:      raw.sub      ?? raw.subCategory ?? raw.sub_category ?? '',
    type:     raw.type     ?? (raw.outcomes?.length === 2 ? 'binary' : 'multi'),
    question: raw.question ?? raw.title       ?? raw.market_title,
    outcomes: raw.outcomes ?? [
      { id: 'YES', label: 'YES', prob: raw.yes_probability ?? 0.5 },
      { id: 'NO',  label: 'NO',  prob: raw.no_probability  ?? 0.5 },
    ],
    volume:    raw.volume    ?? raw.volumeNum    ?? raw.total_volume ?? 0,
    endDate:   raw.endDate   ?? raw.end_date     ?? raw.expiration_date ?? '',
    tags:      raw.tags      ?? [],
    liquidity: raw.liquidity ?? raw.liquidity_num ?? 0,
    source:    raw.source    ?? 'internal',
  };
}

export function useMarkets({ category = 'explore', sub = '' } = {}) {
  const [markets, setMarkets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    if (USE_MOCK) {
      const filtered = MARKETS.filter(m => {
        if (category === 'explore') return true;
        if (sub) return m.category === category && m.sub === sub;
        return m.category === category;
      });
      setMarkets(filtered);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ category, limit: 50 });
    if (sub) params.set('sub', sub);

    fetch(`${API_BASE}/prediction/markets?${params}`, { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(data => setMarkets((data.markets ?? data).map(normalize)))
      .catch(() => setMarkets(MARKETS.filter(m => m.category === category)))
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, [category, sub]);

  return { markets, loading };
}

export function useTopMarkets() {
  const [top, setTop] = useState({
    trending: [],
    popular:  [],
    ending:   [],
    payout:   [],
    aiPick:   [],
  });

  useEffect(() => {
    if (USE_MOCK) {
      const all = MARKETS;
      setTop({
        trending: all.filter(m => m.tags.includes('TRENDING')).slice(0, 6),
        popular:  [...all].sort((a,b) => b.volume - a.volume).slice(0, 6),
        ending:   all.filter(m => m.tags.includes('ENDING SOON') || (new Date(m.endDate) - new Date() < 8*86400000)).slice(0, 6),
        payout:   all.filter(m => m.tags.includes('HIGH PAYOUT')).slice(0, 6),
        aiPick:   all.filter(m => m.tags.includes('AI PICK')).slice(0, 6),
      });
      return;
    }
    Promise.all(['trending','popular','ending','payout'].map(type =>
      fetch(`${API_BASE}/prediction/top?type=${type}`).then(r => r.json())
    )).then(([trending, popular, ending, payout]) => {
      setTop({ trending: trending.map(normalize), popular: popular.map(normalize), ending: ending.map(normalize), payout: payout.map(normalize), aiPick: [] });
    }).catch(() => {});
  }, []);

  return top;
}