import { useState, useEffect } from 'react';

const FUTURES_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT'];
const OI_SYMBOLS      = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

function fmtUSD(n) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

export function useMarketStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  async function fetchAll() {
    const safeJson = async (res) => {
      try { return res.ok ? await res.json() : null; } catch { return null; }
    };
    const safeFetch = (url) => fetch(url).then(r => r).catch(() => ({ ok: false }));

    try {
      // Use allSettled so one failing source never blocks the others
      const [cgRes, bnRes, pmRes] = await Promise.all([
        safeFetch('https://api.coingecko.com/api/v3/global'),
        safeFetch('https://fapi.binance.com/fapi/v1/ticker/24hr'),
        safeFetch('https://fapi.binance.com/fapi/v1/premiumIndex'),
      ]);

      const [cgData, bnTickers, pmIndex] = await Promise.all([
        safeJson(cgRes), safeJson(bnRes), safeJson(pmRes),
      ]);

      // Fetch OI — individual failures become null
      const oiData = await Promise.all(
        OI_SYMBOLS.map(s =>
          safeFetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${s}`)
            .then(r => safeJson(r))
        )
      );

      // Total global 24h volume (CoinGecko)
      const totalVolume = cgData?.data?.total_volume?.usd ?? null;

      // 24h trade count across top futures pairs (Binance)
      const topTickers = Array.isArray(bnTickers)
        ? bnTickers.filter(t => FUTURES_SYMBOLS.includes(t.symbol))
        : [];
      const totalTrades = topTickers.reduce((acc, t) => acc + (parseInt(t.count) || 0), 0);

      // Open Interest in USD
      const pmMap = {};
      if (Array.isArray(pmIndex)) {
        pmIndex.forEach(p => { pmMap[p.symbol] = parseFloat(p.markPrice) || 0; });
      }
      const totalOI = oiData.reduce((acc, d) => {
        if (!d) return acc;
        const price = pmMap[d.symbol] || 0;
        const oi    = parseFloat(d.openInterest) || 0;
        return acc + oi * price;
      }, 0);

      const hasAnyData = totalVolume !== null || totalTrades > 0 || totalOI > 0;

      setStats({
        totalVolume:  totalVolume !== null ? fmtUSD(totalVolume) : null,
        openInterest: totalOI > 0         ? fmtUSD(totalOI)     : null,
        trades24h:    totalTrades > 0     ? fmtCount(totalTrades): null,
        activeTraders: null,
      });
      setError(!hasAnyData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 60_000); // refresh every 60s
    return () => clearInterval(id);
  }, []);

  return { stats, loading, error, refetch: fetchAll };
}