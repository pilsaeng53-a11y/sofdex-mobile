/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIIntelligence from './pages/AIIntelligence';
import AIWealthManager from './pages/AIWealthManager';
import Account from './pages/Account';
import Activity from './pages/Activity';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import AnalyticsIntelligence from './pages/AnalyticsIntelligence';
import Announcements from './pages/Announcements';
import AssetDiscovery from './pages/AssetDiscovery';
import AssetRegistryDetail from './pages/AssetRegistryDetail';
import BeginnerDashboard from './pages/BeginnerDashboard';
import CommissionDist from './pages/CommissionDist';
import CopyTraderDetail from './pages/CopyTraderDetail';
import CopyTrading from './pages/CopyTrading';
import Discussions from './pages/Discussions';
import DocAssetOverview from './pages/DocAssetOverview';
import DocLegalDocuments from './pages/DocLegalDocuments';
import DocRiskDisclosure from './pages/DocRiskDisclosure';
import DocTokenStructure from './pages/DocTokenStructure';
import DownlineTree from './pages/DownlineTree';
import Earn from './pages/Earn';
import FundingRates from './pages/FundingRates';
import FuturesAccountTypes from './pages/FuturesAccountTypes';
import FuturesDashboard from './pages/FuturesDashboard';
import FuturesMarketWatch from './pages/FuturesMarketWatch';
import FuturesPositions from './pages/FuturesPositions';
import FuturesReferral from './pages/FuturesReferral';
import FuturesSalesPartner from './pages/FuturesSalesPartner';
import FuturesTrade from './pages/FuturesTrade';
import FuturesTradeHistory from './pages/FuturesTradeHistory';
import GlobalMarkets from './pages/GlobalMarkets';
import Governance from './pages/Governance';
import GovernanceDetail from './pages/GovernanceDetail';
import Home from './pages/Home';
import IndexFundDetail from './pages/IndexFundDetail';
import Institutional from './pages/Institutional';
import Launchpad from './pages/Launchpad';
import LaunchpadDetail from './pages/LaunchpadDetail';
import Leaderboard from './pages/Leaderboard';
import LiquidationFeed from './pages/LiquidationFeed';
import MacroDetail from './pages/MacroDetail';
import MarketDetail from './pages/MarketDetail';
import MarketHeatmap from './pages/MarketHeatmap';
import Markets from './pages/Markets';
import More from './pages/More';
import MyPosts from './pages/MyPosts';
import MyStrategyInvestments from './pages/MyStrategyInvestments';
import MyTeam from './pages/MyTeam';
import News from './pages/News';
import Notifications from './pages/Notifications';
import OpenInterest from './pages/OpenInterest';
import PartnerHub from './pages/PartnerHub';
import PartnerHubNew from './pages/PartnerHubNew';
import Portfolio from './pages/Portfolio';
import PredictionMarket from './pages/PredictionMarket';
import Profile from './pages/Profile';
import RWAExplore from './pages/RWAExplore';
import RankProgress from './pages/RankProgress';
import RealEstate from './pages/RealEstate';
import RealEstateDetail from './pages/RealEstateDetail';
import Referral from './pages/Referral';
import RegionalDistributor from './pages/RegionalDistributor';
import ReputationScore from './pages/ReputationScore';
import Rewards from './pages/Rewards';
import SOFSalesPartnerDashboard from './pages/SOFSalesPartnerDashboard';
import SalesDashboard from './pages/SalesDashboard';
import SocialTrading from './pages/SocialTrading';
import SolFort from './pages/SolFort';
import Splash from './pages/Splash';
import StrategyCreator from './pages/StrategyCreator';
import StrategyDetail from './pages/StrategyDetail';
import StrategyIndexFunds from './pages/StrategyIndexFunds';
import StrategyLeaderboard from './pages/StrategyLeaderboard';
import StrategyMarketplace from './pages/StrategyMarketplace';
import StrategyVaults from './pages/StrategyVaults';
import Swap from './pages/Swap';
import TeamLeaderboard from './pages/TeamLeaderboard';
import Trade from './pages/Trade';
import TraderProfile from './pages/TraderProfile';
import Traders from './pages/Traders';
import TradingFeed from './pages/TradingFeed';
import TradingTools from './pages/TradingTools';
import UniversalPortfolio from './pages/UniversalPortfolio';
import VaultDetail from './pages/VaultDetail';
import Wallet from './pages/Wallet';
import WalletConnect from './pages/WalletConnect';
import WhaleTracker from './pages/WhaleTracker';
import WhatsNew from './pages/WhatsNew';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIIntelligence": AIIntelligence,
    "AIWealthManager": AIWealthManager,
    "Account": Account,
    "Activity": Activity,
    "Alerts": Alerts,
    "Analytics": Analytics,
    "AnalyticsIntelligence": AnalyticsIntelligence,
    "Announcements": Announcements,
    "AssetDiscovery": AssetDiscovery,
    "AssetRegistryDetail": AssetRegistryDetail,
    "BeginnerDashboard": BeginnerDashboard,
    "CommissionDist": CommissionDist,
    "CopyTraderDetail": CopyTraderDetail,
    "CopyTrading": CopyTrading,
    "Discussions": Discussions,
    "DocAssetOverview": DocAssetOverview,
    "DocLegalDocuments": DocLegalDocuments,
    "DocRiskDisclosure": DocRiskDisclosure,
    "DocTokenStructure": DocTokenStructure,
    "DownlineTree": DownlineTree,
    "Earn": Earn,
    "FundingRates": FundingRates,
    "FuturesAccountTypes": FuturesAccountTypes,
    "FuturesDashboard": FuturesDashboard,
    "FuturesMarketWatch": FuturesMarketWatch,
    "FuturesPositions": FuturesPositions,
    "FuturesReferral": FuturesReferral,
    "FuturesSalesPartner": FuturesSalesPartner,
    "FuturesTrade": FuturesTrade,
    "FuturesTradeHistory": FuturesTradeHistory,
    "GlobalMarkets": GlobalMarkets,
    "Governance": Governance,
    "GovernanceDetail": GovernanceDetail,
    "Home": Home,
    "IndexFundDetail": IndexFundDetail,
    "Institutional": Institutional,
    "Launchpad": Launchpad,
    "LaunchpadDetail": LaunchpadDetail,
    "Leaderboard": Leaderboard,
    "LiquidationFeed": LiquidationFeed,
    "MacroDetail": MacroDetail,
    "MarketDetail": MarketDetail,
    "MarketHeatmap": MarketHeatmap,
    "Markets": Markets,
    "More": More,
    "MyPosts": MyPosts,
    "MyStrategyInvestments": MyStrategyInvestments,
    "MyTeam": MyTeam,
    "News": News,
    "Notifications": Notifications,
    "OpenInterest": OpenInterest,
    "PartnerHub": PartnerHub,
    "PartnerHubNew": PartnerHubNew,
    "Portfolio": Portfolio,
    "PredictionMarket": PredictionMarket,
    "Profile": Profile,
    "RWAExplore": RWAExplore,
    "RankProgress": RankProgress,
    "RealEstate": RealEstate,
    "RealEstateDetail": RealEstateDetail,
    "Referral": Referral,
    "RegionalDistributor": RegionalDistributor,
    "ReputationScore": ReputationScore,
    "Rewards": Rewards,
    "SOFSalesPartnerDashboard": SOFSalesPartnerDashboard,
    "SalesDashboard": SalesDashboard,
    "SocialTrading": SocialTrading,
    "SolFort": SolFort,
    "Splash": Splash,
    "StrategyCreator": StrategyCreator,
    "StrategyDetail": StrategyDetail,
    "StrategyIndexFunds": StrategyIndexFunds,
    "StrategyLeaderboard": StrategyLeaderboard,
    "StrategyMarketplace": StrategyMarketplace,
    "StrategyVaults": StrategyVaults,
    "Swap": Swap,
    "TeamLeaderboard": TeamLeaderboard,
    "Trade": Trade,
    "TraderProfile": TraderProfile,
    "Traders": Traders,
    "TradingFeed": TradingFeed,
    "TradingTools": TradingTools,
    "UniversalPortfolio": UniversalPortfolio,
    "VaultDetail": VaultDetail,
    "Wallet": Wallet,
    "WalletConnect": WalletConnect,
    "WhaleTracker": WhaleTracker,
    "WhatsNew": WhatsNew,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};