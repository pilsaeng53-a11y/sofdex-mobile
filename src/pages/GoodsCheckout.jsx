import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getCart, clearCart, SOF_PRICE_KRW } from '../data/goodsProducts';

const MOCK_SOF_BALANCE = 500;

export default function GoodsCheckout() {
  const navigate = useNavigate();
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal < 50000 ? 3000 : 0;
  const total = subtotal + delivery;
  const sofRequired = Math.ceil(total / SOF_PRICE_KRW);

  const [payMethod, setPayMethod] = useState('krw');
  const [form, setForm] = useState({ name: '', phone: '', email: '', receiver: '', zip: '', address: '', addressDetail: '', memo: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function placeOrder() {
    if (!form.name || !form.phone || !form.address) return;
    setLoading(true);
    const orderNum = `SF-${Date.now().toString().slice(-8)}`;
    try {
      for (const item of cart) {
        await base44.entities.GoodsOrder.create({
          order_number: orderNum,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: `${form.address} ${form.addressDetail}`,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.qty,
          option: [item.option, item.color].filter(Boolean).join('/'),
          total_amount: item.price * item.qty,
          commission_amount: item.price * item.qty * 0.1,
          status: '주문 완료',
          ordered_at: new Date().toISOString(),
        });
      }
      clearCart();
      navigate(`/GoodsOrderComplete?order=${orderNum}&method=${payMethod}&total=${total}`);
    } catch {
      clearCart();
      navigate(`/GoodsOrderComplete?order=${orderNum}&method=${payMethod}&total=${total}`);
    }
    setLoading(false);
  }

  if (cart.length === 0) {
    navigate('/GoodsShop');
    return null;
  }

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
      <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.12)] bg-[rgba(0,212,170,0.03)] outline-none" />
    </div>
  );

  const Section = ({ title, color = '#00d4aa', children }) => (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${color}15` }}>
      <div className="px-4 py-2.5 border-b" style={{ background: `${color}08`, borderColor: `${color}10` }}>
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{title}</p>
      </div>
      <div className="p-4 bg-[#0d1220] space-y-3">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">굿즈샵</p>
          <h1 className="text-lg font-black text-white">결제</h1>
        </div>
      </div>

      {/* 주문자 정보 */}
      <Section title="주문자 정보">
        <Field label="이름" field="name" placeholder="홍길동" />
        <Field label="연락처" field="phone" placeholder="010-0000-0000" />
        <Field label="이메일" field="email" placeholder="example@email.com" type="email" />
      </Section>

      {/* 배송 정보 */}
      <Section title="배송 정보" color="#3b82f6">
        <Field label="수령인" field="receiver" placeholder="수령인 이름" />
        <Field label="우편번호" field="zip" placeholder="우편번호" />
        <Field label="주소" field="address" placeholder="기본 주소" />
        <Field label="상세 주소" field="addressDetail" placeholder="상세 주소" />
        <Field label="배송 요청사항" field="memo" placeholder="배송 시 요청 사항 (선택)" />
      </Section>

      {/* 주문 상품 요약 */}
      <Section title="주문 상품 요약" color="#8b5cf6">
        {cart.map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white">{item.name}</p>
              {(item.option || item.color) && <p className="text-[9px] text-slate-500">{[item.option, item.color].filter(Boolean).join(' / ')}</p>}
              <p className="text-[9px] text-slate-400">수량 {item.qty}개</p>
            </div>
            <p className="text-[11px] font-black text-[#00d4aa]">{(item.price * item.qty).toLocaleString()}원</p>
          </div>
        ))}
      </Section>

      {/* 결제 수단 */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="px-4 py-2.5 border-b" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.1)' }}>
          <p className="text-[9px] font-black uppercase tracking-wider text-[#f59e0b]">결제 수단</p>
        </div>
        <div className="p-4 bg-[#0d1220]">
          <div className="flex gap-2 mb-3">
            {[['krw', '원화 결제'], ['sof', 'SOF 결제']].map(([val, label]) => (
              <button key={val} onClick={() => setPayMethod(val)}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all"
                style={{
                  background: payMethod === val ? (val === 'sof' ? 'rgba(139,92,246,0.2)' : 'rgba(0,212,170,0.2)') : '#151c2e',
                  border: `1px solid ${payMethod === val ? (val === 'sof' ? '#8b5cf6' : '#00d4aa') : 'rgba(148,163,184,0.1)'}`,
                  color: payMethod === val ? (val === 'sof' ? '#8b5cf6' : '#00d4aa') : '#94a3b8',
                }}>
                {label}
              </button>
            ))}
          </div>
          {payMethod === 'sof' && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex justify-between"><span className="text-[9px] text-slate-500">보유 SOF</span><span className="text-[10px] text-[#8b5cf6] font-black">{MOCK_SOF_BALANCE} SOF</span></div>
              <div className="flex justify-between"><span className="text-[9px] text-slate-500">결제 필요 SOF</span><span className="text-[10px] text-white font-black">{sofRequired} SOF</span></div>
              <div className="flex justify-between"><span className="text-[9px] text-slate-500">환산 비율</span><span className="text-[9px] text-slate-400">1 SOF = {SOF_PRICE_KRW.toLocaleString()}원</span></div>
              {MOCK_SOF_BALANCE < sofRequired && (
                <p className="text-[9px] text-red-400 font-bold">SOF 잔액이 부족합니다</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 최종 결제 요약 */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)' }}>
        <p className="text-[9px] font-black text-[#00d4aa] uppercase tracking-wider mb-3">최종 결제 요약</p>
        <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-[10px] text-slate-500">상품 금액</span><span className="text-[10px] text-white">{subtotal.toLocaleString()}원</span></div>
          <div className="flex justify-between"><span className="text-[10px] text-slate-500">배송비</span><span className="text-[10px] text-white">{delivery === 0 ? '무료' : `${delivery.toLocaleString()}원`}</span></div>
          <div className="flex justify-between pt-2 border-t border-[rgba(148,163,184,0.06)]">
            <span className="text-sm font-black text-white">총 결제 금액</span>
            <span className="text-lg font-black text-[#00d4aa]">{total.toLocaleString()}원</span>
          </div>
          {payMethod === 'sof' && <div className="flex justify-between"><span className="text-[9px] text-slate-500">SOF 환산</span><span className="text-[10px] text-[#8b5cf6] font-black">{sofRequired} SOF</span></div>}
        </div>
      </div>

      <button onClick={placeOrder} disabled={loading || !form.name || !form.phone || !form.address || (payMethod === 'sof' && MOCK_SOF_BALANCE < sofRequired)}
        className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
        style={{
          background: payMethod === 'sof' ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#00d4aa,#06b6d4)',
          color: '#000',
        }}>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
        {payMethod === 'sof' ? 'SOF로 결제하기' : '주문하기'}
      </button>
    </div>
  );
}