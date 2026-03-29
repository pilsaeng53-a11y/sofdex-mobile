/**
 * EarningsPreview.jsx — Today / Monthly / Total SOF earnings preview
 */
import React, { useEffect, useState } from 'react';
import { TrendingUp, Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EarningsPreview({ walletAddress }) {
  const [data, setData] = useState(null);
  const [sofPrice, setSofPrice] = useState(0.05);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const records = await base44.entities.SOFSaleSubmission.filter({ partner_wallet: walletAddress });
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const monthStr = now.toISOString().slice(0, 7);

        let todaySOF = 0, monthSOF = 0, totalSOF = 0;
        records.forEach(r => {
          if (r.status === '재단 확정' || r.status === 'Approved') {
            const qty = r.center_fee_quantity || 0;
            totalSOF += qty;
            if ((r.submitted_at || '').startsWith(monthStr)) monthSOF += qty;
            if ((r.submitted_at || '').startsWith(todayStr)) todaySOF += qty;
          }
        });

        // try get SOF price
        try {
          const priceResp = await base44.functions.invoke('getSOFPrice', {});
          if (priceResp?.data?.price) setSofPrice(priceResp.data.price);
        } catch { /* use default */ }

        setData({ todaySOF, monthSOF, totalSOF, count: records.length });
      } catch {
        setData({ todaySOF: 0, monthSOF: 0, totalSOF: 0, count: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [walletAddress]);

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(0);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(148,163,184,0.07)]"
        style={{ background: 'rgba(139,92,246,0.05)' }}>
        <TrendingUp className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">수익 미리보기 (센터피)</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-[rgba(148,163,184,0.07)]">
          {[
            { label: '오늘', value: fmt(data?.todaySOF || 0), sub: `≈$${((data?.todaySOF || 0) * sofPrice).toFixed(1)}` },
            { label: '이번 달', value: fmt(data?.monthSOF || 0), sub: `≈$${((data?.monthSOF || 0) * sofPrice).toFixed(1)}` },
            { label: '누적', value: fmt(data?.totalSOF || 0), sub: `≈$${((data?.totalSOF || 0) * sofPrice).toFixed(1)}` },
          ].map(item => (
            <div key={item.label} className="p-3 text-center">
              <p className="text-[8px] text-slate-500 mb-1">{item.label}</p>
              <p className="text-sm font-black text-purple-400">{item.value}</p>
              <p className="text-[8px] text-slate-600">SOF</p>
              <p className="text-[8px] text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2 border-t border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <p className="text-[8px] text-slate-500">재단 확정 건만 반영 · SOF 단가 ${sofPrice}</p>
        </div>
      </div>
    </div>
  );
}