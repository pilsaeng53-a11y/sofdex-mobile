import React, { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';
import CollateralSelector from './CollateralSelector';
import { getCollateralAsset, getCollateralValue } from './CollateralEngine';

const leverageOptions = [1, 2, 5, 10, 25, 50, 100];
const pctButtons = ['25%', '50%', '75%', 'Max'];

export default function OrderPanel({ asset }) {
  const { t } = useLang();
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [collateral, setCollateral] = useState(getCollateralAsset('USDT'));

  const basePrice = asset?.price || 0;
  const parsedAmount = parseFloat(amount) || 0;
  const entryPrice = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : basePrice;
  const { effectiveUSD: effectiveMargin } = getCollateralValue(collateral, parsedAmount || collateral.balance * 0.5);
  const positionSize = effectiveMargin * leverage;
  const fee = positionSize * 0.0005;
  const liqDistance = 1 / leverage;
  const liqPrice = side === 'buy'
    ? entryPrice * (1 - liqDistance * 0.9)
    : entryPrice * (1 + liqDistance * 0.9);

  const handlePct = (pct) => {
    const balance = collateral.balance;
    const val = pct === 'Max' ? balance : balance * (parseInt(pct) / 100);
    setAmount(val.toFixed(4));
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Buy/Sell toggle */}
      <div className="flex gap-1 bg-[#0d1220] rounded-xl p-1 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            side === 'buy'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {t('order_buyLong')}
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            side === 'sell'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {t('order_sellShort')}
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-1 mb-4">
        {[['market','order_market'],['limit','order_limit'],['stop','order_stop']].map(([type, key]) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
              orderType === type
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent hover:text-slate-300'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Limit price input */}
      {orderType !== 'market' && (
        <div className="mb-3">
          <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">
            {orderType === 'limit' ? t('order_limitPrice') : t('order_stopPrice')}
          </label>
          <input
            type="number"
            placeholder={basePrice ? basePrice.toFixed(2) : '0.00'}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
          />
        </div>
      )}

      {/* Collateral selector */}
      <CollateralSelector selected={collateral} onSelect={setCollateral} amount={parsedAmount} />

      {/* Collateral amount input */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] text-slate-500 font-medium">{t('order_collateral')} Amount</label>
          <span className="text-[11px] text-slate-500">{t('order_balance')} <span className="text-slate-300 font-medium">{collateral.balance.toLocaleString()} {collateral.symbol}</span></span>
        </div>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
        />
        <div className="flex gap-1.5 mt-2">
          {pctButtons.map(pct => (
            <button
              key={pct}
              onClick={() => handlePct(pct)}
              className="flex-1 py-1.5 rounded-lg bg-[#0d1220] text-[10px] font-medium text-slate-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/5 transition-all border border-transparent hover:border-[#00d4aa]/15"
            >
              {pct}
            </button>
          ))}
        </div>
      </div>

      {/* Leverage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-slate-500 font-medium">{t('order_leverage')}</label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#00d4aa]">{leverage}x</span>
            {parsedAmount > 0 && (
              <span className="text-[10px] text-slate-500">
                = <span className="text-slate-300 font-medium">${positionSize.toFixed(0)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {leverageOptions.map(lev => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                leverage === lev
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'bg-[#0d1220] text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
        {/* Leverage risk bar */}
        <div className="mt-2 h-1 rounded-full bg-[#0d1220] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(leverage / 100) * 100}%`,
              background: leverage <= 10
                ? '#22c55e'
                : leverage <= 25
                ? '#f59e0b'
                : '#ef4444'
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
          <span>{t('order_lowRisk')}</span>
          <span>{t('order_highRisk')}</span>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-[#0d1220] rounded-xl p-3 mb-4 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">{t('order_estEntry')}</span>
          <span className="text-slate-300 font-medium">
            {orderType === 'market' ? 'Market' : limitPrice ? `$${parseFloat(limitPrice).toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Collateral</span>
          <span className="text-slate-300 font-medium">{collateral.symbol} · ${effectiveMargin.toFixed(0)} effective</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">{t('order_positionSize')}</span>
          <span className="text-slate-300 font-medium">
            {parsedAmount > 0 ? `$${positionSize.toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">{t('order_liqPrice')}</span>
          <span className={`font-medium ${parsedAmount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
            {parsedAmount > 0 ? `$${liqPrice.toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">{t('order_tradingFee')}</span>
          <span className="text-slate-300 font-medium">
            {parsedAmount > 0 ? `$${fee.toFixed(4)}` : '0.05%'}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
          side === 'buy'
            ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
            : 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
        }`}
      >
        <Zap className="w-4 h-4" />
        {side === 'buy' ? t('order_openLong') : t('order_openShort')}
        {parsedAmount > 0 && ` · $${positionSize.toFixed(0)}`}
      </button>
    </div>
  );
}