import React, { useState } from 'react';
import React, { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Zap, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from './LanguageContext';
import { useChartPrice } from './useChartPrice';
import { formatSOFPrice } from './useSOFPrice';
import { formatPrice } from './MarketData';

// Static metadata for hot assets — price/change come from live engine
const HOT_ASSET_META = [
  {
    symbol: 'SOF', name: 'SolFort Token',
    reason: 'Native SOFDex platform token. Governance, fee discounts, staking rewards, and launchpad access utility.',
    tag: 'Platform Token', tagColor: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
    icon: 'SF', iconBg: 'bg-[#00d4aa]/20',
  },
  {
    symbol: 'SOL', name: 'Solana',
    reason: 'Unusual trading volume spike detected. Whale accumulation pattern forming with 3x normal inflow.',
    tag: 'Whale Activity', tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    icon: '◎', iconBg: 'bg-purple-500/20',
  },
  {
    symbol: 'BTC', name: 'Bitcoin',
    reason: 'Institutional accumulation detected. ETF inflows at multi-week highs.',
    tag: 'Inst. Buying', tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    icon: '₿', iconBg: 'bg-amber-500/20',
  },
  {
    symbol: 'JUP', name: 'Jupiter',
    reason: 'Elevated momentum on Solana DEX. High volume and positive social signals.',
    tag: 'Price Spike', tagColor: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
    icon: 'J', iconBg: 'bg-[#00d4aa]/20',
  },
  {
    symbol: 'RNDR', name: 'Render',
    reason: 'AI narrative momentum continuing. GPU compute demand driving unusual volume surge.',
    tag: 'AI Narrative', tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    icon: 'R', iconBg: 'bg-blue-500/20',
  },
];

const HOT_SYMBOLS = HOT_ASSET_META.map(a => a.symbol);

// Tiny sparkline bar chart using live sparkline data
function MiniSparkline({ data, change }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const color = change >= 0 ? '#22c55e' : '#ef4444';
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 16 - ((v - min) / range) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="18" className="flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HotAssets({ compact = false }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-white">{t('hot_assets') || 'Hot Assets'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot" />
        </div>
        <Link to="/Markets" className="text-xs text-slate-500 hover:text-[#00d4aa] flex items-center gap-1 transition-colors">
          {t('common_viewAll') || 'View All'} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-[rgba(148,163,184,0.04)]">
        {HOT_ASSET_META.slice(0, compact ? 3 : 5).map((asset, i) => (
          <HotAssetItem key={asset.symbol} asset={asset} index={i} expanded={expanded} setExpanded={setExpanded} />
        ))}


      </div>
    </div>
  );
}

function HotAssetItem({ asset, index, expanded, setExpanded }) {
  // **CHART PRICE IS MASTER** for Hot Assets display
  const { price, change24h, isLive } = useChartPrice(asset.symbol);
  const displayPrice = price;
  const displayChange = change24h ?? 0;

  return (
    <div>
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a2340]/50 transition-colors text-left"
        onClick={() => setExpanded(expanded === index ? null : index)}
      >
        <div className={`w-9 h-9 rounded-xl ${asset.iconBg} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
          {asset.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{asset.symbol}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-lg border ${asset.tagColor}`}>{asset.tag}</span>
          </div>
          <p className="text-xs text-slate-500 truncate">{asset.name}</p>
        </div>

        <div className="text-right flex-shrink-0">
         <p className="text-sm font-bold text-white">
           {displayPrice != null ? `$${asset.symbol === 'SOF' ? formatSOFPrice(displayPrice) : formatPrice(displayPrice)}` : '—'}
         </p>
          <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${displayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {displayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {displayChange >= 0 ? '+' : ''}{displayChange.toFixed(2)}%
          </div>
        </div>
      </button>

      {expanded === index && (
        <div className="px-4 pb-3 mx-4 mb-2 bg-[#0a0e1a] rounded-xl border border-[rgba(148,163,184,0.06)]">
          <div className="flex items-start gap-2 py-2.5">
            <Zap className="w-3.5 h-3.5 text-[#00d4aa] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">{asset.reason}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(148,163,184,0.06)]">
            <span className="text-[10px] text-slate-500">
              Live: <span className="text-[#00d4aa]">{isLive ? '●' : '○'}</span>
              {displayPrice != null && <span className="text-slate-300 ml-1">${asset.symbol === 'SOF' ? formatSOFPrice(displayPrice) : formatPriceUtil(displayPrice)}</span>}
            </span>
            <Link to={`/Trade?symbol=${asset.symbol}`} className="flex items-center gap-1 text-[10px] font-semibold text-[#00d4aa] hover:text-[#06b6d4]">
              <Eye className="w-3 h-3" /> Trade {asset.symbol}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}