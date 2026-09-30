import { useState } from 'react';
import { Plus, Edit2, UserX, UserCheck, X, Shield, User } from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import type { User as UserType, UserRole } from '../types';

const ROLE_STYLES: Record<UserRole, { bg: string; text: string; label: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Admin' },
  operator: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Data Operator' },
  viewer: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Viewer' },
};

interface UserModalProps {
  user?: UserType;
  onClose: () => void;
  onSave: (data: Partial<UserType>) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'viewer' as UserRole,
    status: user?.status || 'active' as 'active' | 'inactive',
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. Example Name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'name@college.edu' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as 'name' | 'email']}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Administrator</option>
              <option value="operator">Data Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {user && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          {!user && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary Password</label>
              <input type="password" placeholder="Set initial password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-sm"
          >
            {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);

  function handleSave(data: Partial<UserType>) {
    if (editUser) {
      setUsers(u => u.map(usr => usr.id === editUser.id ? { ...usr, ...data } : usr));
    } else {
      setUsers(u => [...u, {
        id: 'u' + Date.now(),
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'viewer',
        status: 'active',
        lastLogin: 'Never',
        createdDate: new Date().toLocaleDateString('en-GB').split('/').join('-'),
      }]);
    }
  }

  function toggleStatus(id: string) {
    setUsers(u => u.map(usr => usr.id === id ? { ...usr, status: usr.status === 'active' ? 'inactive' : 'active' } : usr));
  }

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} users registered</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin','operator','viewer'] as UserRole[]).map(role => {
          const count = users.filter(u => u.role === role).length;
          const cfg = ROLE_STYLES[role];
          return (
            <div key={role} className={`${cfg.bg} rounded-xl p-4 border border-slate-200`}>
              <p className="text-xs font-medium text-slate-500">{cfg.label}s</p>
              <p className={`text-3xl font-bold mono mt-1 ${cfg.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => {
              const cfg = ROLE_STYLES[u.role];
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 mono">{u.lastLogin}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 mono">{u.createdDate}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition ${u.status === 'active' ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showAdd || editUser) && (
        <UserModal
          user={editUser ?? undefined}
          onClose={() => { setShowAdd(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
