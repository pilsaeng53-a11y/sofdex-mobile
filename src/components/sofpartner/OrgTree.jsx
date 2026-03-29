import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ChevronRight, TrendingUp } from 'lucide-react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';
import { formatNumber } from './SOFQuantityCalc';

function GradeDot({ grade }) {
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['GREEN'];
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: gc.color, boxShadow: `0 0 6px ${gc.color}80` }} />;
}

function SubNode({ sub, depth = 0 }) {
  const gc = GRADE_CONFIG[sub.grade] || GRADE_CONFIG['GREEN'];
  const isPromoted = sub.status === 'promoted';
  const isRemoved  = sub.status === 'removed';

  return (
    <div className={`flex items-start gap-2 py-2.5 px-3 rounded-xl mb-1.5 ${isRemoved ? 'opacity-40' : ''}`}
      style={{
        background: isPromoted ? 'rgba(251,191,36,0.05)' : 'rgba(15,21,37,0.8)',
        border: `1px solid ${isPromoted ? 'rgba(251,191,36,0.2)' : 'rgba(148,163,184,0.07)'}`,
        marginLeft: depth * 12,
      }}>
      <GradeDot grade={sub.grade} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[10px] font-bold text-white">{sub.name || sub.walletAddress?.slice(0, 8) + '...'}</p>
          <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: gc.color, background: gc.bg }}>
            {sub.grade}
          </span>
          {isPromoted && (
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 flex items-center gap-0.5">
              <TrendingUp className="w-2 h-2" />승급
            </span>
          )}
          {isRemoved && <span className="text-[7px] text-slate-600 px-1.5 py-0.5 rounded-full bg-slate-800">해제</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-[8px] text-slate-500 font-mono">{sub.walletAddress?.slice(0, 10)}...{sub.walletAddress?.slice(-4)}</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[8px] text-slate-400">누적 ₩{formatNumber(sub.accumulatedSalesKRW || 0, 0)}</span>
          {sub.lastSubmitAt && (
            <span className="text-[8px] text-slate-600">최근: {new Date(sub.lastSubmitAt).toLocaleDateString('ko-KR')}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[9px] font-bold text-[#00d4aa]">{formatNumber(sub.lastSubmitQuantity || 0, 0)}</p>
        <p className="text-[7px] text-slate-600">마지막 SOF</p>
      </div>
    </div>
  );
}

export default function OrgTree({ wallet, active = [], promoted = [], loading = false, gradeInfo }) {
  const [showPromoted, setShowPromoted] = useState(false);
  const [sepHistory, setSepHistory] = useState([]);
  const [showSep, setShowSep] = useState(false);
  const [reassigning, setReassigning] = useState(null);
  const [newParent, setNewParent] = useState('');

  useEffect(() => {
    if (!wallet) return;
    base44.entities.SeparationHistory.filter({ parent_wallet: wallet }, '-separation_date', 50)
      .then(setSepHistory).catch(() => {});
  }, [wallet]);

  const handleReassign = async (sep) => {
    if (!newParent.trim()) return;
    setReassigning(sep.id);
    try {
      await base44.entities.SeparationHistory.update(sep.id, { new_parent_wallet: newParent.trim(), reason: 'admin' });
      setSepHistory(prev => prev.map(s => s.id === sep.id ? { ...s, new_parent_wallet: newParent.trim() } : s));
      setNewParent('');
    } catch {}
    setReassigning(null);
  };

  const totalSubSales = [...active, ...promoted].reduce((s, r) => s + (r.accumulatedSalesKRW || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="glass-card rounded-xl p-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[8px] text-slate-500 mb-0.5">활성 파트너</p>
          <p className="text-xl font-bold text-white">{active.length}</p>
        </div>
        <div className="text-center border-x border-[rgba(148,163,184,0.08)]">
          <p className="text-[8px] text-slate-500 mb-0.5">승급 파트너</p>
          <p className="text-xl font-bold text-amber-400">{promoted.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-slate-500 mb-0.5">하위 누적</p>
          <p className="text-[11px] font-bold text-[#00d4aa]">₩{formatNumber(totalSubSales, 0)}</p>
        </div>
      </div>

      {/* My node (root) */}
      {gradeInfo && (
        <div className="rounded-xl p-3 flex items-center gap-2.5"
          style={{ background: GRADE_CONFIG[gradeInfo.grade]?.bg || 'rgba(0,212,170,0.08)', border: `1px solid ${GRADE_CONFIG[gradeInfo.grade]?.border || 'rgba(0,212,170,0.3)'}` }}>
          <GradeDot grade={gradeInfo.grade} />
          <div>
            <p className="text-[10px] font-bold text-white">나 (파트너)</p>
            <p className="text-[8px] text-slate-400 font-mono">{wallet?.slice(0, 12)}...</p>
          </div>
          <span className="ml-auto text-[8px] font-black px-2 py-0.5 rounded-full" style={{ color: GRADE_CONFIG[gradeInfo.grade]?.color, background: GRADE_CONFIG[gradeInfo.grade]?.bg }}>
            {gradeInfo.grade}
          </span>
        </div>
      )}

      {/* Tree line indicator */}
      {(active.length > 0 || promoted.length > 0) && (
        <div className="flex items-center gap-2">
          <div className="w-px h-4 bg-[rgba(148,163,184,0.15)] ml-3" />
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <p className="text-[8px] text-slate-600">하위 파트너 ({active.length + promoted.length}명)</p>
        </div>
      )}

      {/* Active subordinates */}
      {loading ? (
        <div className="py-8 flex justify-center"><div className="w-5 h-5 spin-glow" /></div>
      ) : active.length === 0 && promoted.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">등록된 하위 파트너가 없습니다</p>
          <p className="text-[10px] text-slate-600 mt-1">하위 파트너가 등록되면 여기에 표시됩니다</p>
        </div>
      ) : (
        <>
          {active.map((sub, i) => <SubNode key={i} sub={sub} depth={1} />)}

          {promoted.length > 0 && (
            <div>
              <button onClick={() => setShowPromoted(v => !v)}
                className="flex items-center gap-2 text-[9px] font-bold text-amber-400 mb-2 px-1">
                <TrendingUp className="w-3 h-3" />
                승급된 파트너 ({promoted.length}명) {showPromoted ? '▲' : '▼'}
              </button>
              {showPromoted && promoted.map((sub, i) => <SubNode key={i} sub={sub} depth={1} />)}
            </div>
          )}
        </>
      )}

      {/* Separation history */}
      <div className="mt-4">
        <button onClick={() => setShowSep(v => !v)}
          className="flex items-center gap-2 text-[9px] font-bold text-slate-500 mb-2 px-1 hover:text-slate-300">
          <ChevronRight className={`w-3 h-3 transition-transform ${showSep ? 'rotate-90' : ''}`} />
          독립 분리 이력 ({sepHistory.length}건)
        </button>
        {showSep && (
          <div className="space-y-2">
            {sepHistory.length === 0 ? (
              <p className="text-[9px] text-slate-600 px-2">분리 이력 없음</p>
            ) : sepHistory.map((s, i) => (
              <div key={i} className="rounded-xl p-3 border border-[rgba(248,113,113,0.15)] bg-[rgba(239,68,68,0.04)]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-white">{s.sub_name || s.sub_wallet?.slice(0, 10) + '...'}</p>
                  <span className="text-[7px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                    {s.reason === 'same_grade' ? '동급 승급' : s.reason === 'higher_grade' ? '상위 승급' : '재배정'}
                  </span>
                </div>
                <p className="text-[8px] text-slate-500">{s.sub_grade} 등급 · {s.separation_date ? new Date(s.separation_date).toLocaleDateString('ko-KR') : '—'}</p>
                {s.new_parent_wallet ? (
                  <p className="text-[8px] text-emerald-400 mt-1">재배정 완료 → {s.new_parent_wallet.slice(0, 10)}...</p>
                ) : (
                  <div className="mt-2 flex gap-1.5">
                    <input value={newParent} onChange={e => setNewParent(e.target.value)}
                      placeholder="새 상위 지갑 주소" className="flex-1 bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-lg px-2 py-1 text-[9px] text-white" />
                    <button onClick={() => handleReassign(s)} disabled={reassigning === s.id}
                      className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/30">
                      {reassigning === s.id ? '...' : '재배정'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}