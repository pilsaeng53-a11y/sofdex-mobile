import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/shared/WalletContext';
import {
  ChevronRight, ChevronLeft, Check, Clock, XCircle,
  Building2, Palette, Package, BarChart2, TrendingUp, Layers,
  Coins, Zap, Send, User, Mail, MessageCircle, Wallet,
  FileText, AlertCircle, Plus, Eye
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ['Contact', 'Asset Class', 'Subcategory', 'Details', 'Review'];

const ASSET_CLASSES = [
  { id: 'Coin',  label: 'Coin',  icon: Coins,     desc: 'Layer-1 or native blockchain coin', color: '#f59e0b' },
  { id: 'Token', label: 'Token', icon: Zap,        desc: 'ERC-20, SPL, or protocol token',    color: '#3b82f6' },
  { id: 'RWA',   label: 'RWA',   icon: Building2,  desc: 'Tokenized real-world asset',        color: '#8b5cf6' },
];

const RWA_SUBCATEGORIES = [
  { id: 'Real Estate',        icon: Building2,  color: '#8b5cf6', desc: 'Property, land, commercial buildings' },
  { id: 'Art / Collectibles', icon: Palette,    color: '#ec4899', desc: 'Fine art, watches, luxury items' },
  { id: 'Commodities',        icon: Package,    color: '#f59e0b', desc: 'Gold, oil, metals, agriculture' },
  { id: 'Equity',             icon: BarChart2,  color: '#3b82f6', desc: 'Stocks, equity shares, funds' },
  { id: 'Yield',              icon: TrendingUp, color: '#22c55e', desc: 'Bonds, treasuries, income pools' },
  { id: 'Alternative Assets', icon: Layers,     color: '#a78bfa', desc: 'Royalties, gaming, luxury goods' },
];

const DYNAMIC_FIELDS = {
  'Real Estate': [
    { key: 'location',        label: 'Property Location',       type: 'text',     placeholder: 'City, Country' },
    { key: 'property_type',   label: 'Property Type',           type: 'select',   options: ['Residential', 'Commercial', 'Mixed-Use', 'Industrial', 'Land'] },
    { key: 'description',     label: 'Property Description',    type: 'textarea', placeholder: 'Describe the property in detail...' },
    { key: 'estimated_value', label: 'Estimated Value (USD)',    type: 'number',   placeholder: '0.00' },
    { key: 'rental_status',   label: 'Rental Status',           type: 'select',   options: ['Fully Occupied', 'Partially Occupied', 'Vacant', 'Under Development'] },
    { key: 'ownership_proof', label: 'Ownership Proof / Docs',  type: 'text',     placeholder: 'Title deed, registry link, legal entity...' },
  ],
  'Art / Collectibles': [
    { key: 'artist',          label: 'Artist / Creator',        type: 'text',     placeholder: 'Full name' },
    { key: 'artwork_name',    label: 'Artwork / Item Name',     type: 'text',     placeholder: 'Title of the piece' },
    { key: 'year',            label: 'Year Created',            type: 'number',   placeholder: '2024' },
    { key: 'authentication',  label: 'Authentication Status',   type: 'select',   options: ['Certified', 'Pending Certification', 'Not Certified', 'Provenance Verified'] },
    { key: 'estimated_value', label: 'Estimated Value (USD)',   type: 'number',   placeholder: '0.00' },
    { key: 'custody',         label: 'Storage / Custody',       type: 'text',     placeholder: 'Museum, vault, gallery...' },
  ],
  'Commodities': [
    { key: 'commodity_type',  label: 'Commodity Type',          type: 'select',   options: ['Gold', 'Silver', 'Oil', 'Natural Gas', 'Copper', 'Wheat', 'Other'] },
    { key: 'quantity',        label: 'Quantity / Amount',       type: 'text',     placeholder: 'e.g. 500 troy oz, 100 barrels' },
    { key: 'grade',           label: 'Grade / Specification',   type: 'text',     placeholder: 'e.g. 99.9% purity, Brent crude' },
    { key: 'storage',         label: 'Storage / Backing',       type: 'text',     placeholder: 'Vault name, location, custodian' },
    { key: 'estimated_value', label: 'Estimated Value (USD)',   type: 'number',   placeholder: '0.00' },
  ],
  'Equity': [
    { key: 'company_name',    label: 'Company Name',            type: 'text',     placeholder: 'Legal entity name' },
    { key: 'jurisdiction',    label: 'Jurisdiction',            type: 'text',     placeholder: 'Country of incorporation' },
    { key: 'share_class',     label: 'Share Class',             type: 'select',   options: ['Common Stock', 'Preferred Stock', 'LP Interest', 'Fund Units'] },
    { key: 'total_shares',    label: 'Total Shares / Units',    type: 'number',   placeholder: '0' },
    { key: 'estimated_value', label: 'Estimated Value (USD)',   type: 'number',   placeholder: '0.00' },
    { key: 'audited',         label: 'Audited',                 type: 'select',   options: ['Yes — audited financials available', 'No', 'In Progress'] },
  ],
  'Yield': [
    { key: 'instrument_type', label: 'Instrument Type',         type: 'select',   options: ['Government Bond', 'Corporate Bond', 'Real Estate Pool', 'Stablecoin Pool', 'Municipal Bond', 'Other'] },
    { key: 'issuer',          label: 'Issuer / Borrower',       type: 'text',     placeholder: 'Entity name' },
    { key: 'apy',             label: 'Target APY / Yield (%)',  type: 'number',   placeholder: '0.00' },
    { key: 'maturity',        label: 'Maturity / Duration',     type: 'text',     placeholder: 'e.g. 10 years, 3 months, perpetual' },
    { key: 'rating',          label: 'Credit Rating',           type: 'select',   options: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'Unrated'] },
    { key: 'estimated_value', label: 'Total Pool Size (USD)',   type: 'number',   placeholder: '0.00' },
  ],
  'Alternative Assets': [
    { key: 'alt_type',        label: 'Asset Type',              type: 'select',   options: ['Music Royalties', 'Sports Contract', 'Film Revenue', 'Gaming IP', 'Domain Portfolio', 'Luxury Goods', 'Other'] },
    { key: 'description',     label: 'Asset Description',       type: 'textarea', placeholder: 'Describe the asset and its revenue model...' },
    { key: 'revenue_model',   label: 'Revenue / Yield Model',   type: 'text',     placeholder: 'e.g. streaming royalties, licensing fees' },
    { key: 'estimated_value', label: 'Estimated Value (USD)',   type: 'number',   placeholder: '0.00' },
    { key: 'documentation',   label: 'Legal Documentation',     type: 'text',     placeholder: 'Contract type, IP ownership proof...' },
  ],
  'Coin': [
    { key: 'coin_name',       label: 'Coin Name',               type: 'text',     placeholder: 'e.g. Bitcoin, Solana' },
    { key: 'ticker',          label: 'Ticker Symbol',           type: 'text',     placeholder: 'e.g. BTC, SOL' },
    { key: 'blockchain',      label: 'Native Blockchain',       type: 'text',     placeholder: 'e.g. Bitcoin, Solana' },
    { key: 'contract',        label: 'Contract / Mint Address', type: 'text',     placeholder: 'On-chain address if applicable' },
    { key: 'description',     label: 'Project Description',     type: 'textarea', placeholder: 'What is the project about?' },
  ],
  'Token': [
    { key: 'token_name',      label: 'Token Name',              type: 'text',     placeholder: 'e.g. Jupiter, Uniswap' },
    { key: 'ticker',          label: 'Ticker Symbol',           type: 'text',     placeholder: 'e.g. JUP, UNI' },
    { key: 'blockchain',      label: 'Blockchain / Network',    type: 'select',   options: ['Solana', 'Ethereum', 'BNB Chain', 'Arbitrum', 'Polygon', 'Other'] },
    { key: 'contract',        label: 'Contract / Mint Address', type: 'text',     placeholder: 'Token contract address' },
    { key: 'description',     label: 'Project Description',     type: 'textarea', placeholder: 'What does the token represent?' },
    { key: 'website',         label: 'Website / Whitepaper',    type: 'text',     placeholder: 'https://' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, labels }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && <div className={`flex-1 h-px transition-colors ${i <= current ? 'bg-[#8b5cf6]/50' : 'bg-[rgba(148,163,184,0.1)]'}`} />}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                  done   ? 'bg-[#8b5cf6] text-white' :
                  active ? 'bg-[#8b5cf6]/20 border-2 border-[#8b5cf6] text-[#8b5cf6]' :
                           'bg-[#151c2e] border border-[rgba(148,163,184,0.15)] text-slate-600'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < labels.length - 1 && <div className={`flex-1 h-px transition-colors ${i < current ? 'bg-[#8b5cf6]/50' : 'bg-[rgba(148,163,184,0.1)]'}`} />}
              </div>
              <span className={`text-[9px] mt-1.5 font-semibold transition-colors ${active ? 'text-[#8b5cf6]' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormInput({ field, value, onChange }) {
  const base = "w-full bg-[#0d1220] border border-[rgba(148,163,184,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/40 transition-colors";
  if (field.type === 'textarea') {
    return (
      <textarea value={value || ''} onChange={e => onChange(field.key, e.target.value)}
        placeholder={field.placeholder} rows={3} className={`${base} resize-none`} />
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(field.key, e.target.value)} className={`${base} appearance-none`}>
        <option value="" disabled>Select...</option>
        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  return (
    <input type={field.type === 'number' ? 'number' : 'text'} value={value || ''}
      onChange={e => onChange(field.key, e.target.value)} placeholder={field.placeholder} className={base} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssetOnboarding() {
  const { isConnected, address, requireWallet } = useWallet();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: '', email: '', telegram: '' });
  const [assetClass, setAssetClass] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const effectiveSteps = assetClass === 'RWA' ? STEPS : ['Contact', 'Asset Class', 'Details', 'Review'];
  const dynamicKey = assetClass === 'RWA' ? subcategory : assetClass;
  const dynamicFields = DYNAMIC_FIELDS[dynamicKey] || [];
  const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  const isLastStep = (assetClass === 'RWA' && step === 4) || (assetClass !== 'RWA' && step === 3);

  const canNext = () => {
    if (step === 0) return contact.name && contact.email;
    if (step === 1) return !!assetClass;
    if (step === 2 && assetClass === 'RWA') return !!subcategory;
    return true;
  };

  const next = () => { if (canNext()) setStep(s => s + 1); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!isConnected) { requireWallet(); return; }
    setSubmitting(true);
    try {
      await base44.entities.AssetRegistration.create({
        wallet_address: address,
        name: contact.name,
        email: contact.email,
        telegram: contact.telegram,
        asset_class: assetClass,
        rwa_subcategory: assetClass === 'RWA' ? subcategory : undefined,
        fields,
        status: 'Processing',
        submitted_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (_) {}
    setSubmitting(false);
  };

  const reset = () => {
    setStep(0); setContact({ name: '', email: '', telegram: '' });
    setAssetClass(''); setSubcategory(''); setFields({});
    setSubmitted(false);
  };

  // ── Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-5">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Submitted!</h2>
        <p className="text-sm text-slate-400 max-w-xs mb-6">Your asset has been submitted to the SolFort Foundation for review. We'll contact you via email or Telegram within 3–5 business days.</p>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">Status: Processing</span>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-sm text-slate-300 hover:text-white transition-all">
            Submit Another
          </button>
          <a href="/MySubmissions" className="px-5 py-2.5 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/25 text-sm text-[#8b5cf6] font-semibold hover:bg-[#8b5cf6]/20 transition-all">
            View My Submissions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-center justify-between mb-0.5">
          <div>
            <h1 className="text-xl font-bold text-white">Register My Asset</h1>
            <p className="text-xs text-slate-500">Submit to the SolFort Foundation for review & listing</p>
          </div>
          <a href="/MySubmissions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-xs text-slate-400 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5" />
            My Submissions
          </a>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} labels={effectiveSteps} />

      {/* Card */}
      <div className="px-4 pb-8">
        <div className="glass-card rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden">

          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Your Contact Info</p>
                  <p className="text-[10px] text-slate-500">We'll use this to update you on your submission</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'name',     label: 'Full Name',     icon: User,          ph: 'Your full name',  required: true },
                  { key: 'email',    label: 'Email Address', icon: Mail,          ph: 'your@email.com',  required: true },
                  { key: 'telegram', label: 'Telegram ID',   icon: MessageCircle, ph: '@username',       required: false },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key}>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Icon className="w-3 h-3" /> {f.label} {f.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type={f.key === 'email' ? 'email' : 'text'}
                        value={contact[f.key]}
                        onChange={e => setContact(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.ph}
                        className="w-full bg-[#0d1220] border border-[rgba(148,163,184,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/40 transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Asset Class */}
          {step === 1 && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Select Asset Class</p>
                  <p className="text-[10px] text-slate-500">What type of asset are you registering?</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {ASSET_CLASSES.map(ac => {
                  const Icon = ac.icon;
                  const sel = assetClass === ac.id;
                  return (
                    <button key={ac.id} onClick={() => { setAssetClass(ac.id); setSubcategory(''); setFields({}); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        sel ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10' : 'border-[rgba(148,163,184,0.08)] bg-[#0d1220] hover:border-[rgba(148,163,184,0.15)]'
                      }`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ac.color}18` }}>
                        <Icon className="w-5 h-5" style={{ color: ac.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{ac.label}</p>
                        <p className="text-[10px] text-slate-500">{ac.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-slate-600'}`}>
                        {sel && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: RWA Subcategory */}
          {step === 2 && assetClass === 'RWA' && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">RWA Category</p>
                  <p className="text-[10px] text-slate-500">What type of real-world asset?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RWA_SUBCATEGORIES.map(sc => {
                  const Icon = sc.icon;
                  const sel = subcategory === sc.id;
                  return (
                    <button key={sc.id} onClick={() => { setSubcategory(sc.id); setFields({}); }}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left ${
                        sel ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10' : 'border-[rgba(148,163,184,0.08)] bg-[#0d1220] hover:border-[rgba(148,163,184,0.15)]'
                      }`}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${sc.color}18` }}>
                        <Icon className="w-4 h-4" style={{ color: sc.color }} />
                      </div>
                      <p className="text-xs font-bold text-white leading-tight">{sc.id}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{sc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Fields step */}
          {((step === 3 && assetClass === 'RWA') || (step === 2 && assetClass !== 'RWA')) && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Asset Details</p>
                  <p className="text-[10px] text-slate-500">{dynamicKey} — fill in the details below</p>
                </div>
              </div>
              <div className="space-y-3">
                {dynamicFields.map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <FormInput field={f} value={fields[f.key]} onChange={setField} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review & Submit */}
          {isLastStep && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Review & Submit</p>
                  <p className="text-[10px] text-slate-500">Confirm your submission details</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="bg-[#0d1220] rounded-xl p-3.5 border border-[rgba(148,163,184,0.08)]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Contact</p>
                  {[['Name', contact.name], ['Email', contact.email], ['Telegram', contact.telegram || '—']].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-0.5">
                      <span className="text-[11px] text-slate-500">{k}</span>
                      <span className="text-[11px] text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0d1220] rounded-xl p-3.5 border border-[rgba(148,163,184,0.08)]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Asset</p>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] text-slate-500">Class</span>
                    <span className="text-[11px] text-white font-medium">{assetClass}</span>
                  </div>
                  {subcategory && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-[11px] text-slate-500">Category</span>
                      <span className="text-[11px] text-white font-medium">{subcategory}</span>
                    </div>
                  )}
                  {Object.entries(fields).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 py-0.5">
                      <span className="text-[11px] text-slate-500 capitalize flex-shrink-0">{k.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-white font-medium text-right line-clamp-1">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isConnected && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-400">Connect your wallet to submit</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                {submitting ? <div className="w-4 h-4 spin-glow" /> : <><Send className="w-4 h-4" /> Submit to Foundation</>}
              </button>
              <p className="text-[9px] text-slate-600 text-center mt-2">Review takes 3–5 business days. You'll be notified via email & Telegram.</p>
            </div>
          )}

          {/* Navigation bar */}
          <div className="px-5 pb-5 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button onClick={back} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-sm text-slate-400 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {!isLastStep && (
              <button onClick={next} disabled={!canNext()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                style={{ background: canNext() ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#1e2a42' }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}