import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Search, CheckCircle, XCircle, Ban, Shield, Flag,
  Trash2, MessageSquare, UserCheck, AlertTriangle, Download, Loader2
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { fetchActivityLog, exportActivityLogCSV } from '../../api/admin/activityLog';

const ACTION_CFG = {
  listing_approved:   { icon: CheckCircle,    label: 'Approved',           cls: 'text-emerald-600 bg-emerald-50' },
  listing_rejected:   { icon: XCircle,        label: 'Rejected',           cls: 'text-red-500 bg-red-50' },
  listing_flagged:    { icon: AlertTriangle,  label: 'Flagged',            cls: 'text-orange-500 bg-orange-50' },
  listing_deleted:    { icon: Trash2,         label: 'Deleted',            cls: 'text-red-600 bg-red-50' },
  changes_requested:  { icon: MessageSquare,  label: 'Changes Requested',  cls: 'text-amber-600 bg-amber-50' },
  agent_verified:     { icon: Shield,         label: 'Agent Verified',     cls: 'text-emerald-600 bg-emerald-50' },
  agent_rejected:     { icon: XCircle,        label: 'Agent Rejected',     cls: 'text-red-500 bg-red-50' },
  agent_suspended:    { icon: Ban,            label: 'Agent Suspended',    cls: 'text-zinc-600 bg-zinc-100' },
  user_blocked:       { icon: Ban,            label: 'User Blocked',       cls: 'text-red-500 bg-red-50' },
  user_unblocked:     { icon: UserCheck,      label: 'User Unblocked',     cls: 'text-emerald-600 bg-emerald-50' },
  report_resolved:    { icon: CheckCircle,    label: 'Report Resolved',    cls: 'text-emerald-600 bg-emerald-50' },
  report_dismissed:   { icon: XCircle,        label: 'Report Dismissed',   cls: 'text-zinc-500 bg-zinc-100' },
  settings_updated:   { icon: Activity,       label: 'Settings Updated',   cls: 'text-blue-500 bg-blue-50' },
};

const CATEGORIES = ['All', 'Listings', 'Agents', 'Users', 'Reports', 'Settings'];

function groupByDate(logs) {
  const groups = {};
  logs.forEach(log => {
    const key = new Date(log.time).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

// Debounce helper — avoids firing a fetch on every keystroke
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ActivityLog() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchActivityLog({ search: debouncedSearch, category });
      // Support both { data: [...] } and plain array responses
      setLogs(Array.isArray(res) ? res : res.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load activity log.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportActivityLogCSV({ search, category });
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const grouped = groupByDate(logs);

  return (
    <AdminNav>
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Activity Log</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Full audit trail of all admin actions.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 border border-zinc-200 bg-white rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {exporting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search log entries..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-0.5 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                category === c ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading activity log…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button
              onClick={loadLogs}
              className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="py-20 text-center">
            <Activity className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">No entries found</p>
          </div>
        )}

        {/* Log groups */}
        {!loading && !error && Object.entries(grouped).map(([date, entries]) => (
          <div key={date} className="mb-8">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-bold text-zinc-900 sm:hidden">
                {new Date(entries[0].time).toLocaleDateString('en-GB', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </p>
              <p className="hidden sm:block text-xs font-bold text-zinc-900">{date}</p>
              <div className="flex-1 h-px bg-zinc-100" />
              <p className="text-xs text-zinc-300">{entries.length} action{entries.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="space-y-1">
              {entries.map(log => {
                const cfg = ACTION_CFG[log.action] ?? {
                  icon: Activity,
                  label: log.action,
                  cls: 'text-zinc-500 bg-zinc-100',
                };
                const Icon = cfg.icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.cls}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-xs font-bold ${cfg.cls.split(' ')[0]}`}>
                          {cfg.label}
                        </span>
                        {log.actor === 'System' && (
                          <span className="text-xs text-zinc-300 border border-zinc-100 px-1.5 py-0.5 rounded-full">
                            auto
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 truncate">{log.target}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{log.detail}</p>
                    </div>

                    {/* Time + actor */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-zinc-500">
                        {new Date(log.time).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-zinc-300 mt-0.5">{log.actor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AdminNav>
  );
}