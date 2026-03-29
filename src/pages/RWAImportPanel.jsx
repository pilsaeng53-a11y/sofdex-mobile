/**
 * RWAImportPanel.jsx
 * Internal operator tool for ingesting, reviewing, and publishing external RWA assets.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Search, AlertTriangle, CheckCircle2, ExternalLink, Edit2, Archive, Send, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  getPropertyList, importExternalProperty, reviewImportedProperty,
  publishProperty, archiveProperty, getMissingFields,
  PLATFORM_CONFIG, CATEGORY_CONFIG, STATUS_CONFIG, SEEDED_PROPERTIES
} from '@/services/rwaPropertyService';

const EMPTY_FORM = {
  sourcePlatform: 'manual', sourceUrl: '', title: '', location: '', country: '', city: '',
  category: 'residential', subcategory: '', shortDescription: '', longDescription: '',
  featuredImage: '', minimumInvestment: '', currency: 'USD', targetIRR: '', targetCashYield: '',
  targetEquityMultiple: '', holdingPeriod: '', tokenPrice: '', occupancyNotes: '', managementNotes: '', riskNotes: '',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.imported;
  return <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>;
}

function MissingWarning({ fields }) {
  if (!fields?.length) return null;
  return (
    <div className="flex items-center gap-1.5 bg-amber-400/5 border border-amber-400/20 rounded-xl px-2.5 py-1.5">
      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
      <p className="text-[8px] text-amber-400">미입력: {fields.join(', ')}</p>
    </div>
  );
}

function PropertyReviewCard({ property, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const platform = PLATFORM_CONFIG[property.sourcePlatform] || PLATFORM_CONFIG.other;
  const missing = getMissingFields(property);

  return (
    <div className="bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full p-3 text-left flex items-start gap-3">
        {property.featuredImage
          ? <img src={property.featuredImage} alt="" className="w-14 h-12 rounded-xl object-cover flex-shrink-0" />
          : <div className="w-14 h-12 rounded-xl bg-[#151c2e] flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: platform.color, background: platform.bg }}>{platform.label}</span>
            <StatusBadge status={property.status} />
            {missing.length > 0 && <span className="text-[7px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">{missing.length} 미입력</span>}
          </div>
          <p className="text-[11px] font-bold text-white truncate">{property.title}</p>
          <p className="text-[9px] text-slate-500 truncate">{property.location}</p>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-[rgba(148,163,184,0.06)] pt-3">
          <MissingWarning fields={missing} />
          <p className="text-[10px] text-slate-400 leading-relaxed">{property.shortDescription}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
            {property.targetIRR && <div className="bg-[#0a0e1a] rounded-xl p-2"><p className="text-slate-500">IRR</p><p className="text-emerald-400 font-bold">{property.targetIRR}</p></div>}
            {property.minimumInvestment && <div className="bg-[#0a0e1a] rounded-xl p-2"><p className="text-slate-500">최소</p><p className="text-amber-400 font-bold">${Number(property.minimumInvestment).toLocaleString()}</p></div>}
            {property.holdingPeriod && <div className="bg-[#0a0e1a] rounded-xl p-2"><p className="text-slate-500">기간</p><p className="text-slate-300 font-bold">{property.holdingPeriod}</p></div>}
          </div>
          {property.sourceUrl && (
            <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[9px] text-slate-500 hover:text-[#00d4aa] transition-colors">
              <ExternalLink className="w-3 h-3" /> {property.sourceUrl.slice(0, 50)}…
            </a>
          )}
          {/* Action buttons */}
          {!property.id?.startsWith?.('seed') && (
            <div className="flex gap-2 pt-1">
              {property.status === 'imported' && (
                <button onClick={() => onAction('review', property.id)} className="flex-1 py-2 rounded-xl text-[9px] font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-all">검수 등록</button>
              )}
              {(property.status === 'review' || property.status === 'imported') && (
                <button onClick={() => onAction('publish', property.id)} className="flex-1 py-2 rounded-xl text-[9px] font-bold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 transition-all">게시 승인</button>
              )}
              {property.status !== 'archived' && (
                <button onClick={() => onAction('archive', property.id)} className="w-8 rounded-xl text-[9px] text-slate-500 bg-[#151c2e] hover:bg-red-400/10 hover:text-red-400 transition-all flex items-center justify-center">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {property.id?.startsWith?.('seed') && (
            <p className="text-[8px] text-slate-600 text-center">시드 데이터 — DB 연결 후 편집 가능</p>
          )}
        </div>
      )}
    </div>
  );
}

function ImportForm({ onImported }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const Field = ({ label, field, placeholder, type = 'text', rows }) => (
    <div>
      <p className="text-[9px] text-slate-500 mb-1">{label}</p>
      {rows ? (
        <textarea value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} rows={rows}
          className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none" />
      ) : (
        <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
          className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none" />
      )}
    </div>
  );

  const SelectField = ({ label, field, options }) => (
    <div>
      <p className="text-[9px] text-slate-500 mb-1">{label}</p>
      <select value={form[field]} onChange={e => set(field, e.target.value)}
        className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
        {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
      </select>
    </div>
  );

  const handleSave = async (targetStatus) => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await importExternalProperty({
        ...form,
        minimumInvestment: form.minimumInvestment ? Number(form.minimumInvestment) : undefined,
        tokenPrice: form.tokenPrice ? Number(form.tokenPrice) : undefined,
        status: targetStatus,
      });
      setDone(true);
      setTimeout(() => { setDone(false); setForm(EMPTY_FORM); onImported?.(); }, 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (done) return (
    <div className="flex flex-col items-center py-8 gap-3">
      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      <p className="text-sm font-bold text-emerald-400">저장되었습니다</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="소스 플랫폼" field="sourcePlatform" options={[['redswan','RedSwan'],['stake','Stake'],['manual','Manual'],['other','Other']]} />
        <SelectField label="카테고리" field="category" options={[['hospitality','Hospitality'],['residential','Residential'],['commercial','Commercial'],['mixed-use','Mixed-Use'],['land','Land']]} />
      </div>
      <Field label="소스 URL" field="sourceUrl" placeholder="https://..." />
      <Field label="자산 이름 *" field="title" placeholder="The Carmen Hotel" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="국가" field="country" placeholder="Mexico" />
        <Field label="도시" field="city" placeholder="Playa del Carmen" />
      </div>
      <Field label="위치 (전체)" field="location" placeholder="Playa del Carmen, Mexico" />
      <Field label="서브카테고리" field="subcategory" placeholder="Boutique Hotel" />
      <Field label="짧은 설명" field="shortDescription" placeholder="요약 설명..." rows={2} />
      <Field label="상세 설명" field="longDescription" placeholder="자세한 설명..." rows={4} />
      <Field label="대표 이미지 URL" field="featuredImage" placeholder="https://images.unsplash.com/..." />
      <div className="grid grid-cols-2 gap-3">
        <Field label="최소 투자 (USD)" field="minimumInvestment" type="number" placeholder="5000" />
        <Field label="토큰 가격 (USD)" field="tokenPrice" type="number" placeholder="1000" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Target IRR" field="targetIRR" placeholder="14–18%" />
        <Field label="Cash Yield" field="targetCashYield" placeholder="8–10%" />
        <Field label="Equity Multiple" field="targetEquityMultiple" placeholder="1.8x" />
        <Field label="보유 기간" field="holdingPeriod" placeholder="5 years" />
      </div>
      <Field label="운영 정보" field="occupancyNotes" placeholder="입주율, 운영 특이사항..." rows={2} />
      <Field label="리스크" field="riskNotes" placeholder="주요 리스크..." rows={2} />

      <div className="flex gap-2 pt-2">
        <button onClick={() => handleSave('imported')} disabled={saving || !form.title}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-[#151c2e] border border-[rgba(148,163,184,0.1)] disabled:opacity-40">
          초안으로 저장
        </button>
        <button onClick={() => handleSave('review')} disabled={saving || !form.title}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 disabled:opacity-40">
          검수 등록
        </button>
        <button onClick={() => handleSave('published')} disabled={saving || !form.title}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 disabled:opacity-40 flex items-center justify-center gap-1">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          게시 승인
        </button>
      </div>
    </div>
  );
}

export default function RWAImportPanel() {
  const [tab, setTab] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getPropertyList();
    setProperties(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, id) => {
    if (action === 'review') await reviewImportedProperty(id);
    if (action === 'publish') await publishProperty(id);
    if (action === 'archive') await archiveProperty(id);
    load();
  };

  const filtered = properties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { all: properties.length, imported: 0, review: 0, approved: 0, published: 0, archived: 0 };
  properties.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
        <h1 className="text-lg font-black text-white">RWA 자산 관리</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">외부 플랫폼 자산 가져오기 · 검수 · 게시</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-none">
        {[['list','자산 목록'],['import','새 자산 가져오기']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${tab === id ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20' : 'bg-[#151c2e] text-slate-500 border border-transparent'}`}>
            {label}
          </button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#00d4aa] transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 pt-2">
        {tab === 'import' && (
          <div className="space-y-4">
            <div className="bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] p-4">
              <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider mb-3">새 자산 가져오기</p>
              <ImportForm onImported={() => { load(); setTab('list'); }} />
            </div>
          </div>
        )}

        {tab === 'list' && (
          <div className="space-y-4">
            {/* Status filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {[['all','전체'], ['imported','가져옴'], ['review','검수 중'], ['approved','승인됨'], ['published','게시됨'], ['archived','보관됨']].map(([s, l]) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 text-[8px] font-bold px-2.5 py-1.5 rounded-full transition-all ${statusFilter === s ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30' : 'bg-[#0f1525] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
                  {l} ({counts[s] || 0})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="자산명 / 위치 검색"
                className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-8">자산 없음</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((p, i) => (
                  <PropertyReviewCard key={p.id || i} property={p} onAction={handleAction} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}