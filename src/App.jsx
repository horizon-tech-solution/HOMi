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

import AgentDashboard from './pages/agent/AgentDashboard';
import AgentListings from './pages/agent/Listings/AgentListings';
import AgentAddProperty from './pages/agent/Listings/AgentAddProperty';
import AgentLeads from './pages/agent/Leads/AgentLeads';
import AgentProfile from './pages/agent/AgentProfile';
import AgentSettings from './pages/agent/AgentSettings';
import AgentNotifications from './pages/agent/AgentNotifications';


import AdminDashboard from './pages/admin/AdminDashboard';
import AgentVerification from './pages/admin/AgentVerification';
import ReportsAndFlags from './pages/admin/ReportsAndFlags';
import AdminSettings from './pages/admin/AdminSettings';
import UserManagement from './pages/admin/UserManagement';
import ListingsApproval from './pages/admin/ListingsApproval';
import ActivityLog from './pages/admin/ActivityLogs';
import Analytics from './pages/admin/Analytics';



import { User } from 'lucide-react';


// Layout wrapper component
function Layout({ children }) {
  const location = useLocation();
  
  // Pages where Header and Footer should NOT appear
  const noLayoutPages = ['/user/auth', '/user/pro-account', '/user/become-agent', '/admin', '/admin/agents', '/admin/listings', '/admin/users', '/admin/reports', '/admin/settings', '/admin/activity', '/admin/analytics'];
  const hideLayout = noLayoutPages.includes(location.pathname);
  
  // Pages where Footer should NOT appear (but Header should)
  const noFooterPages = ['/properties', '/user/settings', '/user/favorites', '/user/history', '/user/notifications','/user/sell/add-property','/user/home','/agent/home','/agent/listings','/agent/add-property','/agent/leads','/agent/profile', '/agent/settings', '/agent/notifications'];
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

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/find-agent" element={<FindAgent />} />
          <Route path="/sell" element={<Sell />} />

          {/* users  */}

          <Route path="/user/auth" element={<Auth />} />
          <Route path="/user/become-agent" element={<BecomeAgent />} />
          <Route path="/user/pro-account" element={<ProAccount />} />
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/user/favorites" element={<UserFav />} />
          <Route path="/user/history" element={<UserHistory />} />
          <Route path="/user/notifications" element={<UserNotifications />} />
          <Route path="/user/sell/add-property" element={<ListProperty />} />
          <Route path="/user/home" element={<UserDashboard />} />

          {/* Agents */}
          <Route path="/agent/home" element={<AgentDashboard />} />
          <Route path="/agent/listings" element={<AgentListings />} />
          <Route path="/agent/add-property" element={<AgentAddProperty />} />
          <Route path="/agent/leads" element={<AgentLeads />} />
          <Route path="/agent/profile" element={<AgentProfile />} />
          <Route path="/agent/settings" element={<AgentSettings />} />
          <Route path="/agent/notifications" element={<AgentNotifications />} />

          {/* Admin */}

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/agents" element={<AgentVerification />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/reports" element={<ReportsAndFlags />} />
          <Route path="/admin/listings" element={<ListingsApproval />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/activity" element={<ActivityLog />} />
          <Route path="/admin/analytics" element={<Analytics />} />

          
          {/* 
          
          <Route path="/about" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/500" element={<ServerError />} />
          <Route path="/403" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
          */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;