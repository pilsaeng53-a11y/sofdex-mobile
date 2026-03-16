import React, { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';
import CollateralSelector from './CollateralSelector';
import { getCollateralAsset, getCollateralValue } from './CollateralEngine';

const pctButtons = ['25%', '50%', '75%', 'Max'];

function getLeverageOptions(maxLev) {
  const presets = [1, 2, 5, 10, 25, 50, 75, 100];
  return presets.filter(l => l <= maxLev);
}

export default function OrderPanel({ asset }) {
  const { t } = useLang();
  const maxLev = asset?.maxLeverage || 20;
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [advancedType, setAdvancedType] = useState('');  // post-only, reduce-only, trailing, iceberg
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [trailPct, setTrailPct] = useState('1.5');
  const [icebergPct, setIcebergPct] = useState('20');
  const [leverage, setLeverage] = useState(Math.min(10, maxLev));
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
      <div className="flex gap-1 mb-2 flex-wrap">
        {[['market','Market'],['limit','Limit'],['stop','Stop'],['trailing','Trailing'],['iceberg','Iceberg']].map(([type, label]) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              orderType === type
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 border border-transparent hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Advanced flags */}
      <div className="flex gap-1.5 mb-3">
        {[['post-only','Post Only'],['reduce-only','Reduce Only']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setAdvancedType(advancedType === val ? '' : val)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
              advancedType === val
                ? 'bg-purple-500/10 text-purple-400 border-purple-400/25'
                : 'text-slate-600 border-[rgba(148,163,184,0.06)] hover:text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Limit / Stop price input */}
      {(orderType === 'limit' || orderType === 'stop') && (
        <div className="mb-3">
          <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">
            {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
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

      {/* Trailing stop % */}
      {orderType === 'trailing' && (
        <div className="mb-3">
          <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Trail Distance (%)</label>
          <input
            type="number"
            placeholder="1.5"
            value={trailPct}
            onChange={(e) => setTrailPct(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
          />
          <p className="text-[10px] text-slate-600 mt-1">Order triggers {trailPct}% from peak price</p>
        </div>
      )}

      {/* Iceberg visible size */}
      {orderType === 'iceberg' && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Limit Price</label>
            <input type="number" placeholder={basePrice?.toFixed(2)} value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium mb-1.5 block">Visible ({icebergPct}%)</label>
            <input type="number" placeholder="20" value={icebergPct} onChange={e => setIcebergPct(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30" />
          </div>
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
          <label className="text-[11px] text-slate-500 font-medium">{t('order_leverage')} <span className="text-slate-600">max {maxLev}x</span></label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#00d4aa]">{leverage}x</span>
            {parsedAmount > 0 && (
              <span className="text-[10px] text-slate-500">
                = <span className="text-slate-300 font-medium">${positionSize.toFixed(0)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {getLeverageOptions(maxLev).map(lev => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`flex-1 min-w-[28px] py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
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
              width: `${(leverage / maxLev) * 100}%`,
              background: leverage <= maxLev * 0.2
                ? '#22c55e'
                : leverage <= maxLev * 0.5
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
            {parsedAmount > 0 ? `$${fee.toFixed(4)}` : (advancedType === 'post-only' ? '0.00% (maker)' : '0.05%')}
          </span>
        </div>
        {advancedType && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Order Flag</span>
            <span className="text-purple-400 font-medium capitalize">{advancedType}</span>
          </div>
        )}
        {orderType === 'trailing' && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Trail Distance</span>
            <span className="text-slate-300 font-medium">{trailPct}%</span>
          </div>
        )}
        {orderType === 'iceberg' && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Visible Size</span>
            <span className="text-slate-300 font-medium">{icebergPct}% of total</span>
          </div>
        )}
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