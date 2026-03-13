// src/pages/agent/AgentProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import AgentDetail from '../main/pageDetail/AgentDetails';
import { fetchProfile, updateProfile, uploadAvatar } from '../../api/agents/profile';
import {
  ArrowLeft, ArrowRight, Check, User, Briefcase, MapPin,
  Globe, Award, Clock, Eye, Camera, Mail, Phone, Building2,
  Shield, Facebook, Instagram, Linkedin, Twitter, Plus,
  Trash2, AlertTriangle, AlertCircle, Loader2, CheckCircle, X,
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────

const REGIONS = [
  'Littoral','Centre','Nord','Adamaoua','Est',
  'Extrême-Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest',
];
const SPECIALIZATIONS = ['Residential','Commercial','Luxury','Land','Investment','Rental','Industrial'];
const LANGUAGES       = ['French','English','Fulfulde','Ewondo','Duala','Spanish','Arabic','German'];
const DAYS            = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: '09:00', close: '18:00', enabled: !['saturday','sunday'].includes(d) }])
);

const STEPS = [
  { number: 1, title: 'Personal',     icon: User      },
  { number: 2, title: 'Professional', icon: Briefcase },
  { number: 3, title: 'Location',     icon: MapPin    },
  { number: 4, title: 'Online',       icon: Globe     },
  { number: 5, title: 'Schedule',     icon: Clock     },
  { number: 6, title: 'Review',       icon: Eye       },
];

// ─── Tiny helpers ──────────────────────────────────────────────────────────

const fc = (err, extra = '') =>
  [
    extra,
    'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm',
    err ? 'border-red-400 bg-red-50' : 'border-gray-200',
  ].filter(Boolean).join(' ');

const Err = ({ msg }) =>
  msg ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}
    </p>
  ) : null;

// ─── Main ──────────────────────────────────────────────────────────────────

export default function AgentProfile() {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [step, setStep]                       = useState(1);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loadError, setLoadError]             = useState('');
  const [apiError, setApiError]               = useState('');
  const [saved, setSaved]                     = useState(false);
  const [avatarPreview, setAvatarPreview]     = useState(null);
  const [showPreview, setShowPreview]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [stats, setStats]                     = useState(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', whatsapp: '', avatar_url: '',
    company: '', position: '', licenseNumber: '', yearsExperience: '',
    specialization: [], bio: '', languages: [],
    address: '', city: '', region: '',
    website: '', facebook: '', twitter: '', instagram: '', linkedin: '',
    certifications: [],
    workingHours: DEFAULT_HOURS,
  });

  // ── load ──────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const data = await fetchProfile();
      const meta = data.profile_meta ? JSON.parse(data.profile_meta) : {};
      const [fn, ...rest] = (data.name || '').split(' ');
      setForm({
        firstName:       fn || '',
        lastName:        rest.join(' ') || '',
        email:           data.email || '',
        phone:           data.phone || '',
        whatsapp:        meta.whatsapp || '',
        avatar_url:      data.avatar_url || '',
        company:         data.agency_name || '',
        position:        meta.position || '',
        licenseNumber:   data.license_number || '',
        yearsExperience: data.years_experience || '',
        specialization:  meta.specialization || [],
        bio:             data.bio || '',
        languages:       meta.languages || [],
        address:         meta.address || '',
        city:            data.city || '',
        region:          meta.region || '',
        website:         meta.website || '',
        facebook:        meta.facebook || '',
        twitter:         meta.twitter || '',
        instagram:       meta.instagram || '',
        linkedin:        meta.linkedin || '',
        certifications:  meta.certifications || [],
        workingHours:    meta.workingHours || DEFAULT_HOURS,
      });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setLoadError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── field helpers ─────────────────────────────────────────────────────────

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const toggle = (field, val) =>
    setForm(p => ({
      ...p,
      [field]: p[field].includes(val)
        ? p[field].filter(x => x !== val)
        : [...p[field], val],
    }));

  // ── avatar ────────────────────────────────────────────────────────────────

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input immediately so re-clicking works and it won't re-fire
    e.target.value = '';
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    setApiError('');
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await uploadAvatar(fd);
      if (res?.avatar_url) setForm(p => ({ ...p, avatar_url: res.avatar_url }));
    } catch (err) {
      setApiError('Avatar upload failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── validation per step ───────────────────────────────────────────────────

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name is required';
      if (!form.lastName.trim())  e.lastName  = 'Last name is required';
      if (!form.email.trim())     e.email     = 'Email is required';
      if (!form.phone.trim())     e.phone     = 'Phone is required';
    }
    if (s === 2) {
      if (!form.company.trim()) e.company = 'Agency / company is required';
      if (!form.bio.trim())     e.bio     = 'A bio helps clients trust you';
      if (form.specialization.length === 0) e.specialization = 'Select at least one specialization';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validate(step)) {
      setApiError('');
      setStep(p => Math.min(p + 1, 6));
      window.scrollTo(0, 0);
    }
  };
  const prevStep = () => {
    setApiError('');
    setStep(p => Math.max(p - 1, 1));
    window.scrollTo(0, 0);
  };

  // ── save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate(step)) return;
    setSaving(true); setApiError('');
    try {
      const meta = {
        whatsapp: form.whatsapp, position: form.position,
        specialization: form.specialization, languages: form.languages,
        address: form.address, region: form.region,
        website: form.website, facebook: form.facebook,
        twitter: form.twitter, instagram: form.instagram, linkedin: form.linkedin,
        certifications: form.certifications,
        workingHours: form.workingHours,
      };
      await updateProfile({
        name:             `${form.firstName} ${form.lastName}`.trim(),
        phone:            form.phone,
        bio:              form.bio,
        agency_name:      form.company,
        license_number:   form.licenseNumber,
        years_experience: form.yearsExperience,
        city:             form.city,
        profile_meta:     JSON.stringify(meta),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setApiError(err?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── certifications ────────────────────────────────────────────────────────

  const addCert    = () => setForm(p => ({ ...p, certifications: [...p.certifications, { id: Date.now(), name: '', year: String(new Date().getFullYear()) }] }));
  const removeCert = (id) => setForm(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== id) }));
  const setCert    = (id, field, val) => setForm(p => ({ ...p, certifications: p.certifications.map(c => c.id === id ? { ...c, [field]: val } : c) }));

  // ── working hours ─────────────────────────────────────────────────────────

  const setHours = (day, field, val) =>
    setForm(p => ({ ...p, workingHours: { ...p.workingHours, [day]: { ...p.workingHours[day], [field]: val } } }));

  // ── preview agent shape — matches AgentDetail props ───────────────────────

  const previewAgent = {
    id:        'preview',
    name:      [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Your Name',
    company:   form.company || 'Your Agency',
    specialty: form.specialization[0] || 'Real Estate',
    location:  [form.city, form.region].filter(Boolean).join(', ') || 'Douala, Cameroon',
    image:     avatarPreview || form.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent([form.firstName, form.lastName].filter(Boolean).join('+') || 'Agent')}&size=200&background=f59e0b&color=fff`,
    rating:    5.0,
    reviews:   0,
    sales:     stats?.active_listings || 0,
    verified:  true,
    phone:     form.phone,
    email:     form.email,
    languages: form.languages.length ? form.languages : ['French'],
    bio:       form.bio,
  };

  // ── step content ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      // ── STEP 1: Personal ─────────────────────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-gray-500 mt-1 text-sm">Your contact details visible to clients</p>
          </div>

          {/* Avatar upload */}
          <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="relative flex-shrink-0">
              <img
                src={
                  avatarPreview || form.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    [form.firstName, form.lastName].filter(Boolean).join('+') || 'Agent'
                  )}&size=200&background=f59e0b&color=fff`
                }
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow"
              />
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                <Camera className="w-4 h-4" />
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-2">Square image, min 400×400px · Max 5 MB</p>
              <p className="text-xs text-gray-400">JPG, PNG, or WEBP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="Jean" className={fc(errors.firstName)} />
              <Err msg={errors.firstName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="Dupont" className={fc(errors.lastName)} />
              <Err msg={errors.lastName} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@agency.cm" className={fc(errors.email, 'pl-10')} />
            </div>
            <Err msg={errors.email} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+237 6 XX XX XX XX" className={fc(errors.phone, 'pl-10')} />
              </div>
              <Err msg={errors.phone} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="Leave blank if same as phone" className={fc('', 'pl-10')} />
              </div>
            </div>
          </div>
        </div>
      );

      // ── STEP 2: Professional ──────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
            <p className="text-gray-500 mt-1 text-sm">Credentials and expertise shown to clients</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency / Company *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.company} onChange={e => set('company', e.target.value)}
                  placeholder="Your Agency Name" className={fc(errors.company, 'pl-10')} />
              </div>
              <Err msg={errors.company} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input value={form.position} onChange={e => set('position', e.target.value)}
                placeholder="Senior Real Estate Agent" className={fc()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)}
                  placeholder="RE-2024-XXXXXX" className={fc('', 'pl-10')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input type="number" min="0" max="60" value={form.yearsExperience}
                onChange={e => set('yearsExperience', e.target.value)}
                placeholder="e.g. 8" className={fc()} />
            </div>
          </div>

          {/* Specialization grid — same style as amenities in AddProperty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Specialization *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SPECIALIZATIONS.map(s => {
                const on = form.specialization.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggle('specialization', s)}
                    className={`p-4 border-2 rounded-xl transition-all relative ${
                      on ? 'border-amber-600 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    {on && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <p className={`text-sm font-semibold text-center ${on ? 'text-amber-700' : 'text-gray-600'}`}>{s}</p>
                  </button>
                );
              })}
            </div>
            <Err msg={errors.specialization} />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio *</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={5}
              placeholder="Tell clients about your experience, what areas you cover, and what makes you different…"
              className={fc(errors.bio)} />
            <div className="flex items-start justify-between mt-1">
              <Err msg={errors.bio} />
              <p className="text-xs text-gray-400 ml-auto">{form.bio.length} chars · aim 100–300</p>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => {
                const on = form.languages.includes(l);
                return (
                  <button key={l} type="button" onClick={() => toggle('languages', l)}
                    className={`px-4 py-2 border-2 rounded-xl font-medium text-sm transition-all ${
                      on ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}>{l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Certifications & Awards</label>
            <div className="space-y-3">
              {form.certifications.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  No certifications yet
                </div>
              )}
              {form.certifications.map(cert => (
                <div key={cert.id} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                  <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <input value={cert.name} onChange={e => setCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification name"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white" />
                  <input value={cert.year} onChange={e => setCert(cert.id, 'year', e.target.value)}
                    placeholder="Year"
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white" />
                  <button type="button" onClick={() => removeCert(cert.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addCert}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm px-3 py-2 hover:bg-amber-50 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>
          </div>
        </div>
      );

      // ── STEP 3: Location ──────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Location</h2>
            <p className="text-gray-500 mt-1 text-sm">Where you operate — shown on your profile</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="e.g., Rue 1.234, Bonamoussadi" className={fc()} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Douala" className={fc()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className={fc()}>
                <option value="">Select region…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            Your location helps clients find agents operating in their area.
          </div>
        </div>
      );

      // ── STEP 4: Online ────────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Online Presence</h2>
            <p className="text-gray-500 mt-1 text-sm">Links shown on your public profile</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                placeholder="https://yourwebsite.com" className={fc('', 'pl-10')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { field: 'facebook',  Icon: Facebook,  ph: 'https://facebook.com/yourpage'    },
              { field: 'instagram', Icon: Instagram, ph: 'https://instagram.com/yourhandle' },
              { field: 'twitter',   Icon: Twitter,   ph: 'https://twitter.com/yourhandle'   },
              { field: 'linkedin',  Icon: Linkedin,  ph: 'https://linkedin.com/in/your'     },
            ].map(({ field, Icon, ph }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="url" value={form[field]} onChange={e => set(field, e.target.value)}
                    placeholder={ph} className={fc('', 'pl-10')} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            Social links help clients verify your identity and build trust before they reach out.
          </div>
        </div>
      );

      // ── STEP 5: Schedule ──────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
            <p className="text-gray-500 mt-1 text-sm">Let clients know when you're available</p>
          </div>

          <div className="space-y-2">
            {DAYS.map(day => {
              const h = form.workingHours[day] || { open: '09:00', close: '18:00', enabled: false };
              return (
                <div key={day} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                  h.enabled ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  <label className="flex items-center gap-2.5 w-36 cursor-pointer">
                    <input type="checkbox" checked={h.enabled}
                      onChange={e => setHours(day, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500" />
                    <span className={`text-sm font-medium capitalize ${h.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {day}
                    </span>
                  </label>
                  {h.enabled ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input type="time" value={h.open}
                        onChange={e => setHours(day, 'open', e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-white" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={h.close}
                        onChange={e => setHours(day, 'close', e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-white" />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

      // ── STEP 6: Review & Save ─────────────────────────────────────────────
      case 6: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review & Save</h2>
            <p className="text-gray-500 mt-1 text-sm">Check everything before publishing your profile</p>
          </div>

          {/* Preview CTA — same pattern as Step 5 in AddProperty */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Preview Your Public Profile</p>
                <p className="text-sm text-amber-700">See exactly how clients will see your profile page.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowPreview(true)}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
              <Eye className="w-5 h-5" /> Preview Profile
            </button>
          </div>

          {/* Summary grid */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Name',           value: [form.firstName, form.lastName].filter(Boolean).join(' ') || '—' },
                { label: 'Email',          value: form.email || '—' },
                { label: 'Phone',          value: form.phone || '—' },
                { label: 'Agency',         value: form.company || '—' },
                { label: 'Position',       value: form.position || '—' },
                { label: 'Specialization', value: form.specialization.join(', ') || '—' },
                { label: 'Languages',      value: form.languages.join(', ') || '—' },
                { label: 'Location',       value: [form.city, form.region].filter(Boolean).join(', ') || '—' },
                { label: 'Certifications', value: `${form.certifications.filter(c => c.name).length} added` },
                { label: 'Working Days',   value: `${DAYS.filter(d => form.workingHours[d]?.enabled).length} days` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="text-gray-800 font-medium text-sm truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
            <strong>Ready to save?</strong> Your profile will be visible to clients on the Find an Agent page.
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── loading / error ───────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your profile…</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{loadError}</p>
        <button onClick={load}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-amber-600 text-white rounded-xl font-semibold">
          Retry
        </button>
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-400 mt-1 text-sm">Update your professional profile visible to clients</p>
        </div>

        {/* Error banner */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700 flex-1">{apiError}</p>
            <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Saved banner */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-700">Profile saved successfully!</p>
          </div>
        )}

        {/* Step indicators — identical pattern to AddProperty */}
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="flex items-center min-w-max md:min-w-0">
            {STEPS.map((s, i) => {
              const Icon      = s.icon;
              const active    = step === s.number;
              const completed = step > s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      completed ? 'bg-green-500 border-green-500' :
                      active    ? 'bg-amber-600 border-amber-600' :
                                  'bg-white border-gray-200'
                    }`}>
                      {completed
                        ? <Check className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-300'}`} />}
                    </div>
                    <span className={`text-xs mt-2 font-medium whitespace-nowrap ${
                      active ? 'text-amber-600' : 'text-gray-400'
                    }`}>{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      completed ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Prev / Next nav — identical to AddProperty */}
        <div className="flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {step < 6 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Check className="w-4 h-4" /> Save Profile</>}
            </button>
          )}
        </div>
      </div>

      {/* Preview modal — the REAL AgentDetail component, exactly as clients see it */}
      {showPreview && (
        <AgentDetail
          agent={previewAgent}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}