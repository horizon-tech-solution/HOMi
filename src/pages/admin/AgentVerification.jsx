import { useState } from 'react';
import {
  Search, CheckCircle, XCircle, AlertTriangle, X, ZoomIn,
  Phone, Mail, MapPin, FileText, Download,
  Shield, Ban, RotateCcw, User,
  Star, Send, ExternalLink, Info, MessageSquare, Flag
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

const AGENTS = [
  {
    id: 'a_001', status: 'pending', name: 'Samuel Ekwueme', email: 'samuel.e@camereal.cm', phone: '+237 699 123 456',
    region: 'Douala', city: 'Bonanjo', agencyName: 'Ekwueme Real Estate', agencyType: 'agency',
    licenseNumber: 'CMR-RE-2024-1082', yearsExperience: 4, submittedAt: '2024-12-18T07:00:00',
    bio: 'Real estate professional with 4 years of experience in the Douala market, specializing in residential and commercial properties.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1533279443086-d1c19a186416?w=600', status: 'pending' },
      { id: 'd2', name: 'National ID (Back)', type: 'image', url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600', status: 'pending' },
      { id: 'd3', name: 'RE License', type: 'image', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600', status: 'pending' },
      { id: 'd4', name: 'Agency Registration', type: 'pdf', url: '#', status: 'pending' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', status: 'pending' },
    ],
    stats: { listings: 0, reviews: 0, rating: null }, reports: 0, adminNotes: '', rejectionReason: '',
  },
  {
    id: 'a_002', status: 'pending', name: 'Fatima Al-Rashid', email: 'fatima.ar@proptech.cm', phone: '+237 677 890 012',
    region: 'Yaoundé', city: 'Bastos', agencyName: 'Al-Rashid Properties', agencyType: 'agency',
    licenseNumber: 'CMR-RE-2024-1091', yearsExperience: 7, submittedAt: '2024-12-17T14:00:00',
    bio: '7 years in Yaoundé real estate, focused on luxury and expat-oriented properties.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1461800919507-79b16743b257?w=600', status: 'pending' },
      { id: 'd2', name: 'National ID (Back)', type: 'image', url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600', status: 'pending' },
      { id: 'd3', name: 'RE License', type: 'image', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600', status: 'pending' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', status: 'pending' },
    ],
    stats: { listings: 0, reviews: 0, rating: null }, reports: 0, adminNotes: 'Agency proof not submitted. Need to request this before approval.', rejectionReason: '',
  },
  {
    id: 'a_003', status: 'verified', name: 'Jean-Paul Mbarga', email: 'jp.mbarga@camereal.cm', phone: '+237 655 234 567',
    region: 'Douala', city: 'Bonanjo', agencyName: 'CameReal Group', agencyType: 'agency',
    licenseNumber: 'CMR-RE-2023-0891', yearsExperience: 9, submittedAt: '2023-10-15T09:00:00', verifiedAt: '2023-10-16T11:00:00',
    bio: '9 years of experience across Douala. CameReal Group is one of the most established agencies in Littoral.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=600', status: 'verified' },
      { id: 'd3', name: 'RE License', type: 'image', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600', status: 'verified' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', status: 'verified' },
    ],
    stats: { listings: 24, reviews: 41, rating: 4.8 }, reports: 0, adminNotes: '', rejectionReason: '',
  },
  {
    id: 'a_004', status: 'rejected', name: 'Roger Akono', email: 'r.akono@mail.cm', phone: '+237 677 456 789',
    region: 'Bafoussam', city: 'Bafoussam Centre', agencyName: 'Solo Agent', agencyType: 'individual',
    licenseNumber: 'UNKNOWN-0000', yearsExperience: 1, submittedAt: '2024-12-14T10:00:00', bio: 'New to real estate, eager to help buyers and sellers.',
    documents: [{ id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600', status: 'pending' }],
    stats: { listings: 0, reviews: 0, rating: null }, reports: 0, adminNotes: '',
    rejectionReason: 'License number CMR-RE format is invalid. National ID only — missing license and passport photo. Please reapply with full documentation.',
  },
  {
    id: 'a_005', status: 'suspended', name: 'Marcus Njoume', email: 'marcus.nj@yahoo.com', phone: '+237 699 000 001',
    region: 'Douala', city: 'Akwa', agencyName: 'Shady Deals Ltd', agencyType: 'agency',
    licenseNumber: 'FAKE-0000', yearsExperience: 2, submittedAt: '2024-10-01T08:00:00', bio: 'Fast deals, no problem.',
    documents: [{ id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=600', status: 'pending' }],
    stats: { listings: 5, reviews: 2, rating: 1.2 }, reports: 8, adminNotes: 'Multiple user reports. Fake listings confirmed. License invalid.',
    rejectionReason: '', suspendedReason: 'Verified fraud — fake listings and financial scams. Account suspended.',
  },
];

const STATUS_CFG = {
  pending:   { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  verified:  { label: 'Verified',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:  { label: 'Rejected',       cls: 'bg-red-50 text-red-600 border-red-200' },
  suspended: { label: 'Suspended',      cls: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

const TABS = ['All', 'Pending', 'Verified', 'Rejected', 'Suspended'];

function DocViewer({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white font-semibold text-sm">{doc.name}</p>
        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0" onClick={e => e.stopPropagation()}>
        {doc.type === 'image'
          ? <img src={doc.url} alt={doc.name} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
          : <div className="bg-white rounded-xl p-8 text-center">
              <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-600 font-semibold">{doc.name}</p>
              <button className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
        }
      </div>
    </div>
  );
}

function AgentDetail({ agent: initialAgent, onClose, onVerify, onReject, onSuspend, onReinstate }) {
  const [agent, setAgent] = useState(initialAgent);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [tab, setTab] = useState('profile');
  const [rejectText, setRejectText] = useState('');
  const [suspendText, setSuspendText] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [adminNote, setAdminNote] = useState(agent.adminNotes);

  const st = STATUS_CFG[agent.status];
  const isPending = agent.status === 'pending';
  const isVerified = agent.status === 'verified';
  const isSuspended = agent.status === 'suspended';

  const setDocStatus = (docId, status) => {
    setAgent(a => ({ ...a, documents: a.documents.map(d => d.id === docId ? { ...d, status } : d) }));
  };
  const verifiedDocCount = agent.documents.filter(d => d.status === 'verified').length;

  return (
    <>
      {viewingDoc && <DocViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div className="w-full sm:max-w-2xl bg-white h-full flex flex-col overflow-hidden sm:border-l border-zinc-200 shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{agent.name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900">{agent.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                </div>
                <p className="text-xs text-zinc-400 truncate">{agent.agencyName} · {agent.city}, {agent.region}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 px-4 sm:px-6 flex-shrink-0 overflow-x-auto">
            {['profile', 'documents', 'history'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-3 mr-4 sm:mr-5 text-xs font-semibold border-b-2 transition-colors capitalize whitespace-nowrap flex-shrink-0 ${tab === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                {t}
                {t === 'documents' && <span className={`ml-1.5 text-xs ${verifiedDocCount === agent.documents.length && agent.documents.length > 0 ? 'text-emerald-500' : 'text-zinc-300'}`}>{verifiedDocCount}/{agent.documents.length}</span>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'profile' && (
              <div className="px-4 sm:px-6 py-5 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Contact</p>
                  <div className="space-y-2">
                    {[{ icon: Mail, label: 'Email', value: agent.email }, { icon: Phone, label: 'Phone', value: agent.phone }, { icon: MapPin, label: 'Region', value: `${agent.city}, ${agent.region}` }].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5 border-b border-zinc-50">
                        <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-400">{label}</p>
                          <p className="text-sm text-zinc-800 truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Professional Info</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Agency', value: agent.agencyName },
                      { label: 'Type', value: agent.agencyType === 'agency' ? 'Agency' : 'Individual' },
                      { label: 'License', value: agent.licenseNumber },
                      { label: 'Experience', value: `${agent.yearsExperience} years` },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-zinc-100 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-zinc-400">{label}</p>
                        <p className="text-xs font-semibold text-zinc-800 mt-0.5 font-mono leading-relaxed truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400">Valid format: <span className="font-mono">CMR-RE-YYYY-NNNN</span></p>
                  </div>
                </div>

                {agent.bio && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Bio</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{agent.bio}</p>
                  </div>
                )}

                {agent.stats.listings > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Activity</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ label: 'Listings', value: agent.stats.listings }, { label: 'Reviews', value: agent.stats.reviews }, { label: 'Rating', value: agent.stats.rating ? `${agent.stats.rating} ★` : '—' }].map(({ label, value }) => (
                        <div key={label} className="border border-zinc-100 rounded-lg px-3 py-3 text-center">
                          <p className="text-base font-bold text-zinc-900">{value}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agent.reports > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <Flag className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-700">{agent.reports} reports filed against this agent</p>
                  </div>
                )}

                {agent.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600">{agent.rejectionReason}</p>
                  </div>
                )}
                {agent.suspendedReason && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <p className="text-xs font-bold text-zinc-700 mb-1">Suspension Reason</p>
                    <p className="text-sm text-zinc-600">{agent.suspendedReason}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Admin Notes</p>
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Notes (only visible to admins)..." rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message Agent</p>
                  <textarea placeholder="Send a message to this agent..." rows={2}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2" />
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                    <Send className="w-3 h-3" /> Send Message
                  </button>
                </div>
              </div>
            )}

            {tab === 'documents' && (
              <div className="px-4 sm:px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Documents</p>
                  <span className={`text-xs font-semibold ${verifiedDocCount === agent.documents.length && agent.documents.length > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    {verifiedDocCount}/{agent.documents.length} accepted
                  </span>
                </div>

                <div className="space-y-3">
                  {agent.documents.map(doc => (
                    <div key={doc.id} className="border border-zinc-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-50">
                        <p className="text-xs font-semibold text-zinc-800 truncate">{doc.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'flagged' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {doc.status === 'verified' ? '✓ Accepted' : doc.status === 'flagged' ? '✗ Flagged' : 'Pending'}
                        </span>
                      </div>
                      {doc.type === 'image' ? (
                        <div className="relative">
                          <img src={doc.url} alt={doc.name} className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setViewingDoc(doc)} />
                          <button onClick={() => setViewingDoc(doc)} className="absolute bottom-2 right-2 bg-black/50 text-white rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-1 hover:bg-black/70 transition-colors">
                            <ZoomIn className="w-3 h-3" /> View
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 bg-zinc-50 flex items-center justify-center gap-3">
                          <FileText className="w-5 h-5 text-zinc-300" />
                          <p className="text-xs font-semibold text-zinc-500">PDF Document</p>
                        </div>
                      )}
                      <div className="flex gap-2 px-4 py-3">
                        <button onClick={() => setDocStatus(doc.id, 'flagged')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${doc.status === 'flagged' ? 'bg-red-600 text-white border-red-600' : 'text-red-500 border-red-200 hover:bg-red-50'}`}>
                          Flag Issue
                        </button>
                        <button onClick={() => setDocStatus(doc.id, 'verified')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${doc.status === 'verified' ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'history' && (
              <div className="px-4 sm:px-6 py-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Application Timeline</p>
                <div className="space-y-4">
                  {[
                    { dot: 'bg-zinc-900', title: 'Application submitted', sub: new Date(agent.submittedAt).toLocaleString(), detail: 'All documents uploaded. Application entered review queue.' },
                    agent.verifiedAt && { dot: 'bg-emerald-500', title: 'Application verified', sub: new Date(agent.verifiedAt).toLocaleString(), detail: 'Identity and license confirmed.' },
                    agent.rejectionReason && { dot: 'bg-red-500', title: 'Application rejected', sub: '—', detail: agent.rejectionReason },
                    agent.suspendedReason && { dot: 'bg-zinc-400', title: 'Account suspended', sub: '—', detail: agent.suspendedReason },
                  ].filter(Boolean).map((ev, i, arr) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${ev.dot}`} />
                        {i < arr.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-semibold text-zinc-800">{ev.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{ev.sub}</p>
                        {ev.detail && <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{ev.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 sm:px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0 space-y-3">
            {showReject && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Rejection Reason</p>
                <textarea value={rejectText} onChange={e => setRejectText(e.target.value)} placeholder="Explain why this application was rejected..." rows={3}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300" />
                <div className="flex gap-2">
                  <button onClick={() => setShowReject(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg">Cancel</button>
                  <button onClick={() => rejectText.trim() && onReject(agent, rejectText)} disabled={!rejectText.trim()}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg disabled:opacity-40">Confirm</button>
                </div>
              </div>
            )}
            {showSuspend && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Suspension Reason</p>
                <textarea value={suspendText} onChange={e => setSuspendText(e.target.value)} placeholder="Reason for suspension..." rows={2}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300" />
                <div className="flex gap-2">
                  <button onClick={() => setShowSuspend(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg">Cancel</button>
                  <button onClick={() => suspendText.trim() && onSuspend(agent, suspendText)} disabled={!suspendText.trim()}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-lg disabled:opacity-40">Confirm</button>
                </div>
              </div>
            )}
            {!showReject && !showSuspend && (
              <div className="flex gap-2">
                {isPending && (
                  <>
                    <button onClick={() => setShowReject(true)}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => onVerify(agent)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Shield className="w-4 h-4" /> Verify Agent
                    </button>
                  </>
                )}
                {isVerified && (
                  <button onClick={() => setShowSuspend(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                    <Ban className="w-4 h-4" /> Suspend Agent
                  </button>
                )}
                {isSuspended && (
                  <button onClick={() => onReinstate(agent)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Reinstate Agent
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AgentCard({ agent, onClick }) {
  const st = STATUS_CFG[agent.status];
  const docCount = agent.documents.length;
  const requiredDocs = 4;

  return (
    <div onClick={onClick} className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{agent.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-zinc-900 truncate">{agent.name}</p>
            {agent.status === 'verified' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-zinc-400 truncate">{agent.agencyName}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>{st.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
        <div><p className="text-xs text-zinc-400">Region</p><p className="text-xs font-medium text-zinc-700">{agent.region}</p></div>
        <div><p className="text-xs text-zinc-400">Exp.</p><p className="text-xs font-medium text-zinc-700">{agent.yearsExperience}y</p></div>
        <div className="col-span-2"><p className="text-xs text-zinc-400">License</p><p className="text-xs font-mono text-zinc-700 truncate">{agent.licenseNumber}</p></div>
      </div>

      <div className="pt-3 border-t border-zinc-50">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-zinc-400">Documents</span>
          <span className={`font-semibold ${docCount >= requiredDocs ? 'text-emerald-600' : 'text-amber-600'}`}>{docCount}/{requiredDocs}</span>
        </div>
        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${docCount >= requiredDocs ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, (docCount / requiredDocs) * 100)}%` }} />
        </div>
      </div>

      {agent.reports > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <AlertTriangle className="w-3 h-3" />{agent.reports} reports
        </div>
      )}
    </div>
  );
}

export default function AgentVerification() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState(AGENTS);
  const [selected, setSelected] = useState(null);

  const onVerify = (agent) => { setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'verified', verifiedAt: new Date().toISOString() } : a)); setSelected(null); };
  const onReject = (agent, reason) => { setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'rejected', rejectionReason: reason } : a)); setSelected(null); };
  const onSuspend = (agent, reason) => { setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'suspended', suspendedReason: reason } : a)); setSelected(null); };
  const onReinstate = (agent) => { setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'verified', suspendedReason: '' } : a)); setSelected(null); };

  const counts = TABS.reduce((acc, t) => ({ ...acc, [t]: t === 'All' ? agents.length : agents.filter(a => a.status === t.toLowerCase()).length }), {});

  const filtered = agents.filter(a => {
    const tabMatch = activeTab === 'All' || a.status === activeTab.toLowerCase();
    const q = search.toLowerCase();
    return tabMatch && (!q || [a.name, a.email, a.agencyName, a.region, a.licenseNumber].some(f => f.toLowerCase().includes(q)));
  });

  const selectedAgent = selected ? agents.find(a => a.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {selectedAgent && (
          <AgentDetail agent={selectedAgent} onClose={() => setSelected(null)}
            onVerify={onVerify} onReject={onReject} onSuspend={onSuspend} onReinstate={onReinstate} />
        )}

        <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Agent Verification</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review agent applications and documents.</p>
          </div>
          {counts['Pending'] > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex-shrink-0">
              {counts['Pending']} pending
            </span>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents, agencies, license numbers..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
        </div>

        <div className="flex gap-0.5 mb-5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}>
              {t} <span className={`ml-1 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center"><User className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No agents found</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map(agent => <AgentCard key={agent.id} agent={agent} onClick={() => setSelected(agent)} />)}
          </div>
        )}
      </div>
    </AdminNav>
  );
}