import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BarChart2, RefreshCw, Filter } from 'lucide-react';

const S_COLORS = { '주문 완료': '#8b5cf6', '배송 준비 중': '#f59e0b', '배송 중': '#00d4aa', '배송 완료': '#22c55e', '취소됨': '#ef4444' };
const SETTLE_COLORS = { '정산 대기': '#f59e0b', '정산 예정': '#3b82f6', '정산 완료': '#22c55e' };

const MOCK = [
  { id: 'm1', product_name: '후드티', quantity: 2, total_amount: 140000, status: '배송 완료', ordered_at: new Date().toISOString(), settle: '정산 예정' },
  { id: 'm2', product_name: '바람막이', quantity: 1, total_amount: 90000, status: '배송 중', ordered_at: new Date().toISOString(), settle: '정산 대기' },
  { id: 'm3', product_name: '노트', quantity: 5, total_amount: 50000, status: '주문 완료', ordered_at: new Date(Date.now()-86400000*3).toISOString(), settle: '정산 대기' },
];

export default function GoodsSalesHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 200)
      .then(d => setOrders(d.length > 0 ? d.map((o, i) => ({ ...o, settle: ['정산 대기','정산 예정','정산 완료'][i % 3] })) : MOCK))
      .catch(() => setOrders(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === '전체' ? orders : orders.filter(o => o.status === filter || o.settle === filter);

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
          <h1 className="text-lg font-black text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#3b82f6]" /> 판매 내역</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {['전체', '주문 완료', '배송 중', '배송 완료', '정산 대기', '정산 완료'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-[9px] font-black flex-shrink-0 transition-all"
            style={{
              background: filter === f ? 'rgba(59,130,246,0.18)' : '#0d1220',
              border: `1px solid ${filter === f ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.08)'}`,
              color: filter === f ? '#3b82f6' : '#94a3b8',
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.06)' }}>
          <div className="grid gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.06)]"
            style={{ gridTemplateColumns: '1.5fr 2fr 0.8fr 1.5fr 1.2fr 1.2fr' }}>
            {['날짜', '상품명', '수량', '판매 금액', '주문 상태', '정산 상태'].map(h => (
              <p key={h} className="text-[7px] text-slate-600 font-black uppercase">{h}</p>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center py-8 text-slate-600 text-sm">내역이 없습니다.</p>}
          {filtered.map((order, i) => {
            const sc = S_COLORS[order.status] || '#94a3b8';
            const ssc = SETTLE_COLORS[order.settle] || '#94a3b8';
            return (
              <div key={order.id || i} className="grid gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0 items-center"
                style={{ gridTemplateColumns: '1.5fr 2fr 0.8fr 1.5fr 1.2fr 1.2fr' }}>
                <p className="text-[8px] text-slate-500">{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'}) : '—'}</p>
                <p className="text-[9px] text-white font-semibold truncate">{order.product_name}</p>
                <p className="text-[9px] text-white text-center">{order.quantity}</p>
                <p className="text-[9px] text-[#00d4aa] font-black">{order.total_amount?.toLocaleString()}</p>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-center" style={{ background: `${sc}12`, color: sc, border: `1px solid ${sc}20` }}>
                  {order.status?.slice(0, 5)}
                </span>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-center" style={{ background: `${ssc}12`, color: ssc, border: `1px solid ${ssc}20` }}>
                  {order.settle}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}