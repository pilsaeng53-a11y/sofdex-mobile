import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BarChart3, TrendingUp, Wallet, Newspaper } from 'lucide-react';

const tabs = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Markets', page: 'Markets', icon: BarChart3 },
  { name: 'Trade', page: 'Trade', icon: TrendingUp },
  { name: 'Portfolio', page: 'Portfolio', icon: Wallet },
  { name: 'News', page: 'News', icon: Newspaper },
];

export default function BottomNav({ currentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-[rgba(148,163,184,0.08)]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.page}
              to={createPageUrl(tab.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-[#00d4aa]' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-[#00d4aa]/10' : ''
              }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00d4aa]" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-[#00d4aa]' : ''}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}