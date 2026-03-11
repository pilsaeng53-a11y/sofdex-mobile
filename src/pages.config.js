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
import Governance from './pages/Governance';
import Home from './pages/Home';
import MarketDetail from './pages/MarketDetail';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import RWAExplore from './pages/RWAExplore';
import Splash from './pages/Splash';
import WalletConnect from './pages/WalletConnect';
import Analytics from './pages/Analytics';
import Launchpad from './pages/Launchpad';
import Earn from './pages/Earn';
import SocialTrading from './pages/SocialTrading';
import LiquidationFeed from './pages/LiquidationFeed';
import WhaleTracker from './pages/WhaleTracker';
import Notifications from './pages/Notifications';
import News from './pages/News';
import Markets from './pages/Markets';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Governance": Governance,
    "Home": Home,
    "MarketDetail": MarketDetail,
    "Portfolio": Portfolio,
    "Profile": Profile,
    "RWAExplore": RWAExplore,
    "Splash": Splash,
    "WalletConnect": WalletConnect,
    "Analytics": Analytics,
    "Launchpad": Launchpad,
    "Earn": Earn,
    "SocialTrading": SocialTrading,
    "LiquidationFeed": LiquidationFeed,
    "WhaleTracker": WhaleTracker,
    "Notifications": Notifications,
    "News": News,
    "Markets": Markets,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};