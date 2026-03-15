// src/components/ReviewModal.jsx
import { useState } from 'react';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { useUserAuth  } from '../context/UserAuthContext';
import { useAgentAuth } from '../context/AgentAuthContext';
import { post } from '../api/users/base';

const ReviewModal = ({ isOpen, onClose, agentId, agentName, onReviewSubmitted }) => {
  const { user  } = useUserAuth();
  const { agent } = useAgentAuth();
  const activeUser = user || agent;

  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  if (!isOpen) return null;

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (!rating)         { setError('Please select a rating'); return; }
    if (!comment.trim()) { setError('Please write a comment'); return; }
    if (!activeUser)     { setError('You must be logged in to leave a review'); return; }

    setLoading(true);
    setError('');
    try {
      await post('/user/reviews', {
        agent_id: agentId,
        rating,
        comment: comment.trim(),
      });
      setDone(true);
      onReviewSubmitted?.();
    } catch (e) {
      setError(e.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setComment('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10010]" onClick={handleClose} />

      <div className="fixed z-[10011] inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Leave a Review</p>
              {agentName && (
                <p className="text-xs text-gray-400 truncate max-w-[220px]">{agentName}</p>
              )}
            </div>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {done ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-900">Review submitted!</p>
              <p className="text-sm text-gray-500 text-center">
                Thank you for your feedback. It helps others make informed decisions.
              </p>
              <button onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Star rating */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">How would you rate this agent?</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`w-9 h-9 transition-colors ${
                        i <= (hovered || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`} />
                    </button>
                  ))}
                </div>
                {(hovered || rating) > 0 && (
                  <p className="text-sm font-semibold text-amber-600">
                    {LABELS[hovered || rating]}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Your review</p>
                <textarea
                  value={comment}
                  onChange={e => { setComment(e.target.value); setError(''); }}
                  rows={4}
                  placeholder={`Share your experience with ${agentName || 'this agent'}…`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
              </div>

              {!activeUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  You need to be logged in to leave a review.
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !rating || !comment.trim() || !activeUser}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><Star className="w-4 h-4" /> Submit Review</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewModal;