import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Search, Wallet } from 'lucide-react';
import MarketOverview from '../components/home/MarketOverview';
import FeaturedBanner from '../components/home/FeaturedBanner';
import TrendingAssets from '../components/home/TrendingAssets';
import TopMovers from '../components/home/TopMovers';
import MarketCategories from '../components/home/MarketCategories';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center">
              <span className="text-xs font-black text-white">SF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                SOF<span className="gradient-text">Dex</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all relative">
            <Bell className="w-4 h-4 text-slate-400" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
          </button>
          <Link to={createPageUrl('WalletConnect')}>
            <button className="h-9 px-3.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center gap-1.5 hover:bg-[#00d4aa]/20 transition-all">
              <Wallet className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span className="text-xs font-semibold text-[#00d4aa]">Connect</span>
            </button>
          </Link>
        </div>
      </div>

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