'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#240634] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Mandala Pattern - Top Left & Top Right prominently visible */}
      <div className="absolute -left-20 -top-20 sm:-left-24 sm:-top-24 w-80 h-80 sm:w-[440px] sm:h-[440px] pointer-events-none select-none opacity-85">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={440}
          height={440}
          className="w-full h-full drop-shadow-[0_0_25px_rgba(245,196,81,0.35)]"
          priority
        />
      </div>

      <div className="absolute -right-20 -top-20 sm:-right-24 sm:-top-24 w-80 h-80 sm:w-[440px] sm:h-[440px] pointer-events-none select-none opacity-85">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={440}
          height={440}
          className="w-full h-full rotate-90 drop-shadow-[0_0_25px_rgba(245,196,81,0.35)]"
          priority
        />
      </div>

      {/* Subtle bottom corner ambient mandalas */}
      <div className="absolute -left-28 -bottom-28 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none select-none opacity-25">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={320}
          height={320}
          className="w-full h-full -rotate-45"
          priority
        />
      </div>
      <div className="absolute -right-28 -bottom-28 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none select-none opacity-25">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={320}
          height={320}
          className="w-full h-full rotate-45"
          priority
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-200/50 p-6 sm:p-8 z-10">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="w-36 h-auto mx-auto mb-3">
            <Image
              src="/images/unity101-logo.png"
              alt="Unity 101 Community Radio"
              width={200}
              height={220}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
          <span className="inline-block bg-[#481268] text-white text-[11px] font-semibold tracking-wider uppercase py-1 px-4 rounded-full">
            Admin Portal
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2 font-serif-brand">
            Event Management System
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#481268] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#481268] focus:bg-white text-slate-900"
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-[#481268] hover:bg-[#390c53] text-white py-2.5 px-4 rounded-lg font-semibold text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <a
            href="/register"
            className="text-xs text-[#481268] hover:text-amber-600 font-medium transition-colors"
          >
            ← Return to Public Guest Registration
          </a>
        </div>
      </div>
    </div>
  );
}
