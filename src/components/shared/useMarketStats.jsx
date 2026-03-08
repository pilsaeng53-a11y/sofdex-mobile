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
    try {
      // Fetch CoinGecko global + Binance futures tickers + premium index in parallel
      const [cgRes, bnRes, pmRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/global'),
        fetch('https://fapi.binance.com/fapi/v1/ticker/24hr'),
        fetch('https://fapi.binance.com/fapi/v1/premiumIndex'),
      ]);

      if (!cgRes.ok || !bnRes.ok || !pmRes.ok) throw new Error('fetch failed');

      const [cgData, bnTickers, pmIndex] = await Promise.all([
        cgRes.json(), bnRes.json(), pmRes.json(),
      ]);

      // Fetch OI for top symbols in parallel
      const oiData = await Promise.all(
        OI_SYMBOLS.map(s =>
          fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${s}`)
            .then(r => r.json())
        )
      );

      // Total global 24h volume (CoinGecko)
      const totalVolume = cgData?.data?.total_volume?.usd ?? 0;

      // 24h trade count across top futures pairs (Binance)
      const topTickers  = Array.isArray(bnTickers)
        ? bnTickers.filter(t => FUTURES_SYMBOLS.includes(t.symbol))
        : [];
      const totalTrades = topTickers.reduce((acc, t) => acc + (parseInt(t.count) || 0), 0);

      // Open Interest in USD: Binance OI qty × mark price
      const pmMap = {};
      if (Array.isArray(pmIndex)) {
        pmIndex.forEach(p => { pmMap[p.symbol] = parseFloat(p.markPrice) || 0; });
      }
      const totalOI = oiData.reduce((acc, d) => {
        const price = pmMap[d.symbol] || 0;
        const oi    = parseFloat(d.openInterest) || 0;
        return acc + oi * price;
      }, 0);

      setStats({
        totalVolume:   fmtUSD(totalVolume),
        openInterest:  fmtUSD(totalOI),
        trades24h:     fmtCount(totalTrades),
        // Active Traders is a platform-specific metric not exposed by public APIs.
        // TODO: wire to internal SOFDex aggregation endpoint once backend is live.
        activeTraders: null,
      });
      setError(false);
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