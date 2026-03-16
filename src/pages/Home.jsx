import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../components/shared/LanguageContext';
import { useUserType } from '../components/shared/UserTypeContext';
import HotAssets from '../components/shared/HotAssets';
import MarketOverview from '../components/home/MarketOverview';
import FeaturedBanner from '../components/home/FeaturedBanner';
import TrendingAssets from '../components/home/TrendingAssets';
import TopMovers from '../components/home/TopMovers';
import MarketCategories from '../components/home/MarketCategories';
import QuickAccess from '../components/home/QuickAccess';
import NewsPreview from '../components/home/NewsPreview';
import AISentimentCard from '../components/home/AISentimentCard';
import GlobalIndicators from '../components/home/GlobalIndicators';
import SmartDiscovery from '../components/home/SmartDiscovery';
import PredictionPreview from '../components/home/PredictionPreview';
import ReferralPreview from '../components/home/ReferralPreview';
import AIOpportunityCard from '../components/home/AIOpportunityCard';
import ActivityStream from '../components/home/ActivityStream';
import LaunchpadPreview from '../components/home/LaunchpadPreview';
import MarketPulseBar from '../components/shared/MarketPulseBar';
import AdvancedFeaturesPreview from '../components/home/AdvancedFeaturesPreview';

export default function Home() {
  const { t } = useLang();
  const { userType } = useUserType();

  return (
    <div className="min-h-screen">

      {/* Welcome section */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className="text-slate-500 text-xs font-medium">{t('home_subtitle')}</p>
        {userType === 'beginner' && (
          <Link to="/BeginnerDashboard" className="text-[10px] font-bold text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/20 px-2 py-1 rounded-lg hover:bg-[#00d4aa]/20 transition-all">
            ✨ Beginner Guide
          </Link>
        )}
      </div>

      <MarketPulseBar />
      <MarketOverview />
      <QuickAccess />
      <div className="px-4 pb-4"><HotAssets compact /></div>
      <AISentimentCard />
      <GlobalIndicators />
      <AIOpportunityCard />
      <AdvancedFeaturesPreview />
      <SmartDiscovery />
      <LaunchpadPreview />
      <FeaturedBanner />
      <TrendingAssets />
      <ActivityStream />
      <PredictionPreview />
      <MarketCategories />
      <TopMovers />
      <ReferralPreview />
      <NewsPreview />

      {/* Ecosystem footer */}
      <div className="px-4 pb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] text-slate-500 mb-1">{t('home_poweredBy')}</p>
          <p className="text-sm font-bold">
            <span className="text-white">Sol</span>
            <span className="gradient-text">Fort</span>
            <span className="text-slate-500 font-normal"> Ecosystem</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">{t('home_builtOn')}</p>
        </div>
      </div>
    </div>
  );
}