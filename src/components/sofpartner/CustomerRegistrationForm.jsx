import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { calcSOFQuantity, isValidSolanaAddress, formatNumber } from './SOFQuantityCalc';
import { AlertCircle, CheckCircle, Send, Calculator, Info } from 'lucide-react';

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
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', msg }
  const [touched, setTouched] = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  // ── Reactive calculation ──────────────────────────────────────────────────
  const calc = useMemo(() => {
    return calcSOFQuantity(form.purchase_amount, form.sof_unit_price, form.promotion_percent);
  }, [form.purchase_amount, form.sof_unit_price, form.promotion_percent]);

  // ── Validation ────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};
    if (touched.customer_name && !form.customer_name.trim()) e.customer_name = 'Required';
    if (touched.customer_wallet) {
      if (!form.customer_wallet.trim()) e.customer_wallet = 'Required';
      else if (!isValidSolanaAddress(form.customer_wallet)) e.customer_wallet = 'Invalid Solana address format';
    }
    if (touched.purchase_amount && (isNaN(parseFloat(form.purchase_amount)) || parseFloat(form.purchase_amount) <= 0))
      e.purchase_amount = 'Must be a positive number';
    if (touched.sof_unit_price && (isNaN(parseFloat(form.sof_unit_price)) || parseFloat(form.sof_unit_price) <= 0))
      e.sof_unit_price = 'Must be a positive number';
    if (touched.promotion_percent) {
      const pp = parseFloat(form.promotion_percent);
      if (isNaN(pp) || pp < 0 || pp > 100) e.promotion_percent = 'Must be 0–100';
    }
    return e;
  }, [form, touched]);

  const isFormReady =
    form.customer_name.trim() &&
    isValidSolanaAddress(form.customer_wallet) &&
    parseFloat(form.purchase_amount) > 0 &&
    parseFloat(form.sof_unit_price) > 0 &&
    parseFloat(form.promotion_percent) >= 0 &&
    parseFloat(form.promotion_percent) <= 100 &&
    calc.isValid;

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    // Touch all fields to trigger validation
    setTouched({ customer_name: true, customer_wallet: true, purchase_amount: true, sof_unit_price: true, promotion_percent: true });
    if (!isFormReady) return;

    setSubmitting(true);
    setResult(null);
    try {
      await base44.entities.SOFSaleSubmission.create({
        partner_wallet: partnerWallet,
        customer_name: form.customer_name.trim(),
        customer_wallet: form.customer_wallet.trim(),
        purchase_amount: parseFloat(form.purchase_amount),
        sof_unit_price: parseFloat(form.sof_unit_price),
        promotion_percent: parseFloat(form.promotion_percent),
        sof_quantity: calc.sofQuantity,
        status: 'Processing',
        submitted_at: new Date().toISOString(),
      });

      setResult({ type: 'success', msg: 'Submission sent to Foundation. Status: Processing.' });
      setForm(EMPTY_FORM);
      setTouched({});
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setResult({ type: 'error', msg: 'Submission failed. Please try again.' });
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Info */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Customer Information</p>

        <div>
          <label className={labelCls}>Customer Name *</label>
          <input
            value={form.customer_name}
            onChange={e => set('customer_name', e.target.value)}
            placeholder="Full name of the customer"
            className={inputCls}
          />
          {errors.customer_name && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.customer_name}</p>}
        </div>

        <div>
          <label className={labelCls}>Customer Wallet Address *</label>
          <input
            value={form.customer_wallet}
            onChange={e => set('customer_wallet', e.target.value)}
            placeholder="Solana wallet address (base58)"
            className={`${inputCls} font-mono`}
          />
          {errors.customer_wallet && <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.customer_wallet}</p>}
          {!errors.customer_wallet && form.customer_wallet && isValidSolanaAddress(form.customer_wallet) && (
            <p className="text-[9px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Valid address</p>
          )}
        </div>
      </div>

      {/* Purchase Details */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Purchase Details</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Purchase Amount (USDT) *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.purchase_amount}
              onChange={e => set('purchase_amount', e.target.value)}
              placeholder="e.g. 1000"
              className={inputCls}
            />
            {errors.purchase_amount && <p className="text-[9px] text-red-400 mt-1">{errors.purchase_amount}</p>}
          </div>

          <div>
            <label className={labelCls}>SOF Unit Price (USD) *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.sof_unit_price}
              onChange={e => set('sof_unit_price', e.target.value)}
              placeholder="e.g. 4.00"
              className={inputCls}
            />
            {errors.sof_unit_price && <p className="text-[9px] text-red-400 mt-1">{errors.sof_unit_price}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Promotion Percent (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.promotion_percent}
              onChange={e => set('promotion_percent', e.target.value)}
              placeholder="0"
              className={`${inputCls} flex-1`}
            />
            <span className="text-sm font-bold text-slate-400 flex-shrink-0">%</span>
          </div>
          {errors.promotion_percent && <p className="text-[9px] text-red-400 mt-1">{errors.promotion_percent}</p>}
        </div>
      </div>

      {/* Auto-calculated SOF Quantity */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)' }}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00d4aa]" />
          <p className="text-xs font-bold text-[#00d4aa] uppercase tracking-wider">Auto-Calculated SOF Quantity</p>
        </div>

        {calc.isValid ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Effective SOF Price</span>
              <span className="text-xs font-bold text-slate-200">${formatNumber(calc.effectivePrice, 4)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[rgba(0,212,170,0.1)] pt-2">
              <span className="text-sm font-bold text-white">Final SOF Quantity</span>
              <span className="text-xl font-bold text-[#00d4aa]">{formatNumber(calc.sofQuantity, 4)} SOF</span>
            </div>
            <p className="text-[8px] text-slate-500">
              Formula: {formatNumber(parseFloat(form.purchase_amount) || 0, 2)} USDT ÷ ${formatNumber(calc.effectivePrice, 4)} = {formatNumber(calc.sofQuantity, 4)} SOF
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Info className="w-3.5 h-3.5" />
            {calc.errorMsg || 'Enter purchase amount, SOF price, and promotion to see calculated quantity.'}
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
        {submitting ? 'Sending to Foundation…' : 'Send to Foundation'}
      </button>

      <p className="text-[8px] text-slate-600 text-center">
        Submission will be sent to the SolFort Foundation for processing. Default status: Processing.
      </p>
    </form>
  );
}