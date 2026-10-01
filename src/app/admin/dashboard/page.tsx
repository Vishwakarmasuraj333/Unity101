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
    const a = document.createElement('a');
    a.href = '/api/admin/export';
    a.setAttribute('download', '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                21st Anniversary Awards • Novotel Southampton (15 Jan 2027)
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
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Total</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 group-hover:bg-[#481268] group-hover:text-white text-[#481268] dark:text-purple-300 flex items-center justify-center transition-colors">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif-brand">
                {metrics?.totalRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Active database guests</p>
            </div>

            {/* New / Pending */}
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">New</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 group-hover:bg-[#481268] group-hover:text-white text-purple-700 dark:text-purple-300 flex items-center justify-center transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif-brand">
                {metrics?.newRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Pending review</p>
            </div>

            {/* Confirmed */}
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Confirmed</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 group-hover:bg-[#481268] group-hover:text-white text-[#481268] dark:text-purple-300 flex items-center justify-center transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif-brand">
                {metrics?.confirmedRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Invite approved</p>
            </div>

            {/* Cancelled */}
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cancelled</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-700 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-serif-brand">
                {metrics?.cancelledRegistrations ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Declined or withdrawn</p>
            </div>

            {/* Veg Food */}
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">Veg Meal</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 group-hover:bg-[#481268] group-hover:text-white text-[#481268] dark:text-purple-300 flex items-center justify-center transition-colors">
                  <Salad className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif-brand">
                {metrics?.vegFoodCount ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Vegetarian catering</p>
            </div>

            {/* Non Veg Food */}
            <div className="bg-white dark:bg-[#111625] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Non Veg</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#481268] group-hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors">
                  <Drumstick className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif-brand">
                {metrics?.nonVegFoodCount ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Non-veg catering</p>
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
          <div className="lg:col-span-2 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#481268] dark:text-purple-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Latest Guest Registrations</h3>
              </div>
              <Link
                href="/admin/registrations"
                className="text-xs font-semibold text-[#481268] dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-200 flex items-center space-x-1 group"
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
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 font-semibold">Name</th>
                      <th className="pb-2.5 font-semibold">Email</th>
                      <th className="pb-2.5 font-semibold">Mobile</th>
                      <th className="pb-2.5 font-semibold">Food</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold">Registered</th>
                      <th className="pb-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-3">
                          <p className="font-semibold text-slate-900 dark:text-white">{reg.first_name} {reg.last_name}</p>
                          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-mono font-bold">#{reg.id}</span>
                        </td>
                        <td className="py-3 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                          {reg.email}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {reg.mobile}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            reg.food_preference === 'Veg Food'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/80'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {reg.food_preference}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            reg.status === 'confirmed'
                              ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                              : reg.status === 'cancelled'
                              ? 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              : 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/registrations/${reg.id}`}
                            className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-2 py-1 rounded-lg transition-colors font-semibold text-[11px]"
                            title="View Registration Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
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
            <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Event Operations</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/registrations"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-950 dark:text-purple-200 font-semibold text-xs transition-colors group border border-purple-200/50 dark:border-purple-800/60"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-purple-800 dark:text-purple-300" />
                    <span>Manage All Registrations</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#161e31] dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold text-xs transition-colors group cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    <span>Download Full CSV Export</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <Link
                  href="/admin/trash"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#161e31] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors group border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Trash & Recovery ({metrics?.trashCount ?? 0})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Audit Logs Card */}
            <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                <History className="w-4 h-4 text-[#481268] dark:text-purple-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Audit Activity</h3>
              </div>

              {recentLogs.length === 0 ? (
                <p className="text-slate-400 text-xs py-6 text-center">No logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="text-xs border-l-2 border-[#481268] dark:border-purple-500 pl-2.5 py-0.5">
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{log.description}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(log.created_at).toLocaleString()} • <span className="font-semibold text-purple-900 dark:text-purple-300">{log.action}</span>
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
