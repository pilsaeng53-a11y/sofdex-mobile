import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Gem, ArrowRight, ShieldCheck, FileText, History, AlertTriangle } from 'lucide-react';

const NOTICE_ITEMS = [
  'SolFort operates as the internal marketplace infrastructure provider for registered RWA assets.',
  'All listings and transactions are recorded and subject to platform review and verification.',
  'Physical delivery and settlement requests are processed under SolFort platform terms.',
  'Users must review all transaction and delivery conditions before confirming any order.',
  'KYC verification and wallet authentication may be required for certain transaction types.',
];

export default function P2PRWAExchange() {
  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SolFort Internal Marketplace</p>
        <h1 className="text-2xl font-black text-white mb-1">P2P RWA Exchange</h1>
        <p className="text-sm text-slate-400">Trade registered real-world assets peer-to-peer within the SolFort ecosystem</p>
      </div>

      {/* Product Type Cards */}
      <div className="space-y-4 mb-6">
        {/* Real Estate P2P */}
        <Link to="/RealEstateP2P">
          <div className="rounded-3xl overflow-hidden transition-all active:scale-98 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-[#3b82f6]"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>INTERNAL MARKET</span>
              </div>
              <h2 className="text-lg font-black text-white mb-1">Real Estate P2P</h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Trade internally registered real estate RWA assets peer-to-peer. Browse listings, submit offers, and complete transactions within the SolFort platform.
              </p>
              <div className="flex items-center gap-4 mb-4">
                {['Browse Listings', 'Make Offers', 'My Orders'].map(t => (
                  <span key={t} className="text-[9px] text-[#3b82f6] font-bold">✓ {t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Real Estate · Tokenized Properties</span>
                <div className="flex items-center gap-1.5 text-[#3b82f6] text-sm font-black">
                  Enter Market <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Gold Physical Delivery */}
        <Link to="/GoldP2PMarket">
          <div className="rounded-3xl overflow-hidden transition-all active:scale-98 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(234,179,8,0.06))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  <Gem className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-[#f59e0b]"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>PHYSICAL DELIVERY</span>
              </div>
              <h2 className="text-lg font-black text-white mb-1">Gold Physical Delivery</h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Trade gold RWA units internally and request physical delivery. Eligible holders can initiate a structured delivery workflow subject to platform review.
              </p>
              <div className="flex items-center gap-4 mb-4">
                {['Trade Internally', 'Physical Delivery', 'Track Requests'].map(t => (
                  <span key={t} className="text-[9px] text-[#f59e0b] font-bold">✓ {t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Gold · Physical Asset · Vault Storage</span>
                <div className="flex items-center gap-1.5 text-[#f59e0b] text-sm font-black">
                  Enter Market <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'My Orders', icon: History, to: '/MyP2POrders', color: '#8b5cf6' },
          { label: 'My Listings', icon: FileText, to: '/MyP2PListings', color: '#3b82f6' },
          { label: 'My Deliveries', icon: ShieldCheck, to: '/MyDeliveryRequests', color: '#f59e0b' },
        ].map(({ label, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <div className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center"
              style={{ background: `${color}0a`, border: `1px solid ${color}18` }}>
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="text-[10px] font-black" style={{ color }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Platform Notice */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Platform Notice & Risk Disclosure</p>
        </div>
        <div className="space-y-1.5">
          {NOTICE_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-400/60 text-[9px] mt-0.5 flex-shrink-0">•</span>
              <p className="text-[9px] text-slate-400 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}