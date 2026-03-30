import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, FileText, RefreshCw, Plus, X, Eye, Building2, DollarSign } from 'lucide-react';

const STATUS_COLORS = {
  pending_review: '#f59e0b',
  active:         '#22c55e',
  paused:         '#64748b',
  sold:           '#8b5cf6',
  rejected:       '#ef4444',
};

const STATUS_KO = {
  pending_review: '검토 중',
  active:         '거래 가능',
  paused:         '일시 중단',
  sold:           '거래 완료',
  rejected:       '거절됨',
};

export default function MyOTCListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    base44.entities.P2PRWAListing.list('-listed_at', 50)
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  async function cancelListing(id) {
    await base44.entities.P2PRWAListing.update(id, { status: 'paused' });
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'paused' } : l));
  }

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#05070d' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link to="/OTCOverview">
            <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
          </Link>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">장외거래</p>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3b82f6]" /> 내 등록 자산
            </h1>
          </div>
        </div>
        <Link to="/P2PRWAExchange">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-[#3b82f6]"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Plus className="w-3.5 h-3.5" /> 자산 등록
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> 불러오는 중...
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">등록된 자산이 없습니다</p>
          <p className="text-[11px] text-slate-600">장외거래에 등록한 자산이 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 px-2">
            {['자산', '수량 / 가격', '상태', '관리'].map(h => (
              <p key={h} className="text-[8px] text-slate-600 uppercase tracking-wider font-bold">{h}</p>
            ))}
          </div>

          {listings.map(listing => {
            const color = STATUS_COLORS[listing.status] || '#94a3b8';
            return (
              <div key={listing.id} className="rounded-2xl overflow-hidden" style={{ background: '#0d1220', border: `1px solid ${color}12` }}>
                <div className="grid grid-cols-4 gap-2 items-center p-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {listing.asset_type === 'gold'
                      ? <DollarSign className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                      : <Building2 className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />}
                    <p className="text-[10px] font-black text-white truncate">{listing.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">{listing.quantity_available}개</p>
                    <p className="text-[9px] text-slate-500">${listing.asking_price_usdt?.toLocaleString()}</p>
                  </div>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full inline-block text-center"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                    {STATUS_KO[listing.status] || listing.status}
                  </span>
                  <div className="flex gap-1.5">
                    <Link to="/RealEstateP2P">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <Eye className="w-3 h-3 text-[#3b82f6]" />
                      </button>
                    </Link>
                    {listing.status !== 'paused' && listing.status !== 'sold' && (
                      <button onClick={() => cancelListing(listing.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-3.5 pb-2.5 flex items-center justify-between">
                  <p className="text-[8px] text-slate-600">
                    등록일: {listing.listed_at ? new Date(listing.listed_at).toLocaleDateString('ko-KR') : '—'}
                  </p>
                  <p className="text-[8px] text-slate-600">{listing.category || (listing.asset_type === 'gold' ? '금 실물' : '부동산')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}