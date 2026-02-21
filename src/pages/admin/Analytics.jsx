import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Building2, UserCheck, MessageSquare,
  ArrowUpRight, ArrowDownRight, Minus, ChevronDown, Download
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const GROWTH_DATA = [
  { month: 'May', users: 312, agents: 41, listings: 198, inquiries: 1240 },
  { month: 'Jun', users: 489, agents: 68, listings: 314, inquiries: 2105 },
  { month: 'Jul', users: 721, agents: 94, listings: 487, inquiries: 3380 },
  { month: 'Aug', users: 1043, agents: 128, listings: 692, inquiries: 5120 },
  { month: 'Sep', users: 1580, agents: 162, listings: 890, inquiries: 7240 },
  { month: 'Oct', users: 2210, agents: 198, listings: 1050, inquiries: 9870 },
  { month: 'Nov', users: 3104, agents: 224, listings: 1180, inquiries: 12400 },
  { month: 'Dec', users: 3921, agents: 247, listings: 1284, inquiries: 15630 },
];

const CITY_DATA = [
  { city: 'Douala', listings: 698, inquiries: 9120 },
  { city: 'Yaoundé', listings: 389, inquiries: 4890 },
  { city: 'Bafoussam', listings: 84, inquiries: 890 },
  { city: 'Limbe', listings: 51, inquiries: 420 },
  { city: 'Kribi', listings: 38, inquiries: 198 },
];

const TYPE_DATA = [
  { name: 'Apartment', value: 412, color: '#18181b' },
  { name: 'House/Villa', value: 289, color: '#52525b' },
  { name: 'Commercial', value: 198, color: '#a1a1aa' },
  { name: 'Land', value: 241, color: '#d4d4d8' },
  { name: 'Duplex', value: 144, color: '#e4e4e7' },
];

const PRICE_RENT = [
  { range: '< 50k', count: 184 }, { range: '50–100k', count: 298 },
  { range: '100–200k', count: 156 }, { range: '200–500k', count: 68 }, { range: '> 500k', count: 15 },
];

const MODERATION_DATA = [
  { month: 'Sep', approved: 198, rejected: 42, flagged: 18 },
  { month: 'Oct', approved: 241, rejected: 38, flagged: 14 },
  { month: 'Nov', approved: 312, rejected: 51, flagged: 22 },
  { month: 'Dec', approved: 389, rejected: 61, flagged: 28 },
];

const FUNNEL = [
  { stage: 'Submitted', value: 1390, pct: 100 },
  { stage: 'Approved', value: 1284, pct: 92 },
  { stage: 'Viewed', value: 980, pct: 76 },
  { stage: 'Inquired', value: 412, pct: 42 },
  { stage: 'Contacted', value: 187, pct: 45 },
];

const HEATMAP = [
  [12, 38, 45, 52, 61, 28, 15],
  [18, 42, 58, 71, 68, 31, 19],
  [22, 51, 72, 84, 79, 36, 21],
  [28, 63, 89, 102, 94, 44, 27],
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TOP_AGENTS = [
  { name: 'Jean-Paul Mbarga', agency: 'CameReal Group', listings: 24, inquiries: 89, rating: 4.8 },
  { name: 'Nadia Essam', agency: 'Essam Realty', listings: 17, inquiries: 54, rating: 4.5 },
  { name: 'Samuel Ekwueme', agency: 'Ekwueme RE', listings: 14, inquiries: 41, rating: 4.2 },
  { name: 'Fatima Al-Rashid', agency: 'Al-Rashid Props', listings: 11, inquiries: 38, rating: 4.6 },
  { name: 'Pierre Nkoulou', agency: 'Nkoulou Immo', listings: 9, inquiries: 27, rating: 3.9 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-3 py-2.5 min-w-28">
      <p className="text-xs font-bold text-zinc-500 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-xs text-zinc-500 capitalize">{p.name}:</span>
          <span className="text-xs font-bold text-zinc-900 ml-auto pl-2">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, prev, format, icon: Icon, sub }) => {
  const diff = prev ? ((value - prev) / prev * 100).toFixed(1) : null;
  const up = diff > 0;
  const flat = diff == 0;
  const display = format === 'k' ? (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value) : value?.toLocaleString();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-zinc-600" />
        </div>
        {diff !== null && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${flat ? 'text-zinc-400' : up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {flat ? <Minus className="w-3 h-3" /> : up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(diff)}%
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-900 mb-0.5">{display}</p>
      <p className="text-xs sm:text-sm text-zinc-500">{label}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5 hidden sm:block">{sub}</p>}
    </div>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 ${className}`}>{children}</div>
);

const SectionHead = ({ title, sub }) => (
  <div className="mb-4">
    <h2 className="text-sm font-bold text-zinc-900">{title}</h2>
    {sub && <p className="text-xs text-zinc-400 mt-0.5 hidden sm:block">{sub}</p>}
  </div>
);

const FunnelBar = ({ stage, value, pct, maxValue }) => {
  const width = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <p className="text-xs text-zinc-500 w-16 sm:w-20 flex-shrink-0 text-right">{stage}</p>
      <div className="flex-1 h-6 sm:h-7 bg-zinc-100 rounded-lg overflow-hidden">
        <div className="h-full bg-zinc-900 rounded-lg flex items-center justify-end pr-2 sm:pr-3 transition-all" style={{ width: `${width}%` }}>
          <span className="text-xs font-bold text-white">{value.toLocaleString()}</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-zinc-400 w-8 flex-shrink-0">{pct}%</p>
    </div>
  );
};

const HeatCell = ({ value, max }) => {
  const intensity = value / max;
  const opacity = 0.08 + intensity * 0.92;
  return (
    <div title={`${value} events`} className="aspect-square rounded-sm sm:rounded-md cursor-default hover:opacity-80 transition-opacity"
      style={{ background: `rgba(24,24,27,${opacity})` }} />
  );
};

const RANGES = ['Last 30 days', 'Last 3 months', 'Last 6 months', 'All time'];

export default function Analytics() {
  const [range, setRange] = useState('Last 6 months');
  const [activeGrowthKeys, setActiveGrowthKeys] = useState(['users', 'listings', 'inquiries']);

  const current = GROWTH_DATA[GROWTH_DATA.length - 1];
  const prev = GROWTH_DATA[GROWTH_DATA.length - 2];
  const heatMax = Math.max(...HEATMAP.flat());
  const approvalRate = Math.round((MODERATION_DATA.reduce((a, d) => a + d.approved, 0) / (MODERATION_DATA.reduce((a, d) => a + d.approved + d.rejected, 0))) * 100);
  const avgInquiries = (current.inquiries / current.listings).toFixed(1);

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Analytics</h1>
            <p className="text-sm text-zinc-400 mt-0.5 hidden sm:block">Platform performance and growth insights.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={range} onChange={e => setRange(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-7 py-2 text-xs sm:text-sm font-semibold text-zinc-700 focus:outline-none cursor-pointer">
                {RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 border border-zinc-200 bg-white rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Primary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <StatCard label="Total Users" value={current.users} prev={prev.users} icon={Users} sub="Registered accounts" />
          <StatCard label="Verified Agents" value={current.agents} prev={prev.agents} icon={UserCheck} sub="Active on platform" />
          <StatCard label="Live Listings" value={current.listings} prev={prev.listings} icon={Building2} sub="Approved & published" />
          <StatCard label="Monthly Inquiries" value={current.inquiries} prev={prev.inquiries} icon={MessageSquare} format="k" sub="User–agent contacts" />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: 'Approval Rate', value: `${approvalRate}%` },
            { label: 'Avg. Inquiries/Listing', value: avgInquiries },
            { label: 'Verification Rate', value: '91%' },
            { label: 'Fraud Report Rate', value: '0.3%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-zinc-200 rounded-xl px-4 py-4">
              <p className="text-lg sm:text-xl font-bold text-zinc-900">{value}</p>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Growth Chart */}
        <Card className="mb-4 sm:mb-6">
          <div className="flex items-start justify-between mb-4 gap-3">
            <SectionHead title="Platform Growth" sub="Users, listings, and monthly inquiries over time" />
            {/* Toggle keys — scrollable on mobile */}
            <div className="flex gap-1 flex-shrink-0 overflow-x-auto">
              {[{ key: 'users', label: 'Users' }, { key: 'listings', label: 'Listings' }, { key: 'inquiries', label: 'Inquiries' }, { key: 'agents', label: 'Agents' }].map(({ key, label }) => {
                const on = activeGrowthKeys.includes(key);
                return (
                  <button key={key} onClick={() => setActiveGrowthKeys(prev => on && prev.length > 1 ? prev.filter(k => k !== key) : [...new Set([...prev, key])])}
                    className={`flex-shrink-0 px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${on ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-400 border-zinc-200 hover:border-zinc-400'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                {['users', 'listings', 'inquiries', 'agents'].map((key, i) => {
                  const colors = ['#18181b', '#71717a', '#a1a1aa', '#d4d4d8'];
                  return (
                    <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[i]} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {activeGrowthKeys.includes('users') && <Area type="monotone" dataKey="users" stroke="#18181b" strokeWidth={2} fill="url(#grad_users)" dot={false} activeDot={{ r: 4, fill: '#18181b' }} />}
              {activeGrowthKeys.includes('listings') && <Area type="monotone" dataKey="listings" stroke="#71717a" strokeWidth={2} fill="url(#grad_listings)" dot={false} activeDot={{ r: 4, fill: '#71717a' }} />}
              {activeGrowthKeys.includes('inquiries') && <Area type="monotone" dataKey="inquiries" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#grad_inquiries)" dot={false} activeDot={{ r: 4, fill: '#a1a1aa' }} />}
              {activeGrowthKeys.includes('agents') && <Area type="monotone" dataKey="agents" stroke="#d4d4d8" strokeWidth={1.5} fill="url(#grad_agents)" dot={false} activeDot={{ r: 4, fill: '#d4d4d8' }} />}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Geographic + Type — stacked on mobile */}
        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="lg:col-span-3">
            <SectionHead title="Listings by City" sub="Active listings per major city" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CITY_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="city" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="listings" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="inquiries" fill="#e4e4e7" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              {[{ color: '#18181b', label: 'Listings' }, { color: '#e4e4e7', label: 'Inquiries' }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-xs text-zinc-400">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <SectionHead title="Property Types" sub="Distribution across all listings" />
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={64} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {TYPE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-1">
              {TYPE_DATA.map(({ name, value, color }) => {
                const total = TYPE_DATA.reduce((a, d) => a + d.value, 0);
                const pct = ((value / total) * 100).toFixed(0);
                return (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-zinc-500 flex-1">{name}</span>
                    <span className="text-xs font-semibold text-zinc-800">{value}</span>
                    <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Price dist + Moderation — stacked mobile */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <SectionHead title="Rental Price Distribution" sub="XAF/month" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={PRICE_RENT} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={44} name="listings" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionHead title="Moderation Overview" sub="Monthly decisions by admin team" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={MODERATION_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={28} name="approved" stackId="a" />
                <Bar dataKey="rejected" fill="#d4d4d8" maxBarSize={28} name="rejected" stackId="a" />
                <Bar dataKey="flagged" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={28} name="flagged" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              {[{ color: '#18181b', label: 'Approved' }, { color: '#d4d4d8', label: 'Rejected' }, { color: '#fbbf24', label: 'Flagged' }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-xs text-zinc-400">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Funnel */}
        <Card className="mb-4 sm:mb-6">
          <SectionHead title="Listing Funnel" sub="From submission to user contact" />
          <div className="space-y-2.5 mt-2">
            {FUNNEL.map(f => <FunnelBar key={f.stage} {...f} maxValue={FUNNEL[0].value} />)}
          </div>
          <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
            Of every 100 approved listings, <strong className="text-zinc-700">42</strong> receive an inquiry and <strong className="text-zinc-700">19</strong> lead to direct contact.
          </p>
        </Card>

        {/* Heatmap */}
        <Card className="mb-4 sm:mb-6">
          <SectionHead title="Weekly Activity Heatmap" sub="Platform events per day — last 4 weeks" />
          <div className="flex gap-2 mt-3 sm:mt-4">
            <div className="flex flex-col justify-around">
              {['W1', 'W2', 'W3', 'W4'].map(w => (
                <span key={w} className="text-xs text-zinc-300 h-6 sm:h-8 flex items-center">{w}</span>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1">
                {DAYS.map(d => <span key={d} className="text-xs text-zinc-300 text-center">{d}</span>)}
              </div>
              {HEATMAP.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                  {week.map((val, di) => <HeatCell key={di} value={val} max={heatMax} />)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 sm:mt-4 justify-end">
            <span className="text-xs text-zinc-400">Less</span>
            {[0.08, 0.3, 0.55, 0.75, 1].map(op => (
              <div key={op} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" style={{ background: `rgba(24,24,27,${op})` }} />
            ))}
            <span className="text-xs text-zinc-400">More</span>
          </div>
        </Card>

        {/* Top Agents */}
        <Card>
          <SectionHead title="Top Agents" sub="Ranked by listings published" />

          {/* Mobile: simple list */}
          <div className="sm:hidden space-y-3 mt-2">
            {TOP_AGENTS.map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-3 py-2.5 border-b border-zinc-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{agent.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{agent.agency}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-zinc-900">{agent.listings}</p>
                  <p className="text-xs text-zinc-400">listings</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-zinc-700">{agent.rating}</p>
                  <p className="text-xs text-zinc-400">rating</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block mt-2">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-zinc-100 mb-1">
              {['Agent', 'Agency', 'Listings', 'Inquiries', 'Rating'].map(h => (
                <p key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {TOP_AGENTS.map((agent, i) => (
              <div key={agent.name} className="grid grid-cols-5 gap-4 py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors rounded-lg -mx-1 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 truncate">{agent.name}</p>
                </div>
                <p className="text-sm text-zinc-500 truncate self-center">{agent.agency}</p>
                <div className="self-center">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${(agent.listings / TOP_AGENTS[0].listings) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 w-6 text-right">{agent.listings}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 self-center font-semibold">{agent.inquiries}</p>
                <div className="flex items-center gap-1 self-center">
                  <span className="text-sm font-bold text-zinc-900">{agent.rating}</span>
                  <span className="text-xs text-zinc-400">/ 5</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
    </AdminNav>
  );
}