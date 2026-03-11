import React, { useState, useEffect, useRef } from 'react';
import { Flame, TrendingUp, TrendingDown, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'JUP', 'RNDR', 'RAY', 'LINK', 'ARB', 'OP', 'DOGE'];
const SIZES = [24000, 48000, 120000, 250000, 500000, 1200000, 2400000];

// Coinalyze public liquidation WebSocket (free, no auth)
const COINALYZE_WS = 'wss://stream.coinalyze.net/v1/liquidations';

function genLiq(overrides = {}) {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = Math.random() > 0.5 ? 'long' : 'short';
  const size = SIZES[Math.floor(Math.random() * SIZES.length)];
  const leverage = [5, 10, 20, 25, 50, 100][Math.floor(Math.random() * 6)];
  return {
    symbol,
    side,
    size,
    leverage: `${leverage}x`,
    price: (Math.random() * 200 + 10).toFixed(2),
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    exchange: ['Binance', 'OKX', 'Bybit', 'dYdX', 'SOFDex'][Math.floor(Math.random() * 5)],
    isReal: false,
    ...overrides,
  };
}

function formatSize(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function LiquidationFeed() {
  const [liqs, setLiqs] = useState(() => Array.from({ length: 24 }, genLiq));
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(false);
  const [wsStatus, setWsStatus] = useState('connecting'); // connecting | live | fallback
  const wsRef = useRef(null);
  const aliveRef = useRef(true);
  const retryRef = useRef(0);

  // Try real Coinalyze WS; fall back to simulated feed
  useEffect(() => {
    aliveRef.current = true;

    function tryConnect() {
      try {
        const ws = new WebSocket(COINALYZE_WS);
        wsRef.current = ws;
        const timeout = setTimeout(() => { ws.close(); }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          setWsStatus('live');
        };

        ws.onmessage = (e) => {
          if (paused) return;
          try {
            const msgs = JSON.parse(e.data);
            const arr = Array.isArray(msgs) ? msgs : [msgs];
            arr.forEach(m => {
              if (!m?.symbol || !m?.side || !m?.size) return;
              const sym = m.symbol.replace('USDT', '').replace('USDC', '').replace('-PERP', '');
              const liq = {
                symbol: sym.slice(0, 6),
                side: m.side === 'sell' ? 'long' : 'short',
                size: parseFloat(m.size) || 50000,
                leverage: m.leverage ? `${m.leverage}x` : '—',
                price: m.price ? parseFloat(m.price).toFixed(2) : '—',
                time: new Date(m.timestamp || Date.now()).toLocaleTimeString('en-US', { hour12: false }),
                exchange: m.exchange || 'Market',
                isReal: true,
              };
              setLiqs(prev => [liq, ...prev.slice(0, 49)]);
            });
          } catch {}
        };

        ws.onerror = () => { clearTimeout(timeout); ws.close(); };
        ws.onclose = () => {
          clearTimeout(timeout);
          if (!aliveRef.current) return;
          setWsStatus('fallback');
          retryRef.current++;
          const delay = Math.min(5000 * retryRef.current, 30000);
          setTimeout(tryConnect, delay);
        };
      } catch {
        setWsStatus('fallback');
      }
    }

    tryConnect();
    return () => {
      aliveRef.current = false;
      wsRef.current?.close();
    };
  }, []);

  // Simulated fallback ticker (always runs, complements real data)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      if (wsStatus !== 'live') {
        setLiqs(prev => [genLiq(), ...prev.slice(0, 49)]);
      }
    }, 1400 + Math.random() * 1800);
    return () => clearInterval(id);
  }, [paused, wsStatus]);

  const shown = filter === 'all' ? liqs : liqs.filter(l => l.side === filter);
  const totalLiq24h = liqs.reduce((acc, l) => acc + l.size, 0);
  const bigLiqs = liqs.filter(l => l.size >= 500000).length;

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-bold text-white">Liquidation Feed</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${
            wsStatus === 'live'
              ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
              : wsStatus === 'connecting'
              ? 'bg-amber-400/10 border-amber-400/20 text-amber-400'
              : 'bg-slate-700/30 border-slate-700 text-slate-500'
          }`}>
            {wsStatus === 'live' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
            {wsStatus === 'live' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Simulated'}
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              paused
                ? 'bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]'
                : 'bg-[#151c2e] border-[rgba(148,163,184,0.08)] text-slate-400'
            }`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{formatSize(totalLiq24h)}</p>
          <p className="text-[10px] text-slate-500">Total Liquidated</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-orange-400">{bigLiqs}</p>
          <p className="text-[10px] text-slate-500">Large ({'>'}$500K)</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{liqs.length}</p>
          <p className="text-[10px] text-slate-500">Total Events</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'long', label: 'Longs Liq.' },
          { key: 'short', label: 'Shorts Liq.' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-3 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.06)]">
          <span>Asset / Side</span>
          <span className="text-center">Size</span>
          <span className="text-center">Lev.</span>
          <span className="text-right">Time</span>
        </div>
        <div className="max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {shown.map((l, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 px-3 py-2.5 text-[11px] border-b border-[rgba(148,163,184,0.04)] ${
                i === 0 && !paused ? 'bg-orange-500/5' : ''
              } ${l.size >= 500000 ? 'bg-red-500/5' : ''}`}
            >
              <div className="flex items-center gap-1.5">
                {l.side === 'long'
                  ? <TrendingUp className="w-3 h-3 text-red-400 flex-shrink-0" />
                  : <TrendingDown className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                <div>
                  <span className="font-bold text-white">{l.symbol}</span>
                  <span className={`ml-1 text-[10px] ${l.side === 'long' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {l.side === 'long' ? 'Long' : 'Short'}
                  </span>
                </div>
              </div>
              <span className={`text-center font-bold ${l.size >= 500000 ? 'text-orange-400' : 'text-white'}`}>
                {formatSize(l.size)}
              </span>
              <span className="text-center text-slate-400">{l.leverage}</span>
              <span className="text-right text-slate-500 font-mono text-[10px] flex flex-col items-end gap-0.5">
                <span>{l.time}</span>
                {l.isReal && <span className="text-emerald-400/60 text-[8px] font-bold">LIVE</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}