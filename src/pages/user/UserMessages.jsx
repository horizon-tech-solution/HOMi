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

const fmtPrice = (p) => p != null ? Number(p).toLocaleString('fr-CM') + ' XAF' : '';

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
    style={{ width: size, height: size, background: '#e8dfd0', border: '1.5px solid #d4c4a8' }}
  >
    {src
      ? <img src={src} alt={name} className="w-full h-full object-cover" />
      : <span style={{ fontSize: size * 0.36, fontWeight: 600, color: '#8B6340' }}>
          {monogram(name)}
        </span>
    }
  </div>
);

// ─── WhatsApp icon ─────────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Thread Row ────────────────────────────────────────────────────────────────
const ThreadRow = ({ t, active, unread, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors duration-100 relative"
    style={{
      background:   active ? '#faf6f0' : 'transparent',
      borderLeft:   active ? '2.5px solid #8B6340' : '2.5px solid transparent',
      borderBottom: '1px solid #f5f0ea',
    }}
  >
    <div className="relative flex-shrink-0">
      <Av src={t.agent_avatar} name={t.agent_name} size={42} />
      {unread && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
          style={{ background: '#8B6340', border: '2px solid #ffffff' }}
        />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <p className="text-sm truncate" style={{ color: '#1a1208', fontWeight: unread ? 600 : 500 }}>
          {t.agent_name || 'User'}
        </p>
        <span className="text-[11px] flex-shrink-0" style={{ color: '#b09878' }}>
          {timeStr(t.last_message_at || t.created_at)}
        </span>
      </div>
      <p className="text-[11px] truncate mb-0.5 flex items-center gap-1" style={{ color: '#8B6340' }}>
        <Home className="w-3 h-3 flex-shrink-0" />
        {t.listing_title}
        {t.is_received && (
          <span
            className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
            style={{ background: '#fef3c7', color: '#d97706' }}
          >
            YOUR LISTING
          </span>
        )}
      </p>
      <p className="text-xs truncate" style={{ color: unread ? '#3d2b14' : '#a09080', fontWeight: unread ? 500 : 400 }}>
        {t.last_message || t.opening_message || ''}
      </p>
    </div>
  </button>
);

// ─── Bubble ────────────────────────────────────────────────────────────────────
const Bubble = ({ item, chainedWithPrev, chainedWithNext }) => {
  const mine = item.is_mine;
  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${chainedWithPrev ? 'mt-0.5' : 'mt-4'}`}>
      {!mine && (
        <div className="w-6 flex-shrink-0 self-end mb-1">
          {!chainedWithNext
            ? <Av src={item.sender_avatar} name={item.sender_name} size={24} />
            : <div style={{ width: 24 }} />
          }
        </div>
      )}
      <div className={`max-w-[68%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
        {!mine && !chainedWithPrev && (
          <span className="text-[11px] mb-1 px-1" style={{ color: '#b09878' }}>
            {item.sender_name}
          </span>
        )}
        <div
          className="px-4 py-2.5 text-sm leading-relaxed"
          style={{
            background:   mine ? '#3d2b14' : '#f0ebe3',
            color:        mine ? '#fdf8f2' : '#2a1f14',
            borderRadius: mine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
            border:       mine ? 'none' : '1px solid #e3d9cc',
            wordBreak:    'break-word',
          }}
        >
          {item.message}
        </div>
        {!chainedWithNext && (
          <span className="text-[10px] mt-1 px-1" style={{ color: '#c4b49a' }}>
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
    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-75 group"
    style={{ background: '#faf6f0', border: '1px solid #e8dfd0', maxWidth: 200 }}
    title={thread.listing_title}
  >
    <div
      className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ background: '#e8dfd0' }}
    >
      {thread.listing_cover
        ? <img src={thread.listing_cover} alt="" className="w-full h-full object-cover" />
        : <Home className="w-3 h-3" style={{ color: '#c4b49a' }} />
      }
    </div>
    <span className="text-xs truncate" style={{ color: '#3d2b14', fontWeight: 500 }}>
      {thread.listing_title}
    </span>
    <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: '#c4b49a' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#ffffff' }}>

      {/* Header — never scrolls */}
      <div style={{ flexShrink: 0, background: '#ffffff', borderBottom: '1px solid #f0ebe3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
          <button
            onClick={onBack}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
            style={{ color: '#8B6340' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button onClick={onViewAgent} className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Av src={thread.agent_avatar} name={thread.agent_name} size={40} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1208', margin: 0, lineHeight: 1.3 }} className="truncate">
              {thread.agent_name || 'Agent'}
            </p>
            <p style={{ fontSize: 11, color: '#b09878', margin: 0 }} className="truncate">
              {thread.agency_name || 'Real Estate Agent'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <PropertyBadge thread={thread} onClick={onViewProp} />
            {thread.agent_phone && (
              <a
                href={`tel:${thread.agent_phone}`}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
                style={{ color: '#8B6340', border: '1px solid #e8dfd0' }}
                title={thread.agent_phone}
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors"
                style={{ border: '1px solid #d4ead9' }}
                title="WhatsApp"
              >
                <WaIcon />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Messages — ONLY this scrolls */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fdfaf7' }}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c4b49a' }} />
            <span className="text-xs" style={{ color: '#d4c4a8' }}>Loading messages…</span>
          </div>
        )}
        {!loading && err && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-xs" style={{ color: '#b05050' }}>{err}</p>
            <button
              onClick={() => {
                setLoading(true); setErr(null);
                fetchMessages(thread.id)
                  .then(r => setMsgs(r.messages || []))
                  .catch(e => setErr(e.message))
                  .finally(() => setLoading(false));
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#faf6f0', color: '#8B6340', border: '1px solid #e8dfd0' }}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !err && msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: '#f5f0ea' }}>
              <MessageSquare className="w-5 h-5" style={{ color: '#d4c4a8' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#3d2b14' }}>Start the conversation</p>
            <p className="text-[11px]" style={{ color: '#c4b49a' }}>
              Send a message to {thread.agent_name || 'the agent'}
            </p>
          </div>
        )}
        {!loading && !err && grouped.map((item, i) => {
          if (item.type === 'day') return (
            <div key={item.key} className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: '#ede5d8' }} />
              <span className="text-[10px] px-3 py-1 rounded-full" style={{ color: '#b09878', background: '#f5f0ea', border: '1px solid #ede5d8' }}>
                {dayLabel(item.date)}
              </span>
              <div className="flex-1 h-px" style={{ background: '#ede5d8' }} />
            </div>
          );
          const prev   = grouped[i - 1];
          const next   = grouped[i + 1];
          const chPrev = prev?.type === 'msg' && prev.is_mine === item.is_mine;
          const chNext = next?.type === 'msg' && next.is_mine === item.is_mine;
          return <Bubble key={item.id} item={item} chainedWithPrev={chPrev} chainedWithNext={chNext} />;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input — never scrolls */}
      <div style={{ flexShrink: 0, background: '#ffffff', borderTop: '1px solid #f0ebe3' }}>
        {err && !loading && (
          <div className="flex items-center justify-between px-4 pt-2">
            <p className="text-[11px]" style={{ color: '#b05050' }}>{err}</p>
            <button onClick={() => setErr(null)}>
              <X className="w-3.5 h-3.5" style={{ color: '#b05050' }} />
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 16px' }}>
          <div style={{ flex: 1, borderRadius: 22, padding: '8px 16px', background: '#f5f0ea', border: '1px solid #e8dfd0', display: 'flex', alignItems: 'flex-end' }}>
            <textarea
              ref={taRef}
              value={text}
              onChange={e => { setText(e.target.value); resize(); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Message…"
              rows={1}
              className="outline-none resize-none bg-transparent text-sm leading-relaxed w-full"
              style={{ color: '#1a1208', maxHeight: 120, caretColor: '#8B6340' }}
            />
          </div>
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={{ width: 40, height: 40, flexShrink: 0, background: '#3d2b14', color: '#fdf8f2' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty / Idle ──────────────────────────────────────────────────────────────
const Empty = ({ onBrowse }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 px-8 py-20">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f5f0ea', border: '1px solid #e8dfd0' }}>
      <MessageSquare className="w-6 h-6" style={{ color: '#c4b49a' }} />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold mb-1" style={{ color: '#1a1208' }}>No messages yet</p>
      <p className="text-xs leading-relaxed" style={{ color: '#b09878' }}>
        Contact an agent about a listing to start a conversation
      </p>
    </div>
    <button
      onClick={onBrowse}
      className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-80"
      style={{ background: '#3d2b14', color: '#fdf8f2' }}
    >
      Browse listings
    </button>
  </div>
);

const Idle = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2" style={{ background: '#fdfaf7' }}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: '#f5f0ea' }}>
      <MessageSquare className="w-5 h-5" style={{ color: '#d4c4a8' }} />
    </div>
    <p className="text-xs font-medium" style={{ color: '#c4b49a' }}>Select a conversation</p>
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
    return !q || t.agent_name?.toLowerCase().includes(q) || t.listing_title?.toLowerCase().includes(q);
  });

  const select = (t) => { setActiveId(t.id); setSearchParams({ thread: t.id }); };

  return (
    // Root takes full viewport — no page scroll at all
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
      <UserNav />

      {/* Content fills remaining height, split into sidebar + chat */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <div
          className={`${activeId ? 'hidden lg:flex' : 'flex'} flex-col flex-shrink-0`}
          style={{ width: 300, minWidth: 300, height: '100%', overflow: 'hidden', background: '#ffffff', borderRight: '1px solid #f0ebe3' }}
        >
          {/* Sidebar header */}
          <div style={{ flexShrink: 0, padding: '20px 16px 12px', borderBottom: '1px solid #f5f0ea' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h1 style={{ fontSize: 15, fontWeight: 700, color: '#1a1208', margin: 0 }}>Messages</h1>
              {threads.length > 0 && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f0e8dc', color: '#8B6340', fontWeight: 600 }}>
                  {threads.length}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '7px 12px', background: '#f5f0ea', border: '1px solid #e8dfd0' }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c4b49a' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by agent or listing…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#2a1f14' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-3 h-3" style={{ color: '#c4b49a' }} />
                </button>
              )}
            </div>
          </div>

          {/* Thread list — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c4b49a' }} />
                <span className="text-xs" style={{ color: '#d4c4a8' }}>Loading…</span>
              </div>
            )}
            {!loading && error && (
              <div className="px-5 py-10 text-center">
                <p className="text-xs mb-3" style={{ color: '#b05050' }}>{error}</p>
                <button onClick={() => window.location.reload()} className="text-xs font-semibold" style={{ color: '#8B6340' }}>Retry</button>
              </div>
            )}
            {!loading && !error && threads.length === 0 && (
              <Empty onBrowse={() => navigate('/properties')} />
            )}
            {!loading && !error && filtered.length === 0 && threads.length > 0 && (
              <div className="flex flex-col items-center py-10 gap-1">
                <p className="text-xs" style={{ color: '#c4b49a' }}>No results for "{search}"</p>
                <button onClick={() => setSearch('')} className="text-xs font-semibold mt-1" style={{ color: '#8B6340' }}>Clear search</button>
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

        {/* Chat */}
        <div
          className={`${activeId ? 'flex' : 'hidden lg:flex'} flex-col flex-1`}
          style={{ height: '100%', overflow: 'hidden', minWidth: 0 }}
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