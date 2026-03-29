import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

function Step({ step, value, formula, highlight = false }) {
  return (
    <div className={`flex items-start justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0 ${highlight ? 'bg-[rgba(0,212,170,0.03)] -mx-3 px-3 rounded' : ''}`}>
      <div>
        <p className={`text-[9px] font-bold ${highlight ? 'text-[#00d4aa]' : 'text-slate-300'}`}>{step}</p>
        {formula && <p className="text-[7px] text-slate-600 mt-0.5 font-mono">{formula}</p>}
      </div>
      <p className={`text-[9px] font-black ml-4 flex-shrink-0 ${highlight ? 'text-[#00d4aa]' : 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function CalcLogPanel({ record }) {
  const [open, setOpen] = useState(false);

  if (!record) {
    return (
      <div className="glass-card rounded-xl p-4 text-center">
        <Calculator className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">제출 내역을 선택하면 계산 로그가 표시됩니다</p>
      </div>
    );
  }

  const {
    purchase_amount: usdt = 0,
    sof_unit_price: sofPrice = 1,
    promotion_percent: promo = 0,
    recommender_percent: recPct = 0,
    center_fee_percent: cfPct = 0,
    sof_quantity: finalQty = 0,
    recommender_quantity: recQty = 0,
    center_fee_quantity: cfQty = 0,
  } = record;

  const baseQty   = sofPrice > 0 ? usdt / sofPrice : 0;
  const promoQty  = baseQty * (promo / 100);
  const totalQty  = baseQty + promoQty;
  const grossCF   = baseQty * (cfPct / 100);
  const netCF     = Math.max(0, grossCF - (recQty || 0));

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-xs font-bold text-white">계산 로그 — {record.customer_name || '고객'}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-1 border-t border-[rgba(148,163,184,0.06)]">
          <div className="pt-3">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">입력값</p>
            <Step step="매입 금액" value={`${formatNumber(usdt, 2)} USDT`} formula="고객 지불액" />
            <Step step="SOF 단가" value={`$${formatNumber(sofPrice, 4)}`} formula="제출 시점 단가" />
            <Step step="프로모션" value={`${promo}%`} formula={`파트너 등급 적용 배율`} />
          </div>

          <div className="pt-3">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">고객 수량 계산</p>
            <Step step="기본 수량" value={`${formatNumber(baseQty, 4)} SOF`} formula={`USDT ÷ SOF단가 = ${formatNumber(usdt, 2)} ÷ ${formatNumber(sofPrice, 4)}`} />
            <Step step="프로모션 증분" value={`+${formatNumber(promoQty, 4)} SOF`} formula={`기본수량 × ${promo}% = ${formatNumber(baseQty, 2)} × ${promo / 100}`} />
            <Step step="고객 최종 수량" value={`${formatNumber(totalQty, 4)} SOF`} formula="기본 + 프로모션 증분" highlight />
          </div>

          {(recQty > 0 || recPct > 0) && (
            <div className="pt-3">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">추천인 수량</p>
              <Step step="추천인 비율" value={`${recPct}%`} />
              <Step step="추천인 수량" value={`${formatNumber(recQty || baseQty * recPct / 100, 4)} SOF`}
                formula={`기본수량 × ${recPct}% = ${formatNumber(baseQty, 2)} × ${recPct / 100}`}
                highlight />
            </div>
          )}

          {(cfQty > 0 || cfPct > 0) && (
            <div className="pt-3">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">센터피 계산</p>
              <Step step="총 센터피 (gross)" value={`${formatNumber(grossCF, 4)} SOF`} formula={`기본수량 × ${cfPct}%`} />
              <Step step="추천인 차감" value={`−${formatNumber(recQty || 0, 4)} SOF`} />
              <Step step="순 센터피 (net)" value={`${formatNumber(cfQty || netCF, 4)} SOF`} formula="총 센터피 − 추천인 수량" highlight />
            </div>
          )}

          <div className="pt-3 bg-[rgba(0,212,170,0.04)] -mx-4 px-4 pb-1 border-t border-[rgba(0,212,170,0.08)]">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">최종 발행 수량 요약</p>
            <Step step="고객 수령" value={`${formatNumber(finalQty || totalQty, 4)} SOF`} highlight />
            {recQty > 0 && <Step step="추천인 수령" value={`${formatNumber(recQty, 4)} SOF`} />}
            {(cfQty || netCF) > 0 && <Step step="센터 수령" value={`${formatNumber(cfQty || netCF, 4)} SOF`} />}
          </div>
        </div>
      )}
    </div>
  );
}