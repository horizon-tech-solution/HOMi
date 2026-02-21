import { useState } from 'react';
import {
  Search, CheckCircle, XCircle, AlertTriangle, X, ZoomIn,
  User, Phone, Mail, MapPin, Building2, FileText, Download,
  Eye, Shield, Ban, RotateCcw, ChevronLeft, ChevronRight,
  Star, Clock, Send, ExternalLink, Info, MessageSquare, Flag
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

/* ─── Mock Agents ───────────────────────────────────────── */
const AGENTS = [
  {
    id: 'a_001',
    status: 'pending',
    name: 'Samuel Ekwueme',
    email: 'samuel.e@camereal.cm',
    phone: '+237 699 123 456',
    whatsapp: '+237 699 123 456',
    region: 'Douala',
    city: 'Bonanjo',
    agencyName: 'Ekwueme Real Estate',
    agencyType: 'agency',
    licenseNumber: 'CMR-RE-2024-1082',
    yearsExperience: 4,
    submittedAt: '2024-12-18T07:00:00',
    bio: 'Real estate professional with 4 years of experience in the Douala market, specializing in residential and commercial properties in the Littoral region.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1533279443086-d1c19a186416?w=600', status: 'pending', note: '' },
      { id: 'd2', name: 'National ID (Back)', type: 'image', url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600', status: 'pending', note: '' },
      { id: 'd3', name: 'Professional RE License', type: 'image', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600', status: 'pending', note: '' },
      { id: 'd4', name: 'Agency Registration Certificate', type: 'pdf', url: '#', status: 'pending', note: '' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', status: 'pending', note: '' },
    ],
    stats: { listings: 0, reviews: 0, rating: null },
    reports: 0,
    adminNotes: '',
    rejectionReason: '',
  },
  {
    id: 'a_002',
    status: 'pending',
    name: 'Fatima Al-Rashid',
    email: 'fatima.ar@proptech.cm',
    phone: '+237 677 890 012',
    whatsapp: '+237 677 890 012',
    region: 'Yaoundé',
    city: 'Bastos',
    agencyName: 'Al-Rashid Properties',
    agencyType: 'agency',
    licenseNumber: 'CMR-RE-2024-1091',
    yearsExperience: 7,
    submittedAt: '2024-12-17T14:00:00',
    bio: '7 years in Yaoundé real estate, focused on luxury and expat-oriented properties in the Centre region.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1461800919507-79b16743b257?w=600', status: 'pending', note: '' },
      { id: 'd2', name: 'National ID (Back)', type: 'image', url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600', status: 'pending', note: '' },
      { id: 'd3', name: 'Professional RE License', type: 'image', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600', status: 'pending', note: '' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', status: 'pending', note: '' },
    ],
    stats: { listings: 0, reviews: 0, rating: null },
    reports: 0,
    adminNotes: 'Agency proof not submitted. Need to request this before approval.',
    rejectionReason: '',
  },
  {
    id: 'a_003',
    status: 'verified',
    name: 'Jean-Paul Mbarga',
    email: 'jp.mbarga@camereal.cm',
    phone: '+237 655 234 567',
    whatsapp: '+237 655 234 567',
    region: 'Douala',
    city: 'Bonanjo',
    agencyName: 'CameReal Group',
    agencyType: 'agency',
    licenseNumber: 'CMR-RE-2023-0891',
    yearsExperience: 9,
    submittedAt: '2023-10-15T09:00:00',
    verifiedAt: '2023-10-16T11:00:00',
    bio: '9 years of experience across Douala. CameReal Group is one of the most established agencies in Littoral.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=600', status: 'verified', note: '' },
      { id: 'd2', name: 'National ID (Back)', type: 'image', url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600', status: 'verified', note: '' },
      { id: 'd3', name: 'Professional RE License', type: 'image', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600', status: 'verified', note: '' },
      { id: 'd4', name: 'Agency Registration Certificate', type: 'pdf', url: '#', status: 'verified', note: '' },
      { id: 'd5', name: 'Passport Photo', type: 'image', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', status: 'verified', note: '' },
    ],
    stats: { listings: 24, reviews: 41, rating: 4.8 },
    reports: 0,
    adminNotes: '',
    rejectionReason: '',
  },
  {
    id: 'a_004',
    status: 'rejected',
    name: 'Roger Akono',
    email: 'r.akono@mail.cm',
    phone: '+237 677 456 789',
    whatsapp: null,
    region: 'Bafoussam',
    city: 'Bafoussam Centre',
    agencyName: 'Solo Agent',
    agencyType: 'individual',
    licenseNumber: 'UNKNOWN-0000',
    yearsExperience: 1,
    submittedAt: '2024-12-14T10:00:00',
    bio: 'New to real estate, eager to help buyers and sellers.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600', status: 'pending', note: '' },
    ],
    stats: { listings: 0, reviews: 0, rating: null },
    reports: 0,
    adminNotes: '',
    rejectionReason: 'License number CMR-RE format is invalid. National ID only — missing license and passport photo. Please reapply with full documentation.',
  },
  {
    id: 'a_005',
    status: 'suspended',
    name: 'Marcus Njoume',
    email: 'marcus.nj@yahoo.com',
    phone: '+237 699 000 001',
    whatsapp: null,
    region: 'Douala',
    city: 'Akwa',
    agencyName: 'Shady Deals Ltd',
    agencyType: 'agency',
    licenseNumber: 'FAKE-0000',
    yearsExperience: 2,
    submittedAt: '2024-10-01T08:00:00',
    bio: 'Fast deals, no problem.',
    documents: [
      { id: 'd1', name: 'National ID (Front)', type: 'image', url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=600', status: 'pending', note: '' },
    ],
    stats: { listings: 5, reviews: 2, rating: 1.2 },
    reports: 8,
    adminNotes: 'Multiple user reports. Fake listings confirmed. License invalid. Suspended pending criminal investigation.',
    rejectionReason: '',
    suspendedReason: 'Verified fraud — fake listings and financial scams. Account suspended.',
  },
];

const REQUIRED_DOCS = [
  { key: 'national_id_front', label: 'National ID (Front)', required: true },
  { key: 'national_id_back', label: 'National ID (Back)', required: true },
  { key: 'license', label: 'Professional RE License', required: true },
  { key: 'agency_cert', label: 'Agency Registration Certificate', required: false },
  { key: 'passport_photo', label: 'Passport Photo', required: true },
];

const STATUS_CFG = {
  pending:   { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  verified:  { label: 'Verified',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:  { label: 'Rejected',       cls: 'bg-red-50 text-red-600 border-red-200' },
  suspended: { label: 'Suspended',      cls: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

const TABS = ['All', 'Pending', 'Verified', 'Rejected', 'Suspended'];

/* ─── Document Image Viewer ──────────────────────────────── */
function DocViewer({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div>
          <p className="text-white font-semibold">{doc.name}</p>
          <p className="text-white/40 text-xs capitalize">{doc.type}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 min-h-0" onClick={e => e.stopPropagation()}>
        {doc.type === 'image' ? (
          <img src={doc.url} alt={doc.name} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-600 font-semibold">{doc.name}</p>
            <p className="text-zinc-400 text-sm mt-1">PDF Document</p>
            <button className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Agent Detail Panel ─────────────────────────────────── */
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

  /* per-doc accept/flag */
  const setDocStatus = (docId, status) => {
    setAgent(a => ({
      ...a,
      documents: a.documents.map(d => d.id === docId ? { ...d, status } : d),
    }));
  };

  const imageDocCount = agent.documents.filter(d => d.type === 'image').length;
  const verifiedDocCount = agent.documents.filter(d => d.status === 'verified').length;

  return (
    <>
      {viewingDoc && <DocViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}

      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div
          className="w-full max-w-2xl bg-white h-full flex flex-col overflow-hidden border-l border-zinc-200 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {agent.documents.find(d => d.name.includes('Passport'))?.url && (
                  <img
                    src={agent.documents.find(d => d.name.includes('Passport')).url}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) || (
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-white font-bold">{agent.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">{agent.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                </div>
                <p className="text-xs text-zinc-400">{agent.agencyName} · {agent.city}, {agent.region}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
            {['profile', 'documents', 'history'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 mr-5 text-xs font-semibold border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {t}
                {t === 'documents' && (
                  <span className={`ml-1.5 text-xs ${verifiedDocCount === agent.documents.length && agent.documents.length > 0 ? 'text-emerald-500' : 'text-zinc-300'}`}>
                    {verifiedDocCount}/{agent.documents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Profile Tab ─────────────────────────────── */}
            {tab === 'profile' && (
              <div className="px-6 py-5 space-y-6">

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Contact & Identity</p>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: 'Email', value: agent.email },
                      { icon: Phone, label: 'Phone', value: agent.phone },
                      { icon: MapPin, label: 'Operating Region', value: `${agent.city}, ${agent.region}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5 border-b border-zinc-50">
                        <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-zinc-400">{label}</p>
                          <p className="text-sm text-zinc-800 mt-0.5">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Info */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Professional Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Agency Name', value: agent.agencyName },
                      { label: 'Agency Type', value: agent.agencyType === 'agency' ? 'Real Estate Agency' : 'Individual Agent' },
                      { label: 'License Number', value: agent.licenseNumber },
                      { label: 'Experience', value: `${agent.yearsExperience} years` },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-zinc-100 rounded-lg px-3 py-3">
                        <p className="text-xs text-zinc-400">{label}</p>
                        <p className="text-sm font-semibold text-zinc-800 mt-0.5 font-mono text-xs leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                  {/* License validation hint */}
                  <div className="mt-2 flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400">
                      Verify this license on the <button className="underline hover:text-zinc-700 transition-colors">MINDHU official registry</button>. Valid format: <span className="font-mono">CMR-RE-YYYY-NNNN</span>
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {agent.bio && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Agent Bio</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{agent.bio}</p>
                  </div>
                )}

                {/* Stats (if any) */}
                {agent.stats.listings > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Platform Activity</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Listings', value: agent.stats.listings },
                        { label: 'Reviews', value: agent.stats.reviews },
                        { label: 'Rating', value: agent.stats.rating ? `${agent.stats.rating} ★` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="border border-zinc-100 rounded-lg px-3 py-3 text-center">
                          <p className="text-base font-bold text-zinc-900">{value}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {agent.reports > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <Flag className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">{agent.reports} reports filed against this agent</p>
                      <button className="text-xs text-red-500 hover:text-red-700 mt-0.5 transition-colors">View all reports →</button>
                    </div>
                  </div>
                )}

                {/* Rejection/Suspension reason if applicable */}
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

                {/* Admin notes */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Internal Admin Notes</p>
                  <textarea
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Notes about this agent (only visible to admins)..."
                    rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                  />
                </div>

                {/* Message agent */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message Agent</p>
                  <textarea
                    placeholder="Send a message to this agent..."
                    rows={2}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2"
                  />
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                    <Send className="w-3 h-3" /> Send Message
                  </button>
                </div>
              </div>
            )}

            {/* ── Documents Tab ────────────────────────────── */}
            {tab === 'documents' && (
              <div className="px-6 py-5 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Submitted Documents</p>
                  <span className={`text-xs font-semibold ${verifiedDocCount === agent.documents.length && agent.documents.length > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    {verifiedDocCount}/{agent.documents.length} accepted
                  </span>
                </div>

                {/* Required checklist */}
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-500">Required Documents Checklist</p>
                  </div>
                  {REQUIRED_DOCS.map(req => {
                    const submitted = agent.documents.some(d => d.name.toLowerCase().includes(req.key.replace(/_/g, ' ')));
                    return (
                      <div key={req.key} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-50 last:border-0">
                        {submitted
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          : req.required
                            ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-zinc-200 flex-shrink-0" />
                        }
                        <span className={`text-sm flex-1 ${!submitted && req.required ? 'text-red-600' : 'text-zinc-600'}`}>
                          {req.label}
                        </span>
                        {!req.required && !submitted && (
                          <span className="text-xs text-zinc-300">optional</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  {agent.documents.map(doc => (
                    <div key={doc.id} className="border border-zinc-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-50">
                        <p className="text-xs font-semibold text-zinc-800">{doc.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600'
                            : doc.status === 'flagged' ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                          }`}>
                            {doc.status === 'verified' ? '✓ Accepted' : doc.status === 'flagged' ? '✗ Flagged' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {doc.type === 'image' ? (
                        <div className="relative">
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setViewingDoc(doc)}
                          />
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="absolute bottom-3 right-3 bg-black/50 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-black/70 transition-colors"
                          >
                            <ZoomIn className="w-3 h-3" /> View full
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 bg-zinc-50 flex items-center justify-center gap-3">
                          <FileText className="w-6 h-6 text-zinc-300" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-500">PDF Document</p>
                            <p className="text-xs text-zinc-300">{doc.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 px-4 py-3">
                        <button
                          onClick={() => setDocStatus(doc.id, 'flagged')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            doc.status === 'flagged'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'text-red-500 border-red-200 hover:bg-red-50'
                          }`}
                        >
                          Flag Issue
                        </button>
                        <button
                          onClick={() => setDocStatus(doc.id, 'verified')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            doc.status === 'verified'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          Accept Document
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── History Tab ──────────────────────────────── */}
            {tab === 'history' && (
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Application Timeline</p>
                <div className="space-y-4">
                  {[
                    { dot: 'bg-zinc-900', title: 'Application submitted', sub: new Date(agent.submittedAt).toLocaleString(), detail: 'All documents uploaded. Application entered review queue.' },
                    agent.verifiedAt && { dot: 'bg-emerald-500', title: 'Application verified', sub: new Date(agent.verifiedAt).toLocaleString(), detail: 'Identity and license confirmed. Account activated.' },
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

          {/* Action Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0 space-y-3">

            {/* Reject form */}
            {showReject && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Rejection Reason (sent to agent)</p>
                <textarea
                  value={rejectText}
                  onChange={e => setRejectText(e.target.value)}
                  placeholder="Explain why this application was rejected..."
                  rows={3}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowReject(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                  <button
                    onClick={() => rejectText.trim() && onReject(agent, rejectText)}
                    disabled={!rejectText.trim()}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Suspend form */}
            {showSuspend && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Suspension Reason</p>
                <textarea
                  value={suspendText}
                  onChange={e => setSuspendText(e.target.value)}
                  placeholder="Reason for suspension..."
                  rows={2}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 text-zinc-700 placeholder:text-zinc-300"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowSuspend(false)} className="flex-1 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                  <button
                    onClick={() => suspendText.trim() && onSuspend(agent, suspendText)}
                    disabled={!suspendText.trim()}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            {!showReject && !showSuspend && (
              <div className="flex gap-2">
                {isPending && (
                  <>
                    <button
                      onClick={() => setShowReject(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => onVerify(agent)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <Shield className="w-4 h-4" /> Verify Agent
                    </button>
                  </>
                )}
                {isVerified && (
                  <button
                    onClick={() => setShowSuspend(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Suspend Agent
                  </button>
                )}
                {isSuspended && (
                  <button
                    onClick={() => onReinstate(agent)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
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

/* ─── Agent Card ─────────────────────────────────────────── */
function AgentCard({ agent, onClick }) {
  const st = STATUS_CFG[agent.status];
  const docCount = agent.documents.length;
  const verifiedDocs = agent.documents.filter(d => d.status === 'verified').length;
  const requiredDocs = 4; // ID front, ID back, license, passport

  return (
    <div
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
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
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>
          {st.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
        <div>
          <p className="text-xs text-zinc-400">Region</p>
          <p className="text-xs font-medium text-zinc-700">{agent.region}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">License</p>
          <p className="text-xs font-mono text-zinc-700">{agent.licenseNumber}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Experience</p>
          <p className="text-xs font-medium text-zinc-700">{agent.yearsExperience}y</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Submitted</p>
          <p className="text-xs font-medium text-zinc-700">{new Date(agent.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Doc progress */}
      <div className="mt-3 pt-3 border-t border-zinc-50">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-zinc-400">Documents</span>
          <span className={`font-semibold ${docCount >= requiredDocs ? 'text-emerald-600' : 'text-amber-600'}`}>
            {docCount}/{requiredDocs} submitted
          </span>
        </div>
        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${docCount >= requiredDocs ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(100, (docCount / requiredDocs) * 100)}%` }}
          />
        </div>
      </div>

      {agent.reports > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <AlertTriangle className="w-3 h-3" /> {agent.reports} reports
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function AgentVerification() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState(AGENTS);
  const [selected, setSelected] = useState(null);

  const onVerify = (agent) => {
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'verified', verifiedAt: new Date().toISOString() } : a));
    setSelected(null);
  };
  const onReject = (agent, reason) => {
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'rejected', rejectionReason: reason } : a));
    setSelected(null);
  };
  const onSuspend = (agent, reason) => {
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'suspended', suspendedReason: reason } : a));
    setSelected(null);
  };
  const onReinstate = (agent) => {
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'verified', suspendedReason: '' } : a));
    setSelected(null);
  };

  const counts = TABS.reduce((acc, t) => ({
    ...acc,
    [t]: t === 'All' ? agents.length : agents.filter(a => a.status === t.toLowerCase()).length
  }), {});

  const filtered = agents.filter(a => {
    const tabMatch = activeTab === 'All' || a.status === activeTab.toLowerCase();
    const q = search.toLowerCase();
    const searchMatch = !q || [a.name, a.email, a.agencyName, a.region, a.licenseNumber].some(f => f.toLowerCase().includes(q));
    return tabMatch && searchMatch;
  });

  // Update selected when agents change
  const selectedAgent = selected ? agents.find(a => a.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {selectedAgent && (
          <AgentDetail
            agent={selectedAgent}
            onClose={() => setSelected(null)}
            onVerify={onVerify}
            onReject={onReject}
            onSuspend={onSuspend}
            onReinstate={onReinstate}
          />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Agent Verification</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review agent applications, verify identities and documents.</p>
          </div>
          {counts['Pending'] > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              {counts['Pending']} pending review
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents, agencies, license numbers..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-0.5 mb-5">
          {TABS.map(t => (
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

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">No agents found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(agent => (
              <AgentCard key={agent.id} agent={agent} onClick={() => setSelected(agent)} />
            ))}
          </div>
        )}
      </div>
    </AdminNav>
  );
}