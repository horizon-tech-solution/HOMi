import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, CheckCircle, Home, Users, Landmark,
  Upload, AlertCircle, Info, Loader2
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import Alert from '../../components/Alert';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('user_token'))?.token; }
  catch { return null; }
};

const INITIAL_FORM = {
  professionalType: '',
  businessName: '',
  taxId: '',
  licenseNumber: '',
  yearsExperience: '',
  officeAddress: '',
  phoneNumber: '',
  region: '',
  city: '',
  idDocument: null,
  landTitleCertificate: null,
  licenseDocument: null,
  businessRegistration: null,
  notaryName: '',
  notaryContact: '',
  termsAccepted: false,
};

const REGIONS = [
  'Adamawa','Centre','East','Far North','Littoral',
  'North','Northwest','West','South','Southwest',
];

const PROFESSIONAL_TYPES = [
  { id: 'landlord',   label: 'Landlord',          icon: Home,     desc: 'I own properties and want to rent them out'   },
  { id: 'agent',      label: 'Real Estate Agent',  icon: Users,    desc: 'I help people buy, sell, or rent properties' },
  { id: 'landSeller', label: 'Land Seller',         icon: Landmark, desc: 'I sell land or vacant properties'            },
];

const STEPS = ['Select type', 'Business details', 'Upload documents', 'Review & submit'];

export default function BecomeAgent() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const total = STEPS.length;

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFile = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showAlert('File must be under 5MB'); return; }
    set(field, file);
  };

  const validate = () => {
    if (step === 1 && !form.professionalType) {
      showAlert('Please select your professional type'); return false;
    }
    if (step === 2) {
      if (!form.businessName)  { showAlert('Business name is required'); return false; }
      if (!form.taxId)         { showAlert('Tax ID (NUI) is required'); return false; }
      if (!form.phoneNumber)   { showAlert('Phone number is required'); return false; }
      if (!form.officeAddress) { showAlert('Office address is required'); return false; }
    }
    if (step === 3) {
      if (!form.idDocument)           { showAlert('Government ID is required'); return false; }
      if (!form.landTitleCertificate) { showAlert('Land Title Certificate is required'); return false; }
      if (form.professionalType === 'agent' && !form.licenseDocument) {
        showAlert('Professional license is required for agents'); return false;
      }
    }
    if (step === 4 && !form.termsAccepted) {
      showAlert('Please accept the terms and conditions'); return false;
    }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (step < total) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else submit();
  };

  const back = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const submit = async () => {
    setLoading(true);
    try {
      const body = {
        professional_type: form.professionalType,
        business_name:     form.businessName,
        tax_id:            form.taxId,
        license_number:    form.licenseNumber   || null,
        years_experience:  form.yearsExperience || null,
        office_address:    form.officeAddress,
        phone_number:      form.phoneNumber,
        region:            form.region          || null,
        city:              form.city            || null,
        notary_name:       form.notaryName      || null,
        notary_contact:    form.notaryContact   || null,
      };

      const res  = await fetch(`${BASE_URL}/user/professional/apply`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      const applicationId = data.id;

      const docs = [
        { field: 'idDocument',           type: 'id'           },
        { field: 'landTitleCertificate', type: 'land_title'   },
        { field: 'licenseDocument',      type: 'license'      },
        { field: 'businessRegistration', type: 'business_reg' },
      ];

      for (const { field, type } of docs) {
        if (!form[field]) continue;
        const fd = new FormData();
        fd.append('document', form[field]);
        fd.append('type', type);
        await fetch(`${BASE_URL}/user/professional/${applicationId}/upload`, {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body:    fd,
        });
      }

      showAlert("Application submitted! We'll review within 1-3 business days.", 'success');
      setTimeout(() => navigate('/user/home'), 2500);

    } catch (err) {
      showAlert(err.message || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Become a Professional</h1>
          <p className="text-gray-500 mt-1">Upgrade your account to list properties and connect with buyers</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${step > i + 1 ? 'bg-amber-600 border-amber-600 text-white'
                  : step === i + 1 ? 'border-amber-600 text-amber-600 bg-white'
                  : 'border-gray-300 text-gray-400 bg-white'}`}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step === i + 1 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">What type of professional are you?</h2>
              <p className="text-gray-500 text-sm mb-6">This determines what features you get access to.</p>
              <div className="space-y-3">
                {PROFESSIONAL_TYPES.map(({ id, label, icon: Icon, desc }) => (
                  <button key={id} onClick={() => set('professionalType', id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                      ${form.professionalType === id
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`p-2.5 rounded-lg ${form.professionalType === id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-sm text-gray-500 truncate">{desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                      ${form.professionalType === id ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
                      {form.professionalType === id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">You'll need to provide business details and verification documents. Takes about 5–10 minutes.</p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
                <p className="text-gray-500 text-sm">All fields marked * are required.</p>
              </div>

              <Field label="Business Name *">
                <input type="text" value={form.businessName} onChange={e => set('businessName', e.target.value)}
                  placeholder="Your business or company name" className={cls} />
              </Field>

              <Field label="Tax ID (NUI) *" hint="Taxpayer Identification Number from Cameroon tax authorities">
                <input type="text" value={form.taxId} onChange={e => set('taxId', e.target.value)}
                  placeholder="e.g. M012345678901A" className={cls} />
              </Field>

              <Field label="Phone Number *">
                <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)}
                  placeholder="+237 6XX XXX XXX" className={cls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Region">
                  <select value={form.region} onChange={e => set('region', e.target.value)} className={cls + ' bg-white'}>
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="City">
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Douala" className={cls} />
                </Field>
              </div>

              <Field label="Office Address *">
                <textarea value={form.officeAddress} onChange={e => set('officeAddress', e.target.value)}
                  placeholder="Full address including street, neighborhood" rows={3}
                  className={cls + ' resize-none'} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={`License Number${form.professionalType === 'agent' ? ' *' : ' (optional)'}`}>
                  <input type="text" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)}
                    placeholder="License #" className={cls} />
                </Field>
                <Field label="Years of Experience">
                  <select value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} className={cls + ' bg-white'}>
                    <option value="">Select</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5-10">5–10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </Field>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">All information is verified with Cameroon authorities to protect buyers and maintain platform trust.</p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
                <p className="text-gray-500 text-sm">Documents are verified with the MINDCAF registry.</p>
              </div>

              <FileUpload id="id-doc"   label="Government ID *"
                desc="Passport, Driver's License, or National ID"
                file={form.idDocument} onChange={f => handleFile('idDocument', f)} />

              <FileUpload id="land-doc" label="Land Title Certificate (Titre Foncier) *"
                desc="Official land title issued by MINDCAF"
                file={form.landTitleCertificate} onChange={f => handleFile('landTitleCertificate', f)}
                highlight />

              {form.professionalType === 'agent' && (
                <FileUpload id="lic-doc" label="Professional License *"
                  desc="Real estate agent license"
                  file={form.licenseDocument} onChange={f => handleFile('licenseDocument', f)} />
              )}

              <FileUpload id="biz-doc" label="Business Registration (optional)"
                desc="Business or company certificate"
                file={form.businessRegistration} onChange={f => handleFile('businessRegistration', f)} />
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
                <p className="text-gray-500 text-sm">Double-check your information before submitting.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-2.5">
                <p className="text-sm font-bold text-gray-700 mb-3">Application Summary</p>
                <SummaryRow label="Type"         value={form.professionalType} />
                <SummaryRow label="Business"     value={form.businessName} />
                <SummaryRow label="Tax ID"       value={form.taxId} />
                <SummaryRow label="Phone"        value={form.phoneNumber} />
                <SummaryRow label="Location"     value={[form.city, form.region].filter(Boolean).join(', ')} />
                <SummaryRow label="ID Document"  value={form.idDocument?.name} />
                <SummaryRow label="Land Title"   value={form.landTitleCertificate?.name} />
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <p className="text-sm font-bold text-gray-700">Notary Reference <span className="font-normal text-gray-400">(optional but recommended)</span></p>
                <input type="text" value={form.notaryName} onChange={e => set('notaryName', e.target.value)}
                  placeholder="Notary full name" className={cls} />
                <input type="tel" value={form.notaryContact} onChange={e => set('notaryContact', e.target.value)}
                  placeholder="+237 6XX XXX XXX" className={cls} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-100 rounded-xl p-4">
                <input type="checkbox" checked={form.termsAccepted} onChange={e => set('termsAccepted', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-600" />
                <span className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-amber-600 font-semibold underline">Terms of Service</a> and <a href="#" className="text-amber-600 font-semibold underline">Privacy Policy</a>. I understand my information will be verified with MINDCAF and relevant Cameroonian authorities.
                </span>
              </label>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">What happens next?</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Documents reviewed within 1–3 business days</li>
                  <li>✓ Land Title verified with MINDCAF registry</li>
                  <li>✓ Email confirmation sent once approved</li>
                  <li>✓ Start listing properties immediately after approval</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={back}
                className="flex-1 py-3 px-5 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button onClick={next} disabled={loading}
              className={`py-3 px-5 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${step === 1 ? 'w-full' : 'flex-1'}`}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : <>{step === total ? 'Submit Application' : 'Continue'} {step < total && <ArrowRight className="w-4 h-4" />}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const cls = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all text-sm';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 capitalize text-right max-w-xs truncate">{value}</span>
    </div>
  );
}

function FileUpload({ id, label, desc, file, onChange, highlight = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all
        ${file ? 'border-green-400 bg-green-50'
        : highlight ? 'border-amber-300 bg-amber-50'
        : 'border-gray-200 hover:border-gray-300'}`}>
        <input type="file" id={id} accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => onChange(e.target.files[0])} className="hidden" />
        <label htmlFor={id} className="cursor-pointer block">
          {file ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-gray-600">Click to upload</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              <p className="text-xs text-gray-300 mt-0.5">PDF, JPG or PNG — max 5MB</p>
            </>
          )}
        </label>
      </div>
    </div>
  );
}