import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Send, RefreshCw, Check, AlertTriangle, MessageSquare } from 'lucide-react';

const ISSUE_TYPES = [
  '거래 미처리',
  '상대방 미응답',
  '정산 분쟁',
  '실물 인도 문제',
  '금액 불일치',
  '자산 정보 불일치',
  '기타',
];

const STATUS_COLORS = {
  '접수됨':   '#f59e0b',
  '검토 중':  '#3b82f6',
  '처리 완료':'#22c55e',
  '종료됨':   '#64748b',
};

const MOCK_HISTORY = [
  { id: 'd1', orderId: 'OTC-001', asset: '금 실물 거래', issueType: '정산 분쟁', status: '검토 중', submittedDate: '2026-03-28', latestUpdate: '플랫폼에서 거래 기록을 검토 중입니다.' },
  { id: 'd2', orderId: 'OTC-002', asset: '부동산 RWA', issueType: '거래 미처리', status: '처리 완료', submittedDate: '2026-03-20', latestUpdate: '문제가 해결되었습니다. 정산이 완료되었습니다.' },
];

export default function OTCSupportDispute() {
  const [form, setForm] = useState({ orderId: '', asset: '', issueType: ISSUE_TYPES[0], description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit() {
    if (!form.orderId || !form.description) return;
    setLoading(true);
    setTimeout(() => { setSubmitted(true); setLoading(false); }, 800);
  }

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/OTCOverview">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">장외거래</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#f59e0b]" /> 분쟁 / 지원
          </h1>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5">장외거래 관련 문제 해결 및 분쟁 접수</p>

      <div className="rounded-2xl p-3 mb-5 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">SolFort는 접수된 모든 분쟁을 검토합니다. 처리 기간은 거래 복잡도 및 상대방 응답 여부에 따라 달라질 수 있습니다. 최종 결정은 플랫폼 운영 조건에 따릅니다.</p>
      </div>

      {!submitted ? (
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#0d1220', border: '1px solid rgba(245,158,11,0.1)' }}>
          <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider mb-4">문의 접수</p>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">거래 번호</label>
              <input value={form.orderId} onChange={e => set('orderId', e.target.value)} placeholder="예: OTC-1234"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">자산명</label>
              <input value={form.asset} onChange={e => set('asset', e.target.value)} placeholder="예: 금 실물 거래, 부동산 RWA"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">문의 유형</label>
              <select value={form.issueType} onChange={e => set('issueType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] appearance-none outline-none"
                style={{ background: 'rgba(245,158,11,0.06)' }}>
                {ISSUE_TYPES.map(t => <option key={t} value={t} style={{ background: '#0b0f1c' }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">문의 내용</label>
              <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="문제 상황을 상세히 입력해주세요..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading || !form.orderId || !form.description}
              className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
              문의 접수
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-5 flex flex-col items-center gap-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check className="w-8 h-8 text-emerald-400" />
          <p className="text-base font-black text-white">문의가 접수되었습니다</p>
          <p className="text-[10px] text-slate-400">SolFort 플랫폼 조건에 따라 검토 후 회신 드리겠습니다.</p>
          <button onClick={() => setSubmitted(false)} className="px-5 py-2 rounded-xl text-[10px] font-black text-[#f59e0b]"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            추가 문의하기
          </button>
        </div>
      )}

      {/* History */}
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-3">문의 내역</p>
      <div className="space-y-3">
        {MOCK_HISTORY.map(r => {
          const color = STATUS_COLORS[r.status] || '#94a3b8';
          return (
            <div key={r.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${color}15` }}>
              <div className="px-4 py-2.5 border-b flex items-center justify-between"
                style={{ borderColor: `${color}10`, background: `${color}08` }}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" style={{ color }} />
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{r.status}</span>
                </div>
                <span className="text-[8px] text-slate-500">{r.submittedDate}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-black text-white">{r.issueType}</p>
                  <span className="text-[8px] text-slate-500 font-mono">{r.orderId}</span>
                </div>
                <p className="text-[9px] text-slate-500 mb-2">{r.asset}</p>
                <div className="rounded-xl p-2.5" style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                  <p className="text-[8px] font-black uppercase tracking-wider mb-0.5" style={{ color }}>최신 상태</p>
                  <p className="text-[9px] text-slate-400">{r.latestUpdate}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}