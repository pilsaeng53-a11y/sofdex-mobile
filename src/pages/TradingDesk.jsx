import { useState } from 'react';
import { useOrderlyPrice } from '../hooks/useOrderlyPrice';
import { DEFAULT_SYMBOL, buildSymbolDescriptor } from '../lib/trading/symbols';
import LiveMarketStatsBar  from '../components/trade/LiveMarketStatsBar';
import ChartContainer      from '../components/trade/ChartContainer';
import OrderBook           from '../components/trade/OrderBook';
import RecentTrades        from '../components/trade/RecentTrades';
import OrderPanel          from '../components/trade/OrderPanel';
import TradingBottomPanel  from '../components/trade/TradingBottomPanel';
import SymbolDrawer        from '../components/trade/SymbolDrawer';
import OrderlyDebugPanel   from '../components/trade/OrderlyDebugPanel';
import TokenInfoCard       from '../components/trade/TokenInfoCard';
import CoinIcon            from '../components/shared/CoinIcon';
import { BarChart2, BookOpen, ArrowDownUp, LayoutGrid, ChevronDown } from 'lucide-react';

// ─── Active symbol pill (top-bar trigger) ──────────────────────────────────────
function ActiveSymbolPill({ base, quote, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl btn-press transition-all"
      style={{
        background: 'rgba(0,212,170,0.07)',
        border: '1px solid rgba(0,212,170,0.18)',
      }}
    >
      <CoinIcon symbol={base} size={18} />
      <span className="text-[13px] font-black text-white">
        {base}<span className="text-slate-500 font-medium">/{quote}</span>
      </span>
      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
    </button>
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
  // Active symbol state — now any Orderly symbol, not just a hardcoded list
  const [activeSymbol, setActiveSymbol] = useState({
    base: 'BTC', quote: 'USDC', orderlySymbol: 'PERP_BTC_USDC', displayName: 'BTC-USDC',
  });
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [sideTab,      setSideTab]      = useState('both');
  const [orderPrice,   setOrderPrice]   = useState(null);

  const symbol = activeSymbol.base;   // short key used by all hooks

  // Price for OrderPanel: exclusively from Orderly ticker (mark → last → index)
  // NOT from MarketDataProvider (Binance/CoinGecko) — that would pollute trading data
  const { ticker: orderlyTicker } = useTicker(symbol);
  const orderlyPrice = orderlyTicker?.markPrice ?? orderlyTicker?.lastPrice ?? orderlyTicker?.indexPrice ?? 0;

  function handleSymbolSelect(sym) {
    console.log(`[TradingDesk] Symbol switch: ${activeSymbol.base} → ${sym.base}`);
    setActiveSymbol(sym);
    setOrderPrice(null);
  }

  const showBook   = sideTab === 'book'   || sideTab === 'both';
  const showTrades = sideTab === 'trades' || sideTab === 'both';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#05070d', color: '#f1f5f9' }}
    >
      {/* ── Top bar ── */}
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

        {/* Active symbol trigger */}
        <ActiveSymbolPill
          base={activeSymbol.base}
          quote={activeSymbol.quote}
          onClick={() => setDrawerOpen(true)}
        />

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

        {/* Chart + Token Info — takes remaining width */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <ChartContainer symbol={symbol} />
          {/* Token metadata card — visually separated from trading data */}
          <TokenInfoCard base={activeSymbol.base} quote={activeSymbol.quote} />
        </div>

        {/* Side panel: OrderBook / RecentTrades / Both */}
        <div className="flex flex-col gap-3 w-full lg:w-[220px] xl:w-[240px] flex-shrink-0">
          {showBook && (
            <div className={showTrades ? '' : 'flex-1'}>
              <OrderBook symbol={symbol} onPriceClick={p => setOrderPrice(p)} />
            </div>
          )}
          {showTrades && (
            <div className={showBook ? '' : 'flex-1'}>
              <RecentTrades symbol={symbol} />
            </div>
          )}
        </div>
      </div>

      {/* ── Order panel (mobile) ── */}
      <div className="px-3 pt-3 lg:hidden">
        <OrderPanel
          asset={{ symbol, price: orderlyPrice, maxLeverage: 100 }}
          externalPrice={orderPrice}
        />
      </div>

      {/* ── Desktop: bottom panel + order panel ── */}
      <div className="hidden lg:flex gap-3 px-3 pt-3">
        <div className="flex-1 min-w-0">
          <TradingBottomPanel />
        </div>
        <div className="w-[220px] xl:w-[240px] flex-shrink-0">
          <OrderPanel
            asset={{ symbol, price: orderlyPrice, maxLeverage: 100 }}
            externalPrice={orderPrice}
          />
        </div>
      </div>

      {/* ── Mobile: bottom panel ── */}
      <div className="px-3 pt-3 pb-6 lg:hidden">
        <TradingBottomPanel />
      </div>

      <div className="h-4" />

      {/* ── Symbol drawer ── */}
      <SymbolDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeBase={activeSymbol.base}
        onSelect={handleSymbolSelect}
      />

      {/* ── Debug panel (hidden by default) ── */}
      <OrderlyDebugPanel />
    </div>
  );
}