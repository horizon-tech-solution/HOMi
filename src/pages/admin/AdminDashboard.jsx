import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, UserCheck, Users, Flag, CheckCircle,
  Clock, AlertTriangle, TrendingUp, TrendingDown,
  ChevronRight, Activity
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

const Pill = ({ children, color }) => {
  const cls = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  }[color] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, sub, trend, trendUp, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 text-left hover:border-zinc-300 hover:shadow-sm transition-all active:scale-[0.98]"
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-zinc-600" />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend}
        </span>
      )}
    </div>
    <p className="text-xl sm:text-2xl font-bold text-zinc-900 mb-0.5">{fmt(value)}</p>
    <p className="text-xs sm:text-sm text-zinc-500 leading-tight">{label}</p>
    {sub && <p className="text-xs text-zinc-400 mt-1 hidden sm:block">{sub}</p>}
  </button>
);

const PendingRow = ({ item, onApprove, onView }) => {
  const typeColor = {
    listing: { pill: 'zinc', label: 'Listing' },
    agent: { pill: 'amber', label: 'Agent' },
  }[item.type];

  return (
    <div className="py-3.5 border-b border-zinc-100 last:border-0">
      {/* Mobile: stacked */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-zinc-900 truncate">{item.title}</p>
            <Pill color={typeColor.pill}>{typeColor.label}</Pill>
          </div>
          <p className="text-xs text-zinc-400 mb-2">{item.meta}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{item.age}</span>
            <div className="flex gap-1.5 ml-auto sm:ml-0">
              <button onClick={() => onView(item)} className="px-3 py-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                Review
              </button>
              <button onClick={() => onApprove(item)} className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityRow = ({ a }) => {
  const dot = { approved: 'bg-emerald-400', rejected: 'bg-red-400', pending: 'bg-amber-400', flagged: 'bg-orange-400' }[a.status] || 'bg-zinc-300';
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="mt-1.5 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-800 leading-snug">{a.text}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{a.time}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Listings', value: 1284, sub: '14 pending approval', trend: '+12%', trendUp: true, icon: Building2, path: '/admin/listings' },
    { label: 'Registered Users', value: 3921, sub: '48 joined this week', trend: '+8%', trendUp: true, icon: Users, path: '/admin/users' },
    { label: 'Verified Agents', value: 247, sub: '6 pending review', trend: '+3%', trendUp: true, icon: UserCheck, path: '/admin/agents' },
    { label: 'Open Reports', value: 3, sub: '1 high priority', trend: '-2', trendUp: true, icon: Flag, path: '/admin/reports' },
    { label: 'Approved Today', value: 28, sub: 'Listings & agents', icon: CheckCircle, path: '/admin/activity' },
    { label: 'Blocked Accounts', value: 12, sub: 'Fraud violations', icon: AlertTriangle, path: '/admin/users' },
    { label: 'Monthly Inquiries', value: 8420, trend: '+21%', trendUp: true, icon: Activity, path: '/admin/analytics' },
    { label: 'Avg. Response Time', value: '4h', sub: 'Admin resolution avg', icon: Clock, path: '/admin/activity' },
  ];

  const [pending] = useState([
    { id: 1, title: 'Modern 3BR Apartment — Bonanjo, Douala', meta: 'by @kofi_asante · 3 beds · 120 m² · 75,000 XAF/mo', type: 'listing', age: '2h ago' },
    { id: 2, title: 'Samuel Ekwueme — Agent Application', meta: 'CameReal Group · Douala · License submitted', type: 'agent', age: '3h ago' },
    { id: 3, title: 'Commercial Office 200m² — Akwa, Douala', meta: 'by @agent_jean · For Rent · 200,000 XAF/mo', type: 'listing', age: '5h ago' },
    { id: 4, title: 'Fatima Al-Rashid — Agent Application', meta: 'Al-Rashid Properties · Yaoundé · License submitted', type: 'agent', age: '1d ago' },
    { id: 5, title: 'Land 500m² — Bonapriso, Douala', meta: 'by @user_amara · For Sale · 45,000,000 XAF', type: 'listing', age: '1d ago' },
  ]);

  const activity = [
    { status: 'approved', text: 'Luxury Villa in Bastos approved by Admin', time: '5 minutes ago' },
    { status: 'approved', text: 'Agent Jean-Paul Mbarga verified — CameReal Group', time: '18 minutes ago' },
    { status: 'rejected', text: 'Studio in Akwa rejected — insufficient photo quality', time: '1 hour ago' },
    { status: 'flagged', text: 'Report #45 flagged — user @kwame_b · spam', time: '2 hours ago' },
    { status: 'pending', text: '3BR Apartment in Bonanjo submitted for review', time: '3 hours ago' },
    { status: 'approved', text: 'Agent Nadia Essam verified — Essam Realty', time: '4 hours ago' },
    { status: 'rejected', text: 'Listing #1018 rejected — price anomaly detected', time: '6 hours ago' },
    { status: 'approved', text: 'Land listing in Bonapriso approved', time: '8 hours ago' },
  ];

  const health = [
    { label: 'Listings approved within 24h', pct: 82 },
    { label: 'Agent verifications complete', pct: 91 },
    { label: 'Reports resolved < 48h', pct: 74 },
    { label: 'Active listings vs total', pct: 88 },
  ];

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Good morning, Admin 👋</h1>
          <p className="text-sm text-zinc-400 mt-1">Here's what needs your attention today.</p>
        </div>

        {/* Stats grid — 2 cols mobile, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} onClick={() => navigate(s.path)} />
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">

          {/* Pending — full width mobile, 3 cols desktop */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-zinc-100">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Pending Approvals</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{pending.length} items awaiting review</p>
                </div>
                <button onClick={() => navigate('/admin/listings')} className="text-xs text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors flex-shrink-0">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-4 sm:px-5">
                {pending.map(item => (
                  <PendingRow
                    key={item.id}
                    item={item}
                    onApprove={() => { }}
                    onView={() => navigate(item.type === 'listing' ? '/admin/listings' : '/admin/agents')}
                  />
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-zinc-100">
                <h2 className="text-sm font-bold text-zinc-900">Platform Health</h2>
              </div>
              <div className="px-4 sm:px-5 py-3 space-y-4">
                {health.map((h, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-zinc-500">{h.label}</span>
                      <span className="text-xs font-semibold text-zinc-900">{h.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full transition-all" style={{ width: `${h.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity — full width mobile, 2 cols desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-zinc-100">
                <h2 className="text-sm font-bold text-zinc-900">Recent Activity</h2>
                <button onClick={() => navigate('/admin/activity')} className="text-xs text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                  Full log <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-4 sm:px-5">
                {activity.map((a, i) => (
                  <ActivityRow key={i} a={a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminNav>
  );
}