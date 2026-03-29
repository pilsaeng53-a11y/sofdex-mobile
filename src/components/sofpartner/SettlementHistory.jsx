/**
 * SettlementHistory — 지급 내역 (지급일, SOF 수량, 출처, 상태)
 */
import React, { useState, useMemo } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

const SOURCE_LABELS = {
  self: '본인 판매',
  subordinate: '하위 파트너',
  recommender: '추천인',
};

const STATUS_CONFIG = {
  Approved:  { color: '#22c55e', icon: CheckCircle, label: '확정' },
  Processing:{ color: '#f59e0b', icon: Clock,       label: '검토 중' },
  Reviewing: { color: '#3b82f6', icon: Clock,       label: '심사 중' },
  Rejected:  { color: '#ef4444', icon: XCircle,     label: '반려' },
};

function SettlementRow({ record }) {
  const sc = STATUS_CONFIG[record.status] || STATUS_CONFIG.Processing;
  const Icon = sc.icon;
  const source = record.source || 'self';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${sc.color}14` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: sc.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[10px] font-bold text-white truncate">{record.customer_name || '고객'}</p>
          <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-[#151c2e] text-slate-400">
            {SOURCE_LABELS[source]}
          </span>
        </div>
        <p className="text-[8px] text-slate-500">
          {record.submitted_at ? new Date(record.submitted_at).toLocaleDateString('ko-KR') : '—'}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[10px] font-black text-[#00d4aa]">
          +{formatNumber(record.center_fee_quantity || 0, 1)} SOF
        </p>
        <span className="text-[7px] font-bold" style={{ color: sc.color }}>{sc.label}</span>
      </div>
    </div>
  );
}

export default function SettlementHistory({ submissions = [] }) {
  const [filter, setFilter] = useState('all');

  const records = useMemo(() => {
    return submissions
      .filter(r => r.center_fee_quantity > 0)
      .filter(r => filter === 'all' || r.status === filter)
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .slice(0, 50);
  }, [submissions, filter]);

  const totalConfirmed = useMemo(() =>
    submissions.filter(r => r.status === 'Approved').reduce((s, r) => s + (r.center_fee_quantity || 0), 0),
  [submissions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-[#00d4aa]" />
        <p className="text-sm font-bold text-white">정산 내역</p>
        <span className="ml-auto text-[9px] text-[#00d4aa] font-black">총 확정: {formatNumber(totalConfirmed, 1)} SOF</span>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {[['all', '전체'], ['Approved', '확정'], ['Processing', '검토중'], ['Rejected', '반려']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
              filter === v
                ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                : 'bg-[#151c2e] text-slate-500 border border-transparent'
            }`}>
            {l}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
        {records.length === 0 ? (
          <div className="py-8 text-center">
            <DollarSign className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">정산 내역이 없습니다</p>
          </div>
        ) : (
          records.map((r, i) => <SettlementRow key={r.id || i} record={r} />)
        )}
      </div>
    </div>
  );
}