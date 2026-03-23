import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TRADING_ASSETS } from '@/data/futuresTradingAssets';
import { normalizeSymbol as normSym, rawToTVSymbol } from '../lib/trading/symbolMapper';
import useFuturesMarket from '../hooks/useFuturesMarket';
import useTradeSimulator from '../hooks/useTradeSimulator';
import {
  LayoutGrid, BookOpen, Activity, ChevronDown, Clock,
  BarChart2, Layers, Globe, Calculator, Menu, TrendingUp, TrendingDown
} from 'lucide-react';
import CoinIcon from '../components/shared/CoinIcon';
import CandleChart from '../components/futures/CandleChart';
import InstrumentSidebar from '../components/futures/InstrumentSidebar';
import FuturesOrderPanel from '../components/futures/FuturesOrderPanel';
import FuturesBottomPanel from '../components/futures/FuturesBottomPanel';
import TradeNewsPanel from '../components/trade/TradeNewsPanel';
import MarketDepthPanel from '../components/futures/MarketDepthPanel';
import { fmtPrice, fmtSpread } from '../lib/trading/priceFormat';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

// Fallback static prices — used only when API quote is unavailable
const FALLBACK_PRICES = {
  'EURUSD-T': { bid: 1.0870, ask: 1.0873, changePercent: 0.12, high: 1.0901, low: 1.0842, vol: '142.3B' },
  'USDJPY-T': { bid: 149.80, ask: 149.84, changePercent: -0.31, high: 150.22, low: 149.15, vol: '89.1B' },
  'GBPUSD-T': { bid: 1.2639, ask: 1.2643, changePercent: 0.08, high: 1.2701, low: 1.2598, vol: '67.5B' },
  'AUDUSD-T': { bid: 0.6510, ask: 0.6514, changePercent: -0.22, high: 0.6548, low: 0.6492, vol: '41.2B' },
  'GOLD-T':   { bid: 2340.5, ask: 2341.5, changePercent: 0.55, high: 2358.0, low: 2318.0, vol: '94.7B' },
  'OIL-T':    { bid: 78.30,  ask: 78.38,  changePercent: -1.12, high: 79.80, low: 77.50, vol: '32.1B' },
  'SILVER-T': { bid: 27.79,  ask: 27.83,  changePercent: 0.34, high: 28.10, low: 27.40, vol: '18.4B' },
  'SP500-T':  { bid: 5213.0, ask: 5215.2, changePercent: 1.08, high: 5224.0, low: 5180.0, vol: '312B' },
  'NASDAQ-T': { bid: 18315.0, ask: 18322.0, changePercent: 1.43, high: 18450.0, low: 18100.0, vol: '198B' },
  'BTC-PERP': { bid: 67380.0, ask: 67450.0, changePercent: 2.14, high: 68200.0, low: 65800.0, vol: '38.4B' },
  'ETH-PERP': { bid: 3538.0,  ask: 3542.0,  changePercent: 1.88, high: 3580.0, low: 3490.0, vol: '14.2B' },
  'SOL-PERP': { bid: 178.20,  ask: 178.50,  changePercent: 4.11, high: 182.0,  low: 170.0,  vol: '3.8B' },
};

const SIDE_PANEL_TABS = [
  { id: 'order',   icon: LayoutGrid,  label: 'Order' },
  { id: 'depth',   icon: Layers,      label: 'Depth' },
  { id: 'news',    icon: Globe,       label: 'News' },
  { id: 'calc',    icon: Calculator,  label: 'Calc' },
];

function RiskCalculatorPanel({ asset }) {
  const [balance, setBalance] = useState('10000');
  const [riskPct, setRiskPct] = useState('2');
  const [slPips, setSlPips] = useState('20');

  const riskAmt = parseFloat(balance) * parseFloat(riskPct) / 100;
  const pipVal = asset?.pip_value ?? 0.0001;
  const lotSize = asset?.lot_size ?? 100000;
  const lots = riskAmt / (parseFloat(slPips) * pipVal * lotSize);

  return (
    <div className="p-3 space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Risk Calculator</p>
      {[
        { label: 'Account Balance ($)', val: balance, set: setBalance },
        { label: 'Risk %', val: riskPct, set: setRiskPct },
        { label: 'SL (pips)', val: slPips, set: setSlPips },
      ].map(f => (
        <div key={f.label}>
          <label className="text-[9px] text-slate-500 block mb-1">{f.label}</label>
          <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
            className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4aa]/40" />
        </div>
      ))}
      <div className="bg-[#1a2340] rounded-xl p-3 space-y-1 border border-[rgba(148,163,184,0.06)]">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Risk Amount</span>
          <span className="text-amber-400 font-bold">${isNaN(riskAmt) ? '—' : riskAmt.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Position Size</span>
          <span className="text-[#00d4aa] font-bold">{isNaN(lots) || !isFinite(lots) ? '—' : lots.toFixed(2)} lots</span>
        </div>
      </div>
    </div>
  );
}

export default function FuturesTrade() {
  const urlParams = new URLSearchParams(window.location.search);
  const [symbol, setSymbol] = useState(urlParams.get('symbol') || 'EURUSD-T');
  const [showSidebar, setShowSidebar] = useState(false);
  const [timeframe, setTimeframe] = useState('1h');
  const [sideTab, setSideTab] = useState('order');
  const [bottomExpanded, setBottomExpanded] = useState(true);

  // ── Live market data (REST + WebSocket + Candles) ──
  const {
    selectedQuote, quotesMap, candles, liveCandle, loadingQuote, loadingCandles, wsStatus
  } = useFuturesMarket(symbol, timeframe);

  // ── Trading simulator ──
  const sim = useTradeSimulator();
  const [toasts, setToasts] = useState([]);
  const [depthClickPrice, setDepthClickPrice] = useState(null);

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Wire simulator events → toasts
  useEffect(() => {
    sim.setOnEvent((type, data) => {
      const p = (v, sym) => fmtPrice(v, sym ?? '');
      const pnlStr = (v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`;
      if (type === 'market_fill')    addToast(`✓ ${data.pos.side.toUpperCase()} ${data.pos.volume} lots @ ${p(data.entryPrice, data.pos.symbol)}`, 'success');
      if (type === 'pending_placed') addToast(`⏳ ${data.order.orderType} order placed @ ${p(data.order.limitPrice, data.order.symbol)}`, 'pending');
      if (type === 'pending_filled') addToast(`✓ ${data.order.side.toUpperCase()} filled @ ${p(data.fillPrice, data.order.symbol)}`, 'success');
      if (type === 'sl_triggered')   addToast(`🛑 SL hit · ${data.pos.symbol} · ${pnlStr(data.pnl)}`, 'danger');
      if (type === 'tp_triggered')   addToast(`🎯 TP hit · ${data.pos.symbol} · ${pnlStr(data.pnl)}`, 'success');
      if (type === 'liquidated')     addToast(`⚡ LIQUIDATED ${data.pos.symbol} · ${pnlStr(data.pnl)}`, 'danger');
      if (type === 'position_closed') addToast(`Closed ${data.pos.symbol} · ${pnlStr(data.pnl)}`, 'info');
      if (type === 'order_cancelled') addToast('Order cancelled', 'info');
    });
  }, []);

  // Tick simulator on every quote update
  useEffect(() => {
    if (Object.keys(quotesMap).length > 0) sim.tickQuotes(quotesMap);
  }, [quotesMap]);

  const allAssets = useMemo(() => Object.values(TRADING_ASSETS).flat(), []);
  const asset = allAssets.find(a => a.symbol === symbol) || allAssets[0];

  // Merge live quote with fallback static data
  const fb = FALLBACK_PRICES[symbol] || {};
  const mp = {
    bid:           selectedQuote?.bid           ?? fb.bid   ?? null,
    ask:           selectedQuote?.ask           ?? fb.ask   ?? null,
    last:          selectedQuote?.last          ?? selectedQuote?.ask ?? fb.ask ?? null,
    changePercent: selectedQuote?.changePercent ?? fb.changePercent ?? 0,
    high:          selectedQuote?.high          ?? fb.high  ?? null,
    low:           selectedQuote?.low           ?? fb.low   ?? null,
    vol:           selectedQuote?.volume        ?? fb.vol   ?? '—',
    spread:        selectedQuote?.spread        ?? null,
  };

  const baseSymbol = normSym(symbol);     // e.g. 'EURUSD', 'BTC'
  const tvSymbol   = rawToTVSymbol(symbol); // e.g. 'FX:EURUSD', 'BINANCE:BTCUSDT'
  const positive   = mp.changePercent >= 0;

  return (
    <div className="flex flex-col bg-[#05070d] text-slate-100" style={{ height: 'calc(100vh - 108px)' }}>

      {/* ── Top Header ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(148,163,184,0.08)] bg-[#0b0f1a] flex-shrink-0">
        {/* Sidebar toggle */}
        <button onClick={() => setShowSidebar(v => !v)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] flex items-center justify-center hover:border-[#00d4aa]/20 transition-all flex-shrink-0">
          <Menu className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Symbol info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#1a2340] flex items-center justify-center overflow-hidden flex-shrink-0">
            <CoinIcon symbol={baseSymbol} size={28} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-white">{symbol}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-500">{asset.name}</span>
          </div>
        </div>

        {/* Live price + WS status */}
        <div className="text-right flex-shrink-0">
          {loadingQuote ? (
            <div className="w-16 h-4 bg-[#1a2340] rounded animate-pulse mb-1" />
          ) : (
            <p className={`text-base font-black ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmtPrice(mp.ask, symbol)}
            </p>
          )}
          <div className="flex items-center gap-1 justify-end">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${wsStatus === 'connected' ? 'bg-emerald-400' : wsStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
            <p className={`text-[10px] font-bold flex items-center gap-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {positive ? '+' : ''}{mp.changePercent?.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* ── BID/ASK + Stats bar ── */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)] overflow-x-auto scrollbar-none flex-shrink-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <p className="text-[8px] text-slate-600 uppercase">Bid</p>
            {loadingQuote
              ? <div className="w-12 h-3 bg-[#1a2340] rounded animate-pulse mt-0.5" />
              : <p className="text-[11px] font-black text-red-400">{fmtPrice(mp.bid, symbol)}</p>
            }
          </div>
          <div className="text-[8px] text-slate-600 font-mono">
            {fmtSpread(mp.ask, mp.bid, symbol)}<br/>
            <span className="text-[7px]">spread</span>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-slate-600 uppercase">Ask</p>
            {loadingQuote
              ? <div className="w-12 h-3 bg-[#1a2340] rounded animate-pulse mt-0.5" />
              : <p className="text-[11px] font-black text-emerald-400">{fmtPrice(mp.ask, symbol)}</p>
            }
          </div>
        </div>
        {[
          { label: 'High', value: fmtPrice(mp.high, symbol) },
          { label: 'Low',  value: fmtPrice(mp.low,  symbol) },
          { label: 'Vol',  value: mp.vol },
          { label: 'Swap', value: '0.02%' },
          { label: 'Lots', value: asset.lot_size?.toLocaleString() ?? '—' },
        ].map(s => (
          <div key={s.label} className="flex-shrink-0">
            <p className="text-[8px] text-slate-600">{s.label}</p>
            <p className="text-[10px] font-semibold text-slate-300">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Instrument sidebar overlay */}
        {showSidebar && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowSidebar(false)} />
            <div className="absolute left-0 top-0 bottom-0 z-40 w-52 shadow-2xl" style={{ top: 'auto', position: 'relative' }}>
              <InstrumentSidebar
                selectedSymbol={symbol}
                onSelect={sym => { setSymbol(sym); setShowSidebar(false); }}
                onClose={() => setShowSidebar(false)}
              />
            </div>
          </>
        )}

        {/* Chart area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Timeframe + tools */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[rgba(148,163,184,0.06)] bg-[#0b0f1a] overflow-x-auto scrollbar-none flex-shrink-0">
            <Clock className="w-3 h-3 text-slate-600 flex-shrink-0" />
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-bold transition-all ${timeframe === tf ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
                {tf}
              </button>
            ))}
            <div className="h-4 w-px bg-[rgba(148,163,184,0.1)] mx-1 flex-shrink-0" />
            {[BarChart2, Activity].map((Icon, i) => (
              <button key={i} className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-[#151c2e] transition-all">
                <Icon className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Backend-driven candlestick chart */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <CandleChart
              candles={candles}
              liveCandle={liveCandle}
              loading={loadingCandles}
              lastPrice={mp.last ?? mp.ask ?? mp.bid}
              symbol={baseSymbol}
              interval={timeframe}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-52 border-l border-[rgba(148,163,184,0.08)] flex flex-col overflow-hidden flex-shrink-0">
          {/* Side panel tab switcher */}
          <div className="grid grid-cols-4 border-b border-[rgba(148,163,184,0.08)] flex-shrink-0">
            {SIDE_PANEL_TABS.map(t => {
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
              <FuturesOrderPanel
                asset={asset}
                symbol={symbol}
                askPrice={mp.ask}
                bidPrice={mp.bid}
                loading={loadingQuote}
                onSubmit={sim.submitOrder}
                externalLimitPrice={depthClickPrice}
              />
            )}
            {sideTab === 'depth' && (
              <MarketDepthPanel
                ask={mp.ask}
                bid={mp.bid}
                onPriceClick={(price) => {
                  setDepthClickPrice(price);
                  setSideTab('order');
                }}
              />
            )}
            {sideTab === 'news' && (
              <div className="p-2">
                <TradeNewsPanel symbol={baseSymbol} />
              </div>
            )}
            {sideTab === 'calc' && (
              <RiskCalculatorPanel asset={asset} />
            )}
          </div>
        </div>
      </div>

      {/* ── Execution Toasts ── */}
      <div className="fixed bottom-24 right-3 z-50 flex flex-col gap-1.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded-xl text-[11px] font-bold shadow-2xl border backdrop-blur-md animate-fadeIn ${
            t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            : t.type === 'danger'  ? 'bg-red-950/90 border-red-500/30 text-red-300'
            : t.type === 'pending' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300'
            : 'bg-[#0f1525]/90 border-[rgba(148,163,184,0.15)] text-slate-300'
          }`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Bottom panel ── */}
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
  );
}