import React, { useState, useEffect } from 'react';
import { Search, Edit2, Check, X, Shield, Users, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { GRADE_CONFIG } from '@/services/partnerGradeService';
import { formatNumber } from './SOFQuantityCalc';

function GradePill({ grade }) {
  const gc = GRADE_CONFIG[grade];
  if (!gc) return <span className="text-[8px] text-slate-500">—</span>;
  return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ color: gc.color, background: gc.bg }}>
      {gc.label}
    </span>
  );
}

function PartnerRow({ partner, submissions, onGradeEdit }) {
  const [editing, setEditing] = useState(false);
  const [grade, setGrade] = useState(partner.grade || 'GREEN');
  const [promotion, setPromotion] = useState(partner.promotion_percent || 80);
  const [saving, setSaving] = useState(false);

  const partnerSubs = submissions.filter(s => s.partner_wallet === partner.wallet_address);
  const totalUSDT = partnerSubs.reduce((s, r) => s + (r.purchase_amount || 0), 0);

  async function save() {
    setSaving(true);
    try {
      await base44.entities.ApprovedSalesPartner.update(partner.id, {
        grade,
        promotion_percent: promotion,
        notes: `Grade updated by admin on ${new Date().toISOString()}`,
      });
      onGradeEdit();
      setEditing(false);
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-bold text-white">{partner.display_name || '파트너'}</p>
            <GradePill grade={partner.grade} />
            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${partner.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {partner.status === 'active' ? '활성' : '정지'}
            </span>
          </div>
          <p className="text-[8px] text-slate-500 font-mono mt-0.5">{partner.wallet_address}</p>
        </div>
        <button onClick={() => setEditing(v => !v)} className="p-1.5 rounded-lg hover:bg-[rgba(148,163,184,0.08)]">
          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-[#0a0e1a] rounded-lg p-2">
        <div><p className="text-[8px] text-slate-500">제출</p><p className="text-sm font-bold text-white">{partnerSubs.length}</p></div>
        <div><p className="text-[8px] text-slate-500">판매 USDT</p><p className="text-[10px] font-bold text-[#00d4aa]">${formatNumber(totalUSDT, 0)}</p></div>
        <div><p className="text-[8px] text-slate-500">프로모션</p><p className="text-sm font-bold text-amber-400">{partner.promotion_percent || '—'}%</p></div>
      </div>

      {editing && (
        <div className="space-y-2 pt-2 border-t border-[rgba(148,163,184,0.08)]">
          <div>
            <label className="text-[8px] font-bold text-slate-400 uppercase">등급 변경</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full mt-1 bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white">
              {Object.keys(GRADE_CONFIG).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[8px] font-bold text-slate-400 uppercase">프로모션 % 수동 설정</label>
            <input type="number" value={promotion} onChange={e => setPromotion(Number(e.target.value))}
              className="w-full mt-1 bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-bold bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30">
              <Check className="w-3 h-3" />{saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
              <X className="w-3 h-3" />취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [checking, setChecking]     = useState(true);
  const [partners, setPartners]     = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [activeView, setActiveView] = useState('partners');

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAdmin(user?.role === 'admin');
      setChecking(false);
      if (user?.role === 'admin') loadData();
    }).catch(() => setChecking(false));
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        base44.entities.ApprovedSalesPartner.list('-approved_at', 200),
        base44.entities.SOFSaleSubmission.list('-submitted_at', 500),
      ]);
      setPartners(p);
      setSubmissions(s);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  if (checking) return <div className="py-10 flex justify-center"><div className="w-5 h-5 spin-glow" /></div>;

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl p-8 text-center space-y-3">
        <Shield className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm font-bold text-slate-400">관리자 전용</p>
        <p className="text-[10px] text-slate-600">이 기능은 admin 계정에서만 접근 가능합니다</p>
      </div>
    );
  }

  const filteredPartners = partners.filter(p =>
    !search || (p.wallet_address || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Submission stats
  const byStatus = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-amber-400" />
        <p className="text-sm font-bold text-white">관리자 패널</p>
        <span className="text-[7px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
      </div>

      {/* View switcher */}
      <div className="flex gap-1 glass-card rounded-xl p-1">
        {[['partners', '파트너 목록', Users], ['submissions', '제출 현황', FileText]].map(([v, l, Ic]) => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-bold transition-all ${activeView === v ? 'bg-amber-400/10 text-amber-400' : 'text-slate-500'}`}>
            <Ic className="w-3 h-3" />{l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 flex justify-center"><div className="w-5 h-5 spin-glow" /></div>
      ) : activeView === 'partners' ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="지갑 / 이름 검색"
              className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40" />
          </div>
          <p className="text-[8px] text-slate-500">{filteredPartners.length}명의 파트너</p>
          {filteredPartners.map(p => (
            <PartnerRow key={p.id} partner={p} submissions={submissions} onGradeEdit={loadData} />
          ))}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="glass-card rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-500 mb-1">{status}</p>
                <p className="text-xl font-bold text-white">{count}</p>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-slate-500">총 {submissions.length}건 제출</p>
          <div className="text-center text-[10px] text-slate-500 py-4">
            상세 제출 내역은 제출 기록 탭에서 확인하세요
          </div>
        </>
      )}
    </div>
  );
}