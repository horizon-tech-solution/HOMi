import { X, Star, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const AgentDetail = ({ agent, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('sold');

  useEffect(() => {
    if (isOpen) {
      window.history.replaceState(null, '', `/agent/${agent.id}`);
      document.body.style.overflow = 'hidden';
    } else {
      window.history.replaceState(null, '', '/find-agent');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, agent]);

  if (!isOpen || !agent) return null;

  const mockProperties = {
    sold: [
      { id: 1, price: '$850,000', beds: 3, baths: 2, sqft: '2,100', location: 'Douala', status: 'Sold 2 months ago' },
      { id: 2, price: '$1,200,000', beds: 4, baths: 3, sqft: '3,200', location: 'Douala', status: 'Sold 3 months ago' },
      { id: 3, price: '$650,000', beds: 2, baths: 2, sqft: '1,800', location: 'Yaoundé', status: 'Sold 4 months ago' },
      { id: 4, price: '$920,000', beds: 3, baths: 2, sqft: '2,400', location: 'Douala', status: 'Sold 5 months ago' },
    ],
    forSale: [
      { id: 5, price: '$780,000', beds: 3, baths: 2, sqft: '2,000', location: 'Douala', status: 'Active' },
      { id: 6, price: '$1,500,000', beds: 5, baths: 4, sqft: '4,000', location: 'Yaoundé', status: 'Active' },
    ],
    forRent: [
      { id: 7, price: '$2,500/mo', beds: 2, baths: 1, sqft: '1,200', location: 'Douala', status: 'Available' },
      { id: 8, price: '$3,200/mo', beds: 3, baths: 2, sqft: '1,800', location: 'Douala', status: 'Available' },
    ],
  };

  const reviews = [
    { rating: 5.0, text: "Outstanding professional who guided us through every step. Highly knowledgeable about the local market.", author: "Sophie M.", date: "2 weeks ago" },
    { rating: 5.0, text: "Best decision we made. Patient, responsive, and truly cared about finding us the right home.", author: "Marc D.", date: "1 month ago" },
    { rating: 4.9, text: "Excellent service. Made the buying process smooth and stress-free.", author: "Claire B.", date: "2 months ago" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="flex-1 space-y-12">
              {/* Hero Section */}
              <div className="flex flex-col md:flex-row gap-8">
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    {agent.verified && (
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full mb-3">
                        ✓ Verified Professional
                      </span>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{agent.name}</h1>
                    <p className="text-xl text-gray-600 mb-1">{agent.company}</p>
                    <p className="text-gray-500">{agent.specialty} Specialist</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-900">{agent.rating}</span>
                      <span className="text-gray-500">({agent.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{agent.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{agent.sales}</div>
                  <div className="text-sm text-gray-500 mt-1">Properties Sold</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{agent.reviews}</div>
                  <div className="text-sm text-gray-500 mt-1">Reviews</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-500 mt-1">Years Active</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{agent.rating}</div>
                  <div className="text-sm text-gray-500 mt-1">Average Rating</div>
                </div>
              </div>

              {/* About */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  With over 15 years of experience in the Cameroon real estate market, {agent.name} has built 
                  a reputation for excellence and dedication to client satisfaction. Specializing in {agent.specialty.toLowerCase()}, 
                  they have successfully helped hundreds of families find their perfect home. Their deep understanding of the local 
                  market and commitment to personalized service sets them apart in the industry.
                </p>
              </div>

              {/* Properties Tabs */}
              <div>
                <div className="flex gap-6 border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('sold')}
                    className={`pb-3 font-semibold relative ${
                      activeTab === 'sold' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    Sold ({mockProperties.sold.length})
                    {activeTab === 'sold' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('forSale')}
                    className={`pb-3 font-semibold relative ${
                      activeTab === 'forSale' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    For Sale ({mockProperties.forSale.length})
                    {activeTab === 'forSale' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('forRent')}
                    className={`pb-3 font-semibold relative ${
                      activeTab === 'forRent' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    For Rent ({mockProperties.forRent.length})
                    {activeTab === 'forRent' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                  </button>
                </div>

                {/* Properties Scroll - Mobile Optimized */}
                <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-4">
                  <div className="flex gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                    {mockProperties[activeTab].map((property) => (
                      <div key={property.id} className="flex-shrink-0 w-72 lg:w-auto">
                        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3" />
                        <div className="text-xl font-bold text-gray-900 mb-1">{property.price}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {property.beds} bd · {property.baths} ba · {property.sqft} sqft
                        </div>
                        <div className="text-sm text-gray-500">{property.location}</div>
                        <div className="text-xs text-gray-400 mt-2">{property.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Reviews</h2>
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={index} className="pb-6 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{review.rating}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">{review.text}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{review.author}</span>
                        <span>·</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Contact Form - Desktop Only */}
            <div className="lg:w-80 xl:w-96">
              <div className="lg:sticky lg:top-24">
                <div className="bg-gray-50 rounded-2xl p-6 space-y-5">
                  <h3 className="text-lg font-bold text-gray-900">Contact Agent</h3>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone number"
                      className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <input 
                      type="email" 
                      placeholder="Email address"
                      className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <textarea 
                      placeholder="Message (optional)"
                      rows="3"
                      className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg">
                    Send Message
                  </button>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{agent.phone}</span>
                    </a>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{agent.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Contact Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button className="w-full bg-amber-600 text-white font-semibold py-4 rounded-lg">
            Contact {agent.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentDetail;