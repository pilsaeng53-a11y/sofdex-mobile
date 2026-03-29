/**
 * SalesCalculator.jsx
 * Full SOF Sales Partner operating panel.
 * Handles: customer calc, recommender, center fee, grade-aware, foundation submission.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, Calculator, UserPlus, User } from 'lucide-react';
import { isValidSolanaAddress } from './SOFQuantityCalc';
import { base44 } from '@/api/base44Client';
import { DEV_MODE, DEV_WALLET } from '@/components/shared/devConfig';
import {
  calculateCustomerSOF,
  calculateRecommenderSOF,
  calculateCenterFeeSOF,
  submitSaleToFoundation,
  GRADE_CONFIG,
} from '@/services/partnerGradeService';
import ResultSummaryPanel from './ResultSummaryPanel';

const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/40 outline-none transition-all";
const labelCls = "text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5";
const sectionHead = "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3";

const EMPTY_FORM = {
  customerName:    '',
  customerWallet:  '',
  salesKRW:        '',
  usdtRate:        '1380',
  sofPrice:        '',
  promotionPercent:'',
  recommenderName:     '',
  recommenderWallet:   '',
  recommenderPercent:  '',
};

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[8px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{msg}</p>;
}

function CalcRow({ label, value, color, highlight }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${highlight ? 'rounded-xl px-2' : ''}`}
      style={highlight ? { background: 'rgba(0,212,170,0.06)' } : {}}>
      <span className="text-[9px] text-slate-500">{label}</span>
      <span className="text-[12px] font-black font-mono" style={{ color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

export default function SalesCalculator({ partnerWallet, gradeInfo, onSubmitSuccess }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [touched, setTouched]     = useState({});
  const [promoLocked, setPromoLocked] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const grade = gradeInfo ? GRADE_CONFIG[gradeInfo.grade] : null;

  // Auto-fill promotion from grade when grade data arrives
  useEffect(() => {
    if (gradeInfo?.promotionPercent != null && !promoLocked) {
      setForm(f => ({ ...f, promotionPercent: String(gradeInfo.promotionPercent) }));
    }
  }, [gradeInfo?.promotionPercent]);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setTouched(t => ({ ...t, [field]: true }));
    if (field === 'promotionPercent') setPromoLocked(true);
  };

  const hasRecommender = form.recommenderName.trim() !== '' ||
    form.recommenderWallet.trim() !== '' ||
    form.recommenderPercent !== '';

  // ─── Calculations ──────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const salesKRW        = parseFloat(form.salesKRW);
    const usdtRate        = parseFloat(form.usdtRate);
    const sofPrice        = parseFloat(form.sofPrice);
    const promotionPercent = parseFloat(form.promotionPercent);
    const recommenderPercent = parseFloat(form.recommenderPercent) || 0;
    const centerFeePercent   = gradeInfo?.centerFeePercent ?? 0;

    if (!salesKRW || !usdtRate || !sofPrice || !promotionPercent ||
        salesKRW <= 0 || usdtRate <= 0 || sofPrice <= 0 || promotionPercent <= 0) {
      return { isValid: false };
    }

    const { usdtAmount, baseQuantity, finalQuantity } =
      calculateCustomerSOF({ salesKRW, usdtRate, sofPrice, promotionPercent });

    const recommenderQuantity = hasRecommender && recommenderPercent > 0
      ? calculateRecommenderSOF({ baseQuantity, recommenderPercent })
      : 0;

    const { grossCenterFee, netCenterFee } =
      calculateCenterFeeSOF({ baseQuantity, centerFeePercent, recommenderQuantity });

    return {
      isValid: true,
      usdtAmount,
      baseQuantity,
      finalQuantity,
      recommenderQuantity,
      grossCenterFee,
      netCenterFee,
      hasRecommender: hasRecommender && recommenderPercent > 0,
    };
  }, [form, gradeInfo, hasRecommender]);

  // ─── Errors ────────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};
    if (touched.customerName && !form.customerName.trim()) e.customerName = '필수입력';
    if (touched.customerWallet) {
      if (!form.customerWallet.trim()) e.customerWallet = '필수입력';
      else if (!isValidSolanaAddress(form.customerWallet)) e.customerWallet = '유효한 Solana 주소 필요';
    }
    if (touched.salesKRW && (isNaN(parseFloat(form.salesKRW)) || parseFloat(form.salesKRW) <= 0)) e.salesKRW = '양수 입력';
    if (touched.usdtRate && (isNaN(parseFloat(form.usdtRate)) || parseFloat(form.usdtRate) <= 0)) e.usdtRate = '양수 입력';
    if (touched.sofPrice && (isNaN(parseFloat(form.sofPrice)) || parseFloat(form.sofPrice) <= 0)) e.sofPrice = '양수 입력';
    if (touched.promotionPercent && (isNaN(parseFloat(form.promotionPercent)) || parseFloat(form.promotionPercent) <= 0)) e.promotionPercent = '양수 입력';
    return e;
  }, [form, touched]);

  const isReady = calc.isValid &&
    form.customerName.trim() &&
    isValidSolanaAddress(form.customerWallet);

  // ─── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ customerName: true, customerWallet: true, salesKRW: true, usdtRate: true, sofPrice: true, promotionPercent: true });
    if (!isReady) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const payload = {
        customerName:             form.customerName.trim(),
        customerWalletAddress:    form.customerWallet.trim(),
        salesKRW:                 parseFloat(form.salesKRW),
        usdtRate:                 parseFloat(form.usdtRate),
        usdtAmount:               calc.usdtAmount,
        sofPrice:                 parseFloat(form.sofPrice),
        promotionPercent:         parseFloat(form.promotionPercent),
        promotionMultiplier:      parseFloat(form.promotionPercent) / 100,
        baseQuantity:             calc.baseQuantity,
        finalCustomerQuantity:    calc.finalQuantity,
        partnerWalletAddress:     DEV_MODE ? DEV_WALLET : partnerWallet,
        partnerGrade:             gradeInfo?.grade ?? null,
        centerFeePercent:         gradeInfo?.centerFeePercent ?? 0,
        myCenterFeeQuantity:      calc.netCenterFee,
        recommenderName:          form.recommenderName.trim() || null,
        recommenderWalletAddress: form.recommenderWallet.trim() || null,
        recommenderPercent:       parseFloat(form.recommenderPercent) || 0,
        recommenderQuantity:      calc.recommenderQuantity,
        submittedAt:              new Date().toISOString(),
      };
      // Save to internal DB
      await base44.entities.SOFSaleSubmission.create({
        partner_wallet:     payload.partnerWalletAddress,
        customer_name:      payload.customerName,
        customer_wallet:    payload.customerWalletAddress,
        purchase_amount:    payload.usdtAmount,
        sof_unit_price:     payload.sofPrice,
        promotion_percent:  payload.promotionPercent,
        sof_quantity:       payload.finalCustomerQuantity,
        status:             'Processing',
        submitted_at:       payload.submittedAt,
      });
      // POST to foundation endpoint (non-blocking)
      fetch('https://solfort-api.onrender.com/sales/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
      setSubmitResult({ type: 'success', msg: `제출 완료 (${new Date().toLocaleTimeString('ko-KR')})` });
      setForm(EMPTY_FORM);
      setTouched({});
      setPromoLocked(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setSubmitResult({ type: 'error', msg: `오류: ${err.message}` });
    }
    setSubmitting(false);
  }

  const fmt4 = n => n?.toFixed(4) ?? '—';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Grade info banner ── */}
      {gradeInfo && grade && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: grade.bg, border: `1px solid ${grade.border}` }}>
          <div>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mb-0.5">활성 등급</p>
            <span className="text-[13px] font-black" style={{ color: grade.color }}>{grade.label}</span>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-500 mb-0.5">프로모션 / 센터피</p>
            <p className="text-[11px] font-black font-mono" style={{ color: grade.color }}>
              {gradeInfo.promotionPercent}% · {gradeInfo.centerFeePercent}%
            </p>
          </div>
        </div>
      )}
      {!gradeInfo && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
          <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
          <p className="text-[10px] text-slate-500">등급 미등록 — 수동으로 프로모션 비율 입력</p>
        </div>
      )}

      {/* ── Customer info ── */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <p className={sectionHead}><User className="w-3 h-3 inline mr-1.5" />고객 정보</p>
        <div>
          <label className={labelCls}>고객 이름</label>
          <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
            placeholder="홍길동" className={inputCls} />
          <FieldError msg={errors.customerName} />
        </div>
        <div>
          <label className={labelCls}>고객 지갑 주소 (Solana)</label>
          <input value={form.customerWallet} onChange={e => set('customerWallet', e.target.value)}
            placeholder="Solana 지갑 주소" className={`${inputCls} font-mono`} />
          <FieldError msg={errors.customerWallet} />
          {!errors.customerWallet && form.customerWallet && isValidSolanaAddress(form.customerWallet) && (
            <p className="text-[8px] text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" />유효한 지갑 주소
            </p>
          )}
        </div>
      </div>

      {/* ── Purchase detail ── */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <p className={sectionHead}><Calculator className="w-3 h-3 inline mr-1.5" />구매 상세</p>

        <div>
          <label className={labelCls}>투자액 / 매출 (KRW)</label>
          <input type="number" min="0" step="any" value={form.salesKRW}
            onChange={e => set('salesKRW', e.target.value)} placeholder="예: 3000000" className={inputCls} />
          <FieldError msg={errors.salesKRW} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>당일 테더 시세 (KRW/USDT)</label>
            <input type="number" min="0" step="any" value={form.usdtRate}
              onChange={e => set('usdtRate', e.target.value)} placeholder="예: 1380" className={inputCls} />
            <FieldError msg={errors.usdtRate} />
          </div>
          <div>
            <label className={labelCls}>SOF 단가 (USD)</label>
            <input type="number" min="0" step="any" value={form.sofPrice}
              onChange={e => set('sofPrice', e.target.value)} placeholder="예: 4.00" className={inputCls} />
            <FieldError msg={errors.sofPrice} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`${labelCls} mb-0`}>프로모션 비율 (%)</label>
            {gradeInfo && (
              <span className="text-[8px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
                {gradeInfo.grade} 등급 기준: {gradeInfo.promotionPercent}%
              </span>
            )}
          </div>
          <input type="number" min="0" step="1" value={form.promotionPercent}
            onChange={e => set('promotionPercent', e.target.value)} placeholder="예: 100" className={inputCls} />
          {promoLocked && gradeInfo && parseFloat(form.promotionPercent) !== gradeInfo.promotionPercent && (
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[8px] text-amber-400">⚠ 등급 기본값({gradeInfo.promotionPercent}%)에서 수동 변경됨</p>
              <button type="button" onClick={() => { setForm(f => ({ ...f, promotionPercent: String(gradeInfo.promotionPercent) })); setPromoLocked(false); }}
                className="text-[8px] text-[#00d4aa] underline">초기화</button>
            </div>
          )}
          <FieldError msg={errors.promotionPercent} />
        </div>

        {/* Inline calc results */}
        {calc.isValid && (
          <div className="rounded-xl p-3 space-y-1 mt-1"
            style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
            <CalcRow label="환산 테더 수량" value={`${calc.usdtAmount.toFixed(2)} USDT`} color="#06b6d4" />
            <CalcRow label="기본 SOF 수량 (베이스)" value={`${fmt4(calc.baseQuantity)} SOF`} />
            <CalcRow label="최종 고객 SOF 수량" value={`${fmt4(calc.finalQuantity)} SOF`} color="#22c55e" highlight />
          </div>
        )}
      </div>

      {/* ── Recommender ── */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <p className={sectionHead}><UserPlus className="w-3 h-3 inline mr-1.5" />추천인 (선택)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>추천인 이름</label>
            <input value={form.recommenderName} onChange={e => set('recommenderName', e.target.value)}
              placeholder="선택사항" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>추천인 퍼센트 (%)</label>
            <input type="number" min="0" step="any" value={form.recommenderPercent}
              onChange={e => set('recommenderPercent', e.target.value)} placeholder="예: 5" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>추천인 지갑 주소</label>
          <input value={form.recommenderWallet} onChange={e => set('recommenderWallet', e.target.value)}
            placeholder="Solana 주소 (선택)" className={`${inputCls} font-mono`} />
        </div>
        {calc.isValid && calc.hasRecommender && (
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)' }}>
            <CalcRow label="추천인 수량 (기본수량 × 추천인%)" value={`${fmt4(calc.recommenderQuantity)} SOF`} color="#f97316" />
            <p className="text-[8px] text-slate-600 mt-1">※ 추천인 수량은 프로모션 미적용 기본수량 기준</p>
          </div>
        )}
      </div>

      {/* ── My center fee ── */}
      {calc.isValid && gradeInfo && (
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className={sectionHead}>내 센터피 계산</p>
          <CalcRow label={`내 기준 기본수량 × ${gradeInfo.centerFeePercent}%`}
            value={`${fmt4(calc.grossCenterFee)} SOF`} />
          {calc.hasRecommender && (
            <CalcRow label="− 추천인 공제" value={`− ${fmt4(calc.recommenderQuantity)} SOF`} color="#f87171" />
          )}
          <CalcRow label="내 최종 센터피 수량" value={`${fmt4(calc.netCenterFee)} SOF`} color="#fbbf24" highlight />
        </div>
      )}

      {/* ── Result summary ── */}
      {calc.isValid && (
        <ResultSummaryPanel calc={calc} form={form} gradeInfo={gradeInfo} />
      )}

      {/* ── Submit result ── */}
      {submitResult && (
        <div className={`flex items-center gap-2 text-[10px] p-3 rounded-xl ${
          submitResult.type === 'success'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {submitResult.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {submitResult.msg}
        </div>
      )}

      {/* ── Submit button ── */}
      <button type="submit" disabled={submitting || !isReady}
        className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: isReady ? 'linear-gradient(135deg, #00d4aa, #3b82f6)' : 'rgba(148,163,184,0.1)' }}>
        <Send className="w-4 h-4" />
        {submitting ? '제출 중...' : '재단에 제출'}
      </button>
    </form>
  );
}