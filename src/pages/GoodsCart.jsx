import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { getCart, removeFromCart, updateCartQty } from '../data/goodsProducts';

export default function GoodsCart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const refresh = () => setCart(getCart());
  useEffect(() => { refresh(); window.addEventListener('cart_updated', refresh); return () => window.removeEventListener('cart_updated', refresh); }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 && subtotal < 50000 ? 3000 : 0;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">굿즈샵</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#00d4aa]" /> 장바구니</h1>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-14 h-14 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">장바구니가 비어있습니다</p>
          <Link to="/GoodsShop">
            <button className="mt-4 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              상품 보러가기
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {cart.map(item => (
              <div key={item.key} className="rounded-2xl p-3.5 flex gap-3" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.07)' }}>
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-black text-white">{item.name}</p>
                    <button onClick={() => removeFromCart(item.key)} className="w-6 h-6 rounded-lg bg-[#151c2e] flex items-center justify-center ml-2 flex-shrink-0">
                      <X className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                  {(item.option || item.color) && (
                    <p className="text-[9px] text-slate-500 mb-1.5">{[item.option, item.color].filter(Boolean).join(' / ')}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.key, item.qty - 1)} className="w-6 h-6 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                        <Minus className="w-3 h-3 text-slate-400" />
                      </button>
                      <span className="text-xs font-black text-white w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.key, item.qty + 1)} className="w-6 h-6 rounded-lg bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                        <Plus className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-[#00d4aa]">{(item.price * item.qty).toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#0d1220', border: '1px solid rgba(0,212,170,0.1)' }}>
            <p className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider mb-3">결제 요약</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[10px] text-slate-500">상품 금액</span><span className="text-[10px] text-white">{subtotal.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[10px] text-slate-500">배송비</span><span className="text-[10px] text-white">{delivery === 0 ? '무료' : `${delivery.toLocaleString()}원`}</span></div>
              <div className="flex justify-between pt-2 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-sm font-black text-white">총 결제 금액</span>
                <span className="text-lg font-black text-[#00d4aa]">{total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/GoodsShop" className="flex-1">
              <button className="w-full py-3 rounded-xl text-sm font-black text-slate-400 border border-[rgba(148,163,184,0.12)] bg-[#0d1220]">
                계속 쇼핑
              </button>
            </Link>
            <button onClick={() => navigate('/GoodsCheckout')}
              className="flex-1 py-3 rounded-xl text-sm font-black text-black"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              결제하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}