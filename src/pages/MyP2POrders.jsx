import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ShoppingBag, Clock, Check, X, AlertTriangle, RefreshCw, Building2, Gem } from 'lucide-react';

const STATUS_COLORS = {
  'Submitted':    '#8b5cf6',
  'Under Review': '#f59e0b',
  'Approved':     '#3b82f6',
  'Completed':    '#22c55e',
  'Rejected':     '#ef4444',
  'Cancelled':    '#64748b',
};

export default function MyP2POrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.P2POrder.list('-ordered_at', 50)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center gap-3 mb-5">
        <Link to="/P2PRWAExchange">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">P2P RWA Exchange</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8b5cf6]" /> My Orders
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">No Orders Yet</p>
          <p className="text-[11px] text-slate-600">Browse listings and place your first order.</p>
          <div className="flex gap-2 justify-center mt-4">
            <Link to="/RealEstateP2P">
              <button className="px-4 py-2 rounded-xl text-[10px] font-black text-[#3b82f6]" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                Real Estate P2P
              </button>
            </Link>
            <Link to="/GoldP2PMarket">
              <button className="px-4 py-2 rounded-xl text-[10px] font-black text-[#f59e0b]" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                Gold Market
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const color = STATUS_COLORS[order.status] || '#8b5cf6';
            return (
              <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${color}15` }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: `${color}10`, background: `${color}08` }}>
                  <div className="flex items-center gap-1.5">
                    {order.asset_type === 'gold' ? <Gem className="w-3.5 h-3.5 text-[#f59e0b]" /> : <Building2 className="w-3.5 h-3.5 text-[#3b82f6]" />}
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{order.status}</span>
                  </div>
                  <span className="text-[8px] text-slate-500">{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : '—'}</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-black text-white mb-3">{order.listing_title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#151c2e] rounded-xl p-2.5 text-center">
                      <p className="text-[7px] text-slate-500">Type</p>
                      <p className="text-[9px] font-black text-white capitalize">{order.order_type?.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-[#151c2e] rounded-xl p-2.5 text-center">
                      <p className="text-[7px] text-slate-500">Qty</p>
                      <p className="text-[11px] font-black text-white">{order.quantity}</p>
                    </div>
                    <div className="bg-[#151c2e] rounded-xl p-2.5 text-center">
                      <p className="text-[7px] text-slate-500">Total</p>
                      <p className="text-[10px] font-black" style={{ color }}>${order.total_usdt?.toLocaleString()}</p>
                    </div>
                  </div>
                  {order.admin_notes && (
                    <div className="rounded-xl p-2.5 mt-2" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                      <p className="text-[8px] text-[#8b5cf6] font-black mb-0.5 uppercase">Platform Note</p>
                      <p className="text-[9px] text-slate-400">{order.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}