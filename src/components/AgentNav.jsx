import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Bell,
  PlusCircle
} from 'lucide-react';

const AgentNav = ({ unreadLeads = 0, unreadNotifications = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/agent/home', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agent/listings', label: 'My Listings', icon: Building2 },
    { path: '/agent/add-property', label: 'Add Property', icon: PlusCircle },
    { path: '/agent/leads', label: 'Leads', icon: Users, badge: unreadLeads },
    { path: '/agent/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { path: '/agent/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar -mb-px">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  py-4 px-1 border-b-2 font-medium whitespace-nowrap relative transition-colors
                  ${isActive(item.path)
                    ? 'border-amber-600 text-gray-900 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AgentNav;