/**
 * SalesLeaderboard — top sales, top growth, top active partners
 */
import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Zap, Medal } from 'lucide-react';
import { formatNumber } from './SOFQuantityCalc';
import { GRADE_CONFIG } from '@/services/partnerGradeService';

const TABS = [
  { id: 'sales',  label: '최고 판매',  icon: Trophy },
  { id: 'growth', label: '최고 성장',  icon: TrendingUp },
  { id: 'active', label: '최고 활성',  icon: Zap },
];

function RankRow({ rank, name, wallet, value, sublabel, grade, isMe }) {
  const gc = GRADE_CONFIG[grade];
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-[rgba(148,163,184,0.05)] last:border-0 ${isMe ? 'bg-[#00d4aa]/3 rounded-xl px-2 -mx-2' : ''}`}>
      <div className="w-7 flex-shrink-0 text-center">
        {rank <= 3
          ? <span className="text-base">{medals[rank - 1]}</span>
          : <span className="text-[10px] font-black text-slate-600">{rank}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold text-white truncate">{name || wallet?.slice(0, 10) + '...'}</p>
          {gc && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: gc.color, background: gc.bg }}>{gc.label}</span>}
          {isMe && <span className="text-[7px] font-black text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded-full">나</span>}
        </div>
        <p className="text-[8px] text-slate-600 font-mono">{wallet?.slice(0, 8)}...</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[11px] font-black text-white">{value}</p>
        <p className="text-[7px] text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}

export default function SalesLeaderboard({ submissions = [], subActive = [], walletAddress }) {
  const [tab, setTab] = useState('sales');

  const boards = useMemo(() => {
    // Group by partner_wallet
    const byWallet = {};
    submissions.forEach(r => {
      const w = r.partner_wallet;
      if (!w) return;
      if (!byWallet[w]) byWallet[w] = { wallet: w, name: r.partner_name || w.slice(0, 8), subs: [], usdt: 0, sof: 0, grade: r.partner_grade };
      byWallet[w].subs.push(r);
      byWallet[w].usdt += r.purchase_amount || 0;
      byWallet[w].sof  += r.sof_quantity || 0;
    });
    const all = Object.values(byWallet);

    // top sales
    const topSales = [...all].sort((a, b) => b.usdt - a.usdt).slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1, value: `$${formatNumber(p.usdt, 0)}`, sublabel: 'USDT' }));

    // top growth = most recent submissions count in last 7 days
    const cutoff = Date.now() - 7 * 86400000;
    const topGrowth = [...all]
      .map(p => ({ ...p, recent: p.subs.filter(r => r.submitted_at && new Date(r.submitted_at).getTime() > cutoff).length }))
      .sort((a, b) => b.recent - a.recent)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1, value: `${p.recent}건`, sublabel: '7일 내 제출' }));

    // top active = sub count + recent
    const topActive = [...subActive]
      .sort((a, b) => (b.accumulatedSalesKRW || 0) - (a.accumulatedSalesKRW || 0))
      .slice(0, 10)
      .map((p, i) => ({ ...p, wallet: p.walletAddress, rank: i + 1, value: `₩${formatNumber(p.accumulatedSalesKRW || 0, 0)}`, sublabel: '누적 매출' }));

    return { sales: topSales, growth: topGrowth, active: topActive };
  }, [submissions, subActive]);

  const list = boards[tab] || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <p className="text-sm font-bold text-white">영업 리더보드</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-2xl p-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-bold transition-all ${tab === t.id ? 'bg-amber-400/10 text-amber-400' : 'text-slate-500'}`}>
              <Icon className="w-3 h-3" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.05)]">
        {list.length === 0 ? (
          <div className="py-8 text-center">
            <Medal className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">데이터가 부족합니다</p>
          </div>
        ) : (
          list.map((item, i) => (
            <RankRow key={i}
              rank={item.rank}
              name={item.name || item.display_name}
              wallet={item.wallet || item.walletAddress}
              value={item.value}
              sublabel={item.sublabel}
              grade={item.grade}
              isMe={walletAddress && (item.wallet === walletAddress || item.walletAddress === walletAddress)}
            />
          ))
        )}
      </div>
    </div>
  );
}