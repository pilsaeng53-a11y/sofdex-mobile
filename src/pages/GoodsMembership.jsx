import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Star, Zap, ShoppingBag, Lock, Tag, Gift, Trophy } from 'lucide-react';

const MEMBERSHIP_TIERS = [
  {
    id: 'premium',
    name: '프리미엄 회원',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    icon: Trophy,
    trigger: '바람막이 구매',
    benefits: [
      { icon: Tag,      label: '굿즈 할인',      desc: '전 상품 15% 할인' },
      { icon: Zap,      label: '우선 구매',       desc: '신상품 우선 구매 권한' },
      { icon: Lock,     label: '한정 상품 접근',  desc: '한정판 굿즈 전용 접근' },
      { icon: Gift,     label: '이벤트 참여',     desc: '멤버십 전용 이벤트 초대' },
    ],
  },
  {
    id: 'basic',
    name: '기본 회원',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    icon: Star,
    trigger: '후드티 구매',
    benefits: [
      { icon: Tag,  label: '굿즈 할인',   desc: '전 상품 10% 할인' },
      { icon: Zap,  label: '우선 구매',   desc: '신상품 조기 구매 가능' },
      { icon: Gift, label: '이벤트 참여', desc: '멤버십 이벤트 참여 가능' },
    ],
  },
];

export default function GoodsMembership() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoodsOrder.list('-ordered_at', 50)
      .then(setOrders).catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Determine membership from orders
  const hasPremium = orders.some(o => o.product_id === 'windbreaker');
  const hasBasic   = orders.some(o => o.product_id === 'hoodie');
  const activeTier = hasPremium ? MEMBERSHIP_TIERS[0] : hasBasic ? MEMBERSHIP_TIERS[1] : null;

  return (
    <div className="min-h-screen px-4 py-6 pb-10" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/GoodsShop">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">굿즈샵</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2"><Star className="w-5 h-5 text-[#8b5cf6]" /> 내 멤버십</h1>
        </div>
      </div>

      {/* My Membership Card */}
      {activeTier ? (
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: activeTier.gradient, boxShadow: `0 12px 40px ${activeTier.color}40` }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(25%, -25%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">My Membership</p>
                <p className="text-xl font-black text-white mt-0.5">{activeTier.name}</p>
              </div>
              <activeTier.icon className="w-10 h-10 text-white/80" />
            </div>
            <p className="text-[10px] text-white/70">취득 조건: {activeTier.trigger}</p>
            <p className="text-[9px] text-white/50 mt-0.5">SolFort 공식 굿즈 멤버십</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: '#0d1220', border: '2px dashed rgba(148,163,184,0.1)' }}>
          <Star className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-black text-slate-500">현재 적용된 멤버십이 없습니다</p>
          <p className="text-[9px] text-slate-600 mt-1 mb-4">굿즈 구매를 통해 멤버십 혜택을 받아보세요</p>
          <Link to="/GoodsShop">
            <button className="px-5 py-2.5 rounded-xl text-sm font-black text-black"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              <ShoppingBag className="w-4 h-4 inline mr-1.5" />상품 보러가기
            </button>
          </Link>
        </div>
      )}

      {/* Benefits */}
      {activeTier && (
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">멤버십 혜택</p>
          <div className="space-y-2">
            {activeTier.benefits.map(b => (
              <div key={b.label} className="rounded-2xl p-3.5 flex items-center gap-3"
                style={{ background: `${activeTier.color}08`, border: `1px solid ${activeTier.color}15` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activeTier.color}18` }}>
                  <b.icon className="w-4 h-4" style={{ color: activeTier.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">{b.label}</p>
                  <p className="text-[9px] text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tiers */}
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">멤버십 등급 안내</p>
      <div className="space-y-3">
        {MEMBERSHIP_TIERS.map(tier => {
          const isActive = activeTier?.id === tier.id;
          return (
            <div key={tier.id} className="rounded-2xl p-4" style={{ background: '#0d1220', border: `1px solid ${tier.color}${isActive ? '40' : '15'}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: tier.gradient }}>
                  <tier.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-white">{tier.name}</p>
                  <p className="text-[9px] text-slate-500">취득 조건: {tier.trigger}</p>
                </div>
                {isActive && <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: tier.color }}>활성</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {tier.benefits.map(b => (
                  <div key={b.label} className="rounded-xl px-2.5 py-1.5 flex items-center gap-1.5" style={{ background: `${tier.color}08` }}>
                    <b.icon className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />
                    <span className="text-[8px] text-slate-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}