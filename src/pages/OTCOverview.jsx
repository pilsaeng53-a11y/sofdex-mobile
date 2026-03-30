import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Building2, DollarSign, Layers, Truck, ShoppingBag, FileText, HelpCircle, ArrowRight, AlertTriangle } from 'lucide-react';

const OTC_CARDS = [
  {
    title: '개인 간 거래',
    desc: 'SolFort 내 등록 사용자 간 직접 자산 거래. 매수/매도 목록 조회 및 가격 제안 가능.',
    icon: ArrowDownUp,
    color: '#8b5cf6',
    to: '/P2PRWAExchange',
  },
  {
    title: '부동산 장외거래',
    desc: '부동산 기반 실물 자산(RWA)의 비공개 장외 거래. 호텔·주거·상업용 부동산 포함.',
    icon: Building2,
    color: '#3b82f6',
    to: '/RealEstateP2P',
  },
  {
    title: '금 실물 거래',
    desc: '금 RWA 자산 내부 거래 및 실물 인도 신청. 보관 금고 정보 및 인도 조건 확인 가능.',
    icon: DollarSign,
    color: '#f59e0b',
    to: '/GoldP2PMarket',
  },
  {
    title: '대량 거래 데스크',
    desc: '일반 거래 한도를 초과하는 대규모 장외 거래 요청 전용 창구.',
    icon: Layers,
    color: '#00d4aa',
    to: '/OTCBlockTrade',
  },
  {
    title: '실물 인도 신청',
    desc: '적격 금·실물 자산 보유자를 위한 실물 인도 신청 및 진행 상태 조회.',
    icon: Truck,
    color: '#f97316',
    to: '/MyDeliveryRequests',
  },
];

const QUICK_LINKS = [
  { label: '내 거래 내역',  icon: ShoppingBag, to: '/MyP2POrders',       color: '#8b5cf6' },
  { label: '내 등록 자산',  icon: FileText,    to: '/MyOTCListings',      color: '#3b82f6' },
  { label: '분쟁 / 지원',   icon: HelpCircle,  to: '/OTCSupportDispute',  color: '#f59e0b' },
];

const NOTICES = [
  'SolFort는 장외거래 플랫폼 운영자로서 내부 마켓플레이스 인프라를 제공합니다.',
  '모든 장외거래 등록 자산은 플랫폼 검토 및 승인 절차를 거칩니다.',
  '실물 인도 및 거래 정산은 SolFort 플랫폼 운영 조건에 따라 처리됩니다.',
  '고액 거래의 경우 KYC 인증 및 지갑 인증이 요구될 수 있습니다.',
  '모든 거래 조건 및 정산 약관을 반드시 확인한 후 거래를 진행하시기 바랍니다.',
];

export default function OTCOverview() {
  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SolFort 내부 마켓플레이스</p>
        <h1 className="text-2xl font-black text-white mb-1">장외거래</h1>
        <p className="text-sm text-slate-400">실물 자산 기반의 개인 간 및 비공개 거래 플랫폼</p>
      </div>

      {/* Cards */}
      <div className="space-y-3 mb-6">
        {OTC_CARDS.map(({ title, desc, icon: Icon, color, to }) => (
          <Link key={title} to={to}>
            <div className="rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{ background: `${color}0a`, border: `1px solid ${color}1a` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0 text-[10px] font-black"
                style={{ background: `${color}12`, border: `1px solid ${color}20`, color }}>
                열기 <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {QUICK_LINKS.map(({ label, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <div className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center"
              style={{ background: `${color}0a`, border: `1px solid ${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="text-[9px] font-black" style={{ color }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Notice */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">플랫폼 안내 및 유의사항</p>
        </div>
        <div className="space-y-1.5">
          {NOTICES.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-400/60 text-[9px] mt-0.5 flex-shrink-0">•</span>
              <p className="text-[9px] text-slate-400 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}