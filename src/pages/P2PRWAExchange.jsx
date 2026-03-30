import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Gem, ArrowRight, ShieldCheck, FileText, History, AlertTriangle } from 'lucide-react';

const NOTICE_ITEMS = [
  'SolFort는 등록 RWA 자산에 대한 내부 마켓플레이스 인프라를 운영합니다.',
  '모든 등록 자산 및 거래는 플랫폼 검토 및 확인 절차를 거칩니다.',
  '실물 인도 및 정산 요청은 SolFort 플랫폼 운영 조건에 따라 처리됩니다.',
  '거래 및 인도 조건을 반드시 확인한 후 거래를 진행하시기 바랍니다.',
  '일부 거래 유형은 KYC 인증 및 지갑 본인 확인이 필요할 수 있습니다.',
];

export default function P2PRWAExchange() {
  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SolFort 내부 마켓플레이스</p>
        <h1 className="text-2xl font-black text-white mb-1">개인 간 거래</h1>
        <p className="text-sm text-slate-400">SolFort 생태계 내 등록 실물 자산 직거래 플랫폼</p>
      </div>

      {/* Product Type Cards */}
      <div className="space-y-4 mb-6">
        {/* Real Estate P2P */}
        <Link to="/RealEstateP2P">
          <div className="rounded-3xl overflow-hidden transition-all active:scale-98 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-[#3b82f6]"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>내부 거래</span>
              </div>
              <h2 className="text-lg font-black text-white mb-1">부동산 장외거래</h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                내부 등록 부동산 RWA 자산의 개인 간 직거래. 목록 조회, 가격 제안, SolFort 플랫폼 내 거래 체결까지 모두 가능합니다.
              </p>
              <div className="flex items-center gap-4 mb-4">
                {['목록 조회', '가격 제안', '내 거래'].map(t => (
                  <span key={t} className="text-[9px] text-[#3b82f6] font-bold">✓ {t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">부동산 · 토큰화 자산</span>
                <div className="flex items-center gap-1.5 text-[#3b82f6] text-sm font-black">
                  시장 입장 <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Gold Physical Delivery */}
        <Link to="/GoldP2PMarket">
          <div className="rounded-3xl overflow-hidden transition-all active:scale-98 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(234,179,8,0.06))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  <Gem className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-[#f59e0b]"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>실물 인도</span>
              </div>
              <h2 className="text-lg font-black text-white mb-1">금 실물 거래</h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                금 RWA 단위 내부 거래 및 실물 인도 신청. 적격 보유자는 플랫폼 검토를 거쳐 인도 절차를 진행할 수 있습니다.
              </p>
              <div className="flex items-center gap-4 mb-4">
                {['내부 거래', '실물 인도', '요청 추적'].map(t => (
                  <span key={t} className="text-[9px] text-[#f59e0b] font-bold">✓ {t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">금 실물 · 금고 보관 자산</span>
                <div className="flex items-center gap-1.5 text-[#f59e0b] text-sm font-black">
                  시장 입장 <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: '내 거래 내역',  icon: History,   to: '/MyP2POrders',       color: '#8b5cf6' },
          { label: '내 등록 자산',  icon: FileText,  to: '/MyOTCListings',      color: '#3b82f6' },
          { label: '인도 신청 내역',icon: ShieldCheck,to: '/MyDeliveryRequests',color: '#f59e0b' },
        ].map(({ label, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <div className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center"
              style={{ background: `${color}0a`, border: `1px solid ${color}18` }}>
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="text-[10px] font-black" style={{ color }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Platform Notice */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">플랫폼 안내 및 유의사항</p>
        </div>
        <div className="space-y-1.5">
          {NOTICE_ITEMS.map((item, i) => (
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