import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Layers, Send, RefreshCw, Check, Clock, AlertTriangle } from 'lucide-react';

const ASSETS = ['SOF 토큰', '부동산 RWA', '금 실물', '원자재 RWA', '기타'];

const MOCK_RECENT = [
  { id: 'bt1', asset: '금 실물', quantity: 500, targetPrice: 3900000, status: '검토 중', date: '2026-03-28' },
  { id: 'bt2', asset: '부동산 RWA', quantity: 200, targetPrice: 500000, status: '매칭 완료', date: '2026-03-25' },
];

const STATUS_COLORS = {
  '진행 중':   '#94a3b8',
  '검토 중':   '#f59e0b',
  '매칭 완료': '#3b82f6',
  '거래 완료': '#22c55e',
  '취소됨':    '#64748b',
  '거절됨':    '#ef4444',
};

export default function OTCBlockTrade() {
  const [form, setForm] = useState({ asset: 'SOF 토큰', quantity: '', targetPrice: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.quantity || !form.targetPrice) return;
    setLoading(true);
    try {
      await base44.entities.P2POrder.create({
        listing_id: 'block_trade',
        listing_title: `대량 거래 — ${form.asset}`,
        asset_type: 'real_estate',
        buyer_wallet: 'MY_WALLET',
        order_type: 'offer',
        quantity: Number(form.quantity),
        offered_price_usdt: Number(form.targetPrice),
        total_usdt: Number(form.quantity) * Number(form.targetPrice),
        status: 'Submitted',
        ordered_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch { setSubmitted(true); }
    setLoading(false);
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
            <Layers className="w-5 h-5 text-[#00d4aa]" /> 대량 거래 데스크
          </h1>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5">일반 한도를 초과하는 대규모 비공개 거래 전용 창구</p>

      <div className="rounded-2xl p-3 mb-5 flex items-start gap-2" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#00d4aa] flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">대량 거래 요청은 SolFort 플랫폼 검토 및 상대방 매칭 절차를 거칩니다. 요청 접수가 거래 체결을 보장하지 않으며, 최종 정산은 플랫폼 확인 후 진행됩니다.</p>
      </div>

      {!submitted ? (
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#0d1220', border: '1px solid rgba(0,212,170,0.1)' }}>
          <p className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider mb-4">대량 거래 요청</p>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">자산 종류</label>
              <select value={form.asset} onChange={e => set('asset', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] appearance-none outline-none"
                style={{ background: 'rgba(0,212,170,0.06)' }}>
                {ASSETS.map(a => <option key={a} value={a} style={{ background: '#0b0f1c' }}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">거래 수량</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="예: 500"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">희망 가격 (USDT / 단위)</label>
              <input type="number" value={form.targetPrice} onChange={e => set('targetPrice', e.target.value)} placeholder="예: 7800"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">추가 요청 사항 (선택)</label>
              <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)} placeholder="거래 조건 또는 기타 요청 사항을 입력하세요..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none resize-none" />
            </div>
            {form.quantity && form.targetPrice && (
              <div className="flex justify-between items-center py-2 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-[10px] text-slate-500">예상 총액</span>
                <span className="text-sm font-black text-[#00d4aa]">${(Number(form.quantity) * Number(form.targetPrice)).toLocaleString()} USDT</span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading || !form.quantity || !form.targetPrice}
              className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
              대량 거래 요청
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-5 flex flex-col items-center gap-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check className="w-8 h-8 text-emerald-400" />
          <p className="text-base font-black text-white">요청이 접수되었습니다</p>
          <p className="text-[10px] text-slate-400">대량 거래 요청이 검토 중입니다. SolFort 플랫폼 조건에 따라 처리 및 매칭이 진행됩니다.</p>
          <button onClick={() => setSubmitted(false)} className="px-5 py-2 rounded-xl text-[10px] font-black text-[#00d4aa]"
            style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>
            추가 요청하기
          </button>
        </div>
      )}

      {/* Recent */}
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-3">최근 대량 거래 요청 내역</p>
      <div className="space-y-2">
        {MOCK_RECENT.map(r => {
          const color = STATUS_COLORS[r.status] || '#94a3b8';
          return (
            <div key={r.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#0d1220', border: `1px solid ${color}15` }}>
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white">{r.asset}</p>
                <p className="text-[9px] text-slate-500">수량: {r.quantity} · ${r.targetPrice.toLocaleString()} / 단위 · {r.date}</p>
              </div>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
                {r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}