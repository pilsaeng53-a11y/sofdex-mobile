import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Zap, Star } from 'lucide-react';
import { PRODUCTS, SOF_PRICE_KRW, addToCart } from '../data/goodsProducts';

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <span className="text-[9px] text-slate-500">{label}</span>
      <span className="text-[10px] text-white font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function GoodsDetail() {
  const params = new URLSearchParams(window.location.search);
  const product = PRODUCTS.find(p => p.id === params.get('id')) || PRODUCTS[0];
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [option, setOption] = useState(product.options?.[2] || '');
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [added, setAdded] = useState(false);

  const total = product.price * qty;
  const sofAmount = Math.ceil(total / SOF_PRICE_KRW);
  const delivery = total >= 50000 ? 0 : 3000;

  function handleAddCart() {
    addToCart(product, qty, option, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addToCart(product, qty, option, color);
    navigate('/GoodsCart');
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: '#05070d' }}>
      {/* Back */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">상품 상세</p>
      </div>

      {/* Hero Image */}
      <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
        {product.badge && (
          <span className="absolute top-3 left-3 text-[9px] font-black px-2.5 py-1 rounded-full text-white"
            style={{ background: product.badgeColor }}>{product.badge}</span>
        )}
        {product.membership && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: `${product.membershipColor}cc`, backdropFilter: 'blur(8px)' }}>
            <Star className="w-3 h-3 text-white" />
            <span className="text-[9px] font-black text-white">{product.membership} 혜택</span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Title */}
        <div>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-slate-500 bg-[#151c2e]">{product.category}</span>
          <h1 className="text-xl font-black text-white mt-1.5 mb-0.5">{product.name}</h1>
          <p className="text-[10px] text-slate-400">{product.description}</p>
          <p className="text-2xl font-black text-[#00d4aa] mt-2">{product.price.toLocaleString()}원</p>
        </div>

        {/* Product Info */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.06)' }}>
          <div className="px-4 py-2.5 border-b" style={{ background: 'rgba(0,212,170,0.06)', borderColor: 'rgba(0,212,170,0.08)' }}>
            <p className="text-[9px] font-black text-[#00d4aa] uppercase tracking-wider">상품 정보</p>
          </div>
          <div className="p-4 bg-[#0d1220]">
            <InfoRow label="상품 설명" value={product.longDesc} />
            <InfoRow label="상품 구성" value={product.composition} />
            <InfoRow label="소재 / 사양" value={product.material} />
            <InfoRow label="배송 안내" value={product.delivery} />
          </div>
        </div>

        {/* Options */}
        <div className="rounded-2xl p-4" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.06)' }}>
          {product.options && (
            <div className="mb-3">
              <p className="text-[9px] text-slate-500 mb-2">사이즈 선택</p>
              <div className="flex gap-2 flex-wrap">
                {product.options.map(o => (
                  <button key={o} onClick={() => setOption(o)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all"
                    style={{
                      background: option === o ? 'rgba(0,212,170,0.18)' : '#151c2e',
                      border: `1px solid ${option === o ? '#00d4aa' : 'rgba(148,163,184,0.1)'}`,
                      color: option === o ? '#00d4aa' : '#94a3b8',
                    }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.colors && (
            <div className="mb-3">
              <p className="text-[9px] text-slate-500 mb-2">색상 선택</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all"
                    style={{
                      background: color === c ? 'rgba(139,92,246,0.18)' : '#151c2e',
                      border: `1px solid ${color === c ? '#8b5cf6' : 'rgba(148,163,184,0.1)'}`,
                      color: color === c ? '#8b5cf6' : '#94a3b8',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Qty */}
          <div className="flex items-center gap-3">
            <p className="text-[9px] text-slate-500">수량</p>
            <div className="flex items-center gap-3 ml-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <span className="text-sm font-black text-white w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Preview */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)' }}>
          <p className="text-[9px] font-black text-[#00d4aa] uppercase tracking-wider mb-3">결제 예상 금액</p>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-[10px] text-slate-500">상품 금액</span><span className="text-[10px] text-white font-semibold">{(product.price * qty).toLocaleString()}원</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-slate-500">예상 배송비</span><span className="text-[10px] text-white font-semibold">{delivery === 0 ? '무료' : `${delivery.toLocaleString()}원`}</span></div>
            <div className="flex justify-between pt-1.5 border-t border-[rgba(148,163,184,0.06)]">
              <span className="text-[10px] text-slate-400 font-black">총 결제 금액</span>
              <span className="text-sm font-black text-[#00d4aa]">{(total + delivery).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-slate-500">SOF 결제 시</span>
              <span className="text-[9px] text-[#8b5cf6] font-black">{sofAmount} SOF</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={handleAddCart}
            className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: added ? 'rgba(34,197,94,0.12)' : 'rgba(0,212,170,0.08)',
              border: `1px solid ${added ? 'rgba(34,197,94,0.3)' : 'rgba(0,212,170,0.2)'}`,
              color: added ? '#22c55e' : '#00d4aa',
            }}>
            <ShoppingCart className="w-4 h-4" />
            {added ? '담겼습니다!' : '장바구니 담기'}
          </button>
          <button onClick={handleBuyNow}
            className="flex-1 py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
            <Zap className="w-4 h-4" /> 바로 구매
          </button>
        </div>
      </div>
    </div>
  );
}