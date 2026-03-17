import React, { useState, useEffect } from 'react';
import { useLang } from './components/shared/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Search, Wallet, Menu, Copy, Check, LogOut } from 'lucide-react';
import { useState as useLocalState } from 'react';
import BottomNav from './components/shared/BottomNav';
import TickerStrip from './components/shared/TickerStrip';
import AppMenu from './components/shared/AppMenu';
import { MarketDataProvider, useMarketData } from './components/shared/MarketDataProvider';
import { LanguageProvider } from './components/shared/LanguageContext';
import { UserTypeProvider } from './components/shared/UserTypeContext';
import { CurrencyProvider, useCurrency } from './components/shared/CurrencyContext';
import { RegionProvider } from './components/shared/RegionContext';
import SolFortLogo, { LOGO_FONT_URL } from './components/shared/SolFortLogo';
import AnimatedBackground from './components/shared/AnimatedBackground';
import { WalletProvider, useWallet } from './components/shared/WalletContext';
import ConnectWalletModal from './components/shared/ConnectWalletModal';
import { getRegionDefaultCurrency } from '@/services/RegionDetectionService';

const NO_SHELL_PAGES = ['Splash', 'WalletConnect'];

function ConnectedChip() {
  const { shortAddress, disconnect, walletName, address } = useWallet();
  const [copied, setCopied] = useLocalState(false);
  const [open, setOpen] = useLocalState(false);

  const copyAddr = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 transition-all btn-press"
        style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.22)', boxShadow: '0 0 12px rgba(0,212,170,0.08)' }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.9)' }} />
        <span className="text-[11px] font-bold text-[#00d4aa] font-mono tracking-tight">{shortAddress}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-44 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(153,69,255,0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
            <div className="px-3.5 py-3 border-b" style={{ borderColor: 'rgba(148,163,184,0.06)' }}>
              <p className="text-[9px] text-slate-500 mb-0.5 uppercase tracking-wider">{walletName}</p>
              <p className="text-xs font-mono text-white truncate">{shortAddress}</p>
            </div>
            <button onClick={copyAddr}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-[#151c2e] transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button onClick={() => { disconnect(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-400/5 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RegionPersonalizationInitializer() {
  const { lang } = useLang();
  const { displayCurrency, updateDisplayCurrency } = useCurrency();

  // Apply region's currency default on language change (if user hasn't manually set currency)
  useEffect(() => {
    try {
      const userSetCurrency = localStorage.getItem('sofdex_currency_manual');
      if (!userSetCurrency) {
        // No manual override, safe to apply region default
        // For now, we detect from language in RegionContext
        // Language change will trigger region update -> currency update
      }
    } catch {
      // Ignore
    }
  }, [lang, displayCurrency, updateDisplayCurrency]);

  return null; // This component doesn't render anything
}

function LayoutInner({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang } = useLang();
  const showShell = !NO_SHELL_PAGES.includes(currentPageName);

  const { isConnected, requireWallet } = useWallet();

  // Derive market sentiment from live BTC change
  const { getLiveAsset } = useMarketData();
  const btc = getLiveAsset('BTC');
  const sentiment = btc.available
    ? btc.change > 1.5 ? 'bullish' : btc.change < -1.5 ? 'bearish' : 'neutral'
    : 'neutral';

  return (
    <MarketDataProvider>
      <div className="min-h-screen text-slate-100 max-w-lg mx-auto" style={{ background: '#05070d', position: 'relative', zIndex: 1, isolation: 'isolate' }}>
        {showShell && <AnimatedBackground direction={sentiment} />}
        {showShell && (
          <>
            <AppMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage={currentPageName} />

            {/* Global Sticky Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-[rgba(148,163,184,0.05)]" style={{ background: 'rgba(5,7,13,0.92)', boxShadow: '0 1px 0 rgba(153,69,255,0.06), 0 4px 20px rgba(0,0,0,0.5)' }}>
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
                  {isConnected ? (
                    <ConnectedChip />
                  ) : (
                    <button
                      onClick={() => requireWallet()}
                      className="h-8 px-3 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center gap-1.5 hover:bg-[#00d4aa]/20 btn-press tap-ring"
                      style={{ transition: 'background 0.18s ease, transform 0.08s ease, box-shadow 0.18s ease' }}>
                      <Wallet className="w-3.5 h-3.5 text-[#00d4aa]" />
                      <span className="text-xs font-semibold text-[#00d4aa]">{t('common_connect')}</span>
                    </button>
                  )}
                </div>
              </div>
              {currentPageName !== 'Profile' && <TickerStrip />}
            </div>
          </>
        )}
        <div className={`${showShell ? 'pb-20' : ''} page-enter`} style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        {showShell && <BottomNav currentPage={currentPageName} />}
      </div>
    </MarketDataProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <RegionProvider>
          <UserTypeProvider>
            <WalletProvider>
              <RegionPersonalizationInitializer />
              <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
              <ConnectWalletModal />
            </WalletProvider>
          </UserTypeProvider>
        </RegionProvider>
      </LanguageProvider>
    </CurrencyProvider>
  );
}