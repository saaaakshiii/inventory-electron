import { useState } from 'react';
import { Eye, EyeOff, BookOpen, Lock, Mail, ShieldCheck, Phone } from 'lucide-react';
import type { User, UserRole } from '../types';
import {login} from '../services/auth';

interface LoginProps {
  onLogin: (user: User) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  operator: 'Operator',
  viewer: 'Viewer',
};

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isOperator = role === 'operator';

  function handleRoleChange(newRole : UserRole){
    setRole(newRole);
    setIdentifier('');
    setPassword('');
    setError('');
  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(role, identifier.trim(), password);

      const user: User = {
        id: result.subject,
        name: identifier.trim(),
        email: isOperator ? '' : identifier.trim(),
        role: result.role,
        status: 'active',
        lastLogin: new Date().toLocaleDateString(),
        createdDate: '',
      };

      const storage = remember ? localStorage : sessionStorage;

      storage.setItem('access_token', result.access_token);
      storage.setItem('refresh_token', result.refresh_token);
      storage.setItem('user_role', result.role);
      storage.setItem('user_subject', result.subject);

      onLogin(user);
    } catch (err) {
        setError(
          err instanceof Error
          ? err.message
          : 'Invalid credentials. Please try again.',
        );
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <BookOpen className="w-10 h-10 text-blue-700" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Stock Pilot
          </h1>

          <p className="text-blue-200 text-sm mt-1">
            Inventory Management System
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-300 text-xs">
              Secure Administrative Portal
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-blue-700 px-6 py-3">
            <p className="text-blue-100 text-xs text-center font-medium tracking-wide uppercase">
              Authorised Personnel Only
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Sign In
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Login As
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    handleRoleChange(e.target.value as UserRole)
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map(
                    (roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {ROLE_LABELS[roleOption]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Email / Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {isOperator ? 'Phone Number' : 'College Email'}
                </label>

                <div className="relative">
                  {isOperator ? (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  )}

                  <input
                    type={isOperator ? 'tel' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      isOperator
                        ? '+919876543210'
                        : 'username@college.edu'
                    }
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-blue-700 rounded"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition text-sm shadow-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © 2026 Stock Pilot · All rights reserved
        </p>
      </div>
    </div>
  );
}