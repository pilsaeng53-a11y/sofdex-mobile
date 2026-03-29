import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';
import ExportTools from './ExportTools';

const STATUS_CONFIG = {
  'Processing':       { label: '검토 중',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'Reviewing':        { label: '심사 중',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  'Approved':         { label: '승인',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  'Revision Needed':  { label: '수정 필요',  color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  'Rejected':         { label: '반려',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Processing'];
  return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function SubmissionRow({ record, expanded, onToggle }) {
  const sc = STATUS_CONFIG[record.status] || STATUS_CONFIG['Processing'];
  return (
    <div className="glass-card rounded-xl overflow-hidden mb-2">
      <button className="w-full p-3 text-left" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-white truncate">{record.customer_name || '—'}</p>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-[8px] text-slate-500 mt-0.5 font-mono truncate">{record.customer_wallet || '—'}</p>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <p className="text-[10px] font-bold text-[#00d4aa]">{formatNumber(record.purchase_amount || 0, 0)} USDT</p>
            <p className="text-[8px] text-slate-500">{record.submitted_at ? new Date(record.submitted_at).toLocaleDateString('ko-KR') : '—'}</p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[rgba(148,163,184,0.06)] space-y-2 pt-3">
          {/* Quantity breakdown */}
          <div className="bg-[#0a0e1a] rounded-lg p-3 space-y-1.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">수량 내역</p>
            <Row label="매입 금액 (USDT)" value={`${formatNumber(record.purchase_amount || 0, 2)} USDT`} />
            <Row label="SOF 단가" value={`$${formatNumber(record.sof_unit_price || 0, 4)}`} />
            <Row label="프로모션" value={`${record.promotion_percent || 0}%`} />
            <div className="border-t border-[rgba(148,163,184,0.08)] pt-1.5 mt-1.5">
              <Row label="기본 수량 (Base)" value={formatNumber((record.purchase_amount || 0) / (record.sof_unit_price || 1), 2)} color="#94a3b8" />
              <Row label="프로모션 적용 수량" value={formatNumber(record.sof_quantity || 0, 2)} color="#00d4aa" bold />
              {record.recommender_quantity != null && <Row label="추천인 수량" value={formatNumber(record.recommender_quantity, 2)} color="#a78bfa" />}
              {record.center_fee_quantity != null && <Row label="센터피 수량" value={formatNumber(record.center_fee_quantity, 2)} color="#fbbf24" />}
            </div>
          </div>
          {/* Meta */}
          <div className="flex items-center justify-between text-[8px] text-slate-500">
            <span>제출일: {record.submitted_at ? new Date(record.submitted_at).toLocaleString('ko-KR') : '—'}</span>
            {record.notes && <span className="text-slate-600 truncate ml-2">{record.notes}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color = '#e2e8f0', bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[8px] text-slate-500">{label}</span>
      <span className={`text-[9px] ${bold ? 'font-bold' : 'font-medium'}`} style={{ color }}>{value}</span>
    </div>
  );
}

const ALL_STATUSES = ['All', ...Object.keys(STATUS_CONFIG)];

export default function SubmissionHistoryTable({ records = [] }) {
  const [expanded,      setExpanded]      = useState(null);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [monthFilter,   setMonthFilter]   = useState('All');

  const months = useMemo(() => {
    const set = new Set(records.map(r => (r.submitted_at || '').slice(0, 7)).filter(Boolean));
    return ['All', ...[...set].sort().reverse()];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch = !search || (r.customer_name || '').toLowerCase().includes(search.toLowerCase()) || (r.customer_wallet || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchMonth  = monthFilter  === 'All' || (r.submitted_at || '').startsWith(monthFilter);
      return matchSearch && matchStatus && matchMonth;
    });
  }, [records, search, statusFilter, monthFilter]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="고객명 / 지갑 검색"
            className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 text-[8px] font-bold px-2.5 py-1 rounded-full transition-all ${statusFilter === s ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#0f1525] text-slate-500 border border-[rgba(148,163,184,0.08)]'}`}>
              {s === 'All' ? '전체' : (STATUS_CONFIG[s]?.label || s)}
            </button>
          ))}
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-2 text-[10px] text-slate-300">
          {months.map(m => <option key={m} value={m}>{m === 'All' ? '전체 기간' : m}</option>)}
        </select>
      </div>

      {/* Export */}
      <ExportTools records={filtered} />

      {/* Summary */}
      <p className="text-[8px] text-slate-500">{filtered.length}건 표시 / 전체 {records.length}건</p>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">조건에 맞는 제출 내역이 없습니다.</div>
      ) : (
        filtered.map((r, i) => (
          <SubmissionRow
            key={r.id || i}
            record={r}
            expanded={expanded === (r.id || i)}
            onToggle={() => setExpanded(expanded === (r.id || i) ? null : (r.id || i))}
          />
        ))
      )}
    </div>
  );
}