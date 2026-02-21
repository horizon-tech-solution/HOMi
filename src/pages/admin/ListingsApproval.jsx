import { useState } from 'react';
import {
  Search, Filter, MapPin, Bed, Bath, Maximize, Clock,
  CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  X, ZoomIn, Download, User, Phone, Mail, Building2, FileText,
  ImageIcon, Flag, MessageSquare, ExternalLink, Info, Eye,
  MoreHorizontal, Trash2, RotateCcw, Send
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

/* ─── Mock Data ─────────────────────────────────────────────── */
const MOCK = [
  {
    id: 1,
    status: 'pending',
    title: 'Modern 3BR Apartment in Bonanjo',
    description: 'Spacious and newly renovated apartment on the 4th floor of a secure residence. The apartment features large windows with city views, a modern kitchen, parquet floors throughout. Access to communal generator, secured parking, and 24/7 security. Available from March 1st.',
    type: 'apartment',
    transaction: 'rent',
    price: 75000,
    location: { address: 'Rue Joffre, Bonanjo, Douala', city: 'Douala', region: 'Littoral', coordinates: '4.0481° N, 9.6958° E' },
    specs: { bedrooms: 3, bathrooms: 2, area: 120, floor: 4, totalFloors: 6, yearBuilt: 2019, furnished: 'semi-furnished', parking: true, generator: true },
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    documents: [
      { name: 'Land Title Certificate', type: 'pdf', status: 'submitted', url: '#' },
      { name: 'Property Ownership Proof', type: 'pdf', status: 'submitted', url: '#' },
    ],
    submittedBy: {
      id: 'u_001', name: 'Kofi Asante', email: 'kofi.asante@gmail.com',
      phone: '+237 677 123 456', role: 'user',
      joined: 'Jan 2025', totalListings: 2, reports: 0, verified: true,
      avatar: null,
    },
    submittedAt: '2024-12-18T10:30:00',
    fraudSignals: [],
    adminNotes: '',
    requestedChanges: '',
  },
  {
    id: 2,
    status: 'pending',
    title: 'Commercial Office Space — Akwa',
    description: 'Prime commercial space on ground floor of a modern building in the heart of Akwa business district. Open-plan layout ideal for offices, agencies, or retail. Includes 2 toilet facilities, small server room, and reception area. 24/7 access with key card system.',
    type: 'commercial',
    transaction: 'rent',
    price: 200000,
    location: { address: 'Avenue de Gaulle, Akwa, Douala', city: 'Douala', region: 'Littoral', coordinates: '4.0500° N, 9.7000° E' },
    specs: { bedrooms: null, bathrooms: 2, area: 200, floor: 0, totalFloors: 8, yearBuilt: 2015, furnished: 'unfurnished', parking: true, generator: true },
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    ],
    documents: [
      { name: 'Commercial Lease Agreement Template', type: 'pdf', status: 'submitted', url: '#' },
    ],
    submittedBy: {
      id: 'a_003', name: 'Jean-Paul Mbarga', email: 'jp.mbarga@camereal.cm',
      phone: '+237 655 234 567', role: 'agent', agencyName: 'CameReal Group',
      joined: 'Oct 2023', totalListings: 24, reports: 0, verified: true,
      avatar: null,
    },
    submittedAt: '2024-12-18T08:00:00',
    fraudSignals: ['low_photo_count'],
    adminNotes: 'Agent is verified and trusted. Only 3 photos submitted, minimum is 4.',
    requestedChanges: '',
  },
  {
    id: 3,
    status: 'flagged',
    title: 'Duplex in Omnisports — Suspicious Listing',
    description: 'Beautiful duplex with modern finishes. 4 bedrooms, 3 bathrooms, large living room, modern kitchen. Located in a quiet area of Omnisports near major schools and supermarkets.',
    type: 'duplex',
    transaction: 'sale',
    price: 10000000,
    location: { address: 'Omnisports Quartier, Yaoundé', city: 'Yaoundé', region: 'Centre', coordinates: '3.8480° N, 11.5021° E' },
    specs: { bedrooms: 4, bathrooms: 3, area: 220, floor: null, totalFloors: 2, yearBuilt: 2021, furnished: 'furnished', parking: true, generator: false },
    photos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    ],
    documents: [],
    submittedBy: {
      id: 'u_fraud', name: 'Marcus Njoume', email: 'marcus.nj@yahoo.com',
      phone: '+237 699 000 001', role: 'user',
      joined: 'Nov 2024', totalListings: 5, reports: 3, verified: false,
      avatar: null,
    },
    submittedAt: '2024-12-17T16:00:00',
    fraudSignals: ['price_anomaly', 'duplicate_listing', 'stolen_photos_likely', 'new_account_high_volume'],
    adminNotes: 'Price is 80% below market rate for this area and type. Reverse image search shows photos from Cameroon24.com listing #4421. User account is 6 weeks old with 5 listings.',
    requestedChanges: '',
  },
  {
    id: 4,
    status: 'approved',
    title: 'Luxury Villa with Pool — Bastos',
    description: 'Exceptional property in the prestigious Bastos district. 5 bedroom villa with 4 bathrooms, private pool, manicured gardens, staff quarters, and triple garage. 24/7 security, backup generator, borehole water.',
    type: 'villa',
    transaction: 'sale',
    price: 250000000,
    location: { address: 'Rue Bastos, Bastos, Yaoundé', city: 'Yaoundé', region: 'Centre', coordinates: '3.8700° N, 11.5200° E' },
    specs: { bedrooms: 5, bathrooms: 4, area: 350, floor: null, totalFloors: 2, yearBuilt: 2018, furnished: 'fully-furnished', parking: true, generator: true },
    photos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    documents: [
      { name: 'Titre Foncier #TF-2021-4892', type: 'pdf', status: 'verified', url: '#' },
      { name: 'Certificat de Conformité', type: 'pdf', status: 'verified', url: '#' },
      { name: 'Mainlevée Hypothèque', type: 'pdf', status: 'verified', url: '#' },
    ],
    submittedBy: {
      id: 'a_004', name: 'Nadia Essam', email: 'n.essam@realty.cm',
      phone: '+237 699 345 678', role: 'agent', agencyName: 'Essam Realty',
      joined: 'Dec 2023', totalListings: 17, reports: 0, verified: true,
      avatar: null,
    },
    submittedAt: '2024-12-15T09:00:00',
    approvedAt: '2024-12-15T14:30:00',
    fraudSignals: [],
    adminNotes: '',
    requestedChanges: '',
  },
];

const FRAUD_LABELS = {
  price_anomaly: { label: 'Price anomaly', desc: 'Price is significantly below market rate for this area & type.', color: 'text-red-600 bg-red-50 border-red-200' },
  duplicate_listing: { label: 'Possible duplicate', desc: 'Similar listing found in our database.', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  stolen_photos_likely: { label: 'Stolen photos suspected', desc: 'Reverse image search suggests photos may be from another source.', color: 'text-red-600 bg-red-50 border-red-200' },
  new_account_high_volume: { label: 'New account — high volume', desc: 'Account < 60 days old with multiple listings.', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low_photo_count: { label: 'Low photo count', desc: 'Below the 4-photo minimum required by platform rules.', color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

/* ─── Status Configs ──────────────────────────────────────── */
const STATUS = {
  pending:  { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected',       cls: 'bg-red-50 text-red-600 border-red-200' },
  flagged:  { label: 'Flagged',        cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

/* ─── Photo Viewer ────────────────────────────────────────── */
function PhotoViewer({ photos, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-16 min-h-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="absolute left-4 p-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <img src={photos[idx]} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
        <button
          onClick={() => setIdx(i => Math.min(photos.length - 1, i + 1))}
          disabled={idx === photos.length - 1}
          className="absolute right-4 p-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="flex gap-2 justify-center px-6 py-4 flex-shrink-0 overflow-x-auto" onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-14 h-10 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${i === idx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}>
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Reject / Request Changes Modal ────────────────────────── */
function ActionModal({ type, onConfirm, onClose }) {
  const [text, setText] = useState('');
  const isReject = type === 'reject';

  const presets = isReject
    ? [
        'Photos do not meet quality requirements (minimum 4 clear, well-lit photos).',
        'Property description is incomplete or misleading.',
        'Price appears incorrect — please verify and resubmit.',
        'Required documents not provided (land title or ownership proof).',
        'Duplicate listing already exists on the platform.',
        'Suspected fraudulent listing — account under review.',
      ]
    : [
        'Please add at least 4 photos of the interior.',
        'Please provide the land title or ownership certificate.',
        'Please correct the property address — it does not match the description.',
        'Please clarify the furnished/unfurnished status.',
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden border border-zinc-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">
            {isReject ? 'Reject Listing' : 'Request Changes'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-xs text-zinc-400 mb-3">
            {isReject ? 'Select or write a reason. The user will be notified by email.' : 'The listing will stay pending until the user resubmits.'}
          </p>
          <div className="space-y-1.5 mb-4">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${text === p ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50 border border-zinc-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Or write a custom message..."
            rows={3}
            className="w-full text-sm text-zinc-800 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
          />
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-zinc-100">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onConfirm(text)}
            disabled={!text.trim()}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 ${
              isReject ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
          >
            {isReject ? 'Reject Listing' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Listing Detail Panel ────────────────────────────────── */
function ListingDetail({ listing, onClose, onApprove, onReject, onRequestChanges }) {
  const [photoViewer, setPhotoViewer] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'reject' | 'changes'
  const [note, setNote] = useState(listing.adminNotes);
  const [tab, setTab] = useState('overview'); // overview | documents | submitter

  const TABS = ['overview', 'documents', 'submitter'];
  const st = STATUS[listing.status] || STATUS.pending;
  const isPending = listing.status === 'pending' || listing.status === 'flagged';

  return (
    <>
      {photoViewer !== null && (
        <PhotoViewer photos={listing.photos} initialIndex={photoViewer} onClose={() => setPhotoViewer(null)} />
      )}
      {actionModal && (
        <ActionModal
          type={actionModal}
          onClose={() => setActionModal(null)}
          onConfirm={text => {
            if (actionModal === 'reject') onReject(listing, text);
            else onRequestChanges(listing, text);
            setActionModal(null);
          }}
        />
      )}

      <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
        <div
          className="w-full max-w-3xl bg-white h-full flex flex-col overflow-hidden border-l border-zinc-200 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>
                  {st.label}
                </span>
                <span className="text-xs text-zinc-400">#{listing.id}</span>
              </div>
              <h2 className="text-base font-bold text-zinc-900 leading-tight">{listing.title}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {listing.location.address}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fraud Signals */}
          {listing.fraudSignals.length > 0 && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700">Fraud Signals Detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {listing.fraudSignals.map(sig => {
                  const f = FRAUD_LABELS[sig];
                  return f ? (
                    <span key={sig} title={f.desc} className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-help ${f.color}`}>
                      {f.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
            {TABS.map(t => (
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

                {/* Photos */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    Photos ({listing.photos.length})
                  </p>
                  {listing.photos.length === 0 ? (
                    <div className="h-24 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center">
                      <p className="text-xs text-zinc-300">No photos submitted</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {listing.photos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoViewer(i)}
                          className="relative aspect-square rounded-lg overflow-hidden group bg-zinc-100"
                        >
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

                {/* Price & Transaction */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Pricing</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-zinc-100 rounded-lg px-4 py-3">
                      <p className="text-xs text-zinc-400 mb-1">Listed Price</p>
                      <p className="text-sm font-bold text-zinc-900">{listing.price.toLocaleString()} XAF</p>
                      {listing.transaction === 'rent' && <p className="text-xs text-zinc-400">per month</p>}
                    </div>
                    <div className="border border-zinc-100 rounded-lg px-4 py-3">
                      <p className="text-xs text-zinc-400 mb-1">Type</p>
                      <p className="text-sm font-semibold text-zinc-800 capitalize">{listing.transaction}</p>
                    </div>
                    <div className="border border-zinc-100 rounded-lg px-4 py-3">
                      <p className="text-xs text-zinc-400 mb-1">Category</p>
                      <p className="text-sm font-semibold text-zinc-800 capitalize">{listing.type}</p>
                    </div>
                  </div>
                </div>

                {/* Property Specs */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Property Details</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {[
                      { label: 'Area', value: `${listing.specs.area} m²` },
                      { label: 'Bedrooms', value: listing.specs.bedrooms ?? '—' },
                      { label: 'Bathrooms', value: listing.specs.bathrooms ?? '—' },
                      { label: 'Floor', value: listing.specs.floor !== null ? `${listing.specs.floor} / ${listing.specs.totalFloors}` : '—' },
                      { label: 'Year Built', value: listing.specs.yearBuilt ?? '—' },
                      { label: 'Furnished', value: listing.specs.furnished ?? '—' },
                      { label: 'Parking', value: listing.specs.parking ? 'Yes' : 'No' },
                      { label: 'Generator', value: listing.specs.generator ? 'Yes' : 'No' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                        <span className="text-xs text-zinc-400">{label}</span>
                        <span className="text-xs font-medium text-zinc-800 capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Location</p>
                  <div className="border border-zinc-100 rounded-lg p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-zinc-800">{listing.location.address}</p>
                    <p className="text-xs text-zinc-400">{listing.location.city}, {listing.location.region}</p>
                    <p className="text-xs text-zinc-300 font-mono">{listing.location.coordinates}</p>
                    <button className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mt-2 transition-colors">
                      <ExternalLink className="w-3 h-3" /> View on Google Maps
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Description</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">{listing.description}</p>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Internal Admin Notes</p>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add notes for this listing (only visible to admins)..."
                    rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                  />
                </div>
              </div>
            )}

            {tab === 'documents' && (
              <div className="px-6 py-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Submitted Documents</p>
                  <p className="text-xs text-zinc-300 mb-4">Verify that all documents are authentic and match the listing details.</p>

                  {listing.documents.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 border border-dashed border-red-200 rounded-xl bg-red-50">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">No documents submitted</p>
                        <p className="text-xs text-red-400 mt-0.5">For sale listings, a land title or ownership proof is required.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listing.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-zinc-400 uppercase">{doc.type}</span>
                              <span className={`text-xs font-semibold ${doc.status === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                · {doc.status === 'verified' ? 'Verified' : 'Awaiting Review'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button className="px-3 py-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <button className="px-3 py-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-1">
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Checklist */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Required Document Checklist</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Titre Foncier (Land Title)', required: listing.transaction === 'sale', present: listing.documents.some(d => d.name.toLowerCase().includes('land') || d.name.toLowerCase().includes('titre')) },
                      { name: 'Proof of Ownership', required: true, present: listing.documents.some(d => d.name.toLowerCase().includes('ownership') || d.name.toLowerCase().includes('proof')) },
                      { name: 'Certificat de Conformité', required: listing.type === 'apartment' || listing.type === 'villa', present: listing.documents.some(d => d.name.toLowerCase().includes('conformit')) },
                    ].map(({ name, required, present }) => (
                      <div key={name} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${!required ? 'opacity-40' : ''}`}>
                        {present
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          : required
                            ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-zinc-200 flex-shrink-0" />
                        }
                        <span className={`text-sm ${present ? 'text-zinc-700' : required ? 'text-red-600' : 'text-zinc-300'}`}>{name}</span>
                        {!required && <span className="text-xs text-zinc-300 ml-auto">optional</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fraud Signal Details */}
                {listing.fraudSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Fraud Signal Details</p>
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

            {tab === 'submitter' && (
              <div className="px-6 py-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4 p-4 border border-zinc-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{listing.submittedBy.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900">{listing.submittedBy.name}</p>
                      {listing.submittedBy.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 capitalize">{listing.submittedBy.role}{listing.submittedBy.agencyName ? ` · ${listing.submittedBy.agencyName}` : ''}</p>
                  </div>
                  <button className="text-xs font-semibold text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View Profile
                  </button>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Contact Information</p>
                  <div className="space-y-2.5">
                    {[
                      { icon: Mail, label: 'Email', value: listing.submittedBy.email },
                      { icon: Phone, label: 'Phone', value: listing.submittedBy.phone },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-400">{label}</p>
                          <p className="text-sm text-zinc-800">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Account Activity</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Member since', value: listing.submittedBy.joined },
                      { label: 'Total listings', value: listing.submittedBy.totalListings },
                      { label: 'Reports filed', value: listing.submittedBy.reports },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-zinc-100 rounded-lg px-3 py-3 text-center">
                        <p className="text-sm font-bold text-zinc-900">{value}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {listing.submittedBy.reports > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">{listing.submittedBy.reports} report(s) against this user</p>
                      <button className="text-xs text-red-500 hover:text-red-700 mt-0.5 flex items-center gap-1 transition-colors">
                        View reports <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Submission Timeline */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Submission Timeline</p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                        <div className="w-px flex-1 bg-zinc-100 my-1" />
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-semibold text-zinc-800">Listing submitted</p>
                        <p className="text-xs text-zinc-400">{new Date(listing.submittedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {listing.approvedAt && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">Listing approved</p>
                          <p className="text-xs text-zinc-400">{new Date(listing.approvedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {(listing.status === 'pending' || listing.status === 'flagged') && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-700">Awaiting review</p>
                          <p className="text-xs text-zinc-400">In queue</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Submitter */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Message Submitter</p>
                  <textarea
                    placeholder="Send a message to the submitter about this listing..."
                    rows={3}
                    className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300 mb-2"
                  />
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                    <Send className="w-3 h-3" /> Send Message
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {isPending && (
            <div className="px-6 py-4 border-t border-zinc-100 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setActionModal('reject')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => setActionModal('changes')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Request Changes
                </button>
                <button
                  onClick={() => onApprove(listing)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Listing Row (table) ─────────────────────────────────── */
function ListingRow({ listing, onClick }) {
  const st = STATUS[listing.status] || STATUS.pending;
  return (
    <tr onClick={onClick} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
            {listing.photos[0]
              ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
              : <ImageIcon className="w-4 h-4 text-zinc-300 m-auto" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate max-w-48">{listing.title}</p>
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{listing.location.city}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-zinc-800">{listing.price.toLocaleString()} XAF</p>
        <p className="text-xs text-zinc-400 capitalize">{listing.transaction}</p>
      </td>
      <td className="px-4 py-3.5 text-xs text-zinc-500">{listing.submittedBy.name}</td>
      <td className="px-4 py-3.5">
        {listing.fraudSignals.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <AlertTriangle className="w-3 h-3" /> {listing.fraudSignals.length}
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

/* ─── Main Page ───────────────────────────────────────────── */
const TABS = ['All', 'Pending', 'Flagged', 'Approved', 'Rejected'];

export default function ListingsApproval() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState(MOCK);
  const [selected, setSelected] = useState(null);

  const handleApprove = (listing) => {
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'approved', approvedAt: new Date().toISOString() } : l));
    setSelected(null);
  };
  const handleReject = (listing, reason) => {
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'rejected', rejectionReason: reason } : l));
    setSelected(null);
  };

  const counts = TABS.reduce((acc, t) => ({
    ...acc,
    [t]: t === 'All' ? listings.length : listings.filter(l => l.status === t.toLowerCase()).length
  }), {});

  const filtered = listings.filter(l => {
    const tabMatch = activeTab === 'All' || l.status === activeTab.toLowerCase();
    const q = search.toLowerCase();
    const searchMatch = !q || l.title.toLowerCase().includes(q) || l.location.city.toLowerCase().includes(q) || l.submittedBy.name.toLowerCase().includes(q);
    return tabMatch && searchMatch;
  });

  return (
    <AdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {selected && (
          <ListingDetail
            listing={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={(l, msg) => { console.log('request changes', msg); setSelected(null); }}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Listings</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Review and manage all property listings on the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            {counts['Pending'] > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                {counts['Pending']} pending
              </span>
            )}
            {counts['Flagged'] > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                {counts['Flagged']} flagged
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search listings, users, locations..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
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
              {counts[t] > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === t ? 'text-white/60' : 'text-zinc-300'}`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Property', 'Price', 'Submitted By', 'Flags', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <ListingRow key={l.id} listing={l} onClick={() => setSelected(l)} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Building2 className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-300">No listings found</p>
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
}