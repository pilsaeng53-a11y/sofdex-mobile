import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Users, CalendarCheck } from 'lucide-react';

// Same data as Governance.jsx
const GOVERNANCE_RESULTS = [
  {
    id: 1,
    title: '락업 6개월 연장',
    description: '기존 락업 기간을 6개월 추가 연장하는 안건입니다.',
    reason: ['시장 하락 구간에서 물량 유출 방지', '가격 안정성 유지', '프로젝트 신뢰도 유지'],
    effects: ['단기 매도 압력 감소', '가격 방어', '장기 성장 기반 확보'],
    benefits: ['보유 가치 안정성', '시장 신뢰 유지', '장기 상승 기반 확보'],
    yesVotes: 1408, noVotes: 60, totalVotes: 1468,
    yesPercent: 95.9, noPercent: 4.1, status: '확정', date: '2025-12-01',
  },
  {
    id: 2,
    title: 'SOF 토큰 소각 프로그램 도입',
    description: '분기별 거래 수수료의 일부를 소각하여 총 공급량을 감소시키는 프로그램입니다.',
    reason: ['토큰 공급량 조절을 통한 가치 상승', '장기 보유자 이익 보호', '지속 가능한 토큰 경제 구조 구축'],
    effects: ['총 공급량 연간 최대 2% 감소', '디플레이션 구조 형성', '거래 수수료 수익의 생태계 환원'],
    benefits: ['보유 토큰 희소성 증가', '장기적 가격 상승 압력', '건전한 토큰 생태계 유지'],
    yesVotes: 2104, noVotes: 88, totalVotes: 2192,
    yesPercent: 96.0, noPercent: 4.0, status: '확정', date: '2025-10-15',
  },
  {
    id: 3,
    title: '파트너십 확대 및 마케팅 예산 증액',
    description: '글로벌 파트너십 확장을 위한 마케팅 예산을 20% 증액하는 안건입니다.',
    reason: ['글로벌 시장 점유율 확대 필요', '경쟁 프로젝트 대비 브랜드 인지도 제고', '신규 사용자 유입을 통한 생태계 성장'],
    effects: ['주요 거래소 상장 협의 가속화', '해외 커뮤니티 확장', '파트너사 공동 마케팅 진행'],
    benefits: ['토큰 유동성 증가', '생태계 참여자 다양화', '장기적 프로젝트 가치 상승'],
    yesVotes: 1876, noVotes: 312, totalVotes: 2188,
    yesPercent: 85.7, noPercent: 14.3, status: '확정', date: '2025-08-20',
  },
];

function Section({ title, color, children }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
      <p className={`text-[9px] font-black uppercase tracking-wider mb-3 ${color}`}>{title}</p>
      {children}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-[#00d4aa] text-[11px] mt-0.5">·</span>
          <span className="text-[11px] text-slate-300 leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GovernanceDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') || '1');
  const item = GOVERNANCE_RESULTS.find(p => p.id === id) || GOVERNANCE_RESULTS[0];

  return (
    <div className="min-h-screen pb-10">
      {/* Back header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{item.title}</p>
          <p className="text-[10px] text-slate-500 font-mono">SFD-{String(item.id).padStart(3, '0')}</p>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
          <CheckCircle2 className="w-3 h-3" /> {item.status}
        </span>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>확정일: {item.date}</span>
        </div>

        {/* 안건 개요 */}
        <Section title="안건 개요" color="text-slate-300">
          <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
        </Section>

        {/* 결정 이유 */}
        <Section title="결정 이유" color="text-blue-400">
          <BulletList items={item.reason} />
        </Section>

        {/* 기대 효과 */}
        <Section title="기대 효과" color="text-[#00d4aa]">
          <BulletList items={item.effects} />
        </Section>

        {/* 참여자 이득 */}
        <Section title="참여자 이득" color="text-purple-400">
          <BulletList items={item.benefits} />
        </Section>

        {/* 투표 결과 */}
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.04)]">
          <p className="text-[9px] font-black uppercase tracking-wider mb-4 text-slate-400">투표 결과</p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-400">YES {item.yesPercent}%</span>
            <span className="text-sm font-bold text-red-400">NO {item.noPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-[#0d1220] overflow-hidden flex mb-4">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full"
              style={{ width: `${item.yesPercent}%` }} />
            <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full"
              style={{ width: `${item.noPercent}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#0a0e1a] rounded-xl p-3">
              <p className="text-lg font-black text-emerald-400">{item.yesVotes.toLocaleString()}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">YES</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-3">
              <p className="text-lg font-black text-red-400">{item.noVotes.toLocaleString()}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">NO</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-3">
              <p className="text-lg font-black text-slate-200">{item.totalVotes.toLocaleString()}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">총 투표</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
            <Users className="w-3 h-3" />
            <span>투표 완료 · 재단 확정</span>
          </div>
        </div>
      </div>
    </div>
  );
}