import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Star, ChevronRight, ShoppingCart, Sparkles } from 'lucide-react';
import { PRODUCTS, CATEGORIES, addToCart, getCart } from '../data/goodsProducts';

function ProductCard({ product, onDetail }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.08)' }}>
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
        {product.badge && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: product.badgeColor }}>{product.badge}</span>
        )}
        {product.membership && (
          <span className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: product.membershipColor }}>멤버십</span>
        )}
      </div>
      <div className="p-3.5">
        <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-slate-500 bg-[#151c2e] mb-1.5 inline-block">{product.category}</span>
        <h3 className="text-sm font-black text-white mb-0.5">{product.name}</h3>
        <p className="text-[9px] text-slate-500 mb-2">{product.description}</p>
        <p className="text-base font-black text-[#00d4aa] mb-3">{product.price.toLocaleString()}원</p>
        <div className="flex gap-1.5">
          <button onClick={() => onDetail(product)}
            className="flex-1 py-2 rounded-xl text-[10px] font-black text-slate-300 border border-[rgba(148,163,184,0.12)] bg-[#151c2e]">
            상세 보기
          </button>
          <button onClick={() => onDetail(product)}
            className="flex-1 py-2 rounded-xl text-[10px] font-black text-black"
            style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoodsShop() {
  const [category, setCategory] = useState('전체');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.qty, 0));
    update();
    window.addEventListener('cart_updated', update);
    return () => window.removeEventListener('cart_updated', update);
  }, []);

  const filtered = PRODUCTS.filter(p => category === '전체' || p.category === category);

  return (
    <div className="min-h-screen" style={{ background: '#05070d' }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden px-4 pt-6 pb-8 mb-2"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(0,212,170,0.08))' }}>
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] text-[#00d4aa] font-black uppercase tracking-widest mb-1">SolFort Official</p>
          <h1 className="text-2xl font-black text-white mb-1">굿즈샵</h1>
          <p className="text-xs text-slate-400 mb-4">브랜드 굿즈와 멤버십 혜택을 한 곳에서</p>
          <p className="text-[11px] text-slate-300 mb-4 font-semibold">SolFort 공식 굿즈<br /><span className="text-slate-500 font-normal">브랜드와 함께하는 프리미엄 컬렉션</span></p>
          <div className="flex gap-2">
            <button onClick={() => document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 rounded-xl text-[11px] font-black text-black"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              상품 보러가기
            </button>
            <Link to="/GoodsMembership">
              <button className="px-4 py-2 rounded-xl text-[11px] font-black text-[#8b5cf6]"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                내 멤버십 보기
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Link to="/GoodsCart">
            <button className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-slate-300"
              style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.08)' }}>
              <ShoppingCart className="w-3.5 h-3.5" />
              장바구니
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00d4aa] text-black text-[8px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          <Link to="/GoodsOrderStatus">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-slate-300"
              style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.08)' }}>
              <Truck className="w-3.5 h-3.5" /> 배송 현황
            </button>
          </Link>
          <Link to="/GoodsMyOrders">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-slate-300"
              style={{ background: '#0d1220', border: '1px solid rgba(148,163,184,0.08)' }}>
              <ShoppingBag className="w-3.5 h-3.5" /> 내 주문
            </button>
          </Link>
        </div>
        <Link to="/GoodsMembership">
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black text-[#8b5cf6]"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Star className="w-3.5 h-3.5" /> 멤버십
          </button>
        </Link>
      </div>

      {/* Membership Highlight */}
      <div className="mx-4 mb-5 rounded-2xl p-3.5 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.18)' }}>
        <Sparkles className="w-5 h-5 text-[#8b5cf6] flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] font-black text-white">굿즈 구매 시 멤버십 혜택 제공</p>
          <p className="text-[9px] text-slate-400">SOF 결제로 추가 혜택 · 한정 상품 우선 구매 가능</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </div>

      {/* Category Tabs */}
      <div id="product-list" className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black flex-shrink-0 transition-all`}
            style={{
              background: category === c ? 'linear-gradient(135deg,#00d4aa,#06b6d4)' : '#0d1220',
              color: category === c ? '#000' : '#94a3b8',
              border: category === c ? 'none' : '1px solid rgba(148,163,184,0.08)',
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 pb-8">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onDetail={p => navigate(`/GoodsDetail?id=${p.id}`)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-600">해당 카테고리에 상품이 없습니다.</div>
        )}
      </div>
    </div>
  );
}