import React, { useState } from 'react';
import { CheckCircle2, Users, ChevronDown, ChevronUp, Zap, CalendarCheck } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useSOFPrice, formatSOFPrice } from '../components/shared/useSOFPrice';

// ─── Governance result data ────────────────────────────────────
const GOVERNANCE_RESULTS = [
  {
    id: 1,
    title: '락업 6개월 연장',
    description: '기존 락업 기간을 6개월 추가 연장하는 안건입니다.',
    reason: [
      '시장 하락 구간에서 물량 유출 방지',
      '가격 안정성 유지',
      '프로젝트 신뢰도 유지',
    ],
    effects: [
      '단기 매도 압력 감소',
      '가격 방어',
      '장기 성장 기반 확보',
    ],
    benefits: [
      '보유 가치 안정성',
      '시장 신뢰 유지',
      '장기 상승 기반 확보',
    ],
    yesVotes: 1408,
    noVotes: 60,
    totalVotes: 1468,
    yesPercent: 95.9,
    noPercent: 4.1,
    status: '확정',
    date: '2025-12-01',
  },
  {
    id: 2,
    title: 'SOF 토큰 소각 프로그램 도입',
    description: '분기별 거래 수수료의 일부를 소각하여 총 공급량을 감소시키는 프로그램입니다.',
    reason: [
      '토큰 공급량 조절을 통한 가치 상승',
      '장기 보유자 이익 보호',
      '지속 가능한 토큰 경제 구조 구축',
    ],
    effects: [
      '총 공급량 연간 최대 2% 감소',
      '디플레이션 구조 형성',
      '거래 수수료 수익의 생태계 환원',
    ],
    benefits: [
      '보유 토큰 희소성 증가',
      '장기적 가격 상승 압력',
      '건전한 토큰 생태계 유지',
    ],
    yesVotes: 2104,
    noVotes: 88,
    totalVotes: 2192,
    yesPercent: 96.0,
    noPercent: 4.0,
    status: '확정',
    date: '2025-10-15',
  },
  {
    id: 3,
    title: '파트너십 확대 및 마케팅 예산 증액',
    description: '글로벌 파트너십 확장을 위한 마케팅 예산을 20% 증액하는 안건입니다.',
    reason: [
      '글로벌 시장 점유율 확대 필요',
      '경쟁 프로젝트 대비 브랜드 인지도 제고',
      '신규 사용자 유입을 통한 생태계 성장',
    ],
    effects: [
      '주요 거래소 상장 협의 가속화',
      '해외 커뮤니티 확장',
      '파트너사 공동 마케팅 진행',
    ],
    benefits: [
      '토큰 유동성 증가',
      '생태계 참여자 다양화',
      '장기적 프로젝트 가치 상승',
    ],
    yesVotes: 1876,
    noVotes: 312,
    totalVotes: 2188,
    yesPercent: 85.7,
    noPercent: 14.3,
    status: '확정',
    date: '2025-08-20',
  },
];

// ─── Result Card ───────────────────────────────────────────────
function GovernanceResultCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Summary row — always visible, click to expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> {item.status}
              </span>
              <span className="text-[9px] text-slate-600 flex items-center gap-1">
                <CalendarCheck className="w-2.5 h-2.5" /> {item.date}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
            : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
          }
        </div>

        {/* Vote bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-emerald-400 font-bold">YES {item.yesPercent}%</span>
            <span className="text-[11px] text-red-400 font-bold">NO {item.noPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#0d1220] overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all"
              style={{ width: `${item.yesPercent}%` }} />
            <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full transition-all"
              style={{ width: `${item.noPercent}%` }} />
          </div>
        </div>

        {/* Vote count */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Users className="w-3 h-3" />
          <span>총 투표수 {item.totalVotes.toLocaleString()}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[rgba(148,163,184,0.07)] px-4 pb-4 space-y-4 pt-4">

          {/* 안건 개요 */}
          <Section color="text-slate-300" title="안건 개요">
            <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
          </Section>

          {/* 결정 이유 */}
          <Section color="text-blue-400" title="결정 이유">
            <BulletList items={item.reason} color="text-blue-400" />
          </Section>

          {/* 기대 효과 */}
          <Section color="text-[#00d4aa]" title="기대 효과">
            <BulletList items={item.effects} color="text-[#00d4aa]" />
          </Section>

          {/* 참여자 이득 */}
          <Section color="text-purple-400" title="참여자 이득">
            <BulletList items={item.benefits} color="text-purple-400" />
          </Section>

          {/* 투표 결과 */}
          <div className="bg-[#0a0e1a] rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">투표 결과</p>
            <div className="h-3 rounded-full bg-[#0d1220] overflow-hidden flex mb-3">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full"
                style={{ width: `${item.yesPercent}%` }} />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full"
                style={{ width: `${item.noPercent}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-base font-black text-emerald-400">{item.yesVotes.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500">YES ({item.yesPercent}%)</p>
              </div>
              <div>
                <p className="text-base font-black text-red-400">{item.noVotes.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500">NO ({item.noPercent}%)</p>
              </div>
              <div>
                <p className="text-base font-black text-slate-200">{item.totalVotes.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500">총 투표</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div>
      <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${color}`}>{title}</p>
      {children}
    </div>
  );
}

function BulletList({ items, color }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className={`text-[9px] mt-0.5 ${color}`}>·</span>
          <span className="text-[11px] text-slate-300 leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function Governance() {
  const sofPrice = useSOFPrice();
  const sofDisplay = sofPrice.loading ? '…' : sofPrice.error ? '—' : formatSOFPrice(sofPrice.price);
  const sofChange = sofPrice.change24h != null ? `${sofPrice.change24h >= 0 ? '+' : ''}${sofPrice.change24h.toFixed(2)}%` : null;

  const totalVotes = GOVERNANCE_RESULTS.reduce((s, p) => s + p.totalVotes, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">거버넌스 결정 내역</h1>
        </div>
        <p className="text-xs text-slate-500">재단이 확정한 거버넌스 결정 사항을 표시합니다</p>
      </div>

      {/* Stats */}
      <div className="px-4 my-4">
        <div className="glass-card rounded-2xl p-4 glow-border">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-[#00d4aa]">{GOVERNANCE_RESULTS.length}</p>
              <p className="text-[9px] text-slate-500">확정 안건</p>
            </div>
            <div className="text-center border-x border-[rgba(148,163,184,0.06)]">
              <p className="text-lg font-bold text-white">{(totalVotes / 1000).toFixed(1)}K</p>
              <p className="text-[9px] text-slate-500">총 투표수</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">100%</p>
              <p className="text-[9px] text-slate-500">가결률</p>
            </div>
          </div>
        </div>
      </div>

      {/* SOF token info */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4aa]/5 rounded-full blur-xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SOF Token</p>
                <p className="text-[11px] text-slate-500">거버넌스 토큰</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{sofDisplay}</p>
              {sofChange && (
                <p className={`text-[11px] font-medium ${sofPrice.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{sofChange}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result cards */}
      <div className="px-4 space-y-3 pb-8">
        {GOVERNANCE_RESULTS.map(item => (
          <GovernanceResultCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}