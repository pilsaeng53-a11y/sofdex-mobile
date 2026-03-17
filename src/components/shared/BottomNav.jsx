import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BarChart3, TrendingUp, Wallet, Brain, History } from 'lucide-react';
import { useLang } from './LanguageContext';

const TAB_KEYS = [
  { key: 'nav_home',      page: 'Home',          icon: Home },
  { key: 'nav_trade',     page: 'Trade',         icon: TrendingUp },
  { key: 'nav_markets',   page: 'Markets',       icon: BarChart3 },
  { key: 'nav_ai',        page: 'AIIntelligence',icon: Brain },
  { key: 'nav_portfolio', page: 'Portfolio',     icon: Wallet },
];

export default function BottomNav({ currentPage }) {
  const { t } = useLang();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/97 backdrop-blur-2xl border-t border-[rgba(148,163,184,0.07)]" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.5), 0 -1px 0 rgba(0,212,170,0.05)' }}>
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TAB_KEYS.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.page}
              to={createPageUrl(tab.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#00d4aa]/10' : ''}`}
                style={isActive ? { boxShadow: '0 0 16px rgba(0,212,170,0.25), 0 0 6px rgba(0,212,170,0.15)' } : {}}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00d4aa]"
                    style={{ boxShadow: '0 0 6px rgba(0,212,170,0.9)' }} />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-[#00d4aa]' : ''}`}>
                {t(tab.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}