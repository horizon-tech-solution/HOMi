// src/pages/public/FindAgent.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Users, User, CheckCircle, Shield, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import LocationSearch from '../../components/LocationSearch';
import AgentDetail from './pageDetail/AgentDetails';
import { fetchAgents } from '../../api/public/agent';

// ── Agent Card ────────────────────────────────────────────────────────────────
const AgentCard = ({ agent, onView }) => {
  const initials = agent.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const meta = agent.profile_meta
    ? (typeof agent.profile_meta === 'string' ? JSON.parse(agent.profile_meta) : agent.profile_meta)
    : {};
  const languages      = meta.languages     || [];
  const specialization = (meta.specialization || []).slice(0, 2);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Photo strip */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {agent.avatar_url && !agent.avatar_url.includes('ui-avatars.com')
          ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover object-top" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                <span className="text-2xl font-extrabold text-gray-500">{initials}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{agent.agency_name || 'Independent Agent'}</span>
            </div>
          )
        }
        {agent.verification_status === 'verified' && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow text-green-600 text-xs font-semibold">
            <CheckCircle size={11} fill="#16a34a" color="#16a34a" /> Verified
          </div>
        )}
        {agent.avg_rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/60 rounded-full px-2.5 py-1 flex items-center gap-1">
            <Star size={11} fill="#fbbf24" color="#fbbf24" />
            <span className="text-white text-xs font-semibold">{Number(agent.avg_rating).toFixed(1)}</span>
            <span className="text-white/60 text-xs">({agent.review_count})</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 leading-tight">{agent.name}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
            <MapPin size={11} />
            <span>{agent.city || 'Cameroon'}{agent.agency_name ? ` · ${agent.agency_name}` : ''}</span>
          </div>
        </div>

        <div className="flex divide-x divide-gray-100 bg-gray-50 rounded-lg overflow-hidden mb-3">
          <div className="flex-1 py-2 text-center">
            <div className="text-sm font-bold text-gray-900">{agent.listings_count || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Listings</div>
          </div>
          <div className="flex-1 py-2 text-center">
            <div className="text-sm font-bold text-gray-900">{agent.review_count || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Reviews</div>
          </div>
          {agent.years_experience != null && (
            <div className="flex-1 py-2 text-center">
              <div className="text-sm font-bold text-gray-900">{agent.years_experience}+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Years</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {specialization.map(s => (
            <span key={s} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">{s}</span>
          ))}
          {languages.length > 0 && (
            <span className="text-xs text-gray-400">{languages.join(' · ')}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 text-sm" onClick={() => onView(agent.id)}>Contact</Button>
          <Button variant="secondary" className="flex-1 text-sm" onClick={() => onView(agent.id)}>View Profile</Button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const FindAgent = () => {
  const { id: urlId } = useParams();
  const navigate      = useNavigate();

  const [agents,           setAgents]           = useState([]);
  const [total,            setTotal]            = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [activeTab,        setActiveTab]        = useState('location');
  const [searchLocation,   setSearchLocation]   = useState('');
  const [searchName,       setSearchName]       = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedAgentId,  setSelectedAgentId]  = useState(urlId ? parseInt(urlId) : null);
  const [isDetailOpen,     setIsDetailOpen]     = useState(!!urlId);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 50 };
      // Both filters go server-side now
      if (searchLocation) params.search = searchLocation;
      if (searchName)     params.name   = searchName;

      const res = await fetchAgents(params);
      let rows = res.data || [];

      if (showVerifiedOnly) {
        rows = rows.filter(a => a.verification_status === 'verified');
      }

      setAgents(rows);
      setTotal(res.total || rows.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [searchLocation, searchName, showVerifiedOnly]);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const handleLocationSelect = ({ shortLabel, label }) => {
    const val = shortLabel || label || '';
    setSearchLocation(val);
  };

  const handleView = (id) => {
    setSelectedAgentId(id);
    setIsDetailOpen(true);
    navigate(`/agent/${id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    navigate('/find-agent', { replace: true });
    setTimeout(() => setSelectedAgentId(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100 py-10 sm:py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Find a Real Estate Agent</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            A great agent makes<br className="hidden sm:block" /> all the difference
          </h1>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
            Connect with Cameroon's top-rated, verified real estate professionals.
          </p>

          {/* Search box */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden max-w-xl mx-auto">
            <div className="flex border-b border-gray-100 bg-gray-50">
              {[
                { key: 'location', label: 'Location', icon: <MapPin size={13} /> },
                { key: 'name',     label: 'Name',     icon: <User size={13} /> },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                    activeTab === t.key
                      ? 'border-gray-900 text-gray-900 bg-white'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            <div className="p-3">
              {activeTab === 'location' ? (
                /* Smart location search with DB cities + Nominatim */
                <div className="flex gap-2">
                  <div className="flex-1">
                    <LocationSearch
                      value={searchLocation}
                      onChange={setSearchLocation}
                      onSelect={handleLocationSelect}
                      placeholder="City, neighbourhood…"
                      inputClassName="border border-gray-200 rounded-xl bg-gray-50 focus:border-gray-900"
                    />
                  </div>
                  <Button icon={Search} className="px-4 py-2.5 whitespace-nowrap text-sm" onClick={loadAgents}>
                    Search
                  </Button>
                </div>
              ) : (
                /* Name search — plain input, server-side */
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Agent name or agency…"
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && loadAgents()}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 transition-colors"
                    />
                  </div>
                  <Button icon={Search} className="px-4 py-2.5 whitespace-nowrap text-sm" onClick={loadAgents}>
                    Search
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Trust stats */}
          <div className="flex justify-center gap-8 mt-7 flex-wrap">
            {[
              { n: `${total}+`, l: 'Verified agents' },
              { n: '4.9★',      l: 'Avg. rating'     },
              { n: 'Free',      l: 'To contact'      },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-gray-900">{s.n}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-8 sm:py-10 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <span className="text-sm text-gray-500">
              Showing <strong className="text-gray-900">{agents.length}</strong> agents
            </span>
            <button
              onClick={() => setShowVerifiedOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                showVerifiedOnly
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              <Shield size={12} fill={showVerifiedOnly ? '#15803d' : 'none'} color={showVerifiedOnly ? '#15803d' : '#9ca3af'} />
              Verified only
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-red-500 text-sm">
              {error}
              <button onClick={loadAgents} className="block mx-auto mt-3 text-amber-600 font-semibold underline">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} onView={handleView} />
                ))}
              </div>
              {agents.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm">No agents found. Try a different search.</p>
                </div>
              )}
            </>
          )}

          {/* CTA */}
          <div className="mt-10 bg-gray-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-base">Not sure who to choose?</p>
                <p className="text-white/60 text-sm mt-0.5 max-w-xs">
                  We'll match you with the right professional based on your needs.
                </p>
              </div>
            </div>
            <Button className="whitespace-nowrap bg-white text-gray-900 hover:bg-gray-100 text-sm">
              Get matched
            </Button>
          </div>
        </div>
      </section>

      {selectedAgentId && (
        <AgentDetail
          agentId={selectedAgentId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default FindAgent;