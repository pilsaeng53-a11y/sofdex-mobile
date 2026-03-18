import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import DocAssetOverview from './pages/DocAssetOverview';
import LaunchpadDetail from './pages/LaunchpadDetail';
import Announcements from './pages/Announcements';
import Institutional from './pages/Institutional';
import AssetRegistryDetail from './pages/AssetRegistryDetail';
import WalletPage from './pages/Wallet';
import Swap from './pages/Swap';
import TradingTools from './pages/TradingTools';
import MarketHeatmap from './pages/MarketHeatmap';
import AssetDiscovery from './pages/AssetDiscovery';
import StrategyMarketplace from './pages/StrategyMarketplace';
import ReputationScore from './pages/ReputationScore';
import Home from './pages/Home';
import WhatsNew from './pages/WhatsNew';
import AIWealthManager from './pages/AIWealthManager';
import TradingFeed from './pages/TradingFeed';
import TraderProfile from './pages/TraderProfile';
import Discussions from './pages/Discussions';
import Traders from './pages/Traders';
import MyPosts from './pages/MyPosts';
import Rewards from './pages/Rewards';
import UniversalPortfolio from './pages/UniversalPortfolio';
import PartnerHub from './pages/PartnerHub';
import DownlineTree from './pages/DownlineTree';
import CommissionDist from './pages/CommissionDist';
import RankProgress from './pages/RankProgress';
import TeamLeaderboard from './pages/TeamLeaderboard';
import RegionalDistributor from './pages/RegionalDistributor';
import AnalyticsIntelligence from './pages/AnalyticsIntelligence';
import MyTeam from './pages/MyTeam';
import SolFort from './pages/SolFort';
import CopyTraderDetail from './pages/CopyTraderDetail';
import BeginnerDashboard from './pages/BeginnerDashboard';
import StrategyDetail from './pages/StrategyDetail';
import StrategyCreator from './pages/StrategyCreator';
import StrategyLeaderboard from './pages/StrategyLeaderboard';
import StrategyVaults from './pages/StrategyVaults';
import VaultDetail from './pages/VaultDetail';
import StrategyIndexFunds from './pages/StrategyIndexFunds';
import IndexFundDetail from './pages/IndexFundDetail';
import MyStrategyInvestments from './pages/MyStrategyInvestments';
import GovernanceDetail from './pages/GovernanceDetail';
import FundingRates from './pages/FundingRates';
import OpenInterest from './pages/OpenInterest';
import Portfolio from './pages/Portfolio';
import Account from './pages/Account';
import Activity from './pages/Activity';
import DocLegalDocuments from './pages/DocLegalDocuments';
import MacroDetail from './pages/MacroDetail';
import DocTokenStructure from './pages/DocTokenStructure';
import DocRiskDisclosure from './pages/DocRiskDisclosure';
import GlobalMarkets from './pages/GlobalMarkets';
import FuturesDashboard from './pages/FuturesDashboard';
import FuturesTrade from './pages/FuturesTrade';
import FuturesMarketWatch from './pages/FuturesMarketWatch';
import FuturesPositions from './pages/FuturesPositions';
import FuturesAccountTypes from './pages/FuturesAccountTypes';
import FuturesSalesPartner from './pages/FuturesSalesPartner';
import FuturesReferral from './pages/FuturesReferral';
import PartnerHubNew from './pages/PartnerHubNew';
import SalesDashboard from './pages/SalesDashboard';
import SOFSalesPartnerDashboard from './pages/SOFSalesPartnerDashboard';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName="Home">
          <Home />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/DocAssetOverview" element={<LayoutWrapper currentPageName="DocAssetOverview"><DocAssetOverview /></LayoutWrapper>} />
      <Route path="/DocLegalDocuments" element={<LayoutWrapper currentPageName="DocLegalDocuments"><DocLegalDocuments /></LayoutWrapper>} />
      <Route path="/DocTokenStructure" element={<LayoutWrapper currentPageName="DocTokenStructure"><DocTokenStructure /></LayoutWrapper>} />
      <Route path="/DocRiskDisclosure" element={<LayoutWrapper currentPageName="DocRiskDisclosure"><DocRiskDisclosure /></LayoutWrapper>} />
      <Route path="/Swap" element={<LayoutWrapper currentPageName="Swap"><Swap /></LayoutWrapper>} />
      <Route path="/GlobalMarkets" element={<LayoutWrapper currentPageName="GlobalMarkets"><GlobalMarkets /></LayoutWrapper>} />
      <Route path="/FuturesDashboard" element={<LayoutWrapper currentPageName="FuturesDashboard"><FuturesDashboard /></LayoutWrapper>} />
      <Route path="/FuturesTrade" element={<LayoutWrapper currentPageName="FuturesTrade"><FuturesTrade /></LayoutWrapper>} />
      <Route path="/FuturesMarketWatch" element={<LayoutWrapper currentPageName="FuturesMarketWatch"><FuturesMarketWatch /></LayoutWrapper>} />
      <Route path="/FuturesPositions" element={<LayoutWrapper currentPageName="FuturesPositions"><FuturesPositions /></LayoutWrapper>} />
      <Route path="/FuturesAccountTypes" element={<LayoutWrapper currentPageName="FuturesAccountTypes"><FuturesAccountTypes /></LayoutWrapper>} />
      <Route path="/FuturesSalesPartner" element={<LayoutWrapper currentPageName="FuturesSalesPartner"><FuturesSalesPartner /></LayoutWrapper>} />
      <Route path="/FuturesReferral" element={<LayoutWrapper currentPageName="FuturesReferral"><FuturesReferral /></LayoutWrapper>} />
      <Route path="/PartnerHubNew" element={<LayoutWrapper currentPageName="PartnerHubNew"><PartnerHubNew /></LayoutWrapper>} />
      <Route path="/SalesDashboard" element={<LayoutWrapper currentPageName="SalesDashboard"><SalesDashboard /></LayoutWrapper>} />
      <Route path="/SOFSalesPartnerDashboard" element={<LayoutWrapper currentPageName="SOFSalesPartnerDashboard"><SOFSalesPartnerDashboard /></LayoutWrapper>} />
      <Route path="/SolFort" element={<LayoutWrapper currentPageName="SolFort"><SolFort /></LayoutWrapper>} />
      <Route path="/CopyTraderDetail" element={<LayoutWrapper currentPageName="CopyTraderDetail"><CopyTraderDetail /></LayoutWrapper>} />
      <Route path="/BeginnerDashboard" element={<LayoutWrapper currentPageName="BeginnerDashboard"><BeginnerDashboard /></LayoutWrapper>} />
      <Route path="/GovernanceDetail" element={<LayoutWrapper currentPageName="GovernanceDetail"><GovernanceDetail /></LayoutWrapper>} />
      <Route path="/FundingRates" element={<LayoutWrapper currentPageName="FundingRates"><FundingRates /></LayoutWrapper>} />
      <Route path="/OpenInterest" element={<LayoutWrapper currentPageName="OpenInterest"><OpenInterest /></LayoutWrapper>} />
      <Route path="/LaunchpadDetail" element={<LayoutWrapper currentPageName="LaunchpadDetail"><LaunchpadDetail /></LayoutWrapper>} />
      <Route path="/Announcements" element={<LayoutWrapper currentPageName="Announcements"><Announcements /></LayoutWrapper>} />
      <Route path="/Institutional" element={<LayoutWrapper currentPageName="Institutional"><Institutional /></LayoutWrapper>} />
      <Route path="/AssetRegistryDetail" element={<LayoutWrapper currentPageName="AssetRegistryDetail"><AssetRegistryDetail /></LayoutWrapper>} />
      <Route path="/Wallet" element={<LayoutWrapper currentPageName="Wallet"><WalletPage /></LayoutWrapper>} />
      <Route path="/TradingTools" element={<LayoutWrapper currentPageName="TradingTools"><TradingTools /></LayoutWrapper>} />
      <Route path="/MarketHeatmap" element={<LayoutWrapper currentPageName="MarketHeatmap"><MarketHeatmap /></LayoutWrapper>} />
      <Route path="/AssetDiscovery" element={<LayoutWrapper currentPageName="AssetDiscovery"><AssetDiscovery /></LayoutWrapper>} />
      <Route path="/StrategyMarketplace" element={<LayoutWrapper currentPageName="StrategyMarketplace"><StrategyMarketplace /></LayoutWrapper>} />
      <Route path="/ReputationScore" element={<LayoutWrapper currentPageName="ReputationScore"><ReputationScore /></LayoutWrapper>} />
      <Route path="/WhatsNew" element={<LayoutWrapper currentPageName="WhatsNew"><WhatsNew /></LayoutWrapper>} />
      <Route path="/AIWealthManager" element={<LayoutWrapper currentPageName="AIWealthManager"><AIWealthManager /></LayoutWrapper>} />
      <Route path="/TradingFeed" element={<LayoutWrapper currentPageName="TradingFeed"><TradingFeed /></LayoutWrapper>} />
      <Route path="/TraderProfile" element={<LayoutWrapper currentPageName="TraderProfile"><TraderProfile /></LayoutWrapper>} />
      <Route path="/Discussions" element={<LayoutWrapper currentPageName="Discussions"><Discussions /></LayoutWrapper>} />
      <Route path="/Traders" element={<LayoutWrapper currentPageName="Traders"><Traders /></LayoutWrapper>} />
      <Route path="/MyPosts" element={<LayoutWrapper currentPageName="MyPosts"><MyPosts /></LayoutWrapper>} />
      <Route path="/Rewards" element={<LayoutWrapper currentPageName="Rewards"><Rewards /></LayoutWrapper>} />
      <Route path="/UniversalPortfolio" element={<LayoutWrapper currentPageName="UniversalPortfolio"><UniversalPortfolio /></LayoutWrapper>} />
      <Route path="/PartnerHub" element={<LayoutWrapper currentPageName="PartnerHub"><PartnerHub /></LayoutWrapper>} />
      <Route path="/DownlineTree" element={<LayoutWrapper currentPageName="DownlineTree"><DownlineTree /></LayoutWrapper>} />
      <Route path="/CommissionDist" element={<LayoutWrapper currentPageName="CommissionDist"><CommissionDist /></LayoutWrapper>} />
      <Route path="/RankProgress" element={<LayoutWrapper currentPageName="RankProgress"><RankProgress /></LayoutWrapper>} />
      <Route path="/TeamLeaderboard" element={<LayoutWrapper currentPageName="TeamLeaderboard"><TeamLeaderboard /></LayoutWrapper>} />
      <Route path="/RegionalDistributor" element={<LayoutWrapper currentPageName="RegionalDistributor"><RegionalDistributor /></LayoutWrapper>} />
      <Route path="/MyTeam" element={<LayoutWrapper currentPageName="MyTeam"><MyTeam /></LayoutWrapper>} />
      <Route path="/AnalyticsIntelligence" element={<LayoutWrapper currentPageName="AnalyticsIntelligence"><AnalyticsIntelligence /></LayoutWrapper>} />
      <Route path="/StrategyDetail" element={<LayoutWrapper currentPageName="StrategyDetail"><StrategyDetail /></LayoutWrapper>} />
      <Route path="/StrategyCreator" element={<LayoutWrapper currentPageName="StrategyCreator"><StrategyCreator /></LayoutWrapper>} />
      <Route path="/StrategyLeaderboard" element={<LayoutWrapper currentPageName="StrategyLeaderboard"><StrategyLeaderboard /></LayoutWrapper>} />
      <Route path="/StrategyVaults" element={<LayoutWrapper currentPageName="StrategyVaults"><StrategyVaults /></LayoutWrapper>} />
      <Route path="/VaultDetail" element={<LayoutWrapper currentPageName="VaultDetail"><VaultDetail /></LayoutWrapper>} />
      <Route path="/StrategyIndexFunds" element={<LayoutWrapper currentPageName="StrategyIndexFunds"><StrategyIndexFunds /></LayoutWrapper>} />
      <Route path="/IndexFundDetail" element={<LayoutWrapper currentPageName="IndexFundDetail"><IndexFundDetail /></LayoutWrapper>} />
      <Route path="/MyStrategyInvestments" element={<LayoutWrapper currentPageName="MyStrategyInvestments"><MyStrategyInvestments /></LayoutWrapper>} />
      <Route path="/MacroDetail" element={<LayoutWrapper currentPageName="MacroDetail"><MacroDetail /></LayoutWrapper>} />
      <Route path="/Portfolio" element={<LayoutWrapper currentPageName="Portfolio"><Portfolio /></LayoutWrapper>} />
      <Route path="/Account" element={<LayoutWrapper currentPageName="Account"><Account /></LayoutWrapper>} />
      <Route path="/Activity" element={<LayoutWrapper currentPageName="Activity"><Activity /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App