import { useState, useEffect, useCallback } from 'react';
import {
  Search, MapPin, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  X, ZoomIn, Download, Phone, Mail, Building2, FileText,
  ImageIcon, MessageSquare, Eye, Send, Loader2
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import {
  fetchListings, approveListing, rejectListing,
  requestChanges, saveListingNotes,
} from '../../api/admin/listings';

const FRAUD_LABELS = {
  price_anomaly:          { label: 'Price anomaly',          desc: 'Price is significantly below market rate.',          color: 'text-red-600 bg-red-50 border-red-200' },
  duplicate_listing:      { label: 'Possible duplicate',     desc: 'Similar listing found in database.',                 color: 'text-orange-600 bg-orange-50 border-orange-200' },
  stolen_photos_likely:   { label: 'Stolen photos suspected',desc: 'Photos may be from another source.',                 color: 'text-red-600 bg-red-50 border-red-200' },
  new_account_high_volume:{ label: 'New account — high volume', desc: 'Account < 60 days old with multiple listings.',   color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low_photo_count:        { label: 'Low photo count',        desc: 'Below the 4-photo minimum.',                         color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

const STATUS = {
  pending:  { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected',       cls: 'bg-red-50 text-red-600 border-red-200' },
  flagged:  { label: 'Flagged',        cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const TABS = ['All', 'Pending', 'Flagged', 'Approved', 'Rejected'];

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Photo lightbox ────────────────────────────────────────────────────────────
function PhotoViewer({ photos, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-10 sm:px-16 min-h-0 relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
          className="absolute left-2 sm:left-4 p-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <img src={photos[idx]} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
        <button onClick={() => setIdx(i => Math.min(photos.length - 1, i + 1))} disabled={idx === photos.length - 1}
          className="absolute right-2 sm:right-4 p-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="flex gap-2 justify-center px-4 py-4 flex-shrink-0 overflow-x-auto" onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-12 h-9 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${i === idx ? 'border-white opacity-100' : 'border-transparent opacity-40'}`}>
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Reject / request-changes modal ────────────────────────────────────────────
function ActionModal({ type, onConfirm, onClose, loading }) {
  const [text, setText] = useState('');
  const isReject = type === 'reject';
  const presets = isReject
    ? [
        'Photos do not meet quality requirements (minimum 4 clear, well-lit photos).',
        'Property description is incomplete or misleading.',
        'Required documents not provided (land title or ownership proof).',
        'Suspected fraudulent listing — account under review.',
      ]
    : [
        'Please add at least 4 photos of the interior.',
        'Please provide the land title or ownership certificate.',
        'Please correct the property address — it does not match the description.',
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden border border-zinc-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">{isReject ? 'Reject Listing' : 'Request Changes'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5 mb-4">
            {presets.map((p, i) => (
              <button key={i} onClick={() => setText(p)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${text === p ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50 border border-zinc-100'}`}>
                {p}
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Or write a custom message..." rows={3}
            className="w-full text-sm text-zinc-800 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300" />
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
          <button onClick={() => text.trim() && onConfirm(text)} disabled={!text.trim() || loading}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${isReject ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isReject ? 'Reject Listing' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail slide-over ─────────────────────────────────────────────────────────
function ListingDetail({ listing, onClose, onApprove, onReject, onRequestChanges }) {
  const [photoViewer, setPhotoViewer] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [note, setNote]               = useState(listing.adminNotes);
  const [tab, setTab]                 = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const [noteSaving, setNoteSaving]   = useState(false);

  const st        = STATUS[listing.status] || STATUS.pending;
  const isPending = listing.status === 'pending' || listing.status === 'flagged';

  const handleApprove = async () => {
    setActionLoading('approve');
    try { await onApprove(listing); }
    catch (err) { alert('Approve failed: ' + err.message); }
    finally { setActionLoading(null); }
  };

  const handleModalConfirm = async (text) => {
    setActionLoading(actionModal);
    try {
      if (actionModal === 'reject') await onReject(listing, text);
      else await onRequestChanges(listing, text);
      setActionModal(null);
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNote = async () => {
    setNoteSaving(true);
    try { await saveListingNotes(listing.id, note); }
    catch (err) { alert('Failed to save note: ' + err.message); }
    finally { setNoteSaving(false); }
  };

  return (
    <>
      {photoViewer !== null && (
        <PhotoViewer photos={listing.photos} initialIndex={photoViewer} onClose={() => setPhotoViewer(null)} />
      )}
      {actionModal && (
        <ActionModal
          type={actionModal}
          loading={actionLoading === actionModal}
          onClose={() => setActionModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}

      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div className="w-full sm:max-w-2xl lg:max-w-3xl bg-white h-full flex flex-col overflow-hidden sm:border-l border-zinc-200 shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                <span className="text-xs text-zinc-400">#{listing.id}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">{listing.title}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{listing.location.city}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fraud signals */}
          {listing.fraudSignals?.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-red-50 border-b border-red-100 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700">Fraud Signals Detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {listing.fraudSignals.map(sig => {
                  const f = FRAUD_LABELS[sig];
                  return f ? (
                    <span key={sig} title={f.desc} className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-help ${f.color}`}>{f.label}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 px-4 sm:px-6 flex-shrink-0 overflow-x-auto">
            {['overview', 'documents', 'submitter'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-3 mr-4 sm:mr-5 text-xs font-semibold border-b-2 transition-colors capitalize whitespace-nowrap flex-shrink-0 ${tab === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div className="px-4 sm:px-6 py-5 space-y-6">

                {/* Photos */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    Photos ({listing.photos.length})
                  </p>
                  {listing.photos.length === 0 ? (
                    <div className="h-20 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center">
                      <p className="text-xs text-zinc-300">No photos submitted</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {listing.photos.map((photo, i) => (
                        <button key={i} onClick={() => setPhotoViewer(i)}
                          className="relative aspect-square rounded-lg overflow-hidden group bg-zinc-100">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {i === 0 && (
                            <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">Cover</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Pricing</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Listed Price', value: `${listing.price.toLocaleString()} XAF${listing.transaction === 'rent' ? '/mo' : ''}` },
                      { label: 'Type',         value: listing.transaction },
                      { label: 'Category',     value: listing.type },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-zinc-100 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-zinc-400 mb-1">{label}</p>
                        <p className="text-xs sm:text-sm font-bold text-zinc-900 capitalize">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Property Details</p>
                  <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                    {[
                      { label: 'Area',       value: `${listing.specs.area} m²` },
                      { label: 'Bedrooms',   value: listing.specs.bedrooms ?? '—' },
                      { label: 'Bathrooms',  value: listing.specs.bathrooms ?? '—' },
                      { label: 'Furnished',  value: listing.specs.furnished ?? '—' },
                      { label: 'Parking',    value: listing.specs.parking ? 'Yes' : 'No' },
                      { label: 'Generator',  value: listing.specs.generator ? 'Yes' : 'No' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                        <span className="text-xs text-zinc-400">{label}</span>
                        <span className="text-xs font-medium text-zinc-800 capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">{listing.description}</p>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Internal Admin Notes</p>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add notes for this listing..." rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2" />
                  <button onClick={handleSaveNote} disabled={noteSaving}
                    className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {noteSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    {noteSaving ? 'Saving…' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Documents ── */}
            {tab === 'documents' && (
              <div className="px-4 sm:px-6 py-5 space-y-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Submitted Documents</p>
                {listing.documents.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 border border-dashed border-red-200 rounded-xl bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">No documents submitted</p>
                      <p className="text-xs text-red-400 mt-0.5">Land title or ownership proof is required for sale listings.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listing.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 border border-zinc-100 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-800 truncate">{doc.name}</p>
                          <p className={`text-xs font-semibold mt-0.5 ${doc.status === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {doc.status === 'verified' ? 'Verified' : 'Awaiting Review'}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button className="p-2 text-zinc-400 hover:text-zinc-700 border border-zinc-100 rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-2 text-zinc-400 hover:text-zinc-700 border border-zinc-100 rounded-lg transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {listing.fraudSignals?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3 mt-2">Fraud Signal Details</p>
                    <div className="space-y-2">
                      {listing.fraudSignals.map(sig => {
                        const f = FRAUD_LABELS[sig];
                        return f ? (
                          <div key={sig} className={`p-3 rounded-lg border ${f.color}`}>
                            <p className="text-xs font-bold">{f.label}</p>
                            <p className="text-xs mt-0.5 opacity-80">{f.desc}</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Submitter ── */}
            {tab === 'submitter' && (
              <div className="px-4 sm:px-6 py-5 space-y-5">
                <div className="flex items-center gap-4 p-4 border border-zinc-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{listing.submittedBy.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900">{listing.submittedBy.name}</p>
                      {listing.submittedBy.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-zinc-400 capitalize">
                      {listing.submittedBy.role}{listing.submittedBy.agencyName ? ` · ${listing.submittedBy.agencyName}` : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { icon: Mail,  value: listing.submittedBy.email },
                    { icon: Phone, value: listing.submittedBy.phone },
                  ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                      <p className="text-sm text-zinc-800">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Since',    value: listing.submittedBy.joined },
                    { label: 'Listings', value: listing.submittedBy.totalListings },
                    { label: 'Reports',  value: listing.submittedBy.reports },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-zinc-100 rounded-lg px-3 py-3 text-center">
                      <p className={`text-sm font-bold ${label === 'Reports' && value > 0 ? 'text-red-600' : 'text-zinc-900'}`}>{value}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {listing.submittedBy.reports > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-700">{listing.submittedBy.reports} report(s) against this user</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message Submitter</p>
                  <textarea placeholder="Send a message about this listing..." rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2" />
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                    <Send className="w-3 h-3" /> Send Message
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          {isPending && (
            <div className="px-4 sm:px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <button onClick={() => setActionModal('reject')} disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Reject</span>
                </button>
                <button onClick={() => setActionModal('changes')} disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Request Changes</span>
                </button>
                <button onClick={handleApprove} disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50">
                  {actionLoading === 'approve'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Mobile card ───────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick }) {
  const st = STATUS[listing.status] || STATUS.pending;
  return (
    <div onClick={onClick} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
      <div className="relative h-36">
        {listing.photos[0]
          ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-zinc-300" /></div>
        }
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${st.cls}`}>{st.label}</span>
        </div>
        {listing.fraudSignals?.length > 0 && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />{listing.fraudSignals.length}
            </span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-sm font-semibold text-zinc-900 leading-tight mb-1">{listing.title}</p>
        <p className="text-xs text-zinc-400 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{listing.location.city}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-800">
            {listing.price.toLocaleString()} <span className="text-xs font-normal text-zinc-400">XAF{listing.transaction === 'rent' ? '/mo' : ''}</span>
          </p>
          <p className="text-xs text-zinc-400">{listing.submittedBy.name}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop table row ─────────────────────────────────────────────────────────
function ListingRow({ listing, onClick }) {
  const st = STATUS[listing.status] || STATUS.pending;
  return (
    <tr onClick={onClick} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
            {listing.photos[0]
              ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
              : <ImageIcon className="w-4 h-4 text-zinc-300 m-auto mt-3" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate max-w-48">{listing.title}</p>
            <p className="text-xs text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location.city}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-zinc-800">{listing.price.toLocaleString()} XAF</p>
        <p className="text-xs text-zinc-400 capitalize">{listing.transaction}</p>
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{listing.submittedBy.name}</td>
      <td className="px-4 py-3.5">
        {listing.fraudSignals?.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <AlertTriangle className="w-3 h-3" />{listing.fraudSignals.length}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-400">
        {new Date(listing.submittedAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ListingsApproval() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch]       = useState('');
  const [listings, setListings]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings({ search: debouncedSearch, status: activeTab });
      setListings(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (listing) => {
    await approveListing(listing.id);
    setListings(prev => prev.map(l => l.id === listing.id
      ? { ...l, status: 'approved', approvedAt: new Date().toISOString() } : l));
    setSelected(null);
  };

  const handleReject = async (listing, reason) => {
    await rejectListing(listing.id, reason);
    setListings(prev => prev.map(l => l.id === listing.id
      ? { ...l, status: 'rejected', rejectionReason: reason } : l));
    setSelected(null);
  };

  const handleRequestChanges = async (listing, message) => {
    await requestChanges(listing.id, message);
    setSelected(null);
  };

  // Derive counts from currently loaded data
  const counts = TABS.reduce((acc, t) => ({
    ...acc,
    [t]: t === 'All' ? listings.length : listings.filter(l => l.status === t.toLowerCase()).length,
  }), {});

  const selectedListing = selected ? listings.find(l => l.id === selected.id) : null;

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {selectedListing && (
          <ListingDetail
            listing={selectedListing}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={handleRequestChanges}
          />
        )}

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Listings</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review and manage all property listings.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {counts['Pending'] > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">
                {counts['Pending']} pending
              </span>
            )}
            {counts['Flagged'] > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-full">
                {counts['Flagged']} flagged
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings, locations..."
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === t ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}>
              {t}
              {counts[t] > 0 && (
                <span className={`ml-1 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading listings…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button onClick={load} className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && !error && (
          <div className="sm:hidden grid grid-cols-1 gap-3">
            {listings.length === 0
              ? <div className="py-16 text-center"><Building2 className="w-8 h-8 text-zinc-200 mx-auto mb-2" /><p className="text-sm text-zinc-300">No listings found</p></div>
              : listings.map(l => <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />)
            }
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && (
          <div className="hidden sm:block bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Property', 'Price', 'Submitted By', 'Flags', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => <ListingRow key={l.id} listing={l} onClick={() => setSelected(l)} />)}
                </tbody>
              </table>
              {listings.length === 0 && (
                <div className="py-16 text-center">
                  <Building2 className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-sm text-zinc-300">No listings found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminNav>
  );
}