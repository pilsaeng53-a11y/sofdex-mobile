import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Truck, Package, Check, Clock, RefreshCw, X } from 'lucide-react';

const STATUS_CONFIG = {
  '주문 완료':    { color: '#8b5cf6', icon: Clock },
  '배송 준비 중': { color: '#f59e0b', icon: Package },
  '배송 중':      { color: '#00d4aa', icon: Truck },
  '배송 완료':    { color: '#22c55e', icon: Check },
  '취소됨':       { color: '#ef4444', icon: X },
};

const STEPS = ['주문 완료', '배송 준비 중', '배송 중', '배송 완료'];

const MOCK_ORDERS = [
  { id: 'm1', order_number: 'SF-12345678', product_name: '후드티', option: 'L', quantity: 1, total_amount: 70000, status: '배송 중', ordered_at: '2026-03-28T10:00:00Z', tracking_number: 'CJ-9876543210' },
  { id: 'm2', order_number: 'SF-87654321', product_name: '펜', option: null, quantity: 3, total_amount: 15000, status: '배송 완료', ordered_at: '2026-03-20T09:00:00Z', tracking_number: null },
];

export default function GoodsOrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 50)
      .then(data => setOrders(data.length > 0 ? data : MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#00d4aa]" /> 배송 현황
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">주문 내역이 없습니다</p>
          <Link to="/GoodsShop">
            <button className="mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              굿즈샵 바로가기
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['주문 완료'];
            const StatusIcon = cfg.icon;
            const currentStep = STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${cfg.color}18` }}>
                {/* Status Bar */}
                <div className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: `${cfg.color}10`, background: `${cfg.color}08` }}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-[10px] font-black" style={{ color: cfg.color }}>{order.status}</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">{order.order_number}</span>
                </div>

                <div className="p-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,170,0.1)' }}>
                      <Package className="w-5 h-5 text-[#00d4aa]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white">{order.product_name}{order.option ? ` (${order.option})` : ''}</p>
                      <p className="text-[9px] text-slate-500">수량 {order.quantity}개 · {order.total_amount?.toLocaleString()}원</p>
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.tracking_number && (
                    <div className="rounded-xl p-2.5 mb-4" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.12)' }}>
                      <p className="text-[8px] text-[#00d4aa] font-black mb-0.5">운송장 번호</p>
                      <p className="text-[10px] text-white font-mono">{order.tracking_number}</p>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {STEPS.map((s, i) => {
                      const done = i <= currentStep;
                      const active = s === order.status;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all`}
                              style={{
                                background: active ? `${STATUS_CONFIG[s]?.color}25` : done ? 'rgba(34,197,94,0.12)' : 'transparent',
                                borderColor: active ? STATUS_CONFIG[s]?.color : done ? '#22c55e' : 'rgba(148,163,184,0.15)',
                              }}>
                              {done && <div className="w-2 h-2 rounded-full" style={{ background: active ? STATUS_CONFIG[s]?.color : '#22c55e' }} />}
                            </div>
                            <p className={`text-[7px] text-center w-12 leading-tight ${active ? 'font-bold' : ''}`}
                              style={{ color: active ? STATUS_CONFIG[s]?.color : done ? '#94a3b8' : '#475569' }}>
                              {s}
                            </p>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className="flex-1 h-[1px] mb-4 flex-shrink-0"
                              style={{ background: i < currentStep ? '#22c55e' : 'rgba(148,163,184,0.1)' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <p className="text-[8px] text-slate-600 mt-2">
                    주문일: {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('ko-KR') : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}