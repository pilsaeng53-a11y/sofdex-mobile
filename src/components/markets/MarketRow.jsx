import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice, formatChange } from '../shared/MarketData';
import MiniChart from '../shared/MiniChart';

const symbolColors = {
  SOL: 'from-[#9945FF] to-[#14F195]',
  BTC: 'from-[#F7931A] to-[#FFBA00]',
  ETH: 'from-[#627EEA] to-[#8B9FEF]',
  JUP: 'from-[#00C6A9] to-[#29B8B0]',
  RAY: 'from-[#6E5CE6] to-[#A78BFA]',
  RNDR: 'from-[#FF0000] to-[#FF6B6B]',
  BONK: 'from-[#F59E0B] to-[#FDE68A]',
  HNT: 'from-[#474DFF] to-[#7B80FF]',
};

const categoryLabels = {
  rwa: { label: 'RWA', color: 'text-purple-400 bg-purple-400/10' },
  tradfi: { label: 'TradFi', color: 'text-blue-400 bg-blue-400/10' },
  crypto: { label: 'PERP', color: 'text-[#00d4aa] bg-[#00d4aa]/8' },
};

export default function MarketRow({ asset }) {
  const isPositive = asset.change >= 0;
  const gradient = symbolColors[asset.symbol] || 'from-slate-600 to-slate-500';
  const catLabel = categoryLabels[asset.category] || categoryLabels.crypto;

  return (
    <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
      <div className="flex items-center gap-3 py-3 px-3.5 hover:bg-[#151c2e] rounded-xl transition-all group">
        {/* Symbol icon */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <span className="text-[10px] font-black text-white">{asset.symbol.slice(0, 3)}</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-white group-hover:text-[#00d4aa] transition-colors truncate">{asset.symbol}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${catLabel.color}`}>{catLabel.label}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{asset.name}</p>
        </div>

        {/* Mini chart */}
        <div className="w-16 flex-shrink-0">
          <MiniChart positive={isPositive} width={64} height={28} />
        </div>

        {/* Price + change */}
        <div className="text-right flex-shrink-0 min-w-[80px]">
          <p className="text-sm font-bold text-white">${formatPrice(asset.price)}</p>
          <p className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatChange(asset.change)}
          </p>
        </div>
      </div>
    </Link>
  );
}