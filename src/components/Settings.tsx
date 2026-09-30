import { Settings as SettingsIcon, Bell, Shield, Database, Building2 } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {[
          {
            icon: <Building2 className="w-5 h-5 text-blue-700" />,
            title: 'Institution Information',
            fields: [
              { label: 'Institution Name', value: 'Stock Pilot', type: 'text' },
              { label: 'Department', value: 'Inventory Management', type: 'text' },
              { label: 'Academic Year', value: '2026-27', type: 'text' },
              { label: 'Contact Email', value: 'inventory@college.edu', type: 'email' },
            ],
          },
          {
            icon: <Bell className="w-5 h-5 text-amber-600" />,
            title: 'Notifications',
            fields: [],
            toggles: [
              { label: 'Email Notifications', sub: 'Send daily summary reports via email', on: false },
              { label: 'Out of Stock Alerts', sub: 'Immediate alert when stock reaches zero', on: true },
            ],
          },
          {
            icon: <Shield className="w-5 h-5 text-emerald-600" />,
            title: 'Security & Access',
            fields: [],
            toggles: [
              { label: 'Audit Logging', sub: 'Log all user actions for accountability', on: true },
              { label: 'Two-Factor Authentication', sub: 'Require OTP for admin logins', on: false },
              { label: 'Session Timeout', sub: 'Automatically logout after 30 minutes of inactivity', on: true },
            ],
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-slate-100 p-2 rounded-lg">{section.icon}</div>
              <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
            </div>
            {section.fields && section.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {section.fields.map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
            {section.toggles && (
              <div className="space-y-3">
                {section.toggles.map(t => (
                  <div key={t.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.sub}</p>
                    </div>
                    <button
                      className={`w-11 h-6 rounded-full transition-colors ${t.on ? 'bg-blue-700' : 'bg-slate-200'}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-1 ${t.on ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {section.fields && section.fields.length > 0 && (
              <div className="mt-4">
                <button className="px-4 py-2 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg transition shadow-sm">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
