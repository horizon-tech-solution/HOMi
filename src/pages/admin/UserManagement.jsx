import { useState, useEffect, useCallback } from 'react';
import {
  Search, User, Shield, Ban, Trash2, X, Mail, Phone,
  Calendar, Clock, Building2, Heart, MessageSquare, AlertTriangle,
  CheckCircle, Flag, ExternalLink, Send, RotateCcw, Loader2
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { fetchUsers, blockUser, unblockUser, deleteUser } from '../../api/admin/users';

const ROLE_TABS = ['All', 'Users', 'Agents', 'Blocked'];

const activityIcon = {
  inquiry: MessageSquare, favorite: Heart, listing: Building2,
  login: User, block: Ban, report: Flag,
};

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function UserDetail({ user, onClose, onBlock, onUnblock, onDelete }) {
  const [tab, setTab]             = useState('overview');
  const [blockReason, setBlockReason] = useState('');
  const [showBlock, setShowBlock] = useState(false);
  const [msgText, setMsgText]     = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const isBlocked = user.status === 'blocked';
  const isAgent   = user.role === 'agent';

  const handleAction = async (fn, label) => {
    setActionLoading(label);
    try { await fn(); } catch (err) { alert(`${label} failed: ${err.message}`); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
      <div className="w-full sm:max-w-xl bg-white h-full flex flex-col overflow-hidden sm:border-l border-zinc-200 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                {user.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                {isBlocked && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Blocked</span>}
              </div>
              <p className="text-xs text-zinc-400 capitalize">{user.role}{user.agencyName ? ` · ${user.agencyName}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-4 sm:px-6 flex-shrink-0">
          {['overview', 'listings', 'activity'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 mr-5 text-xs font-semibold border-b-2 transition-colors capitalize ${tab === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="px-4 sm:px-6 py-5 space-y-6">
              {isBlocked && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> Account Blocked</p>
                  <p className="text-sm text-red-600">{user.blockReason}</p>
                  {user.blockedAt && <p className="text-xs text-red-400 mt-1.5">Blocked on {user.blockedAt}</p>}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Contact</p>
                <div className="space-y-2">
                  {[
                    { icon: Mail,     label: 'Email',        value: user.email },
                    { icon: Phone,    label: 'Phone',        value: user.phone },
                    { icon: Calendar, label: 'Member since', value: new Date(user.joined).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: Clock,    label: 'Last active',  value: user.lastActive },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-zinc-50">
                      <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400">{label}</p>
                        <p className="text-sm text-zinc-800 mt-0.5 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Stats</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Building2,    label: 'Listings',  value: user.listings,  warn: false },
                    { icon: Heart,        label: 'Saved',     value: user.favorites, warn: false },
                    { icon: MessageSquare,label: 'Inquiries', value: user.inquiries, warn: false },
                    { icon: Flag,         label: 'Reports',   value: user.reports,   warn: user.reports > 0 },
                  ].map(({ icon: Icon, label, value, warn }) => (
                    <div key={label} className="border border-zinc-100 rounded-lg py-3 text-center">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${warn ? 'text-red-400' : 'text-zinc-400'}`} />
                      <p className={`text-base font-bold ${warn ? 'text-red-500' : 'text-zinc-900'}`}>{value}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {user.reports > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-700">{user.reports} reports against this user</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message User</p>
                <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Send a message..." rows={3}
                  className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2" />
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="px-4 sm:px-6 py-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Listings ({user.recentListings?.length ?? 0})</p>
              {!user.recentListings?.length ? (
                <div className="py-12 text-center"><Building2 className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No listings</p></div>
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
                        : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="px-4 sm:px-6 py-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Activity Timeline</p>
              {!user.activityLog?.length ? (
                <div className="py-12 text-center"><Clock className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No activity</p></div>
              ) : (
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
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0 space-y-3">
          {showBlock && !isBlocked && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500">Reason for blocking</p>
              <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Explain why..." rows={2}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300" />
              <div className="flex gap-2">
                <button onClick={() => setShowBlock(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg">Cancel</button>
                <button onClick={() => blockReason.trim() && handleAction(() => onBlock(user, blockReason), 'Block')} disabled={!blockReason.trim() || actionLoading === 'Block'}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {actionLoading === 'Block' && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Block
                </button>
              </div>
            </div>
          )}
          {!showBlock && (
            <div className="flex gap-2">
              {!isBlocked && (
                <button onClick={() => setShowBlock(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <Ban className="w-4 h-4" /> Block
                </button>
              )}
              {isBlocked && (
                <button onClick={() => handleAction(() => onUnblock(user), 'Unblock')} disabled={actionLoading === 'Unblock'}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50">
                  {actionLoading === 'Unblock' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Unblock
                </button>
              )}
              <button onClick={() => handleAction(() => onDelete(user), 'Delete')} disabled={actionLoading === 'Delete'}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50">
                {actionLoading === 'Delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

function UserCard({ user, onClick }) {
  const statusDot = user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400';
  return (
    <div onClick={onClick} className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user.name.charAt(0)}</span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusDot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
            {user.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === 'agent' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
            {user.role}
          </span>
          {user.reports > 0 && (
            <div className="flex items-center gap-1 text-red-500 mt-1 justify-end">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-semibold">{user.reports}</span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-50">
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-800">{user.listings}</p>
          <p className="text-xs text-zinc-400">Listings</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-800">{user.inquiries}</p>
          <p className="text-xs text-zinc-400">Inquiries</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400">{user.lastActive}</p>
          <p className="text-xs text-zinc-300">last seen</p>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onClick }) {
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
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${user.role === 'agent' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{user.agencyName || '—'}</td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{new Date(user.joined).toLocaleDateString()}</td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{user.listings}</td>
      <td className="px-4 py-3.5 text-xs text-zinc-400">{user.lastActive}</td>
      <td className="px-4 py-3.5">
        {user.reports > 0
          ? <span className="flex items-center gap-1 text-xs text-red-500 font-semibold"><AlertTriangle className="w-3 h-3" />{user.reports}</span>
          : <span className="text-xs text-zinc-200">—</span>}
      </td>
    </tr>
  );
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');
  const [users, setUsers]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers({ search: debouncedSearch, role: activeTab });
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab]);

  useEffect(() => { load(); }, [load]);

  const onBlock = async (user, reason) => {
    try {
      await blockUser(user.id, reason);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'blocked', blockReason: reason, blockedAt: new Date().toISOString().slice(0, 10) } : u));
      setSelected(null);
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const onUnblock = async (user) => {
    try {
      await unblockUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active', blockReason: undefined } : u));
      setSelected(null);
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const onDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}'s account?`)) return;
    try {
      await deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setSelected(null);
    } catch (err) { alert('Failed: ' + err.message); }
  };

  // Derive local counts from loaded data
  const counts = {
    All:     users.length,
    Users:   users.filter(u => u.role === 'user'  && u.status !== 'blocked').length,
    Agents:  users.filter(u => u.role === 'agent' && u.status !== 'blocked').length,
    Blocked: users.filter(u => u.status === 'blocked').length,
  };

  const selectedUser = selected ? users.find(u => u.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelected(null)} onBlock={onBlock} onUnblock={onUnblock} onDelete={onDelete} />}

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Manage all platform users, agents, and account access.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {[
            { label: 'Total Accounts',  value: counts.All },
            { label: 'Regular Users',   value: counts.Users },
            { label: 'Active Agents',   value: counts.Agents },
            { label: 'Blocked',         value: counts.Blocked },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl px-4 py-4">
              <p className="text-xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
        </div>

        <div className="flex gap-0.5 mb-5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {ROLE_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}>
              {t} <span className={`ml-1 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button onClick={load} className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50">Retry</button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden grid grid-cols-1 gap-3">
              {users.length === 0
                ? <div className="py-16 text-center"><User className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No users found</p></div>
                : users.map(u => <UserCard key={u.id} user={u} onClick={() => setSelected(u)} />)
              }
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      {['User', 'Role', 'Agency', 'Joined', 'Listings', 'Last Active', 'Reports'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => <UserRow key={u.id} user={u} onClick={() => setSelected(u)} />)}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="py-16 text-center"><User className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No users found</p></div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminNav>
  );
}