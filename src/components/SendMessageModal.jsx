// src/components/SendMessageModal.jsx
import { useState } from 'react';
import { X, Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { sendInquiry } from '../api/users/inquiry';

/**
 * Props:
 *   isOpen     - bool
 *   onClose    - fn
 *   listing    - raw listing object (needs .id, .title)
 *   onSent     - fn(inquiryId) — called after successful send
 *   isLoggedIn - bool
 *   onLoginRequired - fn — called if user is not logged in
 */
const SendMessageModal = ({ isOpen, onClose, listing, onSent, isLoggedIn, onLoginRequired }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState(null);
  const [sent,    setSent]    = useState(false);

  if (!isOpen) return null;

  const defaultMsg = listing
    ? `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}". Pouvez-vous me donner plus d'informations ?`
    : '';

  const handleOpen = () => {
    if (!message && !sent) setMessage(defaultMsg);
  };

  // Run once when modal opens
  if (isOpen && !message && !sent) {
    setTimeout(() => setMessage(defaultMsg), 0);
  }

  const handleSend = async () => {
    if (!isLoggedIn) {
      onClose();
      onLoginRequired?.();
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);
    try {
      const res = await sendInquiry(listing.id, trimmed);
      setSent(true);
      setTimeout(() => {
        onSent?.(res.inquiry_id);
        onClose();
        setSent(false);
        setMessage('');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed z-[10002] inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Send Message</p>
              {listing && (
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{listing.title}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {sent ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-900">Message sent!</p>
              <p className="text-sm text-gray-500 text-center">Taking you to your inbox…</p>
            </div>
          ) : (
            <>
              {!isLoggedIn && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  You need to be logged in to send messages.
                </div>
              )}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKey}
                rows={5}
                placeholder="Type your message…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
              )}

              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : !isLoggedIn
                    ? 'Log in to send'
                    : <><Send className="w-4 h-4" /> Send Message</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SendMessageModal;