import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Layers, Send, RefreshCw, Check, Clock, AlertTriangle } from 'lucide-react';

const ASSETS = ['SOF Token', 'Real Estate RWA', 'Gold Bullion', 'Commodity RWA', 'Other'];

const MOCK_RECENT = [
  { id: 'bt1', asset: 'Gold Bullion', quantity: 500, targetPrice: 3900000, status: 'Under Review', date: '2026-03-28' },
  { id: 'bt2', asset: 'Real Estate RWA', quantity: 200, targetPrice: 500000, status: 'Matched', date: '2026-03-25' },
];

const STATUS_COLORS = {
  'Pending': '#94a3b8',
  'Under Review': '#f59e0b',
  'Matched': '#3b82f6',
  'Completed': '#22c55e',
  'Cancelled': '#64748b',
  'Rejected': '#ef4444',
};

export default function OTCBlockTrade() {
  const [form, setForm] = useState({ asset: 'SOF Token', quantity: '', targetPrice: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.quantity || !form.targetPrice) return;
    setLoading(true);
    try {
      await base44.entities.P2POrder.create({
        listing_id: 'block_trade',
        listing_title: `Block Trade — ${form.asset}`,
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
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">OTC</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00d4aa]" /> Block Trade Desk
          </h1>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5">Large-size private transactions</p>

      {/* Notice */}
      <div className="rounded-2xl p-3 mb-5 flex items-start gap-2" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#00d4aa] flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">Block trade requests are subject to SolFort platform review and counterparty matching. Submission does not guarantee execution. Final settlement requires platform verification.</p>
      </div>

      {!submitted ? (
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#0d1220', border: '1px solid rgba(0,212,170,0.1)' }}>
          <p className="text-[10px] font-black text-[#00d4aa] uppercase tracking-wider mb-4">Block Trade Request</p>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Asset</label>
              <select value={form.asset} onChange={e => set('asset', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] appearance-none outline-none"
                style={{ background: 'rgba(0,212,170,0.06)' }}>
                {ASSETS.map(a => <option key={a} value={a} style={{ background: '#0b0f1c' }}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 500"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Target Price (USDT per unit)</label>
              <input type="number" value={form.targetPrice} onChange={e => set('targetPrice', e.target.value)} placeholder="e.g. 7800"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1">Note (optional)</label>
              <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Additional context or conditions..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.04)] outline-none resize-none" />
            </div>
            {form.quantity && form.targetPrice && (
              <div className="flex justify-between items-center py-2 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-[10px] text-slate-500">Estimated Total</span>
                <span className="text-sm font-black text-[#00d4aa]">${(Number(form.quantity) * Number(form.targetPrice)).toLocaleString()} USDT</span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading || !form.quantity || !form.targetPrice}
              className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Block Trade Request
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-5 flex flex-col items-center gap-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check className="w-8 h-8 text-emerald-400" />
          <p className="text-base font-black text-white">Request Submitted</p>
          <p className="text-[10px] text-slate-400">Your block trade request is under review. SolFort will process and match according to platform terms.</p>
          <button onClick={() => setSubmitted(false)} className="px-5 py-2 rounded-xl text-[10px] font-black text-[#00d4aa]"
            style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>
            Submit Another
          </button>
        </div>
      )}

      {/* Recent Requests */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-3">Recent Block Trade Requests</p>
        <div className="space-y-2">
          {MOCK_RECENT.map(r => {
            const color = STATUS_COLORS[r.status] || '#94a3b8';
            return (
              <div key={r.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#0d1220', border: `1px solid ${color}15` }}>
                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white">{r.asset}</p>
                  <p className="text-[9px] text-slate-500">Qty: {r.quantity} · ${r.targetPrice.toLocaleString()} / unit · {r.date}</p>
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
    </div>
  );
}