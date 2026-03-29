/**
 * SOFSalesPartnerDashboard.jsx
 * Full operational partner management system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/shared/WalletContext';
import { useLang } from '@/components/shared/LanguageContext';
import { base44 } from '@/api/base44Client';
import { DisconnectedState, NotApprovedState, CheckingState } from '@/components/sofpartner/SOFPartnerGate';
import { DEV_MODE, DEV_WALLET, DEV_SALES_PARTNER } from '@/components/shared/devConfig';
import SalesCalculator from '@/components/sofpartner/SalesCalculator';
import { useSubordinates } from '@/hooks/useSubordinates';
import { usePartnerGrade } from '@/hooks/usePartnerGrade';
import PartnerGradePanel from '@/components/sofpartner/PartnerGradePanel';
import PartnerDashboardStats from '@/components/sofpartner/PartnerDashboardStats';
import SubmissionHistoryTable from '@/components/sofpartner/SubmissionHistoryTable';
import QuickEntryForm from '@/components/sofpartner/QuickEntryForm';
import EarningsPreview from '@/components/sofpartner/EarningsPreview';
import TargetSystem from '@/components/sofpartner/TargetSystem';
import GradeSimulator from '@/components/sofpartner/GradeSimulator';
import OrgTree from '@/components/sofpartner/OrgTree';
import CalcLogPanel from '@/components/sofpartner/CalcLogPanel';
import NotificationCenter from '@/components/sofpartner/NotificationCenter';
import AdminPanel from '@/components/sofpartner/AdminPanel';
import ProfitSimulator from '@/components/sofpartner/ProfitSimulator';
import AnnouncementPanel from '@/components/sofpartner/AnnouncementPanel';
import RealtimeSalesBoard from '@/components/sofpartner/RealtimeSalesBoard';
import EarningsSummaryCard from '@/components/sofpartner/EarningsSummaryCard';
import SettlementHistory from '@/components/sofpartner/SettlementHistory';
import SalesLeaderboard from '@/components/sofpartner/SalesLeaderboard';
import ActivityPressure from '@/components/sofpartner/ActivityPressure';
import SalesScriptGenerator from '@/components/sofpartner/SalesScriptGenerator';
import LiveEarningsCounter from '@/components/sofpartner/LiveEarningsCounter';
import AISalesManager from '@/components/sofpartner/AISalesManager';
import {
  LayoutDashboard, UserPlus, List, GitBranch,
  TrendingUp, Bell, Calculator, Shield, Megaphone
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: '대시보드',   icon: LayoutDashboard },
  { id: 'sales',     label: '실적현황',   icon: TrendingUp },
  { id: 'register',  label: '판매 등록',  icon: UserPlus },
  { id: 'history',   label: '제출 기록',  icon: List },
  { id: 'org',       label: '조직도',     icon: GitBranch },
  { id: 'grade',     label: '등급',       icon: TrendingUp },
  { id: 'script',    label: '스크립트',   icon: Megaphone },
  { id: 'sim',       label: '시뮬레이터', icon: Calculator },
  { id: 'settle',    label: '정산내역',   icon: List },
  { id: 'leaderboard', label: '리더보드', icon: TrendingUp },
  { id: 'announce',  label: '공지',       icon: Megaphone },
  { id: 'calc',      label: '계산로그',   icon: Calculator },
  { id: 'notify',    label: '알림',       icon: Bell },
  { id: 'admin',     label: '관리자',     icon: Shield },
];

export default function SOFSalesPartnerDashboard() {
  const { isConnected, address } = useWallet();
  const { t } = useLang();
  const effectiveWallet = DEV_MODE ? DEV_WALLET : address;

  const { gradeInfo, loading: gradeLoading, fetched: gradeFetched } = usePartnerGrade(effectiveWallet);
  const { active: subActive, promoted: subPromoted, loading: subLoading } = useSubordinates(effectiveWallet, gradeInfo?.grade);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isApproved,     setIsApproved]     = useState(false);
  const [partnerInfo,    setPartnerInfo]     = useState(null);
  const [submissions,    setSubmissions]     = useState([]);
  const [loadingData,    setLoadingData]     = useState(false);
  const [activeTab,      setActiveTab]       = useState('dashboard');

  useEffect(() => {
    if (DEV_MODE) {
      setCheckingAccess(false);
      setIsApproved(true);
      setPartnerInfo(DEV_SALES_PARTNER);
      loadSubmissions();
      return;
    }
    if (!isConnected || !address) { setCheckingAccess(false); setIsApproved(false); return; }
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
    } catch (e) { console.error(e); setIsApproved(false); }
    setCheckingAccess(false);
  }

  const loadSubmissions = useCallback(async () => {
    const wallet = DEV_MODE ? DEV_WALLET : address;
    if (!wallet) return;
    setLoadingData(true);
    try {
      const data = await base44.entities.SOFSaleSubmission.filter({ partner_wallet: wallet }, '-submitted_at', 500);
      setSubmissions(data);
    } catch (e) { console.error(e); }
    setLoadingData(false);
  }, [address]);

  // Gate checks
  if (!DEV_MODE) {
    if (!isConnected)    return <DisconnectedState />;
    if (checkingAccess)  return <CheckingState />;
    if (!isApproved)     return <NotApprovedState />;
  }

  const unread = subPromoted.length + submissions.filter(r => r.status === 'Approved' || r.status === 'Rejected').slice(0, 3).length;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-24">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa]" style={{ boxShadow: '0 0 8px rgba(0,212,170,0.8)' }} />
          <span className="text-[9px] font-bold text-[#00d4aa] uppercase tracking-widest">SOF 승인 파트너</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">파트너 운영 센터</h1>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{effectiveWallet}</p>
          </div>
          {partnerInfo?.display_name && (
            <div className="text-right">
              <p className="text-xs font-bold text-slate-300">{partnerInfo.display_name}</p>
              {gradeInfo?.grade && (
                <p className="text-[8px]" style={{ color: { GREEN: '#22c55e', PURPLE: '#a78bfa', GOLD: '#fbbf24', PLATINUM: '#e2e8f0' }[gradeInfo.grade] }}>
                  {gradeInfo.grade}
                </p>
              )}
            </div>
          )}
        </div>
        {DEV_MODE && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">DEV MODE</span>}
      </div>

      {/* Tab navigation — horizontal scrollable */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
        <div className="flex gap-1 min-w-max glass-card rounded-2xl p-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasNotif = tab.id === 'notify' && unread > 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all flex-shrink-0 ${isActive ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
                <div className="relative">
                  <Icon className="w-3.5 h-3.5" />
                  {hasNotif && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00d4aa]" style={{ boxShadow: '0 0 6px rgba(0,212,170,0.8)' }} />}
                </div>
                <span className="text-[7px] font-bold leading-tight text-center whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}

      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <ActivityPressure submissions={submissions} gradeInfo={gradeInfo} subActive={subActive} />
          <PartnerDashboardStats submissions={submissions} gradeInfo={gradeInfo} subActive={subActive} subPromoted={subPromoted} />
          <EarningsSummaryCard walletAddress={effectiveWallet} />
          <LiveEarningsCounter submissions={submissions} gradeInfo={gradeInfo} />
          <TargetSystem walletAddress={effectiveWallet} />
        </div>
      )}

      {activeTab === 'sales' && (
        <RealtimeSalesBoard submissions={submissions} subActive={subActive} />
      )}

      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">판매 등록</p>
            <QuickEntryForm
              walletAddress={effectiveWallet}
              partnerGrade={gradeInfo?.grade || 'C'}
              partnerName={partnerInfo?.display_name}
              onSubmitted={() => { loadSubmissions(); }}
            />
          </div>
          <PartnerGradePanel gradeInfo={gradeInfo} loading={gradeLoading} fetched={gradeFetched} wallet={effectiveWallet} />
          <SalesCalculator
            partnerWallet={effectiveWallet}
            gradeInfo={gradeInfo}
            onSubmitSuccess={() => { loadSubmissions(); setActiveTab('history'); }}
          />
        </div>
      )}

      {activeTab === 'history' && (
        loadingData
          ? <div className="py-10 flex justify-center"><div className="w-6 h-6 spin-glow" /></div>
          : <SubmissionHistoryTable records={submissions} />
      )}

      {activeTab === 'org' && (
        <OrgTree wallet={effectiveWallet} active={subActive} promoted={subPromoted} loading={subLoading} gradeInfo={gradeInfo} />
      )}

      {activeTab === 'grade' && (
        <div className="space-y-4">
          <PartnerGradePanel gradeInfo={gradeInfo} loading={gradeLoading} fetched={gradeFetched} wallet={effectiveWallet} submissions={submissions} subActive={subActive} />
          <GradeSimulator gradeInfo={gradeInfo} submissions={submissions} subActive={subActive} />
        </div>
      )}

      {activeTab === 'settle' && (
        <SettlementHistory submissions={submissions} />
      )}

      {activeTab === 'leaderboard' && (
        <SalesLeaderboard submissions={submissions} subActive={subActive} walletAddress={effectiveWallet} />
      )}

      {activeTab === 'sim' && (
        <ProfitSimulator gradeInfo={gradeInfo} />
      )}

      {activeTab === 'script' && (
        <SalesScriptGenerator gradeInfo={gradeInfo} />
      )}

      {activeTab === 'announce' && (
        <AnnouncementPanel gradeInfo={gradeInfo} />
      )}

      {activeTab === 'calc' && (
        <div className="space-y-3">
          <p className="text-[9px] text-slate-500">최근 제출 기록의 전체 계산 내역입니다.</p>
          {submissions.length === 0
            ? <div className="py-12 text-center text-slate-500 text-sm">제출 내역이 없습니다</div>
            : submissions.slice(0, 10).map((r, i) => <CalcLogPanel key={r.id || i} record={r} />)
          }
        </div>
      )}

      {activeTab === 'notify' && (
        <NotificationCenter submissions={submissions} subActive={subActive} subPromoted={subPromoted} />
      )}

      {activeTab === 'admin' && <AdminPanel />}

      <AISalesManager submissions={submissions} gradeInfo={gradeInfo} subActive={subActive} />
    </div>
  );
}