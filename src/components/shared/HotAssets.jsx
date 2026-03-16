import React, { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Zap, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from './LanguageContext';

const HOT_ASSETS = [
  {
    symbol: 'SOL', name: 'Solana', price: 187.42, change: +14.8, vol: '4.2B',
    reason: 'Unusual trading volume spike detected. Whale accumulation pattern forming with 3x normal inflow.',
    tag: 'Whale Activity', tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    icon: '◎', iconBg: 'bg-purple-500/20',
  },
  {
    symbol: 'BTC', name: 'Bitcoin', price: 98425, change: +6.2, vol: '28B',
    reason: 'Institutional accumulation detected. ETF inflows reached $480M today — highest in 3 weeks.',
    tag: 'Inst. Buying', tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    icon: '₿', iconBg: 'bg-amber-500/20',
  },
  {
    symbol: 'JUP', name: 'Jupiter', price: 1.24, change: +28.4, vol: '480M',
    reason: 'Sudden price movement of +28% in 4h. New DEX partnership announced. High momentum signal.',
    tag: 'Price Spike', tagColor: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
    icon: 'J', iconBg: 'bg-[#00d4aa]/20',
  },
  {
    symbol: 'RNDR', name: 'Render', price: 8.92, change: +18.1, vol: '320M',
    reason: 'AI narrative momentum continuing. NVIDIA partnership news driving unusual volume surge.',
    tag: 'AI Narrative', tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    icon: 'R', iconBg: 'bg-blue-500/20',
  },
  {
    symbol: 'ETH', name: 'Ethereum', price: 3842, change: -4.2, vol: '18B',
    reason: 'Volatile session. Liquidation cascade cleared $180M in longs. Potential reversal zone forming.',
    tag: 'Liq. Cascade', tagColor: 'text-red-400 bg-red-400/10 border-red-400/20',
    icon: 'Ξ', iconBg: 'bg-red-500/20',
  },
];

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
        {HOT_ASSETS.slice(0, compact ? 3 : 5).map((asset, i) => (
          <div key={asset.symbol}>
            <button
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a2340]/50 transition-colors text-left"
              onClick={() => setExpanded(expanded === i ? null : i)}
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
                <p className="text-sm font-bold text-white">${asset.price >= 1000 ? asset.price.toLocaleString() : asset.price}</p>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {asset.change >= 0 ? '+' : ''}{asset.change}%
                </div>
              </div>
            </button>

            {expanded === i && (
              <div className="px-4 pb-3 mx-4 mb-2 bg-[#0a0e1a] rounded-xl border border-[rgba(148,163,184,0.06)]">
                <div className="flex items-start gap-2 py-2.5">
                  <Zap className="w-3.5 h-3.5 text-[#00d4aa] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{asset.reason}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(148,163,184,0.06)]">
                  <span className="text-[10px] text-slate-500">Vol: <span className="text-slate-300">${asset.vol}</span></span>
                  <Link to={`/Trade?symbol=${asset.symbol}`} className="flex items-center gap-1 text-[10px] font-semibold text-[#00d4aa] hover:text-[#06b6d4]">
                    <Eye className="w-3 h-3" /> Trade {asset.symbol}
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}