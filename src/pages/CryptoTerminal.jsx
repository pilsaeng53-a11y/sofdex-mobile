/**
 * CryptoTerminal — hybrid trading terminal
 * Chart:  TradingView widget (visual reference)
 * Engine: SolFort internal simulator (orders, positions, PnL)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TradingViewChart from '../components/trade/TradingViewChart';
import CryptoOrderPanel from '../components/crypto/CryptoOrderPanel';
import MarketDepthPanel from '../components/futures/MarketDepthPanel';
import FuturesBottomPanel from '../components/futures/FuturesBottomPanel';
import TradeNewsPanel from '../components/trade/TradeNewsPanel';
import ExecutionToasts, { useExecutionToasts } from '../components/trading/ExecutionToasts';
import TradingStatusBar from '../components/trading/TradingStatusBar';
import useTradeSimulator from '../hooks/useTradeSimulator';
import CoinIcon from '../components/shared/CoinIcon';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { fmtPrice } from '../lib/trading/priceFormat';
import { ChevronDown, Activity, Layers, Globe, LayoutGrid, TrendingUp, TrendingDown } from 'lucide-react';

// ─── Supported symbols ─────────────────────────────────────────────────────
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

const SIDE_TABS = [
  { id: 'order', icon: LayoutGrid, label: 'Order' },
  { id: 'depth', icon: Layers,     label: 'Depth' },
  { id: 'news',  icon: Globe,      label: 'News' },
];

// Simulate realistic spread (~0.01%)
function deriveQuote(price) {
  if (!price) return { ask: null, bid: null };
  const half = price * 0.0001;
  return { ask: price + half, bid: price - half };
}

// ─── Symbol picker ─────────────────────────────────────────────────────────
function SymbolPicker({ active, onChange }) {
  const [open, setOpen] = useState(false);
  const { getLiveAsset } = useMarketData();

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
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
          <div className="absolute left-0 top-10 z-40 w-52 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(0,212,170,0.12)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
            {CRYPTO_SYMBOLS.map(s => {
              const live = getLiveAsset(s.base);
              return (
                <button key={s.base} onClick={() => { onChange(s.base); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${s.base === active ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-slate-300 hover:bg-[#151c2e]'}`}>
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

// ─── Active positions overlay (below chart) ────────────────────────────────
function PositionChips({ positions, onClose, symbol }) {
  const myPos = positions.filter(p => p.symbol === symbol);
  if (!myPos.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-[rgba(148,163,184,0.06)]"
      style={{ background: '#0b0f1a' }}>
      {myPos.map(p => {
        const pnl = p.side === 'buy'
          ? ((p.currentPrice ?? p.entryPrice) - p.entryPrice) * p.volume
          : (p.entryPrice - (p.currentPrice ?? p.entryPrice)) * p.volume;
        const pos = pnl >= 0;
        return (
          <div key={p.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
            style={{ background: 'rgba(15,21,37,0.9)', border: `1px solid ${p.side === 'buy' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <span className={p.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{p.side.toUpperCase()}</span>
            <span className="text-slate-400 font-mono">{p.volume}</span>
            <span className="text-slate-500">@{fmtPrice(p.entryPrice, symbol)}</span>
            <span className={`font-mono ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
              {pos ? '+' : ''}${Math.abs(pnl).toFixed(2)}
            </span>
            <button onClick={() => onClose(p.id, p.currentPrice ?? p.entryPrice)}
              className="w-3.5 h-3.5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors text-[8px]">✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function CryptoTerminal() {
  const [symbol, setSymbol]             = useState('BTC');
  const [sideTab, setSideTab]           = useState('order');
  const [bottomExpanded, setBottomExpanded] = useState(true);
  const [depthClickPrice, setDepthClickPrice] = useState(null);

  const { getLiveAsset } = useMarketData();
  const live = getLiveAsset(symbol);
  const { ask, bid } = deriveQuote(live.price);
  const positive = (live.change ?? 0) >= 0;

  const sim = useTradeSimulator();
  const [toasts, addToast] = useExecutionToasts();

  // Wire simulator events → toasts
  useEffect(() => {
    sim.setOnEvent((type, data) => {
      const p    = (v) => fmtPrice(v, data?.pos?.symbol ?? data?.order?.symbol ?? symbol);
      const pnlS = (v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`;
      if (type === 'market_fill')     addToast(`✓ ${data.pos.side.toUpperCase()} ${data.pos.volume} @ ${p(data.entryPrice)}`, 'success');
      if (type === 'pending_placed')  addToast(`⏳ ${data.order.orderType} @ ${p(data.order.limitPrice)}`, 'pending');
      if (type === 'pending_filled')  addToast(`✓ Filled @ ${p(data.fillPrice)}`, 'success');
      if (type === 'sl_triggered')    addToast(`🛑 SL · ${data.pos.symbol} · ${pnlS(data.pnl)}`, 'danger');
      if (type === 'tp_triggered')    addToast(`🎯 TP · ${data.pos.symbol} · ${pnlS(data.pnl)}`, 'success');
      if (type === 'liquidated')      addToast(`⚡ LIQ ${data.pos.symbol} · ${pnlS(data.pnl)}`, 'danger');
      if (type === 'position_closed') addToast(`Closed ${data.pos.symbol} · ${pnlS(data.pnl)}`, 'info');
      if (type === 'order_cancelled') addToast('Order cancelled', 'info');
    });
  }, [symbol]);

  // Tick simulator with live price every 2 s
  useEffect(() => {
    if (!live.price) return;
    const iv = setInterval(() => {
      const jitter = (Math.random() - 0.5) * live.price * 0.0002;
      const { ask: a, bid: b } = deriveQuote(live.price + jitter);
      sim.tickQuotes({ [symbol]: { ask: a, bid: b, last: live.price } });
    }, 2000);
    return () => clearInterval(iv);
  }, [symbol, live.price]);

  const handleSymbolChange = useCallback((s) => {
    setSymbol(s);
    setDepthClickPrice(null);
  }, []);

  const handleDepthClick = (price) => {
    setDepthClickPrice(price);
    setSideTab('order');
  };

  return (
    <div className="flex flex-col bg-[#05070d] text-slate-100" style={{ height: 'calc(100vh - 108px)' }}>

      {/* ── Top header ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(148,163,184,0.08)] bg-[#0b0f1a] flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Activity className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Crypto</span>
        </div>
        <div className="w-px self-stretch mx-1" style={{ background: 'rgba(148,163,184,0.07)' }} />

        <SymbolPicker active={symbol} onChange={handleSymbolChange} />

        {/* Price */}
        <div className="ml-auto text-right flex-shrink-0">
          <p className={`text-base font-black font-mono ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {live.price ? fmtPrice(live.price, symbol) : '—'}
          </p>
          <p className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {positive ? '+' : ''}{live.change?.toFixed(2) ?? '0.00'}%
          </p>
        </div>
      </div>

      {/* Bid/Ask bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)] overflow-x-auto scrollbar-none flex-shrink-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <p className="text-[8px] text-slate-600 uppercase">Bid</p>
            <p className="text-[11px] font-black text-red-400">{bid ? fmtPrice(bid, symbol) : '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-slate-600 uppercase">Ask</p>
            <p className="text-[11px] font-black text-emerald-400">{ask ? fmtPrice(ask, symbol) : '—'}</p>
          </div>
        </div>
        {[
          { label: 'High',  value: live.high  ? fmtPrice(live.high,  symbol) : '—' },
          { label: 'Low',   value: live.low   ? fmtPrice(live.low,   symbol) : '—' },
          { label: 'Positions', value: sim.positions.length },
          { label: 'Float PnL', value: `${sim.unrealizedPnl >= 0 ? '+' : ''}$${sim.unrealizedPnl.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="flex-shrink-0">
            <p className="text-[8px] text-slate-600">{s.label}</p>
            <p className={`text-[10px] font-semibold ${s.label === 'Float PnL' ? (sim.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-300'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <TradingStatusBar
        wsStatus="connected"
        hasQuote={!!live.price}
        symbol={`${symbol}/USDT`}
        price={live.price}
        priceSource="MarketData"
      />

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Chart area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <TradingViewChart symbol={symbol} autoFill={true} />
          </div>
          {/* Active position chips */}
          <PositionChips positions={sim.positions} onClose={sim.closePosition} symbol={symbol} />
        </div>

        {/* Right panel */}
        <div className="w-52 border-l border-[rgba(148,163,184,0.08)] flex flex-col overflow-hidden flex-shrink-0">
          {/* Tab switcher */}
          <div className="grid grid-cols-3 border-b border-[rgba(148,163,184,0.08)] flex-shrink-0">
            {SIDE_TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setSideTab(t.id)}
                  className={`py-2 flex flex-col items-center gap-0.5 transition-all ${sideTab === t.id ? 'bg-[#151c2e] text-[#00d4aa] border-b-2 border-[#00d4aa]' : 'text-slate-600 hover:text-slate-400'}`}>
                  <Icon className="w-3 h-3" />
                  <span className="text-[7px] font-bold">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none">
            {sideTab === 'order' && (
              <CryptoOrderPanel
                symbol={symbol}
                ask={ask}
                bid={bid}
                onSubmit={sim.submitOrder}
                externalPrice={depthClickPrice}
              />
            )}
            {sideTab === 'depth' && (
              <MarketDepthPanel ask={ask} bid={bid} onPriceClick={handleDepthClick} />
            )}
            {sideTab === 'news' && (
              <div className="p-2">
                <TradeNewsPanel symbol={symbol} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom tabs ── */}
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

      <ExecutionToasts toasts={toasts} />
    </div>
  );
}