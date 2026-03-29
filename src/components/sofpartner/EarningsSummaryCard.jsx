/**
 * EarningsSummaryCard — 예상/확정 수익 명확 분리 표시
 */
import React, { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle, Clock, Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(1);

export default function EarningsSummaryCard({ walletAddress }) {
  const [data, setData] = useState(null);
  const [sofPrice, setSofPrice] = useState(0.05);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const records = await base44.entities.SOFSaleSubmission.filter({ partner_wallet: walletAddress });
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const monthStr = now.toISOString().slice(0, 7);

        // 확정 = Approved
        // 예상 = Processing or Reviewing
        let todayEst = 0, monthEst = 0, monthConfirmed = 0, totalConfirmed = 0;

        records.forEach(r => {
          const qty = r.center_fee_quantity || 0;
          const isConfirmed = r.status === 'Approved' || r.status === '재단 확정';
          const isPending   = r.status === 'Processing' || r.status === 'Reviewing';

          if (isConfirmed) {
            totalConfirmed += qty;
            if ((r.submitted_at || '').startsWith(monthStr)) monthConfirmed += qty;
          }
          if (isPending) {
            if ((r.submitted_at || '').startsWith(monthStr)) monthEst += qty;
            if ((r.submitted_at || '').startsWith(todayStr)) todayEst += qty;
          }
        });

        try {
          const pr = await base44.functions.invoke('getSOFPrice', {});
          if (pr?.data?.price) setSofPrice(pr.data.price);
        } catch {}

        setData({ todayEst, monthEst, monthConfirmed, totalConfirmed });
      } catch {
        setData({ todayEst: 0, monthEst: 0, monthConfirmed: 0, totalConfirmed: 0 });
      }
      setLoading(false);
    })();
  }, [walletAddress]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.06)]">
      <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.07)] flex items-center gap-2"
        style={{ background: 'rgba(139,92,246,0.05)' }}>
        <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
        <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider">수익 현황 요약</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 text-slate-500 animate-spin" /></div>
      ) : (
        <>
          {/* 예상 수익 section */}
          <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.06)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3 h-3 text-amber-400" />
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">예상 수익 (검토 중)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-500 mb-1">오늘 예상</p>
                <p className="text-base font-black text-amber-400">{fmt(data.todayEst)}</p>
                <p className="text-[7px] text-slate-600">SOF ≈ ${(data.todayEst * sofPrice).toFixed(2)}</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-500 mb-1">이번 달 예상</p>
                <p className="text-base font-black text-amber-400">{fmt(data.monthEst)}</p>
                <p className="text-[7px] text-slate-600">SOF ≈ ${(data.monthEst * sofPrice).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* 확정 수익 section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">확정 수익 (승인 완료)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-500 mb-1">이번 달 확정</p>
                <p className="text-base font-black text-emerald-400">{fmt(data.monthConfirmed)}</p>
                <p className="text-[7px] text-slate-600">SOF ≈ ${(data.monthConfirmed * sofPrice).toFixed(2)}</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-500 mb-1">누적 확정</p>
                <p className="text-base font-black text-emerald-400">{fmt(data.totalConfirmed)}</p>
                <p className="text-[7px] text-slate-600">SOF ≈ ${(data.totalConfirmed * sofPrice).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-[rgba(148,163,184,0.06)]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-slate-600" />
              <p className="text-[8px] text-slate-600">SOF 단가 ${sofPrice} · 예상=검토중, 확정=재단승인</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}