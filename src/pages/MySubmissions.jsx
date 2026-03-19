import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/shared/WalletContext';
import { Clock, Check, XCircle, FileText, Wallet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS_CONFIG = {
  Processing: { icon: Clock,    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Processing' },
  Approved:   { icon: Check,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Approved' },
  Rejected:   { icon: XCircle,  color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     label: 'Rejected' },
};

function SubmissionCard({ sub }) {
  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.Processing;
  const Icon = cfg.icon;
  const subcat = sub.rwa_subcategory ? ` · ${sub.rwa_subcategory}` : '';
  const title = sub.fields?.token_name || sub.fields?.coin_name || sub.fields?.company_name ||
    sub.fields?.artwork_name || sub.fields?.property_type || sub.asset_class || 'Asset';

  return (
    <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-sm font-bold text-white truncate">{title}</p>
          <p className="text-[10px] text-slate-500">{sub.asset_class}{subcat}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border flex-shrink-0 ${cfg.bg} ${cfg.border}`}>
          <Icon className={`w-3 h-3 ${cfg.color}`} />
          <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-600">
        Submitted {sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'}
      </p>
      {sub.notes && (
        <p className="text-[10px] text-slate-400 mt-1.5 border-t border-[rgba(148,163,184,0.06)] pt-1.5">{sub.notes}</p>
      )}
    </div>
  );
}

export default function MySubmissions() {
  const { isConnected, address, requireWallet } = useWallet();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    base44.entities.AssetRegistration.filter({ wallet_address: address })
      .then(data => setSubmissions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isConnected, address]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">My Submissions</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track your asset registration requests</p>
          </div>
          <Link
            to={createPageUrl('AssetOnboarding')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Register
          </Link>
        </div>
      </div>

      {/* Content */}
      {!isConnected ? (
        <div className="px-4 mt-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">Connect your wallet to view your asset registration submissions.</p>
          <button
            onClick={() => requireWallet()}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
          >
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center mt-16">
          <div className="w-7 h-7 spin-glow" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="px-4 mt-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">No Submissions Yet</h2>
          <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">You haven't registered any assets yet. Start by submitting your first asset to the SolFort Foundation.</p>
          <Link
            to={createPageUrl('AssetOnboarding')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
          >
            <Plus className="w-4 h-4" />
            Register My Asset
          </Link>
        </div>
      ) : (
        <div className="px-4 pb-8 space-y-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-3">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          {submissions.map(s => <SubmissionCard key={s.id} sub={s} />)}
        </div>
      )}
    </div>
  );
}