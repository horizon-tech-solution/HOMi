import { useState } from 'react';
import {
  Search, Flag, AlertTriangle, CheckCircle, XCircle, X,
  Building2, MessageSquare, Shield, Ban, Trash2,
  ExternalLink, Image as ImageIcon, Send, Eye
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const REPORTS = [
  {
    id: 1, type: 'fraud', priority: 'high', status: 'open', subjectType: 'listing', subjectName: 'Duplex in Omnisports',
    reportedBy: { name: 'Kofi Asante', email: 'kofi@gmail.com', id: 'u_001' }, reportCount: 3,
    description: 'The agent asked me to send a deposit via mobile money before any visit. The listing photos appear on another website I found via Google Images. Price is suspicious.',
    evidence: [{ type: 'screenshot', label: 'Screenshot of money transfer request', url: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600' }],
    messages: [
      { from: 'reporter', name: 'Kofi Asante', text: 'Hello, I saw the listing and contacted the agent.', time: '5d ago' },
      { from: 'suspect', name: 'Agent (Marcus N.)', text: 'To reserve it you must send 500,000 XAF via MTN Mobile Money to 699000001.', time: '5d ago' },
    ],
    linkedListing: { id: 'l_006', title: 'Duplex in Omnisports', price: '10,000,000 XAF', status: 'flagged', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
    subject: { name: 'Marcus Njoume', email: 'marcus.nj@yahoo.com', phone: '+237 699 000 001', role: 'user', reports: 8 },
    submittedAt: '2024-12-13T10:00:00',
    adminNotes: 'Confirmed fraud pattern. User has 8 reports total.',
  },
  {
    id: 2, type: 'fake_listing', priority: 'high', status: 'under_review', subjectType: 'listing', subjectName: 'Villa in Bastos — 10M XAF',
    reportedBy: { name: 'Amara Diallo', email: 'amara.d@outlook.com', id: 'u_002' }, reportCount: 2,
    description: 'This villa is listed at 10,000,000 XAF for sale in Bastos. The market price for this area is 150–300M XAF. This looks like a bait listing to collect contacts.',
    evidence: [], messages: [],
    linkedListing: { id: 'l_007', title: 'Villa in Bastos', price: '10,000,000 XAF', status: 'pending', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
    subject: { name: 'User Unknown', email: 'bait@fake.cm', phone: '+237 600 000 002', role: 'user', reports: 2 },
    submittedAt: '2024-12-14T14:00:00', adminNotes: '',
  },
  {
    id: 3, type: 'spam', priority: 'medium', status: 'open', subjectType: 'user', subjectName: '@kwame_b',
    reportedBy: { name: 'Jean-Paul Mbarga', email: 'jp.mbarga@camereal.cm', id: 'a_003' }, reportCount: 4,
    description: 'This user sends automated inquiries to every listing I publish. He never replies to follow-ups and creates new accounts.',
    evidence: [{ type: 'screenshot', label: 'Inbox showing 12 identical messages', url: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=600' }],
    messages: [],
    linkedListing: null,
    subject: { name: 'Kwame Boateng', email: 'kwame.b@yahoo.com', phone: '+237 677 567 890', role: 'user', reports: 4 },
    submittedAt: '2024-12-16T09:00:00', adminNotes: 'Pattern confirmed. 4 unique agents reported the same behavior.',
  },
  {
    id: 4, type: 'harassment', priority: 'medium', status: 'open', subjectType: 'user', subjectName: '@unknown_user',
    reportedBy: { name: 'Nadia Essam', email: 'n.essam@realty.cm', id: 'a_004' }, reportCount: 1,
    description: 'After I declined to lower the price, this user sent threatening messages.',
    evidence: [{ type: 'screenshot', label: 'Threatening message screenshot', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600' }],
    messages: [
      { from: 'reporter', name: 'Nadia Essam', text: 'I am sorry but I cannot lower the price further.', time: '3d ago' },
      { from: 'suspect', name: 'Unknown User', text: 'You will regret this. I know where your agency is.', time: '3d ago' },
    ],
    linkedListing: null,
    subject: { name: 'Unknown User', email: 'unknown@mail.cm', phone: null, role: 'user', reports: 1 },
    submittedAt: '2024-12-15T20:00:00', adminNotes: '',
  },
  {
    id: 5, type: 'misleading', priority: 'low', status: 'resolved', subjectType: 'listing', subjectName: 'Studio in Akwa — wrong location',
    reportedBy: { name: 'Fatou Camara', email: 'fatou.c@email.cm', id: 'u_006' }, reportCount: 1,
    description: 'Listing says Akwa but the address provided leads to Bassa, which is a very different price zone.',
    evidence: [], messages: [],
    linkedListing: { id: 'l_021', title: 'Studio — Akwa', price: '35,000 XAF/mo', status: 'rejected', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
    subject: { name: 'Kofi Asante', email: 'kofi.asante@gmail.com', phone: '+237 677 123 456', role: 'user', reports: 0 },
    submittedAt: '2024-12-10T08:00:00', resolution: 'Listing rejected. User notified to correct location before resubmitting.', resolvedAt: '2024-12-10T13:00:00', adminNotes: '',
  },
];

const TYPE_CFG = {
  fraud:        { label: 'Fraud / Scam',          cls: 'bg-red-50 text-red-700 border-red-200' },
  fake_listing: { label: 'Fake Listing',           cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  spam:         { label: 'Spam',                   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  harassment:   { label: 'Harassment',             cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  misleading:   { label: 'Misleading Info',        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  inappropriate:{ label: 'Inappropriate',          cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
};

const PRIORITY_CLS = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-zinc-100 text-zinc-500 border-zinc-200',
};

const STATUS_TABS = ['All', 'Open', 'Under Review', 'Resolved'];

function EvidenceViewer({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white font-semibold text-sm truncate pr-4">{item.label}</p>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 flex-shrink-0"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0" onClick={e => e.stopPropagation()}>
        {item.type === 'screenshot'
          ? <img src={item.url} alt="" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
          : <div className="bg-white rounded-xl p-8 text-center"><ExternalLink className="w-8 h-8 text-zinc-400 mx-auto mb-3" /><a href={item.url} className="text-sm text-blue-600 hover:underline">{item.display}</a></div>
        }
      </div>
    </div>
  );
}

function ReportDetail({ report: initialReport, onClose, onResolve, onDismiss, onBlockSubject, onDeleteListing }) {
  const [report] = useState(initialReport);
  const [tab, setTab] = useState('details');
  const [adminNote, setAdminNote] = useState(report.adminNotes);
  const [resolutionNote, setResolutionNote] = useState('');
  const [viewingEvidence, setViewingEvidence] = useState(null);

  const typeCfg = TYPE_CFG[report.type] || { label: report.type, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  const isOpen = report.status === 'open' || report.status === 'under_review';

  const tabDefs = [
    { key: 'details', label: 'Details' },
    { key: 'evidence', label: `Evidence (${report.evidence.length})` },
    { key: 'messages', label: `Chat (${report.messages.length})` },
    { key: 'subject', label: 'Subject' },
  ];

  return (
    <>
      {viewingEvidence && <EvidenceViewer item={viewingEvidence} onClose={() => setViewingEvidence(null)} />}
      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div className="w-full sm:max-w-2xl bg-white h-full flex flex-col overflow-hidden sm:border-l border-zinc-200 shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase ${PRIORITY_CLS[report.priority]}`}>{report.priority}</span>
                {report.reportCount > 1 && <span className="text-xs text-red-500 font-semibold">+{report.reportCount - 1} more</span>}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900">{report.subjectName}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">by {report.reportedBy.name} · {new Date(report.submittedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>

          {/* Tabs — scrollable */}
          <div className="flex border-b border-zinc-100 px-4 sm:px-6 flex-shrink-0 overflow-x-auto">
            {tabDefs.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`py-3 mr-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${tab === key ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'details' && (
              <div className="px-4 sm:px-6 py-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">User's Report</p>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                    <p className="text-sm text-zinc-700 leading-relaxed">{report.description}</p>
                    <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-100">
                      {report.reportedBy.name} · {report.reportedBy.email}
                    </p>
                  </div>
                </div>

                {report.linkedListing && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Linked Listing</p>
                    <div className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img src={report.linkedListing.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{report.linkedListing.title}</p>
                        <p className="text-xs text-zinc-400">{report.linkedListing.price}</p>
                      </div>
                      <button className="text-xs text-zinc-400 hover:text-zinc-700 border border-zinc-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  </div>
                )}

                {report.resolution && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-xs font-bold text-emerald-700 mb-1">Resolution</p>
                    <p className="text-sm text-emerald-700">{report.resolution}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Internal Admin Notes</p>
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Notes (only visible to admins)..." rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300" />
                </div>

                {isOpen && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Resolution Note</p>
                    <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} placeholder="What action was taken..." rows={3}
                      className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300" />
                  </div>
                )}
              </div>
            )}

            {tab === 'evidence' && (
              <div className="px-4 sm:px-6 py-5 space-y-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Evidence</p>
                {report.evidence.length === 0 ? (
                  <div className="py-12 text-center">
                    <ImageIcon className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300">No evidence submitted</p>
                  </div>
                ) : report.evidence.map((item, i) => (
                  <div key={i} className="border border-zinc-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-50">
                      <ImageIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-zinc-700 flex-1 truncate">{item.label}</p>
                      <button onClick={() => setViewingEvidence(item)}
                        className="text-xs font-semibold text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors flex-shrink-0">
                        View
                      </button>
                    </div>
                    {item.type === 'screenshot' && (
                      <button onClick={() => setViewingEvidence(item)} className="w-full">
                        <img src={item.url} alt="" className="w-full h-36 sm:h-40 object-cover hover:opacity-90 transition-opacity" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'messages' && (
              <div className="px-4 sm:px-6 py-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Message Thread</p>
                {report.messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300">No messages attached</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.messages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 sm:gap-3 ${msg.from === 'reporter' ? '' : 'flex-row-reverse'}`}>
                        <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-zinc-600">{msg.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 max-w-[75%]">
                          <p className={`text-xs text-zinc-400 mb-1 ${msg.from !== 'reporter' ? 'text-right' : ''}`}>{msg.name}</p>
                          <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${msg.from === 'reporter' ? 'bg-zinc-100 text-zinc-800 rounded-tl-sm' : 'bg-zinc-900 text-white rounded-tr-sm'}`}>
                            {msg.text}
                          </div>
                          <p className={`text-xs text-zinc-300 mt-1 ${msg.from !== 'reporter' ? 'text-right' : ''}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'subject' && (
              <div className="px-4 sm:px-6 py-5 space-y-4">
                <div className="border border-zinc-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{report.subject.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900">{report.subject.name}</p>
                      <p className="text-xs text-zinc-400 capitalize">{report.subject.role}</p>
                    </div>
                    {report.subject.reports > 0 && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full flex-shrink-0">
                        {report.subject.reports} reports
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600">{report.subject.email}</p>
                  {report.subject.phone && <p className="text-sm text-zinc-600">{report.subject.phone}</p>}
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Actions on Subject</p>
                  <div className="space-y-2">
                    {[
                      { icon: Ban, label: 'Block this user account', action: () => onBlockSubject(report) },
                      ...(report.linkedListing ? [{ icon: Trash2, label: 'Remove linked listing', action: () => onDeleteListing(report) }] : []),
                      { icon: ExternalLink, label: 'View full user profile', action: () => {} },
                      { icon: Send, label: 'Send warning message', action: () => {} },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                        <Icon className="w-4 h-4 text-zinc-400" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isOpen && (
            <div className="px-4 sm:px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <button onClick={() => onDismiss(report, resolutionNote)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                  <XCircle className="w-4 h-4" /> Dismiss
                </button>
                <button onClick={() => onResolve(report, resolutionNote)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ReportCard({ report, onClick }) {
  const typeCfg = TYPE_CFG[report.type] || { label: report.type, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  const statusInfo = { open: { dot: 'bg-red-400', label: 'Open' }, under_review: { dot: 'bg-amber-400', label: 'Under Review' }, resolved: { dot: 'bg-emerald-400', label: 'Resolved' }, dismissed: { dot: 'bg-zinc-300', label: 'Dismissed' } }[report.status];

  return (
    <div onClick={onClick} className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase ${PRIORITY_CLS[report.priority]}`}>{report.priority}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          <span className="text-xs text-zinc-400 whitespace-nowrap">{statusInfo.label}</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-zinc-900 mb-1">{report.subjectName}</p>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{report.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          {report.reportedBy.name}
          {report.reportCount > 1 && <span className="ml-1.5 text-red-500 font-semibold">+{report.reportCount - 1}</span>}
        </span>
        <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
      </div>
      {report.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-1.5 text-xs text-zinc-400">
          <ImageIcon className="w-3 h-3" />{report.evidence.length} evidence item{report.evidence.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default function ReportsAndFlags() {
  const [activeTab, setActiveTab] = useState('Open');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(REPORTS);
  const [selected, setSelected] = useState(null);

  const onResolve = (report, note) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved', resolution: note || 'Resolved by admin.', resolvedAt: new Date().toISOString() } : r));
    setSelected(null);
  };
  const onDismiss = (report, note) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed', resolution: note || 'Dismissed.', resolvedAt: new Date().toISOString() } : r));
    setSelected(null);
  };

  const counts = STATUS_TABS.reduce((acc, t) => {
    const key = t.toLowerCase().replace(' ', '_');
    return { ...acc, [t]: t === 'All' ? reports.length : reports.filter(r => r.status === key).length };
  }, {});

  const filtered = reports.filter(r => {
    const tabMatch = activeTab === 'All' || (activeTab === 'Open' && r.status === 'open') || (activeTab === 'Under Review' && r.status === 'under_review') || (activeTab === 'Resolved' && (r.status === 'resolved' || r.status === 'dismissed'));
    const q = search.toLowerCase();
    return tabMatch && (!q || [r.subjectName, r.reportedBy.name, r.description].some(f => f.toLowerCase().includes(q)));
  });

  const selectedReport = selected ? reports.find(r => r.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {selectedReport && (
          <ReportDetail report={selectedReport} onClose={() => setSelected(null)}
            onResolve={onResolve} onDismiss={onDismiss}
            onBlockSubject={r => alert(`Block triggered for report #${r.id}`)}
            onDeleteListing={r => alert(`Delete listing triggered for report #${r.id}`)} />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Reports & Flags</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review reports, fraud cases, and violations.</p>
          </div>
          {counts['Open'] > 0 && (
            <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full flex-shrink-0">{counts['Open']} open</span>
          )}
        </div>

        {/* Type summary — 3 cols mobile, 6 desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {Object.entries(TYPE_CFG).map(([key, cfg]) => {
            const c = reports.filter(r => r.type === key && (r.status === 'open' || r.status === 'under_review')).length;
            return (
              <div key={key} className={`rounded-xl border px-2 sm:px-3 py-3 text-center ${c > 0 ? cfg.cls : 'bg-zinc-50 text-zinc-300 border-zinc-100'}`}>
                <p className="text-lg font-black">{c}</p>
                <p className="text-xs font-medium leading-tight mt-0.5">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
        </div>

        {/* Tabs — scrollable */}
        <div className="flex gap-0.5 mb-5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}>
              {t} <span className={`ml-1 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center"><Flag className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No reports found</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map(r => <ReportCard key={r.id} report={r} onClick={() => setSelected(r)} />)}
          </div>
        )}
      </div>
    </AdminNav>
  );
}