import React from 'react';
import { useChartPrice } from '../shared/useChartPrice';
import { formatPrice } from '../shared/MarketData';
import { useLang } from '../shared/LanguageContext';

const holdings = [
  { symbol: 'SOL', name: 'Solana', amount: '24.82', value: '$4,648.54', change: 5.23, type: 'crypto' },
  { symbol: 'USDC', name: 'USD Coin', amount: '12,450', value: '$12,450.00', change: 0, type: 'crypto' },
  { symbol: 'BTC', name: 'Bitcoin', amount: '0.045', value: '$4,429.15', change: 2.14, type: 'crypto' },
  { symbol: 'TBILL', name: 'US T-Bill Token', amount: '25', value: '$2,506.00', change: 0.02, type: 'rwa' },
  { symbol: 'GOLD-T', name: 'Tokenized Gold', amount: '1.2', value: '$2,810.16', change: 0.87, type: 'rwa' },
];

export default function CryptoHoldingsSection({ showBalance, tab }) {
  const { t } = useLang();

  return (
    <>
      {(tab === 'All' || tab === 'Crypto') && (
      <div className="px-4 mb-5">
        <h3 className="text-sm font-bold text-white mb-3">{t('portfolio_cryptoHoldings')}</h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {holdings.filter(h => tab === 'All' ? true : h.type === 'crypto').map((h, i) => (
            <HoldingRow key={i} holding={h} showBalance={showBalance} />
          ))}
        </div>
      </div>
      )}
    </>
  );
}

function HoldingRow({ holding, showBalance }) {
  // **CHART PRICE IS MASTER** for all portfolio value calculations
  const { price: masterPrice, change24h } = useChartPrice(holding.symbol);
  
  const displayValue = masterPrice && holding.amount && !isNaN(parseFloat(holding.amount.replace(/,/g, '')))
    ? `$${formatPrice(parseFloat(holding.amount.replace(/,/g, '')) * masterPrice)}`
    : holding.value;

  const displayChange = change24h ?? holding.change;

  return (
    <div className="p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1a2340] flex items-center justify-center text-[10px] font-bold text-[#00d4aa]">
          {holding.symbol.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{holding.symbol}</p>
          <p className="text-[11px] text-slate-500">{holding.amount}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{showBalance ? displayValue : '••••'}</p>
        <p className={`text-[11px] font-medium ${displayChange > 0 ? 'text-emerald-400' : displayChange < 0 ? 'text-red-400' : 'text-slate-500'}`}>
          {displayChange > 0 ? '+' : ''}{displayChange.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}