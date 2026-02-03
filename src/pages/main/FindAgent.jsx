import { useState } from 'react';
import { Search, MapPin, Star, TrendingUp, Mail, Users, User } from 'lucide-react';
import Button from '../../components/Button';
import AgentDetail from './pageDetail/AgentDetails';

const MOCK_AGENTS = [
  {
    id: 1,
    name: 'Marie Kouam',
    company: 'Prime Properties Cameroon',
    rating: 5.0,
    reviews: 143,
    sales: 234,
    location: 'Douala',
    phone: '+237 699 123 456',
    email: 'marie.kouam@primeproperties.cm',
    specialty: 'Luxury Homes',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    verified: true,
    languages: ['French', 'English']
  },
  {
    id: 2,
    name: 'Paul Nkotto',
    company: 'Elite Realty Group',
    rating: 4.9,
    reviews: 98,
    sales: 187,
    location: 'Yaoundé',
    phone: '+237 677 234 567',
    email: 'paul.nkotto@eliterealty.cm',
    specialty: 'Residential',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    verified: true,
    languages: ['French']
  },
  {
    id: 3,
    name: 'Claire Mbida',
    company: 'Urban Living Agents',
    rating: 5.0,
    reviews: 156,
    sales: 298,
    location: 'Douala',
    phone: '+237 655 345 678',
    email: 'claire.mbida@urbanliving.cm',
    specialty: 'Apartments',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop',
    verified: true,
    languages: ['French', 'English']
  },
  {
    id: 4,
    name: 'Jean Fotso',
    company: 'Independent Agent',
    rating: 4.8,
    reviews: 67,
    sales: 142,
    location: 'Douala',
    phone: '+237 698 456 789',
    email: 'jean.fotso@gmail.com',
    specialty: 'First-time Buyers',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    verified: false,
    languages: ['French']
  },
  {
    id: 5,
    name: 'Sandra Ewane',
    company: 'Coastal Properties Ltd',
    rating: 4.9,
    reviews: 121,
    sales: 219,
    location: 'Douala',
    phone: '+237 677 567 890',
    email: 'sandra@coastalproperties.cm',
    specialty: 'Commercial',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    verified: true,
    languages: ['French', 'English']
  },
  {
    id: 6,
    name: 'Boris Tchami',
    company: 'Capital City Realty',
    rating: 5.0,
    reviews: 89,
    sales: 176,
    location: 'Yaoundé',
    phone: '+237 699 678 901',
    email: 'boris.tchami@capitalcity.cm',
    specialty: 'Investment',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    verified: true,
    languages: ['French', 'English']
  }
];

const AgentCard = ({ agent, handleViewProfile }) => (
  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Image */}
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        <img 
          src={agent.image} 
          alt={agent.name}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ${
            agent.verified ? 'ring-4 ring-green-500' : 'ring-2 ring-gray-200'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">{agent.name}</h3>
              {agent.verified && (
                <span className="flex-shrink-0 text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded">✓</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{agent.company}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-black text-sm sm:text-base text-gray-900">{agent.rating}</span>
            <span className="text-xs text-gray-500 hidden sm:inline">({agent.reviews})</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-3 text-xs sm:text-sm">
          <p className="text-gray-700">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 text-amber-700" />
            {agent.location}
          </p>
          <p className="text-gray-700">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 text-green-600" />
            <span className="font-bold">{agent.sales}</span> properties sold
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-xs">
              {agent.specialty}
            </span>
            {agent.languages.map(lang => (
              <span key={lang} className="text-xs text-gray-500">{lang}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="flex-1 flex items-center justify-center gap-2 text-sm"
            onClick={() => handleViewProfile(agent)}
          >
            Contact
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1 text-sm"
            onClick={() => handleViewProfile(agent)}
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const FindAgent = () => {
  const [activeTab, setActiveTab] = useState('location');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchName, setSearchName] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewProfile = (agent) => {
    setSelectedAgent(agent);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedAgent(null), 300);
  };

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    const matchesLocation = !searchLocation || agent.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesName = !searchName || agent.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesVerified = !showVerifiedOnly || agent.verified;
    return matchesLocation && matchesName && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className='w-full mx-auto'>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                A great agent makes all the difference
              </h2>
            </div>
            

            {/* Search Box - Tab Style */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-300 overflow-hidden max-w-2xl mx-auto">
              {/* Tabs */}
              <div className="flex border-b border-gray-300">
                <button
                  onClick={() => setActiveTab('location')}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-colors ${
                    activeTab === 'location'
                      ? 'bg-amber-600 text-white '
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveTab('name')}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-colors ${
                    activeTab === 'name'
                      ? 'bg-amber-600 text-white '
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Name
                </button>
              </div>

              {/* Search Input */}
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  {activeTab === 'location' ? (
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="City, neighborhood"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Agent name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                      />
                    </div>
                  )}
                  
                  <Button 
                    icon={Search} 
                    className="px-4 py-2 sm:py-2.5 bg-amber-600 whitespace-nowrap text-sm w-full sm:w-auto"
                  >
                    Find agent
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition-all flex items-center gap-2 text-sm ${
                  showVerifiedOnly 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                }`}
              >
                Verified Only
              </button>
              <span className="text-gray-600 font-semibold text-sm">{filteredAgents.length} agents found</span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} handleViewProfile={handleViewProfile} />
              ))}
            </div>

            {/* Help CTA */}
            <div className="mt-8 sm:mt-12 bg-gradient-to-br from-blue-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-100 shadow-md">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2">
                    Need help finding the right agent?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 font-medium mb-3 sm:mb-4">
                    We'll pair you with a verified professional who has the inside scoop on your market.
                  </p>
                  <Button className="w-full md:w-auto text-sm sm:text-base">Connect with a local agent</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail 
          agent={selectedAgent}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default FindAgent;