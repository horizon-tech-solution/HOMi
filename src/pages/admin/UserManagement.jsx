import { useState } from 'react';
import {
  Search, User, Shield, Ban, Trash2, X, Mail, Phone,
  Calendar, Clock, Building2, Heart, MessageSquare, AlertTriangle,
  CheckCircle, ChevronRight, Flag, ExternalLink, Send, RotateCcw,
  Eye, MoreHorizontal
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const USERS = [
  {
    id: 'u_001', name: 'Kofi Asante', email: 'kofi.asante@gmail.com', phone: '+237 677 123 456',
    role: 'user', status: 'active', joined: '2025-01-15', lastActive: '2 hours ago',
    listings: 2, favorites: 8, inquiries: 12, reports: 0, verified: true,
    totalSpend: null,
    activityLog: [
      { type: 'inquiry', text: 'Sent inquiry for "Modern 3BR in Bonanjo"', time: '2h ago' },
      { type: 'favorite', text: 'Saved "Luxury Villa in Bastos" to favorites', time: '1d ago' },
      { type: 'listing', text: 'Submitted listing "Land 300m² in Bepanda"', time: '3d ago' },
      { type: 'login', text: 'Logged in from Douala, CM', time: '3d ago' },
    ],
    recentListings: [
      { id: 1, title: 'Land 300m² in Bepanda', status: 'approved', price: '8,000,000 XAF' },
      { id: 2, title: 'Studio — Akwa', status: 'pending', price: '35,000 XAF/mo' },
    ],
  },
  {
    id: 'u_002', name: 'Amara Diallo', email: 'amara.d@outlook.com', phone: '+237 699 234 567',
    role: 'user', status: 'active', joined: '2025-02-03', lastActive: '1 day ago',
    listings: 1, favorites: 15, inquiries: 7, reports: 0, verified: true,
    activityLog: [
      { type: 'inquiry', text: 'Sent inquiry for "Commercial Space Akwa"', time: '1d ago' },
      { type: 'favorite', text: 'Saved 3 new properties', time: '2d ago' },
    ],
    recentListings: [
      { id: 3, title: 'Duplex in Makepe', status: 'approved', price: '95,000 XAF/mo' },
    ],
  },
  {
    id: 'a_003', name: 'Jean-Paul Mbarga', email: 'jp.mbarga@camereal.cm', phone: '+237 655 234 567',
    role: 'agent', status: 'active', agencyName: 'CameReal Group', joined: '2023-10-01', lastActive: '30 min ago',
    listings: 24, favorites: 0, inquiries: 89, reports: 0, verified: true,
    activityLog: [
      { type: 'listing', text: 'Published "3BR in Akwa" — approved', time: '30m ago' },
      { type: 'inquiry', text: 'Responded to 4 inquiries', time: '2h ago' },
      { type: 'listing', text: 'Submitted "Commercial 500m²" for review', time: '1d ago' },
    ],
    recentListings: [
      { id: 4, title: 'Modern 3BR in Akwa', status: 'approved', price: '80,000 XAF/mo' },
      { id: 5, title: 'Commercial 500m²', status: 'pending', price: '300,000 XAF/mo' },
    ],
  },
  {
    id: 'u_005', name: 'Kwame Boateng', email: 'kwame.b@yahoo.com', phone: '+237 677 567 890',
    role: 'user', status: 'blocked', joined: '2024-03-10', lastActive: '2 weeks ago',
    listings: 0, favorites: 3, inquiries: 2, reports: 4, verified: false,
    blockReason: 'Repeated spam inquiries and abusive messages sent to multiple agents.',
    blockedAt: '2024-06-15',
    activityLog: [
      { type: 'block', text: 'Account blocked by Admin — spam violation', time: '6mo ago' },
      { type: 'report', text: 'Report #34 confirmed — abusive messages', time: '6mo ago' },
      { type: 'report', text: 'Report #28 received — spam inquiries', time: '7mo ago' },
    ],
    recentListings: [],
  },
  {
    id: 'u_006', name: 'Fatou Camara', email: 'fatou.c@email.cm', phone: '+237 677 789 012',
    role: 'user', status: 'active', joined: '2025-04-22', lastActive: '5 hours ago',
    listings: 0, favorites: 22, inquiries: 5, reports: 0, verified: true,
    activityLog: [
      { type: 'inquiry', text: 'Sent inquiry for "Villa in Bastos"', time: '5h ago' },
      { type: 'favorite', text: 'Saved 5 properties to favorites', time: '1d ago' },
    ],
    recentListings: [],
  },
  {
    id: 'u_fraud', name: 'Marcus Njoume', email: 'marcus.nj@yahoo.com', phone: '+237 699 000 001',
    role: 'user', status: 'blocked', joined: '2024-11-01', lastActive: '3 weeks ago',
    listings: 5, favorites: 0, inquiries: 0, reports: 8, verified: false,
    blockReason: 'Verified fraud — submitted 5 fake listings with stolen photos. Financial scam confirmed.',
    blockedAt: '2024-12-10',
    activityLog: [
      { type: 'block', text: 'Account blocked — fraud investigation', time: '1w ago' },
      { type: 'report', text: '3 fraud reports confirmed by admin', time: '1w ago' },
      { type: 'listing', text: 'Submitted 5 fraudulent listings', time: '2w ago' },
    ],
    recentListings: [
      { id: 6, title: 'Duplex in Omnisports', status: 'rejected', price: '10,000,000 XAF' },
    ],
  },
];

const ROLE_TABS = ['All', 'Users', 'Agents', 'Blocked'];

const activityIcon = {
  inquiry: MessageSquare,
  favorite: Heart,
  listing: Building2,
  login: User,
  block: Ban,
  report: Flag,
};

/* ─── User Detail Panel ──────────────────────────────────── */
function UserDetail({ user: initialUser, onClose, onBlock, onUnblock, onDelete }) {
  const [user] = useState(initialUser);
  const [tab, setTab] = useState('overview');
  const [blockReason, setBlockReason] = useState('');
  const [showBlock, setShowBlock] = useState(false);
  const [msgText, setMsgText] = useState('');

  const isBlocked = user.status === 'blocked';
  const isAgent = user.role === 'agent';

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white h-full flex flex-col overflow-hidden border-l border-zinc-200 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                {user.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                {isBlocked && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Blocked</span>}
              </div>
              <p className="text-xs text-zinc-400 capitalize">
                {user.role}{user.agencyName ? ` · ${user.agencyName}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
          {['overview', 'listings', 'activity'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 mr-5 text-xs font-semibold border-b-2 transition-colors capitalize ${
                tab === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {tab === 'overview' && (
            <div className="px-6 py-5 space-y-6">

              {/* Block reason banner */}
              {isBlocked && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Account Blocked
                  </p>
                  <p className="text-sm text-red-600">{user.blockReason}</p>
                  {user.blockedAt && <p className="text-xs text-red-400 mt-1.5">Blocked on {user.blockedAt}</p>}
                </div>
              )}

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Contact</p>
                <div className="space-y-2.5">
                  {[
                    { icon: Mail, label: 'Email', value: user.email },
                    { icon: Phone, label: 'Phone', value: user.phone },
                    { icon: Calendar, label: 'Member since', value: new Date(user.joined).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: Clock, label: 'Last active', value: user.lastActive },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-zinc-50">
                      <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-400">{label}</p>
                        <p className="text-sm text-zinc-800 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Account Stats</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Building2, label: 'Listings', value: user.listings, color: 'text-zinc-600' },
                    { icon: Heart, label: 'Favorites', value: user.favorites, color: 'text-zinc-600' },
                    { icon: MessageSquare, label: 'Inquiries', value: user.inquiries, color: 'text-zinc-600' },
                    { icon: Flag, label: 'Reports', value: user.reports, color: user.reports > 0 ? 'text-red-500' : 'text-zinc-600' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="border border-zinc-100 rounded-lg py-3 text-center">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                      <p className={`text-base font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports alert */}
              {user.reports > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">{user.reports} reports against this user</p>
                    <button className="text-xs text-red-500 hover:text-red-700 mt-0.5 transition-colors">
                      View reports →
                    </button>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message User</p>
                <textarea
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="Send a message to this user..."
                  rows={3}
                  className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2"
                />
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                Listings ({user.recentListings.length})
              </p>
              {user.recentListings.length === 0 ? (
                <div className="py-12 text-center">
                  <Building2 className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-sm text-zinc-300">No listings</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.recentListings.map(l => (
                    <div key={l.id} className="flex items-center gap-3 py-3 border-b border-zinc-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{l.title}</p>
                        <p className="text-xs text-zinc-400">{l.price}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : l.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {l.status}
                      </span>
                      <button className="text-zinc-300 hover:text-zinc-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Activity Timeline</p>
              <div className="space-y-3">
                {user.activityLog.map((ev, i, arr) => {
                  const Icon = activityIcon[ev.type] || Clock;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        {i < arr.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-1.5" />}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <p className="text-sm text-zinc-700">{ev.text}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{ev.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0 space-y-3">
          {showBlock && !isBlocked && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500">Reason for blocking</p>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Explain why this user is being blocked..."
                rows={2}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowBlock(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                <button
                  onClick={() => blockReason.trim() && onBlock(user, blockReason)}
                  disabled={!blockReason.trim()}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          )}

          {!showBlock && (
            <div className="flex gap-2">
              {!isBlocked && (
                <button
                  onClick={() => setShowBlock(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Ban className="w-4 h-4" /> Block
                </button>
              )}
              {isBlocked && (
                <button
                  onClick={() => onUnblock(user)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Unblock
                </button>
              )}
              <button
                onClick={() => onDelete(user)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              {isAgent && (
                <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors">
                  <ExternalLink className="w-4 h-4" /> View as Agent
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── User Row ────────────────────────────────────────────── */
function UserRow({ user, onClick }) {
  const roleCls = user.role === 'agent'
    ? 'bg-zinc-900 text-white'
    : 'bg-zinc-100 text-zinc-600';
  const statusDot = user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400';

  return (
    <tr onClick={onClick} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusDot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${roleCls}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">
        {user.agencyName || '—'}
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">
        {new Date(user.joined).toLocaleDateString()}
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{user.listings}</td>
      <td className="px-4 py-3.5 text-xs text-zinc-400">{user.lastActive}</td>
      <td className="px-4 py-3.5">
        {user.reports > 0 ? (
          <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
            <AlertTriangle className="w-3 h-3" /> {user.reports}
          </span>
        ) : <span className="text-xs text-zinc-200">—</span>}
      </td>
    </tr>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(USERS);
  const [selected, setSelected] = useState(null);

  const onBlock = (user, reason) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'blocked', blockReason: reason, blockedAt: new Date().toISOString().slice(0, 10) } : u));
    setSelected(null);
  };
  const onUnblock = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active', blockReason: undefined } : u));
    setSelected(null);
  };
  const onDelete = (user) => {
    if (window.confirm(`Permanently delete ${user.name}'s account?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setSelected(null);
    }
  };

  const counts = {
    All: users.length,
    Users: users.filter(u => u.role === 'user' && u.status !== 'blocked').length,
    Agents: users.filter(u => u.role === 'agent' && u.status !== 'blocked').length,
    Blocked: users.filter(u => u.status === 'blocked').length,
  };

  const filtered = users.filter(u => {
    const tabMatch =
      activeTab === 'All' ||
      (activeTab === 'Users' && u.role === 'user' && u.status !== 'blocked') ||
      (activeTab === 'Agents' && u.role === 'agent' && u.status !== 'blocked') ||
      (activeTab === 'Blocked' && u.status === 'blocked');
    const q = search.toLowerCase();
    const searchMatch = !q || [u.name, u.email, u.phone, u.agencyName || ''].some(f => f.toLowerCase().includes(q));
    return tabMatch && searchMatch;
  });

  const selectedUser = selected ? users.find(u => u.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {selectedUser && (
          <UserDetail
            user={selectedUser}
            onClose={() => setSelected(null)}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onDelete={onDelete}
          />
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Manage all platform users, agents, and account access.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Accounts', value: users.length },
            { label: 'Regular Users', value: counts.Users },
            { label: 'Active Agents', value: counts.Agents },
            { label: 'Blocked', value: counts.Blocked },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl px-4 py-4">
              <p className="text-xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-5">
          {ROLE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {t}
              <span className={`ml-1.5 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['User', 'Role', 'Agency', 'Joined', 'Listings', 'Last Active', 'Reports'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <UserRow key={u.id} user={u} onClick={() => setSelected(u)} />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <User className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-300">No users found</p>
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
}