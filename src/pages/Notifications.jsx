import React, { useState } from 'react';
import { Bell, TrendingUp, Newspaper, Vote, Wallet, Rocket, CheckCircle2, X, Settings } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1, type: 'price', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/10',
    title: 'BTC crossed $100,000', body: 'Bitcoin just hit the $100K milestone. +2.4% in the last hour.',
    time: '2m ago', unread: true,
  },
  {
    id: 2, type: 'governance', icon: Vote, color: 'text-blue-400 bg-blue-400/10',
    title: 'New Governance Proposal', body: 'SFD-006: Expand SOFDex perpetuals to include commodity assets.',
    time: '18m ago', unread: true,
  },
  {
    id: 3, type: 'news', icon: Newspaper, color: 'text-amber-400 bg-amber-400/10',
    title: 'Breaking: SEC approves spot ETH ETF', body: 'Major regulatory milestone for Ethereum institutional adoption.',
    time: '34m ago', unread: true,
  },
  {
    id: 4, type: 'portfolio', icon: Wallet, color: 'text-purple-400 bg-purple-400/10',
    title: 'SOL-PERP position up 12.4%', body: 'Your long position on SOL-PERP is now showing +$312 unrealized PnL.',
    time: '1h ago', unread: false,
  },
  {
    id: 5, type: 'launchpad', icon: Rocket, color: 'text-orange-400 bg-orange-400/10',
    title: 'SolFort Protocol — Sale starts soon', body: 'The SFLP token sale begins in 2 hours. Whitelist spots are limited.',
    time: '2h ago', unread: false,
  },
  {
    id: 6, type: 'price', icon: TrendingUp, color: 'text-red-400 bg-red-400/10',
    title: 'ETH dropped below $3,800', body: 'Ethereum price alert triggered. Current: $3,782 (-1.6%).',
    time: '3h ago', unread: false,
  },
  {
    id: 7, type: 'governance', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10',
    title: 'Proposal SFD-003 Passed', body: 'Reduce Trading Fees for High Volume Traders — 94% YES vote.',
    time: '1d ago', unread: false,
  },
];

const typeFilters = ['all', 'price', 'governance', 'news', 'portfolio', 'launchpad'];

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [dismissed, setDismissed] = useState(new Set());

  const visible = NOTIFICATIONS.filter(n => !dismissed.has(n.id) && (filter === 'all' || n.type === filter));
  const unreadCount = visible.filter(n => n.unread).length;

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#00d4aa] text-black text-[10px] font-black">{unreadCount}</span>
          )}
        </div>
        <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Alert Preferences */}
      <div className="glass-card rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-white mb-3">Alert Preferences</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Price Alerts', enabled: true },
            { label: 'News Alerts', enabled: true },
            { label: 'Governance', enabled: true },
            { label: 'Portfolio', enabled: true },
            { label: 'Launchpad', enabled: false },
            { label: 'System', enabled: false },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between bg-[#0d1220] rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">{pref.label}</span>
              <div className={`w-8 h-4 rounded-full transition-colors ${pref.enabled ? 'bg-[#00d4aa]' : 'bg-[#1a2340]'} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${pref.enabled ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {typeFilters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2.5">
        {visible.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No notifications in this category</p>
          </div>
        )}
        {visible.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={`glass-card rounded-xl p-3.5 ${n.unread ? 'border border-[#00d4aa]/10' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <button
                      onClick={() => setDismissed(s => new Set([...s, n.id]))}
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#1a2340] transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}