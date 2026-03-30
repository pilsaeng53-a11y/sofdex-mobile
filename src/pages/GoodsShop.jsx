import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Package, ChevronRight, X, Check, RefreshCw, Minus, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PRODUCTS = [
  {
    id: 'hoodie',
    name: '후드티',
    price: 70000,
    category: '의류',
    description: 'SolFort 공식 후드티. 고품질 면 소재, 프리미엄 로고 자수.',
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
    badge: 'BEST',
    badgeColor: '#8b5cf6',
  },
  {
    id: 'windbreaker',
    name: '바람막이',
    price: 90000,
    category: '의류',
    description: 'SolFort 공식 바람막이. 경량 방풍 소재, 심플한 디자인.',
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    badge: 'NEW',
    badgeColor: '#00d4aa',
  },
  {
    id: 'notebook',
    name: '노트',
    price: 10000,
    category: '문구',
    description: 'SolFort 로고 노트. A5 사이즈, 100페이지.',
    options: null,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    badge: null,
    badgeColor: null,
  },
  {
    id: 'pen',
    name: '펜',
    price: 5000,
    category: '문구',
    description: 'SolFort 로고 볼펜. 부드러운 필기감.',
    options: null,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',
    badge: null,
    badgeColor: null,
  },
];

const CATEGORIES = ['전체', '의류', '문구', '기타'];
const STATUS_COLORS = { '주문 완료': '#8b5cf6', '배송 준비 중': '#f59e0b', '배송 중': '#00d4aa', '배송 완료': '#22c55e', '취소됨': '#ef4444' };

function ProductCard({ product, onBuy }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.08)' }}>
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-44 object-cover" />
        {product.badge && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: product.badgeColor }}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-black text-white mb-1">{product.name}</h3>
        <p className="text-[9px] text-slate-500 mb-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-base font-black text-[#00d4aa]">{product.price.toLocaleString()}원</p>
          <button onClick={() => onBuy(product)}
            className="px-4 py-2 rounded-xl text-[10px] font-black text-black"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}

function BuyModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const [option, setOption] = useState(product.options?.[2] || '');
  const [step, setStep] = useState('detail'); // detail | checkout | done
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const total = product.price * qty;

  async function placeOrder() {
    if (!form.name || !form.phone || !form.address) return;
    setLoading(true);
    const num = `SF-${Date.now().toString().slice(-8)}`;
    try {
      await base44.entities.GoodsOrder.create({
        order_number: num,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: qty,
        option,
        total_amount: total,
        commission_amount: total * 0.1,
        status: '주문 완료',
        ordered_at: new Date().toISOString(),
      });
      setOrderNum(num);
      setStep('done');
    } catch { setStep('done'); setOrderNum(num); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto max-h-[90vh] scrollbar-none"
        style={{ background: '#0b0f1c', border: '1px solid rgba(0,212,170,0.12)' }}
        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)]"
          style={{ background: 'rgba(11,15,28,0.98)' }}>
          <p className="text-sm font-black text-white">
            {step === 'detail' ? product.name : step === 'checkout' ? '주문 정보 입력' : '주문 완료'}
          </p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4">
          {step === 'detail' && (
            <>
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl mb-4" />
              <p className="text-xl font-black text-[#00d4aa] mb-1">{product.price.toLocaleString()}원</p>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">{product.description}</p>

              {product.options && (
                <div className="mb-4">
                  <p className="text-[9px] text-slate-500 mb-2">사이즈 선택</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.options.map(o => (
                      <button key={o} onClick={() => setOption(o)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all"
                        style={{
                          background: option === o ? 'rgba(0,212,170,0.2)' : 'rgba(148,163,184,0.08)',
                          border: `1px solid ${option === o ? '#00d4aa' : 'rgba(148,163,184,0.15)'}`,
                          color: option === o ? '#00d4aa' : '#94a3b8',
                        }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <p className="text-[9px] text-slate-500">수량</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                    <Minus className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <span className="text-sm font-black text-white w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
                <p className="ml-auto text-sm font-black text-white">{total.toLocaleString()}원</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('checkout')}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white border border-[rgba(0,212,170,0.25)] text-[#00d4aa]"
                  style={{ background: 'rgba(0,212,170,0.08)' }}>
                  장바구니 담기
                </button>
                <button onClick={() => setStep('checkout')}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-black"
                  style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
                  바로 구매
                </button>
              </div>
            </>
          )}

          {step === 'checkout' && (
            <>
              <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.1)' }}>
                <Package className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-white">{product.name} {option && `(${option})`} × {qty}</p>
                  <p className="text-[9px] text-[#00d4aa] font-black">{total.toLocaleString()}원</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: '이름', field: 'name', placeholder: '홍길동' },
                  { label: '연락처', field: 'phone', placeholder: '010-0000-0000' },
                  { label: '주소', field: 'address', placeholder: '배송지 주소를 입력하세요' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
                    <input value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none" />
                  </div>
                ))}
              </div>

              <button onClick={placeOrder} disabled={loading || !form.name || !form.phone || !form.address}
                className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : null}
                주문하기
              </button>
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-base font-black text-white">주문이 완료되었습니다!</p>
              <p className="text-[10px] text-slate-400">주문번호: <span className="font-mono text-white">{orderNum}</span></p>
              <Link to="/GoodsOrderStatus" onClick={onClose}>
                <button className="mt-2 px-5 py-2.5 rounded-xl text-sm font-black text-[#00d4aa] flex items-center gap-1.5"
                  style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>
                  배송 현황 보기 <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

export default function GoodsShop() {
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState(null);

  const filtered = PRODUCTS.filter(p => category === '전체' || p.category === category);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">SolFort Official</p>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00d4aa]" /> 굿즈샵
          </h1>
        </div>
        <Link to="/GoodsOrderStatus">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-[#00d4aa]"
            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
            <Truck className="w-3.5 h-3.5" /> 배송 현황
          </button>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black flex-shrink-0 transition-all ${
              category === c ? 'text-black' : 'text-slate-500'
            }`}
            style={{
              background: category === c ? 'linear-gradient(135deg,#00d4aa,#06b6d4)' : 'rgba(148,163,184,0.08)',
              border: category === c ? 'none' : '1px solid rgba(148,163,184,0.1)',
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(p => <ProductCard key={p.id} product={p} onBuy={setSelected} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">해당 카테고리에 상품이 없습니다.</div>
      )}

      {selected && <BuyModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}