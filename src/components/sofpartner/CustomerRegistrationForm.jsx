import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { calcSOFQuantity, isValidSolanaAddress, formatNumber } from './SOFQuantityCalc';
import { submitSale } from '@/services/solfortApi';
import { AlertCircle, CheckCircle, Send, Calculator, Info } from 'lucide-react';
import { useLang } from '@/components/shared/LanguageContext';
import { DEV_MODE, DEV_WALLET } from '@/components/shared/devConfig';

const inputCls = "w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/40 outline-none transition-all";
const labelCls = "text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5";

const EMPTY_FORM = {
  customer_name: '',
  customer_wallet: '',
  purchase_amount: '',
  sof_unit_price: '',
  promotion_percent: '0',
};

export default function CustomerRegistrationForm({ partnerWallet, onSubmitSuccess }) {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [touched, setTouched] = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setTouched(tt => ({ ...tt, [field]: true }));
  };

  const calc = useMemo(() => {
    const result = calcSOFQuantity(form.purchase_amount, form.sof_unit_price, form.promotion_percent);
    // Add effective SOF price for display
    const sp = parseFloat(form.sof_unit_price);
    const mult = result.multiplier || 0;
    result.effectiveSOFPrice = (result.isValid && mult > 0) ? sp / mult : 0;
    return result;
  }, [form.purchase_amount, form.sof_unit_price, form.promotion_percent]);

  const errors = useMemo(() => {
    const e = {};
    if (touched.customer_name && !form.customer_name.trim()) e.customer_name = t('sof_reg_required');
    if (touched.customer_wallet) {
      if (!form.customer_wallet.trim()) e.customer_wallet = t('sof_reg_required');
      else if (!isValidSolanaAddress(form.customer_wallet)) e.customer_wallet = t('sof_reg_invalid_wallet');
    }
    if (touched.purchase_amount && (isNaN(parseFloat(form.purchase_amount)) || parseFloat(form.purchase_amount) <= 0))
      e.purchase_amount = t('sof_reg_positive_num');
    if (touched.sof_unit_price && (isNaN(parseFloat(form.sof_unit_price)) || parseFloat(form.sof_unit_price) <= 0))
      e.sof_unit_price = t('sof_reg_positive_num');
    if (touched.promotion_percent) {
      const pp = parseFloat(form.promotion_percent);
      if (isNaN(pp) || pp <= 0) e.promotion_percent = '프로모션 비율은 0보다 커야 합니다 (100 = 1배)';
    }
    return e;
  }, [form, touched, t]);

  const isFormReady =
    form.customer_name.trim() &&
    isValidSolanaAddress(form.customer_wallet) &&
    parseFloat(form.purchase_amount) > 0 &&
    parseFloat(form.sof_unit_price) > 0 &&
    parseFloat(form.promotion_percent) > 0 &&
    calc.isValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ customer_name: true, customer_wallet: true, purchase_amount: true, sof_unit_price: true, promotion_percent: true });
    if (!isFormReady) return;

    setSubmitting(true);
    setResult(null);
    try {
      // Save to internal DB
      await base44.entities.SOFSaleSubmission.create({
        partner_wallet: DEV_MODE ? DEV_WALLET : partnerWallet,
        customer_name: form.customer_name.trim(),
        customer_wallet: form.customer_wallet.trim(),
        purchase_amount: parseFloat(form.purchase_amount),
        sof_unit_price: parseFloat(form.sof_unit_price),
        promotion_percent: parseFloat(form.promotion_percent),
        sof_quantity: calc.sofQuantity,
        status: 'Processing',
        submitted_at: new Date().toISOString(),
      });
      // Also POST to live API
      await submitSale({
        customerName: form.customer_name.trim(),
        walletAddress: form.customer_wallet.trim(),
        sales: parseFloat(form.purchase_amount),
        quantity: calc.sofQuantity,
        price: parseFloat(form.sof_unit_price),
        promotion: parseFloat(form.promotion_percent),
        sofAmount: calc.sofQuantity,
      }).catch(() => {}); // non-blocking — internal DB is source of truth

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setResult({ type: 'error', msg: t('sof_reg_error') });
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Info */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('sof_reg_customer_info')}</p>

        <div>
          <label className={labelCls}>{t('sof_reg_customer_name')}</label>
          <input
            value={form.customer_name}
            onChange={e => set('customer_name', e.target.value)}
            placeholder={t('sof_reg_customer_name_ph')}
            className={inputCls}
          />
          {errors.customer_name && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.customer_name}</p>}
        </div>

        <div>
          <label className={labelCls}>{t('sof_reg_wallet')}</label>
          <input
            value={form.customer_wallet}
            onChange={e => set('customer_wallet', e.target.value)}
            placeholder={t('sof_reg_wallet_ph')}
            className={`${inputCls} font-mono`}
          />
          {errors.customer_wallet && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.customer_wallet}</p>}
          {!errors.customer_wallet && form.customer_wallet && isValidSolanaAddress(form.customer_wallet) && (
            <p className="text-[9px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{t('sof_reg_valid_addr')}</p>
          )}
        </div>
      </div>

      {/* Purchase Details */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('sof_reg_purchase_details')}</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('sof_reg_purchase_amount')}</label>
            <input
              type="number" min="0" step="any"
              value={form.purchase_amount}
              onChange={e => set('purchase_amount', e.target.value)}
              placeholder="e.g. 1000"
              className={inputCls}
            />
            {errors.purchase_amount && <p className="text-[9px] text-red-400 mt-1">{errors.purchase_amount}</p>}
          </div>

          <div>
            <label className={labelCls}>{t('sof_reg_sof_price')}</label>
            <input
              type="number" min="0" step="any"
              value={form.sof_unit_price}
              onChange={e => set('sof_unit_price', e.target.value)}
              placeholder="e.g. 4.00"
              className={inputCls}
            />
            {errors.sof_unit_price && <p className="text-[9px] text-red-400 mt-1">{errors.sof_unit_price}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>프로모션 비율 (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number" min="0" step="1"
              value={form.promotion_percent}
              onChange={e => set('promotion_percent', e.target.value)}
              placeholder="100"
              className={`${inputCls} flex-1`}
            />
            <span className="text-sm font-bold text-slate-400 flex-shrink-0">%</span>
          </div>
          {/* Real-time multiplier display */}
          {parseFloat(form.promotion_percent) > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-slate-500">프로모션 배수:</span>
              <span className="text-xs font-bold text-[#00d4aa]">{(parseFloat(form.promotion_percent) / 100).toFixed(1)}x</span>
              <span className="text-[9px] text-slate-500">(실질 {(parseFloat(form.promotion_percent) / 100).toFixed(1)}배 지급)</span>
            </div>
          )}
          {errors.promotion_percent && <p className="text-[9px] text-red-400 mt-1">{errors.promotion_percent}</p>}
        </div>
      </div>

      {/* Auto-calculated SOF Quantity */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)' }}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-xs font-bold text-[#00d4aa] uppercase tracking-wider">{t('sof_reg_auto_calc')}</p>
        </div>

        {calc.isValid ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">프로모션 배수</span>
              <span className="text-xs font-bold text-amber-400">{calc.multiplier.toFixed(2)}x ({calc.multiplier.toFixed(1)}배)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">실효 SOF 가격</span>
              <span className="text-xs font-bold text-slate-200">${formatNumber(calc.effectiveSOFPrice, 4)} / SOF</span>
            </div>
            <div className="flex items-center justify-between border-t border-[rgba(0,212,170,0.1)] pt-2">
              <span className="text-sm font-bold text-white">최종 SOF 수량</span>
              <span className="text-xl font-bold text-[#00d4aa]">{formatNumber(calc.sofQuantity, 4)} SOF</span>
            </div>
            <p className="text-[8px] text-slate-500">
              공식: ({formatNumber(parseFloat(form.purchase_amount) || 0, 2)} USDT ÷ ${formatNumber(parseFloat(form.sof_unit_price) || 0, 4)}) × {calc.multiplier.toFixed(2)} = {formatNumber(calc.sofQuantity, 4)} SOF
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Info className="w-3.5 h-3.5" />
            {calc.errorMsg || t('sof_reg_enter_details')}
          </div>
        )}
      </div>

      {/* Result message */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !isFormReady}
        className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: isFormReady ? 'linear-gradient(135deg, #00d4aa, #3b82f6)' : 'rgba(148,163,184,0.1)' }}
      >
        <Send className="w-4 h-4" />
        {submitting ? t('sof_reg_sending') : t('sof_reg_send')}
      </button>

      <p className="text-[8px] text-slate-600 text-center">{t('sof_reg_footer')}</p>
    </form>
  );
}