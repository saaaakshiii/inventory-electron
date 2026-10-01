import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';
import type { User as UserType, UserRole } from '../types';

const ROLE_STYLES: Record<UserRole, { bg: string; text: string; label: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrator' },
  operator: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Data Operator' },
  viewer: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Viewer' },
};

interface ProfileProps {
  user: UserType;
}

export default function Profile({ user }: ProfileProps) {
  const cfg = ROLE_STYLES[user.role];

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
          <div className="w-24 h-24 bg-blue-700 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <h2 className="text-base font-bold text-slate-800">{user.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
          <span className={`inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Joined {user.createdDate}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Last login {user.lastLogin}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user.name },
              { label: 'Email Address', value: user.email },
              { label: 'Role', value: cfg.label, disabled: true },
              { label: 'Status', value: 'Active', disabled: true },
              { label: 'Employee ID', value: 'EMP-' + user.id.toUpperCase() },
              { label: 'Department', value: 'Inventory Department' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.value}
                  disabled={f.disabled}
                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${f.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <button className="px-5 py-2.5 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-sm transition">
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Change Password</h3>
        <div className="grid grid-cols-3 gap-4">
          {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="px-5 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}