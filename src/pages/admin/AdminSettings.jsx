import { useState } from 'react';
import {
  Settings, Building2, UserCheck, Users, Bell, Globe, Shield,
  Save, AlertTriangle, Info, ChevronRight, CheckCircle
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';

/* ─── Helpers ─────────────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none ${value ? 'bg-zinc-900' : 'bg-zinc-200'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const Row = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-6 py-4 border-b border-zinc-100 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-zinc-800">{label}</p>
      {description && <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const NumField = ({ value, onChange, min, max, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(Number(e.target.value))}
      className="w-16 border border-zinc-200 rounded-lg px-2 py-1.5 text-sm text-zinc-800 text-center focus:outline-none focus:border-zinc-400 transition-colors"
    />
    {suffix && <span className="text-xs text-zinc-400">{suffix}</span>}
  </div>
);

const TextField = ({ value, onChange, width = 'w-48' }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`${width} border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors`}
  />
);

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-zinc-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-900">{title}</p>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5">{children}</div>
  </div>
);

/* ─── Main ─────────────────────────────────────────────────── */
export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [s, setS] = useState({
    // Listings
    requireApproval: true,
    minPhotos: 4,
    maxPhotos: 25,
    listingExpiryDays: 90,
    maxListingsUser: 3,
    maxListingsAgent: 50,
    allowCommercial: true,
    allowLand: true,
    allowUserListings: true,

    // Agents
    requireVerification: true,
    requireLicense: true,
    requireAgencyProof: false,
    trialListings: 5,

    // Users
    requireEmailVerification: true,
    requirePhoneVerification: false,
    autoBlockThreshold: 5,
    allowNewRegistrations: true,

    // Notifications
    notifyNewListing: true,
    notifyNewAgent: true,
    notifyNewReport: true,
    notifyFraudAlert: true,
    adminEmail: 'admin@propty.cm',

    // Platform
    platformName: 'Propty Cameroon',
    supportEmail: 'support@propty.cm',
    currency: 'XAF',
    maintenanceMode: false,
  });

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminNav>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Configure platform rules, limits, and behavior.</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-5">

          <Section icon={Building2} title="Listing Rules" subtitle="Control how listings are submitted and managed">
            <Row label="Require Manual Approval" description="All new listings must be reviewed before they go live.">
              <Toggle value={s.requireApproval} onChange={v => set('requireApproval', v)} />
            </Row>
            <Row label="Minimum Photos" description="Listings below this will be auto-rejected.">
              <NumField value={s.minPhotos} onChange={v => set('minPhotos', v)} min={1} max={10} suffix="photos" />
            </Row>
            <Row label="Maximum Photos">
              <NumField value={s.maxPhotos} onChange={v => set('maxPhotos', v)} min={5} max={50} suffix="photos" />
            </Row>
            <Row label="Listing Expiry" description="Listings auto-unpublished after this period.">
              <NumField value={s.listingExpiryDays} onChange={v => set('listingExpiryDays', v)} min={7} max={365} suffix="days" />
            </Row>
            <Row label="Max Listings per Regular User">
              <NumField value={s.maxListingsUser} onChange={v => set('maxListingsUser', v)} min={1} max={20} />
            </Row>
            <Row label="Max Listings per Agent">
              <NumField value={s.maxListingsAgent} onChange={v => set('maxListingsAgent', v)} min={5} max={500} />
            </Row>
            <Row label="Allow Commercial Listings">
              <Toggle value={s.allowCommercial} onChange={v => set('allowCommercial', v)} />
            </Row>
            <Row label="Allow Land Listings">
              <Toggle value={s.allowLand} onChange={v => set('allowLand', v)} />
            </Row>
            <Row label="Allow Regular Users to List" description="Disable so only verified agents can publish.">
              <Toggle value={s.allowUserListings} onChange={v => set('allowUserListings', v)} />
            </Row>
          </Section>

          <Section icon={UserCheck} title="Agent Verification" subtitle="Requirements for new agent applications">
            <Row label="Require Verification Before Publishing" description="Agents must be verified before their listings go live.">
              <Toggle value={s.requireVerification} onChange={v => set('requireVerification', v)} />
            </Row>
            <Row label="Professional License Required">
              <Toggle value={s.requireLicense} onChange={v => set('requireLicense', v)} />
            </Row>
            <Row label="Agency Registration Required" description="Required for non-solo agents.">
              <Toggle value={s.requireAgencyProof} onChange={v => set('requireAgencyProof', v)} />
            </Row>
            <Row label="Trial Listings Before Verification" description="Max listings an agent can post before their account is verified.">
              <NumField value={s.trialListings} onChange={v => set('trialListings', v)} min={0} max={20} />
            </Row>
          </Section>

          <Section icon={Users} title="User Rules" subtitle="Registration and behavior settings">
            <Row label="Email Verification Required" description="Users must confirm email before posting or messaging.">
              <Toggle value={s.requireEmailVerification} onChange={v => set('requireEmailVerification', v)} />
            </Row>
            <Row label="Phone Verification Required">
              <Toggle value={s.requirePhoneVerification} onChange={v => set('requirePhoneVerification', v)} />
            </Row>
            <Row label="Auto-Block Threshold" description="User is auto-blocked when they reach this many verified reports.">
              <NumField value={s.autoBlockThreshold} onChange={v => set('autoBlockThreshold', v)} min={1} max={20} suffix="reports" />
            </Row>
            <Row label="Open Registration" description="Disable to stop new sign-ups temporarily.">
              <Toggle value={s.allowNewRegistrations} onChange={v => set('allowNewRegistrations', v)} />
            </Row>
          </Section>

          <Section icon={Bell} title="Admin Notifications" subtitle="Email alerts sent to the admin team">
            <Row label="New Listing Submitted">
              <Toggle value={s.notifyNewListing} onChange={v => set('notifyNewListing', v)} />
            </Row>
            <Row label="New Agent Application">
              <Toggle value={s.notifyNewAgent} onChange={v => set('notifyNewAgent', v)} />
            </Row>
            <Row label="New Report Filed">
              <Toggle value={s.notifyNewReport} onChange={v => set('notifyNewReport', v)} />
            </Row>
            <Row label="Fraud Alert (high priority)">
              <Toggle value={s.notifyFraudAlert} onChange={v => set('notifyFraudAlert', v)} />
            </Row>
            <Row label="Admin Notification Email">
              <TextField value={s.adminEmail} onChange={v => set('adminEmail', v)} />
            </Row>
          </Section>

          <Section icon={Globe} title="Platform" subtitle="General platform configuration">
            <Row label="Platform Name">
              <TextField value={s.platformName} onChange={v => set('platformName', v)} />
            </Row>
            <Row label="Support Email">
              <TextField value={s.supportEmail} onChange={v => set('supportEmail', v)} />
            </Row>
            <Row label="Currency Code">
              <TextField value={s.currency} onChange={v => set('currency', v)} width="w-20" />
            </Row>
            <Row label="Maintenance Mode" description="Only admins can access the platform while this is on.">
              <Toggle value={s.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
            </Row>
          </Section>

          {/* Danger Zone */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Danger Zone</p>
                <p className="text-xs text-zinc-400">Irreversible actions. Use with extreme caution.</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-2">
              {[
                { label: 'Clear all expired listings', desc: 'Permanently remove all listings past their expiry date.' },
                { label: 'Export all user data', desc: 'Download a full CSV export of all registered users.' },
                { label: 'Reset platform data', desc: 'Wipe all listing and user data. Cannot be undone.' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3 border-b border-zinc-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">{label}</p>
                    <p className="text-xs text-zinc-400">{desc}</p>
                  </div>
                  <button className="flex-shrink-0 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    Run
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pb-8">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'All Saved!' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </AdminNav>
  );
}