// src/components/AgentReviews.jsx
// Standalone reviews section — drop into AgentDashboard
import { useState, useEffect } from 'react';
import { Star, Loader2, AlertCircle, MessageSquare, ChevronDown } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const monogram = (name) =>
  (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Star row ─────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= rating ? '#f59e0b' : 'none'}
        stroke={i <= rating ? '#f59e0b' : '#d1d5db'}
        strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

// ─── Single review card ───────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const long = review.comment?.length > 120;
  const shown = long && !expanded ? review.comment.slice(0, 120) + '…' : review.comment;

  return (
    <div className="p-4 sm:p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            background: review.reviewer_avatar
              ? 'transparent'
              : 'linear-gradient(135deg,#fde68a,#f59e0b)',
          }}
        >
          {review.reviewer_avatar
            ? <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-bold text-amber-800">{monogram(review.reviewer_name)}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {review.reviewer_name || 'Anonymous'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(review.created_at)}</p>
            </div>
            <Stars rating={review.rating} size={13} />
          </div>

          {/* Comment */}
          <p className="text-sm text-gray-600 leading-relaxed mt-1.5">
            {shown}
          </p>
          {long && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="text-xs text-amber-600 font-semibold mt-1 hover:text-amber-700 flex items-center gap-0.5"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Rating summary bar ───────────────────────────────────────────────────────
const RatingBar = ({ count, total, star }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-3 text-right flex-shrink-0">{star}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{count}</span>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AgentReviews({ agentId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [show,    setShow]    = useState(5); // paginate locally

  useEffect(() => {
    if (!agentId) return;
    setLoading(true);
    fetch(`${BASE_URL}/public/agents/${agentId}/reviews`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setReviews(d.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [agentId]);

  // Derived stats
  const total   = reviews.length;
  const avg     = total > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : null;
  const dist    = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-base font-bold text-gray-900">Client Reviews</h2>
          {total > 0 && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
              {total}
            </span>
          )}
        </div>
        {avg && (
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-gray-900">{avg}</span>
            <Stars rating={Math.round(parseFloat(avg))} size={13} />
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs text-gray-400">Loading reviews…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 px-5 py-8 text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-1">
            <MessageSquare className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400">Reviews from clients will appear here</p>
        </div>
      )}

      {/* Rating distribution + reviews */}
      {!loading && !error && total > 0 && (
        <>
          {/* Distribution bars */}
          <div className="px-5 sm:px-6 py-4 bg-gray-50/60 border-b border-gray-100">
            <div className="space-y-1.5 max-w-xs">
              {dist.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={total} />
              ))}
            </div>
          </div>

          {/* Review list */}
          <div>
            {reviews.slice(0, show).map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Load more */}
          {show < total && (
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setShow(p => p + 5)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-amber-600 border border-amber-100 hover:bg-amber-50 transition-colors"
              >
                Show more reviews ({total - show} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}