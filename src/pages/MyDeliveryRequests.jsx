import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Truck, Package, Clock, Check, X, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';

const STATUS_CONFIG = {
  'Requested':          { color: '#8b5cf6', icon: Clock },
  'Under Review':       { color: '#f59e0b', icon: AlertTriangle },
  'Approved':           { color: '#3b82f6', icon: Check },
  'Preparing Shipment': { color: '#06b6d4', icon: Package },
  'Shipped':            { color: '#00d4aa', icon: Truck },
  'Delivered':          { color: '#22c55e', icon: Check },
  'Rejected':           { color: '#ef4444', icon: X },
};

export default function MyDeliveryRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GoldDeliveryRequest.list('-requested_at', 50)
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/GoldP2PMarket">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Gold P2P Market</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#f59e0b]" /> My Delivery Requests
          </h1>
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-2xl p-3 mb-4 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">Physical delivery requests are subject to SolFort platform review and approval. Delivery timelines, fees, and terms are subject to platform verification. Final settlement is confirmed upon delivery completion.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">No Delivery Requests</p>
          <p className="text-[11px] text-slate-600">Your physical delivery requests will appear here.</p>
          <Link to="/GoldP2PMarket">
            <button className="mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-[#f59e0b]"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              Browse Gold Market
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['Requested'];
            const StatusIcon = cfg.icon;
            return (
              <div key={req.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${cfg.color}18` }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: `${cfg.color}10`, background: `${cfg.color}08` }}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: cfg.color }}>{req.status}</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  <p className="text-sm font-black text-white">{req.listing_title || 'Gold Asset'}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#151c2e] rounded-xl p-2.5">
                      <p className="text-[8px] text-slate-500 mb-0.5">Quantity</p>
                      <p className="text-[11px] font-black text-[#f59e0b]">{req.delivery_quantity} {req.unit || 'grams'}</p>
                    </div>
                    <div className="bg-[#151c2e] rounded-xl p-2.5">
                      <p className="text-[8px] text-slate-500 mb-0.5">Delivery Fee</p>
                      <p className="text-[11px] font-black text-white">${req.delivery_fee_usdt || 0} USDT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div className="text-[9px] text-slate-400">
                      <span className="font-bold text-white">{req.receiver_name}</span>
                      {req.delivery_country && <span> · {req.delivery_country}</span>}
                    </div>
                  </div>

                  {req.tracking_info ? (
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
                      <p className="text-[8px] text-[#00d4aa] font-black mb-0.5 uppercase">Tracking Info</p>
                      <p className="text-[10px] text-white font-mono">{req.tracking_info}</p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-600 italic">Tracking info will appear once shipment is processed.</p>
                  )}

                  {req.admin_notes && (
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                      <p className="text-[8px] text-[#8b5cf6] font-black mb-0.5 uppercase">Platform Note</p>
                      <p className="text-[9px] text-slate-400">{req.admin_notes}</p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="pt-2 border-t border-[rgba(148,163,184,0.06)]">
                    <p className="text-[8px] text-slate-500 mb-2 uppercase tracking-wider">Delivery Status</p>
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                      {['Requested', 'Under Review', 'Approved', 'Preparing Shipment', 'Shipped', 'Delivered'].map((s, i) => {
                        const statuses = ['Requested', 'Under Review', 'Approved', 'Preparing Shipment', 'Shipped', 'Delivered'];
                        const currentIdx = statuses.indexOf(req.status);
                        const stepIdx = statuses.indexOf(s);
                        const done = stepIdx <= currentIdx;
                        const active = s === req.status;
                        return (
                          <React.Fragment key={s}>
                            <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${active ? 'border-[#f59e0b]' : done ? 'border-[#22c55e]' : 'border-[rgba(148,163,184,0.15)]'}`}
                                style={{ background: active ? 'rgba(245,158,11,0.2)' : done ? 'rgba(34,197,94,0.12)' : 'transparent' }}>
                                {done && <div className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#f59e0b' : '#22c55e' }} />}
                              </div>
                              <p className={`text-[6px] text-center leading-tight w-10 ${active ? 'text-[#f59e0b] font-bold' : done ? 'text-slate-400' : 'text-slate-600'}`}>{s}</p>
                            </div>
                            {i < 5 && <div className={`flex-1 h-[1px] mb-4 flex-shrink-0 min-w-[8px]`} style={{ background: stepIdx < currentIdx ? '#22c55e' : 'rgba(148,163,184,0.1)' }} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}