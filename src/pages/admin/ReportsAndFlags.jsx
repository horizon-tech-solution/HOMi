import { useState } from 'react';
import {
  Search, Flag, AlertTriangle, CheckCircle, XCircle, X,
  User, Building2, MessageSquare, Clock, Shield, Ban,
  Trash2, ExternalLink, ChevronRight, Image, FileText,
  Phone, Mail, Send, Eye
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const REPORTS = [
  {
    id: 1,
    type: 'fraud',
    priority: 'high',
    status: 'open',
    subjectType: 'listing',
    subjectName: 'Duplex in Omnisports',
    subjectId: 'l_006',
    reportedBy: { name: 'Kofi Asante', email: 'kofi@gmail.com', id: 'u_001' },
    reportCount: 3, // how many different users reported this
    description: 'The agent asked me to send a deposit via mobile money before any visit. The listing photos appear on another website I found via Google Images. Price is suspicious.',
    evidence: [
      { type: 'screenshot', label: 'Screenshot of money transfer request', url: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600' },
      { type: 'link', label: 'Original photo source', url: 'https://cameroon24.com/listing/4421', display: 'cameroon24.com/listing/4421' },
    ],
    messages: [
      { from: 'reporter', name: 'Kofi Asante', text: 'Hello, I saw the listing for the duplex and contacted the agent.', time: '5d ago' },
      { from: 'suspect', name: 'Agent (Marcus N.)', text: 'Yes the property is available. To reserve it you must send 500,000 XAF via MTN Mobile Money to 699000001.', time: '5d ago' },
      { from: 'reporter', name: 'Kofi Asante', text: 'I am not sending money before seeing the property.', time: '5d ago' },
      { from: 'suspect', name: 'Agent (Marcus N.)', text: 'It is normal procedure, many clients do it. If you do not want the apartment someone else will take it.', time: '4d ago' },
    ],
    linkedListing: { id: 'l_006', title: 'Duplex in Omnisports', price: '10,000,000 XAF', status: 'flagged', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
    subject: { name: 'Marcus Njoume', email: 'marcus.nj@yahoo.com', phone: '+237 699 000 001', role: 'user', reports: 8, blocked: false },
    submittedAt: '2024-12-13T10:00:00',
    adminNotes: 'Confirmed fraud pattern. User has 8 reports total. Recommend blocking account and removing all listings.',
  },
  {
    id: 2,
    type: 'fake_listing',
    priority: 'high',
    status: 'under_review',
    subjectType: 'listing',
    subjectName: 'Villa in Bastos — 10M XAF',
    subjectId: 'l_007',
    reportedBy: { name: 'Amara Diallo', email: 'amara.d@outlook.com', id: 'u_002' },
    reportCount: 2,
    description: 'This villa is listed at 10,000,000 XAF for sale in Bastos. The market price for this area is 150–300M XAF. This looks like a bait listing to collect contacts.',
    evidence: [],
    messages: [],
    linkedListing: { id: 'l_007', title: 'Villa in Bastos', price: '10,000,000 XAF', status: 'pending', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
    subject: { name: 'User Unknown', email: 'bait@fake.cm', phone: '+237 600 000 002', role: 'user', reports: 2, blocked: false },
    submittedAt: '2024-12-14T14:00:00',
    adminNotes: '',
  },
  {
    id: 3,
    type: 'spam',
    priority: 'medium',
    status: 'open',
    subjectType: 'user',
    subjectName: '@kwame_b',
    subjectId: 'u_005',
    reportedBy: { name: 'Jean-Paul Mbarga', email: 'jp.mbarga@camereal.cm', id: 'a_003' },
    reportCount: 4,
    description: 'This user sends automated inquiries to every listing I publish. He never replies to my follow-ups. He then creates new accounts. This is affecting my response rate.',
    evidence: [
      { type: 'screenshot', label: 'Inbox showing 12 identical messages from user', url: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=600' },
    ],
    messages: [],
    linkedListing: null,
    subject: { name: 'Kwame Boateng', email: 'kwame.b@yahoo.com', phone: '+237 677 567 890', role: 'user', reports: 4, blocked: false },
    submittedAt: '2024-12-16T09:00:00',
    adminNotes: 'Pattern confirmed. 4 unique agents have reported the same behavior.',
  },
  {
    id: 4,
    type: 'harassment',
    priority: 'medium',
    status: 'open',
    subjectType: 'user',
    subjectName: '@unknown_user',
    subjectId: null,
    reportedBy: { name: 'Nadia Essam', email: 'n.essam@realty.cm', id: 'a_004' },
    reportCount: 1,
    description: 'After I declined to lower the price of my Bonanjo listing, this user sent several threatening messages and said he would "find where I work".',
    evidence: [
      { type: 'screenshot', label: 'Threatening message screenshot', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600' },
    ],
    messages: [
      { from: 'reporter', name: 'Nadia Essam', text: 'I am sorry but I cannot lower the price further.', time: '3d ago' },
      { from: 'suspect', name: 'Unknown User', text: 'You will regret this. I know where your agency is.', time: '3d ago' },
    ],
    linkedListing: null,
    subject: { name: 'Unknown User', email: 'unknown@mail.cm', phone: null, role: 'user', reports: 1, blocked: false },
    submittedAt: '2024-12-15T20:00:00',
    adminNotes: '',
  },
  {
    id: 5,
    type: 'misleading',
    priority: 'low',
    status: 'resolved',
    subjectType: 'listing',
    subjectName: 'Studio in Akwa — wrong location',
    subjectId: 'l_021',
    reportedBy: { name: 'Fatou Camara', email: 'fatou.c@email.cm', id: 'u_006' },
    reportCount: 1,
    description: 'Listing says Akwa but the address provided leads to Bassa, which is a very different price zone.',
    evidence: [],
    messages: [],
    linkedListing: { id: 'l_021', title: 'Studio — Akwa', price: '35,000 XAF/mo', status: 'rejected', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
    subject: { name: 'Kofi Asante', email: 'kofi.asante@gmail.com', phone: '+237 677 123 456', role: 'user', reports: 0, blocked: false },
    submittedAt: '2024-12-10T08:00:00',
    resolution: 'Listing rejected. User notified to correct the location before resubmitting.',
    resolvedAt: '2024-12-10T13:00:00',
    adminNotes: '',
  },
];

const TYPE_CFG = {
  fraud:        { label: 'Fraud / Scam',           cls: 'bg-red-50 text-red-700 border-red-200' },
  fake_listing: { label: 'Fake Listing',            cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  spam:         { label: 'Spam',                    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  harassment:   { label: 'Harassment',              cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  misleading:   { label: 'Misleading Information', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  inappropriate:{ label: 'Inappropriate Content',  cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
};

const PRIORITY_CLS = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-zinc-100 text-zinc-500 border-zinc-200',
};

const STATUS_TABS = ['All', 'Open', 'Under Review', 'Resolved'];

/* ─── Evidence Viewer ────────────────────────────────────── */
function EvidenceViewer({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white font-semibold">{item.label}</p>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 min-h-0" onClick={e => e.stopPropagation()}>
        {item.type === 'screenshot' ? (
          <img src={item.url} alt="" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <ExternalLink className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-800 font-semibold mb-1">{item.label}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer"
               className="text-sm text-blue-600 hover:underline">{item.display}</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Report Detail Panel ────────────────────────────────── */
function ReportDetail({ report: initialReport, onClose, onResolve, onDismiss, onBlockSubject, onDeleteListing }) {
  const [report] = useState(initialReport);
  const [tab, setTab] = useState('details');
  const [adminNote, setAdminNote] = useState(report.adminNotes);
  const [resolutionNote, setResolutionNote] = useState('');
  const [viewingEvidence, setViewingEvidence] = useState(null);

  const typeCfg = TYPE_CFG[report.type] || { label: report.type, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  const isOpen = report.status === 'open' || report.status === 'under_review';

  return (
    <>
      {viewingEvidence && <EvidenceViewer item={viewingEvidence} onClose={() => setViewingEvidence(null)} />}

      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div
          className="w-full max-w-2xl bg-white h-full flex flex-col overflow-hidden border-l border-zinc-200 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase ${PRIORITY_CLS[report.priority]}`}>{report.priority} priority</span>
                {report.reportCount > 1 && (
                  <span className="text-xs font-semibold text-zinc-500">+{report.reportCount - 1} more reports</span>
                )}
              </div>
              <h2 className="text-base font-bold text-zinc-900">{report.subjectName}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Reported by {report.reportedBy.name} · {new Date(report.submittedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
            {[
              { key: 'details', label: 'Details' },
              { key: 'evidence', label: `Evidence (${report.evidence.length})` },
              { key: 'messages', label: `Messages (${report.messages.length})` },
              { key: 'subject', label: 'Subject' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`py-3 mr-5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === key ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Details ─────────────────────────────────── */}
            {tab === 'details' && (
              <div className="px-6 py-5 space-y-5">

                {/* Report description */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">User's Report</p>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                    <p className="text-sm text-zinc-700 leading-relaxed">{report.description}</p>
                    <p className="text-xs text-zinc-400 mt-3 border-t border-zinc-100 pt-3">
                      Submitted by <span className="font-semibold">{report.reportedBy.name}</span> · {report.reportedBy.email}
                    </p>
                  </div>
                </div>

                {/* Linked Listing */}
                {report.linkedListing && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Linked Listing</p>
                    <div className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img src={report.linkedListing.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{report.linkedListing.title}</p>
                        <p className="text-xs text-zinc-400">{report.linkedListing.price}</p>
                        <span className={`text-xs font-semibold ${
                          report.linkedListing.status === 'approved' ? 'text-emerald-600'
                          : report.linkedListing.status === 'flagged' ? 'text-orange-600'
                          : report.linkedListing.status === 'rejected' ? 'text-red-500'
                          : 'text-amber-600'
                        } capitalize`}>
                          {report.linkedListing.status}
                        </span>
                      </div>
                      <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors px-3 py-1.5 border border-zinc-100 rounded-lg">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  </div>
                )}

                {/* Resolution (if closed) */}
                {report.resolution && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-xs font-bold text-emerald-700 mb-1">Resolution</p>
                    <p className="text-sm text-emerald-700">{report.resolution}</p>
                    <p className="text-xs text-emerald-500 mt-2">{new Date(report.resolvedAt).toLocaleString()}</p>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Internal Admin Notes</p>
                  <textarea
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Notes about this report (only visible to admins)..."
                    rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                  />
                </div>

                {/* Resolution input */}
                {isOpen && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Resolution Note</p>
                    <textarea
                      value={resolutionNote}
                      onChange={e => setResolutionNote(e.target.value)}
                      placeholder="What action was taken to resolve this report..."
                      rows={3}
                      className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Evidence ────────────────────────────────── */}
            {tab === 'evidence' && (
              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Submitted Evidence</p>
                {report.evidence.length === 0 ? (
                  <div className="py-12 text-center">
                    <Image className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300">No evidence submitted</p>
                    <p className="text-xs text-zinc-200 mt-1">User did not attach any files or screenshots.</p>
                  </div>
                ) : (
                  report.evidence.map((item, i) => (
                    <div key={i} className="border border-zinc-100 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-50">
                        {item.type === 'screenshot' ? <Image className="w-4 h-4 text-zinc-400" /> : <ExternalLink className="w-4 h-4 text-zinc-400" />}
                        <p className="text-sm font-semibold text-zinc-700 flex-1">{item.label}</p>
                        <button
                          onClick={() => setViewingEvidence(item)}
                          className="text-xs font-semibold text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          View
                        </button>
                      </div>
                      {item.type === 'screenshot' && (
                        <button onClick={() => setViewingEvidence(item)} className="w-full">
                          <img src={item.url} alt={item.label} className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
                        </button>
                      )}
                      {item.type === 'link' && (
                        <div className="px-4 py-3 bg-zinc-50">
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                             className="text-sm text-blue-600 hover:underline font-mono">
                            {item.display}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Messages ─────────────────────────────────── */}
            {tab === 'messages' && (
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                  Message Thread
                </p>
                {report.messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300">No message thread attached</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.from === 'reporter' ? '' : 'flex-row-reverse'}`}>
                        <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-zinc-600">{msg.name.charAt(0)}</span>
                        </div>
                        <div className={`flex-1 max-w-xs`}>
                          <p className={`text-xs text-zinc-400 mb-1 ${msg.from === 'reporter' ? '' : 'text-right'}`}>{msg.name}</p>
                          <div className={`rounded-2xl px-4 py-3 text-sm ${
                            msg.from === 'reporter'
                              ? 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
                              : 'bg-zinc-900 text-white rounded-tr-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <p className={`text-xs text-zinc-300 mt-1 ${msg.from === 'reporter' ? '' : 'text-right'}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Subject ─────────────────────────────────── */}
            {tab === 'subject' && (
              <div className="px-6 py-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Reported Subject</p>
                  <div className="border border-zinc-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{report.subject.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{report.subject.name}</p>
                        <p className="text-xs text-zinc-400 capitalize">{report.subject.role}</p>
                      </div>
                      {report.subject.reports > 0 && (
                        <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
                          {report.subject.reports} total reports
                        </span>
                      )}
                    </div>
                    {[
                      { icon: Mail, value: report.subject.email },
                      { icon: Phone, value: report.subject.phone || 'Not provided' },
                    ].map(({ icon: Icon, value }) => (
                      <div key={value} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <p className="text-sm text-zinc-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions on Subject */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Actions on Subject</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => onBlockSubject(report)}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Ban className="w-4 h-4 text-red-400" />
                      Block this user's account
                    </button>
                    {report.linkedListing && (
                      <button
                        onClick={() => onDeleteListing(report)}
                        className="w-full flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        Remove the linked listing
                      </button>
                    )}
                    <button className="w-full flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                      View full user profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <Send className="w-4 h-4 text-zinc-400" />
                      Send warning message
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isOpen && (
            <div className="px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => onDismiss(report, resolutionNote)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Dismiss
                </button>
                <button
                  onClick={() => onResolve(report, resolutionNote)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                >
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

/* ─── Report Card ─────────────────────────────────────────── */
function ReportCard({ report, onClick }) {
  const typeCfg = TYPE_CFG[report.type] || { label: report.type, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  const statusDot = {
    open: 'bg-red-400',
    under_review: 'bg-amber-400',
    resolved: 'bg-emerald-400',
    dismissed: 'bg-zinc-300',
  }[report.status];
  const statusLabel = { open: 'Open', under_review: 'Under Review', resolved: 'Resolved', dismissed: 'Dismissed' }[report.status];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_CLS[report.priority]} uppercase`}>{report.priority}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          <span className="text-xs text-zinc-400">{statusLabel}</span>
        </div>
      </div>

      <p className="text-sm font-semibold text-zinc-900 mb-1">{report.subjectName}</p>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{report.description}</p>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          by {report.reportedBy.name}
          {report.reportCount > 1 && (
            <span className="ml-1.5 text-red-500 font-semibold">+{report.reportCount - 1} more</span>
          )}
        </span>
        <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
      </div>

      {report.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-1.5 text-xs text-zinc-400">
          <Image className="w-3 h-3" /> {report.evidence.length} evidence item{report.evidence.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
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
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed', resolution: note || 'Dismissed — no action needed.', resolvedAt: new Date().toISOString() } : r));
    setSelected(null);
  };

  const counts = STATUS_TABS.reduce((acc, t) => {
    const key = t.toLowerCase().replace(' ', '_');
    return { ...acc, [t]: t === 'All' ? reports.length : reports.filter(r => r.status === key).length };
  }, {});

  const filtered = reports.filter(r => {
    const tabMatch =
      activeTab === 'All' ||
      (activeTab === 'Open' && r.status === 'open') ||
      (activeTab === 'Under Review' && r.status === 'under_review') ||
      (activeTab === 'Resolved' && (r.status === 'resolved' || r.status === 'dismissed'));
    const q = search.toLowerCase();
    const searchMatch = !q || [r.subjectName, r.reportedBy.name, r.description].some(f => f.toLowerCase().includes(q));
    return tabMatch && searchMatch;
  });

  const selectedReport = selected ? reports.find(r => r.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {selectedReport && (
          <ReportDetail
            report={selectedReport}
            onClose={() => setSelected(null)}
            onResolve={onResolve}
            onDismiss={onDismiss}
            onBlockSubject={r => alert(`Block action triggered for report #${r.id}`)}
            onDeleteListing={r => alert(`Delete listing triggered for report #${r.id}`)}
          />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Reports & Flags</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review user reports, fraud cases, and policy violations.</p>
          </div>
          <div className="flex gap-2">
            {counts['Open'] > 0 && (
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                {counts['Open']} open
              </span>
            )}
          </div>
        </div>

        {/* Type summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {Object.entries(TYPE_CFG).map(([key, cfg]) => {
            const c = reports.filter(r => r.type === key && (r.status === 'open' || r.status === 'under_review')).length;
            return (
              <div key={key} className={`rounded-xl border px-3 py-3 text-center ${c > 0 ? cfg.cls : 'bg-zinc-50 text-zinc-300 border-zinc-100'}`}>
                <p className="text-lg font-black">{c}</p>
                <p className="text-xs font-medium leading-tight mt-0.5">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-0.5 mb-5">
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {t}
              <span className={`ml-1.5 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Flag className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">No reports found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(r => (
              <ReportCard key={r.id} report={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>
    </AdminNav>
  );
}