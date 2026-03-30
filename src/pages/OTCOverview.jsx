import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Building2, DollarSign, Layers, Truck, ShoppingBag, FileText, HelpCircle, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

const OTC_CARDS = [
  {
    title: 'P2P Exchange',
    desc: 'Trade directly with other SolFort users — browse buy/sell listings and submit offers.',
    icon: ArrowDownUp,
    color: '#8b5cf6',
    to: '/P2PRWAExchange',
  },
  {
    title: 'Real Estate OTC',
    desc: 'Private trading for real estate-backed RWA assets. Hospitality, residential, commercial.',
    icon: Building2,
    color: '#3b82f6',
    to: '/RealEstateP2P',
  },
  {
    title: 'Gold OTC',
    desc: 'Trade gold RWA units internally and request physical delivery for eligible holdings.',
    icon: DollarSign,
    color: '#f59e0b',
    to: '/GoldP2PMarket',
  },
  {
    title: 'Block Trade Desk',
    desc: 'Submit large-size private transaction requests above standard thresholds.',
    icon: Layers,
    color: '#00d4aa',
    to: '/OTCBlockTrade',
  },
  {
    title: 'Physical Delivery',
    desc: 'Request physical settlement for eligible gold and commodity assets.',
    icon: Truck,
    color: '#f97316',
    to: '/MyDeliveryRequests',
  },
];

const QUICK_LINKS = [
  { label: 'My OTC Orders',    icon: ShoppingBag, to: '/MyP2POrders',         color: '#8b5cf6' },
  { label: 'My OTC Listings',  icon: FileText,    to: '/MyOTCListings',        color: '#3b82f6' },
  { label: 'Support & Dispute',icon: HelpCircle,  to: '/OTCSupportDispute',    color: '#f59e0b' },
];

const NOTICES = [
  'SolFort operates as the internal OTC marketplace infrastructure provider.',
  'All OTC listings and trades are subject to platform listing review and verification.',
  'Physical delivery requests are processed under SolFort platform terms.',
  'KYC verification and wallet authentication may be required for high-value transactions.',
  'Users must review all settlement conditions before confirming any OTC transaction.',
];

export default function OTCOverview() {
  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SolFort Internal</p>
        <h1 className="text-2xl font-black text-white mb-1">OTC Marketplace</h1>
        <p className="text-sm text-slate-400">Private and peer-to-peer trading for real-world assets</p>
      </div>

      {/* OTC Cards */}
      <div className="space-y-3 mb-6">
        {OTC_CARDS.map(({ title, desc, icon: Icon, color, to }) => (
          <Link key={title} to={to}>
            <div className="rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{ background: `${color}0a`, border: `1px solid ${color}1a` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0 text-[10px] font-black"
                style={{ background: `${color}12`, border: `1px solid ${color}20`, color }}>
                Open <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {QUICK_LINKS.map(({ label, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <div className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center"
              style={{ background: `${color}0a`, border: `1px solid ${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="text-[9px] font-black" style={{ color }}>{label}</span>
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
          {NOTICES.map((item, i) => (
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