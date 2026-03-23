import React, { useState, useMemo } from 'react';
import { Minus, Plus, Zap, AlertTriangle, Info } from 'lucide-react';

const ORDER_TYPES = ['Market', 'Limit', 'Stop', 'Stop-Limit'];
const LOT_PRESETS = [0.01, 0.1, 0.5, 1.0, 5.0];
const LEV_PRESETS = [1, 5, 10, 25, 50, 100];

function Row({ label, value, valueClass = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-semibold font-mono ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function FuturesOrderPanel({ asset, askPrice, bidPrice }) {
  const [orderType, setOrderType] = useState('Market');
  const [side, setSide] = useState('buy');
  const [volume, setVolume] = useState(0.1);
  const [leverage, setLeverage] = useState(50);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [oneClick, setOneClick] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentPrice = side === 'buy' ? askPrice : bidPrice;
  const lotSize = asset?.lot_size ?? 100000;
  const spread = asset?.spread ?? 1.2;
  const notional = volume * lotSize * (currentPrice || 1);
  const margin = notional / leverage;
  const pipValue = asset?.pip_value ?? 0.0001;
  const swapRate = 0.02;
  const feePerLot = 3.5;
  const fee = volume * feePerLot;

  const slPips = sl && currentPrice ? Math.abs(currentPrice - parseFloat(sl)) / pipValue : null;
  const tpPips = tp && currentPrice ? Math.abs(parseFloat(tp) - currentPrice) / pipValue : null;
  const riskAmount = slPips ? slPips * pipValue * lotSize * volume : null;

  // Liquidation price estimate
  const liqPrice = currentPrice
    ? side === 'buy'
      ? currentPrice * (1 - 1 / leverage * 0.8)
      : currentPrice * (1 + 1 / leverage * 0.8)
    : null;

  const riskLevel = margin > 5000 ? 'high' : margin > 1000 ? 'medium' : 'low';
  const RISK_COLOR = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' };

  const handleSubmit = () => {
    if (oneClick) { setSubmitted(true); setTimeout(() => setSubmitted(false), 2000); return; }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const adjVol = (delta) => setVolume(v => Math.max(0.01, Math.round((v + delta) * 100) / 100));

  return (
    <div className="flex flex-col h-full bg-[#0f1525]">
      {/* Order type tabs */}
      <div className="grid grid-cols-4 border-b border-[rgba(148,163,184,0.08)]">
        {ORDER_TYPES.map(t => (
          <button key={t} onClick={() => setOrderType(t)}
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
            <div className="text-xs opacity-70 font-mono">{askPrice?.toFixed(4) ?? '—'}</div>
            BUY
          </button>
          <button onClick={() => setSide('sell')}
            className={`py-3 rounded-xl font-black text-sm transition-all ${side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#1a2340] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
            <div className="text-xs opacity-70 font-mono">{bidPrice?.toFixed(4) ?? '—'}</div>
            SELL
          </button>
        </div>

        {/* Limit price (if applicable) */}
        {orderType !== 'Market' && (
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">{orderType} Price</label>
            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4aa]/40" />
          </div>
        )}

        {/* Volume */}
        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Volume (Lots)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => adjVol(-0.01)} className="w-7 h-7 rounded-lg bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
              <Minus className="w-3 h-3 text-slate-400" />
            </button>
            <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value) || 0.01)}
              step="0.01" className="flex-1 bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-[#00d4aa]/40" />
            <button onClick={() => adjVol(0.01)} className="w-7 h-7 rounded-lg bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
              <Plus className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <div className="flex gap-1 mt-1.5">
            {LOT_PRESETS.map(p => (
              <button key={p} onClick={() => setVolume(p)}
                className={`flex-1 py-1 rounded text-[8px] font-bold transition-all ${volume === p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Leverage</label>
            <span className="text-[10px] font-black text-[#00d4aa]">1:{leverage}</span>
          </div>
          <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))}
            className="w-full h-1 rounded-full accent-[#00d4aa] mb-1.5" />
          <div className="flex gap-1">
            {LEV_PRESETS.map(l => (
              <button key={l} onClick={() => setLeverage(l)}
                className={`flex-1 py-1 rounded text-[8px] font-bold transition-all ${leverage === l ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-500 hover:text-slate-300'}`}>
                {l}x
              </button>
            ))}
          </div>
        </div>

        {/* SL / TP */}
        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-bold text-red-400 uppercase mb-1 block">Stop Loss</label>
            <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="0.00"
              className="w-full bg-[#1a2340] border border-red-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40" />
            {slPips && <p className="text-[9px] text-red-400 mt-0.5">{slPips.toFixed(1)} pips · risk ${riskAmount?.toFixed(2)}</p>}
          </div>
          <div>
            <label className="text-[9px] font-bold text-emerald-400 uppercase mb-1 block">Take Profit</label>
            <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="0.00"
              className="w-full bg-[#1a2340] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40" />
            {tpPips && <p className="text-[9px] text-emerald-400 mt-0.5">{tpPips.toFixed(1)} pips</p>}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-[#1a2340] rounded-xl p-3 space-y-1 border border-[rgba(148,163,184,0.06)]">
          <Row label="Spread" value={`${spread} pips`} />
          <Row label="Commission" value={`$${fee.toFixed(2)}`} />
          <Row label="Swap/day" value={`${swapRate}%`} />
          <Row label="Margin" value={`$${margin.toFixed(2)}`} valueClass={RISK_COLOR[riskLevel]} />
          <Row label="Notional" value={notional > 1e6 ? `$${(notional/1e6).toFixed(2)}M` : `$${notional.toFixed(0)}`} />
          {liqPrice && <Row label="Liq. Price" value={liqPrice.toFixed(4)} valueClass="text-red-400" />}
        </div>

        {/* Risk indicator */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${riskLevel === 'high' ? 'border-red-500/20 bg-red-500/05' : riskLevel === 'medium' ? 'border-amber-500/20 bg-amber-500/05' : 'border-emerald-500/20 bg-emerald-500/05'}`}>
          <AlertTriangle className={`w-3.5 h-3.5 ${RISK_COLOR[riskLevel]}`} />
          <span className={`text-[10px] font-semibold ${RISK_COLOR[riskLevel]}`}>
            {riskLevel === 'high' ? 'High risk position' : riskLevel === 'medium' ? 'Moderate risk' : 'Low risk'}
          </span>
        </div>

        {/* One-click mode */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400 font-semibold">One-Click Mode</span>
          </div>
          <button onClick={() => setOneClick(v => !v)}
            className={`w-9 h-5 rounded-full transition-all relative ${oneClick ? 'bg-amber-500' : 'bg-[#1a2340]'}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${oneClick ? 'left-4.5' : 'left-0.75'}`} style={{ top: 3, left: oneClick ? 18 : 3 }} />
          </button>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-3 border-t border-[rgba(148,163,184,0.08)]">
        <button onClick={handleSubmit}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            submitted
              ? 'bg-slate-600 text-slate-300'
              : side === 'buy'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
          }`}>
          {submitted ? '✓ Order Placed' : `${side === 'buy' ? 'BUY' : 'SELL'} ${volume} LOTS`}
        </button>
        <p className="text-[9px] text-slate-600 text-center mt-1.5">
          {orderType} · Margin: ${margin.toFixed(2)} · Lev: 1:{leverage}
        </p>
      </div>
    </div>
  );
}