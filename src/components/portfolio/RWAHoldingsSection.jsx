import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { useChartPrice } from '../shared/useChartPrice';
import { formatPrice } from '../shared/MarketData';
import { useLang } from '../shared/LanguageContext';

const rwaHoldings = [
  { symbol: 'RE-MHT-1', name: 'Manhattan Prime Tower', tokens: '120', value: '$29,700.00', change: 1.24, yield: 6.8, verified: true },
  { symbol: 'RE-SGP-1', name: 'Marina Bay Tower', tokens: '50', value: '$9,930.00', change: 1.67, yield: 5.4, verified: true },
  { symbol: 'TBILL', name: 'US Treasury Bill Token', tokens: '25', value: '$2,506.00', change: 0.02, yield: 5.12, verified: true },
  { symbol: 'GOLD-T', name: 'Tokenized Gold', tokens: '1.2', value: '$2,810.00', change: 0.87, yield: 0, verified: false },
];

export default function RWAHoldingsSection({ showBalance, tab }) {
  const { t } = useLang();

  return (
    <>
      {(tab === 'All' || tab === 'RWA') && (
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-[#8b5cf6]" />
          <h3 className="text-sm font-bold text-white">{t('portfolio_rwaHoldings')}</h3>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {rwaHoldings.map((h, i) => (
            <RWAHoldingRow key={i} holding={h} showBalance={showBalance} />
          ))}
        </div>
      </div>
      )}
    </>
  );
}

function RWAHoldingRow({ holding, showBalance }) {
  // **CHART PRICE IS MASTER** for RWA portfolio values
  const { price: masterPrice, change24h } = useChartPrice(holding.symbol);
  
  const displayValue = masterPrice && holding.tokens && !isNaN(parseFloat(holding.tokens.replace(/,/g, '')))
    ? `$${formatPrice(parseFloat(holding.tokens.replace(/,/g, '')) * masterPrice)}`
    : holding.value;

  const displayChange = change24h ?? holding.change;

  return (
    <div className="p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1a1040] flex items-center justify-center text-[9px] font-bold text-[#8b5cf6]">
          {holding.symbol.slice(0, 3)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-white">{holding.name}</p>
            {holding.verified && <ShieldCheck className="w-3 h-3 text-[#00d4aa]" />}
          </div>
          <p className="text-[11px] text-slate-500">{holding.tokens} tokens {holding.yield > 0 ? `· ${holding.yield}% yield` : ''}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-white">{showBalance ? displayValue : '••••'}</p>
        <p className={`text-[11px] font-medium ${displayChange > 0 ? 'text-emerald-400' : displayChange < 0 ? 'text-red-400' : 'text-slate-500'}`}>
          {displayChange > 0 ? '+' : ''}{displayChange.toFixed ? displayChange.toFixed(2) : displayChange}%
        </p>
      </div>
    </div>
  );
}