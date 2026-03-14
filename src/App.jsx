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
import SolFort from './pages/SolFort';
import GovernanceDetail from './pages/GovernanceDetail';
import DocLegalDocuments from './pages/DocLegalDocuments';
import DocTokenStructure from './pages/DocTokenStructure';
import DocRiskDisclosure from './pages/DocRiskDisclosure';
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
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
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
      <Route path="/SolFort" element={<LayoutWrapper currentPageName="SolFort"><SolFort /></LayoutWrapper>} />
      <Route path="/GovernanceDetail" element={<LayoutWrapper currentPageName="GovernanceDetail"><GovernanceDetail /></LayoutWrapper>} />
      <Route path="/LaunchpadDetail" element={<LayoutWrapper currentPageName="LaunchpadDetail"><LaunchpadDetail /></LayoutWrapper>} />
      <Route path="/Announcements" element={<LayoutWrapper currentPageName="Announcements"><Announcements /></LayoutWrapper>} />
      <Route path="/Institutional" element={<LayoutWrapper currentPageName="Institutional"><Institutional /></LayoutWrapper>} />
      <Route path="/AssetRegistryDetail" element={<LayoutWrapper currentPageName="AssetRegistryDetail"><AssetRegistryDetail /></LayoutWrapper>} />
      <Route path="/Wallet" element={<LayoutWrapper currentPageName="Wallet"><WalletPage /></LayoutWrapper>} />
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