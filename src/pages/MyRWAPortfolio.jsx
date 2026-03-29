/**
 * MyRWAPortfolio — User's RWA participation portfolio tracker
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, TrendingUp, Clock, CheckCircle, Loader2, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useWallet } from '../components/shared/WalletContext';
import { useRWAWatchlist } from '../hooks/useRWAWatchlist';
import { getPropertyList } from '@/services/rwaPropertyService';

const STATUS_CONFIG = {
  pending:    { label: '대기 중',  color: '#f59e0b' },
  processing: { label: '처리 중',  color: '#3b82f6' },
  active:     { label: '진행 중',  color: '#00d4aa' },
  completed:  { label: '완료',     color: '#22c55e' },
  cancelled:  { label: '취소',     color: '#ef4444' },
};

export default function MyRWAPortfolio() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { watchlist, toggle: toggleWatch, isWatched } = useRWAWatchlist();
  const [participations, setParticipations] = useState([]);
  const [watchedAssets, setWatchedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('portfolio');

  useEffect(() => {
    Promise.all([
      base44.entities.RWAParticipation.list('-submittedAt', 50).catch(() => []),
      getPropertyList('published'),
    ]).then(([parts, props]) => {
      setParticipations(parts);
      const watched = props.filter(p => isWatched(p.id || p.sourcePropertyId));
      setWatchedAssets(watched);
      setLoading(false);
    });
  }, [watchlist]);

  const totalInvested = participations
    .filter(p => ['active', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + (p.investAmount || 0), 0);

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <p className="text-sm font-black text-white">내 RWA 자산</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="px-4 pt-4 grid grid-cols-2 gap-2.5 mb-5">
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-[9px] text-slate-500 mb-1">총 참여 자산</p>
              <p className="text-xl font-black text-white">{participations.length}</p>
              <p className="text-[9px] text-slate-600">건</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
              <p className="text-[9px] text-slate-500 mb-1">총 투자 금액</p>
              <p className="text-xl font-black text-[#00d4aa]">${totalInvested.toLocaleString()}</p>
              <p className="text-[9px] text-slate-600">USD</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 px-4 mb-4">
            {[['portfolio', '참여 자산'], ['watchlist', `관심 자산 (${watchlist.length})`]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                  tab === key
                    ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25'
                    : 'bg-[#151c2e] text-slate-500 border border-transparent'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Portfolio tab */}
          {tab === 'portfolio' && (
            <div className="px-4 space-y-3">
              {participations.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">아직 참여한 자산이 없습니다</p>
                  <p className="text-xs text-slate-600 mt-1">RWA 마켓에서 자산을 탐색해보세요</p>
                  <button onClick={() => navigate('/RealEstate')}
                    className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                    RWA 마켓 보기
                  </button>
                </div>
              ) : participations.map(p => {
                const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                return (
                  <div key={p.id} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.propertyTitle}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{new Date(p.submittedAt || p.created_date).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                        style={{ color: st.color, background: `${st.color}15` }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#0a0e1a] rounded-xl px-2.5 py-2">
                        <p className="text-[7px] text-slate-600 mb-0.5">투자 금액</p>
                        <p className="text-xs font-bold text-white">${(p.investAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-[#0a0e1a] rounded-xl px-2.5 py-2">
                        <p className="text-[7px] text-slate-600 mb-0.5">토큰 수량</p>
                        <p className="text-xs font-bold text-slate-300">{(p.tokenQty || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-[#0a0e1a] rounded-xl px-2.5 py-2">
                        <p className="text-[7px] text-slate-600 mb-0.5">예상 수익</p>
                        <p className="text-xs font-bold text-emerald-400">{p.expectedYield || '—'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Watchlist tab */}
          {tab === 'watchlist' && (
            <div className="px-4 space-y-3">
              {watchedAssets.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">관심 자산이 없습니다</p>
                  <p className="text-xs text-slate-600 mt-1">자산 카드의 ★ 버튼으로 추가하세요</p>
                </div>
              ) : watchedAssets.map(p => {
                const wid = p.id || p.sourcePropertyId;
                return (
                  <div key={wid} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.06)]">
                    <div className="flex items-center gap-3">
                      {p.featuredImage && (
                        <img src={p.featuredImage} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-slate-500">{p.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.targetIRR && <span className="text-[9px] text-emerald-400 font-bold">IRR {p.targetIRR}</span>}
                          {p.holdingPeriod && <span className="text-[9px] text-slate-500">{p.holdingPeriod}</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleWatch(wid)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(251,191,36,0.15)' }}>
                        <Star className="w-4 h-4 fill-current text-amber-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}