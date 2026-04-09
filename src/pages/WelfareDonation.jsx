import React, { useState } from 'react';
import { Heart, Building2, Coins, ArrowRight, CheckCircle2, Loader2, ChevronRight, Info } from 'lucide-react';

const KRW_TO_USDT = 1500;
const USDT_TO_TOKEN = 3.2;

const RWA_ASSETS = [
  {
    type: '요양시설',
    name: '서울 노원구 실버케어 센터',
    location: '서울특별시 노원구',
    value: '₩ 12,400,000,000',
    desc: '고령화 사회를 대비한 프리미엄 요양시설. 100병상 규모 운영 예정.',
  },
  {
    type: '복지센터',
    name: '경기 성남 통합 복지센터',
    location: '경기도 성남시 분당구',
    value: '₩ 8,700,000,000',
    desc: '장애인 및 취약계층 통합 지원 복지센터. 다목적 커뮤니티 공간 포함.',
  },
];

const FLOW_STEPS = [
  { icon: Heart,     label: '후원 참여',       color: 'text-rose-400',   bg: 'bg-rose-400/10',   border: 'border-rose-400/25' },
  { icon: Building2, label: '복지시설 부동산 확보', color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25' },
  { icon: Coins,     label: '자산화 (RWA)',     color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/25' },
  { icon: CheckCircle2,label: '토큰 전환',      color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/25' },
];

const PROCESS_STEPS = ['후원 완료', '자산 확보 진행', 'RWA 전환 진행', '토큰 배정 완료'];

export default function WelfareDonation() {
  const [form, setForm] = useState({ name: '', contact: '', amount: '', wallet: '' });
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(-1);
  const [done, setDone] = useState(false);

  const amountNum = parseFloat(form.amount.replace(/,/g, '')) || 0;
  const usdt = amountNum > 0 ? (amountNum / KRW_TO_USDT).toFixed(2) : '0.00';
  const tokens = amountNum > 0 ? (amountNum / KRW_TO_USDT / USDT_TO_TOKEN).toFixed(4) : '0.0000';

  const handleAmount = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    setForm(f => ({ ...f, amount: raw ? num.toLocaleString('ko-KR') : '' }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.contact || !form.amount) return;
    setProcessing(true);
    setProcessStep(0);
    for (let i = 1; i <= PROCESS_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setProcessStep(i);
    }
    await new Promise(r => setTimeout(r, 400));
    setProcessing(false);
    setDone(true);
  };

  const reset = () => {
    setForm({ name: '', contact: '', amount: '', wallet: '' });
    setProcessStep(-1);
    setDone(false);
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-emerald-400/10 border border-amber-400/25 flex items-center justify-center">
            <Heart className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="text-xl font-black text-white">복지재단 기부 및 자산 전환</h1>
        </div>
        <p className="text-[12px] text-slate-400 ml-10">후원된 자금은 복지시설 설립 자산으로 활용됩니다</p>
      </div>

      <div className="px-4 space-y-5">

        {/* ─── Flow Steps ─── */}
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">후원 구조 안내</p>
          <div className="flex items-center gap-0">
            {FLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${step.color}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <p className="text-[9px] font-semibold text-slate-400 text-center leading-tight">{step.label}</p>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mb-3" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ─── RWA Asset Preview ─── */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">복지시설 자산 구성</p>
          <div className="space-y-2.5">
            {RWA_ASSETS.map((asset, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 border border-amber-400/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25">{asset.type}</span>
                    <span className="text-sm font-bold text-white">{asset.name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[9px] text-slate-600">위치</p>
                    <p className="text-[11px] text-slate-300 font-medium">{asset.location}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600">예상 자산 가치</p>
                    <p className="text-[11px] text-emerald-400 font-bold">{asset.value}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{asset.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Donation Form ─── */}
        {!done && (
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">후원 참여</p>
            <div className="space-y-3">
              {[
                { label: '이름', key: 'name', placeholder: '홍길동', type: 'text' },
                { label: '연락처', key: 'contact', placeholder: '010-0000-0000', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-slate-500 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.1)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40 transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">후원 금액 <span className="text-amber-400">(KRW)</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1,000,000"
                  value={form.amount}
                  onChange={handleAmount}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.1)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">지갑 주소 <span className="text-slate-600">(선택)</span></label>
                <input
                  type="text"
                  placeholder="Solana wallet address"
                  value={form.wallet}
                  onChange={e => setForm(prev => ({ ...prev, wallet: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.1)] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40 transition-colors font-mono text-[12px]"
                />
              </div>
            </div>

            {/* ─── Token Preview ─── */}
            {amountNum > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-amber-400/5 to-emerald-400/5 border border-amber-400/15">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">환산 금액</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">후원 금액</span>
                    <span className="text-[12px] font-bold text-white">₩ {form.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">환산 USDT <span className="text-[9px]">(÷{KRW_TO_USDT})</span></span>
                    <span className="text-[12px] font-bold text-cyan-400">$ {usdt}</span>
                  </div>
                  <div className="h-px bg-[rgba(148,163,184,0.07)]" />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-amber-400 font-semibold">예상 토큰 수량 <span className="text-[9px] text-slate-600">(÷{USDT_TO_TOKEN})</span></span>
                    <span className="text-[15px] font-black text-amber-400">{tokens} <span className="text-[10px]">SOF</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Processing Animation ─── */}
            {processing && (
              <div className="mt-4 space-y-2">
                {PROCESS_STEPS.map((label, i) => {
                  const state = i < processStep ? 'done' : i === processStep - 1 ? 'active' : 'pending';
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-500 ${
                      state === 'done' ? 'bg-emerald-400/8 border-emerald-400/20' :
                      state === 'active' ? 'bg-[#00d4aa]/8 border-[#00d4aa]/25' :
                      'bg-[#0d1525] border-[rgba(148,163,184,0.06)] opacity-40'
                    }`}>
                      {state === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : state === 'active' ? (
                        <Loader2 className="w-4 h-4 text-[#00d4aa] animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span className={`text-[12px] font-semibold ${state === 'done' ? 'text-emerald-400' : state === 'active' ? 'text-[#00d4aa]' : 'text-slate-600'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── Submit Button ─── */}
            {!processing && (
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.contact || !form.amount}
                className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: (!form.name || !form.contact || !form.amount)
                    ? 'rgba(148,163,184,0.08)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706, #10b981)',
                  color: 'white',
                  boxShadow: (!form.name || !form.contact || !form.amount)
                    ? 'none'
                    : '0 4px 20px rgba(245,158,11,0.3)',
                }}
              >
                후원 참여하기
              </button>
            )}
          </div>
        )}

        {/* ─── Result ─── */}
        {done && (
          <div className="glass-card rounded-2xl p-5 border border-emerald-400/20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">후원 및 전환 완료</h2>
            <p className="text-[11px] text-slate-500 mb-5">후원이 성공적으로 처리되었습니다</p>

            <div className="space-y-2.5 text-left mb-5">
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.08)]">
                <span className="text-[11px] text-slate-500">후원자</span>
                <span className="text-[12px] font-bold text-white">{form.name}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.08)]">
                <span className="text-[11px] text-slate-500">후원 금액</span>
                <span className="text-[12px] font-bold text-white">₩ {form.amount}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-[#0d1525] border border-[rgba(148,163,184,0.08)]">
                <span className="text-[11px] text-slate-500">자산 전환 상태</span>
                <span className="text-[12px] font-bold text-emerald-400">완료</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400/8 to-emerald-400/5 border border-amber-400/20">
                <span className="text-[11px] text-amber-400 font-semibold">토큰 수량</span>
                <span className="text-[16px] font-black text-amber-400">{tokens} SOF</span>
              </div>
            </div>

            <button onClick={reset} className="w-full py-3 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-sm text-slate-400 font-semibold hover:text-white transition-colors">
              새 후원 참여
            </button>
          </div>
        )}

        {/* ─── Disclaimer ─── */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-900/60 border border-[rgba(148,163,184,0.06)]">
          <Info className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-600 leading-relaxed">본 구조는 복지재단 자산 운영 구조 설명을 위한 데모입니다. 실제 금융 거래나 투자 권유가 아니며, 모든 수치는 시뮬레이션 목적으로 제공됩니다.</p>
        </div>

      </div>
    </div>
  );
}