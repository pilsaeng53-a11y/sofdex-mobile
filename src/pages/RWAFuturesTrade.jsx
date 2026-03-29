/**
 * RWAFuturesTrade — SolFort-native RWA Futures trading interface
 * Visually consistent with existing SolFort trading screens.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronDown, AlertCircle, Activity, Info
} from 'lucide-react';
import { getProductBySymbol, CATEGORY_CONFIG, STATUS_CONFIG } from '@/services/rwaFuturesService';
import { base44 } from '@/api/base44Client';

const LEVERAGE_STEPS = [1, 2, 3, 5, 10];

function useFakePriceNoise(base) {
  const [price, setPrice] = useState(base);
  React.useEffect(() => {
    const id = setInterval(() => {
      setPrice(p => Math.max(base * 0.5, p + (Math.random() - 0.499) * base * 0.001));
    }, 3000);
    return () => clearInterval(id);
  }, [base]);
  return price;
}

export default function RWAFuturesTrade() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const symbol = params.get('symbol');
  const product = getProductBySymbol(symbol);

  const [side, setSide] = useState('long');
  const [orderType, setOrderType] = useState('market');
  const [leverage, setLeverage] = useState(product?.leverageMax ? Math.min(5, product.leverageMax) : 1);
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState('positions');

  const livePrice = useFakePriceNoise(product?.referencePrice || 100);

  const entryPrice = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : livePrice;
  const qtyNum = parseFloat(qty) || 0;
  const notional = qtyNum * entryPrice;
  const margin = leverage > 0 ? notional / leverage : notional;
  const liqPrice = side === 'long'
    ? entryPrice * (1 - (0.9 / leverage))
    : entryPrice * (1 + (0.9 / leverage));
  const pnlMock = side === 'long'
    ? (livePrice - entryPrice) * qtyNum
    : (entryPrice - livePrice) * qtyNum;

  const submit = async () => {
    if (!qtyNum || qtyNum <= 0) return;
    setSubmitting(true);
    try {
      await base44.entities.RWAParticipation.create({
        propertyId: product.assetId,
        propertyTitle: `[FUTURES] ${product.symbol} ${side.toUpperCase()} x${leverage}`,
        investAmount: margin,
        tokenQty: qtyNum,
        expectedYield: `${side === 'long' ? '+' : '-'}${(pnlMock).toFixed(2)} USDT (mock)`,
        scenario: 'base',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        notes: `RWA Futures: ${symbol} | side:${side} | lev:${leverage} | qty:${qtyNum} | entry:${entryPrice}`,
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-slate-400">상품을 찾을 수 없습니다</p>
      <button onClick={() => navigate(-1)} className="text-xs text-[#8b5cf6]">← 돌아가기</button>
    </div>
  );

  const cat = CATEGORY_CONFIG[product.category];
  const isUp = livePrice >= product.referencePrice;

  return (
    <div className="min-h-screen pb-10 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-white font-mono">{product.symbol}</p>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-[#f59e0b] bg-[#f59e0b]/10">PERP</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{product.title}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-white">${livePrice.toFixed(2)}</p>
          <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(product.change24h).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Mini price bar */}
      <div className="px-4 py-2 flex items-center gap-4 border-b border-[rgba(148,163,184,0.05)] text-[9px] text-slate-600 overflow-x-auto scrollbar-none">
        {[
          ['Vol 24h', '$' + (product.volume24h / 1000).toFixed(0) + 'K'],
          ['OI', '$' + (product.openInterest / 1000).toFixed(0) + 'K'],
          ['Funding', product.fundingInfo],
          ['Max Lev.', product.leverageMax + 'x'],
        ].map(([k, v]) => (
          <div key={k} className="flex-shrink-0">
            <span className="text-slate-600">{k}: </span>
            <span className="text-slate-400 font-bold">{v}</span>
          </div>
        ))}
      </div>

      {/* Sparkline placeholder */}
      <div className="mx-4 mt-3 h-28 rounded-2xl glass-card border border-[rgba(148,163,184,0.05)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-end px-2 pb-2 gap-0.5">
          {Array.from({ length: 40 }, (_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.4 + product.referencePrice) * 60);
            return (
              <div key={i} className="flex-1 rounded-sm" style={{
                height: h + '%',
                background: i > 35 ? (isUp ? '#22c55e60' : '#ef444460') : '#1e2a42'
              }} />
            );
          })}
        </div>
        <p className="text-[9px] text-slate-600 z-10 bg-[#0d1220]/80 px-2 py-1 rounded-lg">
          가격 차트 (내부 참조 데이터)
        </p>
      </div>

      {/* Order panel */}
      <div className="mx-4 mt-4 glass-card rounded-2xl border border-[rgba(148,163,184,0.06)] overflow-hidden">
        {/* Long/Short */}
        <div className="grid grid-cols-2">
          <button onClick={() => setSide('long')}
            className={`py-3 text-sm font-black transition-all ${side === 'long' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-[#151c2e] text-slate-500'}`}>
            <TrendingUp className="w-4 h-4 inline mr-1.5" />LONG
          </button>
          <button onClick={() => setSide('short')}
            className={`py-3 text-sm font-black transition-all ${side === 'short' ? 'bg-red-400/15 text-red-400' : 'bg-[#151c2e] text-slate-500'}`}>
            <TrendingDown className="w-4 h-4 inline mr-1.5" />SHORT
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Market/Limit */}
          <div className="flex gap-2">
            {['market', 'limit'].map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${orderType === t ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25' : 'bg-[#0a0e1a] text-slate-500 border border-transparent'}`}>
                {t === 'market' ? '시장가' : '지정가'}
              </button>
            ))}
          </div>

          {/* Limit price (only if limit) */}
          {orderType === 'limit' && (
            <div>
              <label className="text-[9px] text-slate-500 mb-1 block">지정가 (USDT)</label>
              <input
                type="number"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder={livePrice.toFixed(2)}
                className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8b5cf6]/40"
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-[9px] text-slate-500 mb-1 block">수량</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder={`최소 ${product.minOrderSize}`}
              min={product.minOrderSize}
              className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8b5cf6]/40"
            />
          </div>

          {/* Leverage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] text-slate-500">레버리지</label>
              <span className="text-xs font-black text-amber-400">{leverage}x</span>
            </div>
            <div className="flex gap-1.5">
              {LEVERAGE_STEPS.filter(l => l <= product.leverageMax).map(l => (
                <button key={l} onClick={() => setLeverage(l)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${leverage === l ? 'bg-amber-400/15 text-amber-400 border border-amber-400/25' : 'bg-[#0a0e1a] text-slate-500 border border-transparent'}`}>
                  {l}x
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {qtyNum > 0 && (
            <div className="bg-[#0a0e1a] rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">진입 가격</span>
                <span className="text-white font-bold">${entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">포지션 금액</span>
                <span className="text-white font-bold">${notional.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">필요 증거금</span>
                <span className="text-amber-400 font-bold">${margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] border-t border-[rgba(148,163,184,0.06)] pt-2">
                <span className="text-slate-500">청산 가격 (추정)</span>
                <span className="text-red-400 font-bold">${liqPrice.toFixed(2)}</span>
              </div>
              {Math.abs(pnlMock) > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">예상 PnL (참고)</span>
                  <span className={`font-bold ${pnlMock >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnlMock >= 0 ? '+' : ''}{pnlMock.toFixed(2)} USDT
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-xl px-3 py-2">
            <Info className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[8px] text-amber-400/80 leading-relaxed">
              SolFort 내부 참조 상품입니다. 실제 체결·정산 엔진 적용 전 단계입니다.
            </p>
          </div>

          {/* Submit */}
          {submitted ? (
            <div className="w-full py-3 rounded-2xl text-sm font-black text-center text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
              주문 접수 완료 ✓
            </div>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !qtyNum}
              className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all"
              style={{
                background: side === 'long'
                  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                  : 'linear-gradient(135deg,#ef4444,#b91c1c)',
                opacity: (!qtyNum || submitting) ? 0.6 : 1
              }}
            >
              {submitting ? '처리 중...' : side === 'long' ? '매수 / LONG' : '매도 / SHORT'}
            </button>
          )}
        </div>
      </div>

      {/* Positions stub */}
      <div className="mx-4 mt-4 glass-card rounded-2xl border border-[rgba(148,163,184,0.05)] overflow-hidden">
        <div className="flex border-b border-[rgba(148,163,184,0.05)]">
          {['positions', 'orders', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[10px] font-bold transition-all ${tab === t ? 'text-[#8b5cf6] border-b-2 border-[#8b5cf6]' : 'text-slate-500'}`}>
              {t === 'positions' ? '포지션' : t === 'orders' ? '주문' : '거래내역'}
            </button>
          ))}
        </div>
        <div className="p-4 text-center py-6">
          <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-[11px] text-slate-600">활성 {tab === 'positions' ? '포지션' : tab === 'orders' ? '주문' : '내역'} 없음</p>
        </div>
      </div>
    </div>
  );
}