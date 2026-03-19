/**
 * SOFSalesPartnerDashboard.jsx
 * Exclusively for approved SOF token sales partners.
 * No referral logic. No commission cascades. No FeeEngine rewards.
 * Access: only wallets whitelisted in ApprovedSalesPartner entity.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/shared/WalletContext';
import { useLang } from '@/components/shared/LanguageContext';
import { base44 } from '@/api/base44Client';
import { DisconnectedState, NotApprovedState, CheckingState } from '@/components/sofpartner/SOFPartnerGate';
import CustomerRegistrationForm from '@/components/sofpartner/CustomerRegistrationForm';
import CustomerTable from '@/components/sofpartner/CustomerTable';
import { formatNumber } from '@/components/sofpartner/SOFQuantityCalc';
import { UserPlus, List, Users } from 'lucide-react';

function StatCard({ label, value, sub, color = '#00d4aa' }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold mt-1" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SOFSalesPartnerDashboard() {
  const { isConnected, address } = useWallet();
  const { t } = useLang();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [periodFilter, setPeriodFilter] = useState('all');

  const TABS = [
    { id: 'register', labelKey: 'sof_sales_register', icon: UserPlus },
    { id: 'manage',   labelKey: 'sof_sales_customers', icon: Users },
    { id: 'history',  labelKey: 'sof_sales_history', icon: List },
  ];

  useEffect(() => {
    if (!isConnected || !address) {
      setCheckingAccess(false);
      setIsApproved(false);
      return;
    }
    checkPartnerAccess();
  }, [isConnected, address]);

  async function checkPartnerAccess() {
    setCheckingAccess(true);
    try {
      const partners = await base44.entities.ApprovedSalesPartner.filter({ wallet_address: address, status: 'active' });
      if (partners.length > 0) {
        setIsApproved(true);
        setPartnerInfo(partners[0]);
        loadSubmissions();
      } else {
        setIsApproved(false);
      }
    } catch (e) {
      console.error(e);
      setIsApproved(false);
    }
    setCheckingAccess(false);
  }

  const loadSubmissions = useCallback(async () => {
    if (!address) return;
    setLoadingData(true);
    try {
      const data = await base44.entities.SOFSaleSubmission.filter({ partner_wallet: address }, '-submitted_at', 500);
      setSubmissions(data);
    } catch (e) { console.error(e); }
    setLoadingData(false);
  }, [address]);

  const totalUSDT  = submissions.reduce((s, r) => s + (r.purchase_amount || 0), 0);
  const totalSOF   = submissions.reduce((s, r) => s + (r.sof_quantity || 0), 0);
  const processing = submissions.filter(r => r.status === 'Processing').length;
  const approved   = submissions.filter(r => r.status === 'Approved').length;

  if (!isConnected) return <DisconnectedState />;
  if (checkingAccess) return <CheckingState />;
  if (!isApproved) return <NotApprovedState />;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-24">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa]" style={{ boxShadow: '0 0 8px rgba(0,212,170,0.8)' }} />
          <span className="text-[9px] font-bold text-[#00d4aa] uppercase tracking-widest">{t('sof_approved_label')}</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{t('sof_sales_title')}</h1>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{address}</p>
        {partnerInfo?.display_name && (
          <p className="text-xs text-slate-400 mt-1">{partnerInfo.display_name}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('sof_sales_total_submissions')} value={submissions.length} sub={t('sof_sales_all_time')} color="#ffffff" />
        <StatCard label={t('sof_sales_total_volume')} value={`$${formatNumber(totalUSDT, 0)}`} sub={t('sof_sales_customer_purchases')} color="#00d4aa" />
        <StatCard label={t('sof_sales_total_sof')} value={`${formatNumber(totalSOF, 2)}`} sub={t('sof_sales_calc_qty')} color="#8b5cf6" />
        <div className="glass-card rounded-xl p-4">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{t('sof_sales_status')}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div>
              <p className="text-[8px] text-yellow-400 font-bold">{processing}</p>
              <p className="text-[7px] text-slate-600">{t('sof_status_processing')}</p>
            </div>
            <div className="w-px h-6 bg-[rgba(148,163,184,0.1)]" />
            <div>
              <p className="text-[8px] text-green-400 font-bold">{approved}</p>
              <p className="text-[7px] text-slate-600">{t('sof_status_approved')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-2xl p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold leading-tight text-center">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Register */}
      {activeTab === 'register' && (
        <CustomerRegistrationForm
          partnerWallet={address}
          onSubmitSuccess={() => { loadSubmissions(); setActiveTab('manage'); }}
        />
      )}

      {/* Tab: Manage */}
      {activeTab === 'manage' && (
        <div>
          {loadingData ? (
            <div className="py-10 flex justify-center"><div className="w-6 h-6 spin-glow" /></div>
          ) : submissions.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1a2340] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t('sof_sales_no_customers')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('sof_sales_no_customers_desc')}</p>
              </div>
              <button onClick={() => setActiveTab('register')} className="btn-solana px-6 py-2.5 text-xs font-bold rounded-xl">
                {t('sof_sales_register_first')}
              </button>
            </div>
          ) : (
            <CustomerTable records={submissions} periodFilter={periodFilter} onPeriodFilterChange={setPeriodFilter} />
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div>
          {loadingData ? (
            <div className="py-10 flex justify-center"><div className="w-6 h-6 spin-glow" /></div>
          ) : (
            <CustomerTable records={submissions} periodFilter={periodFilter} onPeriodFilterChange={setPeriodFilter} />
          )}
        </div>
      )}
    </div>
  );
}