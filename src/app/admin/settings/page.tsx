'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Settings, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    event_name: 'Unity 101 Community Radio - 20th Anniversary Gala',
    event_date: '2026-11-20',
    event_location: 'Southampton, Hampshire, UK',
    registration_open: 'true',
    allow_food_choice: 'true',
    notification_email: 'events@unity101.org',
    max_capacity: '500',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Settings saved successfully');
      } else {
        showToast('error', data.message || 'Failed to save settings');
      }
    } catch {
      showToast('error', 'Error connecting to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Event & System Settings">
      <div className="max-w-4xl space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-red-900 text-red-100 border-red-700'
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

        <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs">
          <div className="flex items-center space-x-2 text-[#481268] mb-4 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Anniversary Event Configuration</h3>
              <p className="text-xs text-slate-500">Configure parameters stored in MySQL system settings</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#481268] mb-2" />
              <span>Loading configuration...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Event Title / Celebration Name
                  </label>
                  <input
                    type="text"
                    value={settings.event_name}
                    onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={settings.event_date}
                    onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Venue / Postal Area
                  </label>
                  <input
                    type="text"
                    value={settings.event_location}
                    onChange={(e) => setSettings({ ...settings, event_location: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Notification Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration Portal Status
                  </label>
                  <select
                    value={settings.registration_open}
                    onChange={(e) => setSettings({ ...settings, registration_open: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  >
                    <option value="true">Open (Accepting Submissions)</option>
                    <option value="false">Closed (Capacity Reached)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Guest Meal Selection
                  </label>
                  <select
                    value={settings.allow_food_choice}
                    onChange={(e) => setSettings({ ...settings, allow_food_choice: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  >
                    <option value="true">Enabled (Veg & Non Veg)</option>
                    <option value="false">Disabled (Fixed Menu)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Max Capacity
                  </label>
                  <input
                    type="number"
                    value={settings.max_capacity}
                    onChange={(e) => setSettings({ ...settings, max_capacity: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-1.5 bg-[#481268] hover:bg-[#380952] text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-75"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
