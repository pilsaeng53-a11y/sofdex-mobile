/**
 * TargetSystem.jsx — Monthly target + progress bar
 */
import React, { useState, useEffect } from 'react';
import { Target, Edit2, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TargetSystem({ walletAddress }) {
  const [target, setTarget] = useState(0);
  const [achieved, setAchieved] = useState(0);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [activityId, setActivityId] = useState(null);

  useEffect(() => {
    if (!walletAddress) return;
    const load = async () => {
      try {
        const now = new Date().toISOString().slice(0, 7);
        const [activities, submissions] = await Promise.all([
          base44.entities.PartnerActivity.filter({ partner_wallet: walletAddress }),
          base44.entities.SOFSaleSubmission.filter({ partner_wallet: walletAddress }),
        ]);

        if (activities.length > 0) {
          setTarget(activities[0].monthly_target_usdt || 0);
          setActivityId(activities[0].id);
        }

        const monthSales = submissions
          .filter(r => (r.submitted_at || '').startsWith(now))
          .reduce((sum, r) => sum + (r.purchase_amount || 0), 0);
        setAchieved(monthSales);
      } catch { /* ignore */ }
    };
    load();
  }, [walletAddress]);

  const saveTarget = async () => {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) return;
    try {
      if (activityId) {
        await base44.entities.PartnerActivity.update(activityId, { monthly_target_usdt: val });
      } else {
        const created = await base44.entities.PartnerActivity.create({ partner_wallet: walletAddress, monthly_target_usdt: val });
        setActivityId(created.id);
      }
      setTarget(val);
      setEditing(false);
    } catch { /* ignore */ }
  };

  const pct = target > 0 ? Math.min(100, (achieved / target) * 100) : 0;
  const remaining = Math.max(0, target - achieved);
  const color = pct >= 100 ? '#22c55e' : pct >= 70 ? '#00d4aa' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">월간 목표</span>
        </div>
        {!editing && (
          <button onClick={() => { setInputVal(String(target)); setEditing(true); }}
            className="text-[9px] text-slate-500 hover:text-[#00d4aa] flex items-center gap-1 transition-colors">
            <Edit2 className="w-3 h-3" /> 설정
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number" placeholder="목표 USDT"
            className="flex-1 bg-[#0a0e1a] border border-[#00d4aa]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
          <button onClick={saveTarget} className="w-8 h-8 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-[#00d4aa]" />
          </button>
          <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      ) : target === 0 ? (
        <button onClick={() => { setInputVal(''); setEditing(true); }}
          className="w-full py-2.5 rounded-xl text-xs text-slate-500 bg-[#0a0e1a] border border-dashed border-[rgba(148,163,184,0.15)] hover:border-[#00d4aa]/30 hover:text-[#00d4aa] transition-all">
          + 월간 목표 설정
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] text-slate-500">달성</p>
              <p className="text-base font-black" style={{ color }}>${achieved.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500">목표</p>
              <p className="text-sm font-bold text-slate-300">${target.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-[#0a0e1a] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-500">
            <span>{pct.toFixed(1)}% 달성</span>
            <span>{pct < 100 ? `남은 금액: $${remaining.toLocaleString()}` : '🎉 목표 달성!'}</span>
          </div>
        </div>
      )}
    </div>
  );
}