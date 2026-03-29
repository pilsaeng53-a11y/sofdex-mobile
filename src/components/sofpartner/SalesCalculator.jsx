/**
 * SalesCalculator.jsx
 * Full SOF Sales Partner operating panel with:
 * - draft save / load / clear
 * - last-value memory
 * - duplicate detection + confirmation
 * - enhanced validation
 * - copy buttons
 * - pre-submit summary card
 * - smart grade-aware defaults
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AlertCircle, CheckCircle, Send, Calculator, UserPlus, User,
  Save, Upload, RotateCcw, Copy, Check, AlertTriangle, Eye
} from 'lucide-react';
import { isValidSolanaAddress, formatNumber } from './SOFQuantityCalc';
import { base44 } from '@/api/base44Client';
import { DEV_MODE, DEV_WALLET } from '@/components/shared/devConfig';
import {
  calculateCustomerSOF,
  calculateRecommenderSOF,
  calculateCenterFeeSOF,
  submitSaleToFoundation,
  GRADE_CONFIG,
} from '@/services/partnerGradeService';
import {
  saveDraft, loadDraft, clearDraft,
  saveLastValues, loadLastValues,
  pushRecentCalc, pushRecentSubmit,
  checkDuplicate,
} from '@/services/partnerLocalStore';
import ResultSummaryPanel from './ResultSummaryPanel';

const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/40 outline-none transition-all";
const labelCls = "text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5";
const sectionHead = "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3";

const EMPTY_FORM = {
  customerName: '', customerWallet: '',
  salesKRW: '', usdtRate: '', sofPrice: '',
  promotionPercent: '', recommenderName: '', recommenderWallet: '', recommenderPercent: '',
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[8px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{msg}</p>;
}

function FieldWarn({ msg }) {
  if (!msg) return null;
  return <p className="text-[8px] text-amber-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" />{msg}</p>;
}

function CopyBtn({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(String(value ?? '')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" onClick={copy}
      className="flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-lg transition-all"
      style={{ color: copied ? '#22c55e' : '#94a3b8', background: 'rgba(148,163,184,0.06)' }}>
      {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
      {copied ? '복사됨' : (label || '복사')}
    </button>
  );
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

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const CFG = {
    '미입력':    { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    '계산 완료': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
    '중복 의심': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    '검토 필요': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
    '제출 가능': { color: '#00d4aa', bg: 'rgba(0,212,170,0.1)'  },
  };
  const c = CFG[status] || CFG['미입력'];
  return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ color: c.color, background: c.bg }}>
      {status}
    </span>
  );
}

// ─── Pre-submit confirmation card ──────────────────────────────────────────────
function SubmitConfirmCard({ calc, form, gradeInfo, onConfirm, onCancel, submitting }) {
  const gc = gradeInfo ? GRADE_CONFIG[gradeInfo.grade] : null;
  const fmt = n => n?.toFixed(4) ?? '—';
  const fullSummary = `고객: ${form.customerName}\n지갑: ${form.customerWallet}\n매출: ₩${Number(form.salesKRW).toLocaleString()}\n테더: ${fmt(calc.usdtAmount)} USDT\n기본: ${fmt(calc.baseQuantity)} SOF\n최종: ${fmt(calc.finalQuantity)} SOF\n추천인: ${fmt(calc.recommenderQuantity)} SOF\n센터피: ${fmt(calc.netCenterFee)} SOF`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.03)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,212,170,0.07)', borderBottom: '1px solid rgba(0,212,170,0.1)' }}>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">최종 제출 확인</span>
        </div>
        <div className="flex items-center gap-2">
          {gc && <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ color: gc.color, background: gc.bg }}>{gradeInfo.grade}</span>}
          <CopyBtn value={fullSummary} label="전체복사" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5 text-[9px]">
        <div className="grid grid-cols-2 gap-x-4">
          <Row label="고객 이름"    value={form.customerName} />
          <Row label="매출 (KRW)"  value={`₩${Number(form.salesKRW).toLocaleString()}`} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">고객 지갑</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-white truncate max-w-[120px]">{form.customerWallet}</span>
            <CopyBtn value={form.customerWallet} />
          </div>
        </div>
        <div className="border-t border-[rgba(148,163,184,0.07)] pt-1.5 space-y-1">
          <Row label="테더 시세"  value={`₩${Number(form.usdtRate).toLocaleString()}`} />
          <Row label="환산 USDT" value={`${fmt(calc.usdtAmount)} USDT`} color="#06b6d4" />
          <Row label="SOF 단가"  value={`$${form.sofPrice}`} />
          <Row label="기본 수량" value={`${fmt(calc.baseQuantity)} SOF`} />
          <Row label="프로모션"  value={`${form.promotionPercent}% (×${(parseFloat(form.promotionPercent)/100).toFixed(2)})`} color="#a78bfa" />
        </div>
        <div className="border-t border-[rgba(148,163,184,0.07)] pt-1.5 space-y-1 bg-[rgba(34,197,94,0.04)] -mx-4 px-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold">최종 고객 SOF</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-green-400">{fmt(calc.finalQuantity)}</span>
              <CopyBtn value={calc.finalQuantity?.toFixed(4)} />
            </div>
          </div>
          {calc.hasRecommender && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">추천인 수량</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-orange-400">{fmt(calc.recommenderQuantity)}</span>
                <CopyBtn value={calc.recommenderQuantity?.toFixed(4)} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">내 센터피</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400">{fmt(calc.netCenterFee)}</span>
              <CopyBtn value={calc.netCenterFee?.toFixed(4)} />
            </div>
          </div>
        </div>
        {gradeInfo && (
          <div className="border-t border-[rgba(148,163,184,0.07)] pt-1.5">
            <Row label={`등급 (${gradeInfo.grade})`} value={`프로모션 ${gradeInfo.promotionPercent}% · 센터피 ${gradeInfo.centerFeePercent}%`} color={gc?.color} />
          </div>
        )}
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-slate-400 border border-[rgba(148,163,184,0.1)] hover:border-slate-500 transition-all">
          수정하기
        </button>
        <button type="button" onClick={onConfirm} disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #3b82f6)' }}>
          <Send className="w-3.5 h-3.5" />
          {submitting ? '제출 중...' : '재단에 제출'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[8px] text-slate-500">{label}</span>
      <span className="text-[9px] font-bold" style={{ color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SalesCalculator({ partnerWallet, gradeInfo, onSubmitSuccess }) {
  const [form,          setForm]          = useState(() => {
    // Smart defaults: last values + grade defaults
    const last = loadLastValues();
    return {
      ...EMPTY_FORM,
      usdtRate:         last.usdtRate         || '1380',
      sofPrice:         last.sofPrice         || '',
      recommenderPercent: last.recommenderPercent || '',
    };
  });
  const [touched,       setTouched]       = useState({});
  const [promoLocked,   setPromoLocked]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitResult,  setSubmitResult]  = useState(null);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [dupWarning,    setDupWarning]    = useState(null);
  const [draftSavedAt,  setDraftSavedAt]  = useState(null);
  const [draftExists,   setDraftExists]   = useState(() => !!loadDraft());

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
    // Real-time duplicate check on wallet/name
    if (field === 'customerWallet' || field === 'customerName') setDupWarning(null);
  };

  const hasRecommender = form.recommenderName.trim() !== '' ||
    form.recommenderWallet.trim() !== '' ||
    form.recommenderPercent !== '';

  // ─── Calculations ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const salesKRW           = parseFloat(form.salesKRW);
    const usdtRate           = parseFloat(form.usdtRate);
    const sofPrice           = parseFloat(form.sofPrice);
    const promotionPercent   = parseFloat(form.promotionPercent);
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
      usdtAmount, baseQuantity, finalQuantity,
      recommenderQuantity, grossCenterFee, netCenterFee,
      hasRecommender: hasRecommender && recommenderPercent > 0,
    };
  }, [form, gradeInfo, hasRecommender]);

  // Log calc to local store when valid
  useEffect(() => {
    if (calc.isValid && form.customerName) {
      pushRecentCalc({
        customerName: form.customerName,
        salesKRW: form.salesKRW,
        finalQuantity: calc.finalQuantity,
        netCenterFee: calc.netCenterFee,
      });
    }
  }, [calc.isValid, calc.finalQuantity]);

  // ─── Validation ─────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};
    if (touched.customerName && !form.customerName.trim())                                         e.customerName    = '고객 이름을 입력해주세요';
    if (touched.customerWallet && !form.customerWallet.trim())                                     e.customerWallet  = '고객 지갑 주소를 입력해주세요';
    else if (touched.customerWallet && !isValidSolanaAddress(form.customerWallet))                 e.customerWallet  = '유효한 Solana 지갑 주소를 입력해주세요';
    if (touched.salesKRW    && (isNaN(parseFloat(form.salesKRW))   || parseFloat(form.salesKRW)   <= 0)) e.salesKRW        = '매출 금액을 입력해주세요 (양수)';
    if (touched.usdtRate    && (isNaN(parseFloat(form.usdtRate))   || parseFloat(form.usdtRate)   <= 0)) e.usdtRate        = '현재 테더 시세를 입력해주세요';
    if (touched.sofPrice    && (isNaN(parseFloat(form.sofPrice))   || parseFloat(form.sofPrice)   <= 0)) e.sofPrice        = 'SOF 단가를 입력해주세요';
    if (touched.promotionPercent && (isNaN(parseFloat(form.promotionPercent)) || parseFloat(form.promotionPercent) <= 0)) e.promotionPercent = '프로모션 비율을 입력해주세요';
    // Recommender % must not exceed center fee %
    const recPct  = parseFloat(form.recommenderPercent) || 0;
    const cfPct   = gradeInfo?.centerFeePercent ?? 0;
    if (hasRecommender && recPct > cfPct && cfPct > 0)                                             e.recommenderPercent = `추천인 수량이 센터피를 초과할 수 없습니다 (센터피: ${cfPct}%)`;
    return e;
  }, [form, touched, gradeInfo, hasRecommender]);

  const hasErrors = Object.keys(errors).length > 0;

  // Compute form status badge
  const formStatus = useMemo(() => {
    if (dupWarning)     return '중복 의심';
    if (hasErrors)      return '검토 필요';
    if (!calc.isValid)  return '미입력';
    if (!form.customerName.trim() || !isValidSolanaAddress(form.customerWallet)) return '검토 필요';
    return '제출 가능';
  }, [calc.isValid, hasErrors, dupWarning, form]);

  const isReady = formStatus === '제출 가능' || formStatus === '중복 의심';

  // ─── Draft operations ──────────────────────────────────────────────────────
  function handleSaveDraft() {
    saveDraft(form);
    setDraftSavedAt(new Date().toLocaleTimeString('ko-KR'));
    setDraftExists(true);
  }

  function handleLoadDraft() {
    const draft = loadDraft();
    if (draft) {
      const { savedAt, ...fields } = draft;
      setForm(f => ({ ...f, ...fields }));
      setTouched({});
      setDraftSavedAt(savedAt ? `저장: ${new Date(savedAt).toLocaleTimeString('ko-KR')}` : null);
    }
  }

  function handleReset() {
    const last = loadLastValues();
    setForm({ ...EMPTY_FORM, usdtRate: last.usdtRate || '1380', sofPrice: last.sofPrice || '', recommenderPercent: last.recommenderPercent || '' });
    setTouched({});
    setPromoLocked(false);
    setDupWarning(null);
    setShowConfirm(false);
    setSubmitResult(null);
  }

  // ─── Pre-submit: duplicate check ──────────────────────────────────────────
  function handleSubmitClick(e) {
    e.preventDefault();
    setTouched({ customerName: true, customerWallet: true, salesKRW: true, usdtRate: true, sofPrice: true, promotionPercent: true });
    if (!isReady) return;
    const dup = checkDuplicate(form.customerWallet, form.customerName, form.salesKRW);
    if (dup) setDupWarning(dup);
    setShowConfirm(true);
  }

  // ─── Final confirmed submission ────────────────────────────────────────────
  async function handleConfirmedSubmit() {
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

      // Save to DB
      await base44.entities.SOFSaleSubmission.create({
        partner_wallet:       payload.partnerWalletAddress,
        partner_grade:        payload.partnerGrade,
        customer_name:        payload.customerName,
        customer_wallet:      payload.customerWalletAddress,
        sales_krw:            payload.salesKRW,
        usdt_rate:            payload.usdtRate,
        purchase_amount:      payload.usdtAmount,
        sof_unit_price:       payload.sofPrice,
        promotion_percent:    payload.promotionPercent,
        base_quantity:        payload.baseQuantity,
        sof_quantity:         payload.finalCustomerQuantity,
        recommender_name:     payload.recommenderName,
        recommender_wallet:   payload.recommenderWalletAddress,
        recommender_percent:  payload.recommenderPercent,
        recommender_quantity: payload.recommenderQuantity,
        center_fee_percent:   payload.centerFeePercent,
        center_fee_gross:     calc.grossCenterFee,
        center_fee_quantity:  payload.myCenterFeeQuantity,
        status:               'Processing',
        status_history:       [{ status: 'Processing', changedAt: payload.submittedAt, note: '최초 제출' }],
        submitted_at:         payload.submittedAt,
      });

      // Persist to local store
      saveLastValues({ usdtRate: form.usdtRate, sofPrice: form.sofPrice, promotionPercent: form.promotionPercent, recommenderPercent: form.recommenderPercent });
      pushRecentSubmit({ customerName: form.customerName, customerWallet: form.customerWallet, salesKRW: form.salesKRW, finalQuantity: calc.finalQuantity });
      clearDraft();

      // Non-blocking foundation endpoint
      fetch('https://solfort-api.onrender.com/sales/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setSubmitResult({ type: 'success', msg: `제출 완료 (${new Date().toLocaleTimeString('ko-KR')})` });
      setShowConfirm(false);
      setDupWarning(null);
      setDraftExists(false);
      handleReset();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setSubmitResult({ type: 'error', msg: `오류: ${err.message}` });
    }
    setSubmitting(false);
  }

  const fmt4 = n => n?.toFixed(4) ?? '—';

  // If showing confirm card, render it instead of form
  if (showConfirm && calc.isValid) {
    return (
      <div className="space-y-3">
        {dupWarning && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-bold text-amber-400">중복 제출 가능성이 있습니다</p>
              <p className="text-[8px] text-slate-400 mt-0.5">{dupWarning}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">확인 후 계속 진행할 수 있습니다.</p>
            </div>
          </div>
        )}
        <SubmitConfirmCard
          calc={calc} form={form} gradeInfo={gradeInfo}
          onConfirm={handleConfirmedSubmit}
          onCancel={() => { setShowConfirm(false); setDupWarning(null); }}
          submitting={submitting}
        />
        {submitResult && (
          <div className={`flex items-center gap-2 text-[10px] p-3 rounded-xl ${submitResult.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {submitResult.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {submitResult.msg}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitClick} className="space-y-4">

      {/* ── Status + Draft toolbar ── */}
      <div className="flex items-center justify-between">
        <StatusBadge status={formStatus} />
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleSaveDraft}
            className="flex items-center gap-1 text-[8px] px-2.5 py-1.5 rounded-lg font-bold transition-all"
            style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', color: '#00d4aa' }}>
            <Save className="w-3 h-3" />임시저장
          </button>
          {draftExists && (
            <button type="button" onClick={handleLoadDraft}
              className="flex items-center gap-1 text-[8px] px-2.5 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6' }}>
              <Upload className="w-3 h-3" />불러오기
            </button>
          )}
          <button type="button" onClick={handleReset}
            className="flex items-center gap-1 text-[8px] px-2.5 py-1.5 rounded-lg font-bold text-slate-500 transition-all hover:text-slate-300"
            style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)' }}>
            <RotateCcw className="w-3 h-3" />초기화
          </button>
        </div>
      </div>
      {draftSavedAt && <p className="text-[7px] text-slate-600">임시저장: {draftSavedAt}</p>}

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
            onBlur={() => setTouched(t => ({ ...t, customerName: true }))}
            placeholder="홍길동" className={inputCls} />
          <FieldError msg={errors.customerName} />
        </div>
        <div>
          <label className={labelCls}>고객 지갑 주소 (Solana)</label>
          <div className="flex items-center gap-2">
            <input value={form.customerWallet} onChange={e => set('customerWallet', e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, customerWallet: true }))}
              placeholder="Solana 지갑 주소" className={`${inputCls} font-mono flex-1`} />
            {form.customerWallet && <CopyBtn value={form.customerWallet} />}
          </div>
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
            onChange={e => set('salesKRW', e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, salesKRW: true }))}
            placeholder="예: 3000000" className={inputCls} />
          <FieldError msg={errors.salesKRW} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>당일 테더 시세 (KRW/USDT)</label>
            <input type="number" min="0" step="any" value={form.usdtRate}
              onChange={e => set('usdtRate', e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, usdtRate: true }))}
              placeholder="예: 1380" className={inputCls} />
            <FieldError msg={errors.usdtRate} />
            {!errors.usdtRate && form.usdtRate && (
              <p className="text-[7px] text-slate-600 mt-0.5">마지막 사용값</p>
            )}
          </div>
          <div>
            <label className={labelCls}>SOF 단가 (USD)</label>
            <input type="number" min="0" step="any" value={form.sofPrice}
              onChange={e => set('sofPrice', e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, sofPrice: true }))}
              placeholder="예: 4.00" className={inputCls} />
            <FieldError msg={errors.sofPrice} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`${labelCls} mb-0`}>프로모션 비율 (%)</label>
            {gradeInfo && (
              <span className="text-[8px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
                {gradeInfo.grade} 기준: {gradeInfo.promotionPercent}%
              </span>
            )}
          </div>
          <input type="number" min="0" step="1" value={form.promotionPercent}
            onChange={e => set('promotionPercent', e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, promotionPercent: true }))}
            placeholder="예: 100" className={inputCls} />
          {promoLocked && gradeInfo && parseFloat(form.promotionPercent) !== gradeInfo.promotionPercent && (
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[8px] text-amber-400">⚠ 등급 기본값({gradeInfo.promotionPercent}%)에서 수동 변경됨</p>
              <button type="button" onClick={() => { setForm(f => ({ ...f, promotionPercent: String(gradeInfo.promotionPercent) })); setPromoLocked(false); }}
                className="text-[8px] text-[#00d4aa] underline">초기화</button>
            </div>
          )}
          <FieldError msg={errors.promotionPercent} />
        </div>

        {calc.isValid && (
          <div className="rounded-xl p-3 space-y-1 mt-1"
            style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
            <CalcRow label="환산 테더 수량" value={`${calc.usdtAmount.toFixed(2)} USDT`} color="#06b6d4" />
            <CalcRow label="기본 SOF 수량 (베이스)" value={`${fmt4(calc.baseQuantity)} SOF`} />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-green-400 font-bold">최종 고객 SOF 수량</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black font-mono text-green-400">{fmt4(calc.finalQuantity)}</span>
                <CopyBtn value={calc.finalQuantity?.toFixed(4)} />
              </div>
            </div>
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
              onChange={e => set('recommenderPercent', e.target.value)}
              placeholder="예: 5" className={inputCls} />
            <FieldError msg={errors.recommenderPercent} />
          </div>
        </div>
        <div>
          <label className={labelCls}>추천인 지갑 주소</label>
          <div className="flex items-center gap-2">
            <input value={form.recommenderWallet} onChange={e => set('recommenderWallet', e.target.value)}
              placeholder="Solana 주소 (선택)" className={`${inputCls} font-mono flex-1`} />
            {form.recommenderWallet && <CopyBtn value={form.recommenderWallet} />}
          </div>
        </div>
        {calc.isValid && calc.hasRecommender && (
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500">추천인 수량 (기본수량 × 추천인%)</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-black font-mono text-orange-400">{fmt4(calc.recommenderQuantity)}</span>
                <CopyBtn value={calc.recommenderQuantity?.toFixed(4)} />
              </div>
            </div>
            <p className="text-[8px] text-slate-600 mt-1">※ 추천인 수량은 프로모션 미적용 기본수량 기준</p>
          </div>
        )}
      </div>

      {/* ── My center fee ── */}
      {calc.isValid && gradeInfo && (
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className={sectionHead}>내 센터피 계산</p>
          <CalcRow label={`기본수량 × ${gradeInfo.centerFeePercent}%`} value={`${fmt4(calc.grossCenterFee)} SOF`} />
          {calc.hasRecommender && (
            <CalcRow label="− 추천인 공제" value={`− ${fmt4(calc.recommenderQuantity)} SOF`} color="#f87171" />
          )}
          <div className="flex items-center justify-between py-1.5 rounded-xl px-2" style={{ background: 'rgba(0,212,170,0.06)' }}>
            <span className="text-[9px] font-bold text-amber-400">내 최종 센터피 수량</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black font-mono text-amber-400">{fmt4(calc.netCenterFee)}</span>
              <CopyBtn value={calc.netCenterFee?.toFixed(4)} />
            </div>
          </div>
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
          {submitResult.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {submitResult.msg}
        </div>
      )}

      {/* ── Submit button ── */}
      <button type="submit" disabled={!isReady}
        className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: isReady ? 'linear-gradient(135deg, #00d4aa, #3b82f6)' : 'rgba(148,163,184,0.1)' }}>
        <Eye className="w-4 h-4" />
        제출 전 최종 확인
      </button>
    </form>
  );
}