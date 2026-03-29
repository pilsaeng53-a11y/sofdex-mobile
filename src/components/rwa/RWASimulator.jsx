/**
 * RWASimulator — Investment return simulator with 3 scenarios
 */
import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, ChevronDown } from 'lucide-react';

const SCENARIOS = {
  conservative: { label: '보수적', color: '#94a3b8', multiplier: 0.7, desc: '낮은 수익 시나리오' },
  base:         { label: '기본',   color: '#00d4aa', multiplier: 1.0, desc: '예상 평균 수익' },
  aggressive:   { label: '적극적', color: '#f59e0b', multiplier: 1.35, desc: '높은 수익 시나리오' },
};

function parseIRR(irrStr) {
  if (!irrStr) return 0.12;
  const match = String(irrStr).match(/(\d+\.?\d*)–?(\d+\.?\d*)?/);
  if (!match) return 0.12;
  if (match[2]) return (parseFloat(match[1]) + parseFloat(match[2])) / 2 / 100;
  return parseFloat(match[1]) / 100;
}

function parseHolding(holdStr) {
  if (!holdStr) return 3;
  const match = String(holdStr).match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

export default function RWASimulator({ property }) {
  const [amount, setAmount] = useState(property.minimumInvestment || 1000);
  const [scenario, setScenario] = useState('base');

  const baseIRR = parseIRR(property.targetIRR || property.targetCashYield);
  const holding = parseHolding(property.holdingPeriod);
  const tokenPrice = property.tokenPrice || 100;

  const calc = useMemo(() => {
    const sc = SCENARIOS[scenario];
    const irr = baseIRR * sc.multiplier;
    const tokens = Math.floor(amount / tokenPrice);
    const annualReturn = amount * irr;
    const totalReturn = amount * (Math.pow(1 + irr, holding) - 1);
    return { tokens, annualReturn, totalReturn, irr };
  }, [amount, scenario, baseIRR, holding, tokenPrice]);

  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(0,212,170,0.1)]">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-[#00d4aa]" />
        <p className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider">투자 시뮬레이터</p>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="text-[10px] text-slate-500 mb-1.5 block">투자 금액 (USD)</label>
        <input
          type="number"
          value={amount}
          min={property.minimumInvestment || 100}
          step={100}
          onChange={e => setAmount(Math.max(property.minimumInvestment || 100, Number(e.target.value)))}
          className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#00d4aa]/40"
        />
        {property.minimumInvestment && (
          <p className="text-[9px] text-slate-600 mt-1">최소: ${property.minimumInvestment.toLocaleString()}</p>
        )}
      </div>

      {/* Scenario tabs */}
      <div className="flex gap-1.5 mb-4">
        {Object.entries(SCENARIOS).map(([key, sc]) => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${scenario === key ? 'border' : 'bg-[#0a0e1a] text-slate-500'}`}
            style={scenario === key ? { color: sc.color, borderColor: `${sc.color}40`, background: `${sc.color}10` } : {}}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-[#0a0e1a] rounded-xl px-3 py-3">
          <p className="text-[8px] text-slate-500 mb-0.5">예상 토큰 수량</p>
          <p className="text-base font-black text-white">{calc.tokens.toLocaleString()}</p>
          <p className="text-[8px] text-slate-600">개 (토큰가 ${tokenPrice})</p>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl px-3 py-3">
          <p className="text-[8px] text-slate-500 mb-0.5">예상 연간 수익</p>
          <p className="text-base font-black text-emerald-400">${Math.round(calc.annualReturn).toLocaleString()}</p>
          <p className="text-[8px] text-slate-600">{(calc.irr * 100).toFixed(1)}% 연수익률</p>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl px-3 py-3 col-span-2">
          <p className="text-[8px] text-slate-500 mb-0.5">예상 기간 총 수익 ({holding}년)</p>
          <p className="text-lg font-black" style={{ color: SCENARIOS[scenario].color }}>
            +${Math.round(calc.totalReturn).toLocaleString()}
          </p>
          <p className="text-[8px] text-slate-600">{SCENARIOS[scenario].desc}</p>
        </div>
      </div>

      <p className="text-[9px] text-slate-600 text-center leading-relaxed">
        ※ 시뮬레이션 결과는 참고용이며 실제 수익을 보장하지 않습니다.
      </p>
    </div>
  );
}