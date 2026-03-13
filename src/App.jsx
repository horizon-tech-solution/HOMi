import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/main/Home';
import Properties from './pages/main/Property';
import FindAgent from './pages/main/FindAgent';
import Sell from './pages/main/Sell';

import Auth from './pages/auth/Auth';
import ProAccount from './pages/auth/AgentAuth';
import BecomeAgent from './pages/auth/BecomeAgent';

import UserFav from './pages/user/UserFav';
import UserSettings from './pages/user/UserSettings';
import UserHistory from './pages/user/UserHistory';
import UserNotifications from './pages/user/UserNotification';
import ListProperty from './pages/user/ListProperty';
import UserDashboard from './pages/user/UserDashboard';
import UserMessages from './pages/user/UserMessages.jsx';

import AgentDashboard from './pages/agent/AgentDashboard';
import AgentListings from './pages/agent/Listings/AgentListings';
import AgentAddProperty from './pages/agent/Listings/AgentAddProperty';
import AgentLeads from './pages/agent/Leads/AgentLeads';
import AgentProfile from './pages/agent/AgentProfile';
import AgentSettings from './pages/agent/AgentSettings';
import AgentNotifications from './pages/agent/AgentNotifications';
import AgentEditProperty from './pages/agent/Listings/AgentEditProperty';

import AdminDashboard from './pages/admin/AdminDashboard';
import AgentVerification from './pages/admin/AgentVerification';
import ReportsAndFlags from './pages/admin/ReportsAndFlags';
import AdminSettings from './pages/admin/AdminSettings';
import UserManagement from './pages/admin/UserManagement';
import ListingsApproval from './pages/admin/ListingsApproval';
import ActivityLog from './pages/admin/ActivityLogs';
import Analytics from './pages/admin/Analytics';
import AdminLogin from './pages/auth/AdminLogin';

import AdminRoute from './components/routes/AdminRoute';
import UserRoute from './components/routes/UserRoute';
import AgentRoute from './components/routes/AgentRoute';

import { FavoritesProvider } from './hooks/useFavorites.jsx';

import NotFound from './pages/error/NotFound';


const knownRoutes = [
  '/', '/properties', '/find-agent', '/sell',
  '/auth', '/agent/auth', '/user/become-agent',
  '/user/settings', '/user/favorites', '/user/history',
  '/user/notifications', '/user/sell/add-property', '/user/home',
  '/agent/home', '/agent/listings', '/agent/listings/add',
  '/agent/leads', '/agent/profile', '/agent/settings', '/agent/notifications',
  '/admin/login',
  '/admin', '/admin/agents', '/admin/listings', '/admin/users',
  '/admin/reports', '/admin/settings', '/admin/activity', '/admin/analytics',
];

const noLayoutPages = [
  '/auth', '/agent/auth', '/user/become-agent',
  '/admin/login',
  '/admin', '/admin/agents', '/admin/listings', '/admin/users',
  '/admin/reports', '/admin/settings', '/admin/activity', '/admin/analytics', '/agent/edit-listing/:id', '/user/sell/list-property',
];

const noFooterPages = [
  '/properties', '/user/settings', '/user/favorites', '/user/history',
  '/user/notifications', '/user/sell/add-property', '/user/home',
  '/agent/home', '/agent/listings', '/agent/listings/add',
  '/agent/leads', '/agent/profile', '/agent/settings', '/agent/notifications','user/messsage',
];


function Layout({ children }) {
  const location = useLocation();

  const is404 = !knownRoutes.includes(location.pathname);
  const hideLayout = noLayoutPages.includes(location.pathname) || is404;
  const hideFooter = noFooterPages.includes(location.pathname) || hideLayout;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Header />}
      <main className={hideLayout ? '' : 'flex-grow'}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}


function AppRoutes() {
  return (
    <FavoritesProvider>
      <Layout>
        <Routes>

          {/* ── Public ──────────────────────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/find-agent" element={<FindAgent />} />
          <Route path="/agent/:id" element={<FindAgent />} />
          <Route path="/sell" element={<Sell />} />

          {/* ── Auth ────────────────────────────────────────────────────────── */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/user/become-agent" element={<BecomeAgent />} />
          <Route path="/agent/auth" element={<ProAccount />} />

          {/* ── User (must be logged in) ─────────────────────────────────────── */}
          <Route path="/user/home"                element={<UserRoute><UserDashboard /></UserRoute>} />
          <Route path="/user/settings"            element={<UserRoute><UserSettings /></UserRoute>} />
          <Route path="/user/favorites"           element={<UserRoute><UserFav /></UserRoute>} />
          <Route path="/user/history"             element={<UserRoute><UserHistory /></UserRoute>} />
          <Route path="/user/notifications"       element={<UserRoute><UserNotifications /></UserRoute>} />
          <Route path="/user/sell/add-property"   element={<UserRoute><ListProperty /></UserRoute>} />
          <Route path="/user/sell/list-property"  element={<UserRoute><ListProperty /></UserRoute>} />
          <Route path="/user/messages"            element={<UserRoute><UserMessages /></UserRoute>} />
          
          {/* ── Agent (must be logged in AND role === 'agent') ───────────────── */}
          <Route path="/agent/home"             element={<AgentRoute><AgentDashboard /></AgentRoute>} />
          <Route path="/agent/listings"         element={<AgentRoute><AgentListings /></AgentRoute>} />
          <Route path="/agent/listings/add"     element={<AgentRoute><AgentAddProperty /></AgentRoute>} />
          <Route path="/agent/leads"            element={<AgentRoute><AgentLeads /></AgentRoute>} />
          <Route path="/agent/profile"          element={<AgentRoute><AgentProfile /></AgentRoute>} />
          <Route path="/agent/settings"         element={<AgentRoute><AgentSettings /></AgentRoute>} />
          <Route path="/agent/notifications"    element={<AgentRoute><AgentNotifications /></AgentRoute>} />
          <Route path="/agent/edit-listing/:id" element={<AgentRoute><AgentEditProperty /></AgentRoute>} />

          {/* ── Admin ───────────────────────────────────────────────────────── */}
          <Route path="/admin/login"      element={<AdminLogin />} />
          <Route path="/admin"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/agents"     element={<AdminRoute><AgentVerification /></AdminRoute>} />
          <Route path="/admin/users"      element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/reports"    element={<AdminRoute><ReportsAndFlags /></AdminRoute>} />
          <Route path="/admin/listings"   element={<AdminRoute><ListingsApproval /></AdminRoute>} />
          <Route path="/admin/settings"   element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/activity"   element={<AdminRoute><ActivityLog /></AdminRoute>} />
          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />

          {/* ── 404 ─────────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Layout>
    </FavoritesProvider>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;