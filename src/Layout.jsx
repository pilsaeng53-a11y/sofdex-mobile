import React, { useState, useEffect } from 'react';
import BottomNav from './components/shared/BottomNav';
import TickerStrip from './components/shared/TickerStrip';
import { MarketDataProvider } from './components/shared/MarketDataProvider';

const SPLASH_PAGES = ['Splash'];
const NO_NAV_PAGES = ['Splash', 'WalletConnect'];

export default function Layout({ children, currentPageName }) {
  const showNav = !NO_NAV_PAGES.includes(currentPageName);
  const showTicker = !NO_NAV_PAGES.includes(currentPageName) && currentPageName !== 'Profile';

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 max-w-lg mx-auto relative">
        {showTicker && <TickerStrip />}
        <div className={`${showNav ? 'pb-20' : ''}`}>
          {children}
        </div>
        {showNav && <BottomNav currentPage={currentPageName} />}
      </div>
    </MarketDataProvider>
  );
}