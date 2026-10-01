import { useState } from 'react';
import { Eye, EyeOff, BookOpen, Lock, ShieldCheck, Phone, User as UserIcon } from 'lucide-react';
import type { User } from '../types';
import { signupOperator } from '../services/auth';

interface SignupProps {
  /** Called after a successful signup – App should route to the Operator Dashboard */
  onSignup: (user: User) => void;
  /** Called when the user clicks "Sign in" */
  onBackToLogin: () => void;
}

const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;

export default function Signup({ onSignup, onBackToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Enter a valid phone number with country code, e.g. +919876543210.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signupOperator(cleanName, cleanPhone, password);

      const user: User = {
        id: result.subject,
        name: cleanName,
        email: '',
        role: result.role,
        status: 'active',
        lastLogin: new Date().toLocaleDateString(),
        createdDate: new Date().toLocaleDateString(),
      };

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('access_token', result.access_token);
      storage.setItem('refresh_token', result.refresh_token);
      storage.setItem('user_role', result.role);
      storage.setItem('user_subject', result.subject);

      onSignup(user); // -> Operator Dashboard
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Signup failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

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
              Operator Registration
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Create Account
            </h2>

            <form onSubmit={handleSignup} className="space-y-5">

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className={`${inputBase} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    autoComplete="tel"
                    required
                    className={`${inputBase} pl-10 pr-4`}
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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className={`${inputBase} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className={`${inputBase} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-blue-700 rounded"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>

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
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-blue-700 hover:text-blue-800 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © 2026 Stock Pilot · All rights reserved
        </p>
      </div>
    </div>
  );
}
