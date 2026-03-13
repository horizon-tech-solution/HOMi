// src/pages/user/UserMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send, ChevronLeft, Loader2, Search, Home,
  Phone, ExternalLink, User, X, MessageSquare
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchInquiries, fetchMessages, replyToInquiry } from '../../api/users/inquiry';

// ─── Utils ─────────────────────────────────────────────────────────────────────
const timeStr = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now  = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return date.toLocaleDateString('en-GB', { weekday: 'short' });
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const dayLabel = (d) => {
  const diff = Math.floor((new Date() - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};

const fmtPrice = (p) =>
  p != null ? Number(p).toLocaleString('fr-CM') + ' XAF' : '';

const monogram = (name) =>
  (name || 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const groupMsgs = (msgs) => {
  const out = []; let lastDay = null;
  for (const m of msgs) {
    const key = new Date(m.created_at).toDateString();
    if (key !== lastDay) {
      out.push({ type: 'day', date: new Date(m.created_at), key });
      lastDay = key;
    }
    out.push({ type: 'msg', ...m });
  }
  return out;
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Av = ({ src, name, size = 36 }) => (
  <div
    className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
    style={{
      width: size, height: size,
      background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    }}
  >
    {src
      ? <img src={src} alt={name} className="w-full h-full object-cover" />
      : <span style={{ fontSize: size * 0.36, fontWeight: 600, color: '#e5e7eb', letterSpacing: '0.02em' }}>
          {monogram(name)}
        </span>
    }
  </div>
);

// ─── WhatsApp icon ─────────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Thread Row ────────────────────────────────────────────────────────────────
const ThreadRow = ({ t, active, unread, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors duration-100"
    style={{
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      borderRadius: 0,
    }}
  >
    <div className="relative flex-shrink-0">
      <Av src={t.agent_avatar} name={t.agent_name} size={42} />
      {unread && (
        <span
          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
          style={{ background: '#3b82f6', border: '2px solid #111827' }}
        />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <p
          className="text-sm truncate"
          style={{ color: '#f9fafb', fontWeight: unread ? 600 : 400 }}
        >
          {t.agent_name || 'Agent'}
        </p>
        <span className="text-[11px] flex-shrink-0" style={{ color: '#6b7280' }}>
          {timeStr(t.last_message_at || t.created_at)}
        </span>
      </div>
      <p
        className="text-xs truncate"
        style={{ color: unread ? '#d1d5db' : '#6b7280', fontWeight: unread ? 500 : 400 }}
      >
        {t.last_message || t.opening_message || ''}
      </p>
    </div>
    {active && (
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
        style={{ background: '#3b82f6' }}
      />
    )}
  </button>
);

// ─── Bubble ────────────────────────────────────────────────────────────────────
const Bubble = ({ item, chainedWithPrev, chainedWithNext }) => {
  const mine = item.is_mine;
  return (
    <div
      className={`flex items-end gap-2.5 ${mine ? 'flex-row-reverse' : ''} ${chainedWithPrev ? 'mt-0.5' : 'mt-4'}`}
    >
      {!mine && (
        <div className="w-7 flex-shrink-0 self-end">
          {!chainedWithNext
            ? <Av src={item.sender_avatar} name={item.sender_name} size={28} />
            : <div style={{ width: 28 }} />
          }
        </div>
      )}
      <div className={`max-w-[65%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
        {!mine && !chainedWithPrev && (
          <span className="text-[11px] mb-1 ml-1" style={{ color: '#9ca3af' }}>
            {item.sender_name}
          </span>
        )}
        <div
          className="px-3.5 py-2 text-sm leading-relaxed"
          style={{
            background:   mine ? '#2563eb' : '#f3f4f6',
            color:        mine ? '#ffffff'  : '#111827',
            borderRadius: mine
              ? chainedWithPrev ? '18px 4px 18px 18px' : '18px 4px 18px 18px'
              : chainedWithPrev ? '4px 18px 18px 18px' : '4px 18px 18px 18px',
            wordBreak: 'break-word',
          }}
        >
          {item.message}
        </div>
        {!chainedWithNext && (
          <span className="text-[10px] mt-1 mx-1" style={{ color: '#9ca3af' }}>
            {timeStr(item.created_at)}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Property Badge ────────────────────────────────────────────────────────────
const PropertyBadge = ({ thread, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-100 group"
    style={{ border: '1px solid #e5e7eb', maxWidth: 220 }}
    title={thread.listing_title}
  >
    <div
      className="w-7 h-7 rounded overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ background: '#f3f4f6' }}
    >
      {thread.listing_cover
        ? <img src={thread.listing_cover} alt="" className="w-full h-full object-cover" />
        : <Home className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
      }
    </div>
    <span className="text-xs truncate" style={{ color: '#374151', fontWeight: 500 }}>
      {thread.listing_title}
    </span>
    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: '#6b7280' }} />
  </button>
);

// ─── Chat Pane ─────────────────────────────────────────────────────────────────
const ChatPane = ({ thread, onBack, onViewProp, onViewAgent }) => {
  const [msgs,    setMsgs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [text,    setText]    = useState('');
  const [sending, setSending] = useState(false);
  const [err,     setErr]     = useState(null);
  const bottomRef = useRef(null);
  const taRef     = useRef(null);

  useEffect(() => {
    setLoading(true); setErr(null); setMsgs([]);
    fetchMessages(thread.id)
      .then(r => setMsgs(r.messages || []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [thread.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const resize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true); setText('');
    if (taRef.current) taRef.current.style.height = 'auto';
    try {
      await replyToInquiry(thread.id, msg);
      setMsgs(p => [...p, {
        id: Date.now(), is_mine: true, message: msg,
        sender_name: 'You', created_at: new Date().toISOString(),
      }]);
    } catch (e) { setText(msg); setErr(e.message); }
    finally { setSending(false); }
  };

  const grouped = groupMsgs(msgs);

  const waLink = thread.agent_whatsapp
    ? `https://wa.me/${thread.agent_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${thread.agent_name}, je vous contacte via HOMi.`)}`
    : null;

  return (
    <div className="flex flex-col h-full" style={{ background: '#ffffff' }}>

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid #f3f4f6', background: '#ffffff' }}
      >
        <button
          onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          style={{ color: '#374151' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button onClick={onViewAgent} className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <Av src={thread.agent_avatar} name={thread.agent_name} size={40} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
            {thread.agent_name || 'Agent'}
          </p>
          <p className="text-[11px] truncate" style={{ color: '#9ca3af' }}>
            {thread.agency_name || 'Real Estate Agent'}
          </p>
        </div>

        {/* Property badge */}
        <PropertyBadge thread={thread} onClick={onViewProp} />

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {thread.agent_phone && (
            <a
              href={`tel:${thread.agent_phone}`}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: '#374151' }}
              title={thread.agent_phone}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {waLink && (
            <a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-green-50"
              style={{ color: '#16a34a' }}
              title="WhatsApp"
            >
              <WaIcon />
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: '#f9fafb' }}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d1d5db' }} />
            <span className="text-xs" style={{ color: '#9ca3af' }}>Loading…</span>
          </div>
        )}

        {!loading && err && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-xs" style={{ color: '#ef4444' }}>{err}</p>
            <button
              onClick={() => {
                setLoading(true); setErr(null);
                fetchMessages(thread.id)
                  .then(r => setMsgs(r.messages || []))
                  .catch(e => setErr(e.message))
                  .finally(() => setLoading(false));
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: '#f3f4f6', color: '#374151' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: '#f3f4f6' }}
            >
              <MessageSquare className="w-5 h-5" style={{ color: '#d1d5db' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No messages yet</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Say hello to {thread.agent_name || 'the agent'}
            </p>
          </div>
        )}

        {!loading && !err && grouped.map((item, i) => {
          if (item.type === 'day') return (
            <div key={item.key} className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
              <span className="text-[10px] px-2.5 py-0.5 rounded-full" style={{ color: '#9ca3af', background: '#f3f4f6' }}>
                {dayLabel(item.date)}
              </span>
              <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
            </div>
          );
          const prev   = grouped[i - 1];
          const next   = grouped[i + 1];
          const chPrev = prev?.type === 'msg' && prev.is_mine === item.is_mine;
          const chNext = next?.type === 'msg' && next.is_mine === item.is_mine;
          return (
            <Bubble key={item.id} item={item} chainedWithPrev={chPrev} chainedWithNext={chNext} />
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3" style={{ background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
        {err && !loading && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px]" style={{ color: '#ef4444' }}>{err}</p>
            <button onClick={() => setErr(null)}>
              <X className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div
            className="flex-1 flex items-end gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: '#f3f4f6', border: '1.5px solid #e5e7eb' }}
          >
            <textarea
              ref={taRef}
              value={text}
              onChange={e => { setText(e.target.value); resize(); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Message…"
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{ color: '#111827', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={{ background: '#2563eb', color: '#ffffff' }}
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty / Idle ──────────────────────────────────────────────────────────────
const Empty = ({ onBrowse }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 px-8 py-20">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <MessageSquare className="w-6 h-6" style={{ color: '#4b5563' }} />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold mb-1" style={{ color: '#d1d5db' }}>No conversations</p>
      <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
        Contact an agent about a listing to get started
      </p>
    </div>
    <button
      onClick={onBrowse}
      className="px-5 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-80"
      style={{ background: '#2563eb', color: '#ffffff' }}
    >
      Browse listings
    </button>
  </div>
);

const Idle = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2" style={{ background: '#f9fafb' }}>
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1"
      style={{ background: '#f3f4f6' }}
    >
      <MessageSquare className="w-5 h-5" style={{ color: '#d1d5db' }} />
    </div>
    <p className="text-xs" style={{ color: '#9ca3af' }}>Select a conversation</p>
  </div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────
const UserMessages = () => {
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads,  setThreads]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    const tid = Number(searchParams.get('thread'));
    if (tid) setActiveId(tid);
  }, []);

  useEffect(() => {
    fetchInquiries()
      .then(r => {
        const data = r.data || [];
        setThreads(data);
        if (!searchParams.get('thread') && data.length > 0) setActiveId(data[0].id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const active   = threads.find(t => t.id === activeId) || null;
  const filtered = threads.filter(t => {
    const q = search.toLowerCase();
    return !q
      || t.agent_name?.toLowerCase().includes(q)
      || t.listing_title?.toLowerCase().includes(q);
  });

  const select = (t) => { setActiveId(t.id); setSearchParams({ thread: t.id }); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111827' }}>
      <UserNav />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Sidebar */}
        <div
          className={`flex flex-col w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 ${activeId ? 'hidden lg:flex' : 'flex'}`}
          style={{ background: '#111827' }}
        >
          {/* Sidebar header */}
          <div className="flex-shrink-0 px-4 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold" style={{ color: '#f9fafb', letterSpacing: '-0.01em' }}>
                Messages
              </h1>
              {threads.length > 0 && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium tabular-nums"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                >
                  {threads.length}
                </span>
              )}
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4b5563' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: '#d1d5db' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-3 h-3" style={{ color: '#4b5563' }} />
                </button>
              )}
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#374151' }} />
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-10 text-center">
                <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs font-medium"
                  style={{ color: '#60a5fa' }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && threads.length === 0 && (
              <Empty onBrowse={() => navigate('/properties')} />
            )}

            {!loading && !error && filtered.length === 0 && threads.length > 0 && (
              <div className="flex flex-col items-center py-10 gap-1">
                <p className="text-xs" style={{ color: '#4b5563' }}>No results for "{search}"</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-xs font-medium mt-1"
                  style={{ color: '#60a5fa' }}
                >
                  Clear
                </button>
              </div>
            )}

            {!loading && !error && filtered.map((t, i) => (
              <ThreadRow
                key={t.id}
                t={t}
                active={activeId === t.id}
                unread={i === 1}
                onClick={() => select(t)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Chat area */}
        <div
          className={`flex-1 overflow-hidden ${activeId ? 'flex flex-col' : 'hidden lg:flex'}`}
        >
          {active
            ? <ChatPane
                key={active.id}
                thread={active}
                onBack={() => { setActiveId(null); setSearchParams({}); }}
                onViewProp={() => navigate(`/properties?property=${active.listing_id}`)}
                onViewAgent={() => navigate(`/agent/${active.agent_id}`)}
              />
            : <Idle />
          }
        </div>

      </div>
    </div>
  );
};

export default UserMessages;