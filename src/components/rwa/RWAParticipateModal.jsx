/**
 * RWAParticipateModal — Participation request flow (no blockchain, internal system)
 */
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '../shared/WalletContext';

function parseIRR(s) {
  if (!s) return 0.10;
  const m = String(s).match(/(\d+\.?\d*)–?(\d+\.?\d*)?/);
  if (!m) return 0.10;
  return m[2] ? (parseFloat(m[1]) + parseFloat(m[2])) / 2 / 100 : parseFloat(m[1]) / 100;
}

export default function RWAParticipateModal({ property, onClose }) {
  const { address } = useWallet();
  const [amount, setAmount] = useState(property.minimumInvestment || 100);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const tokenPrice = property.tokenPrice || 100;
  const irr = parseIRR(property.targetIRR || property.targetCashYield);
  const tokenQty = Math.floor(amount / tokenPrice);
  const annualYield = Math.round(amount * irr);

  const submit = async () => {
    if (amount < (property.minimumInvestment || 100)) {
      setError(`최소 투자 금액은 $${property.minimumInvestment?.toLocaleString() || '100'}입니다.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await base44.entities.RWAParticipation.create({
        propertyId: property.id || property.sourcePropertyId,
        propertyTitle: property.title,
        investAmount: amount,
        tokenQty,
        expectedYield: `$${annualYield}/yr`,
        scenario: 'base',
        status: 'pending',
        userWallet: address || '',
        submittedAt: new Date().toISOString(),
      });
      setDone(true);
    } catch (e) {
      setError('신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ background: '#0f1525', border: '1px solid rgba(139,92,246,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.06)]">
          <p className="text-sm font-black text-white">참여하기</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-5">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <p className="text-base font-black text-white mb-2">참여 신청 완료</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-[#8b5cf6] font-bold">{property.title}</span> 에 대한 참여 신청이 접수되었습니다.<br />
                내부 검토 후 이메일/알림으로 안내드립니다.
              </p>
              <button onClick={onClose}
                className="mt-6 w-full py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                확인
              </button>
            </div>
          ) : (
            <>
              {/* Property summary */}
              <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-[#0a0e1a]">
                {property.featuredImage && (
                  <img src={property.featuredImage} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-white leading-snug">{property.title}</p>
                  <p className="text-[10px] text-slate-500">{property.location}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="text-[10px] text-slate-500 mb-1.5 block">투자 금액 (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    value={amount}
                    min={property.minimumInvestment || 100}
                    step={100}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#8b5cf6]/40"
                  />
                </div>
                {property.minimumInvestment && (
                  <p className="text-[9px] text-slate-600 mt-1">최소: ${property.minimumInvestment.toLocaleString()}</p>
                )}
              </div>

              {/* Live estimates */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-[#0a0e1a] rounded-xl px-3 py-2.5">
                  <p className="text-[8px] text-slate-500 mb-0.5">예상 토큰 수량</p>
                  <p className="text-sm font-black text-white">{tokenQty.toLocaleString()} 개</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-xl px-3 py-2.5">
                  <p className="text-[8px] text-slate-500 mb-0.5">예상 연간 수익</p>
                  <p className="text-sm font-black text-emerald-400">${annualYield.toLocaleString()}</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5 mb-4">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-[10px] text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-xl px-3 py-2.5 mb-4">
                <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-400/80 leading-relaxed">
                  참여 신청은 내부 검토 후 확정됩니다. 수익은 보장되지 않습니다.
                </p>
              </div>

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                참여 신청
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}