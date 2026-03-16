import React, { useState } from 'react';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { ALL_MARKETS, CRYPTO_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import { useSOFPrice, formatSOFPrice } from '../components/shared/useSOFPrice';
import TradingViewChart from '../components/trade/TradingViewChart.jsx';
import AILeverageCard from '../components/trading/AILeverageCard';
import AIMarketPanel from '../components/shared/AIMarketPanel';
import OrderPanel from '../components/trade/OrderPanel';
import OrderBook from '../components/trade/OrderBook';
import RecentTrades from '../components/trade/RecentTrades';
import PositionsPanel from '../components/trade/PositionsPanel';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import PositionCalculator from '../components/trade/PositionCalculator.jsx';

export default function Trade() {
  const urlParams = new URLSearchParams(window.location.search);
  const [symbol, setSymbol] = useState(urlParams.get('symbol') || 'SOL');
  const [tab, setTab] = useState('Order');
  const [showPicker, setShowPicker] = useState(false);
  const { getLiveAsset } = useMarketData();
  const sofLive = useSOFPrice();

  const { t } = useLang();
  const baseAsset = ALL_MARKETS.find(a => a.symbol === symbol) || CRYPTO_MARKETS[0];
  const live = getLiveAsset(symbol);
  
  // SOF: use live DexScreener price, otherwise use live Binance or fallback to static
  let price, change;
  if (symbol === 'SOF') {
    price = sofLive.price || baseAsset.price;
    change = sofLive.change24h ?? baseAsset.change;
  } else {
    price = live.available ? live.price : baseAsset.price;
    change = live.available ? live.change : baseAsset.change;
  }
  const positive = change >= 0;

  // Deterministic funding rate from symbol (stable seed)
  const fundingVal = ((symbol.charCodeAt(0) % 10) - 4.5) * 0.003;
  const fundingPositive = fundingVal >= 0;

  // Deterministic long/short ratio from symbol
  const lsBase = ((symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0)) % 40) + 30;
  const longPct = lsBase;
  const shortPct = 100 - lsBase;

  // Open interest (deterministic seed based on symbol + price)
  const oiRaw = price * ((symbol.charCodeAt(0) % 8) + 4) * 12500;
  const formatOI = (v) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : `$${(v/1e6).toFixed(0)}M`;

  const h24High = (price * 1.028).toFixed(2);
  const h24Low = (price * 0.972).toFixed(2);

  return (
    <div className="min-h-screen">
      {/* Symbol header */}
      <div className="px-4 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowPicker(v => !v)}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1a2340] flex items-center justify-center text-[11px] font-black text-[#00d4aa]">
              {symbol.slice(0, 2)}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-white">{symbol}-PERP</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-[10px] text-slate-500">{t('trade_perpetual')} · {t('trade_upTo')} {baseAsset.leverage || '20x'}</span>
            </div>
          </button>

          <div className="text-right">
            <p className="text-lg font-bold text-white font-mono">${formatPrice(price)}</p>
            <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatChange(change)}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: t('trade_24hHigh'), value: `$${h24High}`, color: 'text-white' },
            { label: t('trade_24hLow'), value: `$${h24Low}`, color: 'text-white' },
            { label: t('trade_volume'), value: baseAsset.volume || '—', color: 'text-white' },
            { label: t('trade_funding'), value: `${fundingPositive ? '+' : ''}${fundingVal.toFixed(4)}%`, color: fundingPositive ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Open Int.', value: formatOI(oiRaw), color: 'text-white' },
            { label: 'L/S Ratio', value: `${longPct}/${shortPct}`, color: longPct >= 50 ? 'text-emerald-400' : 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="flex-shrink-0">
              <p className="text-[10px] text-slate-500">{stat.label}</p>
              <p className={`text-[11px] font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Long/Short ratio bar */}
        <div className="mt-2">
          <div className="flex rounded-full overflow-hidden h-1">
            <div className="bg-emerald-500 transition-all" style={{ width: `${longPct}%` }} />
            <div className="bg-red-500 flex-1" />
          </div>
          <div className="flex justify-between text-[9px] mt-0.5">
            <span className="text-emerald-400">Long {longPct}%</span>
            <span className="text-red-400">Short {shortPct}%</span>
          </div>
        </div>
      </div>

      {/* Symbol picker dropdown */}
      {showPicker && (
        <div className="mx-4 mt-1.5 glass-card rounded-xl border border-[rgba(148,163,184,0.1)] overflow-hidden">
          <div className="flex flex-wrap gap-1.5 p-3">
            {CRYPTO_MARKETS.map(m => (
              <button
                key={m.symbol}
                onClick={() => { setSymbol(m.symbol); setShowPicker(false); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  symbol === m.symbol
                    ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                    : 'bg-[#0d1220] text-slate-400 border border-transparent hover:text-white'
                }`}
              >
                {m.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-4 pt-3 pb-3">
        <TradingViewChart symbol={symbol} height={275} />
      </div>

      {/* AI Leverage Card */}
      <div className="px-4 pb-3">
        <AILeverageCard symbol={symbol} />
      </div>

      {/* AI Market Panel */}
      <div className="px-4 pb-3">
        <AIMarketPanel symbol={symbol} />
      </div>

      {/* Trade tabs */}
      <div className="flex px-4 gap-1 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { val: 'Order', label: 'Order' },
          { val: 'Orderbook', label: 'Book' },
          { val: 'Trades', label: 'Trades' },
          { val: 'Positions', label: 'Positions' },
          { val: 'Calculator', label: 'Calc' },
        ].map(item => (
          <button
            key={item.val}
            onClick={() => setTab(item.val)}
            className={`flex-shrink-0 flex-1 min-w-[52px] py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === item.val
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 bg-[#151c2e] border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pb-6">
        {tab === 'Order' && <OrderPanel asset={{ ...baseAsset, price, change, maxLeverage: baseAsset.maxLeverage }} />}
        {tab === 'Orderbook' && <OrderBook price={price} />}
        {tab === 'Trades' && <RecentTrades price={price} />}
        {tab === 'Positions' && <PositionsPanel />}
        {tab === 'Calculator' && <PositionCalculator price={price} symbol={symbol} maxLeverage={baseAsset.maxLeverage || 20} />}
      </div>
    </div>
  );
}