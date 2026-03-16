import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart3, Search, TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { CRYPTO_MARKETS, RWA_MARKETS, TRADFI_MARKETS, formatPrice, formatChange } from '../components/shared/MarketData';
import { useMarketData } from '../components/shared/MarketDataProvider';
import { useChartPrice } from '../components/shared/useChartPrice';
import MiniChart from '../components/shared/MiniChart';

const TAB_KEYS = ['markets_all','markets_crypto','markets_rwa','markets_tradfi','markets_gainers','markets_losers','markets_volume','markets_watchlist'];
const TAB_VALUES = ['All','Crypto','RWA','TradFi','Gainers','Losers','Volume','Watchlist'];

function MarketRow({ asset, watchlist = [], onToggleWatch }) {
  // **CHART PRICE IS MASTER** for Markets list
  const { price, change24h } = useChartPrice(asset.symbol);
  const displayPrice = price ?? asset.price;
  const displayChange = change24h ?? asset.change;
  const positive  = displayChange >= 0;
  const isWatched = watchlist.includes(asset.symbol);

  return (
    <Link to={`${createPageUrl('MarketDetail')}?symbol=${asset.symbol}`}>
      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#151c2e] transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={(e) => onToggleWatch && onToggleWatch(asset.symbol, e)}
            className="flex-shrink-0"
          >
            <Star className={`w-3.5 h-3.5 transition-colors ${isWatched ? 'fill-amber-400 text-amber-400' : 'text-slate-700 hover:text-slate-500'}`} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-[#1a2340] flex items-center justify-center text-[10px] font-black text-[#00d4aa] flex-shrink-0">
            {asset.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{asset.symbol}</p>
            <p className="text-[10px] text-slate-500 truncate">{asset.name}</p>
          </div>
        </div>

        <div className="w-14 flex-shrink-0">
           <MiniChart data={null} positive={positive} />
         </div>

         <div className="text-right flex-shrink-0">
           <p className="text-sm font-bold text-white">${formatPrice(displayPrice)}</p>
           <div className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
             {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
             {formatChange(displayChange)}
           </div>
         </div>
      </div>
    </Link>
  );
}

const DEFAULT_WATCHLIST = ['BTC', 'ETH', 'SOL', 'GOLD-T', 'TBILL'];

export default function Markets() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const { getLiveAsset } = useMarketData();
  const { t } = useLang();

  const allAssets = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];

  const toggleWatch = (symbol, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchlist(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
  };

  const getFiltered = () => {
    let base = allAssets;
    if (tab === 'Crypto') base = CRYPTO_MARKETS;
    else if (tab === 'RWA') base = RWA_MARKETS;
    else if (tab === 'TradFi') base = TRADFI_MARKETS;
    else if (tab === 'Gainers') {
      base = [...allAssets].sort((a, b) => {
        const la = getLiveAsset(a.symbol), lb = getLiveAsset(b.symbol);
        return (lb.available ? lb.change : b.change) - (la.available ? la.change : a.change);
      }).slice(0, 10);
    } else if (tab === 'Losers') {
      base = [...allAssets].sort((a, b) => {
        const la = getLiveAsset(a.symbol), lb = getLiveAsset(b.symbol);
        return (la.available ? la.change : a.change) - (lb.available ? lb.change : b.change);
      }).slice(0, 10);
    } else if (tab === 'Volume') {
      base = [...CRYPTO_MARKETS].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
    } else if (tab === 'Watchlist') {
      base = allAssets.filter(a => watchlist.includes(a.symbol));
    }

    if (search) {
      base = base.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    return base;
  };

  const filtered = getFiltered();

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">{t('page_markets')}</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('markets_searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TAB_VALUES.map((tabVal, idx) => (
          <button
            key={tabVal}
            onClick={() => setTab(tabVal)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === tabVal ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {t(TAB_KEYS[idx])}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-slate-600 font-semibold border-b border-[rgba(148,163,184,0.06)]">
        <span>{t('markets_colAsset')}</span>
        <span>{t('markets_col7d')}</span>
        <span className="text-right">{t('markets_colPrice24h')}</span>
      </div>

      {/* Rows */}
      <div className="glass-card mx-4 mt-2 rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.05)]">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {tab === 'Watchlist' ? (
              <div>
                <StarOff className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p>{t('markets_noWatchlist')}</p>
                <p className="text-[11px] text-slate-600 mt-1">{t('markets_tapToAdd')}</p>
              </div>
            ) : t('markets_noResults')}
          </div>
        )}
        {filtered.map(asset => (
          <MarketRow key={asset.symbol} asset={asset} watchlist={watchlist} onToggleWatch={toggleWatch} />
        ))}
      </div>

      <div className="pb-6" />
    </div>
  );
}