import { useState, useEffect, useCallback } from 'react';

const SOF_CONTRACT = '4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3';

let cachedData = null;
let subscribers = [];
let fetchInterval = null;

function notifySubscribers(data) {
  cachedData = data;
  subscribers.forEach(fn => fn(data));
}

async function fetchSOFPrice() {
  try {
    const res = await window.fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${SOF_CONTRACT}`
    );
    const json = await res.json();
    // pick the pair with highest liquidity
    const pairs = json?.pairs || [];
    const pair = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    if (pair) {
      notifySubscribers({
        price: parseFloat(pair.priceUsd) || null,
        change24h: pair.priceChange?.h24 ?? null,
        marketCap: pair.fdv ?? pair.marketCap ?? null,
        volume24h: pair.volume?.h24 ?? null,
        loading: false,
        error: false,
      });
    } else {
      notifySubscribers({ price: null, change24h: null, marketCap: null, volume24h: null, loading: false, error: true });
    }
  } catch {
    notifySubscribers({ price: null, change24h: null, marketCap: null, volume24h: null, loading: false, error: true });
  }
}

function startGlobalFetch() {
  if (!fetchInterval) {
    fetchSOFPrice();
    fetchInterval = setInterval(fetchSOFPrice, 30000);
  }
}

export function useSOFPrice() {
  const [data, setData] = useState(cachedData || { price: null, change24h: null, marketCap: null, volume24h: null, loading: true, error: false });

  useEffect(() => {
    subscribers.push(setData);
    startGlobalFetch();
    if (cachedData) setData(cachedData);
    return () => {
      subscribers = subscribers.filter(fn => fn !== setData);
    };
  }, []);

  return data;
}

export function formatSOFPrice(price) {
  if (!price) return '—';
  if (price < 0.000001) return `$${price.toExponential(4)}`;
  if (price < 0.001) return `$${price.toFixed(8)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
}

export function formatMarketCap(val) {
  if (!val) return '—';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}