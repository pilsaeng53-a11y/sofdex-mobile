import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice, formatChange } from '../shared/MarketData';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';

const typeColors = {
  'Real Estate': 'border-purple-500/20 bg-purple-500/5',
  'Commodity': 'border-amber-500/20 bg-amber-500/5',
  'Treasury': 'border-blue-500/20 bg-blue-500/5',
  'Equity': 'border-emerald-500/20 bg-emerald-500/5',
};

const typeTextColors = {
  'Real Estate': 'text-purple-400',
  'Commodity': 'text-amber-400',
  'Treasury': 'text-blue-400',
  'Equity': 'text-emerald-400',
};

export default function RWAAssetCard({ asset }) {
  const isPositive = asset.change >= 0;
  const borderColor = typeColors[asset.type] || 'border-slate-500/20';
  const textColor = typeTextColors[asset.type] || 'text-slate-400';

  return (
    <Link to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
      <div className={`glass-card rounded-2xl p-4 border ${borderColor} hover:bg-[#1a2340] transition-all group`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${borderColor} ${textColor}`}>
                {asset.type}
              </span>
            </div>
            <p className="text-sm font-bold text-white group-hover:text-[#00d4aa] transition-colors">{asset.name}</p>
            <p className="text-[11px] text-slate-500">{asset.symbol}</p>
          </div>
          {asset.yield && asset.yield !== '0.0%' && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00d4aa]/8 border border-[#00d4aa]/15">
              <Percent className="w-3 h-3 text-[#00d4aa]" />
              <span className="text-xs font-bold text-[#00d4aa]">{asset.yield}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-white">${formatPrice(asset.price)}</p>
            <p className="text-[11px] text-slate-500">Vol: {asset.volume}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
            isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatChange(asset.change)}
          </div>
        </div>
      </div>
    </Link>
  );
}