import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';

const STATUS_STYLES = {
  Processing: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  Approved:   'bg-green-500/10 text-green-400 border border-green-500/20',
  Rejected:   'bg-red-500/10 text-red-400 border border-red-500/20',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.Processing}`}>
      {status}
    </span>
  );
}

export default function CustomerTable({ records, periodFilter, onPeriodFilterChange }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('submitted_at');
  const [sortDir, setSortDir] = useState('desc');

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];

    // Period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      data = data.filter(r => {
        const d = new Date(r.submitted_at || r.created_date);
        if (periodFilter === 'daily') return d.toDateString() === now.toDateString();
        if (periodFilter === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (periodFilter === 'yearly') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(r =>
        r.customer_name?.toLowerCase().includes(q) ||
        r.customer_wallet?.toLowerCase().includes(q)
      );
    }

    // Sort
    data.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [records, periodFilter, search, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00d4aa]" /> : <ChevronDown className="w-3 h-3 text-[#00d4aa]" />;
  };

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalAmount = filtered.reduce((s, r) => s + (r.purchase_amount || 0), 0);
  const totalSOF = filtered.reduce((s, r) => s + (r.sof_quantity || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search + Period Filter */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name or wallet…"
            className="w-full bg-[#0f1525] border border-[rgba(148,163,184,0.1)] rounded-xl pl-8 pr-8 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-[#0f1525] rounded-xl p-1">
          {['all', 'daily', 'monthly', 'yearly'].map(p => (
            <button key={p}
              onClick={() => onPeriodFilterChange(p)}
              className={`flex-1 py-1.5 text-[9px] font-bold capitalize rounded-lg transition-all ${
                periodFilter === p ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-[8px] text-slate-500 uppercase">Records</p>
            <p className="text-base font-bold text-white">{filtered.length}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-[8px] text-slate-500 uppercase">Total USDT</p>
            <p className="text-base font-bold text-[#00d4aa]">${formatNumber(totalAmount, 0)}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-[8px] text-slate-500 uppercase">Total SOF</p>
            <p className="text-base font-bold text-[#8b5cf6]">{formatNumber(totalSOF, 2)}</p>
          </div>
        </div>
      )}

      {/* Table — mobile card layout */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500">
          {search ? `No results for "${search}"` : 'No submissions found for this period.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="glass-card rounded-xl p-4 space-y-3">
              {/* Row header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{r.customer_name}</p>
                  <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5">{r.customer_wallet}</p>
                </div>
                <StatusBadge status={r.status || 'Processing'} />
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-3 gap-2 text-[9px]">
                <div>
                  <p className="text-slate-500">Purchase</p>
                  <p className="font-bold text-white">${formatNumber(r.purchase_amount, 0)} USDT</p>
                </div>
                <div>
                  <p className="text-slate-500">SOF Price</p>
                  <p className="font-bold text-slate-200">${formatNumber(r.sof_unit_price, 4)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Promo</p>
                  <p className="font-bold text-[#f59e0b]">{r.promotion_percent ?? 0}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[rgba(148,163,184,0.06)] pt-2">
                <div>
                  <p className="text-[8px] text-slate-500">SOF Quantity</p>
                  <p className="text-sm font-bold text-[#00d4aa]">{formatNumber(r.sof_quantity, 4)} SOF</p>
                </div>
                <p className="text-[8px] text-slate-600">
                  {new Date(r.submitted_at || r.created_date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}