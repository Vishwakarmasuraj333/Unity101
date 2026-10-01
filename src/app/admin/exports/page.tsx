'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Filter,
  Users,
  Salad,
  Drumstick,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function AdminExportsPage() {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'xml'>('pdf');
  const [statusFilter, setStatusFilter] = useState('all');
  const [foodFilter, setFoodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Live matching count
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchCount() {
      setLoadingCount(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '1',
          search,
          status: statusFilter,
          food: foodFilter,
          dateRange,
        });
        const res = await fetch(`/api/admin/registrations?${params.toString()}`);
        if (res.ok && active) {
          const json = await res.json();
          setMatchCount(json.pagination?.total ?? 0);
        }
      } catch {
        // Fallback
      } finally {
        if (active) setLoadingCount(false);
      }
    }
    const timer = setTimeout(fetchCount, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [statusFilter, foodFilter, dateRange, search]);

  const handleDownload = (selectedFmt = format) => {
    setIsExporting(true);
    const params = new URLSearchParams();
    params.set('format', selectedFmt);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (foodFilter !== 'all') params.set('food', foodFilter);
    if (dateRange !== 'all') params.set('dateRange', dateRange);
    if (search.trim()) params.set('search', search.trim());

    const downloadUrl = `/api/admin/export?${params.toString()}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `unity101-manifest.${selectedFmt === 'excel' ? 'xlsx' : selectedFmt}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(`Successfully downloaded ${selectedFmt.toUpperCase()} file!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 1200);
  };

  const exportFormats = [
    {
      id: 'pdf',
      name: 'Official PDF Manifest',
      extension: '.PDF',
      icon: FileText,
      iconColor: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      description: 'Print-ready landscape A4 table with royal purple headers, gold borders, guest contacts, meal indicators, and page numbering.',
      bestFor: 'Security check-in desk, printout binders & on-site door verification.',
    },
    {
      id: 'excel',
      name: 'Executive Excel Workbook',
      extension: '.XLSX',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      description: 'Formatted multi-sheet workbook with autofilters, alternating row fills, and an automated Catering & Attendance Summary sheet.',
      bestFor: 'Catering kitchen team, seating plans & executive spreadsheet analysis.',
    },
    {
      id: 'csv',
      name: 'Universal CSV Dataset',
      extension: '.CSV',
      icon: FileDown,
      iconColor: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      description: 'Clean UTF-8 encoded text with standard BOM, RFC-4180 field quoting, and complete guest record attributes.',
      bestFor: 'Mailchimp import, CRM migration & database backup.',
    },
    {
      id: 'xml',
      name: 'Structured XML Manifest',
      extension: '.XML',
      icon: FileText,
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      description: 'RFC-valid XML 1.0 schema with <Summary> aggregate totals and standardized nested <Guest> entities.',
      bestFor: 'Enterprise system integration, automated broadcast feeds & archival.',
    },
  ];

  return (
    <AdminLayout title="Exports & Manifests">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#2f0846] via-[#481268] to-[#1c082b] rounded-3xl p-6 sm:p-8 text-white border border-purple-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-radial from-amber-400/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 border border-amber-400/40 rounded-full px-3 py-1 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                  Live Production Manifest Generator
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif-brand font-black text-white">
                Official Guest Manifest & Report Center
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
                Export real-time guest registrations directly from the MySQL database into industry-standard PDF, Excel (.xlsx), CSV, and XML formats with catering metrics and verified GDPR compliance.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px] shrink-0">
              <p className="text-[11px] uppercase tracking-wider text-purple-200 font-bold">Matching Records</p>
              <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-0.5">
                {loadingCount ? '...' : matchCount ?? 0}
              </p>
              <p className="text-[10px] text-purple-300 mt-0.5">Ready for instant download</p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Filter Configuration Card */}
        <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#481268] dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Target Dataset
              </h3>
            </div>
            {(statusFilter !== 'all' || foodFilter !== 'all' || dateRange !== 'all' || search) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setFoodFilter('all');
                  setDateRange('all');
                  setSearch('');
                }}
                className="text-xs text-purple-700 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Registration Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#161e31] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="all">All Registrations</option>
                <option value="confirmed">Confirmed Attendees Only</option>
                <option value="new">Pending / New Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            {/* Food Choice */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Catering Choice</label>
              <select
                value={foodFilter}
                onChange={(e) => setFoodFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#161e31] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="all">All Food Choices</option>
                <option value="Veg Food">Vegetarian Meal Preference</option>
                <option value="Non Veg Food">Non-Vegetarian Meal Preference</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Registration Date</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#161e31] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="all">All Time History</option>
                <option value="today">Registered Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Filter by Keyword</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Town, name, or postcode..."
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-[#161e31] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Real Export Format Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportFormats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = format === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setFormat(fmt.id as any)}
                className={`bg-white dark:bg-[#111625] rounded-2xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 dark:border-amber-400 ring-2 ring-purple-600/30 dark:ring-amber-400/30 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${fmt.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{fmt.name}</span>
                        </h4>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${fmt.badgeBg}`}>
                          {fmt.extension}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-purple-600 dark:border-amber-400 bg-purple-600 dark:bg-amber-400 text-white dark:text-slate-900'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                    {fmt.description}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#161e31] p-2 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
                    <strong className="text-slate-700 dark:text-slate-200">Recommended for:</strong> {fmt.bestFor}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(fmt.id as any);
                  }}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#481268] to-[#2f0846] hover:from-[#5a1682] hover:to-[#3b0a57] text-white text-xs font-bold shadow-md border border-purple-400/40 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download {fmt.extension} File</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
