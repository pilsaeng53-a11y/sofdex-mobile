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
import Analytics from './pages/Analytics';
import Earn from './pages/Earn';
import Governance from './pages/Governance';
import Home from './pages/Home';
import Launchpad from './pages/Launchpad';
import MarketDetail from './pages/MarketDetail';
import Markets from './pages/Markets';
import News from './pages/News';
import Notifications from './pages/Notifications';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import RWAExplore from './pages/RWAExplore';
import SocialTrading from './pages/SocialTrading';
import Splash from './pages/Splash';
import WalletConnect from './pages/WalletConnect';
import WhaleTracker from './pages/WhaleTracker';
import RealEstate from './pages/RealEstate';
import RealEstateDetail from './pages/RealEstateDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Earn": Earn,
    "Governance": Governance,
    "Home": Home,
    "Launchpad": Launchpad,
    "MarketDetail": MarketDetail,
    "Markets": Markets,
    "News": News,
    "Notifications": Notifications,
    "Portfolio": Portfolio,
    "Profile": Profile,
    "RWAExplore": RWAExplore,
    "SocialTrading": SocialTrading,
    "Splash": Splash,
    "WalletConnect": WalletConnect,
    "WhaleTracker": WhaleTracker,
    "RealEstate": RealEstate,
    "RealEstateDetail": RealEstateDetail,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};