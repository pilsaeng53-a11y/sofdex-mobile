import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Copy, Newspaper, Users, ChevronRight, Brain, Zap } from 'lucide-react';
import HotAssets from '../components/shared/HotAssets';
import AIMarketPanel from '../components/shared/AIMarketPanel';
import { useLang } from '../components/shared/LanguageContext';

const TRENDING_TRADERS = [
  { name: 'AlphaWolf_77', roi: '+184%', win: '92%', color: '#00d4aa', avatar: 'AW', id: 1 },
  { name: 'QuantTrader', roi: '+121%', win: '88%', color: '#9945ff', avatar: 'QT', id: 2 },
  { name: 'SolGod', roi: '+98%', win: '85%', color: '#ef4444', avatar: 'SG', id: 3 },
];

const QUICK_ACTIONS = [
  { label: 'Start Trading', icon: TrendingUp, page: '/Trade', color: 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/20' },
  { label: 'Copy a Trader', icon: Copy, page: '/CopyTrading', color: 'bg-purple-400/15 text-purple-400 border-purple-400/20' },
  { label: 'Read News', icon: Newspaper, page: '/News', color: 'bg-blue-400/15 text-blue-400 border-blue-400/20' },
  { label: 'AI Insights', icon: Brain, page: '/AIIntelligence', color: 'bg-amber-400/15 text-amber-400 border-amber-400/20' },
];

export default function BeginnerDashboard() {
  const { t } = useLang();

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-[#00d4aa]/10 to-[#3b82f6]/10 rounded-2xl border border-[#00d4aa]/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-xs font-bold text-[#00d4aa] uppercase tracking-wide">
            {t('beginner_welcome') || 'Welcome to SOFDex'}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {t('beginner_intro') || 'Discover opportunities, copy top traders, and let AI guide your first trades. Start with hot assets below.'}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t('beginner_quickstart') || 'Quick Start'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.page}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all hover:scale-[1.02] ${action.color}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{t(`beginner_action_${action.label.toLowerCase().replace(/ /g,'_')}`) || action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hot Assets */}
      <div>
        <HotAssets compact />
      </div>

      {/* AI Market Panel */}
      <div>
        <AIMarketPanel symbol="BTC" />
      </div>

      {/* Trending Traders */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-sm font-bold text-white">{t('beginner_trending_traders') || 'Top Copy Traders'}</span>
          </div>
          <Link to="/CopyTrading" className="text-xs text-slate-500 hover:text-[#00d4aa] flex items-center gap-1 transition-colors">
            {t('common_viewAll')} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {TRENDING_TRADERS.map(trader => (
            <Link key={trader.id} to={`/CopyTraderDetail?id=${trader.id}`}
              className="flex items-center gap-3 bg-[#0a0e1a] rounded-xl p-3 hover:bg-[#1a2340] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: trader.color }}>
                {trader.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{trader.name}</p>
                <p className="text-xs text-slate-500">Win Rate: <span className="text-white font-semibold">{trader.win}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-400">{trader.roi}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Copy className="w-3 h-3" /> Copy
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Suggestions row */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">{t('beginner_ai_suggestion') || 'AI Suggestion for You'}</span>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl p-3 space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('beginner_ai_text') || 'Based on current market conditions, SOL shows strong momentum. Consider copying AlphaWolf_77 who specializes in SOL/BTC with a 92% win rate and conservative risk profile.'}
          </p>
          <div className="flex gap-2 pt-1">
            <Link to="/CopyTraderDetail?id=1"
              className="flex-1 py-2 rounded-xl bg-[#00d4aa]/15 text-[#00d4aa] text-xs font-semibold text-center border border-[#00d4aa]/20 hover:bg-[#00d4aa]/25 transition-all">
              Copy AlphaWolf_77
            </Link>
            <Link to="/Trade?symbol=SOL"
              className="flex-1 py-2 rounded-xl bg-[#151c2e] text-slate-300 text-xs font-semibold text-center border border-[rgba(148,163,184,0.1)] hover:text-white transition-all">
              Trade SOL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}