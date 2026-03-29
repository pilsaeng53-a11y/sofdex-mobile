import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, FileText, GitBranch, Plus, TrendingUp, Users, Bell, ChevronRight, Award, DollarSign, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useWallet } from './WalletContext';

const QUICK_ACTIONS = [
  { label: '매출 입력', sub: 'SOF 판매 등록', page: 'SOFSalesPartnerDashboard', icon: Plus, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  { label: '제출 내역', sub: '진행 중인 건 확인', page: 'MySubmissions', icon: FileText, color: '#00d4aa', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.2)' },
  { label: '하부 관리', sub: '조직 구조 관리', page: 'DownlineTree', icon: GitBranch, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
];

const STATUS_ITEMS = [
  { label: 'Processing', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Revision Needed', color: 'text-red-400', bg: 'bg-red-400/10' },
];

export default function SalesPartnerHome() {
  const { address } = useWallet();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const subs = await base44.entities.SOFSaleSubmission.filter(
          address ? { partner_wallet: address } : {}
        , '-submitted_at', 50);
        setSubmissions(subs);

        if (address) {
          const partners = await base44.entities.ApprovedSalesPartner.filter({ wallet_address: address });
          if (partners.length > 0) setPartnerData(partners[0]);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address]);

  // Compute stats
  const today = new Date().toDateString();
  const todaySales = submissions
    .filter(s => s.submitted_at && new Date(s.submitted_at).toDateString() === today)
    .reduce((acc, s) => acc + (s.purchase_amount || 0), 0);
  const totalSales = submissions.reduce((acc, s) => acc + (s.purchase_amount || 0), 0);
  const totalSOF = submissions.reduce((acc, s) => acc + (s.sof_quantity || 0), 0);
  const subCounts = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: '오늘 매출', value: `$${todaySales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingUp, color: '#f59e0b' },
    { label: '누적 매출', value: `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#00d4aa' },
    { label: '내 등급', value: partnerData?.display_name ? (partnerData.grade || 'N/A') : '—', icon: Award, color: '#8b5cf6' },
    { label: '총 제출 건', value: submissions.length, icon: BarChart3, color: '#3b82f6' },
  ];

  const recentSubs = submissions.slice(0, 5);

  return (
    <div className="min-h-screen pb-6" style={{ background: '#05070d' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">영업 파트너 홈</h1>
            <p className="text-[10px] text-slate-500">Sales Partner Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(15,21,37,0.8)', border: '1px solid rgba(148,163,184,0.08)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  <span className="text-[10px] text-slate-500 font-medium">{stat.label}</span>
                </div>
                {loading ? (
                  <div className="h-6 w-20 rounded-lg skeleton" />
                ) : (
                  <p className="text-xl font-black text-white">{stat.value}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">빠른 실행</p>
        <div className="space-y-2.5">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} to={createPageUrl(action.page)}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{ background: action.bg, border: `1px solid ${action.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${action.color}20`, border: `1px solid ${action.color}35` }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{action.label}</p>
                  <p className="text-[10px] text-slate-500">{action.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Submission Status Summary */}
      <div className="px-4 mb-5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">제출 현황</p>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(15,21,37,0.8)', border: '1px solid rgba(148,163,184,0.08)' }}>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-6 rounded skeleton" />)}
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-2">제출된 건이 없습니다</p>
          ) : (
            <div className="space-y-2.5">
              {STATUS_ITEMS.map(({ label, color, bg }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${bg} ${color}`}>{label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{subCounts[label] || 0}건</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {recentSubs.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">최근 제출 내역</p>
            <Link to={createPageUrl('MySubmissions')} className="text-[10px] text-[#00d4aa]">전체보기</Link>
          </div>
          <div className="space-y-2">
            {recentSubs.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(15,21,37,0.6)', border: '1px solid rgba(148,163,184,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{sub.customer_name || '고객'}</p>
                  <p className="text-[10px] text-slate-600">${(sub.purchase_amount || 0).toLocaleString()} · {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('ko-KR') : '—'}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ml-2 flex-shrink-0 ${
                  sub.status === 'Approved' ? 'bg-emerald-400/10 text-emerald-400'
                  : sub.status === 'Processing' ? 'bg-amber-400/10 text-amber-400'
                  : sub.status === 'Revision Needed' ? 'bg-red-400/10 text-red-400'
                  : 'bg-slate-400/10 text-slate-400'
                }`}>{sub.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partner Links */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2.5">
          <Link to={createPageUrl('PartnerHub')}
            className="flex items-center gap-2 p-3 rounded-xl transition-all"
            style={{ background: 'rgba(15,21,37,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">파트너 대시보드</span>
          </Link>
          <Link to={createPageUrl('Announcements')}
            className="flex items-center gap-2 p-3 rounded-xl transition-all"
            style={{ background: 'rgba(15,21,37,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">공지사항</span>
          </Link>
        </div>
      </div>
    </div>
  );
}