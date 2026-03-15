// src/components/ReportModal.jsx
import { useState } from 'react';
import { X, Flag, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUserAuth  } from '../context/UserAuthContext';
import { useAgentAuth } from '../context/AgentAuthContext';
import { submitReport } from '../api/users/report';

// subject_type: 'listing' | 'agent'
// subjectId: the listing or agent id
// subjectTitle: display name shown in the modal
const ReportModal = ({ isOpen, onClose, subjectType, subjectId, subjectTitle, linkedListingId = null }) => {
  const { user  } = useUserAuth();
  const { agent } = useAgentAuth();
  const activeUser = user || agent;

  const [reason,      setReason]      = useState('');
  const [description, setDescription] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  const REASONS = subjectType === 'listing'
    ? ['Fake listing', 'Wrong price / misleading info', 'Scam / fraud', 'Duplicate listing', 'Inappropriate content', 'Other']
    : ['Fraud / scam', 'Harassment', 'Impersonation', 'Fake agent', 'Unprofessional behavior', 'Other'];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason'); return; }
    if (!description.trim()) { setError('Please describe the issue'); return; }
    if (!activeUser) { setError('You must be logged in to report'); return; }

    setLoading(true);
    setError('');
    try {
      await submitReport({
        // 'agent' reports use subject_type='user' since agents are in users table
        subjectType:     subjectType === 'agent' ? 'user' : subjectType,
        subjectId,
        type:            reason,
        description:     description.trim(),
        linkedListingId,
      });
      setDone(true);
    } catch (e) {
      setError(e.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
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
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Report</p>
              {subjectTitle && (
                <p className="text-xs text-gray-400 truncate max-w-[220px]">{subjectTitle}</p>
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
              <p className="font-semibold text-gray-900">Report submitted</p>
              <p className="text-sm text-gray-500 text-center">
                Thank you. Our team will review this and take action if needed.
              </p>
              <button onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          ) : !activeUser ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
              <p className="font-semibold text-gray-900">Login required</p>
              <p className="text-sm text-gray-500 text-center">You need to be logged in to submit a report.</p>
              <button onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Reason */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  What's the issue with this {subjectType}?
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {REASONS.map(r => (
                    <button key={r} onClick={() => { setReason(r); setError(''); }}
                      className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        reason === r
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Additional details</p>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); setError(''); }}
                  rows={3}
                  placeholder="Describe what you experienced or observed…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !reason || !description.trim()}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><Flag className="w-4 h-4" /> Submit Report</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportModal;