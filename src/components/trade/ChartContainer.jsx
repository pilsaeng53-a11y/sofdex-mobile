import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Maximize2, BarChart2,
  RefreshCw, WifiOff, Activity, ChevronUp, ChevronDown
} from 'lucide-react';
import { useTicker, useKlines } from '../../hooks/useOrderlyMarket';
import CoinIcon from '../shared/CoinIcon';
import { resolveTradingPrice, priceSourceLabel, logPriceResolution } from '../../services/tradingPriceResolver';
import { normalizeSymbol } from '../../services/symbolResolver';
import { logPriceSource, logComponentRender } from '../../lib/debugRuntimeBinding';

// NOTE: MarketDataProvider (Binance/CoinGecko) is intentionally NOT used here.
// All prices in this chart come exclusively from Orderly market data:
//   priority: mark_price → last_price (24h_close) → index_price

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100)   return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  return v.toFixed(6);
}

function fmtChange(v) {
  if (v == null || isNaN(v)) return null;
  return `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
}

// ─── Status pill — matches OrderBook exactly ──────────────────────────────────
function StatusPill({ state }) {
  if (state === 'live') return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
      </div>
      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
    </div>
  );
  if (state === 'reconnecting') return (
    <div className="flex items-center gap-1">
      <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Reconnecting</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <WifiOff className="w-3 h-3 text-slate-500" />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offline</span>
    </div>
  );
}

// ─── Animated candle skeleton ─────────────────────────────────────────────────
function ChartSkeleton() {
  const bars = Array.from({ length: 28 }, (_, i) => ({
    h:    40 + Math.sin(i * 0.7) * 25 + Math.random() * 20,
    body: 12 + Math.random() * 28,
    up:   Math.random() > 0.46,
  }));

  return (
    <div className="absolute inset-0 flex items-end justify-around px-4 pb-6 overflow-hidden">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-0 animate-pulse"
          style={{ width: `${100 / bars.length - 0.5}%`, opacity: 0.25 + (i / bars.length) * 0.35 }}
        >
          {/* Wick top */}
          <div
            className="w-px rounded-full"
            style={{
              height: (bar.h - bar.body) / 2,
              background: bar.up ? '#4ade80' : '#f87171',
            }}
          />
          {/* Body */}
          <div
            className="w-full rounded-sm"
            style={{
              height: bar.body,
              background: bar.up ? 'rgba(74,222,128,0.45)' : 'rgba(248,113,113,0.45)',
            }}
          />
          {/* Wick bottom */}
          <div
            className="w-px rounded-full"
            style={{
              height: (bar.h - bar.body) / 2,
              background: bar.up ? '#4ade80' : '#f87171',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Empty / error state ──────────────────────────────────────────────────────
function EmptyState({ message = 'Chart data unavailable' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.1)' }}
      >
        <BarChart2 className="w-6 h-6" style={{ color: 'rgba(0,212,170,0.4)' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-500">{message}</p>
        <p className="text-[10px]" style={{ color: '#2a3348' }}>Candlestick data will appear here</p>
      </div>
    </div>
  );
}

// ─── Decorative grid lines ────────────────────────────────────────────────────
function GridLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      {/* Horizontal lines */}
      {[20, 35, 50, 65, 80].map(pct => (
        <line
          key={pct}
          x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`}
          stroke="rgba(148,163,184,0.04)" strokeWidth="1"
        />
      ))}
      {/* Vertical lines */}
      {[20, 40, 60, 80].map(pct => (
        <line
          key={pct}
          x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%"
          stroke="rgba(148,163,184,0.04)" strokeWidth="1"
        />
      ))}
    </svg>
  );
}

// ─── Price axis labels (right) ────────────────────────────────────────────────
function PriceAxis({ midPrice }) {
  if (!midPrice) return null;
  const levels = [1.04, 1.02, 1.0, 0.98, 0.96];
  return (
    <div className="absolute right-0 top-0 bottom-0 w-14 flex flex-col justify-around items-end pr-2 pointer-events-none">
      {levels.map((mult, i) => (
        <span
          key={i}
          className="font-mono text-[8px]"
          style={{ color: 'rgba(148,163,184,0.2)' }}
        >
          {fmtPrice(midPrice * mult)}
        </span>
      ))}
    </div>
  );
}

// ─── Crosshair placeholder overlay ───────────────────────────────────────────
function ReadyOverlay({ symbol, timeframe }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Subtle watermark */}
      <div className="flex flex-col items-center gap-2 opacity-[0.055]">
        <Activity className="w-16 h-16 text-[#00d4aa]" />
        <span className="text-lg font-black text-[#00d4aa] tracking-widest uppercase">{symbol}/USDT · {timeframe}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChartContainer({ symbol = 'BTC', onFullscreen }) {
  const normalizedSymbol = normalizeSymbol(symbol);
  // ── HARD LOCKED: Price comes ONLY from Orderly ticker ──
  // NEVER market cap, metadata, or fallback prices
  // Priority: mark_price → last_price → index_price
  const { ticker } = useTicker(normalizedSymbol);
  const { price: resolvedPrice, source: priceSource } = resolveTradingPrice(ticker);
  const price  = resolvedPrice > 0 ? resolvedPrice : null;
  const change = ticker?.change24h ?? null;

  // HARD LOCK: Log price resolution from trading resolver
  useEffect(() => {
    logPriceResolution(symbol, ticker, { price: resolvedPrice, source: priceSource });
    logComponentRender('ChartContainer', { symbol, priceSource, price, tickerLoaded: !!ticker });
  }, [symbol, priceSource, resolvedPrice, ticker]);

  const [timeframe, setTimeframe] = useState('1h');
  const [priceDir,  setPriceDir]  = useState(null);

  // Live klines from Orderly WebSocket (no public REST kline endpoint exists)
  const { candles, loading, error, status: klinesStatus } = useKlines(normalizedSymbol, timeframe);

  // Show 'live' once WS is connected (even if no candles yet — low-activity symbols)
  const status = klinesStatus === 'live' || candles.length > 0 ? 'live' : klinesStatus;

  // Last candle OHLC for the footer bar
  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  // Track price direction (simplified without ref)
  useEffect(() => {
    if (price == null) return;
    setPriceDir('update');
    const t = setTimeout(() => setPriceDir(null), 1500);
    return () => clearTimeout(t);
  }, [price]);

  const changeColor = change == null ? '#94a3b8' : change >= 0 ? '#4ade80' : '#f87171';
  const PriceIcon   = priceDir === 'up' ? ChevronUp : priceDir === 'down' ? ChevronDown : null;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, rgba(10,14,26,0.99) 0%, rgba(6,9,18,0.99) 100%)',
        border: '1px solid rgba(148,163,184,0.08)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Top accent gradient */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, rgba(0,212,170,0.3), rgba(59,130,246,0.18), transparent)' }}
      />

      {/* ── Top toolbar ── */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b flex-wrap gap-2"
        style={{ borderColor: 'rgba(148,163,184,0.07)', background: 'rgba(5,7,13,0.8)' }}
      >
        {/* Left: symbol + price */}
        <div className="flex items-center gap-2.5 min-w-0">
          <CoinIcon symbol={symbol} size={20} />
          <div
            className="h-6 px-2 rounded-lg flex items-center gap-1.5 flex-shrink-0"
            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.14)' }}
          >
            <span className="text-[10px] font-black text-[#00d4aa] tracking-tight">{symbol}</span>
            <span className="text-[8px] text-slate-600">/USDT</span>
          </div>

          {/* Live price */}
          <div className="flex items-center gap-1">
            {PriceIcon && (
              <PriceIcon
                className="w-3 h-3 flex-shrink-0"
                style={{ color: priceDir === 'up' ? '#4ade80' : '#f87171' }}
              />
            )}
            <span
              className="font-mono text-sm font-black transition-colors duration-300 leading-none"
              style={{ color: priceDir === 'up' ? '#4ade80' : priceDir === 'down' ? '#f87171' : '#e2e8f0' }}
            >
              {price != null ? fmtPrice(price) : '—'}
            </span>
          </div>

          {change != null && (
            <span
              className="font-mono text-[10px] font-bold flex-shrink-0"
              style={{ color: changeColor }}
            >
              {fmtChange(change)}
            </span>
          )}
        </div>

        {/* Right: timeframes + buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Timeframe tabs */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ background: 'rgba(4,6,14,0.8)', border: '1px solid rgba(148,163,184,0.07)' }}
          >
            {TIMEFRAMES.map(tf => {
              const active = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="px-2.5 py-1.5 text-[9.5px] font-black transition-all duration-150"
                  style={active ? {
                    background: 'rgba(0,212,170,0.12)',
                    color: '#00d4aa',
                    borderBottom: '2px solid rgba(0,212,170,0.4)',
                  } : { color: '#3d4f6b' }}
                >
                  {tf}
                </button>
              );
            })}
          </div>

          {/* Indicators */}
          <button
            className="h-7 px-2.5 rounded-lg text-[9.5px] font-black transition-all flex items-center gap-1"
            style={{
              background: 'rgba(4,6,14,0.8)',
              border: '1px solid rgba(148,163,184,0.07)',
              color: '#3d4f6b',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00d4aa'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#3d4f6b'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.07)'; }}
          >
            <BarChart2 className="w-3 h-3" />
            <span className="hidden sm:inline">Indicators</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(4,6,14,0.8)',
              border: '1px solid rgba(148,163,184,0.07)',
              color: '#3d4f6b',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00d4aa'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#3d4f6b'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.07)'; }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <StatusPill state={status} />
          {/* HARD LOCK: Visible price source indicator */}
          <span
            className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
            style={{ background: 'rgba(0,212,170,0.12)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }}
          >
            {priceSourceLabel(priceSource)}
          </span>
        </div>
      </div>

      {/* ── Chart area ── */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          minHeight: 260,
          background: 'linear-gradient(180deg, rgba(6,9,18,0.6) 0%, rgba(4,6,14,0.9) 100%)',
        }}
      >
        <GridLines />
        <PriceAxis midPrice={price} />

        {klinesStatus === 'reconnecting' ? (
          <>
            <ChartSkeleton />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(4,6,14,0.8)', border: '1px solid rgba(0,212,170,0.12)' }}>
                <div className="w-3 h-3 rounded-full border-2 border-[#00d4aa] border-t-transparent animate-spin" />
                <span className="text-[9px] font-bold text-[#00d4aa]">Connecting to {symbol} stream...</span>
              </div>
            </div>
          </>
        ) : candles.length === 0 ? (
          <>
            <ReadyOverlay symbol={symbol} timeframe={timeframe} />
            <div className="absolute bottom-10 inset-x-0 flex justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(4,6,14,0.8)', border: '1px solid rgba(0,212,170,0.08)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold" style={{ color: '#3d4f6b' }}>Waiting for first {timeframe} candle...</span>
              </div>
            </div>
          </>
        ) : (
          <ReadyOverlay symbol={symbol} timeframe={timeframe} />
        )}

        {/* Bottom time axis hint */}
        {!loading && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-1.5 border-t"
            style={{ borderColor: 'rgba(148,163,184,0.04)', background: 'rgba(4,6,14,0.7)' }}
          >
            {['6h ago', '4h ago', '2h ago', '1h ago', 'Now'].map(label => (
              <span key={label} className="font-mono text-[8px]" style={{ color: 'rgba(148,163,184,0.18)' }}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom info bar ── */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(5,7,13,0.8)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: '#2a3348' }}>O</span>
            <span className="font-mono text-[9px]" style={{ color: '#3d4f6b' }}>{lastCandle ? fmtPrice(lastCandle.open) : '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: '#2a3348' }}>H</span>
            <span className="font-mono text-[9px]" style={{ color: '#4ade80' }}>{lastCandle ? fmtPrice(lastCandle.high) : '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: '#2a3348' }}>L</span>
            <span className="font-mono text-[9px]" style={{ color: '#f87171' }}>{lastCandle ? fmtPrice(lastCandle.low) : '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: '#2a3348' }}>C</span>
            <span className="font-mono text-[9px]" style={{ color: '#e2e8f0' }}>{lastCandle ? fmtPrice(lastCandle.close) : price ? fmtPrice(price) : '—'}</span>
          </div>
        </div>
        <span className="text-[8.5px] font-bold" style={{ color: '#2a3348' }}>
          {candles.length > 0 ? `${candles.length} candles · ${timeframe}` : 'Loading candles...'}
        </span>
      </div>
    </div>
  );
}