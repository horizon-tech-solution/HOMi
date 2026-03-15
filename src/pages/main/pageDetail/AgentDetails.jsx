// src/pages/public/pageDetail/AgentDetails.jsx
import { X, Star, MapPin, Phone, Mail, Briefcase, Award, Globe, Clock, Loader2, Flag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAgent } from '../../../api/public/agent';
import SendMessageModal from '../../../components/SendMessageModal';
import ReportModal      from '../../../components/ReportModal';
import ReviewModal      from '../../../components/ReviewModal';
import { useUserAuth  } from '../../../context/UserAuthContext';
import { useAgentAuth } from '../../../context/AgentAuthContext';
import { get } from '../../../api/users/base';

const AgentDetail = ({ agentId, isOpen, onClose }) => {
  const [agent,      setAgent]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('sale');
  const [msgOpen,    setMsgOpen]    = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviews,    setReviews]    = useState([]);
  const [msgListing, setMsgListing] = useState(null);

  const navigate        = useNavigate();
  const { user  }       = useUserAuth();
  const { agent: myAgent } = useAgentAuth();
  const activeUser      = user || myAgent;

  useEffect(() => {
    if (!isOpen || !agentId) return;
    setLoading(true);
    setError(null);
    fetchAgent(agentId)
      .then(data => {
        setAgent(data);
        const firstListing = (data.listings || []).find(l => l.status === 'approved') || data.listings?.[0] || null;
        setMsgListing(firstListing);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    // Fetch reviews separately
    get(`/public/agents/${agentId}/reviews`)
      .then(r => setReviews(r.data || []))
      .catch(() => {});
  }, [isOpen, agentId]);

  useEffect(() => {
    if (isOpen) {
      window.history.replaceState(null, '', `/agent/${agentId}`);
      document.body.style.overflow = 'hidden';
    } else {
      window.history.replaceState(null, '', '/find-agent');
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, agentId]);

  if (!isOpen) return null;

  const initials = agent?.name
    ? agent.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const saleListing  = (agent?.listings || []).filter(l => l.transaction_type === 'sale');
  const rentListings = (agent?.listings || []).filter(l => l.transaction_type === 'rent');
  const tabListings  = activeTab === 'sale' ? saleListing : rentListings;

  const formatPrice = (p) => Number(p).toLocaleString('fr-CM') + ' XAF';

  const meta           = agent?.profile_meta
    ? (typeof agent.profile_meta === 'string' ? JSON.parse(agent.profile_meta) : agent.profile_meta)
    : {};
  const languages      = meta.languages      || [];
  const specialization = meta.specialization || [];
  const social         = { website: meta.website, facebook: meta.facebook, linkedin: meta.linkedin, instagram: meta.instagram };
  const workingHours   = meta.workingHours   || {};
  const waNumber       = meta.whatsapp || agent?.phone || null;

  const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const handleMessageSent = (inquiryId) => {
    setMsgOpen(false);
    onClose();
    const dest = activeUser?.role === 'agent'
      ? `/agent/leads?conversation=${inquiryId}`
      : `/user/messages?thread=${inquiryId}`;
    setTimeout(() => navigate(dest), 350);
  };

  const handleMsgAboutListing = (listing) => {
    setMsgListing(listing);
    setMsgOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after submission
    get(`/public/agents/${agentId}/reviews`)
      .then(r => setReviews(r.data || []))
      .catch(() => {});
  };

  // Don't show report/review if viewing own profile
  const isOwnProfile = activeUser && String(activeUser.id) === String(agentId);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 overflow-y-auto bg-white">

        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {agent?.avatar_url
                ? <img src={agent.avatar_url} alt={agent.name} className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">{initials}</span>
                  </div>
              }
              <div>
                <h3 className="font-semibold text-gray-900">{agent?.name || '…'}</h3>
                <p className="text-xs text-gray-500">{agent?.agency_name || 'Real Estate Agent'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Report button — only for logged-in non-owner */}
              {activeUser && !isOwnProfile && agent && (
                <button onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}
        {error && (
          <div className="max-w-xl mx-auto py-20 text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && agent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24 lg:pb-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

              {/* Main */}
              <div className="flex-1 space-y-10 min-w-0">

                {/* Hero */}
                <div className="flex flex-col sm:flex-row gap-6">
                  {agent.avatar_url
                    ? <img src={agent.avatar_url} alt={agent.name}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-md flex-shrink-0" />
                    : <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-4xl font-extrabold text-amber-700">{initials}</span>
                      </div>
                  }

                  <div className="flex-1 min-w-0">
                    {agent.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Verified Professional
                      </span>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{agent.name}</h1>
                    {agent.agency_name && <p className="text-lg text-gray-600 mb-1">{agent.agency_name}</p>}
                    {agent.city && (
                      <p className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                        <MapPin className="w-4 h-4 text-amber-500" />{agent.city}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {specialization.map(s => (
                        <span key={s} className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-100">{s}</span>
                      ))}
                      {languages.map(l => (
                        <span key={l} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{l}</span>
                      ))}
                    </div>
                    {/* Rating display */}
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => {
                            const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                            return (
                              <Star key={i} className={`w-4 h-4 ${i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                            );
                          })}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Listings', value: agent.listings_count || agent.listings?.length || 0 },
                    { label: 'Reviews',          value: reviews.length },
                    { label: 'Years Experience', value: agent.years_experience != null ? `${agent.years_experience}+` : '—' },
                    { label: 'Avg. Rating',      value: reviews.length > 0
                        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                        : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
                    </div>
                  ))}
                </div>

                {/* About */}
                {agent.bio && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{agent.bio}</p>
                  </div>
                )}

                {/* Listings */}
                {agent.listings?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Listings</h2>
                    <div className="flex gap-6 border-b border-gray-200 mb-5">
                      {[
                        { key: 'sale', label: `For Sale (${saleListing.length})` },
                        { key: 'rent', label: `For Rent (${rentListings.length})` },
                      ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                          className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === t.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                          {t.label}
                          {activeTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />}
                        </button>
                      ))}
                    </div>

                    {tabListings.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4">No {activeTab === 'sale' ? 'sale' : 'rental'} listings.</p>
                    ) : (
                      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-2">
                        <div className="flex gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                          {tabListings.map(p => (
                            <div key={p.id} className="flex-shrink-0 w-64 lg:w-auto group">
                              <a href={`/properties?property=${p.id}`} className="block">
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
                                  {p.cover_photo
                                    ? <img src={p.cover_photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    : <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                                        <Briefcase className="w-8 h-8 text-amber-300" />
                                      </div>
                                  }
                                </div>
                                <div className="font-bold text-gray-900 text-sm truncate group-hover:text-amber-700 transition-colors">{p.title}</div>
                                <div className="text-amber-700 font-semibold text-sm mt-0.5">{formatPrice(p.price)}</div>
                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{p.city}
                                  {p.bedrooms  != null && <> · {p.bedrooms} bd</>}
                                  {p.bathrooms != null && <> · {p.bathrooms} ba</>}
                                </div>
                              </a>
                              <button onClick={() => handleMsgAboutListing(p)}
                                className="mt-2 w-full text-xs text-amber-700 font-semibold border border-amber-200 hover:bg-amber-50 py-1.5 rounded-lg transition-colors">
                                Message about this listing
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
                    </h2>
                    {/* Leave review button — only for logged-in non-owner users */}
                    {activeUser && !isOwnProfile && (
                      <button onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors">
                        <Star className="w-3.5 h-3.5" /> Leave a Review
                      </button>
                    )}
                  </div>

                  {reviews.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                      <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No reviews yet.</p>
                      {activeUser && !isOwnProfile && (
                        <button onClick={() => setReviewOpen(true)}
                          className="mt-3 text-sm text-amber-600 font-semibold hover:text-amber-700">
                          Be the first to review
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-amber-100 flex items-center justify-center">
                              {r.reviewer_avatar
                                ? <img src={r.reviewer_avatar} alt={r.reviewer_name} className="w-full h-full object-cover" />
                                : <span className="text-sm font-bold text-amber-700">
                                    {(r.reviewer_name || 'U').charAt(0).toUpperCase()}
                                  </span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold text-gray-900 text-sm truncate">{r.reviewer_name || 'Anonymous'}</p>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Working hours */}
                {Object.keys(workingHours).length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" /> Working Hours
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DAYS.filter(d => workingHours[d]).map(day => {
                        const h = workingHours[day];
                        return (
                          <div key={day} className={`p-3 rounded-xl border text-sm ${h.enabled ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                            <p className="font-semibold capitalize text-gray-800">{day}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{h.enabled ? `${h.open} – ${h.close}` : 'Closed'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Contact {agent.name.split(' ')[0]}</h3>
                    <div className="space-y-2">
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group">
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Phone</p>
                            <p className="text-sm font-bold text-gray-900">{agent.phone}</p>
                          </div>
                        </a>
                      )}
                      {waNumber && (
                        <a href={`https://wa.me/${waNumber.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Bonjour ${agent.name}, je vous contacte via HOMi.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
                          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
                            <p className="text-sm font-bold text-gray-900">{waNumber.replace(/[^0-9+]/g,'')}</p>
                          </div>
                        </a>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Email</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{agent.email}</p>
                          </div>
                        </a>
                      )}
                    </div>

                    <button onClick={() => setMsgOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
                      <Mail className="w-4 h-4" /> Send Message
                    </button>

                    {Object.values(social).some(Boolean) && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Online</p>
                        <div className="flex flex-wrap gap-2">
                          {social.website   && <a href={social.website}   target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Globe className="w-3 h-3" />Website</a>}
                          {social.linkedin  && <a href={social.linkedin}  target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline">LinkedIn</a>}
                          {social.facebook  && <a href={social.facebook}  target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Facebook</a>}
                          {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-600 hover:underline">Instagram</a>}
                        </div>
                      </div>
                    )}
                  </div>

                  {agent.license_number && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">License</p>
                        <p className="text-sm font-bold text-gray-900">{agent.license_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile CTA */}
        {agent && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3">
            {agent.phone && (
              <a href={`tel:${agent.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            {waNumber && (
              <a href={`https://wa.me/${waNumber.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Bonjour ${agent.name}, je vous contacte via HOMi.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
            <button onClick={() => setMsgOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
              <Mail className="w-4 h-4" /> Message
            </button>
          </div>
        )}
      </div>

      <SendMessageModal
        isOpen={msgOpen}
        onClose={() => setMsgOpen(false)}
        listing={msgListing}
        isLoggedIn={!!activeUser}
        onLoginRequired={() => { setMsgOpen(false); navigate('/auth'); }}
        onSent={handleMessageSent}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        subjectType="agent"
        subjectId={agentId}
        subjectTitle={agent?.name}
      />

      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        agentId={agentId}
        agentName={agent?.name}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
};

export default AgentDetail;