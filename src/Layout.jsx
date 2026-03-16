import React, { useState } from 'react';
import { useLang } from './components/shared/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Search, Wallet, Menu } from 'lucide-react';
import BottomNav from './components/shared/BottomNav';
import TickerStrip from './components/shared/TickerStrip';
import AppMenu from './components/shared/AppMenu';
import { MarketDataProvider } from './components/shared/MarketDataProvider';
import { LanguageProvider } from './components/shared/LanguageContext';
import { UserTypeProvider } from './components/shared/UserTypeContext';
import SolFortLogo from './components/shared/SolFortLogo';

const NO_SHELL_PAGES = ['Splash', 'WalletConnect'];

function LayoutInner({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const showShell = !NO_SHELL_PAGES.includes(currentPageName);

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 max-w-lg mx-auto relative">
        {showShell && (
          <>
            <AppMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage={currentPageName} />

            {/* Global Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.06)]">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
                  >
                    <Menu className="w-4 h-4 text-slate-400" />
                  </button>
                  <Link to={createPageUrl('Home')}>
                    <div className="flex items-center gap-1.5">
                      <SolFortLogo size={24} className="rounded-md" />
                      <span className="text-sm font-bold text-white tracking-tight">SOF<span className="gradient-text">Dex</span></span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <Link to={createPageUrl('Notifications')}>
                    <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all relative">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
                    </button>
                  </Link>
                  <Link to={createPageUrl('WalletConnect')}>
                    <button className="h-8 px-3 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center gap-1.5 hover:bg-[#00d4aa]/20 transition-all">
                      <Wallet className="w-3.5 h-3.5 text-[#00d4aa]" />
                      <span className="text-xs font-semibold text-[#00d4aa]">{t('common_connect')}</span>
                    </button>
                  </Link>
                </div>
              </div>
              {currentPageName !== 'Profile' && <TickerStrip />}
            </div>
          </>
        )}
        <div className={`${showShell ? 'pb-20' : ''}`}>
          {children}
        </div>
        {showShell && <BottomNav currentPage={currentPageName} />}
      </div>
    </MarketDataProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <UserTypeProvider>
        <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
      </UserTypeProvider>
    </LanguageProvider>
  );
}