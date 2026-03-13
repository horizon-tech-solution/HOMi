// src/components/ShareModal.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Link2, Check } from 'lucide-react';

// WhatsApp SVG icon
const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ShareModal = ({ isOpen, onClose, listing }) => {
  const [copied,  setCopied]  = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    else setMounted(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen || !listing) return null;

  const url   = `${window.location.origin}/properties?property=${listing.id}`;
  const title = listing.title || 'Check out this property on HOMi';
  const text  = `${title} — ${Number(listing.price).toLocaleString('fr-CM')} XAF`;

  const handleClose = () => { setMounted(false); setTimeout(onClose, 250); };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (_) {}
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm transition-opacity duration-250"
        style={{ opacity: mounted ? 1 : 0 }}
      />

      {/* Modal */}
      <div
        className="fixed z-[10002] bottom-0 left-0 right-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm w-full"
        style={{
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1), opacity 0.25s ease',
          transform: mounted
            ? 'translateY(0) translateX(0)'
            : 'translateY(100%) translateX(0)',
          opacity: mounted ? 1 : 0,
        }}
      >
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Share this property</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{listing.title}</p>
            </div>
            <button onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Share options */}
          <div className="p-5 space-y-3">

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <WhatsAppIcon size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                <p className="text-xs text-gray-400">Share via WhatsApp</p>
              </div>
            </a>

            {/* Native Share (mobile) */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Share via…</p>
                  <p className="text-xs text-gray-400">Open system share sheet</p>
                </div>
              </button>
            )}

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group text-left ${
                copied
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-all group-hover:scale-105 ${
                copied ? 'bg-green-500' : 'bg-gray-800'
              }`}>
                {copied
                  ? <Check className="w-5 h-5" />
                  : <Link2 className="w-5 h-5" />
                }
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {copied ? 'Link copied!' : 'Copy link'}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">{url}</p>
              </div>
            </button>
          </div>

          {/* Bottom safe area spacer on mobile */}
          <div className="h-2 sm:hidden" />
        </div>
      </div>
    </>
  );
};

export default ShareModal;