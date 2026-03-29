/**
 * SalesScriptGenerator — AI-generated customer explanation text with copy
 */
import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SCENARIOS = [
  { id: 'intro', label: '입문 고객 소개' },
  { id: 'why_sof', label: 'SOF 가치 설명' },
  { id: 'promotion', label: '현재 프로모션 안내' },
  { id: 'long_term', label: '장기 보유 전략' },
  { id: 'risk', label: '리스크 안내 (투명)' },
];

export default function SalesScriptGenerator({ gradeInfo }) {
  const [scenario, setScenario] = useState('intro');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setScript('');
    const grade = gradeInfo?.grade || 'PARTNER';
    const scenarioLabel = SCENARIOS.find(s => s.id === scenario)?.label || scenario;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `당신은 SOFDex 플랫폼의 전문 파트너 영업 코치입니다.
파트너 등급: ${grade}
시나리오: ${scenarioLabel}

SOFDex는 Solana 기반 거래소이며, SOF 토큰은 플랫폼 내 실거래 기반 유틸리티 토큰입니다.

이 시나리오에 맞는 한국어 고객 설명 스크립트를 작성해주세요.
- 2~4 문단
- 자연스럽고 신뢰감 있는 어조
- 과장 없이 투명하고 정확하게
- 실제 영업 현장에서 바로 사용할 수 있는 수준`,
      });
      setScript(typeof result === 'string' ? result : result?.content || JSON.stringify(result));
    } catch {
      setScript('스크립트 생성에 실패했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(script).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
        <p className="text-sm font-bold text-white">영업 스크립트 생성기</p>
      </div>
      <p className="text-[9px] text-slate-500">AI가 현재 등급에 맞는 고객 설명 문구를 생성해드립니다.</p>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setScenario(s.id)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
              scenario === s.id
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25'
                : 'bg-[#151c2e] text-slate-500 border border-transparent'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading}
        className="w-full py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', opacity: loading ? 0.7 : 1 }}>
        {loading
          ? <><RefreshCw className="w-4 h-4 animate-spin" />생성 중...</>
          : <><Sparkles className="w-4 h-4" />스크립트 생성</>
        }
      </button>

      {script && (
        <div className="glass-card rounded-2xl p-4 border border-[#8b5cf6]/15 relative">
          <p className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">{script}</p>
          <button onClick={copy}
            className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
            style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.1)' }}>
            {copied
              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
              : <Copy className="w-3.5 h-3.5 text-[#8b5cf6]" />
            }
          </button>
        </div>
      )}
    </div>
  );
}