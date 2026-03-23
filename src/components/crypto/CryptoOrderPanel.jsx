import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { fmtPrice } from '../../lib/trading/priceFormat';

const ORDER_TYPES = ['Market', 'Limit', 'Stop'];
const QTY_PRESETS = [0.001, 0.01, 0.1, 0.5, 1];

function Row({ label, value, cls = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-semibold font-mono ${cls}`}>{value}</span>
    </div>
  );
}

export default function CryptoOrderPanel({ symbol = 'BTC', ask, bid, onSubmit, externalPrice }) {
  const [orderType, setOrderType] = useState('Market');
  const [side, setSide] = useState('buy');
  const [qty, setQty] = useState(0.01);
  const [limitPrice, setLimitPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lock = useRef(false);

  // Sync external price (from depth click)
  React.useEffect(() => {
    if (externalPrice != null) {
      setLimitPrice(fmtPrice(externalPrice, symbol));
      if (orderType === 'Market') setOrderType('Limit');
    }
  }, [externalPrice]);

  const handleTypeChange = (t) => {
    setOrderType(t);
    if (t === 'Market') setLimitPrice('');
  };

  const currentPrice = side === 'buy' ? ask : bid;
  const notional = qty * (currentPrice || 0);
  const fee = notional * 0.001; // 0.1% taker fee

  const slPips = sl && currentPrice ? Math.abs(currentPrice - parseFloat(sl)) : null;
  const tpPips = tp && currentPrice ? Math.abs(parseFloat(tp) - currentPrice) : null;
  const slRisk = slPips ? slPips * qty : null;
  const tpReward = tpPips ? tpPips * qty : null;

  const adjQty = (d) => setQty(v => Math.max(0.001, Math.round((v + d) * 1000) / 1000));

  const handleSubmit = () => {
    if (!currentPrice || lock.current) return;
    lock.current = true;
    setIsSubmitting(true);
    onSubmit?.({
      symbol,
      side,
      orderType,
      volume: qty,
      leverage: 1,
      sl: sl || null,
      tp: tp || null,
      limitPrice: orderType !== 'Market' ? limitPrice : null,
      askPrice: ask,
      bidPrice: bid,
      lotSize: 1,      // crypto: 1 unit = 1 coin
      pipValue: 1,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      lock.current = false;
      setTimeout(() => setSubmitted(false), 1800);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1525]">
      {/* Order type tabs */}
      <div className="grid grid-cols-3 border-b border-[rgba(148,163,184,0.08)]">
        {ORDER_TYPES.map(t => (
          <button key={t} onClick={() => handleTypeChange(t)}
            className={`py-2 text-[9px] font-bold transition-all ${orderType === t ? 'bg-[#151c2e] text-[#00d4aa] border-b-2 border-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-3">
        {/* Buy / Sell */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSide('buy')}
            className={`py-3 rounded-xl font-black text-sm transition-all ${side === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
            <div className="text-xs opacity-70 font-mono">{ask != null ? fmtPrice(ask, symbol) : '—'}</div>
            BUY
          </button>
          <button onClick={() => setSide('sell')}
            className={`py-3 rounded-xl font-black text-sm transition-all ${side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
            <div className="text-xs opacity-70 font-mono">{bid != null ? fmtPrice(bid, symbol) : '—'}</div>
            SELL
          </button>
        </div>

        {/* Limit / Stop price */}
        {orderType !== 'Market' && (
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">{orderType} Price (USDT)</label>
            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              placeholder={currentPrice ? fmtPrice(currentPrice, symbol) : ''}
              className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4aa]/40" />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Quantity ({symbol})</label>
          <div className="flex items-center gap-2">
            <button onClick={() => adjQty(-0.001)}
              className="w-7 h-7 rounded-lg bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
              <Minus className="w-3 h-3 text-slate-400" />
            </button>
            <input type="number" value={qty}
              onChange={e => setQty(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
              step="0.001"
              className="flex-1 bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-[#00d4aa]/40" />
            <button onClick={() => adjQty(0.001)}
              className="w-7 h-7 rounded-lg bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
              <Plus className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <div className="flex gap-1 mt-1.5">
            {QTY_PRESETS.map(p => (
              <button key={p} onClick={() => setQty(p)}
                className={`flex-1 py-1 rounded text-[8px] font-bold transition-all ${qty === p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* SL / TP */}
        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-bold text-red-400 uppercase mb-1 block">Stop Loss (USDT)</label>
            <input type="number" value={sl} onChange={e => setSl(e.target.value)}
              placeholder={currentPrice ? fmtPrice(side === 'buy' ? currentPrice * 0.985 : currentPrice * 1.015, symbol) : ''}
              className="w-full bg-[#1a2340] border border-red-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40" />
            {slRisk != null && (
              <div className="text-[9px] text-red-400 mt-0.5">Risk: ≈${slRisk.toFixed(2)}</div>
            )}
          </div>
          <div>
            <label className="text-[9px] font-bold text-emerald-400 uppercase mb-1 block">Take Profit (USDT)</label>
            <input type="number" value={tp} onChange={e => setTp(e.target.value)}
              placeholder={currentPrice ? fmtPrice(side === 'buy' ? currentPrice * 1.03 : currentPrice * 0.97, symbol) : ''}
              className="w-full bg-[#1a2340] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40" />
            {tpReward != null && slRisk != null && (
              <div className="text-[9px] text-emerald-400 mt-0.5">Reward: ≈${tpReward.toFixed(2)} · R:R {(tpReward / (slRisk || 1)).toFixed(1)}</div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#1a2340] rounded-xl p-3 space-y-1 border border-[rgba(148,163,184,0.06)]">
          <Row label="Notional" value={notional > 0 ? `$${notional.toFixed(2)}` : '—'} />
          <Row label="Est. Fee (0.1%)" value={fee > 0 ? `$${fee.toFixed(4)}` : '—'} />
          {currentPrice && <Row label="Price" value={fmtPrice(currentPrice, symbol)} cls="text-[#00d4aa]" />}
        </div>
      </div>

      {/* Submit */}
      <div className="p-3 border-t border-[rgba(148,163,184,0.08)]">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || submitted || !currentPrice}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            submitted ? 'bg-slate-600 text-slate-300'
            : isSubmitting ? (side === 'buy' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white')
            : side === 'buy'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
          }`}>
          {isSubmitting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            : submitted ? '✓ Order Placed'
            : `${side === 'buy' ? 'BUY' : 'SELL'} ${qty} ${symbol}`
          }
        </button>
        <p className="text-[9px] text-slate-600 text-center mt-1.5">
          {orderType} · ≈${notional.toFixed(2)}
        </p>
      </div>
    </div>
  );
}