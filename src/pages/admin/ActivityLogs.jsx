import { useState } from 'react';
import {
  Activity, Search, CheckCircle, XCircle, Ban, Shield, Flag, Trash2,
  MessageSquare, UserCheck, Clock, AlertTriangle, Download
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const LOG = [
  { id: 1, action: 'listing_approved', actor: 'Admin', target: 'Luxury Villa in Bastos (#1024)', detail: 'Listing approved and published', time: '2024-12-18T10:05:00', category: 'listing' },
  { id: 2, action: 'agent_verified', actor: 'Admin', target: 'Jean-Paul Mbarga', detail: 'Identity and license confirmed', time: '2024-12-18T09:48:00', category: 'agent' },
  { id: 3, action: 'listing_rejected', actor: 'Admin', target: 'Studio in Akwa (#1021)', detail: 'Rejected — photos do not meet quality standards', time: '2024-12-18T09:00:00', category: 'listing' },
  { id: 4, action: 'report_resolved', actor: 'Admin', target: 'Report #45 — spam', detail: 'User @kwame_b blocked. Report closed.', time: '2024-12-18T08:30:00', category: 'report' },
  { id: 5, action: 'user_blocked', actor: 'Admin', target: 'Kwame Boateng', detail: 'Blocked for repeated spam inquiries', time: '2024-12-17T16:45:00', category: 'user' },
  { id: 6, action: 'listing_flagged', actor: 'System', target: 'Duplex in Omnisports (#1018)', detail: 'Auto-flagged — price anomaly + stolen photos signal', time: '2024-12-17T15:20:00', category: 'listing' },
  { id: 7, action: 'agent_rejected', actor: 'Admin', target: 'Roger Akono', detail: 'Rejected — invalid license number, missing documents', time: '2024-12-17T14:00:00', category: 'agent' },
  { id: 8, action: 'listing_approved', actor: 'Admin', target: 'Commercial Office in Akwa (#1020)', detail: 'Listing approved and published', time: '2024-12-17T13:30:00', category: 'listing' },
  { id: 9, action: 'changes_requested', actor: 'Admin', target: 'Land 500m² in Bonapriso (#1019)', detail: 'Requested additional photos and land title document', time: '2024-12-17T12:00:00', category: 'listing' },
  { id: 10, action: 'report_dismissed', actor: 'Admin', target: 'Report #44 — inappropriate', detail: 'Storage unit listings are allowed per platform rules', time: '2024-12-17T11:00:00', category: 'report' },
  { id: 11, action: 'agent_suspended', actor: 'Admin', target: 'Marcus Njoume', detail: 'Suspended — multiple verified fraud reports', time: '2024-12-16T17:00:00', category: 'agent' },
  { id: 12, action: 'listing_deleted', actor: 'Admin', target: 'Fake Villa listing (#1015)', detail: 'Deleted — confirmed fraudulent listing', time: '2024-12-16T16:30:00', category: 'listing' },
  { id: 13, action: 'settings_updated', actor: 'Admin', target: 'Platform settings', detail: 'Min photos raised from 3 to 4. Auto-block threshold set to 5.', time: '2024-12-16T10:00:00', category: 'settings' },
  { id: 14, action: 'agent_verified', actor: 'Admin', target: 'Nadia Essam', detail: 'Identity and license confirmed — Essam Realty', time: '2024-12-15T14:30:00', category: 'agent' },
  { id: 15, action: 'listing_approved', actor: 'Admin', target: '3BR Apartment in Bonanjo (#1014)', detail: 'Listing approved and published', time: '2024-12-15T13:00:00', category: 'listing' },
];

const ACTION_CFG = {
  listing_approved:  { icon: CheckCircle,  label: 'Approved',          cls: 'text-emerald-600 bg-emerald-50' },
  listing_rejected:  { icon: XCircle,      label: 'Rejected',          cls: 'text-red-500 bg-red-50' },
  listing_flagged:   { icon: AlertTriangle,label: 'Flagged',           cls: 'text-orange-500 bg-orange-50' },
  listing_deleted:   { icon: Trash2,       label: 'Deleted',           cls: 'text-red-600 bg-red-50' },
  changes_requested: { icon: MessageSquare,label: 'Changes Requested', cls: 'text-amber-600 bg-amber-50' },
  agent_verified:    { icon: Shield,       label: 'Agent Verified',    cls: 'text-emerald-600 bg-emerald-50' },
  agent_rejected:    { icon: XCircle,      label: 'Agent Rejected',    cls: 'text-red-500 bg-red-50' },
  agent_suspended:   { icon: Ban,          label: 'Agent Suspended',   cls: 'text-zinc-600 bg-zinc-100' },
  user_blocked:      { icon: Ban,          label: 'User Blocked',      cls: 'text-red-500 bg-red-50' },
  user_unblocked:    { icon: UserCheck,    label: 'User Unblocked',    cls: 'text-emerald-600 bg-emerald-50' },
  report_resolved:   { icon: CheckCircle, label: 'Report Resolved',   cls: 'text-emerald-600 bg-emerald-50' },
  report_dismissed:  { icon: XCircle,     label: 'Report Dismissed',  cls: 'text-zinc-500 bg-zinc-100' },
  settings_updated:  { icon: Activity,    label: 'Settings Updated',  cls: 'text-blue-500 bg-blue-50' },
};

const CATEGORIES = ['All', 'Listings', 'Agents', 'Users', 'Reports', 'Settings'];

function groupByDate(logs) {
  const groups = {};
  logs.forEach(log => {
    const d = new Date(log.time);
    const key = d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = LOG.filter(l => {
    const catMatch = category === 'All'
      || (category === 'Listings' && l.category === 'listing')
      || (category === 'Agents' && l.category === 'agent')
      || (category === 'Users' && l.category === 'user')
      || (category === 'Reports' && l.category === 'report')
      || (category === 'Settings' && l.category === 'settings');
    const q = search.toLowerCase();
    return catMatch && (!q || [l.target, l.detail, l.actor].some(f => f.toLowerCase().includes(q)));
  });

  const grouped = groupByDate(filtered);

  return (
    <AdminNav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Activity Log</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Full audit trail of all admin actions.</p>
          </div>
          <button className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-zinc-500 border border-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search log entries..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
        </div>

        {/* Category tabs — scrollable on mobile */}
        <div className="flex gap-0.5 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${category === c ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Log groups */}
        <div className="space-y-5 sm:space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              {/* Date header — shorter on mobile */}
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                <span className="sm:hidden">{new Date(entries[0].time).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="hidden sm:inline">{date}</span>
              </p>
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
                {entries.map((log) => {
                  const cfg = ACTION_CFG[log.action] || { icon: Activity, label: log.action, cls: 'text-zinc-500 bg-zinc-100' };
                  const Icon = cfg.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-zinc-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.cls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{cfg.label}</p>
                              {log.actor === 'System' && (
                                <span className="text-xs text-zinc-300 border border-zinc-100 px-1.5 py-0.5 rounded">auto</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-zinc-800 truncate">{log.target}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{log.detail}</p>
                          </div>
                          {/* Time — aligned right */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-zinc-400">
                              {new Date(log.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-zinc-300 mt-0.5">{log.actor}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Activity className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">No entries found</p>
          </div>
        )}
      </div>
    </AdminNav>
  );
}