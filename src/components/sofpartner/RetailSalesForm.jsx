/**
 * RetailSalesForm.jsx
 * 도소매 세일즈 파트너 전용 제출 양식
 * sofAmount = (salesAmount / sofPrice) * (promotionPercent / 100)
 */

import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { formatNumber, isValidSolanaAddress } from './SOFQuantityCalc';
import { AlertCircle, CheckCircle, Send, Calculator } from 'lucide-react';

const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/40 outline-none transition-all";
const labelCls = "text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5";

const EMPTY = {
  name: '',
  wallet: '',
  sales: '',
  price: '',
  promotion: '',
};

export default function RetailSalesForm({ partnerWallet }) {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  const calc = useMemo(() => {
    const sales = parseFloat(form.sales);
    const price = parseFloat(form.price);
    const promo = parseFloat(form.promotion);
    if (!sales || !price || !promo || sales <= 0 || price <= 0 || promo <= 0) {
      return { isValid: false, sofAmount: 0, multiplier: 0 };
    }
    const multiplier = promo / 100;
    const sofAmount = (sales / price) * multiplier;
    return { isValid: true, sofAmount, multiplier };
  }, [form.sales, form.price, form.promotion]);

  const errors = useMemo(() => {
    const e = {};
    if (touched.name && !form.name.trim()) e.name = '필수 입력 항목입니다.';
    if (touched.wallet) {
      if (!form.wallet.trim()) e.wallet = '필수 입력 항목입니다.';
      else if (!isValidSolanaAddress(form.wallet)) e.wallet = '유효한 Solana 지갑 주소를 입력하세요.';
    }
    if (touched.sales && (isNaN(parseFloat(form.sales)) || parseFloat(form.sales) <= 0)) e.sales = '양수를 입력하세요.';
    if (touched.price && (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)) e.price = '양수를 입력하세요.';
    if (touched.promotion && (isNaN(parseFloat(form.promotion)) || parseFloat(form.promotion) <= 0)) e.promotion = '0보다 큰 값을 입력하세요. (100 = 1배)';
    return e;
  }, [form, touched]);

  const isReady =
    form.name.trim() &&
    isValidSolanaAddress(form.wallet) &&
    parseFloat(form.sales) > 0 &&
    parseFloat(form.price) > 0 &&
    parseFloat(form.promotion) > 0 &&
    calc.isValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, wallet: true, sales: true, price: true, promotion: true });
    if (!isReady) return;

    setSubmitting(true);
    setResult(null);
    try {
      await base44.entities.SOFSaleSubmission.create({
        partner_wallet: partnerWallet,
        customer_name: form.name.trim(),
        customer_wallet: form.wallet.trim(),
        purchase_amount: parseFloat(form.sales),
        sof_unit_price: parseFloat(form.price),
        promotion_percent: parseFloat(form.promotion),
        sof_quantity: calc.sofAmount,
        status: 'Processing',
        submitted_at: new Date().toISOString(),
      });
      setResult({ type: 'success', msg: '재단에 성공적으로 제출되었습니다.' });
      setForm(EMPTY);
      setTouched({});
    } catch {
      setResult({ type: 'error', msg: '제출 중 오류가 발생했습니다. 다시 시도하세요.' });
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 고객 정보 */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">고객 정보</p>

        <div>
          <label className={labelCls}>고객 이름</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="홍길동"
            className={inputCls}
          />
          {errors.name && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
        </div>

        <div>
          <label className={labelCls}>지갑 주소 (Solana)</label>
          <input
            value={form.wallet}
            onChange={e => set('wallet', e.target.value)}
            placeholder="Solana 지갑 주소"
            className={`${inputCls} font-mono`}
          />
          {errors.wallet && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.wallet}</p>}
          {!errors.wallet && form.wallet && isValidSolanaAddress(form.wallet) && (
            <p className="text-[9px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />유효한 지갑 주소</p>
          )}
        </div>
      </div>

      {/* 거래 정보 */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">거래 정보</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>매출 (USDT)</label>
            <input
              type="number" min="0" step="any"
              value={form.sales}
              onChange={e => set('sales', e.target.value)}
              placeholder="예: 1000"
              className={inputCls}
            />
            {errors.sales && <p className="text-[9px] text-red-400 mt-1">{errors.sales}</p>}
          </div>

          <div>
            <label className={labelCls}>SOF 단가 (USD)</label>
            <input
              type="number" min="0" step="any"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="예: 4.00"
              className={inputCls}
            />
            {errors.price && <p className="text-[9px] text-red-400 mt-1">{errors.price}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>프로모션 비율 (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number" min="0" step="1"
              value={form.promotion}
              onChange={e => set('promotion', e.target.value)}
              placeholder="100"
              className={`${inputCls} flex-1`}
            />
            <span className="text-sm font-bold text-slate-400 flex-shrink-0">%</span>
          </div>
          {parseFloat(form.promotion) > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-slate-500">프로모션 배수:</span>
              <span className="text-xs font-bold text-[#00d4aa]">{(parseFloat(form.promotion) / 100).toFixed(1)}x</span>
              <span className="text-[9px] text-slate-500">(실질 {(parseFloat(form.promotion) / 100).toFixed(1)}배 지급)</span>
            </div>
          )}
          {errors.promotion && <p className="text-[9px] text-red-400 mt-1">{errors.promotion}</p>}
        </div>
      </div>

      {/* 계산 결과 */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)' }}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-xs font-bold text-[#00d4aa] uppercase tracking-wider">자동 계산</p>
        </div>

        {calc.isValid ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">프로모션 배수</span>
              <span className="text-xs font-bold text-amber-400">{calc.multiplier.toFixed(2)}x (프로모션 배수: {calc.multiplier.toFixed(1)}배)</span>
            </div>
            <div className="flex items-center justify-between border-t border-[rgba(0,212,170,0.1)] pt-2">
              <span className="text-sm font-bold text-white">최종 SOF 수량</span>
              <span className="text-xl font-bold text-[#00d4aa]">{formatNumber(calc.sofAmount, 4)} SOF</span>
            </div>
            <p className="text-[8px] text-slate-500">
              공식: ({formatNumber(parseFloat(form.sales) || 0, 2)} USDT ÷ ${formatNumber(parseFloat(form.price) || 0, 4)}) × {calc.multiplier.toFixed(2)} = {formatNumber(calc.sofAmount, 4)} SOF
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-slate-500">위 항목을 모두 입력하면 자동 계산됩니다.</p>
        )}
      </div>

      {/* 결과 메시지 */}
      {result && (
        <div className={`flex items-center gap-2 text-[11px] p-3 rounded-xl ${
          result.type === 'success'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {result.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {result.msg}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={submitting || !isReady}
        className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: isReady ? 'linear-gradient(135deg, #00d4aa, #3b82f6)' : 'rgba(148,163,184,0.1)' }}
      >
        <Send className="w-4 h-4" />
        {submitting ? '제출 중...' : '재단에 제출'}
      </button>
    </form>
  );
}