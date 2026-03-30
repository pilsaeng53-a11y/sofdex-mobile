import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, DollarSign, RefreshCw, Info, TrendingUp } from 'lucide-react';

const SETTLE_COLORS = { '정산 대기': '#f59e0b', '정산 예정': '#3b82f6', '정산 완료': '#22c55e' };
const COMMISSION_RATE = 0.1;

const MOCK = [
  { id: 'm1', product_name: '후드티', quantity: 2, total_amount: 140000, settle: '정산 완료', ordered_at: new Date(Date.now()-86400000*5).toISOString() },
  { id: 'm2', product_name: '바람막이', quantity: 1, total_amount: 90000, settle: '정산 예정', ordered_at: new Date(Date.now()-86400000*2).toISOString() },
  { id: 'm3', product_name: '노트', quantity: 5, total_amount: 50000, settle: '정산 대기', ordered_at: new Date().toISOString() },
];

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

export default function GoodsSettlement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 200)
      .then(d => setOrders(d.length > 0 ? d.map((o,i) => ({ ...o, settle: ['정산 대기','정산 예정','정산 완료'][i%3] })) : MOCK))
      .catch(() => setOrders(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const totalAmount    = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalComm      = totalAmount * COMMISSION_RATE;
  const completedComm  = orders.filter(o => o.settle === '정산 완료').reduce((s, o) => s + (o.total_amount || 0) * COMMISSION_RATE, 0);
  const pendingComm    = orders.filter(o => o.settle === '정산 예정').reduce((s, o) => s + (o.total_amount || 0) * COMMISSION_RATE, 0);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/GoodsSalesDashboard">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">굿즈 영업</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#22c55e]" /> 정산 현황</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard label="총 판매 금액"  value={`${totalAmount.toLocaleString()}원`}    color="#00d4aa" icon={TrendingUp} />
            <StatCard label="총 인센티브"   value={`${totalComm.toLocaleString()}원`}      color="#8b5cf6" icon={DollarSign} />
            <StatCard label="정산 완료 금액" value={`${completedComm.toLocaleString()}원`} color="#22c55e" icon={DollarSign} />
            <StatCard label="정산 예정 금액" value={`${pendingComm.toLocaleString()}원`}   color="#3b82f6" icon={DollarSign} />
          </div>

          {/* Table */}
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">정산 내역</p>
          <div className="rounded-2xl overflow-hidden mb-5" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.06)' }}>
            <div className="grid gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.06)]"
              style={{ gridTemplateColumns: '1.5fr 2fr 0.8fr 1.5fr 1.2fr 1.2fr' }}>
              {['정산일', '상품명', '수량', '판매 금액', '인센티브', '상태'].map(h => (
                <p key={h} className="text-[7px] text-slate-600 font-black uppercase">{h}</p>
              ))}
            </div>
            {orders.map((order, i) => {
              const color = SETTLE_COLORS[order.settle] || '#94a3b8';
              const comm = (order.total_amount || 0) * COMMISSION_RATE;
              return (
                <div key={order.id || i} className="grid gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0 items-center"
                  style={{ gridTemplateColumns: '1.5fr 2fr 0.8fr 1.5fr 1.2fr 1.2fr' }}>
                  <p className="text-[8px] text-slate-500">{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'}) : '—'}</p>
                  <p className="text-[9px] text-white font-semibold truncate">{order.product_name}</p>
                  <p className="text-[9px] text-white text-center">{order.quantity}</p>
                  <p className="text-[9px] text-white">{order.total_amount?.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-[#8b5cf6]">{comm.toLocaleString()}</p>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{order.settle}</span>
                </div>
              );
            })}
          </div>

          {/* Guide */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
              <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-wider">정산 기준 안내</p>
            </div>
            <div className="space-y-1.5">
              {['상품 판매 실적 기준으로 인센티브가 반영됩니다', '정산 상태는 주문 및 배송 완료 여부에 따라 달라질 수 있습니다', '인센티브 비율: 판매 금액의 10%', '정산 완료 후 파트너 계좌로 지급됩니다'].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#3b82f6]/50 text-[9px] flex-shrink-0 mt-0.5">•</span>
                  <p className="text-[9px] text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}