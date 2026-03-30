import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag, Truck, Star, ChevronRight } from 'lucide-react';

const MEMBERSHIP_MAP = {
  hoodie: { name: '기본 회원', color: '#3b82f6' },
  windbreaker: { name: '프리미엄 회원', color: '#8b5cf6' },
};

export default function GoodsOrderComplete() {
  const params = new URLSearchParams(window.location.search);
  const orderNum = params.get('order') || 'SF-00000000';
  const method   = params.get('method') || 'krw';
  const total    = Number(params.get('total') || 0);

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center" style={{ background: '#05070d' }}>
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <Check className="w-10 h-10 text-emerald-400" />
      </div>

      <h1 className="text-xl font-black text-white mb-1 text-center">주문이 완료되었습니다</h1>
      <p className="text-[11px] text-slate-400 mb-6 text-center">주문이 접수되어 배송 준비를 시작합니다</p>

      {/* Order Info */}
      <div className="w-full rounded-2xl p-5 mb-4" style={{ background: '#0d1220', border: '1px solid rgba(0,212,170,0.1)' }}>
        <div className="space-y-2.5">
          {[
            ['주문 번호', <span className="font-mono text-[#00d4aa]">{orderNum}</span>],
            ['결제 수단', method === 'sof' ? 'SOF 결제' : '원화 결제'],
            ['결제 금액', `${total.toLocaleString()}원`],
            ['배송 상태', <span className="text-[#f59e0b] font-black">주문 완료</span>],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
              <span className="text-[9px] text-slate-500">{label}</span>
              <span className="text-[10px] text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Membership Badge (if applicable) */}
      <div className="w-full rounded-2xl p-4 mb-6"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
            <Star className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-white">멤버십이 적용되었습니다</p>
            <p className="text-[9px] text-slate-400">굿즈 구매를 통해 멤버십 혜택을 받으실 수 있습니다</p>
          </div>
          <Link to="/GoodsMembership">
            <button className="text-[9px] font-black text-[#8b5cf6] px-2.5 py-1.5 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
              보기
            </button>
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-2">
        <Link to="/GoodsMyOrders">
          <button className="w-full py-3 rounded-xl text-sm font-black text-white border border-[rgba(148,163,184,0.12)] flex items-center justify-center gap-2 bg-[#0d1220]">
            <ShoppingBag className="w-4 h-4" /> 주문 내역 보기
          </button>
        </Link>
        <Link to="/GoodsOrderStatus">
          <button className="w-full py-3 rounded-xl text-sm font-black text-[#00d4aa] flex items-center justify-center gap-2"
            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)' }}>
            <Truck className="w-4 h-4" /> 배송 현황 보기
          </button>
        </Link>
        <Link to="/GoodsShop">
          <button className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
            굿즈샵 홈으로 <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}