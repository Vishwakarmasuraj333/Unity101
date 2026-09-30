'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Utensils,
  ShieldCheck,
  Calendar,
  Clock,
  Edit2,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import { Registration, RegistrationStatus, FoodPreference } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminEditRegistrationSchema, AdminEditRegistrationFormData } from '@/lib/validation';

type EditFormData = AdminEditRegistrationFormData;
const EditFormSchema = AdminEditRegistrationSchema;

export default function RegistrationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResendEmail = async () => {
    if (!registration) return;
    setResendingEmail(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/email`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Confirmation email dispatched successfully.');
      } else {
        showToast('error', data.message || 'Failed to dispatch email');
      }
    } catch {
      showToast('error', 'Network error sending email');
    } finally {
      setResendingEmail(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(EditFormSchema),
  });

  const fetchRegistration = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRegistration(data.data);
        reset({
          first_name: data.data.first_name,
          last_name: data.data.last_name,
          address: data.data.address,
          town: data.data.town,
          post_code: data.data.post_code,
          email: data.data.email,
          mobile: data.data.mobile,
          food_preference: data.data.food_preference,
          status: data.data.status,
          notes: data.data.notes || '',
        });
      } else {
        showToast('error', 'Registration not found');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve registration details');
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  const onEditSubmit = async (formData: EditFormData) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Registration updated successfully.');
        setIsEditing(false);
        fetchRegistration();
      } else {
        showToast('error', data.message || 'Failed to update registration');
      }
    } catch {
      showToast('error', 'Network error while updating registration');
    }
  };

  const handleQuickStatus = async (newStatus: RegistrationStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchRegistration();
      } else {
        showToast('error', data.message || 'Failed to update status');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Registration moved to trash.');
        setTimeout(() => {
          router.push('/admin/registrations');
        }, 1000);
      } else {
        showToast('error', 'Failed to delete registration');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setActionLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <AdminLayout title={`Registration Details #${id}`}>
      <div className="max-w-4xl space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-600 shadow-emerald-950/40'
                : 'bg-red-950 text-red-100 border-red-600 shadow-red-950/40'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/registrations"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-[#111625] hover:bg-slate-100 dark:hover:bg-[#161e31] px-3.5 py-2 rounded-xl transition-all w-fit border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registrations</span>
          </Link>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail || actionLoading}
                  className="inline-flex items-center space-x-1.5 bg-white dark:bg-[#111625] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Resend official registration confirmation email"
                >
                  {resendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                  <span>Resend Email</span>
                </button>

                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center space-x-1.5 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Edit</span>
                </button>

                {registration?.status !== 'confirmed' && (
                  <button
                    onClick={() => handleQuickStatus('confirmed')}
                    disabled={actionLoading}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {registration?.status !== 'cancelled' && (
                  <button
                    onClick={() => handleQuickStatus('cancelled')}
                    disabled={actionLoading}
                    className="inline-flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center space-x-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold py-2 px-3.5 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-purple-100/80 p-16 text-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#481268] mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading guest registration record...</p>
          </div>
        ) : !registration ? (
          <div className="bg-white rounded-2xl border border-purple-100/80 p-12 text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Registration Not Found</h3>
            <p className="text-xs text-slate-500 mb-4">The requested registration record does not exist or may have been permanently deleted.</p>
            <Link
              href="/admin/registrations"
              className="inline-flex items-center space-x-2 bg-[#481268] text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Return to Directory
            </Link>
          </div>
        ) : isEditing ? (
          /* Edit Form Mode */
          <div className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif-brand">Edit Guest Registration</h2>
                <p className="text-xs text-slate-500">Update registration details stored in MySQL</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    {...register('first_name')}
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                  />
                  {errors.first_name && <p className="text-red-600 text-[11px] mt-1">{errors.first_name.message}</p>}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    {...register('last_name')}
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                  />
                  {errors.last_name && <p className="text-red-600 text-[11px] mt-1">{errors.last_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Street Address *</label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                />
                {errors.address && <p className="text-red-600 text-[11px] mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Town / City *</label>
                  <input
                    {...register('town')}
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                  />
                  {errors.town && <p className="text-red-600 text-[11px] mt-1">{errors.town.message}</p>}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Post Code *</label>
                  <input
                    {...register('post_code')}
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 uppercase focus:outline-none focus:border-[#481268]"
                  />
                  {errors.post_code && <p className="text-red-600 text-[11px] mt-1">{errors.post_code.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                  />
                  {errors.email && <p className="text-red-600 text-[11px] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    {...register('mobile')}
                    type="tel"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                  />
                  {errors.mobile && <p className="text-red-600 text-[11px] mt-1">{errors.mobile.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Food Preference *</label>
                  <select
                    {...register('food_preference')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268] bg-white"
                  >
                    <option value="Veg Food">Veg Food</option>
                    <option value="Non Veg Food">Non Veg Food</option>
                  </select>
                  {errors.food_preference && <p className="text-red-600 text-[11px] mt-1">{errors.food_preference.message}</p>}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Registration Status *</label>
                  <select
                    {...register('status')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268] bg-white"
                  >
                    <option value="new">New (Pending Review)</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {errors.status && <p className="text-red-600 text-[11px] mt-1">{errors.status.message}</p>}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Admin Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Optional internal administrative notes..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#481268]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 bg-[#481268] hover:bg-[#380952] text-white px-5 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Header Banner Card */}
            <div className="bg-gradient-to-r from-[#2f0846] via-[#481268] to-[#5d1785] text-white rounded-2xl p-6 shadow-lg border border-purple-800/40 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Unity 101 Registered Guest</span>
                  </span>
                  <span className="text-[11px] font-mono bg-purple-900/80 px-2 py-0.5 rounded text-purple-200 border border-purple-700">
                    ID #{registration.id.toString().padStart(4, '0')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand">
                  {registration.first_name} {registration.last_name}
                </h1>
                <p className="text-xs text-purple-200 mt-1">
                  {registration.town} • {registration.food_preference}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
                    registration.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      : registration.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-200 border-red-400/40'
                      : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                  }`}
                >
                  {registration.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />}
                  {registration.status === 'cancelled' && <XCircle className="w-3.5 h-3.5 text-red-300" />}
                  {registration.status === 'new' && <Clock className="w-3.5 h-3.5 text-amber-300" />}
                  <span className="capitalize">{registration.status}</span>
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guest & Contact Information */}
              <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-[#481268] border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Guest & Contact Information</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {registration.first_name} {registration.last_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <a
                      href={`mailto:${registration.email}`}
                      className="font-medium text-purple-700 hover:underline flex items-center space-x-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{registration.email}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
                    <a
                      href={`tel:${registration.mobile}`}
                      className="font-medium text-purple-700 hover:underline flex items-center space-x-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{registration.mobile}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Postal Address */}
              <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-[#481268] border-b border-slate-100 pb-3">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Postal Address</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Street Address</span>
                    <span className="font-medium text-slate-900">{registration.address}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Town / City</span>
                      <span className="font-semibold text-slate-900">{registration.town}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Post Code</span>
                      <span className="font-mono font-bold text-purple-950 uppercase">{registration.post_code}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-1">
                    Formal anniversary invitation card will be addressed to this location.
                  </p>
                </div>
              </div>

              {/* Event Preferences & GDPR */}
              <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-[#481268] border-b border-slate-100 pb-3">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Event Preferences</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Meal Selection</span>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        registration.food_preference === 'Veg Food'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}
                    >
                      {registration.food_preference}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">GDPR Consent</span>
                    <div className="flex items-center space-x-1.5 mt-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Agreed to Unity 101 communications under GDPR regulations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record Timestamps & Audit */}
              <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-[#481268] border-b border-slate-100 pb-3">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Audit Timestamps</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registration Submitted</span>
                    <span className="font-medium text-slate-800">
                      {new Date(registration.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Updated</span>
                    <span className="font-medium text-slate-800">
                      {new Date(registration.updated_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {registration.notes && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Administrative Notes</span>
                      <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 mt-1">{registration.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Guest Registration</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete the registration for <strong className="text-slate-900 dark:text-white">{registration?.first_name} {registration?.last_name}</strong>?
                The entry will be safely moved to <span className="text-purple-700 dark:text-purple-300 font-semibold">Trash & Archival</span> where it can be recovered anytime.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
