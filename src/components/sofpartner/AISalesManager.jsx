/**
 * AISalesManager — Full AI Sales Assistant Panel
 */
import React, { useState, useEffect } from 'react';
import {
  Brain, X, ChevronRight, Sparkles, Calculator, AlertTriangle,
  Copy, Check, Zap, TrendingUp, Users, RefreshCw, BarChart2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

console.log('[AISalesManager] Component mounted ✓');

const SCENARIOS = [
  { value: 'new_customer', label: 'New Customer' },
  { value: 'hesitant', label: 'Hesitant Customer' },
  { value: 'comparing', label: 'Comparing Other Projects' },
  { value: 'recruit', label: 'Recruit Partner' },
  { value: 'followup', label: 'Follow-up' },
];

const GRADE_COLORS = {
  GREEN: '#22c55e', PURPLE: '#8b5cf6', GOLD: '#f59e0b', PLATINUM: '#e2e8f0'
};

function SectionTitle({ children, color = '#8b5cf6' }) {
  return (
    <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color }}>
      {children}
    </p>
  );
}

function Card({ title, color = '#8b5cf6', children }) {
  return (
    <div className="rounded-2xl border overflow-hidden mb-3" style={{ borderColor: `${color}18` }}>
      <div className="px-3.5 py-2 border-b" style={{ background: `${color}0a`, borderColor: `${color}10` }}>
        <SectionTitle color={color}>{title}</SectionTitle>
      </div>
      <div className="p-3.5 bg-[#0d1220]">{children}</div>
    </div>
  );
}

function ScriptBlock({ title, content, color = '#8b5cf6' }) {
  if (!content) return null;
  return (
    <div className="mb-3 rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      <p className="text-[8px] font-black uppercase tracking-wider mb-1.5" style={{ color }}>{title}</p>
      <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function ResultRow({ label, value, color = '#00d4aa' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] font-black" style={{ color }}>{value || '—'}</span>
    </div>
  );
}

function WarnRow({ icon: Icon, label, detail, color = '#f59e0b' }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
      <div>
        <p className="text-[10px] font-bold text-white">{label}</p>
        {detail && <p className="text-[9px] text-slate-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

export default function AISalesManager({ submissions = [], gradeInfo, subActive = [] }) {
  console.log('[AISalesManager] Rendering — open state managed internally');

  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState('new_customer');
  const [loading, setLoading] = useState({});
  const [script, setScript] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [copied, setCopied] = useState(false);

  const grade = gradeInfo?.grade || 'GREEN';
  const feeRate = gradeInfo?.centerFeePercent || 5;
  const GRADE_ORDER = ['GREEN', 'PURPLE', 'GOLD', 'PLATINUM'];
  const nextGrade = GRADE_ORDER[Math.min(GRADE_ORDER.indexOf(grade) + 1, GRADE_ORDER.length - 1)];

  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const monthSubs = submissions.filter(r => (r.submitted_at || '').startsWith(thisMonth));
  const monthUSDT = monthSubs.reduce((s, r) => s + (r.purchase_amount || 0), 0);
  const totalSOF = submissions.reduce((s, r) => s + (r.center_fee_quantity || 0), 0);

  const inactiveSubs = subActive.filter(s => {
    if (!s.lastSubmitAt) return true;
    return (Date.now() - new Date(s.lastSubmitAt).getTime()) > 3 * 86400000;
  });

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  async function generateScript() {
    setLoad('script', true);
    setScript(null);
    const scenarioLabel = SCENARIOS.find(s => s.value === scenario)?.label || scenario;

    const prompts = {
      new_customer: `You are a confident, professional sales assistant for SolFort (SOF token ecosystem). Generate a sales script for a NEW CUSTOMER introduction. 
Context: Partner grade is ${grade}, selling SOF tokens, participation-based model.
Principles to highlight: flexible structure (not fixed hierarchy), active participation drives value, opportunity not limited by early entry.
Return JSON with: hook (1-2 sentences to grab attention), explanation (2-3 sentences on the model), conversation (2-3 lines of dialogue example).`,

      hesitant: `Generate a calm, reassuring sales script for a HESITANT CUSTOMER about SolFort SOF tokens.
Be confident, logical, avoid promises or guarantees. Acknowledge hesitation, explain the participation model, flexible structure.
Return JSON with: hook, explanation, conversation.`,

      comparing: `Generate a logical, calm script for someone COMPARING SOLFORT to other projects.
Never insult competitors. Stay factual. Use language like: "Some models focus on short-term or entertainment-driven value. SolFort is structured around participation and asset-based systems, which creates a different type of growth."
Highlight: activity-based opportunity, flexible structure, no fixed hierarchy lock.
Return JSON with: hook, explanation, conversation.`,

      recruit: `Generate a script for RECRUITING A NEW PARTNER to the SolFort ecosystem.
Highlight: anyone can build a position (not limited by early entry), activity-driven rewards, flexible structure.
Be practical and confident, avoid unrealistic income promises.
Return JSON with: hook, explanation, conversation.`,

      followup: `Generate a professional FOLLOW-UP script for someone who showed interest in SolFort before.
Reference that they were interested, acknowledge time passed, re-engage with the key opportunity angle.
Return JSON with: hook, explanation, conversation.`,
    };

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[scenario] || prompts.new_customer,
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
      setScript({ hook: 'Script generation failed. Please try again.', explanation: '', conversation: '' });
    }
    setLoad('script', false);
  }

  async function calculateForMe() {
    setLoad('calc', true);
    setCalcResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `SOF Partner calculation:
- This month sales: $${monthUSDT.toFixed(0)} USDT
- Grade: ${grade}, Center fee rate: ${feeRate}%
- Submissions: ${monthSubs.length}
- Active subordinates: ${subActive.length}

Calculate and return:
- estimatedSOF: estimated SOF tokens earned this month from center fees
- recommenderShare: estimated SOF for recommender payouts
- yourEarnings: final estimated earnings in USDT

Be precise and practical. No guarantees, just estimates.`,
        response_json_schema: {
          type: 'object',
          properties: {
            estimatedSOF: { type: 'string' },
            recommenderShare: { type: 'string' },
            yourEarnings: { type: 'string' },
            note: { type: 'string' },
          }
        }
      });
      setCalcResult(res);
    } catch {
      setCalcResult({ estimatedSOF: 'Error', recommenderShare: 'Error', yourEarnings: 'Error', note: 'Calculation failed' });
    }
    setLoad('calc', false);
  }

  async function checkErrors() {
    setLoad('errors', true);
    setWarnings([]);
    const warns = [];
    if (!gradeInfo?.walletAddress) warns.push({ label: 'Invalid Wallet', detail: 'No wallet address detected' });
    if (monthSubs.length === 0) warns.push({ label: 'Missing Input', detail: 'No submissions this month' });
    if (monthUSDT === 0 && monthSubs.length > 0) warns.push({ label: 'Abnormal Value', detail: 'Submissions exist but total USDT is 0' });
    if (inactiveSubs.length > 0) warns.push({ label: 'Inactive Subordinates', detail: `${inactiveSubs.length} partner(s) with no activity for 3+ days` });
    if (warns.length === 0) warns.push({ label: 'No Issues Found', detail: 'All data looks normal', ok: true });
    setWarnings(warns);
    setLoad('errors', false);
  }

  function explainCalculation() {
    if (!calcResult) { calculateForMe(); return; }
    alert(`Estimated SOF: ${calcResult.estimatedSOF}\nRecommender Share: ${calcResult.recommenderShare}\nYour Earnings: ${calcResult.yourEarnings}\n\n${calcResult.note || ''}`);
  }

  function copyScript() {
    const text = [script?.hook, script?.explanation, script?.conversation].filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', boxShadow: '0 8px 32px rgba(139,92,246,0.45)' }}
      >
        <Brain className="w-4 h-4" />
        AI Manager
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* ── Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full z-[9999] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 360, background: '#0b0f1c', borderLeft: '1px solid rgba(139,92,246,0.15)', boxShadow: '-8px 0 48px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)] flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">AI Sales Manager</p>
              <p className="text-[10px] text-slate-400">Your Sales Assistant</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">

          {/* ── Quick Actions ── */}
          <Card title="Quick Actions" color="#8b5cf6">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Calculate for Me', icon: Calculator, color: '#00d4aa', action: calculateForMe, key: 'calc' },
                { label: 'Explain Calculation', icon: BarChart2, color: '#3b82f6', action: explainCalculation, key: 'explain' },
                { label: 'Check Errors', icon: AlertTriangle, color: '#f59e0b', action: checkErrors, key: 'errors' },
                { label: 'Generate Script', icon: Sparkles, color: '#8b5cf6', action: generateScript, key: 'script' },
              ].map(({ label, icon: Icon, color, action, key }) => (
                <button key={key} onClick={action} disabled={loading[key]}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all active:scale-95"
                  style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
                  {loading[key]
                    ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color }} />
                    : <Icon className="w-4 h-4" style={{ color }} />}
                  <span className="text-[9px] font-black text-center leading-tight" style={{ color }}>{label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* ── Calculation Result ── */}
          <Card title="Calculation Result" color="#00d4aa">
            <ResultRow label="Estimated SOF" value={calcResult?.estimatedSOF} color="#00d4aa" />
            <ResultRow label="Recommender Share" value={calcResult?.recommenderShare} color="#8b5cf6" />
            <ResultRow label="Your Earnings" value={calcResult?.yourEarnings} color="#f59e0b" />
            {calcResult?.note && (
              <p className="text-[9px] text-slate-500 mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">{calcResult.note}</p>
            )}
            {!calcResult && (
              <p className="text-[10px] text-slate-600 text-center py-1">Click "Calculate for Me" to see results</p>
            )}
          </Card>

          {/* ── Warnings ── */}
          <Card title="Warnings" color="#f59e0b">
            {warnings.length === 0 ? (
              <p className="text-[10px] text-slate-600 text-center py-1">Click "Check Errors" to scan</p>
            ) : (
              warnings.map((w, i) => (
                <WarnRow key={i} icon={w.ok ? Check : AlertTriangle} label={w.label} detail={w.detail}
                  color={w.ok ? '#22c55e' : '#f59e0b'} />
              ))
            )}
          </Card>

          {/* ── Sales Script Generator ── */}
          <Card title="Sales Script Generator" color="#8b5cf6">
            <div className="mb-3">
              <label className="text-[9px] text-slate-500 block mb-1">Select Scenario</label>
              <select
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[11px] text-white font-semibold border border-[rgba(139,92,246,0.2)] appearance-none"
                style={{ background: 'rgba(139,92,246,0.08)' }}
              >
                {SCENARIOS.map(s => (
                  <option key={s.value} value={s.value} style={{ background: '#0b0f1c' }}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={generateScript} disabled={loading.script}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black text-[#8b5cf6] flex items-center justify-center gap-1.5 transition-all active:scale-95"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                {loading.script ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Script
              </button>
              <button onClick={copyScript} disabled={!script}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95"
                style={{
                  background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.1)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.15)'}`,
                  color: copied ? '#22c55e' : '#94a3b8'
                }}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Script
              </button>
            </div>

            {/* Script Output Blocks */}
            {loading.script && (
              <div className="mt-3 flex items-center justify-center gap-2 py-4 text-[10px] text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8b5cf6]" />
                Generating script...
              </div>
            )}
            {script && !loading.script && (
              <div className="mt-3 space-y-2">
                <ScriptBlock title="Hook" content={script.hook} color="#00d4aa" />
                <ScriptBlock title="Explanation" content={script.explanation} color="#8b5cf6" />
                <ScriptBlock title="Conversation" content={script.conversation} color="#3b82f6" />
              </div>
            )}
            {!script && !loading.script && (
              <p className="text-[10px] text-slate-600 text-center mt-3 py-1">Select a scenario and click Generate Script</p>
            )}
          </Card>

          {/* ── Subordinate Alert ── */}
          <Card title="Subordinate Alert" color="#f59e0b">
            {inactiveSubs.length === 0 && subActive.length === 0 ? (
              <>
                <WarnRow icon={AlertTriangle} label="No activity for 3 days" detail="No subordinates found" color="#64748b" />
                <WarnRow icon={AlertTriangle} label="Low performance" detail="No subordinate data" color="#64748b" />
                <WarnRow icon={AlertTriangle} label="Needs follow-up" detail="Add subordinates to track" color="#64748b" />
              </>
            ) : inactiveSubs.length === 0 ? (
              <WarnRow icon={Check} label="All subordinates active" detail="No follow-up needed" color="#22c55e" />
            ) : (
              inactiveSubs.slice(0, 5).map((s, i) => (
                <WarnRow key={i} icon={AlertTriangle}
                  label={`${s.name || 'Partner'} — No activity for 3 days`}
                  detail="Low performance · Needs follow-up"
                  color="#f59e0b" />
              ))
            )}
          </Card>

          {/* ── Your Progress ── */}
          <Card title="Your Progress" color="#3b82f6">
            <ResultRow label="Current Grade" value={grade} color={GRADE_COLORS[grade] || '#00d4aa'} />
            <ResultRow label="Next Grade" value={nextGrade} color="#64748b" />
            <ResultRow label="This Month Sales" value={`$${monthUSDT.toFixed(0)} USDT`} color="#f1f5f9" />
            <ResultRow label="Accumulated SOF" value={`${totalSOF.toFixed(1)} SOF`} color="#00d4aa" />
            <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.06)]">
              <p className="text-[9px] text-[#3b82f6]">
                Remaining Requirements: Keep growing to reach {nextGrade}
              </p>
            </div>
          </Card>

          <div className="h-4" />
        </div>
      </div>
    </>
  );
}