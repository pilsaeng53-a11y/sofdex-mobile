import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Zap, Shield } from 'lucide-react';

const LEVERAGE_DATA = {
  BTC:  { conservative: '1x–3x', balanced: '3x–7x', aggressive: '7x–15x', confidence: 87, risk: 'Medium', volatility: 'Moderate', reason: 'BTC shows moderate volatility with high liquidity. Institutional interest provides support, but macro uncertainty warrants caution above 10x.' },
  ETH:  { conservative: '1x–3x', balanced: '3x–8x', aggressive: '8x–18x', confidence: 82, risk: 'Medium', volatility: 'Moderate', reason: 'ETH staking yield adds stability. Smart contract upgrade cycle creates periodic volatility spikes. Balanced leverage advised.' },
  SOL:  { conservative: '1x–2x', balanced: '2x–5x', aggressive: '5x–12x', confidence: 74, risk: 'High', volatility: 'High', reason: 'SOL has high beta vs BTC with rapid price swings. Liquidity can thin quickly in downtrends. Recommend low leverage outside core hours.' },
  BNB:  { conservative: '1x–3x', balanced: '3x–7x', aggressive: '7x–15x', confidence: 79, risk: 'Medium', volatility: 'Moderate', reason: 'BNB is closely tied to Binance ecosystem performance. Regulatory events can cause sudden moves. Cap leverage at 10x.' },
  JUP:  { conservative: '1x–2x', balanced: '2x–4x', aggressive: '4x–8x',  confidence: 65, risk: 'High', volatility: 'Very High', reason: 'JUP is a smaller-cap DEX token with thin order books. High liquidation density near key levels. Conservative leverage strongly advised.' },
  RNDR: { conservative: '1x–2x', balanced: '2x–5x', aggressive: '5x–10x', confidence: 68, risk: 'High', volatility: 'High', reason: 'RNDR follows AI/GPU narrative with sharp sentiment-driven swings. Liquidity is moderate. Tight stops required.' },
  RAY:  { conservative: '1x–2x', balanced: '2x–4x', aggressive: '4x–8x',  confidence: 62, risk: 'High', volatility: 'Very High', reason: 'RAY is a Solana DEX token with low float. Prone to cascade liquidations. Only experienced traders should use leverage above 3x.' },
  BONK: { conservative: '1x',    balanced: '1x–2x', aggressive: '2x–4x',  confidence: 45, risk: 'Very High', volatility: 'Extreme', reason: 'BONK is a meme token with extreme volatility and very low liquidity at depth. Leverage above 2x is extremely high risk.' },
  AVAX: { conservative: '1x–3x', balanced: '3x–6x', aggressive: '6x–12x', confidence: 76, risk: 'Medium', volatility: 'Moderate', reason: 'AVAX has solid liquidity and ecosystem activity. Mid-cap volatility. Avoid high leverage during cross-chain bridge events.' },
  HNT:  { conservative: '1x–2x', balanced: '2x–4x', aggressive: '4x–7x',  confidence: 60, risk: 'High', volatility: 'High', reason: 'HNT is a DePIN token with niche market. Volume thins quickly. Liquidation clusters form fast near round numbers.' },
  DEFAULT: { conservative: '1x–2x', balanced: '2x–5x', aggressive: '5x–10x', confidence: 60, risk: 'Medium', volatility: 'Moderate', reason: 'Leverage recommendation based on average market conditions. Monitor volatility closely before applying high leverage.' },
};

const RISK_COLOR = {
  Low:      'text-emerald-400',
  Medium:   'text-amber-400',
  High:     'text-orange-400',
  'Very High': 'text-red-400',
};

export default function AILeverageCard({ symbol = 'BTC' }) {
  const [expanded, setExpanded] = useState(false);
  const data = LEVERAGE_DATA[symbol] || LEVERAGE_DATA.DEFAULT;

  return (
    <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">AI Leverage Guide</p>
            <p className="text-xs text-slate-500">Confidence: <span className="text-[#00d4aa] font-semibold">{data.confidence}%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-current/10 ${RISK_COLOR[data.risk]}`} style={{ background: 'rgba(0,0,0,0.2)' }}>
            {data.risk} Risk
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[rgba(148,163,184,0.06)]">
          <div className="pt-3 grid grid-cols-3 gap-2">
            <div className="bg-[#0a0e1a] rounded-xl p-3 text-center border border-emerald-400/15">
              <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 mb-0.5">Conservative</p>
              <p className="text-sm font-black text-emerald-400">{data.conservative}</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-3 text-center border border-amber-400/15">
              <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 mb-0.5">Balanced</p>
              <p className="text-sm font-black text-amber-400">{data.balanced}</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-3 text-center border border-red-400/15">
              <Zap className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 mb-0.5">Aggressive</p>
              <p className="text-sm font-black text-red-400">{data.aggressive}</p>
            </div>
          </div>

          <div className="bg-[#0a0e1a] rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">{data.reason}</p>
            </div>
          </div>

          {(data.risk === 'Very High' || data.risk === 'High') && (
            <div className="flex items-start gap-2 bg-red-400/5 border border-red-400/20 rounded-xl p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">High-risk asset. Leverage above recommended range significantly increases liquidation risk. Use strict stop-losses.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}