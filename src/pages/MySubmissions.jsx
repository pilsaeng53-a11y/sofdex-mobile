import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/shared/WalletContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Clock, CheckCircle2, XCircle, FileText, Wallet, Plus,
  Search, Filter, Building2, Palette, Package, BarChart2,
  TrendingUp, Layers, Coins, Zap, ChevronRight, RefreshCw,
  Calendar, Tag, AlertCircle
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Processing: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    glow: 'shadow-amber-500/10',
    label: '심사 중',
    dot: 'bg-amber-400',
  },
  Approved: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    glow: 'shadow-emerald-500/10',
    label: '승인됨',
    dot: 'bg-emerald-400',
  },
  Rejected: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    glow: 'shadow-red-500/10',
    label: '반려됨',
    dot: 'bg-red-400',
  },
};

// ─── Category Icons ───────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Real Estate': { icon: Building2, color: '#8b5cf6' },
  'Art / Collectibles': { icon: Palette, color: '#ec4899' },
  'Commodities': { icon: Package, color: '#f59e0b' },
  'Equity': { icon: BarChart2, color: '#3b82f6' },
  'Yield': { icon: TrendingUp, color: '#22c55e' },
  'Alternative Assets': { icon: Layers, color: '#a78bfa' },
  'Coin': { icon: Coins, color: '#f59e0b' },
  'Token': { icon: Zap, color: '#3b82f6' },
};

const FILTER_OPTIONS = ['전체', '심사 중', '승인됨', '반려됨'];
const STATUS_MAP = { '전체': null, '심사 중': 'Processing', '승인됨': 'Approved', '반려됨': 'Rejected' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAssetTitle(sub) {
  return sub.fields?.token_name || sub.fields?.coin_name || sub.fields?.company_name ||
    sub.fields?.artwork_name || sub.fields?.alt_type || sub.fields?.commodity_type ||
    sub.rwa_subcategory || sub.asset_class || '자산';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Submission Card ──────────────────────────────────────────────────────────
function SubmissionCard({ sub }) {
  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.Processing;
  const StatusIcon = cfg.icon;
  const catKey = sub.rwa_subcategory || sub.asset_class || '';
  const catCfg = CATEGORY_ICONS[catKey] || { icon: FileText, color: '#94a3b8' };
  const CatIcon = catCfg.icon;
  const title = getAssetTitle(sub);
  const subLabel = sub.rwa_subcategory ? `RWA · ${sub.rwa_subcategory}` : sub.asset_class || '—';

  return (
    <div className="glass-card rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden hover:border-[rgba(148,163,184,0.14)] transition-all duration-200">
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${catCfg.color}60, transparent)` }} />

      <div className="p-4">
        {/* Row 1: Icon + Title + Status */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${catCfg.color}18`, border: `1px solid ${catCfg.color}30` }}>
            <CatIcon className="w-5 h-5" style={{ color: catCfg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">{title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{subLabel}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${cfg.bg} ${cfg.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Row 2: Meta info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(sub.submitted_at)}
          </div>
          {sub.fields?.estimated_value && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Tag className="w-3 h-3" />
              ${Number(sub.fields.estimated_value).toLocaleString()}
            </div>
          )}
        </div>

        {/* Status message */}
        {sub.status === 'Processing' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-[10px] text-amber-400/80">심사 팀이 검토 중입니다. 3–5 영업일 내 연락드립니다.</p>
          </div>
        )}
        {sub.status === 'Approved' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-[10px] text-emerald-400/80">자산이 승인되었습니다. 팀에서 상장 절차를 진행합니다.</p>
          </div>
        )}
        {sub.status === 'Rejected' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/15">
            <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <p className="text-[10px] text-red-400/80">{sub.notes || '현재 등록 기준에 부합하지 않습니다. 추가 서류 보완 후 재신청 가능합니다.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ submissions }) {
  const total = submissions.length;
  const processing = submissions.filter(s => s.status === 'Processing').length;
  const approved = submissions.filter(s => s.status === 'Approved').length;
  const rejected = submissions.filter(s => s.status === 'Rejected').length;

  return (
    <div className="grid grid-cols-4 gap-2 px-4 mb-5">
      {[
        { label: '전체', value: total, color: '#94a3b8' },
        { label: '심사 중', value: processing, color: '#f59e0b' },
        { label: '승인됨', value: approved, color: '#22c55e' },
        { label: '반려됨', value: rejected, color: '#ef4444' },
      ].map(s => (
        <div key={s.label} className="glass-card rounded-xl p-3 border border-[rgba(148,163,184,0.06)] text-center">
          <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MySubmissions() {
  const { isConnected, address, requireWallet } = useWallet();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    base44.entities.AssetRegistration.filter({ wallet_address: address })
      .then(data => setSubmissions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isConnected, address, refreshKey]);

  const filtered = submissions.filter(s => {
    const statusMatch = activeFilter === '전체' || s.status === STATUS_MAP[activeFilter];
    const title = getAssetTitle(s).toLowerCase();
    const searchMatch = !searchQuery || title.includes(searchQuery.toLowerCase()) ||
      (s.asset_class || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rwa_subcategory || '').toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  // ── Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <div className="px-4 pt-5 pb-4">
          <h1 className="text-xl font-black text-white">내 신청 내역</h1>
          <p className="text-xs text-slate-500 mt-0.5">자산 등록 신청 현황을 관리하세요</p>
        </div>
        <div className="px-4 mt-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-10 h-10 text-[#8b5cf6]" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">지갑 연결 필요</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">신청 내역을 확인하려면 지갑을 연결해 주세요.</p>
          <button
            onClick={() => requireWallet()}
            className="px-7 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
          >
            지갑 연결
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">내 신청 내역</h1>
            <p className="text-xs text-slate-500 mt-0.5">자산 등록 신청 현황을 관리하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="w-8 h-8 rounded-xl bg-[#151c2e] border border-[rgba(148,163,184,0.08)] flex items-center justify-center hover:border-[#00d4aa]/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Link
              to={createPageUrl('AssetOnboarding')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              신청하기
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-7 h-7 spin-glow" />
        </div>
      ) : submissions.length === 0 ? (
        /* ── Empty State */
        <div className="px-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 mb-6">
            <FileText className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#8b5cf6] mb-0.5">신청 내역 관리</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">등록 신청한 자산 목록이 이곳에 표시됩니다. 심사 진행 상황을 실시간으로 확인하세요.</p>
            </div>
          </div>

          {/* Empty illustration */}
          <div className="text-center mt-8">
            <div className="w-20 h-20 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] flex items-center justify-center mx-auto mb-4"
              style={{ boxShadow: 'inset 0 0 30px rgba(139,92,246,0.04)' }}>
              <FileText className="w-10 h-10 text-slate-700" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">아직 신청 내역이 없습니다</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              첫 번째 자산을 SolFort Foundation에 등록해 보세요.<br />부동산, 예술품, 상품, 주식 등 다양한 자산을 신청할 수 있습니다.
            </p>
            <Link
              to={createPageUrl('AssetOnboarding')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              <Plus className="w-4 h-4" />
              내 자산 등록 신청
            </Link>
          </div>

          {/* Process guide */}
          <div className="mt-10 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-1 mb-3">신청 프로세스</p>
            {[
              { step: '01', title: '자산 정보 입력', desc: '자산 유형, 카테고리, 세부 정보를 입력합니다', color: '#8b5cf6' },
              { step: '02', title: '재단 심사', desc: '3–5 영업일 이내 전문 심사팀이 검토합니다', color: '#3b82f6' },
              { step: '03', title: '승인 및 상장', desc: '승인 후 SolFort RWA 마켓에 자산이 등록됩니다', color: '#00d4aa' },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-4 p-3.5 rounded-xl glass-card border border-[rgba(148,163,184,0.06)]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                  style={{ background: `${item.color}18`, color: item.color }}>
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Has submissions */
        <div>
          <StatsRow submissions={submissions} />

          {/* Search */}
          <div className="px-4 mb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="자산명 또는 유형으로 검색..."
                className="w-full bg-[#0d1220] border border-[rgba(148,163,184,0.1)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6]/30 transition-colors"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-4 mb-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    activeFilter === f
                      ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'
                      : 'bg-[#151c2e] text-slate-500 border border-[rgba(148,163,184,0.06)] hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="px-4 pb-8 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <Filter className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">해당 조건의 신청 내역이 없습니다</p>
              </div>
            ) : (
              filtered.map(s => <SubmissionCard key={s.id} sub={s} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}