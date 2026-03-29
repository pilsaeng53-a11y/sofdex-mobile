/**
 * QuickEntryForm.jsx — 빠른 등록 (minimal input, auto-fill rest)
 */
import React, { useState } from 'react';
import { Zap, X, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GRADE_FEE = { A: { promo: 200, center: 15 }, B: { promo: 150, center: 12 }, C: { promo: 120, center: 10 }, D: { promo: 100, center: 8 } };

export default function QuickEntryForm({ walletAddress, partnerGrade = 'C', partnerName = '', onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState('');
  const [salesKRW, setSalesKRW] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const gradeCfg = GRADE_FEE[partnerGrade] || GRADE_FEE['C'];

  const handleSubmit = async () => {
    if (!name.trim() || !wallet.trim() || !salesKRW) return;
    setSubmitting(true);
    try {
      const usdtRate = 1350;
      const sofPrice = 0.05;
      const usdtAmt = parseFloat(salesKRW) / usdtRate;
      const baseQty = usdtAmt / sofPrice;
      const promoMult = gradeCfg.promo / 100;
      const sofQty = baseQty * promoMult;
      const centerFeeQty = baseQty * (gradeCfg.center / 100);

      await base44.entities.SOFSaleSubmission.create({
        partner_wallet: walletAddress,
        partner_grade: partnerGrade,
        customer_name: name.trim(),
        customer_wallet: wallet.trim(),
        sales_krw: parseFloat(salesKRW),
        usdt_rate: usdtRate,
        purchase_amount: usdtAmt,
        sof_unit_price: sofPrice,
        promotion_percent: gradeCfg.promo,
        base_quantity: baseQty,
        sof_quantity: sofQty,
        center_fee_percent: gradeCfg.center,
        center_fee_quantity: centerFeeQty,
        status: '제출됨',
        submitted_at: new Date().toISOString(),
        notes: '빠른 등록',
      });
      setDone(true);
      setTimeout(() => { setDone(false); setOpen(false); setName(''); setWallet(''); setSalesKRW(''); onSubmitted?.(); }, 2500);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
        <Zap className="w-3.5 h-3.5" />
        빠른 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 space-y-4" style={{ background: '#0f1525', border: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-black text-white">빠른 등록</p>
              </div>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-slate-500" /></button>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <Check className="w-10 h-10 text-emerald-400" />
                <p className="text-sm font-bold text-emerald-400">제출됨 — 재단 검토 예정</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-amber-400/80">등급 {partnerGrade} 기준 자동 적용: 프로모션 {gradeCfg.promo}% · 센터피 {gradeCfg.center}%</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] text-slate-500 mb-1">고객 이름 *</p>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
                      className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 mb-1">고객 지갑 *</p>
                    <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="Solana 지갑 주소"
                      className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40 font-mono text-xs" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 mb-1">매출 금액 (KRW) *</p>
                    <input value={salesKRW} onChange={e => setSalesKRW(e.target.value)} type="number" placeholder="1000000"
                      className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40" />
                    {salesKRW && !isNaN(parseFloat(salesKRW)) && (
                      <p className="text-[8px] text-slate-500 mt-1">
                        ≈ ${(parseFloat(salesKRW) / 1350).toFixed(1)} USDT · SOF {((parseFloat(salesKRW) / 1350 / 0.05) * (gradeCfg.promo / 100)).toFixed(0)} 개
                      </p>
                    )}
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={submitting || !name || !wallet || !salesKRW}
                  className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 제출 중...</> : '제출'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}