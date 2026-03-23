/**
 * CryptoTerminal — hybrid trading terminal
 * Chart: TradingView widget
 * Trading engine: SolFort internal simulator
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TradingViewChart from '../components/trade/TradingViewChart';
import CryptoOrderPanel from '../components/crypto/CryptoOrderPanel';
import MarketDepthPanel from '../components/futures/MarketDepthPanel';
import FuturesBottomPanel from '../components/futures/FuturesBottomPanel';
import useTradeSimulator from '../hooks/useTradeSimulator';
import CoinIcon from '../components/shared/CoinIcon';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { fmtPrice } from '../lib/trading/priceFormat';
import { ChevronDown, Activity } from 'lucide-react';

// ─── Supported crypto symbols ──────────────────────────────────────────────
const CRYPTO_SYMBOLS = [
  { base: 'BTC',  name: 'Bitcoin' },
  { base: 'ETH',  name: 'Ethereum' },
  { base: 'SOL',  name: 'Solana' },
  { base: 'XRP',  name: 'Ripple' },
  { base: 'BNB',  name: 'BNB' },
  { base: 'ADA',  name: 'Cardano' },
  { base: 'DOGE', name: 'Dogecoin' },
  { base: 'AVAX', name: 'Avalanche' },
];

// ─── Small spread simulation ───────────────────────────────────────────────
function deriveQuote(price) {
  if (!price) return { ask: null, bid: null };
  const half = price * 0.0001;
  return { ask: price + half, bid: price - half };
}

// ─── Symbol picker dropdown ────────────────────────────────────────────────
function SymbolPicker({ active, onChange }) {
  const [open, setOpen] = useState(false);
  const { getLiveAsset } = useMarketData();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl btn-press transition-all"
        style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.18)' }}>
        <CoinIcon symbol={active} size={18} />
        <span className="text-[13px] font-black text-white">
          {active}<span className="text-slate-500 font-medium">/USDT</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-40 w-48 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(0,212,170,0.12)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
            {CRYPTO_SYMBOLS.map(s => {
              const live = getLiveAsset(s.base);
              const isActive = s.base === active;
              return (
                <button key={s.base}
                  onClick={() => { onChange(s.base); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${isActive ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-300 hover:bg-[#151c2e]'}`}>
                  <div className="flex items-center gap-2">
                    <CoinIcon symbol={s.base} size={16} />
                    <span className="font-bold">{s.base}</span>
                    <span className="text-slate-600 text-[9px]">{s.name}</span>
                  </div>
                  {live.available && (
                    <span className={`text-[9px] font-mono ${live.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {live.change >= 0 ? '+' : ''}{live.change?.toFixed(2)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Price header ──────────────────────────────────────────────────────────
function PriceHeader({ symbol, price, change, ask, bid }) {
  const pos = (change ?? 0) >= 0;
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div>
        <div className="text-xl font-black font-mono text-white">
          {price ? fmtPrice(price, symbol) : '—'}
        </div>
        <div className={`text-xs font-bold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
          {pos ? '+' : ''}{change?.toFixed(2) ?? '0.00'}%
        </div>
      </div>
      <div className="flex gap-3 text-[10px]">
        <div>
          <span className="text-slate-600">Ask </span>
          <span className="font-mono text-red-400">{ask ? fmtPrice(ask, symbol) : '—'}</span>
        </div>
        <div>
          <span className="text-slate-600">Bid </span>
          <span className="font-mono text-emerald-400">{bid ? fmtPrice(bid, symbol) : '—'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function CryptoTerminal() {
  const [symbol, setSymbol] = useState('BTC');
  const [bottomExpanded, setBottomExpanded] = useState(true);
  const [orderPrice, setOrderPrice] = useState(null);

  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(symbol);

  const { ask, bid } = deriveQuote(live.price);

  const sim = useTradeSimulator();

  // Tick the simulator with live quotes every 2 seconds
  const tickRef = useRef(null);
  useEffect(() => {
    if (!live.price) return;
    tickRef.current = setInterval(() => {
      const { ask: a, bid: b } = deriveQuote(live.price + (Math.random() - 0.5) * live.price * 0.0002);
      sim.tickQuotes({
        [symbol]: { ask: a, bid: b, last: live.price },
      });
    }, 2000);
    return () => clearInterval(tickRef.current);
  }, [symbol, live.price]);

  // When symbol changes, clear order price
  const handleSymbolChange = useCallback((s) => {
    setSymbol(s);
    setOrderPrice(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#05070d', color: '#f1f5f9' }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 px-3 py-2 border-b flex items-center gap-3 flex-wrap"
        style={{ background: 'rgba(5,7,13,0.97)', borderColor: 'rgba(148,163,184,0.06)', backdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(148,163,184,0.04), 0 4px 24px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Activity className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Crypto</span>
        </div>
        <div className="w-px self-stretch" style={{ background: 'rgba(148,163,184,0.07)' }} />
        <SymbolPicker active={symbol} onChange={handleSymbolChange} />
        <div className="ml-auto">
          <PriceHeader symbol={symbol} price={live.price} change={live.change} ask={ask} bid={bid} />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row gap-3 px-3 pt-3 flex-1 min-h-0">

        {/* Chart — takes remaining width */}
        <div className="flex-1 min-w-0" style={{ minHeight: 380 }}>
          <TradingViewChart symbol={symbol} height={420} autoFill={false} />
        </div>

        {/* Right side: depth + order panel */}
        <div className="flex flex-col gap-3 w-full lg:w-[220px] xl:w-[240px] flex-shrink-0">
          {/* Depth */}
          <div className="rounded-2xl overflow-hidden flex-1" style={{ minHeight: 260, border: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="px-3 py-2 border-b text-[9px] font-black text-slate-500 uppercase tracking-widest"
              style={{ background: '#0b0f1a', borderColor: 'rgba(148,163,184,0.06)' }}>
              Depth
            </div>
            <div style={{ height: 260 }}>
              <MarketDepthPanel ask={ask} bid={bid} onPriceClick={p => setOrderPrice(p)} />
            </div>
          </div>

          {/* Order panel */}
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="px-3 py-2 border-b text-[9px] font-black text-slate-500 uppercase tracking-widest"
              style={{ background: '#0b0f1a', borderColor: 'rgba(148,163,184,0.06)' }}>
              Order
            </div>
            <div style={{ maxHeight: 520, overflow: 'hidden' }}>
              <CryptoOrderPanel
                symbol={symbol}
                ask={ask}
                bid={bid}
                onSubmit={sim.submitOrder}
                externalPrice={orderPrice}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom tabs ── */}
      <div className="px-3 pt-3 pb-4">
        <FuturesBottomPanel
          expanded={bottomExpanded}
          onToggle={() => setBottomExpanded(v => !v)}
          positions={sim.positions}
          pendingOrders={sim.pendingOrders}
          orderHistory={sim.orderHistory}
          tradeHistory={sim.tradeHistory}
          unrealizedPnl={sim.unrealizedPnl}
          realizedPnl={sim.realizedPnl}
          totalFees={sim.totalFees}
          onClosePosition={sim.closePosition}
          onCancelOrder={sim.cancelOrder}
        />
      </div>
    </div>
  );
}