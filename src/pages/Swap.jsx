import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowDownUp, ChevronDown, Info, Zap, Clock, TrendingUp, X, Search } from 'lucide-react';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { useLang } from '../components/shared/LanguageContext';
import { useSOFPrice } from '../components/shared/useSOFPrice';
import { getMarketBySymbol } from '../components/shared/MarketData';

const SWAP_ASSETS = [
  // Crypto Spot
  { symbol: 'SOL',    name: 'Solana',               category: 'crypto',  assetType: 'Crypto Spot',        icon: '◎',  color: '#9945FF' },
  { symbol: 'BTC',    name: 'Bitcoin',              category: 'crypto',  assetType: 'Crypto Spot',        icon: '₿',  color: '#F7931A' },
  { symbol: 'ETH',    name: 'Ethereum',             category: 'crypto',  assetType: 'Crypto Spot',        icon: 'Ξ',  color: '#627EEA' },
  { symbol: 'JUP',    name: 'Jupiter',              category: 'crypto',  assetType: 'Crypto Spot',        icon: 'J',  color: '#00BFFF' },
  { symbol: 'RNDR',   name: 'Render',               category: 'crypto',  assetType: 'Crypto Spot',        icon: 'R',  color: '#FF4D4D' },
  { symbol: 'BONK',   name: 'Bonk',                 category: 'crypto',  assetType: 'Crypto Spot',        icon: '🐶', color: '#F0A500' },
  // SOFDex native
  { symbol: 'SOF',    name: 'SolFort Token',        category: 'sof',     assetType: 'SOFDex Native',      icon: 'SF', color: '#00d4aa' },
  // Stablecoins
  { symbol: 'USDT',   name: 'Tether USD',           category: 'stable',  assetType: 'Stablecoin',         icon: '₮',  color: '#26A17B' },
  { symbol: 'USDC',   name: 'USD Coin',             category: 'stable',  assetType: 'Stablecoin',         icon: '$',  color: '#2775CA' },
  // RWA
  { symbol: 'GOLD-T', name: 'Tokenized Gold',       category: 'rwa',     assetType: 'RWA · Commodity',    icon: '🥇', color: '#FFD700' },
  { symbol: 'TBILL',  name: 'US Treasury Bill',     category: 'rwa',     assetType: 'RWA · Treasury',     icon: '🏛',  color: '#4CAF50' },
  { symbol: 'RE-NYC', name: 'NYC Real Estate Fund', category: 'rwa',     assetType: 'RWA · Real Estate',  icon: '🏙',  color: '#9B59B6' },
  { symbol: 'SP500-T',name: 'S&P 500 Tokenized',   category: 'rwa',     assetType: 'RWA · Equity',       icon: '📈', color: '#3B82F6' },
  // xStocks
  { symbol: 'AAPLx',  name: 'Apple (xStock)',       category: 'xstock',  assetType: 'Tokenized Equity',   icon: '🍎', color: '#60a5fa' },
  { symbol: 'TSLAx',  name: 'Tesla (xStock)',       category: 'xstock',  assetType: 'Tokenized Equity',   icon: 'T',  color: '#CC0000' },
  { symbol: 'NVDAx',  name: 'NVIDIA (xStock)',      category: 'xstock',  assetType: 'Tokenized Equity',   icon: 'N',  color: '#76b900' },
  { symbol: 'SPYx',   name: 'S&P 500 ETF (xETF)',  category: 'xstock',  assetType: 'Tokenized ETF',      icon: '📊', color: '#8b5cf6' },
  { symbol: 'GLDx',   name: 'Gold ETF (xETF)',     category: 'xstock',  assetType: 'Tokenized ETF',      icon: '🥇', color: '#FFD700' },
];

const STABLE_SYMBOLS = ['USDT', 'USDC'];

const RECENT_PAIRS = [
  { from: 'SOL',   to: 'USDT' },
  { from: 'BTC',   to: 'USDT' },
  { from: 'SOF',   to: 'USDT' },
  { from: 'AAPLx', to: 'USDT' },
  { from: 'GLDx',  to: 'USDC' },
];

const CATEGORY_COLORS = {
  crypto: 'text-[#00d4aa]',
  stable: 'text-emerald-400',
  rwa:    'text-purple-400',
  sof:    'text-[#00d4aa]',
};

const CATEGORY_LABELS = {
  crypto:  'Crypto Spot',
  stable:  'Stablecoin',
  rwa:     'RWA',
  sof:     'SOFDex',
  xstock:  'Tokenized',
};

function AssetIcon({ asset, size = 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: `${asset.color}22`, border: `1px solid ${asset.color}44`, color: asset.color }}
    >
      {asset.icon}
    </div>
  );
}

function AssetSelector({ selected, onChange, exclude }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = SWAP_ASSETS.filter(a =>
    a.symbol !== exclude &&
    (a.symbol.toLowerCase().includes(search.toLowerCase()) ||
     a.name.toLowerCase().includes(search.toLowerCase()))
  );
  const grouped = ['sof', 'crypto', 'rwa', 'xstock', 'stable'].map(cat => ({
    cat,
    items: filtered.filter(a => a.category === cat),
  })).filter(g => g.items.length);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#1a2340] hover:bg-[#1e2845] border border-[rgba(148,163,184,0.12)] rounded-2xl px-3 py-2 transition-all"
      >
        <AssetIcon asset={selected} />
        <div className="text-left">
          <p className="text-sm font-bold text-white leading-none">{selected.symbol}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[70px]">{selected.name}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg mx-auto bg-[#0d1220] border border-[rgba(148,163,184,0.1)] rounded-t-3xl overflow-hidden" style={{ maxHeight: '75vh' }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
              <p className="text-sm font-bold text-white">Select Asset</p>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-[#1a2340] flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-2">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto pb-6" style={{ maxHeight: 'calc(75vh - 120px)' }}>
              {grouped.map(({ cat, items }) => (
                <div key={cat}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{CATEGORY_LABELS[cat]}</p>
                  {items.map(asset => (
                    <button
                      key={asset.symbol}
                      onClick={() => { onChange(asset); setOpen(false); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#151c2e] transition-all ${selected.symbol === asset.symbol ? 'bg-[#00d4aa]/05' : ''}`}
                    >
                      <AssetIcon asset={asset} size="sm" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                        <p className="text-[10px] text-slate-500">{asset.name}</p>
                        {asset.assetType && <p className="text-[9px] text-slate-600">{asset.assetType}</p>}
                      </div>
                      <span className={`text-[10px] font-medium ${CATEGORY_COLORS[asset.category]}`}>{CATEGORY_LABELS[asset.category]}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Swap() {
  const { t } = useLang();
  const { getLiveAsset } = useMarketData();
  const sofLive = useSOFPrice();

  const [fromAsset, setFromAsset] = useState(SWAP_ASSETS.find(a => a.symbol === 'SOL'));
  const [toAsset, setToAsset] = useState(SWAP_ASSETS.find(a => a.symbol === 'USDT'));
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [swapped, setSwapped] = useState(false);

  const getPrice = useCallback((asset) => {
    if (STABLE_SYMBOLS.includes(asset.symbol)) return 1;
    if (asset.symbol === 'SOF') return sofLive.price || 0.0001;
    const live = getLiveAsset?.(asset.symbol);
    if (live?.price) return live.price;
    // fallback static prices
    const fallbacks = {
      SOL: 187.42, BTC: 98425.5, ETH: 3842.18, JUP: 1.24,
      RNDR: 8.92, BONK: 0.0000234,
      'GOLD-T': 2341.80, TBILL: 100.24, 'RE-NYC': 52.40,
      'SP500-T': 5842.30, 'TSLA-T': 248.90,
      AAPLx: 227.50, TSLAx: 248.90, NVDAx: 892.40, SPYx: 584.20, GLDx: 232.40,
    };
    return fallbacks[asset.symbol] ?? 1;
  }, [getLiveAsset]);

  const fromPrice = getPrice(fromAsset);
  const toPrice = getPrice(toAsset);
  const rate = toPrice > 0 ? fromPrice / toPrice : 0;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(toPrice < 0.001 ? 8 : toPrice < 1 ? 6 : 2) : '';
  const priceImpact = fromAmount && parseFloat(fromAmount) > 0
    ? Math.min(parseFloat(fromAmount) * fromPrice * 0.00002, 2.5).toFixed(3)
    : '0.000';

  const handleSwapAssets = () => {
    const tmp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tmp);
    setFromAmount(toAmount || '');
    setSwapped(s => !s);
  };

  const handleExecute = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    alert(`Swap ${fromAmount} ${fromAsset.symbol} → ${toAmount} ${toAsset.symbol}\n\nThis is a demo swap.`);
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Swap</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Instant multi-asset swaps on Solana</p>
        </div>
        <Link to={createPageUrl('SolFort')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-semibold hover:bg-[#00d4aa]/15 transition-all">
          <span className="text-[9px] font-black bg-[#00d4aa]/20 rounded-md px-1 py-0.5">SF</span>
          SOLFORT
        </Link>
      </div>

      {/* Swap Card */}
      <div className="glass-card glow-border rounded-2xl overflow-hidden">
        {/* FROM */}
        <div className="p-4 border-b border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">From</span>
            <span className="text-[11px] text-slate-600">Balance: — </span>
          </div>
          <div className="flex items-center gap-3">
            <AssetSelector selected={fromAsset} onChange={setFromAsset} exclude={toAsset.symbol} />
            <div className="flex-1 text-right">
              <input
                type="number"
                value={fromAmount}
                onChange={e => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold text-white text-right outline-none placeholder-slate-700"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                ≈ ${fromAmount && !isNaN(fromAmount) ? (parseFloat(fromAmount) * fromPrice).toLocaleString('en', { maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3">
            {['25%', '50%', '75%', 'MAX'].map(pct => (
              <button key={pct} className="text-[10px] px-2 py-1 rounded-lg bg-[#1a2340] text-slate-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/10 transition-all font-medium">
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Swap direction button */}
        <div className="flex items-center justify-center py-2 relative">
          <div className="absolute left-0 right-0 h-px bg-[rgba(148,163,184,0.06)]" />
          <button
            onClick={handleSwapAssets}
            className="relative w-9 h-9 rounded-xl bg-[#151c2e] border border-[rgba(0,212,170,0.2)] flex items-center justify-center hover:bg-[#00d4aa]/10 transition-all group"
          >
            <ArrowDownUp className="w-4 h-4 text-[#00d4aa] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* TO */}
        <div className="p-4 border-t border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">To (estimated)</span>
            <span className="text-[11px] text-slate-600">Balance: —</span>
          </div>
          <div className="flex items-center gap-3">
            <AssetSelector selected={toAsset} onChange={setToAsset} exclude={fromAsset.symbol} />
            <div className="flex-1 text-right">
              <p className="text-2xl font-bold text-[#00d4aa]">
                {toAmount || <span className="text-slate-700">0.00</span>}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ≈ ${toAmount && !isNaN(toAmount) ? (parseFloat(toAmount) * toPrice).toLocaleString('en', { maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between border border-[rgba(148,163,184,0.04)]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="text-[11px] text-slate-400 font-medium">Rate</span>
        </div>
        <span className="text-[11px] text-slate-300 font-semibold">
          1 {fromAsset.symbol} ≈ {rate > 0 ? (rate < 0.0001 ? rate.toExponential(4) : rate < 1 ? rate.toFixed(6) : rate.toFixed(4)) : '—'} {toAsset.symbol}
        </span>
      </div>

      {/* Swap Details */}
      {fromAmount && parseFloat(fromAmount) > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2.5 border border-[rgba(148,163,184,0.04)]">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Swap Details</p>
          {[
            ['Price Impact', `${priceImpact}%`, parseFloat(priceImpact) > 1 ? 'text-amber-400' : 'text-emerald-400'],
            ['Slippage Tolerance', `${slippage}%`, 'text-slate-300'],
            ['Min. Received', `${toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(4) : '—'} ${toAsset.symbol}`, 'text-slate-300'],
            ['Route', `${fromAsset.symbol} → ${toAsset.symbol}`, 'text-slate-300'],
          ].map(([label, value, cls]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{label}</span>
              <span className={`text-[11px] font-semibold ${cls}`}>{value}</span>
            </div>
          ))}

          {/* Slippage buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-600 mr-1">Slippage:</span>
            {[0.1, 0.5, 1.0, 3.0].map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all ${
                  slippage === s ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'bg-[#1a2340] text-slate-500'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleExecute}
        disabled={!fromAmount || parseFloat(fromAmount) <= 0}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          fromAmount && parseFloat(fromAmount) > 0
            ? 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white hover:opacity-90 active:scale-[0.98]'
            : 'bg-[#151c2e] text-slate-600 cursor-not-allowed'
        }`}
      >
        {!fromAmount || parseFloat(fromAmount) <= 0 ? 'Enter Amount' : `Swap ${fromAsset.symbol} → ${toAsset.symbol}`}
      </button>

      {/* Recent Pairs */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">Recent Pairs</p>
        <div className="flex flex-wrap gap-2">
          {RECENT_PAIRS.map((pair, i) => {
            const fa = SWAP_ASSETS.find(a => a.symbol === pair.from);
            const ta = SWAP_ASSETS.find(a => a.symbol === pair.to);
            return (
              <button
                key={i}
                onClick={() => { setFromAsset(fa); setToAsset(ta); setFromAmount(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.06)] text-xs text-slate-400 hover:text-white hover:border-[#00d4aa]/20 transition-all"
              >
                <span style={{ color: fa.color }}>{fa.symbol}</span>
                <ArrowDownUp className="w-2.5 h-2.5 text-slate-600" />
                <span style={{ color: ta.color }}>{ta.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}