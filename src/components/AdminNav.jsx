import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Users,
  Flag,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  BarChart2,
  ChevronRight,
  Dot
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',           path: '/admin' },
  { icon: Building2,       label: 'Listings',           path: '/admin/listings',  badge: 14 },
  { icon: UserCheck,       label: 'Agent Verification', path: '/admin/agents',    badge: 6 },
  { icon: Users,           label: 'Users',              path: '/admin/users' },
  { icon: Flag,            label: 'Reports',            path: '/admin/reports',   badge: 3 },
  { icon: Activity,        label: 'Activity Log',       path: '/admin/activity' },
  { icon: BarChart2,       label: 'Analytics',          path: '/admin/analytics' },
  { icon: Settings,        label: 'Settings',           path: '/admin/settings' },
];

export default function AdminNav({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const active = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col w-60 border-r border-zinc-200
          bg-white transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-zinc-200 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-900 tracking-tight">Propty Admin</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ icon: Icon, label, path, badge }) => {
            const isActive = active(path);
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setOpen(false); }}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2 mb-0.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge ? (
                  <span className={`
                    text-xs font-bold px-1.5 py-0.5 rounded-md
                    ${isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}
                  `}>
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="px-3 py-4 border-t border-zinc-200 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">Super Admin</p>
              <p className="text-xs text-zinc-400 truncate">admin@propty.cm</p>
            </div>
            <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile + global actions) */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-zinc-200 bg-white flex-shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-zinc-400">
            <span className="text-zinc-900 font-medium">
              {NAV.find(n => active(n.path))?.label || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors">
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-zinc-50">
          {children}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </div>
  );
}