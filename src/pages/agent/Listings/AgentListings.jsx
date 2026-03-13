// src/pages/agent/listings/AgentListings.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import { fetchMyListings, deleteListing } from '../../../api/agents/myListing';
import {
  Building2, Eye, Heart, MessageSquare, Search, Plus,
  MoreVertical, Edit, Trash2, TrendingUp, MapPin, Calendar,
  Grid3x3, List, X, ChevronDown, Loader2, AlertCircle,
  RefreshCw, Home, Warehouse, Store, TreePine,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS = {
  approved: { label: 'Active',   cls: 'bg-green-100 text-green-700' },
  pending:  { label: 'Pending',  cls: 'bg-yellow-100 text-yellow-700' },
  sold:     { label: 'Sold',     cls: 'bg-blue-100 text-blue-700' },
  rented:   { label: 'Rented',   cls: 'bg-purple-100 text-purple-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

const PROP_ICONS = { apartment: Home, house: Home, villa: Home, studio: Home, warehouse: Warehouse, commercial: Store, land: TreePine };

const fmtPrice = (l) => {
  if (!l.price) return '—';
  return `${Number(l.price).toLocaleString('fr-CM')} FCFA${l.transaction_type === 'rent' ? '/mois' : ''}`;
};

const fmtLoc = (l) => [l.neighborhood, l.city].filter(Boolean).join(', ') || l.address || '—';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtSpecs = (l) =>
  [l.bedrooms != null && `${l.bedrooms} ch.`, l.bathrooms != null && `${l.bathrooms} sdb.`, l.area != null && `${l.area} m²`]
    .filter(Boolean).join('  ·  ') || '—';

// ─── Actions Menu ─────────────────────────────────────────────────────────────

const ActionsMenu = ({ listing, onDelete, navigate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow hover:bg-white transition">
        <MoreVertical className="w-4 h-4 text-gray-700" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 text-sm">
            <button onClick={() => { setOpen(false); navigate(`/agent/edit-listing/${listing.id}`); }}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-2.5 text-gray-700">
              <Edit className="w-4 h-4 text-amber-600" /> Edit Listing
            </button>
            <button onClick={() => { setOpen(false); navigate(`/agent/listings/${listing.id}/analytics`); }}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-2.5 text-gray-700">
              <TrendingUp className="w-4 h-4 text-amber-600" /> Analytics
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={() => { setOpen(false); onDelete(listing.id); }}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2.5 text-red-600">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Grid Card ────────────────────────────────────────────────────────────────

const GridCard = ({ listing, onDelete, navigate }) => {
  const status = STATUS[listing.status] ?? { label: listing.status, cls: 'bg-gray-100 text-gray-700' };
  const Icon = PROP_ICONS[listing.property_type] ?? Home;
  return (
    <div onClick={() => navigate(`/agent/edit-listing/${listing.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
      <div className="relative h-48 bg-gray-100">
        {listing.cover_photo
          ? <img src={listing.cover_photo} alt={listing.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Icon className="w-12 h-12 text-gray-200" /></div>}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${status.cls}`}>{status.label}</span>
        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
          <ActionsMenu listing={listing} onDelete={onDelete} navigate={navigate} />
        </div>
        <div className="absolute bottom-3 right-3 bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-lg">
          {listing.transaction_type === 'rent' ? 'Location' : 'Vente'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors mb-1">{listing.title}</h3>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{fmtLoc(listing)}</p>
        <p className="text-lg font-bold text-amber-600 mb-1">{fmtPrice(listing)}</p>
        <p className="text-xs text-gray-400 mb-4">{fmtSpecs(listing)}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.views_count ?? 0}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{listing.leads_count ?? 0}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{listing.favorites_count ?? 0}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(listing.submitted_at)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── List Row ─────────────────────────────────────────────────────────────────

const ListRow = ({ listing, onDelete, navigate }) => {
  const status = STATUS[listing.status] ?? { label: listing.status, cls: 'bg-gray-100 text-gray-700' };
  const Icon = PROP_ICONS[listing.property_type] ?? Home;
  return (
    <div onClick={() => navigate(`/agent/edit-listing/${listing.id}`)}
      className="flex gap-4 p-5 hover:bg-amber-50/40 transition-colors cursor-pointer">
      <div className="w-28 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {listing.cover_photo
          ? <img src={listing.cover_photo} alt={listing.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Icon className="w-8 h-8 text-gray-200" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate hover:text-amber-600 transition-colors">{listing.title}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{fmtLoc(listing)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.cls}`}>{status.label}</span>
            <ActionsMenu listing={listing} onDelete={onDelete} navigate={navigate} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <span className="text-base font-bold text-amber-600">{fmtPrice(listing)}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{listing.transaction_type === 'rent' ? 'Location' : 'Vente'}</span>
          <span className="text-xs text-gray-400">{fmtSpecs(listing)}</span>
        </div>
        <div className="flex items-center gap-5 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.views_count ?? 0}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{listing.leads_count ?? 0} leads</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{listing.favorites_count ?? 0}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(listing.submitted_at)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

const DeleteModal = ({ listing, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Listing?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        "<span className="font-medium text-gray-700">{listing?.title}</span>" will be permanently removed.
        Only pending or rejected listings can be deleted.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const AgentListings = () => {
  const navigate = useNavigate();
  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [viewMode, setViewMode]         = useState('grid');
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const loadListings = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await fetchMyListings();
      setListings(Array.isArray(data) ? data : data.listings ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteListing(deleteTarget.id);
      setListings(prev => prev.filter(l => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = listings.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchSearch = l.title?.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q);
    const dbStatus = filterStatus === 'active' ? 'approved' : filterStatus;
    const matchStatus = filterStatus === 'all' || l.status === dbStatus;
    const matchType   = filterType === 'all' || l.transaction_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total:    listings.length,
    active:   listings.filter(l => l.status === 'approved').length,
    pending:  listings.filter(l => l.status === 'pending').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {loading ? 'Loading…' : `${filtered.length} of ${listings.length} properties`}
            </p>
          </div>
          <button onClick={() => navigate('/agent/listings/add')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm self-start">
            <Plus className="w-5 h-5" /> Add Property
          </button>
        </div>

        {/* Stats strip */}
        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', val: stats.total, color: 'text-gray-900' },
              { label: 'Active', val: stats.active, color: 'text-green-600' },
              { label: 'Pending', val: stats.pending, color: 'text-yellow-600' },
              { label: 'Rejected', val: stats.rejected, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search by title, city or address…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {[
              { val: filterStatus, set: setFilterStatus, opts: [
                  { v: 'all', l: 'All Status' }, { v: 'active', l: 'Active' },
                  { v: 'pending', l: 'Pending' }, { v: 'sold', l: 'Sold' },
                  { v: 'rented', l: 'Rented' }, { v: 'rejected', l: 'Rejected' },
              ]},
              { val: filterType, set: setFilterType, opts: [
                  { v: 'all', l: 'All Types' }, { v: 'sale', l: 'For Sale' }, { v: 'rent', l: 'For Rent' },
              ]},
            ].map((s, i) => (
              <div key={i} className="relative">
                <select value={s.val} onChange={e => s.set(e.target.value)}
                  className="appearance-none pl-3 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer">
                  {s.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            ))}

            <div className="flex border border-gray-200 rounded-lg p-1 gap-1">
              {[{ m: 'grid', Icon: Grid3x3 }, { m: 'list', Icon: List }].map(({ m, Icon }) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`p-2 rounded-md transition ${viewMode === m ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <button onClick={loadListings} disabled={loading} title="Refresh"
              className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Loading listings…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 text-sm">{error}</p>
              <button onClick={loadListings} className="text-xs text-red-600 underline mt-1">Try again</button>
            </div>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Add your first property to get started.</p>
            <button onClick={() => navigate('/agent/listings/add')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 transition">
              <Plus className="w-5 h-5" /> Add Property
            </button>
          </div>
        )}

        {!loading && !error && listings.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">No matches</h3>
            <p className="text-gray-400 text-sm mb-4">Try different search terms or filters.</p>
            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterType('all'); }}
              className="text-amber-600 text-sm font-medium hover:underline">Clear filters</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(l => (
              <GridCard key={l.id} listing={l}
                onDelete={id => setDeleteTarget(listings.find(x => x.id === id))}
                navigate={navigate} />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !error && filtered.length > 0 && viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {filtered.map(l => (
              <ListRow key={l.id} listing={l}
                onDelete={id => setDeleteTarget(listings.find(x => x.id === id))}
                navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal listing={deleteTarget} onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </div>
  );
};

export default AgentListings;