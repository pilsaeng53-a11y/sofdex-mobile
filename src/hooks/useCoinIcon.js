/**
 * useCoinIcon — React hook for resolving a coin icon URL.
 *
 * Returns the icon URL string (or null if not found / still loading).
 * Reads from sync cache instantly, then subscribes to async resolution.
 * Completely isolated from trading data.
 */

import { useState, useEffect } from 'react';
import { getCoinIcon, getCachedIcon, subscribeIcon } from '../services/coinIconService';

export function useCoinIcon(symbol) {
  const key = symbol?.toUpperCase() ?? '';
  const [url, setUrl] = useState(() => getCachedIcon(key) ?? null);

  useEffect(() => {
    if (!key) { setUrl(null); return; }

    const cached = getCachedIcon(key);
    setUrl(cached ?? null);

    if (cached === undefined) {
      getCoinIcon(key); // trigger resolution
      const unsub = subscribeIcon(key, () => {
        setUrl(getCachedIcon(key) ?? null);
      });
      return unsub;
    }
  }, [key]);

  return url;
}