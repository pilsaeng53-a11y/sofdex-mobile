import React from 'react';
import { Trophy, Calendar, Users, Zap } from 'lucide-react';
import { EVENTS } from './mockData';

const TYPE_STYLES = {
  tournament: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)', accent: '#fbbf24', label: 'TOURNAMENT' },
  daily:      { bg: 'rgba(0,212,170,0.07)',  border: 'rgba(0,212,170,0.2)',  accent: '#00d4aa', label: 'DAILY' },
  weekly:     { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)', accent: '#8b5cf6', label: 'WEEKLY' },
  special:    { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.2)', accent: '#3b82f6', label: 'SPECIAL' },
};

function daysLeft(dateStr) {
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (d <= 0) return 'Ended';
  if (d === 1) return '1 day left';
  return `${d} days left`;
}

export default function EventsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 mb-1">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <p className="text-xs font-black text-white">Active Events</p>
      </div>
      {EVENTS.map(ev => {
        const style = TYPE_STYLES[ev.type];
        return (
          <div key={ev.id} className="rounded-2xl p-4 border"
            style={{ background: style.bg, borderColor: style.border }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ev.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: `${style.accent}20`, color: style.accent }}>{style.label}</span>
                    {ev.myRank && <span className="text-[8px] text-slate-400">Your rank: #{ev.myRank}</span>}
                  </div>
                  <p className="text-sm font-black text-white">{ev.title}</p>
                </div>
              </div>
              <button className="text-[9px] font-black px-2.5 py-1.5 rounded-xl transition-all"
                style={{ background: `${style.accent}15`, color: style.accent, border: `1px solid ${style.accent}30` }}>
                Join
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{ev.description}</p>

            {/* Rules */}
            <div className="space-y-1 mb-3">
              {ev.rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0"
                    style={{ background: `${style.accent}20`, color: style.accent }}>{i+1}</span>
                  {r}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{ev.participants.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{daysLeft(ev.ends)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="font-black text-yellow-400">{ev.reward}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}