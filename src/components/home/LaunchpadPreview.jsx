import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket, Clock, TrendingUp, ChevronRight, Users } from 'lucide-react';
import { LAUNCHPAD_PROJECTS, STATUS_CONFIG, CATEGORY_COLORS } from '../launchpad/launchpadData';

export default function LaunchpadPreview() {
  const live     = LAUNCHPAD_PROJECTS.find(p => p.status === 'live');
  const upcoming = LAUNCHPAD_PROJECTS.find(p => p.status === 'upcoming');
  const previews = [live, upcoming].filter(Boolean);

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-white">Launchpad</h3>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
        </div>
        <Link to={createPageUrl('Launchpad')}>
          <span className="text-[11px] text-[#00d4aa] font-semibold flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      <div className="space-y-2.5">
        {previews.map(p => {
          const status = STATUS_CONFIG[p.status];
          const catCfg = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.DeFi;
          return (
            <Link key={p.id} to={`${createPageUrl('LaunchpadDetail')}?id=${p.id}`}>
              <div className="glass-card rounded-2xl p-3.5 border border-[rgba(148,163,184,0.05)] hover:border-[#00d4aa]/20 transition-all flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#06b6d4]/20 flex items-center justify-center border border-[#00d4aa]/10 flex-shrink-0">
                  <span className="text-xs font-black text-[#00d4aa]">{p.ticker.slice(0,2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[12px] font-bold text-white">{p.name}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold ${catCfg.text}`}>{p.category}</span>
                    <span className="text-[9px] text-slate-600">·</span>
                    <span className="text-[9px] text-slate-500">{p.price}</span>
                    {p.participants > 0 && (
                      <>
                        <span className="text-[9px] text-slate-600">·</span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{(p.participants/1000).toFixed(1)}K</span>
                      </>
                    )}
                    {p.status === 'upcoming' && (
                      <>
                        <span className="text-[9px] text-slate-600">·</span>
                        <span className="text-[9px] text-blue-400">{p.launchDate}</span>
                      </>
                    )}
                  </div>
                  {p.status === 'live' && (
                    <div className="mt-1.5 h-1 rounded-full bg-[#0d1220] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}