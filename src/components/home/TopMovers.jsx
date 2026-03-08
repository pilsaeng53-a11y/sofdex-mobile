import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CRYPTO_MARKETS, RWA_MARKETS, formatPrice, formatChange } from '../shared/MarketData';
import MiniChart from '../shared/MiniChart';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TopMovers() {
  const [tab, setTab] = useState('gainers');
  
  const sorted = [...CRYPTO_MARKETS, ...RWA_MARKETS].sort((a, b) => 
    tab === 'gainers' ? b.change - a.change : a.change - b.change
  ).slice(0, 5);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white">Top Movers</h2>
        <div className="flex gap-1 bg-[#151c2e] rounded-lg p-0.5">
          <button
            onClick={() => setTab('gainers')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === 'gainers' ? 'bg-emerald-400/15 text-emerald-400' : 'text-slate-500'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setTab('losers')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === 'losers' ? 'bg-red-400/15 text-red-400' : 'text-slate-500'
            }`}
          >
            Losers
          </button>
        </div>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
        {sorted.map((asset, i) => (
          <Link key={asset.symbol} to={createPageUrl('MarketDetail') + `?symbol=${asset.symbol}`}>
            <div className="flex items-center justify-between p-3.5 hover:bg-[#1a2340] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-600 font-medium w-4">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{asset.symbol}</p>
                  <p className="text-[11px] text-slate-500">{asset.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MiniChart positive={asset.change >= 0} width={60} height={24} />
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-semibold text-slate-100">${formatPrice(asset.price)}</p>
                  <p className={`text-[11px] font-medium ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatChange(asset.change)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}