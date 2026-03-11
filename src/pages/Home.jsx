import React from 'react';
import MarketOverview from '../components/home/MarketOverview';
import FeaturedBanner from '../components/home/FeaturedBanner';
import TrendingAssets from '../components/home/TrendingAssets';
import TopMovers from '../components/home/TopMovers';
import MarketCategories from '../components/home/MarketCategories';

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* Welcome section */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-slate-500 text-xs font-medium">Global Multi-Asset Trading Platform</p>
      </div>

      <MarketOverview />
      <FeaturedBanner />
      <TrendingAssets />
      <MarketCategories />
      <TopMovers />

      {/* Ecosystem footer */}
      <div className="px-4 pb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Powered by</p>
          <p className="text-sm font-bold">
            <span className="text-white">Sol</span>
            <span className="gradient-text">Fort</span>
            <span className="text-slate-500 font-normal"> Ecosystem</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">Built on Solana · Institutional Grade</p>
        </div>
      </div>
    </div>
  );
}