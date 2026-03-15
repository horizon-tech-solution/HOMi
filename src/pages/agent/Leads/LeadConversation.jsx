// src/pages/agent/Leads/LeadConversation.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, Phone, Mail, Building2, Paperclip,
  Image as ImageIcon, Smile, MoreVertical,
  CheckCircle, XCircle, Flag, Archive,
  Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { fetchLead, replyToLead } from '../../../api/agents/leads';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('fr-CM', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const fmtPrice = (p) => p ? parseInt(p).toLocaleString('fr-FR') + ' FCFA' : null;

// ─────────────────────────────────────────────────────────────────────────────

const LeadConversation = ({ lead: leadPreview, isOpen, onClose, onReplySent }) => {
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const [fullLead, setFullLead]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState('');
  const [message, setMessage]         = useState('');
  const [sending, setSending]         = useState(false);
  const [sendError, setSendError]     = useState('');
  const [showActions, setShowActions] = useState(false);

  // ── Load full thread ───────────────────────────────────────────────────────

  const loadThread = useCallback(async () => {
    if (!leadPreview?.id) return;
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchLead(leadPreview.id);
      setFullLead(data);
    } catch (err) {
      setLoadError(err?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [leadPreview?.id]);

  useEffect(() => {
    if (isOpen) { setFullLead(null); loadThread(); }
  }, [isOpen, loadThread]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [fullLead?.messages?.length, loading]);

  // ── Send reply ─────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError('');
    try {
      const newMsg = await replyToLead(leadPreview.id, text);
      const optimistic = {
        id:          newMsg.id || Date.now(),
        text:        newMsg.text || text,
        sender_type: newMsg.sender_type || 'agent',
        sender_id:   fullLead?.current_user_id,
        is_mine:     true,   // ← always true for optimistic (I just sent it)
        created_at:  newMsg.created_at || new Date().toISOString(),
        sender_name: 'You',
      };
      setFullLead(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), optimistic],
      }));
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      onReplySent?.(leadPreview.id);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      setSendError(err?.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
  };

  if (!isOpen) return null;

  const lead      = fullLead || leadPreview;
  const messages  = fullLead?.messages || [];
  const isSentByAgent = lead?.direction === 'sent'; // agent initiated the inquiry

  const avatarUrl = lead?.user_avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(lead?.user_name || 'U')}&background=random`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-4xl">
          <div className="flex h-full bg-white shadow-xl">

            {/* ── Main Chat Area ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col">

              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={avatarUrl} alt={lead?.user_name}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900 truncate">{lead?.user_name || 'Unknown'}</h2>
                        {isSentByAgent && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            You contacted them
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{messages.length > 0 ? `${messages.length} messages` : 'No replies yet'}</span>
                        <span>•</span>
                        <span className="truncate">{timeAgo(lead?.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lead?.user_phone && (
                      <a href={`tel:${lead.user_phone}`}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm">
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    )}
                    {lead?.user_email && (
                      <a href={`mailto:${lead.user_email}`}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">
                        <Mail className="w-4 h-4" /> Email
                      </a>
                    )}

                    <div className="relative">
                      <button onClick={() => setShowActions(p => !p)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-700" />
                      </button>
                      {showActions && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <button onClick={() => setShowActions(false)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" /> Mark as Won
                            </button>
                            <button onClick={() => setShowActions(false)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                              <XCircle className="w-4 h-4 text-red-600" /> Mark as Lost
                            </button>
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                              <Flag className="w-4 h-4 text-orange-600" /> Change Priority
                            </button>
                            <hr className="my-2" />
                            <button onClick={onClose}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                              <Archive className="w-4 h-4" /> Archive
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <button onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2">
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property banner */}
              {lead?.listing_title && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
                  <div className="flex items-center gap-4">
                    {lead.listing_photo ? (
                      <img src={lead.listing_photo} alt={lead.listing_title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-amber-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{lead.listing_title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                        {lead.listing_city && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{lead.listing_city}
                          </span>
                        )}
                        {lead.listing_price && (
                          <span className="font-medium text-amber-700">{fmtPrice(lead.listing_price)}</span>
                        )}
                        {lead.listing_type && (
                          <span className="capitalize">{lead.listing_type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-400">Loading conversation…</p>
                  </div>
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
                    <p className="text-sm text-red-600 mb-3">{loadError}</p>
                    <button onClick={loadThread}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Initial inquiry message — show on RIGHT if agent sent it */}
                    {messages.length === 0 && lead?.initial_message && (
                      <div className={`flex ${isSentByAgent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-lg ${isSentByAgent ? 'flex-row-reverse' : ''}`}>
                          {!isSentByAgent && (
                            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-cover" />
                          )}
                          <div className={`flex flex-col ${isSentByAgent ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl ${
                              isSentByAgent
                                ? 'bg-amber-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            }`}>
                              <p className="text-sm leading-relaxed">{lead.initial_message}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 px-2">{timeAgo(lead.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.map(msg => {
                      // ── Use is_mine (set by backend) to decide bubble side ──
                      // Falls back to sender_type check for backwards compat
                      const isMine = msg.is_mine === true || msg.is_mine === 1;

                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-lg ${isMine ? 'flex-row-reverse' : ''}`}>
                            {!isMine && (
                              <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-cover" />
                            )}
                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                              <div className={`px-4 py-3 rounded-2xl ${
                                isMine
                                  ? 'bg-amber-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                              </div>
                              <span className="text-xs text-gray-500 mt-1 px-2">{timeAgo(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Send error */}
              {sendError && (
                <div className="mx-6 mb-0 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 flex-1">{sendError}</p>
                  <button onClick={() => setSendError('')} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input */}
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
                      ref={textareaRef}
                      value={message}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none disabled:opacity-50"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>

                  <button onClick={handleSendMessage}
                    disabled={!message.trim() || sending || loading}
                    className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                      message.trim() && !sending && !loading
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    {sending
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Send className="w-5 h-5" />}
                  </button>
                </div>

                <div className="sm:hidden mt-3 flex gap-2">
                  {lead?.user_phone && (
                    <a href={`tel:${lead.user_phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                  {lead?.user_email && (
                    <a href={`mailto:${lead.user_email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Sidebar ────────────────────────────────────────── */}
            <div className="hidden lg:block w-80 xl:w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-6 space-y-6">

                <div className="text-center pb-6 border-b border-gray-200">
                  <img src={avatarUrl} alt={lead?.user_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                  <h3 className="text-xl font-bold text-gray-900">{lead?.user_name || 'Unknown'}</h3>
                  {isSentByAgent && (
                    <p className="text-sm text-purple-600 font-medium mt-1">You contacted this person</p>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isSentByAgent
                        ? 'bg-purple-100 text-purple-700'
                        : messages.length === 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {isSentByAgent ? 'Sent by you' : messages.length === 0 ? 'Awaiting Reply' : 'Active'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    {lead?.user_email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${lead.user_email}`} className="text-blue-600 hover:underline break-all">
                          {lead.user_email}
                        </a>
                      </div>
                    )}
                    {lead?.user_phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${lead.user_phone}`} className="text-blue-600 hover:underline">
                          {lead.user_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {lead?.listing_title && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {isSentByAgent ? 'Property You Inquired About' : 'Interested Property'}
                    </h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      {lead.listing_photo ? (
                        <img src={lead.listing_photo} alt={lead.listing_title}
                          className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-amber-50 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-amber-300" />
                        </div>
                      )}
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900 mb-1">{lead.listing_title}</h5>
                        {lead.listing_city && <p className="text-sm text-gray-500 mb-1">{lead.listing_city}</p>}
                        {lead.listing_price && <p className="text-sm font-bold text-amber-600">{fmtPrice(lead.listing_price)}</p>}
                        {(lead.bedrooms || lead.bathrooms) && (
                          <p className="text-xs text-gray-400 mt-1">
                            {[lead.bedrooms && `${lead.bedrooms} BD`, lead.bathrooms && `${lead.bathrooms} BA`].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Direction</span>
                      <span className="font-medium text-gray-900">{isSentByAgent ? 'Sent by you' : 'Received'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Messages</span>
                      <span className="font-medium text-gray-900">{messages.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{isSentByAgent ? 'Sent' : 'Received'}</span>
                      <span className="font-medium text-gray-900">{timeAgo(lead?.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Mark as Won
                  </button>
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Mark as Lost
                  </button>
                  <button onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <Archive className="w-4 h-4" /> Archive Lead
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