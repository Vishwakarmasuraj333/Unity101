'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Salad,
  Drumstick,
  Calendar,
  Download,
  Plus,
  ArrowRight,
  RefreshCw,
  Eye,
  History,
  Sparkles,
} from 'lucide-react';
import {
  DashboardMetrics,
  Registration,
  ActivityLog,
  DailyActivityItem,
  TownDistributionItem,
  CapacityMetrics,
} from '@/types';
import FoodPieChart from '@/components/admin/charts/FoodPieChart';
import ActivityBarChart from '@/components/admin/charts/ActivityBarChart';
import TownsDiagram from '@/components/admin/charts/TownsDiagram';
import CapacityGauge from '@/components/admin/charts/CapacityGauge';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityItem[]>([]);
  const [townDistribution, setTownDistribution] = useState<TownDistributionItem[]>([]);
  const [capacity, setCapacity] = useState<CapacityMetrics>({
    target: 500,
    registered: 0,
    percentFilled: 0,
    remaining: 500,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setDailyActivity(data.dailyActivity || []);
        setTownDistribution(data.townDistribution || []);
        if (data.capacity) setCapacity(data.capacity);
        setRecentRegistrations(data.recentRegistrations || []);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleExportAll = () => {
    window.location.href = '/api/admin/export';
  };

  return (
    <AdminLayout title="Event Operations Dashboard">
      <div className="space-y-6">
        {/* Welcome Royal Banner */}
        <div className="bg-gradient-to-r from-[#2f0846] via-[#481268] to-[#5d1785] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-purple-800/40">
          <div className="z-10">
            <div className="flex items-center space-x-2">
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Unity 101 Community Radio</span>
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                20th Anniversary Gala
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand mt-1 text-white">
              Event Management & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
              Live guest registration control, catering allocation breakdown, and verified MySQL records.
            </p>
          </div>

          <div className="z-10 flex items-center space-x-2 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl backdrop-blur transition-all active:scale-95 disabled:opacity-50 border border-white/15 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>

            <button
              onClick={handleExportAll}
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Decorative ambient radial light */}
          <div className="absolute -right-8 -bottom-12 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -top-12 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Milestone Capacity Gauge */}
        <CapacityGauge capacity={capacity} loading={loading} />

        {/* Metric Cards Grid with Hover Micro-Interactions */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Total Registrations */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Total</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 group-hover:bg-[#481268] group-hover:text-white text-[#481268] flex items-center justify-center transition-colors">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 font-serif-brand">
                {metrics?.totalRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Active database guests</p>
            </div>

            {/* New / Pending */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">New</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 font-serif-brand">
                {metrics?.newRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Pending review</p>
            </div>

            {/* Confirmed */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Confirmed</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 flex items-center justify-center transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 font-serif-brand">
                {metrics?.confirmedRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Invite approved</p>
            </div>

            {/* Cancelled */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-red-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700">Cancelled</span>
                <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-600 group-hover:text-white text-red-600 flex items-center justify-center transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 font-serif-brand">
                {metrics?.cancelledRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Declined or withdrawn</p>
            </div>

            {/* Veg Food */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Veg Meal</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-600 flex items-center justify-center transition-colors">
                  <Salad className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-600 font-serif-brand">
                {metrics?.vegFoodCount ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Vegetarian catering</p>
            </div>

            {/* Non Veg Food */}
            <div className="bg-white rounded-xl p-4 border border-purple-100/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-orange-300 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">Non Veg</span>
                <div className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-600 group-hover:text-white text-orange-600 flex items-center justify-center transition-colors">
                  <Drumstick className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600 font-serif-brand">
                {metrics?.nonVegFoodCount ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Non-veg catering</p>
            </div>
          </div>
        )}

        {/* Real Interactive Diagrams & Charts Section (3 Columns on Large Screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chart 1: Real Interactive Meal Pie/Donut Chart */}
          <FoodPieChart
            vegCount={metrics?.vegFoodCount ?? 0}
            nonVegCount={metrics?.nonVegFoodCount ?? 0}
            loading={loading}
          />

          {/* Chart 2: Real Activity Velocity Bar Diagram */}
          <ActivityBarChart data={dailyActivity} loading={loading} />

          {/* Chart 3: Geographic Reach Distribution Diagram */}
          <TownsDiagram
            towns={townDistribution}
            totalRegistrations={metrics?.totalRegistrations ?? 0}
            loading={loading}
          />
        </div>

        {/* Main 2-Column Content: Recent Registrations & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Registrations Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#481268]" />
                <h3 className="font-bold text-slate-900 text-sm">Latest Guest Registrations</h3>
              </div>
              <Link
                href="/admin/registrations"
                className="text-xs font-semibold text-[#481268] hover:text-amber-600 flex items-center space-x-1 group"
              >
                <span>View all ({metrics?.totalRegistrations ?? 0})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No registrations found yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 font-semibold">Ref</th>
                      <th className="pb-2.5 font-semibold">Guest</th>
                      <th className="pb-2.5 font-semibold">Town</th>
                      <th className="pb-2.5 font-semibold">Food</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-3 font-mono font-semibold text-purple-900">
                          #{reg.id}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-slate-900">{reg.first_name} {reg.last_name}</p>
                          <p className="text-[11px] text-slate-400">{reg.email}</p>
                        </td>
                        <td className="py-3 text-slate-600">
                          {reg.town} <span className="text-[10px] text-slate-400 uppercase font-mono">({reg.post_code})</span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            reg.food_preference === 'Veg Food'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {reg.food_preference}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : reg.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/registrations`}
                            className="inline-flex items-center text-slate-400 hover:text-[#481268] hover:bg-purple-50 p-1.5 rounded-lg transition-colors"
                            title="Open Registration in Management"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Activity (1 Col) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Event Operations</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/registrations"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100 text-purple-950 font-semibold text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-purple-800" />
                    <span>Manage All Registrations</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-amber-700" />
                    <span>Download Full CSV Export</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <Link
                  href="/admin/trash"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-slate-600" />
                    <span>Trash & Recovery ({metrics?.trashCount ?? 0})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Audit Logs Card */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                <History className="w-4 h-4 text-[#481268]" />
                <h3 className="font-bold text-slate-900 text-sm">System Audit Activity</h3>
              </div>

              {recentLogs.length === 0 ? (
                <p className="text-slate-400 text-xs py-6 text-center">No logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="text-xs border-l-2 border-[#481268] pl-2.5 py-0.5">
                      <p className="text-slate-800 font-medium leading-snug">{log.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.created_at).toLocaleString()} • <span className="font-semibold text-purple-900">{log.action}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
