/**
 * useRWAWatchlist — localStorage-based RWA watchlist (DB-ready)
 */
import { useState, useEffect } from 'react';

const KEY = 'solfort_rwa_watchlist';

export function useRWAWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const isWatched = (id) => watchlist.includes(id);

  const toggle = (id) => {
    setWatchlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return { watchlist, isWatched, toggle };
}