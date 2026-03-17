import React, { useState } from 'react';
import { useLang } from './components/shared/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Search, Wallet, Menu } from 'lucide-react';
import BottomNav from './components/shared/BottomNav';
import TickerStrip from './components/shared/TickerStrip';
import AppMenu from './components/shared/AppMenu';
import { MarketDataProvider, useMarketData } from './components/shared/MarketDataProvider';
import { LanguageProvider } from './components/shared/LanguageContext';
import { UserTypeProvider } from './components/shared/UserTypeContext';
import SolFortLogo, { LOGO_FONT_URL } from './components/shared/SolFortLogo';
import AnimatedBackground from './components/shared/AnimatedBackground';

const NO_SHELL_PAGES = ['Splash', 'WalletConnect'];

function LayoutInner({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const showShell = !NO_SHELL_PAGES.includes(currentPageName);

  // Derive market sentiment from live BTC change
  const { getLiveAsset } = useMarketData();
  const btc = getLiveAsset('BTC');
  const sentiment = btc.available
    ? btc.change > 1.5 ? 'bullish' : btc.change < -1.5 ? 'bearish' : 'neutral'
    : 'neutral';

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 max-w-lg mx-auto relative">
        {showShell && <AnimatedBackground direction={sentiment} />}
        {showShell && (
          <>
            <AppMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage={currentPageName} />

            {/* Global Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-[rgba(148,163,184,0.05)]" style={{ boxShadow: '0 1px 0 rgba(0,212,170,0.04), 0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
                  >
                    <Menu className="w-4 h-4 text-slate-400" />
                  </button>
                  <Link to={createPageUrl('Home')}>
                    <div className="flex items-center gap-2">
                      <SolFortLogo size={26} variant="symbol" className="rounded-full" />
                      <img src={LOGO_FONT_URL} alt="SOLFORT" className="h-5 object-contain" />
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/25 fluid btn-press tap-ring"
                    style={{ transition: 'border-color 0.2s ease, transform 0.08s ease' }}>
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <Link to={createPageUrl('Notifications')}>
                    <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/25 fluid btn-press tap-ring relative"
                      style={{ transition: 'border-color 0.2s ease, transform 0.08s ease' }}>
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
                        style={{ boxShadow: '0 0 6px rgba(0,212,170,0.9)' }} />
                    </button>
                  </Link>
                  <Link to={createPageUrl('WalletConnect')}>
                    <button className="h-8 px-3 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center gap-1.5 hover:bg-[#00d4aa]/20 btn-press tap-ring"
                      style={{ transition: 'background 0.18s ease, transform 0.08s ease, box-shadow 0.18s ease' }}>
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
        <div className={`${showShell ? 'pb-20' : ''} page-enter`}>
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