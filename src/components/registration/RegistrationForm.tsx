'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface FormState {
  first_name: string;
  last_name: string;
  address: string;
  town: string;
  post_code: string;
  email: string;
  mobile: string;
  food_preference: 'Veg Food' | 'Non Veg Food' | '';
  gdpr_consent: boolean;
}

const initialForm: FormState = {
  first_name: '',
  last_name: '',
  address: '',
  town: '',
  post_code: '',
  email: '',
  mobile: '',
  food_preference: '',
  gdpr_consent: false,
};

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    food_preference: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim() || form.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (!form.last_name.trim() || form.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    if (!form.address.trim() || form.address.trim().length < 3) {
      newErrors.address = 'Street address is required';
    }
    if (!form.town.trim() || form.town.trim().length < 2) {
      newErrors.town = 'Town / City is required';
    }
    if (!form.post_code.trim()) {
      newErrors.post_code = 'Post code is required';
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 8) {
      newErrors.mobile = 'Please enter a valid mobile phone number';
    }
    if (!form.food_preference) {
      newErrors.food_preference = 'Please select your food preference';
    }
    if (!form.gdpr_consent) {
      newErrors.gdpr_consent = 'You must agree to the GDPR consent to register';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleFoodSelect = (choice: 'Veg Food' | 'Non Veg Food') => {
    setForm((prev) => ({ ...prev, food_preference: choice }));
    if (errors.food_preference) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next['food_preference'];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const key in data.errors) {
            fieldErrors[key] = data.errors[key][0];
          }
          setErrors(fieldErrors);
        }
        setServerError(data.message || 'Registration failed. Please check the form.');
        return;
      }

      // Success
      setSubmissionSuccess(data.data);
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setServerError('Unable to connect to the server. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setSubmissionSuccess(null);
    setForm(initialForm);
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Side Decorative Mandala SVGs */}
      <div className="pointer-events-none absolute -left-28 sm:-left-36 top-1/4 w-56 h-56 text-purple-200/40 opacity-70 -z-10 select-none">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={224}
          height={224}
          className="w-full h-full rotate-45"
          priority
        />
      </div>
      <div className="pointer-events-none absolute -right-28 sm:-right-36 bottom-1/4 w-64 h-64 text-amber-200/50 opacity-60 -z-10 select-none">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={256}
          height={256}
          className="w-full h-full -rotate-12"
          priority
        />
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100/60 overflow-hidden transition-all duration-300">
        
        {/* Card Header with Unity 101 Logo & 20th Anniversary */}
        <div className="pt-8 pb-4 px-6 sm:px-10 text-center flex flex-col items-center">
          <div className="w-48 sm:w-56 h-auto relative mb-3">
            <Image
              src="/images/unity101-logo.png"
              alt="Unity 101 Community Radio - 20th Anniversary 2025"
              width={300}
              height={330}
              className="w-full h-auto object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Purple Pill "Register Below" */}
          <div className="mt-1 mb-3">
            <span className="inline-block bg-[#481268] text-white text-xs sm:text-sm font-medium tracking-wide py-1.5 px-7 rounded-full shadow-sm">
              Register Below
            </span>
          </div>

          {/* Cursive "Guest information" Script Heading */}
          <h2 className="font-script text-[#481268] text-3xl sm:text-4xl font-bold tracking-wide mt-1 select-none">
            Guest information
          </h2>
        </div>

        {/* Content Area */}
        <div className="px-6 sm:px-10 pb-10">
          {/* Submission Success State */}
          {submissionSuccess ? (
            <div className="py-6 text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#481268] mb-2 font-serif-brand">
                Registration Confirmed!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Thank you, <span className="font-semibold text-slate-800">{submissionSuccess.first_name} {submissionSuccess.last_name}</span>. 
                Your registration has been saved to our database with reference:
              </p>

              <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
                <div className="flex justify-between items-center text-xs text-purple-900 border-b border-purple-200/60 pb-2 mb-2">
                  <span className="font-medium">Registration Ref</span>
                  <span className="font-mono font-bold text-sm bg-purple-200/70 px-2 py-0.5 rounded text-purple-950">
                    #U101-{submissionSuccess.id.toString().padStart(4, '0')}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <p><span className="text-slate-500">Email:</span> {submissionSuccess.email}</p>
                  <p><span className="text-slate-500">Meal Preference:</span> <span className="font-semibold text-amber-700">{submissionSuccess.food_preference}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Confirmed Received</span></p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-900 mb-6 flex items-start text-left">
                <Sparkles className="w-4 h-4 text-amber-600 mr-2.5 mt-0.5 shrink-0" />
                <p>
                  Once our event committee verifies guest capacities, we will send you a formal invitation card by post to your registered address.
                </p>
              </div>

              <button
                onClick={handleResetForAnother}
                className="inline-flex items-center justify-center space-x-2 bg-[#481268] hover:bg-[#380952] text-white text-xs font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Register Another Guest</span>
              </button>
            </div>
          ) : (
            /* Active Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Server-level error notice */}
              {serverError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* First Name */}
              <div className="space-y-1">
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.first_name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.last_name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.last_name}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.address
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.address}</p>
                )}
              </div>

              {/* Town */}
              <div className="space-y-1">
                <input
                  type="text"
                  name="town"
                  id="town"
                  value={form.town}
                  onChange={handleChange}
                  placeholder="Town"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.town
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.town && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.town}</p>
                )}
              </div>

              {/* Post Code */}
              <div className="space-y-1">
                <input
                  type="text"
                  name="post_code"
                  id="post_code"
                  value={form.post_code}
                  onChange={handleChange}
                  placeholder="Post Code"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b uppercase transition-colors outline-none ${
                    errors.post_code
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.post_code && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.post_code}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.email
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Mobile"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.mobile
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.mobile}</p>
                )}
              </div>

              {/* Choose Food */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm">
                  <span className="font-semibold text-[#481268]">Choose food:</span>
                  
                  {/* Veg Food Choice */}
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.food_preference === 'Veg Food'}
                      onChange={() => handleFoodSelect('Veg Food')}
                      className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400"
                    />
                    <span className="font-medium text-[#d97706] hover:text-[#b45309]">
                      Veg Food
                    </span>
                  </label>

                  {/* Non Veg Food Choice */}
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.food_preference === 'Non Veg Food'}
                      onChange={() => handleFoodSelect('Non Veg Food')}
                      className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400"
                    />
                    <span className="font-medium text-[#d97706] hover:text-[#b45309]">
                      Non Veg Food
                    </span>
                  </label>
                </div>
                {errors.food_preference && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {errors.food_preference}
                  </p>
                )}
              </div>

              {/* Postal Formal Invitation Note */}
              <div className="pt-1">
                <p className="text-[12.5px] leading-relaxed text-slate-600 font-normal">
                  Once you have registered and confirmed you are coming, we will send you a formal invitation by post.
                </p>
              </div>

              {/* GDPR Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="gdpr_consent"
                    id="gdpr_consent"
                    checked={form.gdpr_consent}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded text-[#481268] border-slate-300 focus:ring-purple-700 shrink-0"
                  />
                  <span className="text-[11.5px] sm:text-xs leading-snug text-slate-600 font-normal">
                    I agree to share my personal details with Unity101 and its marketing promotion via SMS, Email and Post under GDPR regulation.
                  </span>
                </label>
                {errors.gdpr_consent && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {errors.gdpr_consent}
                  </p>
                )}
              </div>

              {/* Two-Tone Submit Button as in Screenshot */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-stretch shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none rounded overflow-hidden"
                >
                  {/* Left Yellow/Gold Text Container */}
                  <div className="bg-[#f2b814] hover:bg-[#e0a708] px-5 sm:px-6 py-2.5 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm tracking-normal flex items-center justify-center min-w-[200px] transition-colors">
                    {isSubmitting ? (
                      <div className="inline-flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Submit your registration</span>
                    )}
                  </div>

                  {/* Right Purple Chevron Box */}
                  <div className="bg-[#481268] group-hover:bg-[#380952] px-3 sm:px-3.5 flex items-center justify-center text-white transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

      {/* Footer Branding Credit */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>© 2026 Unity 101 Community Radio. 20 Years of Broadcasting Excellence.</p>
        <div className="mt-2 flex justify-center space-x-4 text-slate-500">
          <a href="/admin/login" className="hover:text-purple-700 transition-colors">
            Admin Portal
          </a>
          <span>•</span>
          <span>Southampton, UK</span>
        </div>
      </div>
    </div>
  );
}
