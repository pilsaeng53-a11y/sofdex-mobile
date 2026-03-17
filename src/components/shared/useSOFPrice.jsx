import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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
    // Use backend function with multiple on-chain sources
    const response = await base44.functions.invoke('getSOFPrice', {});
    const result = response?.data || {};

    if (result.success && result.price != null && result.price > 0) {
      // Real on-chain price from Raydium/Jupiter/DexScreener
      notifySubscribers({
        price: result.price,
        change24h: result.change24h ?? 0,
        marketCap: null,
        volume24h: result.volume24h ?? 0,
        loading: false,
        error: false,
        source: result.source,
        liquidity: result.liquidity,
      });
    } else {
      // No liquidity or error state — show message, never placeholder 0
      notifySubscribers({
        price: null,
        change24h: null,
        marketCap: null,
        volume24h: null,
        loading: false,
        error: true,
        errorMessage: result.error || 'No liquidity / price unavailable',
        source: 'none',
      });
    }
  } catch (err) {
    console.error('[useSOFPrice] Fetch error:', err.message);
    notifySubscribers({
      price: null,
      change24h: null,
      marketCap: null,
      volume24h: null,
      loading: false,
      error: true,
      errorMessage: 'Failed to fetch SOF price',
      source: 'none',
    });
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