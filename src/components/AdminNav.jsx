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
  Shield,
  Activity,
  BarChart2,
  MoreHorizontal,
  X,
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',     path: '/admin' },
  { icon: Building2,       label: 'Listings',     path: '/admin/listings',  badge: 14 },
  { icon: UserCheck,       label: 'Agents',       path: '/admin/agents',    badge: 6 },
  { icon: Users,           label: 'Users',        path: '/admin/users' },
  { icon: Flag,            label: 'Reports',      path: '/admin/reports',   badge: 3 },
  { icon: Activity,        label: 'Activity',     path: '/admin/activity' },
  { icon: BarChart2,       label: 'Analytics',    path: '/admin/analytics' },
  { icon: Settings,        label: 'Settings',     path: '/admin/settings' },
];

// First 4 shown in bottom bar, rest in "More" sheet
const TAB_ITEMS = NAV.slice(0, 4);
const MORE_ITEMS = NAV.slice(4);

export default function AdminNav({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const active = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  const isMoreActive = MORE_ITEMS.some(n => active(n.path));

  const go = (path) => {
    navigate(path);
    setMoreOpen(false);
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-zinc-200 bg-white fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-zinc-200 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-900 tracking-tight">Propty Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ icon: Icon, label, path, badge }) => {
            const isActive = active(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 mb-0.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge ? (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Profile */}
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-zinc-200 bg-white flex-shrink-0 sticky top-0 z-20">
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Propty Admin</span>
          </div>

          {/* Desktop: breadcrumb */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-zinc-400">
            <span className="text-zinc-900 font-medium">
              {NAV.find(n => active(n.path))?.label || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-auto bg-zinc-50 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200">
        <div className="flex items-stretch h-16">
          {TAB_ITEMS.map(({ icon: Icon, label, path, badge }) => {
            const isActive = active(path);
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
              >
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  isActive ? 'bg-zinc-900' : ''
                }`}>
                  <Icon className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`} />
                  {badge ? (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-amber-400 text-zinc-900 text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-zinc-900' : 'text-zinc-400'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
              isMoreActive ? 'bg-zinc-900' : ''
            }`}>
              <MoreHorizontal className={`w-[18px] h-[18px] ${isMoreActive ? 'text-white' : 'text-zinc-400'}`} />
              {MORE_ITEMS.some(n => n.badge) && !isMoreActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-semibold ${isMoreActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
              More
            </span>
          </button>
        </div>

        {/* Safe area spacer for iOS */}
        <div className="h-safe-bottom bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>

      {/* ── "More" bottom sheet ── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <span className="text-sm font-bold text-zinc-900">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            {/* Items */}
            <div className="px-4 py-3 space-y-1">
              {MORE_ITEMS.map(({ icon: Icon, label, path, badge }) => {
                const isActive = active(path);
                return (
                  <button
                    key={path}
                    onClick={() => go(path)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {badge ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Profile row */}
            <div className="mx-4 mb-4 mt-2 p-4 bg-zinc-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Super Admin</p>
                <p className="text-xs text-zinc-400">admin@propty.cm</p>
              </div>
              <button className="text-zinc-400 p-2 rounded-lg hover:bg-zinc-200 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Safe area */}
            <div style={{ height: 'env(safe-area-inset-bottom)' }} />
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </div>
  );
}