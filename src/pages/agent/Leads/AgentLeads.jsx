import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import { 
  Search,
  Filter,
  X,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Star,
  TrendingUp,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Archive,
  Flag,
  ChevronDown,
  User,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';

const AgentLeads = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showConversation, setShowConversation] = useState(false);

  // Mock data - replace with actual API calls
  const leads = [
    {
      id: 1,
      name: 'Jean Paul Mbarga',
      email: 'jeanpaul@email.com',
      phone: '+237 6 77 88 99 00',
      avatar: 'https://ui-avatars.com/api/?name=Jean+Paul+Mbarga&background=random',
      property: {
        id: 101,
        title: 'Modern 3BR Apartment in Bonamoussadi',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
      },
      status: 'new',
      priority: 'high',
      message: 'Hi, I am interested in scheduling a viewing this weekend. Is Saturday morning available?',
      timestamp: '2 hours ago',
      unread: true,
      source: 'website',
      rating: null
    },
    {
      id: 2,
      name: 'Marie Claire Ndongo',
      email: 'marieclaire@email.com',
      phone: '+237 6 55 44 33 22',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Claire+Ndongo&background=random',
      property: {
        id: 102,
        title: 'Luxury Villa with Pool in Bonapriso',
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400'
      },
      status: 'contacted',
      priority: 'high',
      message: 'Can you provide more details about the financing options available for this property?',
      timestamp: '5 hours ago',
      unread: true,
      source: 'phone',
      rating: null
    },
    {
      id: 3,
      name: 'Patrick Ewondo',
      email: 'patrick.e@email.com',
      phone: '+237 6 99 88 77 66',
      avatar: 'https://ui-avatars.com/api/?name=Patrick+Ewondo&background=random',
      property: {
        id: 103,
        title: '2BR Apartment for Rent',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
      },
      status: 'viewing-scheduled',
      priority: 'medium',
      message: 'Thank you for the quick response. Looking forward to the viewing on Friday at 3 PM.',
      timestamp: '1 day ago',
      unread: false,
      source: 'website',
      rating: 5
    },
    {
      id: 4,
      name: 'Sophie Kamga',
      email: 'sophie.kamga@email.com',
      phone: '+237 6 11 22 33 44',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Kamga&background=random',
      property: {
        id: 104,
        title: '4BR Family House with Garden',
        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
      },
      status: 'negotiating',
      priority: 'high',
      message: 'I would like to make an offer. Can we discuss the terms?',
      timestamp: '2 days ago',
      unread: false,
      source: 'referral',
      rating: null
    },
    {
      id: 5,
      name: 'David Nkoulou',
      email: 'david.n@email.com',
      phone: '+237 6 66 55 44 33',
      avatar: 'https://ui-avatars.com/api/?name=David+Nkoulou&background=random',
      property: {
        id: 101,
        title: 'Modern 3BR Apartment in Bonamoussadi',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
      },
      status: 'closed-won',
      priority: 'low',
      message: 'Thank you for your help throughout the process. Very satisfied with the service!',
      timestamp: '1 week ago',
      unread: false,
      source: 'website',
      rating: 5
    },
    {
      id: 6,
      name: 'Aminata Diallo',
      email: 'aminata.d@email.com',
      phone: '+237 6 22 33 44 55',
      avatar: 'https://ui-avatars.com/api/?name=Aminata+Diallo&background=random',
      property: {
        id: 105,
        title: 'Commercial Space in Douala',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
      },
      status: 'closed-lost',
      priority: 'low',
      message: 'Thank you, but I found another property that better suits my needs.',
      timestamp: '2 weeks ago',
      unread: false,
      source: 'website',
      rating: 3
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Leads', count: leads.length },
    { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { value: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { value: 'viewing-scheduled', label: 'Viewing Scheduled', count: leads.filter(l => l.status === 'viewing-scheduled').length },
    { value: 'negotiating', label: 'Negotiating', count: leads.filter(l => l.status === 'negotiating').length },
    { value: 'closed-won', label: 'Closed Won', count: leads.filter(l => l.status === 'closed-won').length },
    { value: 'closed-lost', label: 'Closed Lost', count: leads.filter(l => l.status === 'closed-lost').length }
  ];

  const properties = [
    { value: 'all', label: 'All Properties' },
    { value: '101', label: 'Modern 3BR Apartment in Bonamoussadi' },
    { value: '102', label: 'Luxury Villa with Pool in Bonapriso' },
    { value: '103', label: '2BR Apartment for Rent' },
    { value: '104', label: '4BR Family House with Garden' },
    { value: '105', label: 'Commercial Space in Douala' }
  ];

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.property.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesProperty = selectedProperty === 'all' || lead.property.id.toString() === selectedProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'new': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
      'contacted': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Contacted' },
      'viewing-scheduled': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Viewing Scheduled' },
      'negotiating': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Negotiating' },
      'closed-won': { bg: 'bg-green-100', text: 'text-green-700', label: 'Closed Won' },
      'closed-lost': { bg: 'bg-red-100', text: 'text-red-700', label: 'Closed Lost' }
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': { bg: 'bg-red-100', text: 'text-red-700' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'low': { bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    return badges[priority] || badges.low;
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowConversation(true);
  };

  const handleUpdateStatus = (leadId, newStatus) => {
    // API call to update status
    console.log('Update status:', leadId, newStatus);
  };

  const handleArchiveLead = (leadId) => {
    // API call to archive
    console.log('Archive lead:', leadId);
  };

  const unreadCount = leads.filter(l => l.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={unreadCount} unreadNotifications={5} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your property inquiries ({filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'})
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leads.filter(l => ['contacted', 'viewing-scheduled', 'negotiating'].includes(l.status)).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed Won</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leads.filter(l => l.status === 'closed-won').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2.4h</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer min-w-[200px]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Property Filter */}
            <div className="relative">
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer min-w-[200px]"
              >
                {properties.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">Try adjusting your filters or wait for new inquiries.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredLeads.map((lead) => {
              const statusBadge = getStatusBadge(lead.status);
              const priorityBadge = getPriorityBadge(lead.priority);

              return (
                <div 
                  key={lead.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    lead.unread ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex gap-4">
                    <img 
                      src={lead.avatar} 
                      alt={lead.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                            {lead.unread && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityBadge.bg} ${priorityBadge.text}`}>
                              {lead.priority}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lead.timestamp}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                          
                          <div className="relative group">
                            <button 
                              className="p-2 hover:bg-gray-200 rounded"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Mark as Won
                              </button>
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <XCircle className="w-4 h-4" />
                                Mark as Lost
                              </button>
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <Flag className="w-4 h-4" />
                                Set Priority
                              </button>
                              <hr className="my-2" />
                              <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="flex items-center gap-3 mb-3 bg-gray-50 p-3 rounded-lg">
                        <img 
                          src={lead.property.image} 
                          alt={lead.property.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.property.title}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            Property ID: {lead.property.id}
                          </p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        "{lead.message}"
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">Source: {lead.source}</span>
                          {lead.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {lead.rating}/5
                            </span>
                          )}
                        </div>
                        
                        <button 
                          className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeadClick(lead);
                          }}
                        >
                          View Conversation
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation Modal - Simple version, you can create a separate component */}
      {showConversation && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedLead.avatar} 
                  alt={selectedLead.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-sm text-gray-600">{selectedLead.property.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConversation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <img 
                    src={selectedLead.avatar} 
                    alt={selectedLead.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-900">{selectedLead.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedLead.timestamp}</p>
                  </div>
                </div>
                
                {/* This would be dynamic conversation history */}
                <p className="text-center text-sm text-gray-500 py-4">
                  Full conversation feature coming soon
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLeads;