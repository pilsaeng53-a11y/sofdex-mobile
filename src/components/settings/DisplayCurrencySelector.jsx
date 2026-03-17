import React from 'react';
import { useCurrency } from '../shared/CurrencyContext';
import { getSupportedCurrencies } from '@/lib/currencyUtils';
import { useLang } from '../shared/LanguageContext';

export default function DisplayCurrencySelector() {
  const { displayCurrency, updateDisplayCurrency, ratesLoading } = useCurrency();
  const { t } = useLang();
  const currencies = getSupportedCurrencies();

  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] mb-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Display Currency
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Choose how prices are displayed across the app
        </p>
      </div>

      <div className="space-y-2">
        {currencies.map((currency) => (
          <button
            key={currency.value}
            onClick={() => updateDisplayCurrency(currency.value)}
            className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3 ${
              displayCurrency === currency.value
                ? 'bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-[#00d4aa]'
                : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 hover:border-[#00d4aa]/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                displayCurrency === currency.value
                  ? 'border-[#00d4aa] bg-[#00d4aa]'
                  : 'border-slate-600'
              }`}
            >
              {displayCurrency === currency.value && (
                <div className="w-2 h-2 bg-black rounded-full" />
              )}
            </div>
            <span className="text-sm font-medium">{currency.label}</span>
          </button>
        ))}
      </div>

      {ratesLoading && (
        <p className="text-xs text-slate-600 mt-3">
          Exchange rates updating...
        </p>
      )}

      {displayCurrency !== 'Default' && (
        <div className="mt-3 p-2 rounded-lg bg-slate-900/40 border border-slate-700/30">
          <p className="text-xs text-slate-500">
            💡 Prices will be converted to {currency.label} in real time
          </p>
        </div>
      )}
    </div>
  );
}