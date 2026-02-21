// src/pages/Agent/Leads/LeadConversationModal.jsx
import { useState, useRef, useEffect } from 'react';
import { 
  X,
  Send,
  Phone,
  Mail,
  MapPin,
  Building2,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  CheckCircle,
  XCircle,
  Flag,
  Archive,
  Star,
  Clock,
  Calendar
} from 'lucide-react';

const LeadConversation = ({ lead, isOpen, onClose }) => {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);

  // Mock messages - replace with actual API call
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'lead',
      text: lead.message,
      timestamp: lead.timestamp,
      read: true
    },
    {
      id: 2,
      sender: 'agent',
      text: 'Hello! Thank you for your interest. I\'d be happy to help you with this property.',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: 3,
      sender: 'lead',
      text: 'Great! Can you provide more details about the parking and amenities?',
      timestamp: '45 minutes ago',
      read: true
    },
    {
      id: 4,
      sender: 'agent',
      text: 'Of course! The property includes 2 dedicated parking spaces in a secure underground garage. Amenities include a swimming pool, gym, and 24/7 security.',
      timestamp: '30 minutes ago',
      read: true
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'agent',
        text: message,
        timestamp: 'Just now',
        read: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkAsWon = () => {
    console.log('Mark as won:', lead.id);
    setShowActions(false);
  };

  const handleMarkAsLost = () => {
    console.log('Mark as lost:', lead.id);
    setShowActions(false);
  };

  const handleArchive = () => {
    console.log('Archive lead:', lead.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel - Slides in from right */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-4xl">
          <div className="flex h-full bg-white shadow-xl">
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Left - Lead info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img 
                      src={lead.avatar} 
                      alt={lead.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate">{lead.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="capitalize">{lead.status.replace('-', ' ')}</span>
                        <span>•</span>
                        <span className="truncate">{lead.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a 
                      href={`tel:${lead.phone}`}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                    
                    <a 
                      href={`mailto:${lead.email}`}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>

                    <div className="relative">
                      <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-700" />
                      </button>

                      {showActions && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowActions(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <button 
                              onClick={handleMarkAsWon}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Mark as Won
                            </button>
                            <button 
                              onClick={handleMarkAsLost}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                              Mark as Lost
                            </button>
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                              <Flag className="w-4 h-4 text-orange-600" />
                              Change Priority
                            </button>
                            <hr className="my-2" />
                            <button 
                              onClick={handleArchive}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                            >
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Info Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={lead.property.image} 
                    alt={lead.property.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{lead.property.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Property ID: {lead.property.id}
                      </span>
                    </div>
                  </div>
                  <button
                    className="hidden sm:block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
                  >
                    View Property
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-lg ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                        {msg.sender === 'lead' && (
                          <img 
                            src={lead.avatar} 
                            alt={lead.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        
                        <div className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              msg.sender === 'agent'
                                ? 'bg-amber-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 px-2">{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-end gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                      message.trim()
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Actions - Mobile */}
                <div className="sm:hidden mt-3 flex gap-2">
                  <a 
                    href={`tel:${lead.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  
                  <a 
                    href={`mailto:${lead.email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Lead Details (Desktop only) */}
            <div className="hidden lg:block w-80 xl:w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Lead Info */}
                <div className="text-center pb-6 border-b border-gray-200">
                  <img 
                    src={lead.avatar} 
                    alt={lead.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lead.priority === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : lead.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {lead.priority} priority
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline break-all">
                        {lead.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Interested Property</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img 
                      src={lead.property.image} 
                      alt={lead.property.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h5 className="font-semibold text-gray-900 mb-2">{lead.property.title}</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building2 className="w-4 h-4" />
                      Property ID: {lead.property.id}
                    </div>
                    <button
                      className="w-full mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Lead Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source</span>
                      <span className="font-medium text-gray-900 capitalize">{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-gray-900 capitalize">{lead.status.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium text-gray-900">{lead.timestamp}</span>
                    </div>
                    {lead.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-gray-900">{lead.rating}/5</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <button
                    onClick={handleMarkAsWon}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Won
                  </button>
                  <button
                    onClick={handleMarkAsLost}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark as Lost
                  </button>
                  <button
                    onClick={handleArchive}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadConversation;