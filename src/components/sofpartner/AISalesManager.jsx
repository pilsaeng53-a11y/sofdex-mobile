/**
 * AISalesManager — AI 영업 매니저 (Korean, fully functional)
 */
import React, { useState, useEffect } from 'react';
import { Brain, X, Calculator, Sparkles, AlertTriangle, Copy, Check, RefreshCw, ChevronRight, TrendingUp, BarChart2, Target, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

console.log('[AI 영업 매니저] 컴포넌트 마운트됨 ✓');

const SCENARIOS = [
  { value: 'new_customer',  label: '신규 고객' },
  { value: 'hesitant',      label: '망설이는 고객' },
  { value: 'comparing',     label: '다른 프로젝트 비교' },
  { value: 'recruit',       label: '영업자 리크루팅' },
  { value: 'followup',      label: '후속 안내' },
];

const GRADE_ORDER = ['GREEN', 'PURPLE', 'GOLD', 'PLATINUM'];
const GRADE_COLORS = { GREEN: '#22c55e', PURPLE: '#8b5cf6', GOLD: '#f59e0b', PLATINUM: '#e2e8f0' };

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, color = '#8b5cf6', children }) {
  return (
    <div className="rounded-2xl border overflow-hidden mb-3" style={{ borderColor: `${color}18` }}>
      <div className="px-3.5 py-2 border-b" style={{ background: `${color}0a`, borderColor: `${color}10` }}>
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{title}</p>
      </div>
      <div className="p-3.5 bg-[#0d1220]">{children}</div>
    </div>
  );
}

function ResultRow({ label, value, color = '#00d4aa', sub }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0 gap-2">
      <span className="text-[10px] text-slate-500 flex-shrink-0">{label}</span>
      <div className="text-right">
        <span className="text-[11px] font-black block" style={{ color }}>{value || '—'}</span>
        {sub && <span className="text-[8px] text-slate-600">{sub}</span>}
      </div>
    </div>
  );
}

function WarnRow({ label, detail, ok }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      {ok
        ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
        : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-[10px] font-bold" style={{ color: ok ? '#22c55e' : '#f1f5f9' }}>{label}</p>
        {detail && <p className="text-[9px] text-slate-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function ScriptBlock({ title, content, color }) {
  if (!content) return null;
  return (
    <div className="mb-2.5 rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      <p className="text-[8px] font-black uppercase tracking-wider mb-1.5" style={{ color }}>{title}</p>
      <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function ActionBtn({ label, icon: Icon, color, loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60"
      style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
      {loading
        ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color }} />
        : <Icon className="w-4 h-4" style={{ color }} />}
      <span className="text-[9px] font-black text-center leading-tight" style={{ color }}>{label}</span>
    </button>
  );
}

// ─── Calculation logic (pure JS) ──────────────────────────────────────────────

function calcSales({ salesKRW, usdtRate, sofPrice, promoPercent, recommenderPercent, centerFeePercent }) {
  if (!salesKRW || !usdtRate || !sofPrice) return null;
  const usdtAmount     = salesKRW / usdtRate;
  const baseSOF        = usdtAmount / sofPrice;
  const customerSOF    = baseSOF * (promoPercent / 100);
  const recommenderQty = baseSOF * (recommenderPercent / 100);
  const grossCenterFee = usdtAmount * (centerFeePercent / 100) / sofPrice;
  const netCenterFee   = grossCenterFee - recommenderQty;
  return { usdtAmount, baseSOF, customerSOF, recommenderQty, netCenterFee };
}

function validateInputs({ customerWallet, salesKRW, usdtRate, sofPrice, promoPercent, recommenderPercent, centerFeePercent }) {
  const warns = [];
  // Wallet check (Solana: 32-44 alphanumeric)
  if (customerWallet && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(customerWallet.trim())) {
    warns.push({ label: '고객 지갑 주소 형식이 올바르지 않습니다', detail: '솔라나 지갑 주소를 확인해주세요' });
  }
  if (!salesKRW || salesKRW <= 0) warns.push({ label: '입력값 누락', detail: '매출(KRW)을 입력해주세요' });
  if (!usdtRate || usdtRate <= 0) warns.push({ label: '당일 테더 시세를 입력해주세요', detail: '현재 테더 환율을 입력해야 계산이 가능합니다' });
  if (!sofPrice || sofPrice <= 0) warns.push({ label: 'SOF 단가를 입력해주세요', detail: 'SOF 현재 단가를 입력해야 합니다' });
  if (promoPercent < 100 || promoPercent > 500) warns.push({ label: '비정상 수치', detail: `프로모션 비율이 이상합니다 (${promoPercent}%)` });
  if (recommenderPercent > centerFeePercent) warns.push({ label: '추천인 수량이 센터피를 초과할 수 없습니다', detail: `추천인 ${recommenderPercent}% > 센터피 ${centerFeePercent}%` });
  return warns;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AISalesManager({ submissions = [], gradeInfo, subActive = [] }) {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState('basic');
  const [scenario, setScenario] = useState('new_customer');
  const [loading, setLoading] = useState({});
  const [calcResult, setCalcResult]   = useState(null);
  const [explanation, setExplanation] = useState('');
  const [warnings, setWarnings]       = useState(null); // null = not yet checked
  const [script, setScript]           = useState(null);
  const [advResult, setAdvResult]     = useState({});
  const [copied, setCopied]   = useState(false);
  const [toast, setToast]     = useState('');

  const grade    = gradeInfo?.grade || 'GREEN';
  const feeRate  = gradeInfo?.centerFeePercent || 5;
  const nextGrade = GRADE_ORDER[Math.min(GRADE_ORDER.indexOf(grade) + 1, GRADE_ORDER.length - 1)];

  const thisMonth  = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const monthSubs  = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
  const monthUSDT  = monthSubs.reduce((s, r) => s + (r.purchase_amount || 0), 0);
  const totalSOF   = submissions.reduce((s, r) => s + (r.center_fee_quantity || 0), 0);

  // Try to read live form values from the SOF sale form (window-level shared state)
  function getFormValues() {
    const f = window.__sofSaleForm || {};
    return {
      customerWallet:    f.customer_wallet || '',
      salesKRW:          Number(f.sales_krw) || 0,
      usdtRate:          Number(f.usdt_rate) || 0,
      sofPrice:          Number(f.sof_unit_price) || 0,
      promoPercent:      Number(f.promotion_percent) || 100,
      recommenderPercent:Number(f.recommender_percent) || 0,
      centerFeePercent:  Number(f.center_fee_percent) || feeRate,
    };
  }

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ── A. 대신 계산하기 ──────────────────────────────────────────────────────
  function handleCalculate() {
    console.log('[AI 매니저] 대신 계산하기 클릭됨');
    const v = getFormValues();
    const result = calcSales(v);
    if (!result) {
      setCalcResult(null);
      showToast('매출, 테더 시세, SOF 단가를 먼저 입력해주세요');
      return;
    }
    setCalcResult({ ...result, inputs: v });
  }

  // ── B. 계산 설명 ──────────────────────────────────────────────────────────
  function handleExplain() {
    console.log('[AI 매니저] 계산 설명 클릭됨');
    const v = getFormValues();
    const r = calcSales(v);
    if (!r) { showToast('먼저 계산을 실행해주세요'); return; }
    const text = `📊 계산 단계별 설명

1️⃣ 원화 → 테더 환산
   ${v.salesKRW.toLocaleString()}원 ÷ ${v.usdtRate} = ${r.usdtAmount.toFixed(2)} USDT

2️⃣ 테더 → 기본 SOF 수량
   ${r.usdtAmount.toFixed(2)} USDT ÷ $${v.sofPrice} = ${r.baseSOF.toFixed(2)} SOF

3️⃣ 프로모션 적용 (${v.promoPercent}%)
   ${r.baseSOF.toFixed(2)} × ${v.promoPercent / 100} = ${r.customerSOF.toFixed(2)} SOF (고객 수량)

4️⃣ 추천인 수량 계산 (${v.recommenderPercent}%)
   기본 수량 ${r.baseSOF.toFixed(2)} × ${v.recommenderPercent / 100} = ${r.recommenderQty.toFixed(2)} SOF

5️⃣ 센터피 계산 (${v.centerFeePercent}%)
   총 센터피 ${(r.netCenterFee + r.recommenderQty).toFixed(2)} SOF − 추천인 ${r.recommenderQty.toFixed(2)} SOF = ${r.netCenterFee.toFixed(2)} SOF (내 수익)`;
    setExplanation(text);
  }

  // ── C. 오류 확인 ──────────────────────────────────────────────────────────
  function handleCheckErrors() {
    console.log('[AI 매니저] 오류 확인 클릭됨');
    const v = getFormValues();
    const warns = validateInputs(v);
    if (inactiveSubs.length > 0) warns.push({ label: `3일 이상 활동 없는 하부가 ${inactiveSubs.length}명 있습니다`, detail: '팔로업이 필요합니다' });
    setWarnings(warns);
  }

  // ── D. 스크립트 생성 ──────────────────────────────────────────────────────
  async function handleGenerateScript() {
    console.log('[AI 매니저] 스크립트 생성 클릭됨');
    setLoad('script', true);
    setScript(null);
    const scenarioLabel = SCENARIOS.find(s => s.value === scenario)?.label || scenario;

    const PROMPTS = {
      new_customer: `당신은 SolFort SOF 토큰 영업 전문가입니다. 신규 고객에게 소개하는 한국어 영업 스크립트를 생성해주세요.
핵심 강조 사항:
- 상하 고정 구조가 아닌 실적 기반 기회
- 단순 보유가 아닌 구조 참여형 가치
- 누구나 능력에 따라 기회를 열 수 있음
자신감 있고 현실적인 어조로, 과도한 약속은 피할 것.`,

      hesitant: `망설이는 고객에게 부드럽고 논리적으로 설득하는 한국어 영업 스크립트를 생성해주세요.
고객의 우려를 공감하면서도 SolFort 참여형 구조의 차별점을 설명할 것.
보장은 피하고, 구조적 특성 중심으로 설명할 것.`,

      comparing: `다른 프로젝트(밈코인, AI 자동매매, 게임토큰 등)와 비교하는 고객을 위한 한국어 스크립트를 생성해주세요.
규칙: 상대방 프로젝트를 직접 비판하거나 스캠이라 표현하지 말 것.
대신 논리적 대조를 사용할 것:
- 단기 기대 중심 구조 vs 참여형 자산 기반 구조
- 지속가능성 차이
- 실사용/구조 확장성 차이
SolFort는 시스템 중심, 구조 참여형으로 포지셔닝할 것.`,

      recruit: `다른 영업자를 리크루팅하는 한국어 스크립트를 생성해주세요.
강조할 내용:
- 고정된 상하 구조가 아님
- 능력과 실적에 따라 누구나 기회
- 인센티브 구조가 열려 있음
- 구조 안에서 자신의 역할을 만들 수 있음
현실적이고 설득력 있게 작성할 것.`,

      followup: `이전에 관심을 보였던 고객에게 후속 연락하는 한국어 스크립트를 생성해주세요.
자연스럽게 재연결하고, 시간이 지났어도 기회가 있다는 것을 전달할 것.
압박감을 주지 않으면서도 행동을 유도할 것.`,
    };

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${PROMPTS[scenario]}\n\n응답 형식: JSON으로 hook(후킹 멘트), explanation(설명 멘트), conversation(대화형 멘트) 3개 필드만 반환. 각 필드는 2-4문장의 한국어 텍스트.`,
        response_json_schema: {
          type: 'object',
          properties: {
            hook: { type: 'string' },
            explanation: { type: 'string' },
            conversation: { type: 'string' },
          }
        }
      });
      setScript(res);
    } catch {
      setScript({
        hook: '스크립트 생성에 실패했습니다. 다시 시도해주세요.',
        explanation: '',
        conversation: '',
      });
    }
    setLoad('script', false);
  }

  // ── E. 스크립트 복사 ──────────────────────────────────────────────────────
  function handleCopyScript() {
    const text = [script?.hook, script?.explanation, script?.conversation].filter(Boolean).join('\n\n');
    if (!text) { showToast('먼저 스크립트를 생성해주세요'); return; }
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    showToast('스크립트가 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Advanced mode AI calls ────────────────────────────────────────────────
  async function invokeAdv(key, prompt) {
    setLoad(key, true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            items: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' } } } }
          }
        }
      });
      setAdvResult(p => ({ ...p, [key]: res }));
    } catch {
      setAdvResult(p => ({ ...p, [key]: { summary: '분석에 실패했습니다. 다시 시도해주세요.', items: [] } }));
    }
    setLoad(key, false);
  }

  const inactiveSubs = subActive.filter(s => {
    if (!s.lastSubmitAt) return true;
    return (Date.now() - new Date(s.lastSubmitAt).getTime()) > 3 * 86400000;
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => { console.log('[AI 매니저] 열림'); setOpen(true); }}
        className="fixed bottom-24 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', boxShadow: '0 8px 32px rgba(139,92,246,0.45)' }}>
        <Brain className="w-4 h-4" />
        AI 매니저
      </button>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-40 right-4 z-[10001] px-4 py-2 rounded-xl text-[11px] font-bold text-white shadow-xl"
          style={{ background: 'rgba(139,92,246,0.9)', border: '1px solid rgba(139,92,246,0.4)' }}>
          {toast}
        </div>
      )}

      {/* ── Backdrop ── */}
      {open && <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* ── Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full z-[9999] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 360, background: '#0b0f1c', borderLeft: '1px solid rgba(139,92,246,0.15)', boxShadow: '-8px 0 48px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)] flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">AI 영업 매니저</p>
              <p className="text-[10px] text-slate-400">당신의 세일즈 비서</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-3 border-b border-[rgba(148,163,184,0.06)] flex-shrink-0">
          {[['basic', '기본'], ['advanced', '고급']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${mode === m ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25' : 'text-slate-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">

          {/* ── 빠른 실행 ── */}
          <Card title="빠른 실행" color="#8b5cf6">
            <div className="grid grid-cols-2 gap-2">
              <ActionBtn label="대신 계산하기"  icon={Calculator}    color="#00d4aa" loading={false} onClick={handleCalculate} />
              <ActionBtn label="계산 설명"       icon={BarChart2}     color="#3b82f6" loading={false} onClick={handleExplain} />
              <ActionBtn label="오류 확인"       icon={AlertTriangle} color="#f59e0b" loading={false} onClick={handleCheckErrors} />
              <ActionBtn label="스크립트 생성"   icon={Sparkles}      color="#8b5cf6" loading={loading.script} onClick={handleGenerateScript} />
            </div>
          </Card>

          {/* ── 계산 결과 ── */}
          <Card title="계산 결과" color="#00d4aa">
            {calcResult ? (
              <>
                <ResultRow label="예상 SOF (고객)"  value={`${calcResult.customerSOF.toFixed(2)} SOF`}    color="#00d4aa" />
                <ResultRow label="추천인 수량"       value={`${calcResult.recommenderQty.toFixed(2)} SOF`} color="#8b5cf6" />
                <ResultRow label="내 수익 (센터피)"  value={`${calcResult.netCenterFee.toFixed(2)} SOF`}   color="#f59e0b" />
                <ResultRow label="테더 환산"         value={`${calcResult.usdtAmount.toFixed(2)} USDT`}    color="#94a3b8" />
                <p className="text-[9px] text-slate-500 mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">
                  현재 입력 기준으로 최종 고객 수량과 추천인/센터피 수량이 계산되었습니다.
                </p>
              </>
            ) : (
              <p className="text-[10px] text-slate-600 text-center py-2">
                현재 입력된 매출 정보가 없어 계산 결과를 표시할 수 없습니다.<br />
                <span className="text-[9px]">"대신 계산하기"를 클릭하거나 영업 양식을 먼저 입력해주세요.</span>
              </p>
            )}
          </Card>

          {/* Explanation (shown after explain click) */}
          {explanation && (
            <Card title="계산 설명" color="#3b82f6">
              <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">{explanation}</p>
            </Card>
          )}

          {/* ── 경고 ── */}
          <Card title="경고" color="#f59e0b">
            {warnings === null ? (
              <p className="text-[10px] text-slate-600 text-center py-1">"오류 확인"을 클릭하면 여기에 결과가 표시됩니다.</p>
            ) : warnings.length === 0 ? (
              <WarnRow label="현재 확인된 오류가 없습니다" ok />
            ) : (
              warnings.map((w, i) => <WarnRow key={i} label={w.label} detail={w.detail} ok={w.ok} />)
            )}
          </Card>

          {/* ── 영업 스크립트 ── */}
          <Card title="영업 스크립트" color="#8b5cf6">
            <div className="mb-3">
              <label className="text-[9px] text-slate-500 block mb-1">상황 선택</label>
              <select value={scenario} onChange={e => setScenario(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[11px] text-white font-semibold border border-[rgba(139,92,246,0.2)] appearance-none"
                style={{ background: 'rgba(139,92,246,0.08)' }}>
                {SCENARIOS.map(s => (
                  <option key={s.value} value={s.value} style={{ background: '#0b0f1c' }}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={handleGenerateScript} disabled={loading.script}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black text-[#8b5cf6] flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                {loading.script ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                스크립트 생성
              </button>
              <button onClick={handleCopyScript}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5"
                style={{
                  background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.1)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.15)'}`,
                  color: copied ? '#22c55e' : '#94a3b8',
                }}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                스크립트 복사
              </button>
            </div>

            {loading.script && (
              <div className="flex items-center justify-center gap-2 py-4 text-[10px] text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8b5cf6]" /> 스크립트 생성 중...
              </div>
            )}
            {script && !loading.script ? (
              <>
                <ScriptBlock title="후킹 멘트"    content={script.hook}         color="#00d4aa" />
                <ScriptBlock title="설명 멘트"    content={script.explanation}  color="#8b5cf6" />
                <ScriptBlock title="대화형 멘트"  content={script.conversation} color="#3b82f6" />
              </>
            ) : !loading.script && (
              <p className="text-[10px] text-slate-600 text-center py-1">상황을 선택하고 스크립트 생성을 클릭하세요.</p>
            )}
          </Card>

          {/* ── 하부 알림 ── */}
          <Card title="하부 알림" color="#f59e0b">
            {inactiveSubs.length === 0 && subActive.length === 0 ? (
              <>
                <WarnRow label="3일 이상 활동이 없는 하부가 있습니다" detail="하부 파트너를 등록하면 모니터링됩니다" ok={false} />
                <WarnRow label="최근 제출이 없는 하부가 있습니다" detail="팔로업이 필요한 파트너를 확인해주세요" ok={false} />
              </>
            ) : inactiveSubs.length === 0 ? (
              <WarnRow label="현재 특별한 하부 알림이 없습니다" ok />
            ) : (
              inactiveSubs.slice(0, 5).map((s, i) => (
                <WarnRow key={i}
                  label={`${s.name || '파트너'} — 3일 이상 활동 없음`}
                  detail="매출 하락이 감지될 수 있습니다. 팔로업이 필요합니다." />
              ))
            )}
          </Card>

          {/* ── 나의 진행 현황 ── */}
          <Card title="나의 진행 현황" color="#3b82f6">
            <ResultRow label="현재 등급" value={grade}     color={GRADE_COLORS[grade] || '#00d4aa'} />
            <ResultRow label="다음 등급" value={nextGrade} color="#64748b" />
            <ResultRow label="이번 달 매출" value={`$${monthUSDT.toFixed(0)} USDT`} color="#f1f5f9" />
            <ResultRow label="누적 SOF 수익" value={`${totalSOF.toFixed(1)} SOF`} color="#00d4aa" />
            <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">
              <p className="text-[9px] text-[#3b82f6] leading-relaxed">
                남은 조건: {nextGrade !== grade ? `${nextGrade}까지 활동 실적을 쌓아주세요` : '최고 등급입니다'}
              </p>
            </div>
          </Card>

          {/* ── 고급 모드 ── */}
          {mode === 'advanced' && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <ActionBtn label="고객 분석"   icon={BarChart2}    color="#8b5cf6" loading={loading.analysis}
                  onClick={() => invokeAdv('analysis', `SOF 파트너 등급 ${grade}, 이번달 매출 $${monthUSDT.toFixed(0)} USDT, ${monthSubs.length}건 기준으로 한국어 성과 분석. items에 강점 2개, 개선점 2개, summary에 핵심 평가.`)} />
                <ActionBtn label="매출 예측"   icon={TrendingUp}   color="#3b82f6" loading={loading.forecast}
                  onClick={() => invokeAdv('forecast', `SOF 파트너 ${grade}등급, 이번달 $${monthUSDT.toFixed(0)} USDT, ${monthSubs.length}건 기준으로 한국어 매출 예측. items에 이번달/다음달/3개월/연간 예상 수익, summary에 핵심 예측.`)} />
                <ActionBtn label="전략 받기"   icon={Target}       color="#00d4aa" loading={loading.strategy}
                  onClick={() => invokeAdv('strategy', `SOF ${grade}등급 파트너를 위한 최적 영업 전략 한국어 3가지. items에 각 전략, summary에 핵심 방향.`)} />
                <ActionBtn label="설정 최적화" icon={Zap}          color="#f59e0b" loading={loading.smart}
                  onClick={() => invokeAdv('smart', `SOF ${grade}등급 파트너 최적 설정 한국어 추천: 추천인%, 프로모션%, 가격 제안. items에 각 추천, summary에 요약.`)} />
              </div>

              {advResult.analysis && (
                <Card title="성과 분석" color="#8b5cf6">
                  {advResult.analysis.items?.map((item, i) => (
                    <div key={i} className="py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                      <p className="text-[10px] font-bold text-white">{item.label}</p>
                      {item.value && <p className="text-[9px] text-slate-400 mt-0.5">{item.value}</p>}
                    </div>
                  ))}
                  {advResult.analysis.summary && <p className="text-[9px] text-[#8b5cf6] mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">{advResult.analysis.summary}</p>}
                </Card>
              )}

              {advResult.forecast && (
                <Card title="매출 예측" color="#3b82f6">
                  {advResult.forecast.items?.map((item, i) => (
                    <ResultRow key={i} label={item.label} value={item.value} color="#3b82f6" />
                  ))}
                  {advResult.forecast.summary && <p className="text-[9px] text-slate-400 mt-2">{advResult.forecast.summary}</p>}
                </Card>
              )}

              {advResult.strategy && (
                <Card title="오늘 할 일" color="#00d4aa">
                  {advResult.strategy.items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                      <ChevronRight className="w-3 h-3 text-[#00d4aa] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-white">{item.label}</p>
                        {item.value && <p className="text-[9px] text-slate-400">{item.value}</p>}
                      </div>
                    </div>
                  ))}
                  {advResult.strategy.summary && <p className="text-[9px] text-[#00d4aa] mt-2">{advResult.strategy.summary}</p>}
                </Card>
              )}

              {advResult.smart && (
                <Card title="스마트 제안" color="#f59e0b">
                  {advResult.smart.items?.map((item, i) => (
                    <ResultRow key={i} label={item.label} value={item.value} color="#f59e0b" />
                  ))}
                  {advResult.smart.summary && <p className="text-[9px] text-slate-400 mt-2">{advResult.smart.summary}</p>}
                </Card>
              )}
            </>
          )}

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}