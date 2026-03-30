import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Building2, Plus, MapPin, DollarSign, ShieldCheck, AlertTriangle, X, Check, RefreshCw, Eye, Tag } from 'lucide-react';

const MOCK_LISTINGS = [
  { id: 'm1', asset_type: 'real_estate', title: 'Seoul Commercial Tower — Unit 4F', location: 'Seoul, South Korea', category: 'Commercial', seller_wallet: '7xKm...v3Rq', seller_name: 'Partner A', quantity_available: 50, unit: 'tokens', asking_price_usdt: 2500, status: 'active', description: 'Tokenized commercial real estate in central Seoul. High-occupancy, professionally managed.', transaction_terms: 'Transfer of ownership token upon platform verification and confirmation.', image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400' },
  { id: 'm2', asset_type: 'real_estate', title: 'Busan Residential Block B', location: 'Busan, South Korea', category: 'Residential', seller_wallet: '9aLp...m2Nk', seller_name: 'Partner B', quantity_available: 120, unit: 'tokens', asking_price_usdt: 800, status: 'active', description: 'Residential RWA tokens representing fractional ownership in a Busan apartment complex.', transaction_terms: 'Internal platform settlement required. KYC verification mandatory.', image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400' },
];

const STATUS_COLORS = { active: '#22c55e', pending_review: '#f59e0b', paused: '#64748b', sold: '#8b5cf6', rejected: '#ef4444' };

function ListingCard({ listing, onView }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: '#0d1220', border: '1px solid rgba(59,130,246,0.1)' }}>
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="w-full h-36 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-sm font-black text-white truncate">{listing.title}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-slate-500" />
              <span className="text-[9px] text-slate-500">{listing.location}</span>
            </div>
          </div>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${STATUS_COLORS[listing.status]}15`, color: STATUS_COLORS[listing.status], border: `1px solid ${STATUS_COLORS[listing.status]}30` }}>
            {listing.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[8px] text-slate-500">Qty</p>
            <p className="text-[11px] font-black text-white">{listing.quantity_available}</p>
            <p className="text-[7px] text-slate-600">{listing.unit}</p>
          </div>
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[8px] text-slate-500">Price</p>
            <p className="text-[11px] font-black text-[#3b82f6]">${listing.asking_price_usdt?.toLocaleString()}</p>
            <p className="text-[7px] text-slate-600">USDT/unit</p>
          </div>
          <div className="bg-[#151c2e] rounded-xl p-2 text-center">
            <p className="text-[8px] text-slate-500">Category</p>
            <p className="text-[9px] font-black text-slate-300 truncate">{listing.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-4 h-4 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
            <ShieldCheck className="w-2.5 h-2.5 text-[#3b82f6]" />
          </div>
          <span className="text-[8px] text-slate-500 font-mono truncate">{listing.seller_wallet}</span>
        </div>
        <button onClick={() => onView(listing)}
          className="w-full py-2.5 rounded-xl text-[10px] font-black text-[#3b82f6] flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Eye className="w-3.5 h-3.5" /> View Detail
        </button>
      </div>
    </div>
  );
}

function ListingDetailModal({ listing, onClose }) {
  const [qty, setQty] = useState(1);
  const [offerPrice, setOfferPrice] = useState(listing?.asking_price_usdt || 0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitOffer(type) {
    setSubmitting(true);
    try {
      await base44.entities.P2POrder.create({
        listing_id: listing.id,
        listing_title: listing.title,
        asset_type: listing.asset_type,
        buyer_wallet: 'MY_WALLET',
        order_type: type,
        quantity: qty,
        offered_price_usdt: offerPrice,
        total_usdt: qty * offerPrice,
        status: 'Submitted',
        ordered_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  }

  if (!listing) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto max-h-[90vh] scrollbar-none"
        style={{ background: '#0b0f1c', border: '1px solid rgba(59,130,246,0.15)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.07)]"
          style={{ background: 'rgba(11,15,28,0.98)' }}>
          <h2 className="text-sm font-black text-white">{listing.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {listing.image_url && <img src={listing.image_url} alt={listing.title} className="w-full h-44 object-cover rounded-2xl" />}

          {/* Asset Overview */}
          <Section title="Asset Overview" color="#3b82f6">
            <Row label="Title" value={listing.title} />
            <Row label="Location" value={listing.location} />
            <Row label="Category" value={listing.category} />
          </Section>

          {/* Seller Info */}
          <Section title="Seller Information" color="#8b5cf6">
            <Row label="Seller Name" value={listing.seller_name || '—'} />
            <Row label="Seller Wallet" value={listing.seller_wallet} mono />
          </Section>

          {/* Quantity & Price */}
          <Section title="Quantity & Price" color="#00d4aa">
            <Row label="Available" value={`${listing.quantity_available} ${listing.unit}`} />
            <Row label="Asking Price" value={`$${listing.asking_price_usdt?.toLocaleString()} USDT / unit`} />
            <Row label="Buy Now" value={listing.buy_now_enabled ? 'Available' : 'Offer Only'} />
          </Section>

          {/* Transaction Terms */}
          <Section title="Transaction Terms" color="#f59e0b">
            <p className="text-[10px] text-slate-400 leading-relaxed">{listing.transaction_terms || 'Standard SolFort internal settlement terms apply.'}</p>
          </Section>

          {/* Risk Notice */}
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Risk Notice</p>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed">This is an internal SolFort P2P transaction. All orders are subject to platform review and verification. Final settlement requires platform confirmation. This does not constitute financial advice.</p>
          </div>

          {/* Order Form */}
          {!submitted ? (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-wider">Place Order</p>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Quantity</label>
                <input type="number" min={1} max={listing.quantity_available} value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.06)] outline-none" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Offer Price (USDT per unit)</label>
                <input type="number" value={offerPrice} onChange={e => setOfferPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.06)] outline-none" />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-[10px] text-slate-500">Total</span>
                <span className="text-sm font-black text-white">${(qty * offerPrice).toLocaleString()} USDT</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => submitOffer('offer')} disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-black text-[#3b82f6] flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                  {submitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                  Make Offer
                </button>
                {listing.buy_now_enabled && (
                  <button onClick={() => submitOffer('buy_now')} disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-[10px] font-black text-white flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Check className="w-6 h-6 text-emerald-400" />
              <p className="text-sm font-black text-white">Order Submitted</p>
              <p className="text-[9px] text-slate-400 text-center">Your order is under review. SolFort will process and verify before settlement.</p>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, color = '#3b82f6', children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}15` }}>
      <div className="px-3.5 py-2 border-b" style={{ background: `${color}0a`, borderColor: `${color}12` }}>
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{title}</p>
      </div>
      <div className="p-3.5 bg-[#0d1220] space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[9px] text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-[10px] text-white font-semibold text-right ${mono ? 'font-mono text-[9px]' : ''}`}>{value}</span>
    </div>
  );
}

export default function RealEstateP2P() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.P2PRWAListing.filter({ asset_type: 'real_estate', status: 'active' })
      .then(data => setListings(data.length > 0 ? data : MOCK_LISTINGS))
      .catch(() => setListings(MOCK_LISTINGS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/P2PRWAExchange">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">P2P RWA Exchange</p>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#3b82f6]" /> Real Estate P2P
          </h1>
        </div>
      </div>

      {/* Platform Notice */}
      <div className="rounded-2xl p-3 mb-4 flex items-start gap-2" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-400 leading-relaxed">SolFort provides internal marketplace infrastructure. All listings are subject to platform listing review. Transaction settlement requires platform verification.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">No active listings found.</div>
      ) : (
        listings.map(l => <ListingCard key={l.id} listing={l} onView={setSelected} />)
      )}

      {selected && <ListingDetailModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}