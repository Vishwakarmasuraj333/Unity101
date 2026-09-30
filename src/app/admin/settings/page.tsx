'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Settings, Save, CheckCircle, AlertCircle, Loader2, Mail, Send, ShieldCheck, Radio, Server } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    event_name: 'Unity 101 Community Radio - 20th Anniversary Gala',
    event_date: '2026-11-20',
    event_location: 'Southampton, Hampshire, UK',
    registration_open: 'true',
    allow_food_choice: 'true',
    notification_email: 'events@unity101.org',
    max_capacity: '500',
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: 'false',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: 'Unity 101 Community Radio <events@unity101.org>',
    email_notifications_enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
            if (data.settings.notification_email) {
              setTestEmailRecipient(data.settings.notification_email);
            }
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
        showToast('success', data.message || 'System settings saved successfully');
      } else {
        showToast('error', data.message || 'Failed to save settings');
      }
    } catch {
      showToast('error', 'Error connecting to server');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showToast('error', 'Please enter a valid recipient email address for testing.');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailRecipient }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Test email dispatched successfully!');
      } else {
        showToast('error', data.message || 'Failed to send test email');
      }
    } catch {
      showToast('error', 'Network error sending test email');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <AdminLayout title="System & Mail Configuration">
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

        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-purple-100/80">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#481268] mb-2" />
            <span className="text-xs">Loading configuration...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs">
              <div className="flex items-center space-x-2 text-[#481268] mb-4 pb-3 border-b border-slate-100">
                <Radio className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Anniversary Event Configuration</h3>
                  <p className="text-xs text-slate-500">Configure public registration parameters and gala limits</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
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
                      Admin Alert Notification Email
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
                      <option value="true">Enabled (Veg & Non Veg Choice)</option>
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
              </div>
            </div>

            {/* Email & SMTP Settings Card */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-6 shadow-xs">
              <div className="flex items-center space-x-2 text-[#481268] mb-4 pb-3 border-b border-slate-100">
                <Mail className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Email Delivery & SMTP Service</h3>
                  <p className="text-xs text-slate-500">Configure real-time guest confirmations and admin registration alerts</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Notification Delivery
                    </label>
                    <select
                      value={settings.email_notifications_enabled}
                      onChange={(e) => setSettings({ ...settings, email_notifications_enabled: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    >
                      <option value="true">Enabled (Send Guest & Admin Emails)</option>
                      <option value="false">Disabled (Silent Mode / Log Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      From Sender (Name & Email)
                    </label>
                    <input
                      type="text"
                      placeholder="Unity 101 Community Radio <events@unity101.org>"
                      value={settings.smtp_from}
                      onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Host Server
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com or smtp.sendgrid.net"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      placeholder="587 or 465"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SSL / TLS Security
                    </label>
                    <select
                      value={settings.smtp_secure}
                      onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    >
                      <option value="false">STARTTLS (Port 587)</option>
                      <option value="true">Direct SSL (Port 465)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Username / Email
                    </label>
                    <input
                      type="text"
                      placeholder="your-smtp-username"
                      value={settings.smtp_user}
                      onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Password / App Key
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={settings.smtp_pass}
                      onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#481268]"
                    />
                  </div>
                </div>

                {/* Test Email Dispatcher */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block text-xs">Verify SMTP Connectivity</span>
                    <span className="text-[11px] text-slate-500">Send an immediate test message to confirm server configuration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#481268] w-48"
                    />
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {testingEmail ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Test Email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 bg-[#481268] hover:bg-[#380952] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-amber-400" />
                )}
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
