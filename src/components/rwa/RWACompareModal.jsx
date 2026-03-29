/**
 * RWACompareModal — Side-by-side comparison of up to 3 RWA properties
 */
import React from 'react';
import { X, MapPin, TrendingUp, Clock, DollarSign } from 'lucide-react';

function Cell({ value, highlight }) {
  return (
    <td className={`px-3 py-2.5 text-[11px] text-center border-b border-[rgba(148,163,184,0.05)] ${highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
      {value || '—'}
    </td>
  );
}

export default function RWACompareModal({ properties, onClose }) {
  if (!properties || properties.length === 0) return null;

  const rows = [
    { label: '위치', key: 'location', icon: MapPin },
    { label: '카테고리', key: 'category' },
    { label: '최소 투자', key: 'minimumInvestment', fmt: v => v ? `$${v.toLocaleString()}` : '—' },
    { label: 'Target IRR', key: 'targetIRR', highlight: true },
    { label: 'Cash Yield', key: 'targetCashYield', highlight: true },
    { label: '보유 기간', key: 'holdingPeriod' },
    { label: 'Equity Multiple', key: 'targetEquityMultiple' },
    { label: '토큰 가격', key: 'tokenPrice', fmt: v => v ? `$${v.toLocaleString()}` : '—' },
    { label: '통화', key: 'currency' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ background: '#0f1525', border: '1px solid rgba(139,92,246,0.2)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.06)]">
          <p className="text-sm font-black text-white">자산 비교</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="overflow-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-3 text-[9px] font-black text-slate-500 uppercase text-left w-24">항목</th>
                {properties.map(p => (
                  <th key={p.id || p.symbol} className="px-3 py-3 text-center">
                    <p className="text-[10px] font-bold text-white leading-snug line-clamp-2">{p.title || p.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{p.city || p.country}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="hover:bg-[rgba(148,163,184,0.02)]">
                  <td className="px-3 py-2.5 text-[10px] text-slate-500 border-b border-[rgba(148,163,184,0.05)]">{row.label}</td>
                  {properties.map(p => (
                    <Cell
                      key={p.id || p.symbol}
                      value={row.fmt ? row.fmt(p[row.key]) : (p[row.key] || p.subcategory || '—')}
                      highlight={row.highlight}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-4 text-center">
            <p className="text-[9px] text-slate-600">※ 본 비교는 참고용이며 투자 결정의 근거로 사용할 수 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}