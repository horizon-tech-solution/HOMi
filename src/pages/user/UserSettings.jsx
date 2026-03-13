import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Lock, Bell, MapPin,
  CreditCard, Trash2, Save, Camera, AlertCircle,
  Loader2, Check, X, KeyRound
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchProfile, updateProfile, fetchNotifSettings, updateNotifSettings } from '../../api/users/settings';
import { useUserAuth } from '../../context/UserAuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const getToken = () => { try { return JSON.parse(localStorage.getItem('user_token'))?.token; } catch { return null; } };
const authPost = (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify(body) }).then(r => r.json());
const authDelete = (path, body) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify(body) }).then(r => r.json());

const sections = [
  { id: 'profile',       label: 'Profile',       icon: User       },
  { id: 'notifications', label: 'Notifications',  icon: Bell       },
  { id: 'account',       label: 'Account',        icon: CreditCard },
];

const UserSettings = () => {
  const { logout } = useUserAuth();
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2 space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeSection === id ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            {activeSection === 'profile'       && <ProfileSection />}
            {activeSection === 'notifications' && <NotificationsSection />}
            {activeSection === 'account'       && <AccountSection logout={logout} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Profile ───────────────────────────────────────────────────────────────────
const ProfileSection = () => {
  const [form, setForm]           = useState({ name: '', phone: '', city: '', bio: '' });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast]         = useState(null);
  const fileInputRef              = useRef(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setForm({ name: data.name || '', phone: data.phone || '', city: data.city || '', bio: data.bio || '' });
        setAvatarUrl(data.avatar_url || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { showToast('File must be an image', 'error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch(`${BASE_URL}/user/settings/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        setAvatarPreview(null);
        setAvatarFile(null);
        return data.avatar_url;
      }
    } catch {
      showToast('Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload avatar first if changed
      if (avatarFile) await uploadAvatar();
      await updateProfile(form);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const displayAvatar = avatarPreview || avatarUrl;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-600 animate-spin" /></div>;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
          >
            {uploadingAvatar
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Camera className="w-4 h-4 text-white" />
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <p className="font-bold text-gray-900 text-lg">{form.name || 'Your Name'}</p>
          <p className="text-sm text-gray-500 mb-2">{form.city || 'No city set'}</p>
          {avatarPreview ? (
            <div className="flex gap-2">
              <button
                onClick={uploadAvatar}
                disabled={uploadingAvatar}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 flex items-center gap-1"
              >
                {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save photo
              </button>
              <button
                onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Change photo
            </button>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        <Field label="Full Name" icon={User}>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Phone Number" icon={Phone}>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        </Field>
        <Field label="City" icon={MapPin}>
          <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} placeholder="e.g. Douala" />
        </Field>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell agents a bit about what you're looking for..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors resize-none" />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:bg-gray-300 transition-all flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ── Notifications ─────────────────────────────────────────────────────────────
const NotificationsSection = () => {
  const [prefs, setPrefs]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    fetchNotifSettings()
      .then(setPrefs)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (channel, key) => {
    setPrefs((p) => ({ ...p, [channel]: { ...p[channel], [key]: !p[channel][key] } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotifSettings(prefs);
      setToast({ msg: 'Preferences saved', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message, type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-600 animate-spin" /></div>;
  if (!prefs)  return null;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <h2 className="text-xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
      <p className="text-gray-600 mb-6">Choose how you want to be notified. Email notifications are sent instantly.</p>

      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-amber-600" />Email Notifications</h3>
        <div className="space-y-3">
          <NotifToggle label="Price drop alerts"    description="Get notified when saved properties drop in price" checked={prefs.email?.price_drop}      onChange={() => toggle('email', 'price_drop')} />
          <NotifToggle label="New listing matches"  description="Properties matching your saved searches"          checked={prefs.email?.new_listing}     onChange={() => toggle('email', 'new_listing')} />
          <NotifToggle label="Messages from agents" description="Responses to your inquiries"                      checked={prefs.email?.message}         onChange={() => toggle('email', 'message')} />
          <NotifToggle label="Saved search updates" description="Weekly summary of new matches"                    checked={prefs.email?.saved_searches}  onChange={() => toggle('email', 'saved_searches')} />
          <NotifToggle label="Recommendations"      description="Properties we think you'll love"                  checked={prefs.email?.recommendations} onChange={() => toggle('email', 'recommendations')} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-600" />In-App Notifications</h3>
        <div className="space-y-3">
          <NotifToggle label="Price drop alerts"    description="Instant alerts for price drops"    checked={prefs.push?.price_drop}  onChange={() => toggle('push', 'price_drop')} />
          <NotifToggle label="New listing matches"  description="Real-time listing alerts"          checked={prefs.push?.new_listing} onChange={() => toggle('push', 'new_listing')} />
          <NotifToggle label="Messages from agents" description="Instant message notifications"     checked={prefs.push?.message}     onChange={() => toggle('push', 'message')} />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:bg-gray-300 transition-all flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Preferences
      </button>
    </div>
  );
};

// ── Account ───────────────────────────────────────────────────────────────────
const AccountSection = ({ logout }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForm, setDeleteForm]           = useState({ password: '', otp: '' });
  const [deleteStep, setDeleteStep]           = useState('confirm');
  const [sending, setSending]                 = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [toast, setToast]                     = useState(null);

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); };

  const requestDeleteOtp = async () => {
    if (!deleteForm.password) { showToast('Enter your password', 'error'); return; }
    setSending(true);
    try {
      const res = await authPost('/user/settings/otp/send', { reason: 'account_delete' });
      if (res.success) { setDeleteStep('otp'); showToast('Verification code sent', 'success'); }
      else showToast(res.error || 'Failed to send code', 'error');
    } catch { showToast('Failed to send code', 'error'); }
    setSending(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await authDelete('/user/settings/account', { password: deleteForm.password, otp: deleteForm.otp });
      if (res.success) { logout(); }
      else showToast(res.error || 'Deletion failed', 'error');
    } catch { showToast('Deletion failed', 'error'); }
    setDeleting(false);
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <h2 className="text-xl font-bold text-gray-900 mb-2">Account Management</h2>
      <p className="text-gray-600 mb-6">Manage your account and data</p>

      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2">Delete Account</h4>
              <p className="text-sm text-red-700 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
              <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-900">Delete Account</h3>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              {deleteStep === 'confirm' ? (
                <>
                  <p className="text-gray-700 mb-4">This will permanently delete your account, favorites, saved searches, and all history.</p>
                  <Field label="Password" icon={Lock}>
                    <input type="password" value={deleteForm.password} onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })} className={inputCls} />
                  </Field>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
                    <button onClick={requestDeleteOtp} disabled={sending} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center gap-2">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">Enter the verification code sent to your email.</p>
                  <Field label="Verification Code" icon={KeyRound}>
                    <input type="text" value={deleteForm.otp} onChange={(e) => setDeleteForm({ ...deleteForm, otp: e.target.value })} placeholder="000000" maxLength={6} className={inputCls + ' tracking-widest text-center text-2xl font-bold'} />
                  </Field>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setDeleteStep('confirm')} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Back</button>
                    <button onClick={handleDelete} disabled={deleting || deleteForm.otp.length < 6} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center gap-2">
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Forever
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Shared ────────────────────────────────────────────────────────────────────
const inputCls = 'w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors';

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />}
      {children}
    </div>
  </div>
);

const NotifToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" className="sr-only peer" checked={!!checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
    </label>
  </div>
);

const Toast = ({ message, type }) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
    {type === 'success' ? <Check className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
    <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
  </div>
);

export default UserSettings;