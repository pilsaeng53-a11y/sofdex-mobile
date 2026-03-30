import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Gem, ShieldCheck, AlertTriangle, X, Check, RefreshCw, Truck, TrendingUp } from 'lucide-react';

const MOCK_GOLD = [
  { id: 'g1', asset_type: 'gold', title: 'Gold Bullion Unit — 100g Bar', location: 'Singapore Vault', category: 'Gold', seller_wallet: '4bXr...w9Zt', seller_name: 'Vault Partner A', quantity_available: 10, unit: 'bars', asking_price_usdt: 7800, gold_weight_grams: 100, vault_info: 'Singapore Free Trade Zone, LBMA-certified vault, insured storage.', reference_price_usdt: 7650, delivery_eligible: true, delivery_fee_usdt: 120, status: 'active', description: 'LBMA-certified 100g gold bullion bars held in a Singapore vault. Internally traded within SolFort.', transaction_terms: 'Internal platform settlement. Physical delivery subject to platform review and eligibility verification.' },
  { id: 'g2', asset_type: 'gold', title: 'Gold Token — 1oz Fractional', location: 'Zurich Vault', category: 'Gold', seller_wallet: '8cNq...f5Lp', seller_name: 'Vault Partner B', quantity_available: 50, unit: 'units', asking_price_usdt: 2450, gold_weight_grams: 31.1, vault_info: 'Zurich, Switzerland — Swiss National Vault Network, allocated storage.', reference_price_usdt: 2400, delivery_eligible: false, delivery_fee_usdt: 0, status: 'active', description: 'Fractional 1oz gold tokens backed by allocated physical gold in Zurich.', transaction_terms: 'Internal trading only. Physical delivery not currently available for this asset.' },
];

function Section({ title, color = '#f59e0b', children }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${color}15` }}>
      <div className="px-3.5 py-2 border-b" style={{ background: `${color}0a`, borderColor: `${color}12` }}>
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{title}</p>
      </div>
      <div className="p-3.5 bg-[#0d1220]">{children}</div>
    </div>
  );
}

function Row({ label, value, mono, color }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 border-b border-[rgba(148,163,184,0.04)] last:border-0">
      <span className="text-[9px] text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-[10px] font-semibold text-right ${mono ? 'font-mono text-[9px]' : ''}`} style={{ color: color || '#f1f5f9' }}>{value}</span>
    </div>
  );
}

function GoldCard({ listing, onView }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: '#0d1220', border: '1px solid rgba(245,158,11,0.12)' }}>
      {listing.image_url && <img src={listing.image_url} alt={listing.title} className="w-full h-32 object-cover" />}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white">{listing.title}</h3>
            <p className="text-[9px] text-slate-500">{listing.vault_info?.split(',')[0]}</p>
          </div>
          {listing.delivery_eligible && (
            <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-[#f59e0b] flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>DELIVERY</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[7px] text-slate-500">Weight</p>
            <p className="text-[11px] font-black text-[#f59e0b]">{listing.gold_weight_grams}g</p>
          </div>
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[7px] text-slate-500">Price</p>
            <p className="text-[11px] font-black text-white">${listing.asking_price_usdt?.toLocaleString()}</p>
          </div>
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[7px] text-slate-500">Qty</p>
            <p className="text-[11px] font-black text-white">{listing.quantity_available}</p>
          </div>
        </div>
        <button onClick={() => onView(listing)}
          className="w-full py-2.5 rounded-xl text-[10px] font-black text-[#f59e0b] flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          View Detail
        </button>
      </div>
    </div>
  );
}

function GoldDetailModal({ listing, onClose }) {
  const [tab, setTab] = useState('trade');
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ receiverName: '', country: '', address: '', phone: '', email: '', confirmed: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitTrade() {
    setSubmitting(true);
    try {
      await base44.entities.P2POrder.create({
        listing_id: listing.id, listing_title: listing.title, asset_type: 'gold',
        buyer_wallet: 'MY_WALLET', order_type: 'buy_now', quantity: qty,
        offered_price_usdt: listing.asking_price_usdt,
        total_usdt: qty * listing.asking_price_usdt,
        status: 'Submitted', ordered_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  }

  async function submitDelivery() {
    if (!form.confirmed || !form.receiverName || !form.address) return;
    setSubmitting(true);
    try {
      await base44.entities.GoldDeliveryRequest.create({
        listing_id: listing.id, listing_title: listing.title,
        requester_wallet: 'MY_WALLET',
        delivery_quantity: qty, unit: listing.unit,
        receiver_name: form.receiverName, delivery_country: form.country,
        delivery_address: form.address, phone: form.phone, email: form.email,
        confirmed_terms: form.confirmed,
        delivery_fee_usdt: listing.delivery_fee_usdt,
        status: 'Requested', requested_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  }

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto max-h-[92vh] scrollbar-none"
        style={{ background: '#0b0f1c', border: '1px solid rgba(245,158,11,0.15)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)]"
          style={{ background: 'rgba(11,15,28,0.98)' }}>
          <h2 className="text-sm font-black text-white">{listing.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: '#151c2e' }}>
            {['trade', 'delivery'].map(t => (
              <button key={t} onClick={() => { setTab(t); setSubmitted(false); }}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${tab === t ? 'bg-[#f59e0b] text-black' : 'text-slate-500'}`}>
                {t === 'trade' ? 'Trade Internally' : 'Request Physical Delivery'}
              </button>
            ))}
          </div>

          {/* Asset Overview */}
          <Section title="Asset Overview">
            <Row label="Title" value={listing.title} />
            <Row label="Category" value={listing.category} />
            <Row label="Vault / Storage" value={listing.vault_info} />
          </Section>

          <Section title="Gold Unit Details" color="#f59e0b">
            <Row label="Weight per Unit" value={`${listing.gold_weight_grams}g`} color="#f59e0b" />
            <Row label="Quantity Available" value={`${listing.quantity_available} ${listing.unit}`} />
            <Row label="Reference Price" value={`$${listing.reference_price_usdt?.toLocaleString()} USDT`} />
            <Row label="Asking Price" value={`$${listing.asking_price_usdt?.toLocaleString()} USDT`} color="#f59e0b" />
          </Section>

          <Section title="Delivery Eligibility" color="#22c55e">
            <Row label="Physical Delivery" value={listing.delivery_eligible ? 'Available' : 'Not Available'} color={listing.delivery_eligible ? '#22c55e' : '#64748b'} />
            {listing.delivery_eligible && <Row label="Delivery Fee" value={`$${listing.delivery_fee_usdt} USDT`} />}
            <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">Physical delivery requests are subject to platform review and approval. Insurance and shipping fees apply.</p>
          </Section>

          {/* Risk Notice */}
          <div className="rounded-2xl p-3.5 mb-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Risk Notice</p>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed">All gold RWA transactions are internal SolFort operations. Physical delivery is a separate request process subject to review. Final settlement requires platform verification. Delivery fees and insurance are non-refundable once shipment is initiated.</p>
          </div>

          {/* Forms */}
          {!submitted ? (
            tab === 'trade' ? (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider">Trade Internally</p>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Quantity</label>
                  <input type="number" min={1} max={listing.quantity_available} value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] outline-none" />
                </div>
                <div className="flex justify-between py-2 border-t border-[rgba(148,163,184,0.06)]">
                  <span className="text-[10px] text-slate-500">Total</span>
                  <span className="text-sm font-black text-[#f59e0b]">${(qty * listing.asking_price_usdt).toLocaleString()} USDT</span>
                </div>
                <button onClick={submitTrade} disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Trade Internally
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider">Physical Delivery Request</p>
                {!listing.delivery_eligible && (
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-[10px] text-red-400 font-bold">Physical delivery not available for this asset.</p>
                  </div>
                )}
                {listing.delivery_eligible && (
                  <>
                    {[
                      { label: 'Delivery Quantity', field: 'qty', type: 'number', isQty: true },
                      { label: 'Receiver Name', field: 'receiverName', placeholder: 'Full legal name' },
                      { label: 'Delivery Country', field: 'country', placeholder: 'e.g. South Korea' },
                      { label: 'Delivery Address', field: 'address', placeholder: 'Full address' },
                      { label: 'Phone', field: 'phone', placeholder: '+82 ...' },
                      { label: 'Email', field: 'email', placeholder: 'email@example.com' },
                    ].map(({ label, field, placeholder, type, isQty }) => (
                      <div key={field}>
                        <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
                        {isQty ? (
                          <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] outline-none" />
                        ) : (
                          <input type={type || 'text'} value={form[field]} placeholder={placeholder}
                            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl text-sm text-white border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] outline-none" />
                        )}
                      </div>
                    ))}
                    <div className="flex items-start gap-3 pt-1">
                      <button onClick={() => setForm(p => ({ ...p, confirmed: !p.confirmed }))}
                        className={`w-5 h-5 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center border transition-all ${form.confirmed ? 'bg-[#f59e0b] border-[#f59e0b]' : 'bg-transparent border-[rgba(245,158,11,0.3)]'}`}>
                        {form.confirmed && <Check className="w-3 h-3 text-black" />}
                      </button>
                      <p className="text-[9px] text-slate-400 leading-relaxed">I confirm I have reviewed the delivery conditions, fees, and platform terms. I understand this request is subject to SolFort review and approval.</p>
                    </div>
                    <button onClick={submitDelivery} disabled={submitting || !form.confirmed || !form.receiverName || !form.address}
                      className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      Request Physical Delivery
                    </button>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Check className="w-6 h-6 text-emerald-400" />
              <p className="text-sm font-black text-white">{tab === 'trade' ? 'Trade Submitted' : 'Delivery Requested'}</p>
              <p className="text-[9px] text-slate-400 text-center">Your request is under review. SolFort will verify and process according to platform terms.</p>
              <Link to="/MyDeliveryRequests">
                <button className="mt-1 px-4 py-1.5 rounded-xl text-[10px] font-black text-[#f59e0b]"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  View My Requests →
                </button>
              </Link>
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

export default function GoldP2PMarket() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.P2PRWAListing.filter({ asset_type: 'gold', status: 'active' })
      .then(data => setListings(data.length > 0 ? data : MOCK_GOLD))
      .catch(() => setListings(MOCK_GOLD))
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
            <Gem className="w-5 h-5 text-[#f59e0b]" /> Gold Physical Delivery
          </h1>
        </div>
      </div>

      <div className="rounded-2xl p-3 mb-4 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">SolFort manages internal listing records and physical delivery request workflows. All deliveries are subject to platform review, eligibility verification, and settlement confirmation.</p>
      </div>

      <div className="flex justify-end mb-3">
        <Link to="/MyDeliveryRequests">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-[#f59e0b]"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Truck className="w-3.5 h-3.5" /> My Delivery Requests
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading gold listings...
        </div>
      ) : (
        listings.map(l => <GoldCard key={l.id} listing={l} onView={setSelected} />)
      )}

      {selected && <GoldDetailModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}