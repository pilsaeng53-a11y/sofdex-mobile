/**
 * AISalesManager — Floating AI Sales Manager panel
 */
import React, { useState, useRef } from 'react';
import { GRADE_CONFIG } from '@/services/partnerGradeService';
import {
  Brain, X, ChevronRight, Sparkles, Calculator, AlertTriangle,
  FileText, Users, TrendingUp, Copy, Check, Zap, Target, RefreshCw, BarChart2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

function Card({ title, children, color = '#00d4aa' }) {
  return (
    <div className="rounded-2xl border border-[rgba(148,163,184,0.06)] overflow-hidden mb-3">
      <div className="px-4 py-2.5 border-b border-[rgba(148,163,184,0.06)]" style={{ background: `${color}08` }}>
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{title}</p>
      </div>
      <div className="p-4 bg-[#0d1220]">{children}</div>
    </div>
  );
}

function ResultItem({ label, value, color = '#00d4aa' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] font-black" style={{ color }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, loading, color = '#00d4aa' }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl flex-1 transition-all active:scale-95"
      style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
      {loading
        ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color }} />
        : <Icon className="w-4 h-4" style={{ color }} />}
      <span className="text-[8px] font-black leading-tight text-center" style={{ color }}>{label}</span>
    </button>
  );
}

export default function AISalesManager({ submissions = [], gradeInfo, subActive = [] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('basic');
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState(false);

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));
  const setResult = (key, val) => setResults(p => ({ ...p, [key]: val }));

  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const monthSubs = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
  const monthUSDT = monthSubs.reduce((s, r) => s + (r.purchase_amount || 0), 0);
  const totalSOF  = submissions.reduce((s, r) => s + (r.center_fee_quantity || 0), 0);
  const grade = gradeInfo?.grade || 'GREEN';
  const feeRate = gradeInfo?.centerFeePercent || 5;
  const GRADE_ORDER = ['GREEN', 'PURPLE', 'GOLD', 'PLATINUM'];
  const nextGrade = GRADE_ORDER[Math.min(GRADE_ORDER.indexOf(grade) + 1, GRADE_ORDER.length - 1)];

  async function invoke(key, prompt) {
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
      setResult(key, res);
    } catch {
      setResult(key, { summary: '분석 실패. 다시 시도해주세요.', items: [] });
    }
    setLoad(key, false);
  }

  const calcPrompt = () => `SOF 파트너 영업 계산:
- 이번 달 판매: $${monthUSDT.toFixed(0)} USDT
- 등급: ${grade}, 센터피율: ${feeRate}%
- 하위 파트너: ${subActive.length}명
- 제출 건수: ${monthSubs.length}건

다음을 한국어로 계산해서 결과 items 배열로 반환:
- Estimated SOF (예상 SOF): 이번 달 센터피 예상량
- Recommender Share (추천인 몫): 예상 추천인 지급량
- Your Earnings (나의 수익): 최종 예상 수익 (USDT 환산)
summary에 2-3줄 핵심 요약.`;

  const scriptPrompt = () => `SOF 파트너 영업 스크립트 생성:
등급: ${grade}
이번 달 실적: $${monthUSDT.toFixed(0)} USDT

고객에게 SOFDex와 SOF 토큰을 소개하는 짧고 강력한 한국어 영업 스크립트.
summary에 스크립트 전문, items에 핵심 포인트 3-4개.`;

  const analysisPrompt = () => `SOF 파트너 성과 분석:
- 등급: ${grade} (다음 목표: ${nextGrade})
- 이번 달 판매: $${monthUSDT.toFixed(0)} USDT / ${monthSubs.length}건
- 하위 파트너: ${subActive.length}명 활성
- 누적 SOF 수익: ${totalSOF.toFixed(1)}개

한국어로 items 배열에:
- 강점 1-2개
- 개선 필요 1-2개
- 오늘 해야 할 액션 2개
summary에 전체 평가 2줄.`;

  const forecastPrompt = () => `SOF 파트너 수익 예측:
이번 달 현재: $${monthUSDT.toFixed(0)} USDT, ${monthSubs.length}건
등급: ${grade}, 센터피: ${feeRate}%

items 배열로:
- 오늘 예상 SOF
- 이번 달 예상 SOF
- 다음 달 예상 SOF (성장률 기반)
- 연간 예상 (추정)
summary에 핵심 예측 요약.`;

  const copyScript = () => {
    const text = results.script?.summary || '';
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const inactiveSubs = subActive.filter(s => {
    if (!s.lastSubmitAt) return true;
    return (Date.now() - new Date(s.lastSubmitAt).getTime()) > 7 * 86400000;
  });

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}>
        <Brain className="w-4 h-4" />
        AI Manager
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Slide-in panel */}
      <div className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] z-[100] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#0b0f1c', borderLeft: '1px solid rgba(139,92,246,0.15)', boxShadow: '-8px 0 48px rgba(0,0,0,0.6)' }}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)]"
          style={{ background: 'rgba(139,92,246,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">AI Sales Manager</p>
              <p className="text-[9px] text-slate-500">Your Sales Assistant</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-3 border-b border-[rgba(148,163,184,0.06)]">
          {['basic', 'advanced'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${mode === m ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25' : 'text-slate-500'}`}>
              {m === 'basic' ? 'Basic' : 'Advanced'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-none">

          {/* Quick Actions */}
          <Card title="Quick Actions" color="#8b5cf6">
            <div className="grid grid-cols-2 gap-2">
              <ActionBtn icon={Calculator}   label="Calculate for Me"    loading={loading.calc}   color="#00d4aa"  onClick={() => invoke('calc', calcPrompt())} />
              <ActionBtn icon={Sparkles}     label="Generate Script"     loading={loading.script} color="#8b5cf6"  onClick={() => invoke('script', scriptPrompt())} />
              <ActionBtn icon={AlertTriangle} label="Check Errors"       loading={loading.errors} color="#f59e0b"  onClick={() => invoke('errors', `내 파트너 데이터를 분석해서 이상값, 누락 입력, 잠재적 오류를 찾아줘. 등급:${grade}, 이번달:$${monthUSDT}USDT, 건수:${monthSubs.length}. items에 각 경고 항목, summary에 전체 요약.`)} />
              <ActionBtn icon={Target}       label="Get Strategy"        loading={loading.strategy} color="#3b82f6" onClick={() => invoke('strategy', `SOF 파트너 ${grade}등급 최적 영업 전략 3가지를 items 배열로, summary에 핵심 전략 요약.`)} />
            </div>
          </Card>

          {/* Calculation Result */}
          {results.calc && (
            <Card title="Calculation Result" color="#00d4aa">
              {results.calc.items?.map((item, i) => (
                <ResultItem key={i} label={item.label} value={item.value}
                  color={item.label?.includes('SOF') ? '#00d4aa' : item.label?.includes('추천') ? '#8b5cf6' : '#fbbf24'} />
              ))}
              {results.calc.summary && <p className="text-[9px] text-slate-400 mt-3 pt-2 border-t border-[rgba(148,163,184,0.06)]">{results.calc.summary}</p>}
            </Card>
          )}

          {/* Warnings */}
          {results.errors && (
            <Card title="Warnings" color="#f59e0b">
              {results.errors.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-white">{item.label}</p>
                    {item.value && <p className="text-[8px] text-slate-500">{item.value}</p>}
                  </div>
                </div>
              ))}
              {results.errors.summary && <p className="text-[9px] text-slate-400 mt-2">{results.errors.summary}</p>}
            </Card>
          )}

          {/* Sales Script */}
          {results.script && (
            <Card title="Sales Script" color="#8b5cf6">
              <div className="relative">
                <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap pr-8">{results.script.summary}</p>
                <button onClick={copyScript}
                  className="absolute top-0 right-0 w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)' }}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                </button>
              </div>
              {results.script.items?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[rgba(148,163,184,0.06)]">
                  {results.script.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 py-1 text-[9px] text-slate-400">
                      <ChevronRight className="w-3 h-3 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
                      <span><span className="text-white font-bold">{item.label}</span>{item.value ? `: ${item.value}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Subordinate Alert */}
          <Card title="Subordinate Alert" color="#f59e0b">
            {inactiveSubs.length === 0 && subActive.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-2">하위 파트너 없음</p>
            ) : inactiveSubs.length === 0 ? (
              <p className="text-[10px] text-emerald-400 text-center py-2">✓ 모든 하위 파트너 활성 상태</p>
            ) : (
              inactiveSubs.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{s.name || '파트너'}</p>
                    <p className="text-[8px] text-slate-500">7일 이상 활동 없음 — Needs follow-up</p>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Your Progress */}
          <Card title="Your Progress" color="#3b82f6">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">Current Grade</span>
                <span className="text-[11px] font-black" style={{ color: GRADE_CONFIG?.[grade]?.color || '#00d4aa' }}>{grade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">Next Grade</span>
                <span className="text-[11px] font-black text-slate-400">{nextGrade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">이번 달 판매</span>
                <span className="text-[11px] font-black text-white">${monthUSDT.toFixed(0)} USDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">누적 SOF 수익</span>
                <span className="text-[11px] font-black text-[#00d4aa]">{totalSOF.toFixed(1)} SOF</span>
              </div>
            </div>
          </Card>

          {/* ── ADVANCED MODE ── */}
          {mode === 'advanced' && (
            <>
              <div className="flex gap-2">
                <button onClick={() => invoke('analysis', analysisPrompt())} disabled={loading.analysis}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center gap-1.5">
                  {loading.analysis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BarChart2 className="w-3.5 h-3.5" />}
                  Analyze Customer
                </button>
                <button onClick={() => invoke('forecast', forecastPrompt())} disabled={loading.forecast}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center gap-1.5">
                  {loading.forecast ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  Predict Revenue
                </button>
              </div>
              <button onClick={() => invoke('smart', `SOF 파트너 ${grade}등급에 최적화된 설정 추천: 추천 프로모션%, 추천인%, 가격 제안. items에 각 추천 항목, summary에 요약.`)} disabled={loading.smart}
                className="w-full py-2.5 rounded-xl text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center gap-1.5">
                {loading.smart ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Optimize Settings
              </button>

              {/* AI Insights */}
              {results.analysis && (
                <Card title="Performance Analysis" color="#8b5cf6">
                  {results.analysis.items?.map((item, i) => (
                    <div key={i} className="py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                      <p className="text-[10px] font-bold text-white">{item.label}</p>
                      {item.value && <p className="text-[9px] text-slate-400 mt-0.5">{item.value}</p>}
                    </div>
                  ))}
                  {results.analysis.summary && <p className="text-[9px] text-[#8b5cf6] mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">{results.analysis.summary}</p>}
                </Card>
              )}

              {/* Revenue Forecast */}
              {results.forecast && (
                <Card title="Revenue Forecast" color="#3b82f6">
                  {results.forecast.items?.map((item, i) => (
                    <ResultItem key={i} label={item.label} value={item.value} color="#3b82f6" />
                  ))}
                  {results.forecast.summary && <p className="text-[9px] text-slate-400 mt-3">{results.forecast.summary}</p>}
                </Card>
              )}

              {/* Smart Suggestions */}
              {results.smart && (
                <Card title="Smart Suggestions" color="#f59e0b">
                  {results.smart.items?.map((item, i) => (
                    <ResultItem key={i} label={item.label} value={item.value} color="#fbbf24" />
                  ))}
                  {results.smart.summary && <p className="text-[9px] text-slate-400 mt-2">{results.smart.summary}</p>}
                </Card>
              )}

              {/* Action Required */}
              {results.strategy && (
                <Card title="Action Required" color="#ef4444">
                  {results.strategy.items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                      <Zap className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-white">{item.label}</p>
                        {item.value && <p className="text-[9px] text-slate-400">{item.value}</p>}
                      </div>
                    </div>
                  ))}
                  {results.strategy.summary && <p className="text-[9px] text-red-400/80 mt-2">{results.strategy.summary}</p>}
                </Card>
              )}
            </>
          )}

          <div className="h-4" />
        </div>
      </div>
    </>
  );
}