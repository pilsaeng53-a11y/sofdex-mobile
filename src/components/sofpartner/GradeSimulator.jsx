import React, { useMemo } from 'react';
import { TrendingUp, Users, CheckCircle, Circle } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';
import { formatNumber } from './SOFQuantityCalc';

// Grade progression requirements
const GRADE_REQUIREMENTS = {
  GREEN: {
    next: 'PURPLE',
    conditions: [
      { key: 'activeSubordinates', label: '활성 하위파트너', unit: '명', required: 3 },
      { key: 'monthlySalesUSDT',   label: '월 판매액',       unit: 'USDT', required: 5000 },
      { key: 'totalSubmissions',   label: '총 제출건수',     unit: '건',  required: 10 },
    ],
  },
  PURPLE: {
    next: 'GOLD',
    conditions: [
      { key: 'activeSubordinates', label: '활성 하위파트너', unit: '명', required: 8 },
      { key: 'monthlySalesUSDT',   label: '월 판매액',       unit: 'USDT', required: 20000 },
      { key: 'totalSubmissions',   label: '총 제출건수',     unit: '건',  required: 50 },
    ],
  },
  GOLD: {
    next: 'PLATINUM',
    conditions: [
      { key: 'activeSubordinates', label: '활성 하위파트너', unit: '명', required: 20 },
      { key: 'monthlySalesUSDT',   label: '월 판매액',       unit: 'USDT', required: 80000 },
      { key: 'totalSubmissions',   label: '총 제출건수',     unit: '건',  required: 200 },
    ],
  },
  PLATINUM: {
    next: null,
    conditions: [],
  },
};

function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const done = value >= max;
  return (
    <div className="mt-1.5">
      <div className="w-full h-1.5 rounded-full bg-[rgba(148,163,184,0.08)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? '#22c55e' : color }} />
      </div>
    </div>
  );
}

export default function GradeSimulator({ gradeInfo, submissions = [], subActive = [] }) {
  const grade = gradeInfo?.grade;
  const gc    = grade ? GRADE_CONFIG[grade] : null;
  const req   = grade ? GRADE_REQUIREMENTS[grade] : null;

  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthly = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
    return {
      activeSubordinates: subActive.length,
      monthlySalesUSDT:   monthly.reduce((s, r) => s + (r.purchase_amount || 0), 0),
      totalSubmissions:   submissions.length,
    };
  }, [submissions, subActive]);

  if (!grade || !gc) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500">등급 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!req?.next) {
    return (
      <div className="glass-card rounded-xl p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: gc.bg }}>
          <TrendingUp className="w-5 h-5" style={{ color: gc.color }} />
        </div>
        <p className="text-sm font-bold" style={{ color: gc.color }}>최고 등급 달성!</p>
        <p className="text-[10px] text-slate-500">PLATINUM — 더 높은 등급은 없습니다</p>
      </div>
    );
  }

  const nextGc = GRADE_CONFIG[req.next];
  const allMet = req.conditions.every(c => metrics[c.key] >= c.required);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">등급 승급 시뮬레이터</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-black" style={{ color: gc.color }}>{grade}</span>
              <span className="text-slate-600">→</span>
              <span className="text-sm font-black" style={{ color: nextGc.color }}>{req.next}</span>
            </div>
          </div>
          {allMet && (
            <div className="px-3 py-1.5 rounded-xl text-[9px] font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              조건 충족 ✓
            </div>
          )}
        </div>

        <div className="space-y-4">
          {req.conditions.map(cond => {
            const current = metrics[cond.key];
            const done    = current >= cond.required;
            const remaining = Math.max(0, cond.required - current);
            return (
              <div key={cond.key}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {done
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      : <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                    <span className="text-[9px] font-bold text-slate-300">{cond.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black ${done ? 'text-green-400' : 'text-white'}`}>
                      {formatNumber(current, 0)}{cond.unit}
                    </span>
                    <span className="text-[8px] text-slate-600"> / {formatNumber(cond.required, 0)}{cond.unit}</span>
                  </div>
                </div>
                <ProgressBar value={current} max={cond.required} color={gc.color} />
                {!done && (
                  <p className="text-[7px] text-slate-600 mt-0.5">
                    {formatNumber(remaining, 0)}{cond.unit} 더 필요
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next grade benefits preview */}
      <div className="rounded-xl p-4" style={{ background: nextGc.bg, border: `1px solid ${nextGc.border}` }}>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">{req.next} 등급 혜택 미리보기</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[8px] text-slate-500">프로모션 배율</p>
            <p className="text-sm font-bold" style={{ color: nextGc.color }}>
              {grade === 'GREEN' ? '100%' : grade === 'PURPLE' ? '120%' : '150%'}
            </p>
          </div>
          <div>
            <p className="text-[8px] text-slate-500">센터피 비율</p>
            <p className="text-sm font-bold" style={{ color: nextGc.color }}>
              {grade === 'GREEN' ? '8%' : grade === 'PURPLE' ? '10%' : '12%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}