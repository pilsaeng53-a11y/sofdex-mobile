import React, { useState } from 'react';
import { useMarketData } from '../components/shared/MarketDataProvider';
import LiveMarketStatsBar  from '../components/trade/LiveMarketStatsBar';
import ChartContainer      from '../components/trade/ChartContainer';
import OrderBook           from '../components/trade/OrderBook';
import RecentTrades        from '../components/trade/RecentTrades';
import OrderPanel          from '../components/trade/OrderPanel';
import TradingBottomPanel  from '../components/trade/TradingBottomPanel';
import { BarChart2, BookOpen, ArrowDownUp, LayoutGrid } from 'lucide-react';
import OrderlyDebugPanel from '../components/trade/OrderlyDebugPanel';

// ─── Symbol selector pill ─────────────────────────────────────────────────────
const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

function SymbolSelector({ active, onChange }) {
  return (
    <div
      className="flex items-center gap-1 px-1 py-1 rounded-xl overflow-x-auto scrollbar-none"
      style={{ background: 'rgba(4,6,14,0.85)', border: '1px solid rgba(148,163,184,0.07)' }}
    >
      {SYMBOLS.map(s => {
        const on = active === s;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all duration-150 flex-shrink-0"
            style={on ? {
              background: 'rgba(0,212,170,0.12)',
              color: '#00d4aa',
              border: '1px solid rgba(0,212,170,0.22)',
            } : { color: '#3d4f6b', border: '1px solid transparent' }}
          >
            {s}/USDT
          </button>
        );
      })}
    </div>
  );
}

// ─── Right panel tab switcher (OrderBook ↔ RecentTrades) ─────────────────────
const SIDE_TABS = [
  { id: 'book',   label: 'Book',   Icon: BookOpen },
  { id: 'trades', label: 'Trades', Icon: ArrowDownUp },
  { id: 'both',   label: 'Both',   Icon: LayoutGrid },
];

function SideTabs({ active, onChange }) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(4,6,14,0.85)', border: '1px solid rgba(148,163,184,0.07)' }}
    >
      {SIDE_TABS.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[9.5px] font-black transition-all duration-150 whitespace-nowrap"
            style={on ? {
              background: 'rgba(0,212,170,0.1)',
              color: '#00d4aa',
            } : { color: '#2a3348' }}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function TradingDesk() {
  const [symbol,       setSymbol]       = useState('BTC');
  const [sideTab,      setSideTab]      = useState('both');
  const [orderPrice,   setOrderPrice]   = useState(null);

  const { getLiveAsset } = useMarketData();
  const asset = getLiveAsset(symbol);

  const handleBookPriceClick = (price) => setOrderPrice(price);

  const showBook   = sideTab === 'book'   || sideTab === 'both';
  const showTrades = sideTab === 'trades' || sideTab === 'both';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#05070d', color: '#f1f5f9' }}
    >
      {/* ── Top bar: symbol selector ── */}
      <div
        className="sticky top-0 z-20 px-3 py-2 border-b flex items-center gap-2.5 flex-wrap"
        style={{
          background: 'rgba(5,7,13,0.97)',
          borderColor: 'rgba(148,163,184,0.06)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 1px 0 rgba(148,163,184,0.04), 0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <BarChart2 className="w-3.5 h-3.5" style={{ color: '#00d4aa' }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#3d4f6b' }}>
            Futures
          </span>
        </div>
        <div className="w-px self-stretch" style={{ background: 'rgba(148,163,184,0.07)' }} />
        <SymbolSelector active={symbol} onChange={s => { setSymbol(s); setOrderPrice(null); }} />
        <div className="ml-auto">
          <SideTabs active={sideTab} onChange={setSideTab} />
        </div>
      </div>

      {/* ── Market stats bar ── */}
      <div className="px-3 pt-3">
        <LiveMarketStatsBar symbol={symbol} />
      </div>

      {/* ── Main grid: Chart + Side panel (desktop) ── */}
      <div className="flex flex-col lg:flex-row gap-3 px-3 pt-3 flex-1 min-h-0">

        {/* Chart — takes remaining width */}
        <div className="flex-1 min-w-0">
          <ChartContainer symbol={symbol} />
        </div>

        {/* Side panel: OrderBook / RecentTrades / Both */}
        <div
          className="flex flex-col gap-3 w-full lg:w-[220px] xl:w-[240px] flex-shrink-0"
        >
          {showBook && (
            <div className={showTrades ? '' : 'flex-1'}>
              <OrderBook symbol={symbol} onPriceClick={handleBookPriceClick} />
            </div>
          )}
          {showTrades && (
            <div className={showBook ? '' : 'flex-1'}>
              <RecentTrades symbol={symbol} />
            </div>
          )}
        </div>
      </div>

      {/* ── Order panel (full width on mobile, right column on desktop) ── */}
      <div className="px-3 pt-3 lg:hidden">
        <OrderPanel
          asset={{ symbol, price: asset?.price ?? 0, maxLeverage: 100 }}
          externalPrice={orderPrice}
        />
      </div>

      {/* Desktop: order panel floats alongside bottom panel */}
      <div className="hidden lg:flex gap-3 px-3 pt-3">
        {/* Bottom account panel — takes most of the width */}
        <div className="flex-1 min-w-0">
          <TradingBottomPanel />
        </div>
        {/* Order panel — fixed right width */}
        <div className="w-[220px] xl:w-[240px] flex-shrink-0">
          <OrderPanel
            asset={{ symbol, price: asset?.price ?? 0, maxLeverage: 100 }}
            externalPrice={orderPrice}
          />
        </div>
      </div>

      {/* Mobile: bottom panel below order panel */}
      <div className="px-3 pt-3 pb-6 lg:hidden">
        <TradingBottomPanel />
      </div>

      {/* Bottom breathing room */}
      <div className="h-4" />
    </div>
  );
}