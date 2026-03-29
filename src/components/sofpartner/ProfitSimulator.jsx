import React, { useState, useMemo } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';
import {
  calculateCustomerSOF,
  calculateRecommenderSOF,
  calculateCenterFeeSOF,
  GRADE_CONFIG,
} from '@/services/partnerGradeService';

const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/40 outline-none";
const labelCls = "text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1";

function SimRow({ label, value, color = '#e2e8f0', formula, highlight }) {
  return (
    <div className={`flex items-start justify-between py-2 ${highlight ? 'bg-[rgba(0,212,170,0.05)] -mx-3 px-3 rounded-lg' : ''} border-b border-[rgba(148,163,184,0.04)] last:border-0`}>
      <div>
        <p className={`text-[9px] ${highlight ? 'font-bold' : ''}`} style={{ color: highlight ? color : '#94a3b8' }}>{label}</p>
        {formula && <p className="text-[7px] text-slate-700 font-mono mt-0.5">{formula}</p>}
      </div>
      <p className="text-[10px] font-black ml-3 flex-shrink-0" style={{ color }}>{value}</p>
    </div>
  );
}

const DEFAULTS = {
  salesKRW: '3000000',
  usdtRate: '1380',
  sofPrice: '4.00',
  promotionPercent: '100',
  recommenderPercent: '5',
  centerFeePercent: '8',
};

export default function ProfitSimulator({ gradeInfo }) {
  const [form, setForm] = useState({
    ...DEFAULTS,
    promotionPercent: gradeInfo?.promotionPercent ? String(gradeInfo.promotionPercent) : DEFAULTS.promotionPercent,
    centerFeePercent: gradeInfo?.centerFeePercent ? String(gradeInfo.centerFeePercent) : DEFAULTS.centerFeePercent,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calc = useMemo(() => {
    const salesKRW = parseFloat(form.salesKRW);
    const usdtRate = parseFloat(form.usdtRate);
    const sofPrice = parseFloat(form.sofPrice);
    const promotionPercent = parseFloat(form.promotionPercent);
    const recommenderPercent = parseFloat(form.recommenderPercent) || 0;
    const centerFeePercent = parseFloat(form.centerFeePercent) || 0;

    if (!salesKRW || !usdtRate || !sofPrice || !promotionPercent) return null;

    const { usdtAmount, baseQuantity, finalQuantity } =
      calculateCustomerSOF({ salesKRW, usdtRate, sofPrice, promotionPercent });
    const recommenderQuantity = calculateRecommenderSOF({ baseQuantity, recommenderPercent });
    const { grossCenterFee, netCenterFee } =
      calculateCenterFeeSOF({ baseQuantity, centerFeePercent, recommenderQuantity });

    return { usdtAmount, baseQuantity, finalQuantity, recommenderQuantity, grossCenterFee, netCenterFee };
  }, [form]);

  function reset() {
    setForm({
      ...DEFAULTS,
      promotionPercent: gradeInfo?.promotionPercent ? String(gradeInfo.promotionPercent) : DEFAULTS.promotionPercent,
      centerFeePercent: gradeInfo?.centerFeePercent ? String(gradeInfo.centerFeePercent) : DEFAULTS.centerFeePercent,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-sm font-bold text-white">수익 시뮬레이터</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-300">
          <RotateCcw className="w-3 h-3" />초기화
        </button>
      </div>

      {/* Inputs */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">시뮬레이션 입력값</p>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>매출 (KRW)</label>
            <input type="number" value={form.salesKRW} onChange={e => set('salesKRW', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>테더 시세</label>
            <input type="number" value={form.usdtRate} onChange={e => set('usdtRate', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>SOF 단가 ($)</label>
            <input type="number" value={form.sofPrice} onChange={e => set('sofPrice', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>프로모션 (%)</label>
            <input type="number" value={form.promotionPercent} onChange={e => set('promotionPercent', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>추천인 % </label>
            <input type="number" value={form.recommenderPercent} onChange={e => set('recommenderPercent', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>센터피 %</label>
            <input type="number" value={form.centerFeePercent} onChange={e => set('centerFeePercent', e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* Step-by-step breakdown */}
      {calc ? (
        <div className="glass-card rounded-xl p-4 space-y-0.5">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-3">단계별 계산 결과</p>

          <div className="space-y-0">
            <p className="text-[7px] font-bold text-slate-600 uppercase mb-1">① KRW → USDT</p>
            <SimRow label="매출 (KRW)" value={`₩${formatNumber(parseFloat(form.salesKRW), 0)}`} />
            <SimRow label="테더 시세" value={`₩${form.usdtRate}`} />
            <SimRow label="환산 USDT" value={`${formatNumber(calc.usdtAmount, 2)} USDT`} color="#06b6d4"
              formula={`${form.salesKRW} ÷ ${form.usdtRate}`} highlight />
          </div>

          <div className="pt-2 space-y-0">
            <p className="text-[7px] font-bold text-slate-600 uppercase mb-1">② USDT → Base SOF</p>
            <SimRow label="SOF 단가" value={`$${form.sofPrice}`} />
            <SimRow label="기본 SOF 수량" value={`${formatNumber(calc.baseQuantity, 4)} SOF`} color="#94a3b8"
              formula={`${formatNumber(calc.usdtAmount, 2)} ÷ ${form.sofPrice}`} highlight />
          </div>

          <div className="pt-2 space-y-0">
            <p className="text-[7px] font-bold text-slate-600 uppercase mb-1">③ 프로모션 적용</p>
            <SimRow label="프로모션 배수" value={`${form.promotionPercent}% (×${(parseFloat(form.promotionPercent)/100).toFixed(2)})`} />
            <SimRow label="최종 고객 SOF" value={`${formatNumber(calc.finalQuantity, 4)} SOF`} color="#22c55e"
              formula={`기본 × ${form.promotionPercent}%`} highlight />
          </div>

          <div className="pt-2 space-y-0">
            <p className="text-[7px] font-bold text-slate-600 uppercase mb-1">④ 추천인 수량</p>
            <SimRow label="추천인 % (기본수량 기준)" value={`${form.recommenderPercent}%`} />
            <SimRow label="추천인 SOF" value={`${formatNumber(calc.recommenderQuantity, 4)} SOF`} color="#f97316"
              formula={`기본 × ${form.recommenderPercent}% (프로모션 미적용)`} highlight />
          </div>

          <div className="pt-2 space-y-0">
            <p className="text-[7px] font-bold text-slate-600 uppercase mb-1">⑤ 내 센터피</p>
            <SimRow label={`센터피 (기본×${form.centerFeePercent}%)`} value={`${formatNumber(calc.grossCenterFee, 4)} SOF`} />
            <SimRow label="추천인 차감" value={`−${formatNumber(calc.recommenderQuantity, 4)} SOF`} color="#f87171" />
            <SimRow label="내 최종 센터피" value={`${formatNumber(calc.netCenterFee, 4)} SOF`} color="#fbbf24" highlight />
          </div>

          {/* Summary box */}
          <div className="mt-4 pt-3 border-t border-[rgba(148,163,184,0.08)] grid grid-cols-3 gap-2 text-center">
            <div className="bg-[rgba(34,197,94,0.06)] rounded-lg p-2">
              <p className="text-[7px] text-slate-500 mb-0.5">고객 SOF</p>
              <p className="text-[10px] font-black text-green-400">{formatNumber(calc.finalQuantity, 2)}</p>
            </div>
            <div className="bg-[rgba(249,115,22,0.06)] rounded-lg p-2">
              <p className="text-[7px] text-slate-500 mb-0.5">추천인 SOF</p>
              <p className="text-[10px] font-black text-orange-400">{formatNumber(calc.recommenderQuantity, 2)}</p>
            </div>
            <div className="bg-[rgba(251,191,36,0.06)] rounded-lg p-2">
              <p className="text-[7px] text-slate-500 mb-0.5">내 센터피</p>
              <p className="text-[10px] font-black text-amber-400">{formatNumber(calc.netCenterFee, 2)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center text-slate-500 text-sm">입력값을 입력하면 계산 결과가 표시됩니다</div>
      )}
    </div>
  );
}