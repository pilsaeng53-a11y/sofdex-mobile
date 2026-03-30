import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, HelpCircle, Send, RefreshCw, Check, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

const ISSUE_TYPES = [
  'Order Not Processed',
  'Counterparty No Response',
  'Settlement Dispute',
  'Physical Delivery Issue',
  'Incorrect Amount',
  'Listing Discrepancy',
  'Other',
];

const STATUS_COLORS = {
  'Open':          '#f59e0b',
  'Under Review':  '#3b82f6',
  'Resolved':      '#22c55e',
  'Closed':        '#64748b',
};

const MOCK_HISTORY = [
  { id: 'd1', orderId: 'OTC-001', asset: 'Gold OTC', issueType: 'Settlement Dispute', status: 'Under Review', submittedDate: '2026-03-28', latestUpdate: 'Platform is reviewing the transaction records.' },
  { id: 'd2', orderId: 'OTC-002', asset: 'Real Estate RWA', issueType: 'Order Not Processed', status: 'Resolved', submittedDate: '2026-03-20', latestUpdate: 'Issue resolved. Settlement completed.' },
];

export default function OTCSupportDispute() {
  const [form, setForm] = useState({ orderId: '', asset: '', issueType: ISSUE_TYPES[0], description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit() {
    if (!form.orderId || !form.description) return;
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
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
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">OTC</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#f59e0b]" /> Support & Dispute
          </h1>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5">Resolve OTC transaction issues</p>

      {/* Notice */}
      <div className="rounded-2xl p-3 mb-5 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">SolFort reviews all OTC dispute submissions. Resolution timelines depend on transaction complexity and counterparty response. All decisions are subject to platform terms.</p>
      </div>

      {/* Form */}
      {!submitted ? (
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#0d1220', border: '1px solid rgba(245,158,11,0.1)' }}>
          <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider mb-4">Submit Support Request</p>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Order ID</label>
              <input value={form.orderId} onChange={e => set('orderId', e.target.value)} placeholder="e.g. OTC-1234"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Asset</label>
              <input value={form.asset} onChange={e => set('asset', e.target.value)} placeholder="e.g. Gold OTC, Real Estate RWA"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Issue Type</label>
              <select value={form.issueType} onChange={e => set('issueType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] appearance-none outline-none"
                style={{ background: 'rgba(245,158,11,0.06)' }}>
                {ISSUE_TYPES.map(t => <option key={t} value={t} style={{ background: '#0b0f1c' }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Description</label>
              <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)] outline-none resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading || !form.orderId || !form.description}
              className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
              Submit Support Request
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-5 flex flex-col items-center gap-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check className="w-8 h-8 text-emerald-400" />
          <p className="text-base font-black text-white">Support Request Submitted</p>
          <p className="text-[10px] text-slate-400">SolFort will review your dispute and respond according to platform terms.</p>
          <button onClick={() => setSubmitted(false)} className="px-5 py-2 rounded-xl text-[10px] font-black text-[#f59e0b]"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            Submit Another
          </button>
        </div>
      )}

      {/* History */}
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-3">Request History</p>
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
                  <p className="text-[8px] font-black uppercase tracking-wider mb-0.5" style={{ color }}>Latest Update</p>
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