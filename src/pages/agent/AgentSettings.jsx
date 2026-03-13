// src/pages/agent/AgentSettings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import { get, put, post } from '../../api/agents/base';
import {
  ArrowLeft, Bell, Lock, Shield, Eye, EyeOff,
  Check, AlertTriangle, AlertCircle, CheckCircle,
  Loader2, X, Trash2, MessageSquare, Home,
} from 'lucide-react';

// ─── API calls ─────────────────────────────────────────────────────────────

const fetchSettings           = ()     => get('/agent/settings');
const saveNotificationPrefs   = (data) => put('/agent/settings/notifications', data);
const savePrivacySettings     = (data) => put('/agent/settings/privacy', data);
const changePassword          = (data) => post('/agent/settings/change-password', data);
const deleteAccount           = (data) => post('/agent/settings/delete-account', data);

// ─── Toggle component ──────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
      checked ? 'bg-amber-600' : 'bg-gray-200'
    }`}>
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
      checked ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

// ─── Section wrapper ───────────────────────────────────────────────────────

const Section = ({ title, subtitle, children }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, sublabel, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="mr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const fc = (err) =>
  `w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200'
  }`;

// ─── Main ──────────────────────────────────────────────────────────────────

export default function AgentSettings() {
  const navigate = useNavigate();

  const [tab, setTab]         = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // per-section saving states
  const [savingNotifs,  setSavingNotifs]  = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingPwd,     setSavingPwd]     = useState(false);
  const [deletingAcct,  setDeletingAcct]  = useState(false);

  // per-section success/error
  const [notifMsg,   setNotifMsg]   = useState('');
  const [privacyMsg, setPrivacyMsg] = useState('');
  const [pwdMsg,     setPwdMsg]     = useState('');
  const [pwdErr,     setPwdErr]     = useState('');
  const [deleteErr,  setDeleteErr]  = useState('');

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd,     setShowNewPwd]     = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showDeletePwd,  setShowDeletePwd]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Notification prefs ─────────────────────────────────────────────────

  const [notifs, setNotifs] = useState({
    new_inquiry:    true,   // agent gets notified when a user sends an inquiry
    inquiry_reply:  true,   // agent gets notified when user replies to their message
    listing_status: true,   // agent notified when admin approves/rejects a listing
  });

  // ── Privacy ────────────────────────────────────────────────────────────

  const [privacy, setPrivacy] = useState({
    show_phone:     true,
    show_email:     true,
    show_whatsapp:  true,
    allow_messages: true,
  });

  // ── Password ───────────────────────────────────────────────────────────

  const [pwd, setPwd] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [deletePassword, setDeletePassword] = useState('');

  // ── Load ───────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true); setLoadError('');
      try {
        const data = await fetchSettings();
        if (data.notifs)   setNotifs(n  => ({ ...n,  ...data.notifs   }));
        if (data.privacy)  setPrivacy(p => ({ ...p,  ...data.privacy  }));
      } catch (err) {
        setLoadError(err?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save notifications ─────────────────────────────────────────────────

  const handleSaveNotifs = async () => {
    setSavingNotifs(true); setNotifMsg('');
    try {
      await saveNotificationPrefs(notifs);
      setNotifMsg('saved');
      setTimeout(() => setNotifMsg(''), 3000);
    } catch (err) {
      setNotifMsg('error:' + (err?.message || 'Failed to save'));
    } finally {
      setSavingNotifs(false);
    }
  };

  // ── Save privacy ───────────────────────────────────────────────────────

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true); setPrivacyMsg('');
    try {
      await savePrivacySettings(privacy);
      setPrivacyMsg('saved');
      setTimeout(() => setPrivacyMsg(''), 3000);
    } catch (err) {
      setPrivacyMsg('error:' + (err?.message || 'Failed to save'));
    } finally {
      setSavingPrivacy(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    setPwdErr(''); setPwdMsg('');
    if (!pwd.current_password)            return setPwdErr('Current password is required');
    if (!pwd.new_password)                return setPwdErr('New password is required');
    if (pwd.new_password.length < 8)      return setPwdErr('New password must be at least 8 characters');
    if (pwd.new_password !== pwd.confirm_password) return setPwdErr('Passwords do not match');

    setSavingPwd(true);
    try {
      await changePassword({ current_password: pwd.current_password, new_password: pwd.new_password });
      setPwdMsg('Password changed successfully');
      setPwd({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPwdMsg(''), 4000);
    } catch (err) {
      setPwdErr(err?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    setDeleteErr('');
    if (!deletePassword) return setDeleteErr('Please enter your password to confirm');
    setDeletingAcct(true);
    try {
      await deleteAccount({ password: deletePassword });
      localStorage.removeItem('user_token');
      navigate('/');
    } catch (err) {
      setDeleteErr(err?.message || 'Failed to delete account');
      setDeletingAcct(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  const TABS = [
    { id: 'notifications', icon: Bell,   label: 'Notifications' },
    { id: 'privacy',       icon: Shield, label: 'Privacy'       },
    { id: 'security',      icon: Lock,   label: 'Security'      },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading settings…</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{loadError}</p>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-semibold">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/agent/home')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    tab === id
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

              {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
              {tab === 'notifications' && (
                <div className="space-y-8">
                  <Section
                    title="Notification Preferences"
                    subtitle="Choose which in-app notifications you receive. These control the alerts that appear in your notifications panel.">

                    <div className="bg-gray-50 rounded-xl px-4 divide-y divide-gray-100">
                      <ToggleRow
                        label="New inquiry received"
                        sublabel="When a client sends a message about one of your listings"
                        checked={notifs.new_inquiry}
                        onChange={v => setNotifs(p => ({ ...p, new_inquiry: v }))}
                      />
                      <ToggleRow
                        label="Client replied to your message"
                        sublabel="When a client responds in an active conversation"
                        checked={notifs.inquiry_reply}
                        onChange={v => setNotifs(p => ({ ...p, inquiry_reply: v }))}
                      />
                      <ToggleRow
                        label="Listing status changed"
                        sublabel="When admin approves, rejects or requests changes to a listing"
                        checked={notifs.listing_status}
                        onChange={v => setNotifs(p => ({ ...p, listing_status: v }))}
                      />
                    </div>
                  </Section>

                  {/* Save */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {notifMsg === 'saved' && (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Saved
                      </span>
                    )}
                    {notifMsg.startsWith('error:') && (
                      <span className="text-red-500 text-sm">{notifMsg.slice(6)}</span>
                    )}
                    {!notifMsg && <span />}
                    <button onClick={handleSaveNotifs} disabled={savingNotifs}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                      {savingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {savingNotifs ? 'Saving…' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PRIVACY ──────────────────────────────────────────────── */}
              {tab === 'privacy' && (
                <div className="space-y-8">
                  <Section
                    title="Contact Information Visibility"
                    subtitle="Control what clients can see on your public profile page.">

                    <div className="bg-gray-50 rounded-xl px-4 divide-y divide-gray-100">
                      <ToggleRow
                        label="Show phone number"
                        sublabel="Clients can see and call your phone directly"
                        checked={privacy.show_phone}
                        onChange={v => setPrivacy(p => ({ ...p, show_phone: v }))}
                      />
                      <ToggleRow
                        label="Show email address"
                        sublabel="Your email is visible on your public profile"
                        checked={privacy.show_email}
                        onChange={v => setPrivacy(p => ({ ...p, show_email: v }))}
                      />
                      <ToggleRow
                        label="Show WhatsApp number"
                        sublabel="Clients see a WhatsApp link on your profile"
                        checked={privacy.show_whatsapp}
                        onChange={v => setPrivacy(p => ({ ...p, show_whatsapp: v }))}
                      />
                    </div>
                  </Section>

                  <Section
                    title="Messaging"
                    subtitle="Control how clients can contact you.">
                    <div className="bg-gray-50 rounded-xl px-4">
                      <ToggleRow
                        label="Allow inquiry messages"
                        sublabel="Clients can send you messages about your listings"
                        checked={privacy.allow_messages}
                        onChange={v => setPrivacy(p => ({ ...p, allow_messages: v }))}
                      />
                    </div>
                    {!privacy.allow_messages && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Disabling messages will hide the contact form from your profile and listing pages. Clients won't be able to reach you directly.
                      </div>
                    )}
                  </Section>

                  {/* Save */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {privacyMsg === 'saved' && (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Saved
                      </span>
                    )}
                    {privacyMsg.startsWith('error:') && (
                      <span className="text-red-500 text-sm">{privacyMsg.slice(6)}</span>
                    )}
                    {!privacyMsg && <span />}
                    <button onClick={handleSavePrivacy} disabled={savingPrivacy}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                      {savingPrivacy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {savingPrivacy ? 'Saving…' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECURITY ─────────────────────────────────────────────── */}
              {tab === 'security' && (
                <div className="space-y-10">

                  {/* Change password */}
                  <Section
                    title="Change Password"
                    subtitle="Use a strong password of at least 8 characters.">

                    <div className="space-y-4">
                      {/* Current */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPwd ? 'text' : 'password'}
                            value={pwd.current_password}
                            onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))}
                            className={`${fc(pwdErr && !pwd.current_password)} pr-11`}
                            placeholder="Enter current password"
                          />
                          <button type="button"
                            onClick={() => setShowCurrentPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPwd ? 'text' : 'password'}
                            value={pwd.new_password}
                            onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))}
                            className={`${fc()} pr-11`}
                            placeholder="At least 8 characters"
                          />
                          <button type="button"
                            onClick={() => setShowNewPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Strength indicator */}
                        {pwd.new_password.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                pwd.new_password.length >= i * 3
                                  ? i <= 1 ? 'bg-red-400'
                                  : i <= 2 ? 'bg-amber-400'
                                  : i <= 3 ? 'bg-yellow-400'
                                  : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Confirm */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPwd ? 'text' : 'password'}
                            value={pwd.confirm_password}
                            onChange={e => setPwd(p => ({ ...p, confirm_password: e.target.value }))}
                            className={`${fc(pwd.confirm_password && pwd.confirm_password !== pwd.new_password)} pr-11`}
                            placeholder="Repeat new password"
                          />
                          <button type="button"
                            onClick={() => setShowConfirmPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {pwd.confirm_password && pwd.confirm_password === pwd.new_password && (
                            <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* Error / success */}
                      {pwdErr && (
                        <p className="flex items-center gap-1.5 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />{pwdErr}
                        </p>
                      )}
                      {pwdMsg && (
                        <p className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />{pwdMsg}
                        </p>
                      )}

                      <button onClick={handleChangePassword} disabled={savingPwd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                        {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {savingPwd ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </Section>

                  {/* Danger zone */}
                  <div className="border-t-2 border-red-100 pt-8">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="text-base font-bold text-red-600">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account. All listings, leads, and data will be removed and cannot be recovered.
                    </p>

                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete My Account
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-red-800">
                          Enter your password to confirm deletion:
                        </p>
                        <div className="relative">
                          <input
                            type={showDeletePwd ? 'text' : 'password'}
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            placeholder="Your current password"
                            className="w-full px-4 py-2.5 border border-red-300 bg-white rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent pr-11"
                          />
                          <button type="button" onClick={() => setShowDeletePwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showDeletePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {deleteErr && (
                          <p className="text-red-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{deleteErr}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button onClick={handleDeleteAccount} disabled={deletingAcct}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                            {deletingAcct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {deletingAcct ? 'Deleting…' : 'Confirm Delete'}
                          </button>
                          <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteErr(''); }}
                            className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}