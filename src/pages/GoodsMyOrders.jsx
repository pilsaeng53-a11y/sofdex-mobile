import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ShoppingBag, RefreshCw, Truck } from 'lucide-react';

const STATUS_COLORS = { '주문 완료': '#8b5cf6', '배송 준비 중': '#f59e0b', '배송 중': '#00d4aa', '배송 완료': '#22c55e', '취소됨': '#ef4444' };
const TABS = ['전체', '결제 완료', '배송 중', '배송 완료'];

const MOCK = [
  { id: 'm1', order_number: 'SF-11223344', product_name: '후드티', total_amount: 70000, status: '배송 중', ordered_at: new Date().toISOString(), option: 'L/블랙' },
  { id: 'm2', order_number: 'SF-55667788', product_name: '펜', quantity: 3, total_amount: 15000, status: '배송 완료', ordered_at: new Date(Date.now()-86400000*5).toISOString(), option: null },
];

export default function GoodsMyOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 100)
      .then(d => setOrders(d.length > 0 ? d : MOCK))
      .catch(() => setOrders(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const tabFilter = { '전체': null, '결제 완료': '주문 완료', '배송 중': '배송 중', '배송 완료': '배송 완료' };
  const filtered = tab === '전체' ? orders : orders.filter(o => o.status === tabFilter[tab]);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/GoodsShop">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">굿즈샵</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#8b5cf6]" /> 내 주문 내역</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black flex-shrink-0 transition-all"
            style={{
              background: tab === t ? 'rgba(139,92,246,0.2)' : '#0d1220',
              border: `1px solid ${tab === t ? 'rgba(139,92,246,0.4)' : 'rgba(148,163,184,0.08)'}`,
              color: tab === t ? '#8b5cf6' : '#94a3b8',
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">주문 내역이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const color = STATUS_COLORS[order.status] || '#94a3b8';
            return (
              <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${color}15` }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: `${color}10`, background: `${color}08` }}>
                  <span className="text-[9px] font-black" style={{ color }}>{order.status}</span>
                  <span className="text-[8px] text-slate-500 font-mono">{order.order_number}</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-black text-white mb-1">{order.product_name}{order.option ? ` (${order.option})` : ''}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500">결제 금액</p>
                      <p className="text-sm font-black text-[#00d4aa]">{order.total_amount?.toLocaleString()}원</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-600">{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('ko-KR') : '—'}</p>
                      <p className="text-[8px] text-slate-600">{order.payment_method === 'sof' ? 'SOF 결제' : '원화 결제'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link to="/GoodsOrderStatus" className="flex-1">
                      <button className="w-full py-2 rounded-xl text-[10px] font-black text-[#00d4aa] flex items-center justify-center gap-1"
                        style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
                        <Truck className="w-3 h-3" /> 배송 현황 보기
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}