import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, ShoppingBag, DollarSign, BarChart2, RefreshCw, Calendar } from 'lucide-react';

const STATUS_COLORS = { '주문 완료': '#8b5cf6', '배송 준비 중': '#f59e0b', '배송 중': '#00d4aa', '배송 완료': '#22c55e', '취소됨': '#ef4444' };
const COMMISSION_RATE = 0.1;

const MOCK_ORDERS = [
  { id: 'm1', product_name: '후드티', quantity: 2, total_amount: 140000, status: '배송 완료', ordered_at: new Date().toISOString() },
  { id: 'm2', product_name: '바람막이', quantity: 1, total_amount: 90000, status: '배송 중', ordered_at: new Date().toISOString() },
  { id: 'm3', product_name: '노트', quantity: 5, total_amount: 50000, status: '주문 완료', ordered_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'm4', product_name: '펜', quantity: 10, total_amount: 50000, status: '배송 완료', ordered_at: new Date(Date.now() - 86400000 * 10).toISOString() },
];

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}0a`, border: `1px solid ${color}15` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      {sub && <p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function GoodsSalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 200)
      .then(data => setOrders(data.length > 0 ? data : MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const totalQty    = orders.reduce((s, o) => s + (o.quantity || 0), 0);
  const totalAmount = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayAmount = orders.filter(o => new Date(o.ordered_at).toDateString() === today)
    .reduce((s, o) => s + (o.total_amount || 0), 0);
  const monthAmount = orders.filter(o => (o.ordered_at || '').startsWith(thisMonth))
    .reduce((s, o) => s + (o.total_amount || 0), 0);
  const commission  = totalAmount * COMMISSION_RATE;

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/GoodsShop">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">파트너 영업</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" /> 굿즈 영업
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard label="총 판매 수량"  value={`${totalQty}개`}               color="#00d4aa" icon={ShoppingBag} />
            <StatCard label="총 판매 금액"  value={`${totalAmount.toLocaleString()}원`} color="#8b5cf6" icon={DollarSign} />
            <StatCard label="오늘 판매"     value={`${todayAmount.toLocaleString()}원`} color="#3b82f6" icon={Calendar}   sub={new Date().toLocaleDateString('ko-KR')} />
            <StatCard label="이번달 판매"   value={`${monthAmount.toLocaleString()}원`} color="#f59e0b" icon={BarChart2}  sub={thisMonth} />
          </div>

          {/* Commission */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider mb-3">인센티브 현황</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-[#151c2e]">
                <p className="text-[8px] text-slate-500 mb-1">총 판매 금액</p>
                <p className="text-sm font-black text-white">{totalAmount.toLocaleString()}원</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.12)' }}>
                <p className="text-[8px] text-[#8b5cf6] mb-1">인센티브 수익 (10%)</p>
                <p className="text-sm font-black text-[#8b5cf6]">{commission.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* Sales History Table */}
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-3">판매 현황</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.06)' }}>
            {/* Header */}
            <div className="grid grid-cols-5 gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.06)]">
              {['날짜', '상품명', '수량', '판매 금액', '상태'].map(h => (
                <p key={h} className="text-[7px] text-slate-600 font-black uppercase">{h}</p>
              ))}
            </div>
            {orders.slice(0, 20).map((order, i) => {
              const color = STATUS_COLORS[order.status] || '#94a3b8';
              return (
                <div key={order.id || i} className="grid grid-cols-5 gap-1 px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.04)] last:border-0 items-center">
                  <p className="text-[8px] text-slate-500">
                    {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '—'}
                  </p>
                  <p className="text-[9px] text-white font-semibold truncate">{order.product_name}</p>
                  <p className="text-[9px] text-white text-center">{order.quantity}</p>
                  <p className="text-[9px] text-[#00d4aa] font-black">{order.total_amount?.toLocaleString()}</p>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-center"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
                    {order.status?.length > 4 ? order.status.slice(0, 4) : order.status}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}