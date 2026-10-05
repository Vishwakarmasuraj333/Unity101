'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  UserCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Check,
  Laptop,
} from 'lucide-react';

import Image from 'next/image';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          if (data.admin) {
            setProfile((prev) => ({
              ...prev,
              name: data.admin.name || 'Administrator',
              email: data.admin.email || '',
            }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Real-time password strength calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Not entered', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(profile.new_password);
  const passwordsMatch = profile.new_password && profile.confirm_password && profile.new_password === profile.confirm_password;
  const passwordsMismatch = profile.new_password && profile.confirm_password && profile.new_password !== profile.confirm_password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profile.new_password && profile.new_password !== profile.confirm_password) {
      showToast('error', 'New passwords do not match');
      return;
    }

    if (profile.new_password && profile.new_password.length < 8) {
      showToast('error', 'New password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          current_password: profile.current_password || undefined,
          new_password: profile.new_password || undefined,
          confirm_password: profile.confirm_password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('error', data.message || 'Failed to update profile');
        return;
      }

      showToast('success', data.message || 'Profile and credentials updated successfully.');
      setProfile((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch {
      showToast('error', 'Error connecting to database server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Admin Profile & Security Center">
      <div className="space-y-6 max-w-5xl">
        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-600 shadow-emerald-950/40'
                : 'bg-red-950 text-red-100 border-red-600 shadow-red-950/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Identity & Security Status Card */}
          <div className="space-y-6">
            {/* Profile Identity Card */}
            <div className="bg-gradient-to-br from-[#2f0846] via-[#481268] to-[#5d1785] text-white rounded-2xl p-6 shadow-xl border border-purple-800/50 relative overflow-hidden flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur p-2.5 border-2 border-amber-400/60 shadow-xl shadow-amber-400/10 flex items-center justify-center">
                  <Image
                    src="/images/unity101-logo.png"
                    alt="Unity 101 Admin Profile"
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#2f0846] flex items-center justify-center" title="Online & Authenticated">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif-brand text-white">
                {profile.name || 'System Administrator'}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">{profile.email}</p>

              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold tracking-wider uppercase border border-amber-400/30">
                  Super Administrator
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-semibold border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>Verified</span>
                </span>
              </div>

              {/* Ambient radial glow */}
              <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Security & Session Summary Card */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[#481268] border-b border-slate-100 pb-3">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Security Health</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Password Hash</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                    BCrypt 10 Salt
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 flex items-center space-x-2">
                    <Laptop className="w-3.5 h-3.5 text-blue-600" />
                    <span>Active Session</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    JWT HttpOnly
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Session Lifetime</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    24 Hours
                  </span>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                <p className="font-semibold flex items-center space-x-1 text-purple-950">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Audit Trail Active</span>
                </p>
                <p className="text-purple-700 mt-0.5 text-[10px]">
                  All database modifications and status changes are recorded in the activity log.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Profile & Password Management Form (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 text-[#481268] mb-6 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#481268] flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Account Credentials & Security</h3>
                  <p className="text-xs text-slate-500">Update administrative details and access password</p>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#481268] mb-2" />
                  <span className="text-xs">Loading admin profile details...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  {/* Account Information Section */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5 text-purple-950">
                      <span>1. Administrator Information</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            required
                            placeholder="Administrator Name"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#481268] transition-all text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            required
                            placeholder="admin@unity101events.org"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#481268] transition-all text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center space-x-1.5 text-purple-950">
                      <KeyRound className="w-3.5 h-3.5 text-[#481268]" />
                      <span>2. Authentication & Password Change</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-4">
                      Leave password fields blank if you only want to update your name or email.
                    </p>

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Current Password (Required only if changing password)
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={profile.current_password}
                            onChange={(e) => setProfile({ ...profile, current_password: e.target.value })}
                            placeholder="Enter current password to verify identity"
                            className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#481268] transition-all text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New & Confirm Password Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={profile.new_password}
                              onChange={(e) => setProfile({ ...profile, new_password: e.target.value })}
                              placeholder="Minimum 8 characters"
                              className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#481268] transition-all text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={profile.confirm_password}
                              onChange={(e) => setProfile({ ...profile, confirm_password: e.target.value })}
                              placeholder="Repeat new password"
                              className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none transition-all text-xs ${
                                passwordsMatch
                                  ? 'border-emerald-500 focus:border-emerald-600'
                                  : passwordsMismatch
                                  ? 'border-red-400 focus:border-red-500'
                                  : 'border-slate-300 focus:border-[#481268]'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Strength Visual Meter */}
                      {profile.new_password && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-600">Password Strength:</span>
                            <span className="font-bold text-slate-800">{strength.label}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                              style={{ width: `${strength.score}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-slate-500">
                            <span className={`flex items-center space-x-1 ${profile.new_password.length >= 8 ? 'text-emerald-700 font-bold' : ''}`}>
                              <Check className="w-3 h-3" />
                              <span>8+ Chars</span>
                            </span>
                            <span className={`flex items-center space-x-1 ${/[A-Z]/.test(profile.new_password) ? 'text-emerald-700 font-bold' : ''}`}>
                              <Check className="w-3 h-3" />
                              <span>Uppercase</span>
                            </span>
                            <span className={`flex items-center space-x-1 ${/[0-9]/.test(profile.new_password) ? 'text-emerald-700 font-bold' : ''}`}>
                              <Check className="w-3 h-3" />
                              <span>Number</span>
                            </span>
                            <span className={`flex items-center space-x-1 ${passwordsMatch ? 'text-emerald-700 font-bold' : ''}`}>
                              <Check className="w-3 h-3" />
                              <span>Matching</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 flex justify-end border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#481268] to-[#5d1785] hover:from-[#3a0c54] hover:to-[#481268] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                          <span>Save Profile & Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
