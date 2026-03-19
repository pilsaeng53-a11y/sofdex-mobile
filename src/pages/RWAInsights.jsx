import React, { useState } from 'react';
import {
  TrendingUp, BarChart2, Globe, Building2, Zap, Shield,
  ArrowUpRight, ArrowDownRight, Layers, Package, DollarSign,
  Activity, PieChart, Star, ChevronRight, Flame
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARKET_STATS = [
  { label: '총 RWA TVL', value: '$12.4B', sub: '온체인 자산', color: '#00d4aa', change: '+18.4%', up: true },
  { label: '활성 자산', value: '2,847', sub: '글로벌 상장', color: '#8b5cf6', change: '+94', up: true },
  { label: '평균 APY', value: '8.3%', sub: '전 카테고리', color: '#f59e0b', change: '+0.7%', up: true },
  { label: '이번 달 신규', value: '+94', sub: '신규 등록', color: '#22c55e', change: '+31%', up: true },
];

const TOP_CATEGORIES = [
  { name: '부동산', tvl: '$4.8B', apy: '6.2%', icon: Building2, color: '#8b5cf6', share: 38.7, up: true, change: '+42%' },
  { name: '국채·채권', tvl: '$3.1B', apy: '5.2%', icon: TrendingUp, color: '#22c55e', share: 25.0, up: true, change: '+28%' },
  { name: '상품·원자재', tvl: '$2.2B', apy: '—', icon: Package, color: '#f59e0b', share: 17.7, up: true, change: '+18%' },
  { name: '주식·지분', tvl: '$1.4B', apy: '4.1%', icon: BarChart2, color: '#3b82f6', share: 11.3, up: false, change: '-4%' },
  { name: '대체 자산', tvl: '$0.9B', apy: '7.8%', icon: Layers, color: '#a78bfa', share: 7.3, up: true, change: '+61%' },
];

const TRENDING_THEMES = [
  {
    tag: '🔥 급상승',
    title: '음악 로열티 RWA 첫 상장',
    desc: '스트리밍 로열티 기반 RWA 토큰이 처음으로 온체인 상장. 평균 수익률 7.8%, 3개 추가 컬렉션 대기 중.',
    category: '대체 자산',
    categoryColor: '#a78bfa',
    change: '7.8% yield',
    up: true,
    icon: Zap,
  },
  {
    tag: '📈 급성장',
    title: '두바이·싱가포르 부동산 토큰',
    desc: '기관 투자자 주도의 두바이·싱가포르 프리미엄 부동산 토큰화 물량이 Q1 2026 기준 42% 급증.',
    category: '부동산',
    categoryColor: '#8b5cf6',
    change: '+42%',
    up: true,
    icon: Building2,
  },
  {
    tag: '🏛 제도화',
    title: '토큰화 주식, 규제 명확화',
    desc: 'SEC 가이던스 발표 이후 기업들이 합법적인 주식 토큰화 절차에 돌입. 2026년 3배 성장 전망.',
    category: '주식·지분',
    categoryColor: '#3b82f6',
    change: '+3×',
    up: true,
    icon: BarChart2,
  },
  {
    tag: '🥇 안전자산',
    title: '금 기반 토큰, YTD 18.4% 수익',
    desc: '매크로 불확실성 속 금 기반 RWA 토큰으로 안전자산 수요가 몰리며 연초 대비 18.4% 수익 기록.',
    category: '상품·원자재',
    categoryColor: '#f59e0b',
    change: '+18.4%',
    up: true,
    icon: Package,
  },
];

const FEATURED_MARKETS = [
  { city: '두바이', country: 'UAE', flag: '🇦🇪', volume: '$1.2B', growth: '+58%', up: true, type: '상업·주거 복합' },
  { city: '싱가포르', country: 'SGP', flag: '🇸🇬', volume: '$880M', growth: '+34%', up: true, type: '고급 주거·물류' },
  { city: '마이애미', country: 'USA', flag: '🇺🇸', volume: '$640M', growth: '+22%', up: true, type: '럭셔리 주거' },
  { city: '도쿄', country: 'JPN', flag: '🇯🇵', volume: '$510M', growth: '+19%', up: true, type: '오피스·임대' },
  { city: '런던', country: 'GBR', flag: '🇬🇧', volume: '$470M', growth: '-3%', up: false, type: '상업용 오피스' },
];

const YIELD_SNAPSHOT = [
  { name: '미국 국채 풀', ticker: 'USTR', apy: '5.2%', tvl: '$1.8B', rating: 'AAA', color: '#22c55e' },
  { name: '투자등급 회사채', ticker: 'IG-CORP', apy: '6.7%', tvl: '$890M', rating: 'A', color: '#3b82f6' },
  { name: '부동산 임대 풀', ticker: 'RE-YIELD', apy: '8.1%', tvl: '$620M', rating: 'BBB', color: '#8b5cf6' },
  { name: '신흥국 국채', ticker: 'EM-BOND', apy: '9.4%', tvl: '$340M', rating: 'BB', color: '#f59e0b' },
];

const TABS = ['개요', '카테고리', '부동산', '수익형 자산'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ stat }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.07)]">
      <p className="text-[10px] text-slate-500 mb-1">{stat.label}</p>
      <p className="text-xl font-black num-large" style={{ color: stat.color }}>{stat.value}</p>
      <div className="flex items-center gap-1 mt-1">
        {stat.up
          ? <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          : <ArrowDownRight className="w-3 h-3 text-red-400" />}
        <span className={`text-[10px] font-bold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</span>
        <span className="text-[10px] text-slate-600">{stat.sub}</span>
      </div>
    </div>
  );
}

function CategoryBar({ cat, maxShare }) {
  const Icon = cat.icon;
  const widthPct = (cat.share / maxShare) * 100;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${cat.color}18` }}>
        <Icon className="w-4 h-4" style={{ color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-white">{cat.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">{cat.tvl}</span>
        </div>
        <div className="h-1.5 bg-[#151c2e] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${widthPct}%`, background: cat.color }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0 w-14">
        <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${cat.up ? 'text-emerald-400' : 'text-red-400'}`}>
          {cat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {cat.change}
        </div>
        <div className="text-[9px] text-slate-600">{cat.apy !== '—' ? `APY ${cat.apy}` : '현물'}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RWAInsights() {
  const [activeTab, setActiveTab] = useState('개요');
  const maxShare = Math.max(...TOP_CATEGORIES.map(c => c.share));

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">RWA 인사이트</h1>
            <p className="text-xs text-slate-500">실물 자산 시장 인텔리전스</p>
          </div>
        </div>
      </div>

      {/* Trust banner */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#00d4aa]/5 border border-[#00d4aa]/12">
          <Shield className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
          <p className="text-[10px] text-slate-400">
            <span className="text-[#00d4aa] font-bold">기관급 인텔리전스</span> — 온체인 데이터, 규제 공시 및 SolFort Foundation 리서치 기반
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          {MARKET_STATS.map(s => <StatCard key={s.label} stat={s} />)}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                  : 'bg-[#151c2e] text-slate-500 border border-[rgba(148,163,184,0.06)] hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: 개요 ── */}
      {activeTab === '개요' && (
        <div className="px-4 space-y-4">
          {/* Trending themes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">트렌딩 테마</p>
            </div>
            <div className="space-y-3">
              {TRENDING_THEMES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-card rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
                    <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${item.categoryColor}60, transparent)` }} />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.categoryColor}18` }}>
                          <Icon className="w-4 h-4" style={{ color: item.categoryColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${item.categoryColor}18`, color: item.categoryColor }}>{item.tag}</span>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" />{item.change}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: 카테고리 ── */}
      {activeTab === '카테고리' && (
        <div className="px-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-[#8b5cf6]" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">카테고리별 TVL 분포</p>
            </div>
            <div className="glass-card rounded-2xl border border-[rgba(148,163,184,0.07)] p-4">
              {TOP_CATEGORIES.map(cat => (
                <CategoryBar key={cat.name} cat={cat} maxShare={maxShare} />
              ))}
            </div>
          </div>

          {/* Category summary cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {TOP_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="glass-card rounded-2xl p-3.5 border border-[rgba(148,163,184,0.07)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-white">{cat.name}</span>
                  </div>
                  <p className="text-base font-black" style={{ color: cat.color }}>{cat.tvl}</p>
                  <p className="text-[9px] text-slate-600">{cat.share}% 점유율</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: 부동산 ── */}
      {activeTab === '부동산' && (
        <div className="px-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#8b5cf6]" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">주요 부동산 시장</p>
            </div>
            <div className="glass-card rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
              {FEATURED_MARKETS.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <span className="text-xl flex-shrink-0">{m.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{m.city}</p>
                    <p className="text-[10px] text-slate-500">{m.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{m.volume}</p>
                    <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {m.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market insight card */}
          <div className="glass-card rounded-2xl p-4 border border-[#8b5cf6]/20" style={{ background: 'rgba(139,92,246,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs font-bold text-[#8b5cf6]">편집자 픽</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">두바이 RWA 허브로 급부상</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              두바이는 2026년 기준 글로벌 부동산 토큰화 거래량의 22%를 차지하며 RWA 허브로 자리매김했습니다. DIFC 규제 프레임워크가 기관 투자자들의 신뢰를 끌어올린 주요 요인입니다.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB: 수익형 자산 ── */}
      {activeTab === '수익형 자산' && (
        <div className="px-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#22c55e]" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">수익형 RWA 현황</p>
            </div>
            <div className="space-y-2.5">
              {YIELD_SNAPSHOT.map(y => (
                <div key={y.ticker} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.07)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{y.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#151c2e] text-slate-500 font-mono">{y.ticker}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: `${y.color}18`, color: y.color }}>신용등급 {y.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black" style={{ color: y.color }}>{y.apy}</p>
                      <p className="text-[9px] text-slate-600">연 수익률 (APY)</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.06)] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">총 예치 금액</span>
                    <span className="text-[10px] font-bold text-white">{y.tvl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yield disclaimer */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
            <Shield className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              수익률은 과거 데이터 기반이며 미래 성과를 보장하지 않습니다. 투자 전 자산별 위험 요소를 충분히 검토하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}