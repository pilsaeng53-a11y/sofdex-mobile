import React from 'react';
import { useUserMode } from './UserModeContext';
import { Zap, BookOpen } from 'lucide-react';

export default function UserModeToggle({ compact = false }) {
  const { mode, setMode } = useUserMode();

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-0.5 rounded-xl" style={{ background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <button onClick={() => setMode('lite')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all ${mode === 'lite' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          <BookOpen className="w-3 h-3" />초보자
        </button>
        <button onClick={() => setMode('pro')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all ${mode === 'pro' ? 'bg-[#00d4aa] text-[#05070d] shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          <Zap className="w-3 h-3" />전문가
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs font-bold text-white mb-1">화면 모드</p>
        <p className="text-[10px] text-slate-500">초보자 모드는 핵심 기능만 보여줍니다. 전문가 모드는 모든 기능을 표시합니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('lite')}
          className={`p-4 rounded-xl text-left transition-all ${mode === 'lite' ? 'border-2 border-[#3b82f6]' : 'border border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.2)]'}`}
          style={{ background: mode === 'lite' ? 'rgba(59,130,246,0.1)' : 'rgba(15,21,37,0.6)' }}>
          <BookOpen className={`w-5 h-5 mb-2 ${mode === 'lite' ? 'text-[#3b82f6]' : 'text-slate-500'}`} />
          <p className={`text-xs font-bold ${mode === 'lite' ? 'text-[#3b82f6]' : 'text-slate-300'}`}>Lite 모드</p>
          <p className="text-[9px] text-slate-500 mt-0.5">초보자 · 간편 보기</p>
          <ul className="mt-2 space-y-0.5">
            {['핵심 메뉴만 표시', '간단한 용어', 'AI 간편 인사이트', '쉬운 탐색'].map(t => (
              <li key={t} className="text-[8px] text-slate-600 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-600" />{t}
              </li>
            ))}
          </ul>
        </button>
        <button onClick={() => setMode('pro')}
          className={`p-4 rounded-xl text-left transition-all ${mode === 'pro' ? 'border-2 border-[#00d4aa]' : 'border border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.2)]'}`}
          style={{ background: mode === 'pro' ? 'rgba(0,212,170,0.08)' : 'rgba(15,21,37,0.6)' }}>
          <Zap className={`w-5 h-5 mb-2 ${mode === 'pro' ? 'text-[#00d4aa]' : 'text-slate-500'}`} />
          <p className={`text-xs font-bold ${mode === 'pro' ? 'text-[#00d4aa]' : 'text-slate-300'}`}>Pro 모드</p>
          <p className="text-[9px] text-slate-500 mt-0.5">전문가 · 전체 기능</p>
          <ul className="mt-2 space-y-0.5">
            {['전체 메뉴', '선물/파생', 'AI 분석 도구', '고급 전략'].map(t => (
              <li key={t} className="text-[8px] text-slate-600 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-600" />{t}
              </li>
            ))}
          </ul>
        </button>
      </div>
    </div>
  );
}