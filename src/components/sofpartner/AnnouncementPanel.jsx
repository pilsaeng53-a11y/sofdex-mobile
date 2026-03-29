import React from 'react';
import { Megaphone, TrendingUp, Tag, Info } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

// Mock announcements — replace with DB/API fetch when available
const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'promotion',
    title: '3월 특별 프로모션 연장',
    body: '3월 한달간 모든 등급 파트너에게 추가 5% 보너스 프로모션이 적용됩니다. 관련 문의는 재단 텔레그램으로 연락해 주세요.',
    date: '2026-03-25',
    priority: 'high',
  },
  {
    id: 2,
    type: 'price',
    title: 'SOF 단가 업데이트',
    body: '2026년 3월 29일 기준 SOF 공식 단가: $4.20 USD. 제출 시 반드시 당일 공지 단가 사용 바랍니다.',
    date: '2026-03-29',
    priority: 'high',
    highlight: '$4.20',
  },
  {
    id: 3,
    type: 'info',
    title: '등급 승급 심사 일정',
    body: '4월 1일부터 PURPLE → GOLD 등급 승급 심사가 시작됩니다. 조건 충족 여부를 확인하고 재단에 신청하세요.',
    date: '2026-03-28',
    priority: 'medium',
  },
  {
    id: 4,
    type: 'info',
    title: '제출 마감 안내',
    body: '3월 제출 마감일: 2026년 3월 31일 23:59 (KST). 마감 이후 제출 건은 4월 실적으로 산정됩니다.',
    date: '2026-03-20',
    priority: 'medium',
  },
];

const TYPE_CONFIG = {
  promotion: { icon: Tag,        color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   label: '프로모션' },
  price:     { icon: TrendingUp, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)',   border: 'rgba(0,212,170,0.2)',   label: 'SOF 단가' },
  info:      { icon: Info,       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  label: '안내' },
};

// Current grade benefit table
const GRADE_BENEFITS = [
  { grade: 'GREEN',    promo: '80%',  cf: '5%'  },
  { grade: 'PURPLE',   promo: '100%', cf: '8%'  },
  { grade: 'GOLD',     promo: '120%', cf: '10%' },
  { grade: 'PLATINUM', promo: '150%', cf: '12%' },
];

function AnnouncementCard({ item }) {
  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
  const Icon = tc.icon;
  return (
    <div className="rounded-xl p-4" style={{ background: tc.bg, border: `1px solid ${tc.border}` }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tc.color}14` }}>
          <Icon className="w-4 h-4" style={{ color: tc.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: tc.color, background: `${tc.color}20` }}>
              {tc.label}
            </span>
            {item.priority === 'high' && (
              <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">중요</span>
            )}
            <span className="text-[7px] text-slate-600 ml-auto">{item.date}</span>
          </div>
          <p className="text-[10px] font-bold text-white mb-1">{item.title}</p>
          <p className="text-[9px] text-slate-400 leading-relaxed">{item.body}</p>
          {item.highlight && (
            <p className="text-lg font-black mt-2" style={{ color: tc.color }}>{item.highlight}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementPanel({ gradeInfo }) {
  const grade = gradeInfo?.grade;
  const gc    = grade ? GRADE_CONFIG[grade] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-[#00d4aa]" />
        <p className="text-sm font-bold text-white">공지 및 현황</p>
      </div>

      {/* Current SOF price highlight */}
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">오늘의 SOF 공식 단가</p>
          <p className="text-2xl font-black text-[#00d4aa] mt-0.5">$4.20</p>
          <p className="text-[8px] text-slate-600 mt-0.5">2026-03-29 기준 재단 공시가</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-slate-500">테더 환율 참고</p>
          <p className="text-base font-bold text-white">₩1,380</p>
          <p className="text-[8px] text-slate-600">KRW/USDT</p>
        </div>
      </div>

      {/* My grade benefit */}
      {gc && gradeInfo && (
        <div className="rounded-xl p-4" style={{ background: gc.bg, border: `1px solid ${gc.border}` }}>
          <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-2">내 등급 현황</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black" style={{ color: gc.color }}>{grade}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">지갑: {gradeInfo.walletAddress?.slice(0, 8)}...</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-slate-500">프로모션 / 센터피</p>
              <p className="text-base font-black" style={{ color: gc.color }}>{gradeInfo.promotionPercent}% · {gradeInfo.centerFeePercent}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Grade benefits table */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-3">등급별 혜택 현황</p>
        <div className="space-y-1.5">
          {GRADE_BENEFITS.map(b => {
            const bgc = GRADE_CONFIG[b.grade];
            const isMine = b.grade === grade;
            return (
              <div key={b.grade} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isMine ? 'ring-1' : ''}`}
                style={{ background: isMine ? bgc.bg : 'rgba(15,21,37,0.5)', ringColor: bgc.color }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: bgc.color }} />
                  <span className="text-[9px] font-bold" style={{ color: isMine ? bgc.color : '#94a3b8' }}>{b.grade}</span>
                  {isMine && <span className="text-[7px] bg-white/5 px-1.5 rounded-full text-slate-400">현재</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] text-slate-400">프로모션 <span className="font-bold text-white">{b.promo}</span></span>
                  <span className="text-[8px] text-slate-400">센터피 <span className="font-bold text-white">{b.cf}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements */}
      <div className="space-y-3">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">재단 공지</p>
        {MOCK_ANNOUNCEMENTS.map(item => <AnnouncementCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}